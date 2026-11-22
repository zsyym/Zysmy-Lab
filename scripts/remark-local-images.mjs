// Imported notes sometimes contain unescaped spaces in desktop screenshot paths.
// Keep the original Markdown intact and render a readable fallback.
export default function localImageFallback() {
  function visit(node) {
    if (node.type === "paragraph" && node.children[0]?.value?.includes("](/Users/")) {
      // GFM may parse the @2x suffix as an email link inside the image path.
      const literal = node.children.map(child => child.value ?? child.children?.[0]?.value ?? "").join("");
      if (/^!\[[^\]]*\]\(\/Users\/.*\)$/.test(literal.trim())) {
        node.children = [{ type: "text", value: "〔原文插图待补充〕" }];
      }
    }
    if (node.type === "text") {
      node.value = node.value.replace(/!\[[^\]\n]*\]\(\/Users\/[^\n]*?\.(?:png|gif|jpe?g|webp)\)/gi, "〔原文插图待补充〕");
    }
    if (node.type === "image" && node.url.startsWith("/Users/")) {
      node.type = "text";
      node.value = "〔原文插图待补充〕";
      delete node.url;
    }
    node.children?.forEach(visit);
  }
  return visit;
}
