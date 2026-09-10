/**
 * Destination-accurate image sets for Price-List 2026 packages.
 * Uses Unsplash IDs already proven in this repo.
 */
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "js", "data.js");
let src = fs.readFileSync(dataPath, "utf8");

const SHOTS = {
  "shimla-manali": {
    image: "photo-1626621341517-bbf3d9990a23",
    gallery: ["photo-1506905925346-21bda4d32df4", "photo-1464822759023-fed622ff2c3b", "photo-1544735716-392fe2489ffa"],
  },
  "manali-snowy-peaks": {
    image: "photo-1506905925346-21bda4d32df4",
    gallery: ["photo-1626621341517-bbf3d9990a23", "photo-1464822759023-fed622ff2c3b", "photo-1544735716-392fe2489ffa"],
  },
  "manali-kasol": {
    image: "photo-1464822759023-fed622ff2c3b",
    gallery: ["photo-1506905925346-21bda4d32df4", "photo-1626621341517-bbf3d9990a23", "photo-1544735716-392fe2489ffa"],
  },
  "coorg-chikmagalur": {
    image: "photo-1447933601403-0c6688de566e",
    gallery: ["photo-1442512595331-e89e73853f31", "photo-1506905925346-21bda4d32df4", "photo-1602216056096-3b40cc0c9944"],
  },
  "arunachalam-pondicherry": {
    image: "photo-1582510003544-4d00b7f74220",
    gallery: ["photo-1507525428034-b723cf961d3e", "photo-1559827260-dc66d52bef19", "photo-1524492412937-b28074a5d7da"],
  },
  "ooty-coonoor-mysore": {
    image: "photo-1602216056096-3b40cc0c9944",
    gallery: ["photo-1447933601403-0c6688de566e", "photo-1477587458883-47145ed94245", "photo-1506905925346-21bda4d32df4"],
  },
  "ooty-isha": {
    image: "photo-1602216056096-3b40cc0c9944",
    gallery: ["photo-1447933601403-0c6688de566e", "photo-1582510003544-4d00b7f74220", "photo-1506905925346-21bda4d32df4"],
  },
  "goa-gokarna": {
    image: "photo-1507525428034-b723cf961d3e",
    gallery: ["photo-1559827260-dc66d52bef19", "photo-1514282401047-d79a71a590e8", "photo-1507525428034-b723cf961d3e"],
  },
  "goa-coast": {
    image: "photo-1559827260-dc66d52bef19",
    gallery: ["photo-1507525428034-b723cf961d3e", "photo-1514282401047-d79a71a590e8", "photo-1559827260-dc66d52bef19"],
  },
  "gokarna-dandeli": {
    image: "photo-1507525428034-b723cf961d3e",
    gallery: ["photo-1559827260-dc66d52bef19", "photo-1447933601403-0c6688de566e", "photo-1544735716-392fe2489ffa"],
  },
  "gokarna-dandeli-plus": {
    image: "photo-1559827260-dc66d52bef19",
    gallery: ["photo-1507525428034-b723cf961d3e", "photo-1447933601403-0c6688de566e", "photo-1544735716-392fe2489ffa"],
  },
  "gokarna-hampi": {
    image: "photo-1507525428034-b723cf961d3e",
    gallery: ["photo-1524492412937-b28074a5d7da", "photo-1559827260-dc66d52bef19", "photo-1582510003544-4d00b7f74220"],
  },
  "gokarna-udupi": {
    image: "photo-1507525428034-b723cf961d3e",
    gallery: ["photo-1559827260-dc66d52bef19", "photo-1582510003544-4d00b7f74220", "photo-1524492412937-b28074a5d7da"],
  },
  "munnar-hills": {
    image: "photo-1602216056096-3b40cc0c9944",
    gallery: ["photo-1593693397690-362cb9666fc2", "photo-1447933601403-0c6688de566e", "photo-1506905925346-21bda4d32df4"],
  },
  "wayanad-green": {
    image: "photo-1602216056096-3b40cc0c9944",
    gallery: ["photo-1447933601403-0c6688de566e", "photo-1544735716-392fe2489ffa", "photo-1506905925346-21bda4d32df4"],
  },
  "thailand-escape": {
    image: "photo-1552465011-b4e21bf6e79a",
    gallery: ["photo-1508009603885-50cf7c579365", "photo-1528183429752-a97d0bf99b5a", "photo-1507525428034-b723cf961d3e"],
  },
  "rajasthan-trio": {
    image: "photo-1477587458883-47145ed94245",
    gallery: ["photo-1524492412937-b28074a5d7da", "photo-1599661046827-dacff0c0f09a", "photo-1603262110263-fb0112e7cc33"],
  },
  "hampi-heritage": {
    image: "photo-1524492412937-b28074a5d7da",
    gallery: ["photo-1582510003544-4d00b7f74220", "photo-1599661046827-dacff0c0f09a", "photo-1603262110263-fb0112e7cc33"],
  },
  "lonavala-escape": {
    image: "photo-1506905925346-21bda4d32df4",
    gallery: ["photo-1464822759023-fed622ff2c3b", "photo-1447933601403-0c6688de566e", "photo-1544735716-392fe2489ffa"],
  },
  "andaman-islands": {
    image: "photo-1559827260-dc66d52bef19",
    gallery: ["photo-1507525428034-b723cf961d3e", "photo-1514282401047-d79a71a590e8", "photo-1559827260-dc66d52bef19"],
  },
  "lakshadweep-isles": {
    image: "photo-1514282401047-d79a71a590e8",
    gallery: ["photo-1507525428034-b723cf961d3e", "photo-1559827260-dc66d52bef19", "photo-1514282401047-d79a71a590e8"],
  },
  "ladakh-ex-leh": {
    image: "photo-1626621341517-bbf3d9990a23",
    gallery: ["photo-1506905925346-21bda4d32df4", "photo-1581793745862-99fde7fa73d2", "photo-1544735716-392fe2489ffa"],
  },
  "pondicherry-mangrove": {
    image: "photo-1507525428034-b723cf961d3e",
    gallery: ["photo-1559827260-dc66d52bef19", "photo-1582510003544-4d00b7f74220", "photo-1447933601403-0c6688de566e"],
  },
  "meghalaya-explore": {
    image: "photo-1544735716-392fe2489ffa",
    gallery: ["photo-1506905925346-21bda4d32df4", "photo-1602216056096-3b40cc0c9944", "photo-1464822759023-fed622ff2c3b"],
  },
  "kashmir-dal": {
    image: "photo-1595815771614-ade9d652a65d",
    gallery: ["photo-1626621341517-bbf3d9990a23", "photo-1506905925346-21bda4d32df4", "photo-1464822759023-fed622ff2c3b"],
  },
  "kerala-ex-kochi-5n": {
    image: "photo-1602216056096-3b40cc0c9944",
    gallery: ["photo-1593693397690-362cb9666fc2", "photo-1582510003544-4d00b7f74220", "photo-1507525428034-b723cf961d3e"],
  },
  "kerala-ex-kochi-4n": {
    image: "photo-1593693397690-362cb9666fc2",
    gallery: ["photo-1602216056096-3b40cc0c9944", "photo-1507525428034-b723cf961d3e", "photo-1582510003544-4d00b7f74220"],
  },
};

function patchPackage(id, shots) {
  const re = new RegExp(
    `(id: "${id}"[\\s\\S]*?image: )U\\("[^"]+"\\)([\\s\\S]*?gallery: )\\[[^\\]]*\\]`,
    "m"
  );
  if (!re.test(src)) {
    console.warn("skip", id);
    return;
  }
  const gal = shots.gallery.map((g) => `U("${g}")`).join(", ");
  src = src.replace(re, `$1U("${shots.image}")$2[${gal}]`);
  console.log("patched images", id);
}

Object.entries(SHOTS).forEach(([id, shots]) => patchPackage(id, shots));
fs.writeFileSync(dataPath, src);
console.log("done");
