// ============================================
// scripts/generate-album-data.mjs
// ============================================
// 在 npm run build 之前运行，扫描 public/images/album/
// 生成 src/data/albums.json 供 Astro 页面使用
// 避免在页面中直接使用 node:fs（Cloudflare Workers 不兼容）
// ============================================
import fs from "node:fs";
import path from "node:path";

const ALBUM_ROOT = path.resolve("public/images/album");
const OUTPUT = path.resolve("src/data/albums.json");
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

const albums = [];

try {
  const entries = fs.readdirSync(ALBUM_ROOT, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dirPath = path.join(ALBUM_ROOT, entry.name);
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => IMAGE_EXTS.includes(path.extname(f).toLowerCase()));

    if (files.length === 0) continue;

    const imagePaths = files.map(
      (f) =>
        `/images/album/${encodeURIComponent(entry.name)}/${encodeURIComponent(f)}`,
    );

    albums.push({
      name: entry.name,
      slug: entry.name,
      images: imagePaths,
      count: files.length,
      date: "2026-05-18",
      cover: imagePaths[0],
    });
  }
} catch (err) {
  console.warn("⚠️ 相册数据生成: public/images/album/ 目录不存在或为空");
}

// 按专辑名排序
albums.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));

// 确保输出目录存在
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(albums, null, 2), "utf-8");

console.log(`✅ 相册数据已生成: ${OUTPUT} (${albums.length} 个专辑)`);
