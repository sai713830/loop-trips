const fs = require("fs");
const s = fs.readFileSync("js/data.js", "utf8");
const skip = new Set(["sanatan", "biker", "community", "solo", "surprise", "group", "world"]);
const ids = [...s.matchAll(/^\s+id:\s*"([^"]+)"/gm)]
  .map((m) => m[1])
  .filter((id) => !skip.has(id));
console.log(JSON.stringify(ids, null, 2));
