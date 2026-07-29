#!/usr/bin/env python3
"""
CSDN 文章批量检查与迁移脚本
=============================
用法：
    python3 scripts/check_csdn_posts.py <CSDN_MD_DIR> [--fix] [--copy-to src/content/posts]

功能：
    - 检查每篇 MD 的 Frontmatter 是否包含 title、publishedDate、tags、description、category
    - 当 --fix 时，尝试自动修复缺失字段（添加默认值）
    - 检测外部图床链接（CSDN、aliyun、cnblogs 等）
    - 当 --copy-to 时，将合规文件复制到目标目录

示例：
    python3 scripts/check_csdn_posts.py ~/Downloads/csdn-export --fix --copy-to src/content/posts
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

# 默认值（当 --fix 时使用）
DEFAULT_CATEGORY = "iOS 底层"
DEFAULT_DESCRIPTION = ""


def parse_frontmatter(content: str) -> Tuple[Optional[dict], str, int]:
    """解析 YAML Frontmatter，返回 (fields, body, line_count)"""
    content = content.lstrip("\n")
    if not content.startswith("---"):
        return None, content, 0

    # 找到第二个 ---
    end_idx = content.find("---", 3)
    if end_idx == -1:
        return None, content, 0

    frontmatter_text = content[3:end_idx].strip()
    body = content[end_idx + 3:].strip()
    frontmatter_lines = frontmatter_text.split("\n")

    fields = {}
    current_key = None
    current_value = ""

    for line in frontmatter_lines:
        # 数组项（以 - 开头）
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
            # 处理空值
            if not raw_value or raw_value == "":
                current_value = ""
            # 处理引号
            elif raw_value.startswith('"') and raw_value.endswith('"'):
                current_value = raw_value[1:-1]
            elif raw_value.startswith("'") and raw_value.endswith("'"):
                current_value = raw_value[1:-1]
            # 处理数组开始
            elif raw_value == "[":
                current_value = []
            elif raw_value.startswith("[") and raw_value.endswith("]"):
                inner = raw_value[1:-1].strip()
                current_value = [x.strip().strip('"').strip("'") for x in inner.split(",") if x.strip()]
            else:
                current_value = raw_value
        else:
            # 继续上一行的值（多行）
            if current_key and isinstance(current_value, str):
                current_value += " " + line.strip()

    if current_key:
        fields[current_key] = current_value

    return fields, body, len(frontmatter_lines)


def check_images(content: str) -> list[tuple[str, str]]:
    """检查 Markdown 正文中的外部图片链接"""
    findings = []
    # Markdown 图片 ![]()
    for match in re.finditer(r"!\[.*?\]\((.*?)\)", content):
        url = match.group(1)
        for pattern, name in EXTERNAL_IMAGE_PATTERNS:
            if re.search(pattern, url):
                findings.append((url, name))
                break
    # HTML <img> 标签
    for match in re.finditer(r'<img[^>]+src="([^"]+)"', content):
        url = match.group(1)
        for pattern, name in EXTERNAL_IMAGE_PATTERNS:
            if re.search(pattern, url):
                findings.append((url, name))
                break
    return findings


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


def check_and_fix(file_path: Path, fix: bool) -> dict:
    """检查（并修复）单个 MD 文件"""
    result = {
        "file": str(file_path),
        "status": "ok",
        "missing_fields": [],
        "fixed_fields": [],
        "external_images": [],
        "errors": [],
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

    if fields is None:
        result["status"] = "error"
        result["errors"].append("未找到有效的 Frontmatter（不以 --- 开头）")
        return result

    # 检查必填字段
    missing = []
    for field in REQUIRED_FIELDS:
        if field not in fields or fields[field] is None or fields[field] == "":
            missing.append(field)

    if missing:
        result["status"] = "missing_fields"
        result["missing_fields"] = missing

        if fix:
            # 自动修复
            changed = False
            for field in missing:
                if field == "category":
                    fields["category"] = DEFAULT_CATEGORY
                    result["fixed_fields"].append(f"category → {DEFAULT_CATEGORY}")
                    changed = True
                elif field == "description":
                    fields["description"] = DEFAULT_DESCRIPTION
                    result["fixed_fields"].append("description → ''")
                    changed = True
                elif field == "tags":
                    fields["tags"] = ["iOS"]
                    result["fixed_fields"].append("tags → ['iOS']")
                    changed = True
                elif field == "publishedDate":
                    fields["publishedDate"] = date.today()
                    result["fixed_fields"].append(f"publishedDate → {date.today()}")
                    changed = True
                elif field == "title":
                    stem = file_path.stem.replace("-", " ").replace("_", " ").title()
                    fields["title"] = stem
                    result["fixed_fields"].append(f"title → {stem}")
                    changed = True

            if changed:
                # 重建文件
                new_frontmatter = build_frontmatter(fields)
                new_content = new_frontmatter + "\n\n" + body
                file_path.write_text(new_content, encoding="utf-8")
                result["status"] = "fixed"

    return result


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="CSDN 文章批量检查与迁移工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 scripts/check_csdn_posts.py ~/Downloads/csdn-export
  python3 scripts/check_csdn_posts.py ~/Downloads/csdn-export --fix
  python3 scripts/check_csdn_posts.py ~/Downloads/csdn-export --fix --copy-to src/content/posts
        """,
    )
    parser.add_argument("input_dir", help="CSDN 导出 Markdown 文件夹路径")
    parser.add_argument("--fix", action="store_true", help="自动修复缺失 Frontmatter 字段")
    parser.add_argument("--copy-to", help="将合规文件复制到目标目录（如 src/content/posts）")
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

        # 文件名简短显示
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
            print(f"      修复: {', '.join(result['fixed_fields'])}")
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
        for md_file in md_files:
            result = check_and_fix(md_file, False)  # 不修复，只检查
            if result["status"] in ("ok", "fixed", "missing_fields"):
                shutil.copy2(md_file, target / md_file.name)
                copied += 1
        print(f"\n📁 已复制 {copied}/{len(md_files)} 个文件到 {target}")

    print(f"\n{'='*60}")
    print(f"📊 统计: ✅ {stats.get('ok',0)} 合规 | ⚠️ {stats.get('missing_fields',0)} 缺失字段 | 🔧 {stats.get('fixed',0)} 已修复 | ❌ {stats.get('error',0)} 错误")
    print(f"{'='*60}\n")

    if any(result["external_images"] for result in [check_and_fix(f, False) for f in md_files]):
        print("💡 提示: 检测到外部图床链接，建议下载图片到本地 public/images/ 目录后更新引用。")
        print("   推荐工具: curl -O 或 wget 批量下载，或使用 PicGo/UpGit 等工具迁移。\n")


if __name__ == "__main__":
    main()