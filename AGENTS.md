# 🤖 Agent 协作与自动化指南

本文档定义了 Reasonix 代理在操作本项目时必须遵循的规范。每次执行任务前请先阅读此文件。

---

## 📸 相册更新流程

1. **路径：** 所有照片必须存放在 `public/images/album/<专辑名>/` 下。
2. **格式：** 仅支持 `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`（不支持 `.heic`，需先转换格式）。
3. **操作步骤：**
   - 检查目标专辑文件夹是否存在，不存在则创建。
   - 放入图片后，执行 `git add public/images/album/`。
   - 运行 `npm run build` 确认构建无报错。

## 📝 文章发布流程

1. **路径：** `src/content/posts/`。
2. **Frontmatter 必填字段：** `title`, `publishedDate`, `description`, `tags`, `category`。
3. **可选字段：** `cover`, `coverAlt`, `featured`, `draft`, `updatedDate`, `ogImage`, `canonicalURL`。
4. **文件名即 slug：** `hello-world.md` → 访问 `/blog/hello-world`。

## 🚀 Git 提交规范

每次完成操作后，必须按顺序执行：

1. `git add .`
2. `git commit -m "<type>: <description>"`
   - `content` — 更新文章或照片
   - `feat` — 增加新功能
   - `chore` — 修改配置（如 `consts.ts`）
   - `fix` — 修复 bug
   - `style` — UI 样式调整
3. `git push`

## 🛠 环境检查清单

进行任何操作前/后，请确认：

- [ ] `npm run build` 无报错（或 `npm run dev` 开发服务器正常启动）
- [ ] `src/consts.ts` 中的配置是否完整（GISCUS_CONFIG、UMAMI_CONFIG、SOCIALS）
- [ ] 新增的图片文件命名不含特殊字符，路径大小写正确
- [ ] 相册图片格式为 `.jpg`/`.png`/`.webp`/`.gif`，不支持 `.heic`

## 🔗 关键配置位置

| 配置项 | 文件路径 |
|--------|----------|
| 站点信息 / 社交链接 / 导航 | `src/consts.ts` |
| Giscus 评论参数 | `src/consts.ts` → `GISCUS_CONFIG` |
| Umami 统计参数 | `src/consts.ts` → `UMAMI_CONFIG` |
| 全局布局（侧边栏、Footer） | `src/layouts/Layout.astro` |
| 文章 Content Collections 定义 | `src/content/config.ts` |
| 相册图片目录 | `public/images/album/<专辑名>/` |
| CSDN 批量迁移脚本 | `scripts/check_csdn_posts.py` |