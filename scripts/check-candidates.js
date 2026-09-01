const candidates = {
  "uzbekistan-registan": "photo-1728565721640-117dd6969a17",
  "georgia-tbilisi": "photo-1555990793-da11153b2473",
  "mongolia-steppe": "photo-1506905925346-21bda4d32df4",
  "mongolia-alt": "photo-1464822759023-fed622ff2c3b",
  "angkor": "photo-1559592413-7cec4d0cae2b",
  "oman-desert": "photo-1546412414-e1885259563a",
  "oman-mosque": "photo-1518837695005-20830993ee35",
  "oman-alt": "photo-1586724237566-6a44a9f591c5",
  "petra": "photo-1572252009286-268acec5ca0a",
  "darvaza-fire": "photo-1578662996442-48f60103fc96",
  "nyc-1": "photo-1496442226666-8d0d0e62e049",
  "nyc-2": "photo-1485871981521-5b1fd3805eee",
  "nyc-3": "photo-1534430480872-20851798f212",
  "nyc-4": "photo-1498386641327-630a1091549e",
  "nyc-5": "photo-1514565131-fce0801ccc17",
  "grand-canyon": "photo-1501594907352-04cda38ebc29",
  "grand-canyon-2": "photo-1474040989526-69a7b612d3e9",
  "grand-canyon-3": "photo-1472214103451-9374bd1c798e",
  "rio-1": "photo-1516026672322-bc52d61a55d5",
  "rio-2": "photo-1547036967-19d6b9d5f238",
  "rio-3": "photo-1483729551939-6e8c3a2a01a9",
  "rio-4": "photo-1483728642382-8feb3d8a751f",
  "moscow-1": "photo-1520106212296-d4c8ec6a5708",
  "moscow-2": "photo-1556610961-5fe0d0b5e1ea",
  "moscow-3": "photo-1523940494085-550fa17477e1",
  "moscow-4": "photo-1513326738677-b964663b456d",
  "moscow-5": "photo-1502602898657-3e91760cbb34",
  "samarkand-2": "photo-1555881400-74d7acaacd8b",
  "armenia": "photo-1605649487212-47bdab064df7",
  "baku": "photo-1613395877344-13d4a8e0d49e",
};

async function check(id) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=100&q=80`;
  const r = await fetch(url, { method: "HEAD", redirect: "follow" });
  return r.status;
}

(async () => {
  for (const [name, id] of Object.entries(candidates)) {
    const status = await check(id);
    console.log(status === 200 ? "OK" : "FAIL", name, id, status);
    await new Promise((r) => setTimeout(r, 40));
  }
})();
