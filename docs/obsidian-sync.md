# Obsidian → Astro 博客同步方案

## 目录结构

```
my-tech-blog/
└── src/
    └── content/
        └── posts/          ← 把你的 Obsidian 笔记放到这里
            ├── hello-world.md
            ├── astro-tailwind-guide.md
            └── ...
```

## 前端内容格式 (Frontmatter)

每篇 Markdown 文章必须包含以下 yaml 前端内容块：

```yaml
---
title: "文章标题"
publishedDate: 2026-05-05
description: "文章摘要，用于卡片展示和 SEO"
category: "技术"           # 分类名称
tags: ["iOS", "Objective-C", "Runtime"]
---
```

### 可选字段

```yaml
cover: ../../assets/images/cover.png   # 封面图（放在 src/assets/ 下）
coverAlt: "封面图描述"                   # 封面图替代文本
featured: true                          # 是否置顶
draft: true                             # 草稿模式，构建时跳过
updatedDate: 2026-05-06                 # 最后修改日期
ogImage: "/images/og-default.png"       # 自定义社交分享图
canonicalURL: "https://example.com/original"  # 原文链接
```

## 方法一：软链接（推荐，零复制）

在 Obsidian 仓库中创建一个指向博客 posts 目录的软链接：

```bash
# 假设你的 Obsidian Vault 在 ~/Obsidian
# 博客项目在 ~/Projects/my-tech-blog

# 在 Obsidian vault 中创建软链接
ln -s ~/Projects/my-tech-blog/src/content/posts ~/Obsidian/Blog-Posts

# 或者反过来（在博客中链接 Obsidian 笔记目录）
ln -s ~/Obsidian/Notes/Technical ~/Projects/my-tech-blog/src/content/posts
```

**优点：** Obsidian 中编辑保存后，博客项目即时生效，无需手动复制。

**注意：** 软链接文件需要被 git 追踪，建议在 `.gitignore` 中排除软链接
目标，改为在 CI 构建时创建。

## 方法二：同步脚本（跨平台，可配置）

创建一个 `scripts/sync-obsidian.sh`：

```bash
#!/bin/bash
# scripts/sync-obsidian.sh — 从 Obsidian Vault 同步笔记到博客

OBSIDIAN_NOTES_DIR="$HOME/Obsidian/Notes/Technical"
BLOG_POSTS_DIR="src/content/posts"

echo "🔄 正在从 Obsidian 同步笔记..."
rsync -av --delete \
  --include="*.md" \
  --exclude="_*" \
  --exclude=".obsidian/" \
  "$OBSIDIAN_NOTES_DIR/" "$BLOG_POSTS_DIR/"

echo "✅ 同步完成！共 $(ls -1 "$BLOG_POSTS_DIR"/*.md 2>/dev/null | wc -l) 篇文章"
```

然后在 `package.json` 中添加脚本命令：

```json
{
  "scripts": {
    "sync:obsidian": "bash scripts/sync-obsidian.sh",
    "dev:sync": "npm run sync:obsidian && npm run dev"
  }
}
```

## 方法三：Obsidian Templater 插件自动生成 Frontmatter

如果你使用 Obsidian 的 [Templater](https://github.com/SilentVoid13/Templater) 插件，
可以创建一个博客文章模板，自动生成所需的前端内容：

**模板文件路径：** `_templates/blog-post.md`

```markdown
---
title: "<% tp.file.title %>"
publishedDate: "<% tp.date.now("YYYY-MM-DD") %>"
description: ""
category: ""
tags: []
draft: true
---

## 概述

<!-- 在这里写文章内容 -->

## 正文


## 参考
```

使用方法：
1. 在 Obsidian 中按 `Alt+T` 插入模板
2. 填写标题，Templater 自动生成日期
3. 补充 `description`、`category`、`tags`
4. 文章完成后将 `draft` 改为 `false`
5. 同步到博客项目，执行 `npm run build`

## 注意事项

1. **文件名即 slug**：`hello-world.md` → 访问 `/blog/hello-world`
2. **图片处理**：图片放在 `src/assets/` 下，Frontmatter 中 `cover` 使用相对路径
3. **Obsidian 内部链接** `[[wikilinks]]` 不会被 Astro 解析，请使用标准 Markdown 链接 `[text](url)`
4. **标签一致**：Obsidian 中的标签应与博客的 `tags` 字段保持一致，避免大小写混淆