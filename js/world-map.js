(function () {
  const HYDERABAD = { lat: 17.385, lng: 78.487 };

  const GEO = {
    Bali: { lat: -8.34, lng: 115.09 },
    Maldives: { lat: 3.2, lng: 73.22 },
    Dubai: { lat: 25.2, lng: 55.27 },
    Greece: { lat: 37.98, lng: 23.73 },
    Japan: { lat: 35.68, lng: 139.69 },
    Turkey: { lat: 41.01, lng: 28.98 },
    Kenya: { lat: -1.29, lng: 36.82 },
    "New Zealand": { lat: -41.29, lng: 174.78 },
    Portugal: { lat: 38.72, lng: -9.14 },
    Poland: { lat: 52.23, lng: 21.01 },
    "South Africa": { lat: -33.92, lng: 18.42 },
    Egypt: { lat: 30.04, lng: 31.24 },
    Seychelles: { lat: -4.62, lng: 55.45 },
    Europe: { lat: 48.86, lng: 2.35 },
    Singapore: { lat: 1.35, lng: 103.82 },
    "Singapore & Malaysia": { lat: 1.35, lng: 103.82 },
    Montenegro: { lat: 42.43, lng: 19.26 },
    "South Korea": { lat: 37.57, lng: 126.98 },
    Switzerland: { lat: 46.95, lng: 7.45 },
    Spain: { lat: 40.42, lng: -3.7 },
    Mauritius: { lat: -20.16, lng: 57.5 },
    Bhutan: { lat: 27.47, lng: 89.64 },
    Laos: { lat: 19.86, lng: 102.5 },
    Madagascar: { lat: -18.91, lng: 47.52 },
    Nordics: { lat: 59.33, lng: 18.07 },
    England: { lat: 51.51, lng: -0.13 },
    "Italy & Monaco": { lat: 41.9, lng: 12.5 },
    Rajasthan: { lat: 26.91, lng: 75.79 },
    Kerala: { lat: 10.02, lng: 76.28 },
    Ladakh: { lat: 34.15, lng: 77.58 },
    Kashmir: { lat: 34.08, lng: 74.8 },
    Coorg: { lat: 12.42, lng: 75.74 },
    Varanasi: { lat: 25.32, lng: 83.01 },
    Uttarakhand: { lat: 30.09, lng: 78.27 },
    "Dwarka & Rameswaram": { lat: 22.24, lng: 68.97 },
    Ujjain: { lat: 23.18, lng: 75.77 },
    Spiti: { lat: 32.25, lng: 78.05 },
    "Western Ghats": { lat: 15.5, lng: 73.83 },
    Kutch: { lat: 23.73, lng: 69.86 },
    Meghalaya: { lat: 25.58, lng: 91.89 },
    Himachal: { lat: 32.24, lng: 77.19 },
    Karnataka: { lat: 15.32, lng: 75.71 },
    Rishikesh: { lat: 30.09, lng: 78.27 },
    Kolkata: { lat: 22.57, lng: 88.36 },
    "Goa & the Konkan": { lat: 15.3, lng: 74.12 },
    India: { lat: 20.59, lng: 78.96 },
    Hyderabad: { lat: 17.385, lng: 78.487 },
    Leh: { lat: 34.15, lng: 77.58 },
    Manali: { lat: 32.24, lng: 77.19 },
    Tokyo: { lat: 35.68, lng: 139.69 },
    Bangkok: { lat: 13.76, lng: 100.5 },
    Paris: { lat: 48.86, lng: 2.35 },
    Sydney: { lat: -33.87, lng: 151.21 },
    Kathmandu: { lat: 27.72, lng: 85.32 },
  };

  const LOCATION_GEO = {
    Ubud: GEO.Bali,
    Uluwatu: GEO.Bali,
    Athens: GEO.Greece,
    Mykonos: GEO.Greece,
    Santorini: GEO.Greece,
    Istanbul: GEO.Turkey,
    Cappadocia: { lat: 38.64, lng: 34.83 },
    Bodrum: { lat: 37.03, lng: 27.43 },
    Tokyo: GEO.Tokyo,
    Kyoto: { lat: 35.01, lng: 135.77 },
    Osaka: { lat: 34.69, lng: 135.5 },
    Leh: GEO.Leh,
    Jaipur: GEO.Rajasthan,
    Udaipur: { lat: 24.58, lng: 73.68 },
    Kochi: GEO.Kerala,
    Alleppey: { lat: 9.49, lng: 76.33 },
    Varanasi: GEO.Varanasi,
    Rishikesh: GEO.Rishikesh,
    Srinagar: GEO.Kashmir,
    Manali: GEO.Manali,
    Coorg: GEO.Coorg,
  };

  let mapInstance = null;
  let pinLayers = [];
  let conciergeApi = null;

  function geoForJourney(j) {
    if (j.mapPin) return { ...j.mapPin, label: j.country };
    if (GEO[j.country]) return { ...GEO[j.country], label: j.country };
    const loc = j.locations && j.locations[0];
    if (loc && LOCATION_GEO[loc]) return { ...LOCATION_GEO[loc], label: j.country };
    if (j.region === "India") return { lat: 20.59, lng: 78.96, label: j.country };
    return null;
  }

  function buildPins() {
    const home = window.LOOP?.home || {};
    const highlightIds = new Set([
      ...(home.indiaStrip || []),
      ...(home.worldHighlights || [
        "tropical-heaven-bali",
        "dreamy-maldives",
        "jewel-of-the-desert",
        "gorgeous-greece",
        "cherry-blossom-country",
        "turkey",
      ]),
    ]);

    const journeys = (window.LOOP?.journeys || []).filter((j) => {
      if (highlightIds.has(j.id)) return true;
      if (j.featured) return true;
      return false;
    });

    const byKey = new Map();
    journeys.forEach((j) => {
      const geo = geoForJourney(j);
      if (!geo) return;
      const key = `${geo.lat.toFixed(1)}:${geo.lng.toFixed(1)}`;
      const existing = byKey.get(key);
      if (!existing || j.featured || highlightIds.has(j.id)) {
        byKey.set(key, { journey: j, geo, isIndia: j.region === "India" });
      }
    });

    return [...byKey.values()];
  }

  function pinIcon(isIndia, active) {
    return L.divIcon({
      className: "loop-map-pin-wrap",
      html: `<span class="loop-map-pin${isIndia ? " loop-map-pin--india" : ""}${active ? " is-active" : ""}" aria-hidden="true"><span class="loop-map-pin-shadow"></span><span class="loop-map-pin-core"></span><span class="loop-map-pin-ring"></span><span class="loop-map-pin-glow"></span></span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  function homeIcon() {
    return L.divIcon({
      className: "loop-map-home-wrap",
      html: `<span class="loop-map-home" aria-hidden="true"><span class="loop-map-home-ring"></span><span class="loop-map-home-core"></span></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }

  function conciergeQuery(j) {
    return `Packages in ${j.country} — show from-prices and trip details for ${j.title}`;
  }

  function showConcierge(j) {
    const wrap = document.getElementById("map-concierge-wrap");
    if (wrap) wrap.classList.add("is-visible");
    if (conciergeApi) conciergeApi.ask(conciergeQuery(j));
    wrap?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function setActivePin(journeyId) {
    pinLayers.forEach(({ marker, journey }) => {
      const active = journey.id === journeyId;
      marker.setIcon(pinIcon(journey.region === "India", active));
      marker.setZIndexOffset(active ? 1000 : 0);
    });
  }

  function addRasterBase(map) {
    // English labels worldwide — OSM-based tiles show local scripts (Urdu, Devanagari, etc.)
    const esriBase = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
        attribution:
          '&copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    const esriLabels = L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 16, pane: "overlayPane" }
    );
    const wikimedia = L.tileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use" target="_blank" rel="noopener">Wikimedia</a>',
    });

    esriBase.addTo(map);
    esriLabels.addTo(map);

    let switched = false;
    esriBase.on("tileerror", () => {
      if (switched) return;
      switched = true;
      map.removeLayer(esriBase);
      map.removeLayer(esriLabels);
      wikimedia.addTo(map);
    });

    return { esriBase, esriLabels };
  }

  function initMap(container) {
    if (typeof L === "undefined") return null;

    const map = L.map(container, {
      center: [22, 68],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
      worldCopyJump: true,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    addRasterBase(map);

    L.marker([HYDERABAD.lat, HYDERABAD.lng], {
      icon: homeIcon(),
      zIndexOffset: 500,
    })
      .addTo(map)
      .bindTooltip("India desk · Hyderabad", {
        direction: "top",
        offset: [0, -10],
        className: "loop-map-tooltip loop-map-tooltip--home",
      });

    const pins = buildPins();
    pinLayers = pins.map(({ journey, geo }) => {
      const marker = L.marker([geo.lat, geo.lng], {
        icon: pinIcon(journey.region === "India", false),
        title: `${journey.title} · ${journey.country}`,
      }).addTo(map);

      marker.bindTooltip(`<strong>${journey.country}</strong><br>${journey.title}`, {
        direction: "top",
        offset: [0, -10],
        className: "loop-map-tooltip",
      });

      marker.on("click", () => {
        setActivePin(journey.id);
        map.flyTo([geo.lat, geo.lng], Math.max(map.getZoom(), 4), { duration: 0.8 });
        showConcierge(journey);
      });

      return { marker, journey, geo };
    });

    map.on("click", () => setActivePin(null));

    const viewport = container.closest(".world-map-viewport");
    if (viewport) {
      viewport.addEventListener("mouseenter", () => map.scrollWheelZoom.enable());
      viewport.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
    }

    return map;
  }

  function bindControls(root, mapEl) {
    const shell = root.querySelector(".world-map-shell");
    const expandBtn = root.querySelector("[data-map-expand]");
    const zoomIn = root.querySelector("[data-map-zoom-in]");
    const zoomOut = root.querySelector("[data-map-zoom-out]");

    expandBtn?.addEventListener("click", () => {
      const expanded = shell.classList.toggle("is-expanded");
      expandBtn.setAttribute("aria-pressed", expanded ? "true" : "false");
      expandBtn.textContent = expanded ? "Collapse map" : "Expand map";
      setTimeout(() => mapInstance?.invalidateSize(), 320);
    });

    zoomIn?.addEventListener("click", () => mapInstance?.zoomIn());
    zoomOut?.addEventListener("click", () => mapInstance?.zoomOut());

    mapEl.addEventListener("wheel", (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
    }, { passive: false });
  }

  function renderWorldMap() {
    const root = document.getElementById("world-map-root");
    if (!root) return;

    root.innerHTML = `
      <div class="world-map-shell">
        <div class="world-map-toolbar">
          <span class="world-map-legend">
            <span class="world-map-legend-item"><i class="loop-map-pin loop-map-pin--india is-static"></i> India packages</span>
            <span class="world-map-legend-item"><i class="loop-map-pin is-static"></i> International packages</span>
          </span>
          <div class="world-map-tools">
            <button type="button" class="world-map-tool" data-map-zoom-out" aria-label="Zoom out">−</button>
            <button type="button" class="world-map-tool" data-map-zoom-in aria-label="Zoom in">+</button>
            <button type="button" class="world-map-tool world-map-tool--expand" data-map-expand aria-pressed="false">Expand map</button>
          </div>
        </div>
        <div class="world-map-viewport">
          <div id="world-map-canvas" class="world-map-canvas"></div>
        </div>
      </div>
      <div class="map-concierge-wrap" id="map-concierge-wrap">
        <div class="map-concierge-head">
          <p class="eyebrow">Loop Concierge</p>
          <h3>Packages for this place</h3>
        </div>
        <div class="map-concierge-body">
          <div id="map-concierge-stage" class="map-concierge-stage"></div>
          <form id="map-concierge-form" class="map-concierge-form">
            <label class="sr-only" for="map-concierge-input">Ask the concierge</label>
            <input id="map-concierge-input" type="text" autocomplete="off" placeholder="Refine — cheaper, shorter, more Indian…">
            <button class="btn btn-fill" type="submit">Ask</button>
          </form>
        </div>
      </div>`;

    if (window.LoopConcierge) {
      conciergeApi = window.LoopConcierge.create({
        stage: "#map-concierge-stage",
        form: "#map-concierge-form",
        input: "#map-concierge-input",
        compact: true,
      });
    }

    const canvas = document.getElementById("world-map-canvas");
    if (canvas) {
      mapInstance = initMap(canvas);
      bindControls(root, canvas);
      setTimeout(() => mapInstance?.invalidateSize(), 80);
    }
  }

  window.renderWorldMap = renderWorldMap;
})();
