#!/usr/bin/env python3
"""
CSDN 文章批量检查与迁移脚本
=============================
用法：
    python3 scripts/check_csdn_posts.py <CSDN_MD_DIR> [--fix] [--copy-to src/content/posts]

功能：
    - 自动识别无 Frontmatter 文件，强制注入完整 Frontmatter
    - 智能提取：标题从文件名、标签从文件名关键词匹配、日期统一设置
    - 检测外部图床链接（CSDN、aliyun、cnblogs 等）
    - 当 --copy-to 时，将处理后的文件复制到目标目录

示例：
    python3 scripts/check_csdn_posts.py ~/Desktop/md --fix --copy-to src/content/posts
"""

import os
import re
import sys
import shutil
from datetime import date
from pathlib import Path
from typing import Optional, Tuple, List

# ── 配置 ──────────────────────────────────────────
REQUIRED_FIELDS = ["title", "publishedDate", "tags", "description", "category"]
OPTIONAL_FIELDS = ["cover", "coverAlt", "featured", "draft", "updatedDate", "ogImage"]

# 强制注入时使用的默认日期
FORCE_DATE = date(2026, 7, 29)
DEFAULT_CATEGORY = "iOS 底层"

# 外部图床检测模式
EXTERNAL_IMAGE_PATTERNS = [
    (r"https?://img-blog\.csdnimg\.cn", "CSDN 图床 (img-blog.csdnimg.cn)"),
    (r"https?://img\.csdn\.net", "CSDN 图床 (img.csdn.net)"),
    (r"https?://img-blog\.csdn\.net", "CSDN 图床 (img-blog.csdn.net)"),
    (r"https?://img\.cnblogs\.com", "博客园图床"),
    (r"https?://img\.aliyun\.com", "阿里云 OSS"),
    (r"https?://[\w-]+\.oss-[\w-]+\.aliyuncs\.com", "阿里云 OSS"),
    (r"https?://[\w-]+\.cos\.\w+\.myqcloud\.com", "腾讯云 COS"),
    (r"https?://[\w-]+\.s3\.\w+\.amazonaws\.com", "AWS S3"),
    (r"https?://[\w-]+\.storage\.\w+\.com", "其他外部对象存储"),
]

# ── 智能标签匹配规则 ──────────────────────────────
# 键：匹配关键词（文件名包含即命中，不区分大小写）
# 值：对应的标签列表
TAG_RULES = [
    (["oc", "objective-c", "objectivec", "runtime", "消息发送", "类", "元类",
      "nsstring", "ns", "foundation", "类簇", "深拷贝", "浅拷贝", "内存管理",
      "手动内存", "面向对象", "category", "kvc", "kvo", "block", "property",
      "属性", "协议", "delegate"], ["Objective-C"]),
    (["runtime", "消息发送", "消息转发", "方法交换", "swizzling",
      "isa", "元类"], ["Runtime"]),
    (["内存管理", "arc", "mrc", "retain", "release", "autorelease",
      "引用计数", "循环引用", "weak", "strong"], ["内存管理"]),
    (["多线程", "gcd", "nsoperation", "thread", "线程", "队列",
      "同步", "异步"], ["多线程", "GCD"]),
    (["性能优化", "卡顿", "优化", "内存泄漏", "instrument", "tableview",
      "uitableview"], ["性能优化"]),
    (["runloop", "run-loop"], ["RunLoop"]),
    (["swift", "swiftui", "combine", "async"], ["Swift"]),
    (["ui", "uiview", "uiviewcontroller", "viewcontroller", "uikit",
      "界面", "视图", "storyboard", "xib", "autolayout", "masonry",
      "frame", "bounds"], ["iOS", "UI"]),
    (["网络", "nsurlsession", "alamofire", "afnetworking", "http",
      "https", "rest", "api", "json", "谓词", "正则"], ["iOS", "网络"]),
    (["架构", "mvvm", "mvp", "mvc", "viper", "设计模式", "组件化",
      "模块化"], ["架构设计"]),
    (["编译", "链接", "mach-o", "dyld", "ld", "符号表", "bitcode"], ["编译原理"]),
]


