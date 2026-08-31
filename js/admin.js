(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const REGIONS = ["India", "Europe", "Africa", "Asia", "Islands", "Middle East", "Oceania"];
  const STATUSES = ["Open", "Limited", "Seasonal", "Closed"];
  const COLLECTIONS = ["world", "sanatan", "biker", "community", "solo", "surprise", "group"];

  let state = {
    view: "packages",
    editingId: null,
    filter: { q: "", region: "", collection: "" },
    cms: null,
  };

  function toast(msg, err) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.toggle("err", !!err);
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function money(n) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);
  }

  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
  }

  function linesToList(text) {
    return String(text || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function listToLines(arr) {
    return (arr || []).join("\n");
  }

  function ensureCms() {
    let cms = LOOP.CMS.load();
    if (!cms) {
      cms = LOOP.CMS.snapshotFromSeed();
      LOOP.CMS.save(cms);
    }
    if (!cms.home) cms.home = LOOP.CMS.defaultHome();
    if (!cms.brand) cms.brand = { ...LOOP.CMS.PROFILE };
    cms.brand = LOOP.CMS.syncContactDerived(cms.brand);
    if (!cms.trust) cms.trust = JSON.parse(JSON.stringify(LOOP.trust || {}));
    if (!Array.isArray(cms.team)) cms.team = [];
    if (!Array.isArray(cms.reviews)) cms.reviews = JSON.parse(JSON.stringify(LOOP.reviews || []));
    if (!Array.isArray(cms.gallery)) cms.gallery = JSON.parse(JSON.stringify(LOOP.gallery || []));
    state.cms = cms;
    LOOP.CMS.apply(cms);
    return cms;
  }

  function normalizeBrandFromForm(form) {
    const phone = form.phone.value.trim() || LOOP.CMS.PROFILE.phone;
    const brand = {
      ...state.cms.brand,
      house: form.house.value.trim() || "Loop Trips",
      collection: form.collection.value.trim(),
      tagline: form.tagline.value.trim(),
      logoMark: form.logoMark.value.trim(),
      phone,
      whatsapp: form.whatsapp.value.trim() || phone,
      email: form.email.value.trim(),
      city: form.city.value.trim(),
      address: form.address.value.trim(),
      addressFull: form.addressFull.value.trim(),
      hours: form.hours.value.trim(),
      instagram: form.instagram.value.trim(),
      instagramHandle: form.instagramHandle.value.trim(),
      license: form.license.value.trim(),
      iata: form.iata.value.trim(),
      years: form.years.value.trim(),
    };
    return LOOP.CMS.syncContactDerived(brand);
  }

  function persist() {
    LOOP.CMS.save(state.cms);
    LOOP.CMS.apply(state.cms);
    toast("Saved — public site will show this on refresh");
  }

  function durationLabel(days, nights) {
    const d = Number(days) || 1;
    const n = nights != null && nights !== "" ? Number(nights) : Math.max(0, d - 1);
    return `${d} Day${d === 1 ? "" : "s"} · ${n} Night${n === 1 ? "" : "s"}`;
  }

  function blankJourney() {
    return {
      id: "",
      title: "",
      country: "",
      locations: [],
      duration: "7 Days · 6 Nights",
      days: 7,
      nights: 6,
      pax: 2,
      price: 50000,
      currency: "INR",
      region: "India",
      theme: "Heritage",
      collection: "world",
      status: "Open",
      featured: false,
      image: "",
      gallery: [],
      blurb: "",
      story: "",
      highlights: [],
      inclusions: [],
      itinerary: [{ day: "01", title: "", text: "" }],
      bestTime: "",
    };
  }

  async function logout() {
    try {
      await fetch("/api/admin-logout", { method: "POST", credentials: "same-origin" });
    } catch {
      /* still redirect */
    }
    location.replace("/admin-gate.html");
  }

  function bindChrome() {
    $$("#nav button").forEach((b) => {
      b.onclick = () => setView(b.dataset.view);
    });
    const logoutBtn = $("#logout-btn");
    if (logoutBtn) logoutBtn.onclick = logout;
  }

  function boot() {
    ensureCms();
    bindChrome();
    render();
  }

  /* ——— Views ——— */
  function setView(view, editingId) {
    state.view = view;
    state.editingId = editingId || null;
    $$("#nav button").forEach((b) => b.classList.toggle("on", b.dataset.view === view));
    render();
  }

  function render() {
    const root = $("#view-root");
    if (state.view === "packages" && state.editingId !== null) {
      root.innerHTML = renderPackageEditor(
        state.editingId === "__new__"
          ? blankJourney()
          : state.cms.journeys.find((j) => j.id === state.editingId) || blankJourney()
      );
      bindPackageEditor();
      return;
    }
    const map = {
      packages: renderPackagesList,
      collections: renderCollections,
      brand: renderBrand,
      home: renderHome,
      bookings: renderBookings,
      settings: renderSettings,
      live: renderLive,
    };
    root.innerHTML = (map[state.view] || renderPackagesList)();
    bindView();
  }

  function renderPackagesList() {
    const { q, region, collection } = state.filter;
    let list = [...state.cms.journeys];
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((j) =>
        `${j.title} ${j.country} ${j.region} ${j.collection} ${(j.locations || []).join(" ")}`
          .toLowerCase()
          .includes(needle)
      );
    }
    if (region) list = list.filter((j) => j.region === region);
    if (collection) list = list.filter((j) => j.collection === collection);

    return `
      <div class="admin-top">
        <div>
          <h2>Packages</h2>
          <p>${state.cms.journeys.length} trips · ${list.length} shown · prices in ₹</p>
        </div>
        <div class="toolbar">
          <button class="btn btn-accent" type="button" id="btn-new-pkg">Add package</button>
        </div>
      </div>
      <div class="filters">
        <input id="f-q" type="search" placeholder="Search title, city…" value="${escapeAttr(q)}">
        <select id="f-region">
          <option value="">All regions</option>
          ${REGIONS.map((r) => `<option value="${r}" ${region === r ? "selected" : ""}>${r}</option>`).join("")}
        </select>
        <select id="f-collection">
          <option value="">All collections</option>
          ${COLLECTIONS.map((c) => `<option value="${c}" ${collection === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      ${
        list.length
          ? `<table class="pkg-table">
        <thead>
          <tr>
            <th>Trip</th>
            <th>Region</th>
            <th>From price</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map(
              (j) => `<tr>
              <td>
                <div class="title">${escapeHtml(j.title)}</div>
                <div class="meta">${escapeHtml(j.country)} · ${escapeHtml(j.collection || "world")}${j.featured ? " · featured" : ""}</div>
              </td>
              <td>${escapeHtml(j.region || "—")}</td>
              <td>${money(j.price)}</td>
              <td><span class="badge ${j.status === "Open" ? "on" : ""}">${escapeHtml(j.status || "—")}</span></td>
              <td class="actions">
                <button class="btn" type="button" data-edit="${escapeAttr(j.id)}">Edit</button>
                <a class="btn" href="/trip/${encodeURIComponent(j.id)}" target="_blank" rel="noopener">Preview</a>
                <button class="btn" type="button" data-dup="${escapeAttr(j.id)}">Duplicate</button>
                <button class="btn btn-danger" type="button" data-del="${escapeAttr(j.id)}">Delete</button>
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`
          : `<div class="empty">No packages match these filters.</div>`
      }`;
  }

  function renderPackageEditor(j) {
    const isNew = state.editingId === "__new__" || !j.id;
    return `
      <div class="editor-head">
        <div>
          <h2>${isNew ? "New package" : "Edit package"}</h2>
          <p>${isNew ? "Fill the trip details. Price is the from-floor in ₹." : escapeHtml(j.title)}</p>
        </div>
        <div class="toolbar">
          <button class="btn" type="button" id="btn-cancel-edit">Back</button>
          ${!isNew ? `<a class="btn" href="/trip/${encodeURIComponent(j.id)}" target="_blank" rel="noopener">Preview</a>` : ""}
          <button class="btn btn-accent" type="button" id="btn-save-pkg">Save package</button>
        </div>
      </div>
      <form id="pkg-form" class="card">
        <div class="grid-form">
          <div class="field">
            <label for="p-title">Title</label>
            <input id="p-title" required value="${escapeAttr(j.title)}">
          </div>
          <div class="field">
            <label for="p-id">ID (url slug)</label>
            <input id="p-id" required value="${escapeAttr(j.id)}" ${isNew ? "" : "readonly"}>
          </div>
          <div class="field">
            <label for="p-country">Country / place</label>
            <input id="p-country" required value="${escapeAttr(j.country)}">
          </div>
          <div class="field">
            <label for="p-theme">Theme</label>
            <input id="p-theme" value="${escapeAttr(j.theme || "")}">
          </div>
          <div class="field">
            <label for="p-region">Region</label>
            <select id="p-region">
              ${REGIONS.map((r) => `<option value="${r}" ${j.region === r ? "selected" : ""}>${r}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="p-collection">Collection</label>
            <select id="p-collection">
              ${COLLECTIONS.map((c) => `<option value="${c}" ${(j.collection || "world") === c ? "selected" : ""}>${c}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="p-days">Days</label>
            <input id="p-days" type="number" min="1" value="${j.days || 7}">
          </div>
          <div class="field">
            <label for="p-nights">Nights</label>
            <input id="p-nights" type="number" min="0" value="${j.nights != null ? j.nights : 6}">
          </div>
          <div class="field">
            <label for="p-price">From price (₹ / person)</label>
            <input id="p-price" type="number" min="0" step="1000" value="${j.price || 50000}">
          </div>
          <div class="field">
            <label for="p-status">Status</label>
            <select id="p-status">
              ${STATUSES.map((s) => `<option value="${s}" ${j.status === s ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="p-pax">Typical guests</label>
            <input id="p-pax" type="number" min="1" value="${j.pax || 2}">
          </div>
          <div class="field">
            <label for="p-best">Best time</label>
            <input id="p-best" value="${escapeAttr(j.bestTime || "")}">
          </div>
          <div class="field full check">
            <input id="p-featured" type="checkbox" ${j.featured ? "checked" : ""}>
            <label for="p-featured" style="text-transform:none;letter-spacing:0;font-size:1rem;color:inherit">Featured on homepage grids</label>
          </div>
          <div class="field full">
            <label for="p-locations">Cities / places (one per line)</label>
            <textarea id="p-locations">${escapeHtml(listToLines(j.locations))}</textarea>
          </div>
          <div class="field full">
            <label for="p-image">Hero image URL</label>
            <input id="p-image" value="${escapeAttr(j.image || "")}" placeholder="https://…">
          </div>
          <div class="field full">
            <label for="p-gallery">Gallery URLs (one per line)</label>
            <textarea id="p-gallery">${escapeHtml(listToLines(j.gallery))}</textarea>
          </div>
          <div class="field full">
            <label for="p-blurb">Short blurb (cards)</label>
            <textarea id="p-blurb">${escapeHtml(j.blurb || "")}</textarea>
          </div>
          <div class="field full">
            <label for="p-story">Story / description</label>
            <textarea id="p-story" style="min-height:140px">${escapeHtml(j.story || "")}</textarea>
          </div>
          <div class="field full">
            <label for="p-highlights">Highlights (one per line)</label>
            <textarea id="p-highlights">${escapeHtml(listToLines(j.highlights))}</textarea>
          </div>
          <div class="field full">
            <label for="p-inclusions">Inclusions (one per line)</label>
            <textarea id="p-inclusions">${escapeHtml(listToLines(j.inclusions))}</textarea>
          </div>
        </div>

        <div class="field full">
          <label>Day-by-day itinerary</label>
          <div class="list-block" id="itin-list">
            ${(j.itinerary || [{ day: "01", title: "", text: "" }])
              .map(
                (d, i) => `<div class="itin-row" data-i="${i}">
                <input class="itin-day" placeholder="01–02" value="${escapeAttr(d.day || "")}">
                <input class="itin-title" placeholder="Title" value="${escapeAttr(d.title || "")}">
                <input class="itin-text" placeholder="Description" value="${escapeAttr(d.text || "")}">
                <button class="btn btn-danger itin-del" type="button">Remove</button>
              </div>`
              )
              .join("")}
          </div>
          <button class="btn" type="button" id="itin-add">Add day block</button>
        </div>

        <div class="grid-form" style="margin-top:16px">
          <div class="field">
            <label for="p-seats">Seats left (community, optional)</label>
            <input id="p-seats" type="number" min="0" value="${j.seats != null ? j.seats : ""}" placeholder="—">
          </div>
          <div class="field">
            <label for="p-maxpax">Max guests (optional)</label>
            <input id="p-maxpax" type="number" min="1" value="${j.maxPax != null ? j.maxPax : ""}" placeholder="—">
          </div>
        </div>
      </form>`;
  }

  function readPackageForm() {
    const title = $("#p-title").value.trim();
    let id = $("#p-id").value.trim() || slugify(title);
    const days = Number($("#p-days").value) || 7;
    const nights = Number($("#p-nights").value);
    const itinerary = $$("#itin-list .itin-row").map((row) => ({
      day: $(".itin-day", row).value.trim(),
      title: $(".itin-title", row).value.trim(),
      text: $(".itin-text", row).value.trim(),
    })).filter((d) => d.day || d.title || d.text);

    const existing = state.cms.journeys.find((j) => j.id === state.editingId);
    const j = {
      ...(existing || {}),
      id,
      title,
      country: $("#p-country").value.trim(),
      locations: linesToList($("#p-locations").value),
      days,
      nights: Number.isFinite(nights) ? nights : Math.max(0, days - 1),
      duration: durationLabel(days, nights),
      pax: Number($("#p-pax").value) || 2,
      price: Number($("#p-price").value) || 0,
      currency: "INR",
      region: $("#p-region").value,
      theme: $("#p-theme").value.trim(),
      collection: $("#p-collection").value,
      status: $("#p-status").value,
      featured: $("#p-featured").checked,
      image: $("#p-image").value.trim(),
      gallery: linesToList($("#p-gallery").value),
      blurb: $("#p-blurb").value.trim(),
      story: $("#p-story").value.trim(),
      highlights: linesToList($("#p-highlights").value),
      inclusions: linesToList($("#p-inclusions").value),
      itinerary: itinerary.length ? itinerary : [{ day: "01", title: title, text: "" }],
      bestTime: $("#p-best").value.trim(),
    };

    const seats = $("#p-seats").value;
    const maxPax = $("#p-maxpax").value;
    if (seats !== "") j.seats = Number(seats);
    else delete j.seats;
    if (maxPax !== "") j.maxPax = Number(maxPax);
    else delete j.maxPax;

    return j;
  }

  function bindPackageEditor() {
    $("#btn-cancel-edit").onclick = () => setView("packages");
    $("#btn-save-pkg").onclick = () => {
      const j = readPackageForm();
      if (!j.title || !j.id) {
        toast("Title and ID are required", true);
        return;
      }
      if (state.editingId === "__new__") {
        if (state.cms.journeys.some((x) => x.id === j.id)) {
          toast("That ID already exists", true);
          return;
        }
        state.cms.journeys.push(j);
      } else {
        const idx = state.cms.journeys.findIndex((x) => x.id === state.editingId);
        if (idx < 0) state.cms.journeys.push(j);
        else state.cms.journeys[idx] = j;
      }
      persist();
      setView("packages");
    };

    $("#p-title").addEventListener("input", () => {
      if (state.editingId === "__new__" && !$("#p-id").dataset.touched) {
        $("#p-id").value = slugify($("#p-title").value);
      }
    });
    $("#p-id").addEventListener("input", () => {
      $("#p-id").dataset.touched = "1";
    });

    $("#itin-add").onclick = () => {
      const box = $("#itin-list");
      const i = box.children.length;
      const row = document.createElement("div");
      row.className = "itin-row";
      row.dataset.i = String(i);
      row.innerHTML = `
        <input class="itin-day" placeholder="01–02" value="">
        <input class="itin-title" placeholder="Title" value="">
        <input class="itin-text" placeholder="Description" value="">
        <button class="btn btn-danger itin-del" type="button">Remove</button>`;
      box.appendChild(row);
      $(".itin-del", row).onclick = () => row.remove();
    };
    $$(".itin-del").forEach((btn) => {
      btn.onclick = () => btn.closest(".itin-row").remove();
    });
  }

  function renderCollections() {
    return `
      <div class="admin-top">
        <div>
          <h2>Collections</h2>
          <p>Sanatan, Biker, Community, Solo, Surprise, Group — copy and hero image.</p>
        </div>
      </div>
      ${state.cms.collections
        .map(
          (c, idx) => `<form class="card col-form" data-idx="${idx}">
          <div class="editor-head">
            <h3 style="font-family:var(--serif);font-size:1.5rem;margin:0;font-weight:500">${escapeHtml(c.name)}</h3>
            <button class="btn btn-accent col-save" type="button">Save</button>
          </div>
          <div class="grid-form">
            <div class="field">
              <label>Kicker</label>
              <input name="kicker" value="${escapeAttr(c.kicker || "")}">
            </div>
            <div class="field">
              <label>Promise</label>
              <input name="promise" value="${escapeAttr(c.promise || "")}">
            </div>
            <div class="field full">
              <label>Lede</label>
              <textarea name="lede">${escapeHtml(c.lede || "")}</textarea>
            </div>
            <div class="field">
              <label>For whom</label>
              <textarea name="forWhom">${escapeHtml(c.forWhom || "")}</textarea>
            </div>
            <div class="field">
              <label>Not for</label>
              <textarea name="notFor">${escapeHtml(c.notFor || "")}</textarea>
            </div>
            <div class="field full">
              <label>Ritual lines (one per line)</label>
              <textarea name="ritual">${escapeHtml(listToLines(c.ritual))}</textarea>
            </div>
            <div class="field full">
              <label>Image URL</label>
              <input name="image" value="${escapeAttr(c.image || "")}">
            </div>
          </div>
        </form>`
        )
        .join("")}`;
  }

  function renderBrand() {
    const b = state.cms.brand || {};
    const t = state.cms.trust || {};
    return `
      <div class="admin-top">
        <div>
          <h2>Brand & desk</h2>
          <p>WhatsApp number, address, Instagram, tagline — what the public site shows.</p>
        </div>
        <div class="toolbar">
          <button class="btn" type="button" id="brand-profile">Apply profile defaults</button>
          <button class="btn btn-accent" type="button" id="brand-save">Save brand</button>
        </div>
      </div>
      <form class="card" id="brand-form">
        <div class="grid-form">
          <div class="field">
            <label>House name</label>
            <input name="house" value="${escapeAttr(b.house || "")}">
          </div>
          <div class="field">
            <label>Collection label</label>
            <input name="collection" value="${escapeAttr(b.collection || "")}">
          </div>
          <div class="field full">
            <label>Tagline</label>
            <input name="tagline" value="${escapeAttr(b.tagline || "")}">
          </div>
          <div class="field full">
            <label>Logo line (under Loop Trips)</label>
            <input name="logoMark" value="${escapeAttr(b.logoMark || "")}">
          </div>
          <div class="field">
            <label>WhatsApp / desk number</label>
            <input name="phone" value="${escapeAttr(b.phone || "")}" placeholder="+91 99511 39299">
          </div>
          <div class="field">
            <label>WhatsApp display (optional)</label>
            <input name="whatsapp" value="${escapeAttr(b.whatsapp || "")}" placeholder="Same as phone if blank">
          </div>
          <div class="field">
            <label>Email</label>
            <input name="email" value="${escapeAttr(b.email || "")}">
          </div>
          <div class="field">
            <label>Hours</label>
            <input name="hours" value="${escapeAttr(b.hours || "")}">
          </div>
          <div class="field">
            <label>City</label>
            <input name="city" value="${escapeAttr(b.city || "")}">
          </div>
          <div class="field">
            <label>Address (short)</label>
            <input name="address" value="${escapeAttr(b.address || "")}">
          </div>
          <div class="field full">
            <label>Full address (footer)</label>
            <input name="addressFull" value="${escapeAttr(b.addressFull || "")}">
          </div>
          <div class="field">
            <label>Instagram URL</label>
            <input name="instagram" value="${escapeAttr(b.instagram || "")}">
          </div>
          <div class="field">
            <label>Instagram handle</label>
            <input name="instagramHandle" value="${escapeAttr(b.instagramHandle || "")}">
          </div>
          <div class="field">
            <label>License (optional — leave blank if none)</label>
            <input name="license" value="${escapeAttr(b.license || "")}">
          </div>
          <div class="field">
            <label>IATA (optional — leave blank if none)</label>
            <input name="iata" value="${escapeAttr(b.iata || "")}">
          </div>
          <div class="field">
            <label>Years at desk (optional)</label>
            <input name="years" value="${escapeAttr(b.years || "")}" placeholder="Leave blank to hide">
          </div>
        </div>
      </form>
      <form class="card" id="trust-form">
        <h3 style="margin-top:0;font-family:var(--serif);font-weight:500">Homepage proof lines</h3>
        <p style="color:var(--admin-mute);font-size:.9rem">Only fill what is true. Blank rating stays hidden. Soft trips text is OK — no invented numbers.</p>
        <div class="grid-form">
          <div class="field">
            <label>Main proof line</label>
            <input name="label" value="${escapeAttr(t.label || "")}" placeholder="Private trips · India first">
          </div>
          <div class="field">
            <label>Desk proof line</label>
            <input name="licenseNote" value="${escapeAttr(t.licenseNote || "")}" placeholder="Hyderabad desk · Hitech City">
          </div>
          <div class="field">
            <label>Soft trips line (home proof)</label>
            <input name="iataNote" value="${escapeAttr(t.iataNote || "")}" placeholder="Private weeks · India & beyond">
          </div>
          <div class="field">
            <label>About stat — trips value</label>
            <input name="tripsBooked" value="${escapeAttr(t.tripsBooked || "")}" placeholder="India & beyond (or 200+ when true)">
          </div>
          <div class="field">
            <label>About stat — trips label</label>
            <input name="tripsLabel" value="${escapeAttr(t.tripsLabel || "")}" placeholder="Private weeks planned">
          </div>
          <div class="field">
            <label>Guest rating (optional)</label>
            <input name="rating" value="${escapeAttr(t.rating || "")}" placeholder="Leave blank until verified">
          </div>
        </div>
        <button class="btn btn-accent" type="button" id="trust-save" style="margin-top:12px">Save proof lines</button>
      </form>`;
  }

  function renderHome() {
    const home = state.cms.home || LOOP.CMS.defaultHome();
    const opts = state.cms.journeys
      .map((j) => `<option value="${escapeAttr(j.id)}">${escapeHtml(j.title)} (${escapeHtml(j.country)})</option>`)
      .join("");
    return `
      <div class="admin-top">
        <div>
          <h2>Homepage picks</h2>
          <p>India destination strip and world highlight cards. One ID per line.</p>
        </div>
        <button class="btn btn-accent" type="button" id="home-save">Save homepage</button>
      </div>
      <div class="card">
        <div class="field">
          <label>India strip (journey IDs, one per line)</label>
          <textarea id="home-india" style="min-height:120px">${escapeHtml(listToLines(home.indiaStrip))}</textarea>
        </div>
        <div class="field">
          <label>World highlights (journey IDs, one per line)</label>
          <textarea id="home-world" style="min-height:120px">${escapeHtml(listToLines(home.worldHighlights))}</textarea>
        </div>
        <p style="color:var(--admin-mute);font-size:.9rem;margin:0">Available IDs:</p>
        <p style="color:var(--admin-mute);font-size:.85rem;line-height:1.5">${state.cms.journeys.map((j) => j.id).join(" · ")}</p>
      </div>
      <datalist id="journey-ids">${opts}</datalist>`;
  }

  function renderBookings() {
    let bookings = [];
    try {
      bookings = JSON.parse(localStorage.getItem("loop_bookings") || "[]");
    } catch {
      bookings = [];
    }
    return `
      <div class="admin-top">
        <div>
          <h2>Demo bookings</h2>
          <p>Holds saved in this browser. Nothing is charged.</p>
        </div>
      </div>
      ${
        bookings.length
          ? `<table class="pkg-table">
            <thead><tr><th>Ref</th><th>Trip</th><th>Guest</th><th>Total</th><th></th></tr></thead>
            <tbody>
              ${bookings
                .map(
                  (b) => `<tr>
                  <td>${escapeHtml(b.ref)}</td>
                  <td><div class="title">${escapeHtml(b.title)}</div><div class="meta">${escapeHtml(b.start)} · ${b.guests} guests</div></td>
                  <td>${escapeHtml(b.name || "—")}<div class="meta">${escapeHtml(b.email || "")}</div></td>
                  <td>${money(b.total)}</td>
                  <td><button class="btn btn-danger" type="button" data-cancel="${escapeAttr(b.ref)}">Release</button></td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>`
          : `<div class="empty">No demo bookings yet.</div>`
      }`;
  }

  function renderSettings() {
    const updated = state.cms.updatedAt ? new Date(state.cms.updatedAt).toLocaleString("en-IN") : "—";
    return `
      <div class="admin-top">
        <div>
          <h2>Settings</h2>
          <p>Export / import, reset. Last save: ${escapeHtml(updated)}</p>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-top:0;font-family:var(--serif);font-weight:500">Access</h3>
        <p style="color:var(--admin-mute);margin:0;line-height:1.55">Admin sign-in is enforced on the server (Vercel). The password is stored only in your Vercel project environment — not in this page or in the browser. Change it in the Vercel dashboard under <strong>Settings → Environment Variables</strong> (<code>ADMIN_PASSWORD</code>).</p>
      </div>
      <div class="card">
        <h3 style="margin-top:0;font-family:var(--serif);font-weight:500">Backup</h3>
        <p style="color:var(--admin-mute)">Export JSON for safekeeping or to move content to another machine. Import replaces the CMS store.</p>
        <div class="toolbar">
          <button class="btn btn-accent" type="button" id="btn-export">Export JSON</button>
          <label class="btn" style="cursor:pointer">
            Import JSON
            <input id="btn-import" type="file" accept="application/json,.json" hidden>
          </label>
          <button class="btn btn-danger" type="button" id="btn-reset">Reset to seed catalogue</button>
        </div>
      </div>`;
  }

  function renderLive() {
    return `
      <div class="admin-top">
        <div>
          <h2>How to use this admin</h2>
          <p>Test every change on the public site in this same browser.</p>
        </div>
      </div>
      <div class="card going-live">
        <ol>
          <li>Bookmark your admin URL (e.g. <code>/admin</code> on your domain). It is <strong>not</strong> linked from the public menu. You will be asked to sign in; only your Vercel admin password works.</li>
          <li><strong>Packages</strong> — Add, edit, duplicate, or delete trips (price, cities, itinerary, images).</li>
          <li><strong>Collections</strong> — Edit Sanatan, Biker, Community, Solo, Surprise, Group copy and hero images.</li>
          <li><strong>Brand</strong> — WhatsApp, Hyderabad address, Instagram, tagline. Use “Apply profile defaults” if an old number reappears.</li>
          <li><strong>Homepage</strong> — Journey IDs (one per line) for India strip and World highlights.</li>
          <li>Open the public site and hard-refresh. Content is stored in <em>this browser</em> (localStorage). Export JSON in Settings as a backup.</li>
        </ol>
        <div class="toolbar" style="margin-top:20px">
          <button class="btn btn-accent" type="button" id="btn-export-live">Export JSON now</button>
          <a class="btn" href="/" target="_blank" rel="noopener">Preview homepage</a>
          <a class="btn" href="/journeys" target="_blank" rel="noopener">Preview all trips</a>
        </div>
      </div>`;
  }

  function bindView() {
    if (state.view === "packages" && state.editingId === null) {
      $("#btn-new-pkg").onclick = () => setView("packages", "__new__");
      $("#f-q").oninput = (e) => {
        state.filter.q = e.target.value;
        render();
        $("#f-q")?.focus();
        const el = $("#f-q");
        if (el) el.setSelectionRange(el.value.length, el.value.length);
      };
      $("#f-region").onchange = (e) => {
        state.filter.region = e.target.value;
        render();
      };
      $("#f-collection").onchange = (e) => {
        state.filter.collection = e.target.value;
        render();
      };
      $$("[data-edit]").forEach((b) => (b.onclick = () => setView("packages", b.dataset.edit)));
      $$("[data-dup]").forEach(
        (b) =>
          (b.onclick = () => {
            const src = state.cms.journeys.find((j) => j.id === b.dataset.dup);
            if (!src) return;
            const copy = JSON.parse(JSON.stringify(src));
            copy.id = `${src.id}-copy`;
            copy.title = `${src.title} (copy)`;
            copy.featured = false;
            let n = 2;
            while (state.cms.journeys.some((j) => j.id === copy.id)) {
              copy.id = `${src.id}-copy-${n++}`;
            }
            state.cms.journeys.push(copy);
            persist();
            setView("packages", copy.id);
          })
      );
      $$("[data-del]").forEach(
        (b) =>
          (b.onclick = () => {
            const id = b.dataset.del;
            if (!confirm(`Delete package “${id}”? This removes it from the public catalogue in this browser.`)) return;
            state.cms.journeys = state.cms.journeys.filter((j) => j.id !== id);
            if (state.cms.home) {
              state.cms.home.indiaStrip = (state.cms.home.indiaStrip || []).filter((x) => x !== id);
              state.cms.home.worldHighlights = (state.cms.home.worldHighlights || []).filter((x) => x !== id);
            }
            persist();
            render();
          })
      );
    }

    if (state.view === "collections") {
      $$(".col-form").forEach((form) => {
        $(".col-save", form).onclick = () => {
          const idx = Number(form.dataset.idx);
          const c = state.cms.collections[idx];
          c.kicker = form.kicker.value.trim();
          c.promise = form.promise.value.trim();
          c.lede = form.lede.value.trim();
          c.forWhom = form.forWhom.value.trim();
          c.notFor = form.notFor.value.trim();
          c.ritual = linesToList(form.ritual.value);
          c.image = form.image.value.trim();
          persist();
        };
      });
    }

    if (state.view === "brand") {
      $("#brand-save").onclick = () => {
        const form = $("#brand-form");
        state.cms.brand = normalizeBrandFromForm(form);
        persist();
      };
      $("#brand-profile").onclick = () => {
        state.cms.brand = LOOP.CMS.syncContactDerived({
          ...state.cms.brand,
          ...LOOP.CMS.PROFILE,
          house: state.cms.brand.house || "Loop Trips",
          email: state.cms.brand.email || "concierge@looptrips.com",
          collection: state.cms.brand.collection || "Spice Route Luxe",
        });
        state.cms.profileVersion = LOOP.CMS.PROFILE_VERSION;
        persist();
        render();
        toast("Profile defaults applied — WhatsApp 9951139299");
      };
      $("#trust-save").onclick = () => {
        const form = $("#trust-form");
        state.cms.trust = {
          ...(state.cms.trust || {}),
          label: form.label.value.trim(),
          licenseNote: form.licenseNote.value.trim(),
          iataNote: form.iataNote.value.trim(),
          tripsBooked: form.tripsBooked.value.trim(),
          tripsLabel: form.tripsLabel.value.trim(),
          rating: form.rating.value.trim(),
        };
        persist();
      };
    }

    if (state.view === "home") {
      $("#home-save").onclick = () => {
        state.cms.home = {
          indiaStrip: linesToList($("#home-india").value),
          worldHighlights: linesToList($("#home-world").value),
        };
        persist();
      };
    }

    if (state.view === "bookings") {
      $$("[data-cancel]").forEach((b) => {
        b.onclick = () => {
          let list = [];
          try {
            list = JSON.parse(localStorage.getItem("loop_bookings") || "[]");
          } catch {
            list = [];
          }
          list = list.filter((x) => x.ref !== b.dataset.cancel);
          localStorage.setItem("loop_bookings", JSON.stringify(list));
          toast("Booking released");
          render();
        };
      });
    }

    if (state.view === "settings") {
      $("#btn-export").onclick = exportJson;
      $("#btn-import").onchange = (e) => importJson(e.target.files[0]);
      $("#btn-reset").onclick = () => {
        if (!confirm("Reset CMS to the original seed catalogue? This cannot be undone unless you exported JSON.")) return;
        state.cms = LOOP.CMS.snapshotFromSeed();
        persist();
        render();
      };
    }

    if (state.view === "live") {
      const btn = $("#btn-export-live");
      if (btn) btn.onclick = exportJson;
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state.cms, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `loop-cms-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("JSON downloaded");
  }

  function importJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.journeys || !Array.isArray(data.journeys)) throw new Error("Invalid CMS file");
        state.cms = data;
        persist();
        render();
        toast("Import complete");
      } catch (e) {
        toast(e.message || "Import failed", true);
      }
    };
    reader.readAsText(file);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
