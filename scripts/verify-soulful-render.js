const fs = require("fs");
const vm = require("vm");

const ctx = { window: {} };
ctx.window.LOOP = {};
vm.createContext(ctx);
vm.runInContext("var LOOP=window.LOOP;" + fs.readFileSync("js/data.js", "utf8"), ctx);
vm.runInContext(fs.readFileSync("js/content.js", "utf8").replace("localStorage", "({getItem:()=>null,setItem:()=>{}})"), ctx);

const journeys = ctx.window.LOOP.journeys;
const ids = journeys.filter((j) => j && j.priceTable).map((j) => j.id);

function assertJourney(j) {
  const issues = [];
  if (!j) return ["missing"];
  if (!j.title) issues.push("title");
  if (!j.image || !/^https:\/\//.test(j.image)) issues.push("image");
  if (!j.story) issues.push("story");
  if (!j.blurb) issues.push("blurb");
  if (!Array.isArray(j.locations) || !j.locations.length) issues.push("locations");
  if (!Array.isArray(j.gallery) || j.gallery.length < 1) issues.push("gallery");
  if (!Array.isArray(j.highlights) || !j.highlights.length) issues.push("highlights");
  if (!Array.isArray(j.itinerary) || !j.itinerary.length) issues.push("itinerary");
  if (!Array.isArray(j.inclusions) || !j.inclusions.length) issues.push("inclusions");
  if (!j.price) issues.push("price");
  if (!j.duration) issues.push("duration");
  if (!j.priceTable || !j.priceTable.rows || !j.priceTable.rows.length) issues.push("priceTable");
  return issues;
}

let fail = 0;
for (const id of ids) {
  const j = journeys.find((x) => x && x.id === id);
  const issues = assertJourney(j);
  if (issues.length) {
    fail++;
    console.log("FAIL", id, issues.join(","));
  }
}
console.log(fail ? `FAILED ${fail}/${ids.length}` : `OK ${ids.length} packages`);
process.exit(fail ? 1 : 0);