def infer_tags(filename: str) -> List[str]:
    """根据文件名自动推断标签列表"""
    name_lower = filename.lower().replace("-", " ").replace("_", " ").replace("【", " ").replace("】", " ").replace(".md", "")
    matched_tags = []
    seen = set()

    for keywords, tags in TAG_RULES:
        for kw in keywords:
            if kw.lower() in name_lower:
                for tag in tags:
                    if tag not in seen:
                        matched_tags.append(tag)
                        seen.add(tag)
                break

    # 最低保证：如果没有任何匹配，给一个默认标签
    if not matched_tags:
        matched_tags.append("iOS")

    return matched_tags


def extract_title_from_filename(filename: str) -> str:
    """
    从文件名提取标题。
    例如: 【OC】NSString类簇.md → NSString类簇
          【iOS】多线程与GCD.md → 多线程与GCD
          【OC】的消息发送机制.md → 消息发送机制
    """
    stem = filename.replace(".md", "")
    # 去掉 【xxx】 前缀
    stem = re.sub(r"^[【\[][^】\]\n]+[】\]]\s*", "", stem)
    # 去掉开头的"的"字（如"的消息发送机制"→"消息发送机制"）
    stem = re.sub(r"^的", "", stem)
    return stem.strip()


def parse_frontmatter(content: str) -> Tuple[Optional[dict], str, int]:
    """解析 YAML Frontmatter，返回 (fields, body, line_count)"""
    stripped = content.lstrip("\n")
    if not stripped.startswith("---"):
        return None, content, 0

    # 找到第二个 ---
    end_idx = stripped.find("---", 3)
    if end_idx == -1:
        return None, content, 0

    frontmatter_text = stripped[3:end_idx].strip()
    body = stripped[end_idx + 3:].strip()
    frontmatter_lines = frontmatter_text.split("\n")

    fields = {}
    current_key = None
    current_value = ""

    for line in frontmatter_lines:
        if line.strip().startswith("- ") and current_key:
            item = line.strip()[2:].strip()
            if isinstance(current_value, list):
                current_value.append(item)
            else:
                current_value = [item]
            continue

        match = re.match(r"^(\w+):\s*(.*)", line)
        if match:
            if current_key:
                fields[current_key] = current_value
            current_key = match.group(1)
            raw_value = match.group(2).strip()
            if not raw_value or raw_value == "":
                current_value = ""
            elif raw_value.startswith('"') and raw_value.endswith('"'):
                current_value = raw_value[1:-1]
            elif raw_value.startswith("'") and raw_value.endswith("'"):
                current_value = raw_value[1:-1]
            elif raw_value == "[":
                current_value = []
            elif raw_value.startswith("[") and raw_value.endswith("]"):
                inner = raw_value[1:-1].strip()
                current_value = [x.strip().strip('"').strip("'") for x in inner.split(",") if x.strip()]
            else:
                current_value = raw_value
        else:
            if current_key and isinstance(current_value, str):
                current_value += " " + line.strip()

    if current_key:
        fields[current_key] = current_value

    return fields, body, len(frontmatter_lines)


def build_frontmatter(fields: dict) -> str:
    """根据字段重建 Frontmatter 字符串"""
    lines = ["---"]
    for key in REQUIRED_FIELDS:
        if key in fields:
            val = fields[key]
            if isinstance(val, list):
                quoted = [f'"{v}"' for v in val]
                lines.append(f"{key}: [{', '.join(quoted)}]")
            elif isinstance(val, date):
                lines.append(f"{key}: {val.isoformat()}")
            else:
                lines.append(f'{key}: "{val}"')
    for key in OPTIONAL_FIELDS:
        if key in fields and fields[key]:
            val = fields[key]
            if isinstance(val, list):
                quoted = [f'"{v}"' for v in val]
                lines.append(f"{key}: [{', '.join(quoted)}]")
            elif isinstance(val, date):
                lines.append(f"{key}: {val.isoformat()}")
            else:
                lines.append(f'{key}: "{val}"')
    lines.append("---")
    return "\n".join(lines)


