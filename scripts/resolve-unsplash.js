const slugs = [
  "jaH3QF46gAY", // Moscow St Basil
  "1K8pWXiRyIA", // Moscow St Basil alt
  "OkiDIla7K8Q", // Rio Christ
  "CErddu-JwKw", // Rio Christ alt
  "aUXsL7rDOcw", // Rio aerial
  "dZd4XWMiM9g", // Oman mosque
  "n8MmkmHcR3Y", // Oman aerial
  "syADksVMrKk", // Oman camel/desert
  "SVVTZtTGyaU", // NYC skyline
  "dVCGpKZB_E8", // NYC Williamsburg
  "wOj5odhDOZ0", // NYC DUMBO
  "IA8FR0RyJDE", // NYC cityscape
  "photo-1561117937-45681fb935ad",
  "photo-1700919816978-82de9d9474f4",
];

async function resolve(slug) {
  if (slug.startsWith("photo-")) {
    const url = `https://images.unsplash.com/${slug}?auto=format&fit=crop&w=100&q=80`;
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { slug, id: slug, status: r.status };
  }
  const page = await fetch(`https://unsplash.com/photos/${slug}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const html = await page.text();
  const m = html.match(/images\.unsplash\.com\/(photo-[^"?]+)/);
  if (!m) return { slug, id: null, status: "NO_MATCH" };
  const id = m[1];
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=100&q=80`;
  const r = await fetch(url, { method: "HEAD", redirect: "follow" });
  return { slug, id, status: r.status };
}

(async () => {
  for (const slug of slugs) {
    console.log(await resolve(slug));
    await new Promise((r) => setTimeout(r, 200));
  }
})();
