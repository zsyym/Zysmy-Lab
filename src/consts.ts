// ============================================
// src/consts.ts — 站点全局配置
// ============================================
// 使用前请将所有 `YOUR_*` 替换为你的实际信息
// ============================================

/** 站点基本信息 */
export const SITE = {
  /** 站点名称（显示在导航栏、标题和页脚） */
  title: "Zysmy Lab",
  /** 站点描述（用于 SEO meta description） */
  description: "iOS 底层原理、Objective-C Runtime 与工程实践。",
  /** 作者名称（显示在关于页、页脚和头像首字母） */
  author: "Zysmy",
  /** 站点 URL（部署后的正式域名，用于 sitemap 和 OG 标签） */
  url: "https://zysmy-lab.com",
  /** 语言代码 */
  locale: "zh-CN",
};

// ─────────────────────────────────────────────
// 页面背景图映射
// ─────────────────────────────────────────────
// 每个页面使用不同的背景图，放在 public/images/bg/ 下
// 图片文件名作为键，页面路由前缀作为匹配条件
// ─────────────────────────────────────────────
export const PAGE_BG_MAP: Record<string, string> = {
  /** 首页背景 */
  home: "/images/bg/back.jpg",
  /** 文章/分类页背景 */
  categories: "/images/bg/IMG_9362.JPG",
  /** 资源页背景 */
  resources: "/images/bg/img_1074_0b2edu5b43qgpuaovf2j6vudihied3jqmi2a.JPG",
  /** 相册页背景 */
  album: "/images/bg/IMG_9399.jpg",
  /** 留言墙页背景 */
  wall: "/images/bg/img_1074_0b53sa7mq3qcduamr57adjudbeaezbpaf5ka.JPG",
  /** 关于页背景 */
  about: "/images/bg/img_1074_0bc3xm6s43qbueam5itza5udhoyefz2qce2a.JPG",
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
    url: "https://github.com/zsyym",
    icon: "github",
  },
  {
    name: "Email",
    /** 你的联系邮箱 */
    url: "mailto:1849441742@qq.com",
    icon: "email",
  },
  {
    name: "Twitter",
    /** 你的 Twitter/X 个人主页 */
    url: "https://twitter.com/zsyym",
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
  repo: "zsyym/Zysmy-Lab" as string,
  /** GitHub 仓库 ID（从 giscus.app 获取） */
  repoId: "R_kgDOTnGFOw" as string,
  /** Discussion 分类名（建议用 "Announcements"） */
  category: "Announcements" as string,
  /** Discussion 分类 ID（从 giscus.app 获取） */
  categoryId: "DIC_kwDOTnGFO84DCRly" as string,
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
  scriptUrl: "https://cloud.umami.is/script.js" as string,
  /** 网站 ID（从 Umami 管理后台获取） */
  websiteId: "c1658238-4e1e-4aef-8526-c625fef63117" as string,
  /** 限制统计的域名（多个用逗号分隔） */
  domains: "zysmy-lab.pages.dev" as string,
};

// ─────────────────────────────────────────────
// 站点里程碑（用于关于页时间轴）
// ─────────────────────────────────────────────
// tag 支持: git, feature, design, launch（对应不同颜色）
// ─────────────────────────────────────────────
export const MILESTONES = [
  {
    date: "2026-07-28",
    title: "项目初始化",
    description:
      "使用 Astro + Tailwind CSS 搭建博客框架，确定 iOS 技术方向。",
    tag: "git",
  },
  {
    date: "2026-07-29",
    title: "内容迁移与功能完善",
    description:
      "完成 CSDN 21 篇文章批量迁移，配置 Giscus 评论、Umami 统计、相册动态化。",
    tag: "feature",
  },
  {
    date: "2026-07-30",
    title: "UI 重构与上线",
    description:
      "深色模式默认、背景图系统、时间轴布局、相册详情页，站点正式上线。",
    tag: "launch",
  },
];