def force_inject_frontmatter(content: str, file_path: Path) -> Tuple[dict, str]:
    """
    为完全没有 Frontmatter 的内容强制注入 Frontmatter。
    不修改原文件，返回 (fields, full_content)
    """
    filename = file_path.name
    title = extract_title_from_filename(filename)
    tags = infer_tags(filename)

    fields = {
        "title": title,
        "publishedDate": FORCE_DATE,
        "tags": tags,
        "description": f"iOS 开发技术笔记 - {title}",
        "category": DEFAULT_CATEGORY,
    }

    new_frontmatter = build_frontmatter(fields)
    full_content = new_frontmatter + "\n\n" + content.strip()

    return fields, full_content


def check_images(content: str) -> List[Tuple[str, str]]:
    """检查 Markdown 正文中的外部图片链接"""
    findings = []
    for match in re.finditer(r"!\[.*?\]\((.*?)\)", content):
        url = match.group(1)
        for pattern, name in EXTERNAL_IMAGE_PATTERNS:
            if re.search(pattern, url):
                findings.append((url, name))
                break
    for match in re.finditer(r'<img[^>]+src="([^"]+)"', content):
        url = match.group(1)
        for pattern, name in EXTERNAL_IMAGE_PATTERNS:
            if re.search(pattern, url):
                findings.append((url, name))
                break
    return findings


