/**
 * Loop Trips CMS bridge
 * Merges admin overrides from localStorage (loop_cms) over data.js seed.
 */
(function () {
  const KEY = "loop_cms";

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
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
      ],
    };
  }

  function snapshotFromSeed() {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      brand: clone(LOOP.brand || {}),
      collections: clone(LOOP.collections || []),
      journeys: clone(LOOP.journeys || []),
      home: defaultHome(),
      exclusions: clone(LOOP.exclusions || []),
      suites: clone(LOOP.suites || []),
      addons: clone(LOOP.addons || []),
    };
  }

  function applyCms(cms) {
    if (!cms) {
      LOOP.home = LOOP.home || defaultHome();
      return;
    }
    if (cms.brand) Object.assign(LOOP.brand, cms.brand);
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

  const cms = loadCms();
  applyCms(cms);

  LOOP.CMS = {
    KEY,
    load: loadCms,
    save: saveCms,
    snapshotFromSeed,
    defaultHome,
    apply: applyCms,
    hasOverrides: () => !!loadCms(),
  };
})();
