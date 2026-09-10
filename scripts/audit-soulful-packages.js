const fs = require("fs");
const vm = require("vm");
const ctx = { window: {} };
ctx.window.LOOP = {};
vm.createContext(ctx);
vm.runInContext("var LOOP=window.LOOP;" + fs.readFileSync("js/data.js", "utf8"), ctx);

const journeys = (ctx.window.LOOP.journeys || []).filter((j) => j && j.id);
const withTable = journeys.filter((j) => j.priceTable);
console.log("journeys", journeys.length, "with priceTable", withTable.length);

const ids = new Set();
function addUrl(u) {
  const m = String(u || "").match(/images\.unsplash\.com\/(photo-[^?]+)/);
  if (m) ids.add(m[1]);
}
withTable.forEach((p) => {
  addUrl(p.image);
  (p.gallery || []).forEach(addUrl);
});

(async () => {
  const bad = [];
  const ok = [];
  for (const id of [...ids]) {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=100&q=80`;
    try {
      const r = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (r.status >= 400) bad.push({ id, status: r.status });
      else ok.push(id);
    } catch (e) {
      bad.push({ id, status: e.message });
    }
  }
  console.log("checked", ids.size, "ok", ok.length, "bad", bad.length);
  console.log(JSON.stringify(bad, null, 2));

  // incomplete packages
  for (const p of withTable) {
    const issues = [];
    if (!p.image) issues.push("image");
    if (!p.gallery || p.gallery.length < 2) issues.push("gallery");
    if (!p.story) issues.push("story");
    if (!p.blurb) issues.push("blurb");
    if (!p.highlights || !p.highlights.length) issues.push("highlights");
    if (!p.itinerary || !p.itinerary.length) issues.push("itinerary");
    if (!p.inclusions || !p.inclusions.length) issues.push("inclusions");
    if (!p.locations || !p.locations.length) issues.push("locations");
    if (issues.length) console.log("incomplete", p.id, issues.join(","));
  }
})();