def check_and_fix(file_path: Path, fix: bool) -> dict:
    """检查（并修复）单个 MD 文件，返回结果字典。
    不修改源文件，fix 后的内容存在 result['fixed_content'] 中。
    """
    result = {
        "file": str(file_path),
        "status": "ok",
        "missing_fields": [],
        "fixed_fields": [],
        "external_images": [],
        "errors": [],
        "fixed_content": None,
    }

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        result["status"] = "error"
        result["errors"].append(f"读取失败: {e}")
        return result

    # 检查外部图床
    images = check_images(content)
    if images:
        result["external_images"] = images

    # 解析 Frontmatter
    fields, body, _ = parse_frontmatter(content)

    # ── 情况 1: 完全没有 Frontmatter → 强制注入 ──
    if fields is None:
        if fix:
            result["status"] = "fixed"
            result["fixed_fields"].append("强制注入完整 Frontmatter（无原始 Frontmatter）")
            new_fields, new_content = force_inject_frontmatter(content, file_path)
            result["fixed_fields"].append(f"title → {new_fields['title']}")
            result["fixed_fields"].append(f"tags → {new_fields['tags']}")
            result["fixed_fields"].append(f"publishedDate → {new_fields['publishedDate']}")
            result["fixed_fields"].append(f"category → {new_fields['category']}")
            result["fixed_content"] = new_content
        else:
            result["status"] = "error"
            result["errors"].append("未找到 Frontmatter，请使用 --fix 强制注入")
        return result

    # ── 情况 2: 有 Frontmatter 但缺少字段 ──
    missing = []
    for field in REQUIRED_FIELDS:
        if field not in fields or fields[field] is None or fields[field] == "":
            missing.append(field)

    if missing:
        result["status"] = "missing_fields"
        result["missing_fields"] = missing

        if fix:
            changed = False
            for field in missing:
                if field == "category":
                    fields["category"] = DEFAULT_CATEGORY
                    result["fixed_fields"].append(f"category → {DEFAULT_CATEGORY}")
                    changed = True
                elif field == "description":
                    title = fields.get("title", file_path.stem)
                    fields["description"] = f"iOS 开发技术笔记 - {title}"
                    result["fixed_fields"].append(f"description → iOS 开发技术笔记 - {title}")
                    changed = True
                elif field == "tags":
                    inferred = infer_tags(file_path.name)
                    fields["tags"] = inferred
                    result["fixed_fields"].append(f"tags → {inferred}")
                    changed = True
                elif field == "publishedDate":
                    fields["publishedDate"] = FORCE_DATE
                    result["fixed_fields"].append(f"publishedDate → {FORCE_DATE}")
                    changed = True
                elif field == "title":
                    title = extract_title_from_filename(file_path.name)
                    fields["title"] = title
                    result["fixed_fields"].append(f"title → {title}")
                    changed = True

            if changed:
                new_frontmatter = build_frontmatter(fields)
                result["status"] = "fixed"
                result["fixed_content"] = new_frontmatter + "\n\n" + body


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="CSDN 文章批量检查与迁移工具 — 支持无 Frontmatter 文件强制注入",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 scripts/check_csdn_posts.py ~/Desktop/md
  python3 scripts/check_csdn_posts.py ~/Desktop/md --fix
  python3 scripts/check_csdn_posts.py ~/Desktop/md --fix --copy-to src/content/posts
        """,
    )
    parser.add_argument("input_dir", help="CSDN 导出 Markdown 文件夹路径")
    parser.add_argument("--fix", action="store_true", help="自动修复/强制注入 Frontmatter")
    parser.add_argument("--copy-to", help="将处理后的文件复制到目标目录（如 src/content/posts）")
    args = parser.parse_args()

    input_path = Path(args.input_dir)
    if not input_path.is_dir():
        print(f"❌ 错误: {input_path} 不是有效目录")
        sys.exit(1)

    md_files = sorted(input_path.glob("*.md"))
    if not md_files:
        print(f"⚠️ 在 {input_path} 中未找到 .md 文件")
        return

    print(f"\n{'='*60}")
    print(f"📋 CSDN 文章检查 — 共 {len(md_files)} 个文件")
    print(f"{'='*60}\n")

    stats = {"ok": 0, "missing_fields": 0, "fixed": 0, "error": 0}

    for md_file in md_files:
        result = check_and_fix(md_file, args.fix)
        stats[result["status"]] = stats.get(result["status"], 0) + 1

        filename = md_file.name
        status_icon = {
            "ok": "✅",
            "missing_fields": "⚠️",
            "fixed": "🔧",
            "error": "❌",
        }.get(result["status"], "❓")

        print(f"  {status_icon} {filename}")

        if result["missing_fields"]:
            print(f"      缺失字段: {', '.join(result['missing_fields'])}")
        if result["fixed_fields"]:
            for f in result["fixed_fields"]:
                print(f"      → {f}")
        if result["external_images"]:
            for url, src in result["external_images"]:
                print(f"      📷 外部图片 [{src}]: {url[:80]}...")
        if result["errors"]:
            for err in result["errors"]:
                print(f"      {err}")

    # 复制到目标目录
    if args.copy_to:
        target = Path(args.copy_to)
        target.mkdir(parents=True, exist_ok=True)
        copied = 0
        # 先用 --fix 模式处理所有文件，然后写入目标目录
        for md_file in md_files:
            result = check_and_fix(md_file, True)
            if result["fixed_content"] is not None:
                # 写入修复后的内容
                target_file = target / md_file.name
                target_file.write_text(result["fixed_content"], encoding="utf-8")
                copied += 1
            elif result["status"] in ("ok",):
                # 无需修复，直接复制
                shutil.copy2(md_file, target / md_file.name)
                copied += 1
        print(f"\n📁 已复制 {copied}/{len(md_files)} 个文件到 {target}")

    print(f"\n{'='*60}")
    print(f"📊 统计: ✅ {stats.get('ok',0)} 合规 | ⚠️ {stats.get('missing_fields',0)} 缺失字段 | 🔧 {stats.get('fixed',0)} 已修复 | ❌ {stats.get('error',0)} 错误")
    print(f"{'='*60}\n")

    # 检查外部图床汇总
    all_images = []
    for md_file in md_files:
        try:
            c = md_file.read_text(encoding="utf-8")
            all_images.extend(check_images(c))
        except Exception:
            pass
    if all_images:
        print("💡 提示: 检测到外部图床链接，建议下载图片到本地 public/images/ 目录后更新引用。")
        print(f"   共 {len(all_images)} 个外部链接，来源: {', '.join(sorted(set(s for _, s in all_images)))}\n")


if __name__ == "__main__":
    main()