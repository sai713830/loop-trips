const fs = require("fs");
const path = require("path");

const root = process.cwd();
const skip = new Set(["admin.html", "admin-gate.html"]);

for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  if (skip.has(file)) continue;
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  if (html.includes("js/seo.js")) continue;
  html = html.replace(
    '<script src="js/brand-assets.js"></script>',
    '<script src="js/brand-assets.js"></script>\n  <script src="js/seo.js"></script>'
  );
  fs.writeFileSync(fp, html, "utf8");
  console.log("patched", file);
}
