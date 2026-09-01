(function (global) {
  const ORIGIN = "https://looptrips.in";
  const OG_IMAGE = `${ORIGIN}/img/og-default.png`;
  const SITE_NAME = "Loop Trips";

  const BRAND = {
    name: "Loop Trips",
    phone: "+91 99511 39299",
    email: "concierge@looptrips.com",
    address: "Hitech City, Madhapur, Hyderabad, Telangana 500081",
    city: "Hyderabad",
    instagram: "https://instagram.com/LOOPTRIPS.IN",
    instagramHandle: "@LOOPTRIPS.IN",
  };

  const COLLECTION_SEO = {
    sanatan: {
      title: "Char Dham, Kashi & Temple Yatras from Hyderabad | Sanatan — Loop Trips",
      description:
        "Sanatan journeys from Loop Trips, Hyderabad. Char Dham, Kashi, Dwarka, Rameswaram, Ujjain — darshan timed, not temple tourism. From ₹30,000.",
      path: "/sanatan",
    },
    biker: {
      title: "Manali to Leh & Spiti Bike Trips from Hyderabad | Biker — Loop Trips",
      description:
        "Biker journeys from Loop Trips, Hyderabad. Manali–Leh, Spiti, Western Ghats, Thar — captain, mechanic, support vehicle. From ₹30,000.",
      path: "/biker",
    },
    community: {
      title: "Solo-friendly Community Trips — Coorg, Kutch, Meghalaya | Loop Trips",
      description:
        "Community circles from Loop Trips. Solo seats at a real table — Coorg, Kutch, Meghalaya. Never more than ten. From ₹30,000 / person.",
      path: "/community",
    },
    solo: {
      title: "Solo Travel Packages from Hyderabad — Himachal, Kerala, Gokarna | Loop Trips",
      description:
        "Solo journeys from Loop Trips, Hyderabad. Himachal, Kerala, Gokarna — single occupancy as default. Private itineraries from ₹30,000.",
      path: "/solo",
    },
    surprise: {
      title: "Surprise Destination Trips from Hyderabad — India from ₹30,000 | Loop Trips",
      description:
        "Surprise journeys from Loop Trips, Hyderabad. You pick the month and rooms — the place opens 48 hours before you fly. From ₹30,000.",
      path: "/surprise",
    },
    group: {
      title: "Private Group Trips from Hyderabad — 8 to 24 Guests | Loop Trips",
      description:
        "Group journeys from Loop Trips, Hyderabad. Haveli, Konkan house, Himalayan ridge — one person books, everyone arrives. From ₹30,000.",
      path: "/group",
    },
  };

  const PAGE_PATHS = {
    "/": { changefreq: "weekly", priority: "1.0" },
    "/journeys": { changefreq: "weekly", priority: "0.9" },
    "/about": { changefreq: "monthly", priority: "0.7" },
    "/contact": { changefreq: "monthly", priority: "0.8" },
    "/book": { changefreq: "monthly", priority: "0.7" },
    "/concierge": { changefreq: "monthly", priority: "0.8" },
    "/affiliates": { changefreq: "monthly", priority: "0.5" },
    "/privacy": { changefreq: "yearly", priority: "0.3" },
    "/cancellation": { changefreq: "yearly", priority: "0.4" },
    "/refund": { changefreq: "yearly", priority: "0.4" },
    "/terms": { changefreq: "yearly", priority: "0.3" },
  };

  Object.values(COLLECTION_SEO).forEach((c) => {
    PAGE_PATHS[c.path] = { changefreq: "weekly", priority: "0.85" };
  });

  function normalizePath(pathname) {
    let path = pathname || "/";
    if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length) || "/";
    else if (path.endsWith(".html")) path = path.slice(0, -".html".length) || "/";
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path || "/";
  }

  function journeyIdFromLocation() {
    const path = normalizePath(location.pathname);
    const match = path.match(/^\/trip\/([^/]+)$/);
    if (match) return decodeURIComponent(match[1]);
    if (path === "/journey") {
      const id = new URLSearchParams(location.search).get("id");
      if (id) return id;
    }
    return null;
  }

  function canonicalPath() {
    const tripId = journeyIdFromLocation();
    if (tripId) return `/trip/${encodeURIComponent(tripId)}`;
    const path = normalizePath(location.pathname);
    return path === "/" ? "" : path;
  }

  function canonicalUrl(customPath) {
    const path = customPath != null ? customPath : canonicalPath();
    if (!path) return ORIGIN;
    return `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  }

  function tripPath(id) {
    return `/trip/${encodeURIComponent(id)}`;
  }

  function upsertLink(rel, href, attrs) {
    const head = document.head;
    let link = head.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      head.appendChild(link);
    }
    link.href = href;
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value != null) link.setAttribute(key, value);
    });
    return link;
  }

  function upsertMeta(selector, attrs) {
    const head = document.head;
    let node = head.querySelector(selector);
    if (!node) {
      node = document.createElement("meta");
      head.appendChild(node);
    }
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function setMetaDescription(content) {
    if (!content) return;
    upsertMeta('meta[name="description"]', { name: "description", content });
  }

  function setCanonical(url) {
    upsertLink("canonical", url);
  }

  function setOg({ title, description, url, image, type }) {
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type || "website" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_IN" });
    if (title) upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    if (description) upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    if (url) upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    if (image) upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
  }

  function setTwitter({ title, description, image }) {
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    if (title) upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    if (description) upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    if (image) upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
  }

  function removeJsonLd(id) {
    document.querySelectorAll(`script[type="application/ld+json"][data-seo-id="${id}"]`).forEach((n) => n.remove());
  }

  function setJsonLd(id, data) {
    removeJsonLd(id);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-id", id);
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function formatInr(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  }

  function brandFromLoop() {
    const b = global.LOOP && global.LOOP.brand ? global.LOOP.brand : {};
    return {
      name: b.house || BRAND.name,
      phone: b.phone || BRAND.phone,
      email: b.email || BRAND.email,
      address: b.addressFull || BRAND.address,
      city: b.city || BRAND.city,
      instagram: b.instagram || BRAND.instagram,
      instagramHandle: b.instagramHandle || BRAND.instagramHandle,
      whatsappLink: b.whatsappLink || "https://wa.me/919951139299",
    };
  }

  function applyOrganizationSchema() {
    const b = brandFromLoop();
    setJsonLd("organization", {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${ORIGIN}/#organization`,
          name: b.name,
          url: ORIGIN,
          logo: `${ORIGIN}/img/logo.png`,
          email: b.email,
          telephone: b.phone,
          sameAs: [b.instagram],
        },
        {
          "@type": "TravelAgency",
          "@id": `${ORIGIN}/#travel-agency`,
          name: b.name,
          url: ORIGIN,
          image: OG_IMAGE,
          telephone: b.phone,
          email: b.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Hitech City, Madhapur",
            addressLocality: b.city,
            addressRegion: "Telangana",
            postalCode: "500081",
            addressCountry: "IN",
          },
          areaServed: { "@type": "Country", name: "India" },
          priceRange: "₹₹₹",
          sameAs: [b.instagram],
        },
        {
          "@type": "WebSite",
          "@id": `${ORIGIN}/#website`,
          url: ORIGIN,
          name: b.name,
          publisher: { "@id": `${ORIGIN}/#organization` },
          inLanguage: "en-IN",
        },
      ],
    });
  }

  function applyBreadcrumbs(items) {
    setJsonLd("breadcrumbs", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  function applyFaqFromDom() {
    const root = document.querySelector("[data-seo-faq]");
    if (!root) return;
    const items = [...root.querySelectorAll("article")].map((article) => {
      const question = article.querySelector("h3")?.textContent?.trim();
      const answer = article.querySelector("p")?.textContent?.trim();
      return question && answer ? { question, answer } : null;
    }).filter(Boolean);
    if (!items.length) return;
    setJsonLd("faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  function pageMetaFromDocument() {
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.content || "";
    const url = canonicalUrl();
    return { title, description, url };
  }

  function applyDocumentMeta(overrides) {
    const base = pageMetaFromDocument();
    const title = overrides?.title || base.title;
    const description = overrides?.description || base.description;
    const url = overrides?.url || base.url;
    const image = overrides?.image || OG_IMAGE;
    if (overrides?.title) document.title = title;
    if (overrides?.description) setMetaDescription(description);
    setCanonical(url);
    setOg({ title, description, url, image, type: overrides?.type || "website" });
    setTwitter({ title, description, image });
    applyOrganizationSchema();
    applyFaqFromDom();
  }

  function applyFromDocument() {
    const robots = document.querySelector('meta[name="robots"]');
    if (robots && /noindex/i.test(robots.content || "")) return;

    const page = document.body?.dataset?.page;
    if (page === "journey" && journeyIdFromLocation()) return;
    if (page === "collection") return;

    applyDocumentMeta();
    applyFaqFromDom();
  }

  function applyCollection(collection) {
    if (!collection) return;
    const meta = COLLECTION_SEO[collection.id];
    const title = meta?.title || `${collection.name} — Loop Trips`;
    const description = meta?.description || document.querySelector('meta[name="description"]')?.content || "";
    const path = meta?.path || `/${collection.id}`;
    const url = `${ORIGIN}${path}`;
    applyDocumentMeta({ title, description, url, image: collection.image || OG_IMAGE });
    applyBreadcrumbs([
      { name: "Home", url: ORIGIN },
      { name: collection.name, url },
    ]);
    applyFaqFromDom();
  }

  function applyTrip(journey, collection) {
    if (!journey) return;
    const col = collection || { name: "Trips", href: "/journeys" };
    const colPath = COLLECTION_SEO[col.id]?.path || normalizePath(col.href || "/journeys");
    const priceLabel = journey.price ? formatInr(journey.price) : "";
    const title = priceLabel
      ? `${journey.title} · ${journey.country} — from ${priceLabel} | Loop Trips`
      : `${journey.title} · ${journey.country} — Loop Trips`;
    const description = (journey.blurb || journey.story || "").slice(0, 155);
    const url = `${ORIGIN}${tripPath(journey.id)}`;
    const image = journey.image || OG_IMAGE;

    applyDocumentMeta({ title, description, url, image });
    applyBreadcrumbs([
      { name: "Home", url: ORIGIN },
      { name: col.name, url: `${ORIGIN}${colPath.startsWith("/") ? colPath : `/${colPath}`}` },
      { name: journey.title, url },
    ]);

    setJsonLd("trip", {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TouristTrip",
          "@id": `${url}#trip`,
          name: journey.title,
          description: journey.story || journey.blurb,
          touristType: col.name,
          itinerary: {
            "@type": "ItemList",
            itemListElement: (journey.locations || []).map((place, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: place,
            })),
          },
          image,
          url,
        },
        {
          "@type": "Offer",
          "@id": `${url}#offer`,
          url,
          priceCurrency: "INR",
          price: journey.price,
          availability: "https://schema.org/InStock",
          seller: { "@id": `${ORIGIN}/#travel-agency` },
          eligibleRegion: { "@type": "Country", name: "India" },
        },
      ],
    });
  }

  global.LOOP_SEO = {
    ORIGIN,
    OG_IMAGE,
    SITE_NAME,
    COLLECTION_SEO,
    PAGE_PATHS,
    normalizePath,
    journeyIdFromLocation,
    canonicalPath,
    canonicalUrl,
    tripPath,
    tripUrl: (id) => `${ORIGIN}${tripPath(id)}`,
    applyFromDocument,
    applyDocumentMeta,
    applyCollection,
    applyTrip,
    applyFaqFromDom,
    applyOrganizationSchema,
    formatInr,
  };

  if (document.body) {
    if (document.body.dataset.page === "journey" && journeyIdFromLocation()) {
      /* app.js calls applyTrip after journey data loads */
    } else if (document.body.dataset.page === "collection") {
      /* app.js calls applyCollection after collection renders */
    } else {
      applyFromDocument();
    }
  } else {
    document.addEventListener("DOMContentLoaded", applyFromDocument);
  }
})(window);
