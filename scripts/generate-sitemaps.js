const fs = require("fs");
const path = require("path");

const ORIGIN = "https://looptrips.in";
const today = new Date().toISOString().slice(0, 10);

const COLLECTION_PATHS = [
  "/sanatan",
  "/biker",
  "/community",
  "/solo",
  "/surprise",
  "/group",
];

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  ...COLLECTION_PATHS.map((loc) => ({ loc, priority: "0.85", changefreq: "weekly" })),
  { loc: "/journeys", priority: "0.9", changefreq: "weekly" },
  { loc: "/about", priority: "0.7", changefreq: "monthly" },
  { loc: "/contact", priority: "0.8", changefreq: "monthly" },
  { loc: "/book", priority: "0.7", changefreq: "monthly" },
  { loc: "/concierge", priority: "0.8", changefreq: "monthly" },
  { loc: "/affiliates", priority: "0.5", changefreq: "monthly" },
  { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
  { loc: "/cancellation", priority: "0.4", changefreq: "yearly" },
  { loc: "/refund", priority: "0.4", changefreq: "yearly" },
  { loc: "/terms", priority: "0.3", changefreq: "yearly" },
];

function urlEntry(loc, priority, changefreq) {
  const href = loc === "/" ? ORIGIN : `${ORIGIN}${loc}`;
  return `  <url>
    <loc>${href}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function writeUrlset(file, urls) {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
  fs.writeFileSync(file, body, "utf8");
}

const dataJs = fs.readFileSync(path.join("js", "data.js"), "utf8");
const skip = new Set(["sanatan", "biker", "community", "solo", "surprise", "group", "world"]);
const tripIds = [...dataJs.matchAll(/^\s+id:\s*"([^"]+)"/gm)]
  .map((m) => m[1])
  .filter((id) => !skip.has(id));

const pagesXml = STATIC_PAGES.map((p) => urlEntry(p.loc, p.priority, p.changefreq));
writeUrlset("sitemap-pages.xml", pagesXml);

const tripsXml = tripIds.map((id) => urlEntry(`/trip/${id}`, "0.7", "weekly"));
writeUrlset("sitemap-trips.xml", tripsXml);

const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${ORIGIN}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${ORIGIN}/sitemap-trips.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
fs.writeFileSync("sitemap.xml", indexXml, "utf8");

console.log(`Wrote sitemap index + ${STATIC_PAGES.length} pages + ${tripIds.length} trips.`);
