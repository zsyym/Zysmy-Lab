// ============================================
// src/utils/posts.ts — 文章查询工具函数
// ============================================
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

/** 筛选选项 */
export interface PostFilter {
  category?: string;
  tag?: string;
  limit?: number;
  featured?: boolean;
}

/** 排序方式 */
export type SortOrder = "newest" | "oldest";

// ─────────────────────────────────────────────
// 获取所有已发布的文章（非草稿）
// ─────────────────────────────────────────────
export async function getAllPosts() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts;
}

// ─────────────────────────────────────────────
// 获取文章列表（排序 + 筛选 + 分页）
// ─────────────────────────────────────────────
export async function getPosts(
  options?: {
    filter?: PostFilter;
    sort?: SortOrder;
    page?: number;
    pageSize?: number;
  } & PostFilter,
) {
  let posts = await getAllPosts();

  // 合并顶层快捷筛选参数
  const filter = options?.filter ?? {};
  if (options?.category) filter.category = options.category;
  if (options?.tag) filter.tag = options.tag;
  if (options?.featured) filter.featured = options.featured;

  // ── 筛选 ──
  if (filter.category) {
    posts = posts.filter(
      (p) => p.data.category.toLowerCase() === filter.category!.toLowerCase(),
    );
  }
  if (filter.tag) {
    posts = posts.filter(
      (p) =>
        p.data.tags.some((t) => t.toLowerCase() === filter.tag!.toLowerCase()),
    );
  }
  if (filter.featured) {
    posts = posts.filter((p) => p.data.featured);
  }

  // ── 排序（默认最新优先） ──
  const sort = options?.sort ?? "newest";
  posts.sort((a, b) => {
    const diff = b.data.publishedDate.getTime() - a.data.publishedDate.getTime();
    return sort === "newest" ? diff : -diff;
  });

  // ── 分页 ──
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? options?.limit ?? 10;
  const total = posts.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paginatedPosts = posts.slice(start, start + pageSize);

  return {
    posts: paginatedPosts,
    pagination: { page, pageSize, total, totalPages },
  };
}

// ─────────────────────────────────────────────
// 获取所有分类（及其文章数）
// ─────────────────────────────────────────────
export async function getCategories() {
  const posts = await getAllPosts();
  const map = new Map<string, number>();

  for (const p of posts) {
    const cat = p.data.category;
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ─────────────────────────────────────────────
// 获取所有标签（及其文章数）
// ─────────────────────────────────────────────
export async function getTags() {
  const posts = await getAllPosts();
  const map = new Map<string, number>();

  for (const p of posts) {
    for (const tag of p.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ─────────────────────────────────────────────
// 获取相关文章（同标签，不含自身）
// ─────────────────────────────────────────────
export async function getRelatedPosts(
  current: Post,
  limit = 3,
): Promise<Post[]> {
  const posts = await getAllPosts();
  const currentId = current.id.replace(/\.md$/, "");
  const otherPosts = posts.filter((p) => p.id.replace(/\.md$/, "") !== currentId);

  // 按匹配标签数排序
  const currentTags = current.data.tags.map((t) => t.toLowerCase());
  const scored = otherPosts.map((p) => {
    const matchCount = p.data.tags.filter((t) =>
      currentTags.includes(t.toLowerCase()),
    ).length;
    return { post: p, score: matchCount };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}
export function postPath(post: Post) {
  return `/blog/${encodeURIComponent(post.id.replace(/\.md$/, ""))}/`;
}

export function readingMinutes(post: Post) {
  const body = post.body.replace(/!?\[([^\]]*)\]\([^)]+\)/g, "$1");
  const chinese = body.match(/[\u3400-\u9fff]/g)?.length || 0;
  const words = body.match(/[a-zA-Z0-9_]+/g)?.length || 0;
  return Math.max(1, Math.ceil(chinese / 450 + words / 220));
}
