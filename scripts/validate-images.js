const fs = require("fs");
const path = require("path");

const data = fs.readFileSync(path.join(__dirname, "../js/data.js"), "utf8");
const ids = [...new Set([...data.matchAll(/U\("([^"]+)"/g)].map((m) => m[1]))];

async function check(id) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=100&q=80`;
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { id, status: r.status };
  } catch (e) {
    return { id, status: "ERR", err: String(e) };
  }
}

(async () => {
  console.log("Unique photo IDs:", ids.length);
  const results = [];
  for (const id of ids) {
    results.push(await check(id));
    await new Promise((r) => setTimeout(r, 40));
  }
  const bad = results.filter((r) => r.status !== 200);
  console.log("\nBroken (" + bad.length + "):");
  bad.forEach((b) => console.log(" ", b.id, b.status));
  const ok = results.filter((r) => r.status === 200);
  console.log("\nWorking:", ok.length);
})();
