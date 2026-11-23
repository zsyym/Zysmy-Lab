# Zysmy’s Lab 功能路线图

## 当前进度 · 2026-11-23

Phase 2 首页（`ba18cb0`）与 Phase 3 文章系统（`8efb383`）已完成开发、推送与线上技术核验，等待站主视觉验收。预览工作流已在 `codex/site-shell` 上成功运行。此次浏览器抽查对应提交 `bf30e83`，部署步骤已向 Cloudflare 核对环境、分支、完整 SHA 和 URL。[验收用预览](https://1b814f40.zysmy-lab.pages.dev/) · [Actions 第 2 次运行](https://github.com/zsyym/Zysmy-Lab/actions/runs/45035606544/attempts/2)

| 线上抽查 | 结果 |
| --- | --- |
| 首页 | 1440px 桌面为 12 列，390px 移动视口为单列。两张相册封面均能解码，移动菜单可展开并用 Esc 收起。加载完成后点击「创建对象」显示「持有 1 份」。 |
| 文章 | 两种视口下首页、文章列表与《多线程与GCD》均返回 HTTP 200，无页面级横向溢出。列表显示 21 篇，长文生成 23 个目录链接与 37 个代码复制控件。 |
| 全文搜索 | 搜索正文关键词 `retainCount` 唯一命中《手动内存管理》，结果链接可打开，文内实验在页面加载完成后可操作。 |
| 待复核 | 《多线程与GCD》仍显示原文插图待补充。浏览器记录到 Giscus discussions 请求返回 404，评论发布未测试。一次搜索跳转后立即点击实验未改变状态，等待页面加载完成后复测通过。移动测试为浏览器窄视口。 |

Phase 4 待站主确认后启动。按现有项目数据补齐来源，建立作品展厅与详情，优先关联 3G-Share 和 Weather 的真实笔记。后续阶段依照 [AGENTS.md](../AGENTS.md) 执行检查、构建、提交、推送、远程 SHA 核对，并等待对应预览运行成功，向站主提供实际预览地址。

## 技术方案与依赖

| 功能 | 方案与依赖 |
| --- | --- |
| 外壳、主题及导航 | Astro 布局、CSS token、现有 Tailwind。少量浏览器脚本管理主题、菜单、滚动。页面切换先评估浏览器原生 View Transition，支持降级、历史和锚点。 |
| 资料、作品、相册 | 单一类型化 profile、projects、links 数据，字段可选且有来源；项目引用文章稳定 slug。相册沿用构建生成 JSON，补宽高、alt、缩略图路径，增量生成且保留原图。Phase 6 先评估 Node CI 转图及格式支持再决定是否增加构建依赖。PhotoSwipe 按需加载，按每个专辑组织查看序列。 |
| 文章与搜索 | 从已发布 Markdown 生成纯文本索引，剥离 frontmatter、HTML 与媒体 URL，代码可作为单独低权重字段。短文本索引作为懒加载 JSON，Fuse 对标题、标签、摘要和正文加权，中文关键字样稿验证召回。路线共用 URL query，草稿从搜索、系列和关联中排除。当前规模沿用 Fuse。用 URL 与控件串联分类、标签、系列及时间归档。 |
| 阅读体验 | 保留 Astro Markdown / Shiki；标题数据生成目录，IntersectionObserver 跟随章节，滚动比例计算阅读进度。用 Clipboard API 和明确失败反馈。可选 series、order 字段，缺省兼容旧 frontmatter。阅读时间按中文字符与英文词数给出估计。 |
| 实验 | 原生 DOM/CSS 图解、确定性状态机及 Astro 容器。registry 定义 id、分类、标题、初始状态、关联 slug，实验各自拥有 reducer、视图与代码片段。运行状态驱动图、代码与可用动作。正文通过构建时允许列表的实验 ID 渲染同一组件，按可见或操作激活，未知 ID 显示可读降级。 |
| GitHub | 使用现有 GitHub 账号公开事件快照。带时间范围、采集时间和 API 覆盖提示，页面区分公开事件与贡献总量。初版以可选 CI 任务调用公开 API 写静态 JSON，仅发布公开字段。失败保留最近成功快照，首次失败显示入口与状态，避免失败影响主构建。确需认证时凭据仅驻 CI/服务端。 |
| 留言与友链 | 继续使用 Giscus Discussions 的 pathname 映射及 GitHub 登录，保持文章和留言讨论分离。友链静态审核，使用站主确认的公开联系渠道收集申请。 |
| AI 知识库 | Phase 2 交付入口与文章主题导航。Phase 8 评估 Pages Functions 或独立服务、向量检索或混合检索、嵌入、模型费用和日志保留；比较托管和自维护方案后再选依赖。索引只读站主许可的公开文章，回答应附可核验引用及无结果状态，密钥服务端保管。 |

### 实验顺序与验证动作

| 实验 | 动作与可视化 |
| --- | --- |
| Objective-C 对象生命周期 | 创建、发送消息、释放引用、重置，图解实例从创建到失去最后强引用 |
| Runtime 消息发送 | 选择接收者/selector，单步查看缓存、查找、转发 |
| ARC 引用计数 | 增删强弱引用，显示生命周期与弱引用归零 |
| Block 捕获机制 | 切换普通变量与 __block，变更源值并调用 Block |
| RunLoop | 投递任务、切模式、推进一个事件循环 |
| GCD | 提交任务、切换串行和并发，展示一组可重复的调度例子 |
| KVO | 添加观察者、更改属性、移除观察者并查看通知 |
| 响应者链 | 选择触点及处理节点，逐步显示事件传播 |
| 内存布局 | 切换成员声明，查看对齐、填充及偏移，并标明示例 ABI |
| App 启动 | 按阶段展示启动到首帧，区分示意和实测数据 |

首批上线生命周期与消息发送。后续八项复用同一容器逐个启用，文案区分教学模型与真实系统行为。

## 目录规划

```text
src/
  pages/                     # 保留现有入口，新增独立栏目
    lab/{index,[slug]}.astro
    projects/{index,[slug]}.astro
    thoughts/{index,[slug]}.astro
    articles/{archive,series/…}.astro
    links.astro
  layouts/{Layout,ArticleLayout}.astro
  components/                # 共享外壳及现有可复用组件
  features/
    home/                    # 工作台与其只读模块
    lab/                     # 外壳、registry、experiments/<id>/
    projects/                # App 切换及详情区
    search/                  # 搜索引擎、索引与对话框
    gallery/                 # 浏览轨道与灯箱
  data/{profile,projects,links}.ts
  data/albums.json
  content/
    posts/                   # 保留原文及 slug
    thoughts/
  utils/posts.ts
  styles/{tokens,global,prose}.css
public/images/               # 原路径继续服务
scripts/                     # 相册生成、内容核对与可选快照
docs/                        # 设计与发布工作流
```

## 文件行动清单

| 动作 | 位置及目标 |
| --- | --- |
| 当前新增 | `docs/REDESIGN_PLAN.md`、`docs/DESIGN_SYSTEM.md`、`docs/FEATURE_ROADMAP.md`、`docs/references/` |
| 修改 | `src/consts.ts` 收束站点配置和导航，`Layout.astro`、`Header.astro`、`Footer.astro`、`ThemeToggle.astro`、`global.css`、`tailwind.config.mjs` 接入 tokens |
| 修改 | `index.astro` 替换首页编排，`about.astro`、`resources.astro` 接入版式；按需收束旧 `HeaderBanner.astro`、`Sidebar.astro` 的调用范围 |
| 修改 | `categories/[slug].astro`、`blog/[slug].astro`、`search.astro`、`posts.ts`、`content/config.ts` 及 `PostCard`、`TagBadge`、`TOC`、`Pagination` |
| 修改 | `album.astro`、`album/[slug].astro`、`scripts/generate-album-data.mjs` 与生成的 `albums.json`；`wall.astro`、`GiscusComment.astro` 更新界面和容错 |
| 新增 | 上述路由、`ArticleLayout.astro`、features 内模块、统一资料与项目数据、tokens 与 prose 样式、搜索索引端点、审核确认后的专用媒体和可选快照脚本 |
| 保留 | `src/content/posts/` 及既有 slug，原始 `public/images/` 路径与 favicon，既有页面入口，`docs/obsidian-sync.md`、`scripts/check_csdn_posts.py`、Giscus/Umami 配置、`wrangler.toml` 和 `.github/workflows/deploy.yml` 的发布契约。文章媒体修正单独核对。 |

仅在验证新增构建依赖确有必要后更新 package.json 和 lockfile。站点 canonical 由站主确认正式域名后统一，核验 sitemap、OG 和 Cloudflare 预览输出一致。

## 阶段、交付与验收

| Phase | 交付与依赖 | 验收标准 |
| --- | --- | --- |
| 0 | 项目基线、参考分析、草图、tokens 与路线图 | 三份文档齐全，截图可打开，限制已注明，基线静态构建通过，站主确认视觉方向 |
| 1 | tokens、外壳与页脚 | 320/390/768/1120/1440px 无页面级横溢，八个入口按可用性逐步发布，当前态和焦点清楚，系统/浅/深可持久切换，已有路由仍可达 |
| 2 | Bento 工作台和统一资料 | 桌面 12 列和移动 DOM 顺序符合草图，首屏有真实资料和可用内容，真实与待补充状态清楚，尚未发布模块可自然回流 |
| 3 | 分类、标签、全文搜索、系列、归档与阅读 | 21 条旧文章链接及有内容分类可达，现有草稿规则生效，用正文独有词命中，试验含中英文、代码、长标题、空筛选；目录、复制、进度及上下篇工作，已知失效媒体有可见回退 |
| 4 | 项目首页与详情 | 可通过键盘和手机切换五个候选项；3G-Share、Weather 关联真实笔记，其余按证据开放。截图、功能和仓库链接均可追溯 |
| 5 | 实验 registry、列表和首批详情 | 两项实验可重置并多次重复，状态、代码和图解同步。每项独立 URL，至少一篇关联正文验证嵌入，支持键盘和简化动画 |
| 6 | 随笔、相册、友链、留言 | 时间轴支持短文和长文。相册支持键盘、滑动、关闭及复焦，原图入口可用；Giscus 讨论保留，模拟阻断时有回退。友链来源经站主确认 |
| 7 | 搜索面板、GitHub 快照和全局交互 | Cmd/Ctrl+K 和按钮在子页可用，Esc 关闭、恢复焦点，失效索引有恢复入口；模拟零活动、请求失败和过期三态。产物及日志无凭据 |
| 8 | 后端与 RAG 评估 | 完成引用、无命中、来源更新、私密边界、成本、限流、维护与回滚评估。公开入口保留筹备状态，实装范围由站主确认 |
| 9 | 性能、响应式、代码审查与发布验证 | Node 20 下 `npm ci` 和 `npm run build` 成功，逐条比对旧 URL、sitemap 和 Cloudflare Preview；桌面和移动复测键盘、触摸、两主题和 reduced motion。移动预览以 LCP ≤2.5s、CLS ≤0.1 为目标，记录测试条件和偏差，视觉由站主验收 |

每阶段确认可回滚提交和预览地址。正式部署后出现路由或评论回归，回滚至最近可用 Pages 部署，并用原 URL 检查恢复。Phase 0 当前待确认项为品牌拼写、首屏排布、视觉 tokens、正式域名、头像/作者时区、项目资料和首批随笔。
