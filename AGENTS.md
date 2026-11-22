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

每完成一个 Phase，按以下顺序执行并记录结果。

1. 对照阶段验收标准完成全部开发任务。
2. 执行代码质量检查，审阅本阶段差异并运行适用的静态检查。
3. 执行 `npm run build` 和与改动相关的测试，处理失败项。
4. 用 `git status`、`git branch -vv` 和 `git remote -v` 核对工作区、当前开发分支与推送目标，只暂存属于本阶段的文件。
5. 检查暂存内容和将要推送的提交，排查令牌、私钥、环境配置及其他敏感信息。确认 `git diff --cached --check` 通过。
6. 使用 `git commit -m "<type>: <description>"` 提交本阶段改动，记录 `git rev-parse HEAD`。提交类型沿用 content、feat、chore、fix、style，纯文档使用 docs。
7. 自动执行 `git push -u origin <当前开发分支>` 推送至 GitHub。禁止强制推送、覆盖远程历史或未经授权合并到 main。
8. 用 `git ls-remote --exit-code --heads origin refs/heads/<当前开发分支>` 查询服务器。将远端哈希与本阶段提交比对；如远端已前进，先 fetch，再用 `git merge-base --is-ancestor` 核实远端包含该提交。
9. 报告分支、Commit Hash、Push 结果和远程验证结果。

只有 Commit、Push 均成功且已验证远程包含该提交，才标记为“已同步完成”。Push 失败必须标记为“本地已完成，远程同步失败”，说明具体错误和安全修复结果。若 Push 成功但验证受阻，报告“已推送，远程验证待完成”。

## Preview Deployment Workflow

1. 完成当期 Phase 的开发与验收项。
2. 执行仓库配置的代码质量检查。
3. 构建并运行相关测试，记录结果。
4. 按上述 Git 规范检查工作区、暂存内容和敏感信息。
5. 创建阶段提交，记录完整 SHA。
6. 将提交推送到当前开发分支 `codex/site-shell`，核对远程 HEAD。
7. 在 GitHub Actions 查找该 SHA 对应的 **Cloudflare Pages Preview** push run。
8. 等待运行结束，检查构建、Cloudflare 上传和预览环境校验各步骤。
9. 从该运行的 Summary 或日志获取 Wrangler 返回且通过校验的 Preview URL。
10. 向站主报告提交、推送、运行链接、测试结果及实际预览地址，等待视觉验收。

分别记录本地开发、Commit、Push、Actions、Cloudflare Preview 和 Production 状态。只有远端预览任务确认部署成功并核实地址后，才报告“预览部署成功”。失败时保留运行链接，定位出错步骤，在权限范围内安全修复并重新验证，报告最终状态。开发分支推送只触发预览，正式自动发布由 main 的生产工作流处理。

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