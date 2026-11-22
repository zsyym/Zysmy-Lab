import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import localImageFallback from "./scripts/remark-local-images.mjs";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://zysmy-lab.pages.dev",
  // 禁用图片优化（sharp 在 Cloudflare Workers 下不兼容）
  image: {
    service: {
      entrypoint: "astro/assets/services/noop",
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [localImageFallback],
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
