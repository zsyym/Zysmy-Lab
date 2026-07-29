// ============================================
// src/consts.ts — 站点全局配置
// ============================================
// 使用前请将所有 `YOUR_*` 替换为你的实际信息
// ============================================

/** 站点基本信息 */
export const SITE = {
  /** 站点名称（显示在导航栏、标题和页脚） */
  title: "iOS Dev Lab",
  /** 站点描述（用于 SEO meta description） */
  description: "iOS 底层原理、Objective-C Runtime、Swift 与工程实践。",
  /** 作者名称（显示在关于页、页脚和头像首字母） */
  author: "YourName",
  /** 站点 URL（部署后的正式域名，用于 sitemap 和 OG 标签） */
  url: "https://my-tech-blog.com",
  /** 语言代码 */
  locale: "zh-CN",
};

// ─────────────────────────────────────────────
// 社交链接
// ─────────────────────────────────────────────
// 图标支持: github, email, twitter, rss
// 如需添加更多社交链接，在此数组中追加即可
// ─────────────────────────────────────────────
export const SOCIALS = [
  {
    name: "GitHub",
    /** 你的 GitHub 个人主页地址 */
    url: "https://github.com/yourname",
    icon: "github",
  },
  {
    name: "Email",
    /** 你的联系邮箱 */
    url: "mailto:yourname@example.com",
    icon: "email",
  },
  {
    name: "Twitter",
    /** 你的 Twitter/X 个人主页 */
    url: "https://twitter.com/yourname",
    icon: "twitter",
  },
];

// ─────────────────────────────────────────────
// 导航菜单
// ─────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "文章", href: "/categories/all" },
  { label: "资源", href: "/resources" },
  { label: "相册", href: "/album" },
  { label: "留言", href: "/wall" },
  { label: "关于", href: "/about" },
];

// ─────────────────────────────────────────────
// 热门文章标签（侧边栏展示）
// ─────────────────────────────────────────────
export const POPULAR_TAGS = [
  "Objective-C",
  "Runtime",
  "iOS",
  "Swift",
  "内存管理",
  "多线程",
  "RunLoop",
  "性能优化",
  "Block",
  "KVC/KVO",
  "架构设计",
  "编译原理",
];

// ─────────────────────────────────────────────
// Giscus 评论系统配置
// ─────────────────────────────────────────────
// 获取方式:
//   1. 打开 https://giscus.app/zh-CN
//   2. 在"仓库"输入你的 GitHub 仓库名 (如 user/repo)
//   3. 仓库需安装 Giscus GitHub App:
//      https://github.com/apps/giscus
//   4. 页面会自动生成 repo-id, category-id 等参数
//   5. 将生成的值填入下方
// ─────────────────────────────────────────────
export const GISCUS_CONFIG = {
  /** GitHub 仓库名，格式: "用户名/仓库名" */
  repo: "yourname/your-repo" as string,
  /** GitHub 仓库 ID（从 giscus.app 获取） */
  repoId: "YOUR_REPO_ID" as string,
  /** Discussion 分类名（建议用 "Announcements"） */
  category: "Announcements" as string,
  /** Discussion 分类 ID（从 giscus.app 获取） */
  categoryId: "YOUR_CATEGORY_ID" as string,
};

// ─────────────────────────────────────────────
// Umami 网站统计配置
// ─────────────────────────────────────────────
// 获取方式:
//   方案 A: 自部署 Umami（推荐）
//     1. 在服务器上部署 Umami:
//        docker-compose up -d
//     2. 访问管理后台，添加网站获取 script.js URL 和 website-id
//   方案 B: Umami Cloud（免费版）
//     1. 注册 https://cloud.umami.is
//     2. 添加网站，获取跟踪脚本代码
// ─────────────────────────────────────────────
export const UMAMI_CONFIG = {
  /** Umami 脚本地址（自部署或 Umami Cloud） */
  scriptUrl: "https://umami.example.com/script.js" as string,
  /** 网站 ID（从 Umami 管理后台获取） */
  websiteId: "YOUR_UMAMI_WEBSITE_ID" as string,
  /** 限制统计的域名（多个用逗号分隔） */
  domains: "my-tech-blog.com" as string,
};

// ─────────────────────────────────────────────
// 站点里程碑（用于关于页时间轴）
// ─────────────────────────────────────────────
// tag 支持: git, feature, design, launch（对应不同颜色）
// ─────────────────────────────────────────────
export const MILESTONES = [
  {
    date: "2026-05-04",
    title: "仓库创建",
    description:
      "GitHub 仓库建立，站点运行时间从这一刻开始计算。",
    tag: "git",
  },
  {
    date: "2026-05-25",
    title: "留言墙与评论系统",
    description:
      "引入 Giscus 评论系统，让站点开始拥有互动与内容维护能力。",
    tag: "feature",
  },
  {
    date: "2026-05-28",
    title: "资源页上线",
    description:
      "加入 iOS 底层技术资源区，收录 Mike Ash 译文与 Runtime 系列。",
    tag: "feature",
  },
  {
    date: "2026-05-30",
    title: "统计与分析",
    description:
      "接入 Umami 统计，开始把博客做成长期运营的内容系统。",
    tag: "feature",
  },
  {
    date: "2026-06-07",
    title: "暗色系统重构",
    description:
      "完成站点暗色主题切换，形成现在的 iOS 开发者风格博客系统。",
    tag: "design",
  },
  {
    date: "2026-06-11",
    title: "相册与留言墙",
    description:
      "增加相册展示和留言墙页面，站点功能趋于完整。",
    tag: "feature",
  },
  {
    date: "2026-06-15",
    title: "正式上线",
    description:
      "iOS Dev Lab 正式上线，持续记录 iOS 技术深度探索。",
    tag: "launch",
  },
];