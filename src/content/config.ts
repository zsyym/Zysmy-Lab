// ============================================
// src/content/config.ts — Content Collections 定义
// ============================================
import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      // ── 必填字段 ──
      /** 文章标题 */
      title: z.string(),
      /** 发布日期（ISO 8601 格式，如 2026-05-05） */
      publishedDate: z.date(),
      /** 文章摘要（SEO 和卡片展示用） */
      description: z.string(),
      /** 分类（如 技术、生活、AI） */
      category: z.string(),
      /** 标签列表（如 ["iOS", "Objective-C", "Runtime"]） */
      tags: z.array(z.string()),

      // ── 可选字段 ──
      /** 封面图（放在 src/assets/ 下或 public/ 中） */
      cover: image().optional(),
      /** 封面图替代文字 */
      coverAlt: z.string().optional(),
      /** 是否置顶 */
      featured: z.boolean().optional().default(false),
      /** 是否草稿（构建时跳过） */
      draft: z.boolean().optional().default(false),
      /** 最后修改日期 */
      updatedDate: z.date().optional(),

      // ── SEO 前置 ──
      /** 自定义 og:image URL */
      ogImage: z.string().optional(),
      /** 原文链接（转载时使用） */
      canonicalURL: z.string().optional(),
    }),
});

export const collections = {
  posts: postsCollection,
};