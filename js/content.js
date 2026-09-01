/**
 * Loop Trips CMS bridge
 * Merges admin overrides from localStorage (loop_cms) over data.js seed.
 * Profile contact (WhatsApp / Hyderabad / Instagram) is migrated onto old CMS stores.
 */
(function () {
  const KEY = "loop_cms";
  const PROFILE_VERSION = 5;

  /** Canonical desk profile — wins over stale CMS brand contact fields on migrate. */
  const PROFILE = {
    email: "looptripsindia@gmail.com",
    phone: "+91 99511 39299",
    phoneTel: "+919951139299",
    whatsapp: "+91 99511 39299",
    whatsappLink: "https://wa.me/919951139299",
    city: "Hyderabad",
    address: "Hitech City, Madhapur",
    addressFull: "Hitech City, Madhapur, Hyderabad, Telangana 500081",
    instagram: "https://instagram.com/LOOPTRIPS.IN",
    instagramHandle: "@LOOPTRIPS.IN",
    logoMark: "Bharat first · World beyond",
    tagline: "Bharat at the heart of every journey.",
    hours: "10:00–18:00 IST",
    license: "",
    iata: "",
    years: "",
    tripsBooked: "",
    rating: "",
    ratingLabel: "",
  };

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function digits(v) {
    return String(v || "").replace(/\D/g, "");
  }

  function telFromPhone(phone) {
    let d = digits(phone);
    if (d.length === 10) d = "91" + d;
    if (d.startsWith("0") && d.length === 11) d = "91" + d.slice(1);
    return d ? "+" + d : PROFILE.phoneTel;
  }

  function waFromPhone(phone) {
    return "https://wa.me/" + digits(telFromPhone(phone));
  }

  function syncContactDerived(brand) {
    if (!brand) return brand;
    const phone = brand.phone || brand.whatsapp || PROFILE.phone;
    brand.phone = phone;
    brand.whatsapp = brand.whatsapp || phone;
    brand.phoneTel = telFromPhone(phone);
    brand.whatsappLink = waFromPhone(phone);
    return brand;
  }

  function isStalePhone(brand) {
    const d = digits(brand && (brand.phone || brand.phoneTel || brand.whatsapp));
    if (!d) return true;
    if (d.includes("8045672100") || d === "918045672100" || d === "8045672100") return true;
    return false;
  }

  function loadCms() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      return data;
    } catch {
      return null;
    }
  }

  function saveCms(data) {
    data.version = data.version || 1;
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  function defaultHome() {
    return {
      indiaStrip: [
        "forts-and-palaces",
        "kashi-antarah",
        "high-road-leh",
        "backwater-spices",
        "valley-of-serenity",
        "durga-pujo",
        "himalayan-expedition",
        "coffee-capital",
      ],
      worldHighlights: [
        "tropical-heaven-bali",
        "dreamy-maldives",
        "jewel-of-the-desert",
        "gorgeous-greece",
        "cherry-blossom-country",
        "turkey",
        "steppe-almaty",
        "registan-silk",
        "caucasus-wine",
        "land-of-fire",
        "three-pearls",
        "silk-two-stans",
        "serengeti-zanzibar",
        "american-icons",
        "canadian-rockies",
        "rio-sambafloor",
        "inca-heartland",
        "reef-harbour",
        "imperial-russia",
      ],
    };
  }

  function snapshotFromSeed() {
    const brand = syncContactDerived({ ...clone(LOOP.brand || {}), ...PROFILE });
    return {
      version: 1,
      profileVersion: PROFILE_VERSION,
      updatedAt: new Date().toISOString(),
      brand,
      trust: clone(LOOP.trust || {}),
      team: clone(LOOP.team || []),
      reviews: clone(LOOP.reviews || []),
      gallery: clone(LOOP.gallery || []),
      collections: clone(LOOP.collections || []),
      journeys: clone(LOOP.journeys || []),
      home: defaultHome(),
      exclusions: clone(LOOP.exclusions || []),
      suites: clone(LOOP.suites || []),
      addons: clone(LOOP.addons || []),
    };
  }

  function migrateCms(cms) {
    if (!cms) return null;
    let changed = false;
    if (!cms.brand) {
      cms.brand = { ...PROFILE };
      changed = true;
    }

    const needsProfile =
      (cms.profileVersion || 0) < PROFILE_VERSION ||
      isStalePhone(cms.brand) ||
      /bengaluru|bangalore|lavelle|karnataka/i.test(
        `${cms.brand.city || ""} ${cms.brand.address || ""} ${cms.brand.addressFull || ""} ${cms.brand.license || ""} ${cms.brand.iata || ""}`
      );

    if (needsProfile) {
      cms.brand = {
        ...cms.brand,
        ...PROFILE,
        house: cms.brand.house || "Loop Trips",
        email: PROFILE.email,
        collection: cms.brand.collection || "Spice Route Luxe",
      };
      cms.brand = syncContactDerived(cms.brand);
      cms.trust = clone(LOOP.trust || {});
      if (Array.isArray(cms.team) && cms.team.some((m) => /Ananya|Vikram|Meera/.test(m.name || ""))) {
        cms.team = [];
      }
      cms.profileVersion = PROFILE_VERSION;
      changed = true;
    } else {
      const before = JSON.stringify(cms.brand);
      cms.brand = syncContactDerived(cms.brand);
      if (JSON.stringify(cms.brand) !== before) changed = true;
    }

    if (!cms.trust) {
      cms.trust = clone(LOOP.trust || {});
      changed = true;
    } else if (!(cms.trust.tripsBooked || "").trim() || !(cms.trust.iataNote || "").trim()) {
      /* Soft trust proof from seed — never invent rating / trip counts. */
      const seed = LOOP.trust || {};
      const t = cms.trust;
      cms.trust = {
        ...clone(seed),
        ...t,
        label: (t.label || "").trim() || seed.label,
        licenseNote: (t.licenseNote || "").trim() || seed.licenseNote,
        tripsBooked: (t.tripsBooked || "").trim() || seed.tripsBooked,
        tripsLabel: (t.tripsLabel || "").trim() || seed.tripsLabel || "",
        iataNote: (t.iataNote || "").trim() || seed.iataNote || "",
        rating: (t.rating || "").trim(),
      };
      changed = true;
    }

    if (!Array.isArray(cms.team)) {
      cms.team = clone(LOOP.team || []);
      changed = true;
    }
    if (!Array.isArray(cms.reviews)) {
      cms.reviews = clone(LOOP.reviews || []);
      changed = true;
    }
    if (!Array.isArray(cms.gallery)) {
      cms.gallery = clone(LOOP.gallery || []);
      changed = true;
    }
    if (!cms.home) {
      cms.home = defaultHome();
      changed = true;
    } else {
      const seedHighlights = defaultHome().worldHighlights;
      const merged = [...new Set([...(cms.home.worldHighlights || []), ...seedHighlights])];
      if (merged.length !== (cms.home.worldHighlights || []).length) {
        cms.home.worldHighlights = merged;
        changed = true;
      }
    }

    const seedJourneys = LOOP.journeys || [];
    if (Array.isArray(cms.journeys) && cms.journeys.length) {
      const byId = new Map(cms.journeys.map((j) => [j.id, j]));
      seedJourneys.forEach((j) => {
        if (!byId.has(j.id)) {
          byId.set(j.id, clone(j));
          changed = true;
        }
      });
      if (changed) cms.journeys = [...byId.values()];
    } else if (seedJourneys.length) {
      cms.journeys = clone(seedJourneys);
      changed = true;
    }

    if (changed) saveCms(cms);
    return cms;
  }

  function applyCms(cms) {
    if (!cms) {
      LOOP.home = LOOP.home || defaultHome();
      syncContactDerived(LOOP.brand);
      return;
    }
    if (cms.brand) Object.assign(LOOP.brand, syncContactDerived({ ...cms.brand }));
    if (cms.trust) LOOP.trust = cms.trust;
    if (Array.isArray(cms.team)) LOOP.team = cms.team;
    if (Array.isArray(cms.reviews)) LOOP.reviews = cms.reviews;
    if (Array.isArray(cms.gallery)) LOOP.gallery = cms.gallery;
    if (Array.isArray(cms.collections) && cms.collections.length) {
      LOOP.collections = cms.collections;
    }
    if (Array.isArray(cms.journeys) && cms.journeys.length) {
      LOOP.journeys = cms.journeys.map((j) => {
        j.currency = "INR";
        if (!j.collection) j.collection = "world";
        return j;
      });
    }
    if (cms.home) {
      LOOP.home = {
        indiaStrip: cms.home.indiaStrip || defaultHome().indiaStrip,
        worldHighlights: cms.home.worldHighlights || defaultHome().worldHighlights,
      };
    } else {
      LOOP.home = defaultHome();
    }
    if (Array.isArray(cms.exclusions) && cms.exclusions.length) {
      LOOP.exclusions = cms.exclusions;
    }
    if (Array.isArray(cms.suites) && cms.suites.length) {
      LOOP.suites = cms.suites;
    }
    if (Array.isArray(cms.addons) && cms.addons.length) {
      LOOP.addons = cms.addons;
    }
  }

  let cms = migrateCms(loadCms());
  applyCms(cms);

  LOOP.CMS = {
    KEY,
    PROFILE,
    PROFILE_VERSION,
    load: () => migrateCms(loadCms()),
    save: saveCms,
    snapshotFromSeed,
    defaultHome,
    apply: applyCms,
    syncContactDerived,
    telFromPhone,
    waFromPhone,
    hasOverrides: () => !!loadCms(),
  };
})();
