(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const CURRENCY_KEY = "loop_currency";
  const USD_PER_INR = 1 / 83;

  function getCurrency() {
    const c = localStorage.getItem(CURRENCY_KEY);
    return c === "USD" ? "USD" : "INR";
  }

  function setCurrency(c) {
    localStorage.setItem(CURRENCY_KEY, c === "USD" ? "USD" : "INR");
  }

  const money = (nInr) => {
    const cur = getCurrency();
    const value = cur === "USD" ? Math.round(Number(nInr) * USD_PER_INR) : Math.round(Number(nInr));
    return new Intl.NumberFormat(cur === "USD" ? "en-US" : "en-IN", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fromPrice = (j) => `From ${money(j.price)}`;

  const brand = () => LOOP.brand || {};

  function waBookingLink(message) {
    const base = brand().whatsappLink || "https://wa.me/919951139299";
    if (!message) return base;
    return `${base}?text=${encodeURIComponent(message)}`;
  }

  function waEnquiryMessage(overrides = {}) {
    const lines = [
      "Hi Loop Trips! I want to plan a trip.",
      overrides.destination ? `Destination: ${overrides.destination}` : "Destination:",
      overrides.dates ? `Dates: ${overrides.dates}` : "Dates:",
      overrides.travellers ? `Travellers: ${overrides.travellers}` : "Travellers:",
      overrides.budget ? `Budget: ${overrides.budget}` : "Budget:",
    ];
    if (overrides.extra) lines.push("", overrides.extra);
    return lines.join("\n");
  }

  const kolamSvg = `<svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <circle cx="40" cy="40" r="2.4" fill="currentColor"/>
    <circle cx="40" cy="14" r="1.8" fill="currentColor"/>
    <circle cx="40" cy="66" r="1.8" fill="currentColor"/>
    <circle cx="14" cy="40" r="1.8" fill="currentColor"/>
    <circle cx="66" cy="40" r="1.8" fill="currentColor"/>
    <circle cx="22" cy="22" r="1.8" fill="currentColor"/>
    <circle cx="58" cy="22" r="1.8" fill="currentColor"/>
    <circle cx="22" cy="58" r="1.8" fill="currentColor"/>
    <circle cx="58" cy="58" r="1.8" fill="currentColor"/>
    <path d="M40 14C54.5 14 66 25.5 66 40C66 54.5 54.5 66 40 66C25.5 66 14 54.5 14 40C14 25.5 25.5 14 40 14Z" stroke="currentColor" stroke-width="1.1"/>
    <path d="M40 24C49.5 24 56 30.5 56 40C56 49.5 49.5 56 40 56C30.5 56 24 49.5 24 40C24 30.5 30.5 24 40 24Z" stroke="currentColor" stroke-width="1.1"/>
  </svg>`;

  const logoSvg = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 4.5c-6.35 0-11.5 5.15-11.5 11.5S9.65 27.5 16 27.5 27.5 22.35 27.5 16" stroke="currentColor" stroke-width="1.2"/>
    <path d="M16 9.2a6.8 6.8 0 1 0 6.8 6.8" stroke="#c45c26" stroke-width="1.2"/>
  </svg>`;

  function colOf(j) {
    return (LOOP.collections || []).find((c) => c.id === j.collection) || LOOP.world;
  }

  function header(active) {
    const over = ["home", "concierge", "collection", "journey"].includes(active);
    const is = (page) => (active === page ? "active" : "");
    const b = brand();
    const cur = getCurrency();
    return `<header class="site-header${over ? " over-hero" : ""}" id="header">
      <a class="logo" href="index.html">
        ${logoSvg}
        <span class="logo-text">
          <span class="logo-name">Loop Trips</span>
          <span class="logo-mark">${b.logoMark || b.tagline || "Desh pehle · Duniya tak"}</span>
        </span>
      </a>
      <nav class="nav" id="nav" aria-label="Primary">
        <div class="nav-primary">
          <a href="journeys.html" class="${is("journeys")}">Trips</a>
          <a href="index.html#india" class="${is("collection")}">India</a>
          <a href="concierge.html" class="${is("concierge")}">Concierge</a>
          <a href="about.html" class="${is("about")}">About</a>
          <a href="contact.html" class="${is("contact")}">Contact</a>
        </div>
        <div class="nav-actions">
          <div class="currency-toggle" role="group" aria-label="Currency">
            <button type="button" class="currency-btn${cur === "INR" ? " on" : ""}" data-currency="INR" aria-pressed="${cur === "INR"}">₹ INR</button>
            <button type="button" class="currency-btn${cur === "USD" ? " on" : ""}" data-currency="USD" aria-pressed="${cur === "USD"}">$ USD</button>
          </div>
          <a class="nav-phone" href="${waBookingLink(waEnquiryMessage())}" target="_blank" rel="noopener">
            <span class="nav-phone-label">WhatsApp</span>
            <span class="nav-phone-num">${b.whatsapp || b.phone || "+91 99511 39299"}</span>
          </a>
          <a class="book-link" href="book.html">Request a trip</a>
        </div>
      </nav>
      <button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="nav">
        <span class="menu-icon" aria-hidden="true">
          <svg class="icon-open" width="26" height="18" viewBox="0 0 26 18" fill="none"><path d="M0 1h26M0 9h26M0 17h26" stroke="currentColor" stroke-width="1.3"/></svg>
          <svg class="icon-close" width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4l14 14M18 4L4 18" stroke="currentColor" stroke-width="1.3"/></svg>
        </span>
      </button>
    </header>`;
  }

  function footer() {
    const cols = (LOOP.collections || [])
      .map((c) => `<a href="${c.href}">${c.name}</a>`)
      .join("");
    const b = brand();
    const trust = LOOP.trust || {};
    return `<footer class="site-footer">
      <div class="foot-cta">
        <div class="wrap foot-cta-inner">
          <div>
            <p class="eyebrow">Still deciding</p>
            <h2>Ask the desk before you browse another ten tabs.</h2>
          </div>
          <div class="foot-cta-actions">
            <a class="btn btn-light" href="concierge.html">Open the concierge</a>
            <a class="btn btn-ghost" href="${waBookingLink(waEnquiryMessage())}" target="_blank" rel="noopener">WhatsApp</a>
            <a class="btn btn-ghost" href="contact.html">Write to us</a>
          </div>
        </div>
      </div>
      <div class="wrap">
        <div class="foot-top">
          <div class="foot-brand">
            <a class="foot-logo" href="index.html">${logoSvg}<span>Loop Trips</span></a>
            <p class="foot-tagline">${b.tagline || "Desh pehle. Phir jahaan dil jaaye."} India from ₹50,000 — the world from ₹1,00,000. Desk in ${b.city || "Hyderabad"}.</p>
            ${trust.label ? `<p class="foot-trust">${trust.label}</p>` : ""}
            <p class="foot-hours">Open ${b.hours || "10:00–18:00 IST"}${b.license ? ` · ${b.license}` : ""}${b.iata ? ` · ${b.iata}` : ""} · WhatsApp ${b.whatsapp || b.phone || "+91 99511 39299"}</p>
          </div>
          <div class="foot-col">
            <p class="eyebrow">Explore</p>
            <a href="journeys.html">All trips</a>
            <a href="index.html#india">India packages</a>
            <a href="community.html">Community</a>
            <a href="index.html#world">The world</a>
            <a href="book.html">Request a trip</a>
            <a href="bookings.html">My bookings</a>
          </div>
          <div class="foot-col">
            <p class="eyebrow">India ways</p>
            ${cols}
          </div>
          <div class="foot-col">
            <p class="eyebrow">Desk</p>
            <a href="mailto:${b.email || "concierge@looptrips.com"}">${b.email || "concierge@looptrips.com"}</a>
            <a href="${waBookingLink(waEnquiryMessage())}" target="_blank" rel="noopener">WhatsApp ${b.whatsapp || b.phone || "+91 99511 39299"}</a>
            <a href="tel:${b.phoneTel || "+919951139299"}">Call ${b.phone || "+91 99511 39299"}</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
            <a href="concierge.html">Concierge</a>
          </div>
          <div class="foot-col">
            <p class="eyebrow">Policies</p>
            <a href="privacy.html">Privacy policy</a>
            <a href="cancellation.html">Cancellation policy</a>
            <a href="refund.html">Refund policy</a>
            <a href="terms.html">Terms &amp; conditions</a>
            <a href="${b.instagram || "#"}" target="_blank" rel="noopener">${b.instagramHandle || "Instagram"}</a>
          </div>
        </div>
        <div class="foot-bottom">
          <span>Loop Trips · ${b.addressFull || b.city || "Hyderabad"}</span>
          <span>WhatsApp ${b.whatsapp || b.phone || "+91 99511 39299"}${b.instagramHandle ? ` · ${b.instagramHandle}` : ""}</span>
        </div>
      </div>
    </footer>`;
  }

  function card(j) {
    const cities = j.sealed
      ? "Revealed 48 hours before you fly"
      : j.locations.slice(0, 4).join(" · ");
    const extra = !j.sealed && j.locations.length > 4 ? ` +${j.locations.length - 4}` : "";
    const seats =
      typeof j.seats === "number"
        ? `<p class="seats">${j.seats} seat${j.seats === 1 ? "" : "s"} left in this circle</p>`
        : "";
    const kicker = j.collection && j.collection !== "world" ? `${j.country} · ${colOf(j).name}` : `${j.country} · ${j.region}`;
    return `<a class="journey-card" href="journey.html?id=${j.id}">
      <div class="thumb">
        <img src="${j.image || ""}" alt="${j.title}, ${j.country}" loading="lazy">
      </div>
      <div class="meta">
        <p class="card-kicker">${kicker}</p>
        <h3>${j.title}</h3>
        <p class="card-cities">${cities}${extra}</p>
        ${seats}
        <div class="line">
          <span>${j.duration}</span>
          <span class="price">${fromPrice(j)} / person</span>
        </div>
      </div>
    </a>`;
  }

  function mountChrome() {
    const active = document.body.dataset.page;
    document.body.insertAdjacentHTML("afterbegin", header(active));
    if (active !== "concierge") document.body.insertAdjacentHTML("beforeend", footer());

    const headerEl = $("#header");
    const menuBtn = $("#menuBtn");
    const nav = $("#nav");
    const setNavOpen = (open) => {
      document.body.classList.toggle("nav-open", open);
      if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      }
    };
    const onScroll = () => headerEl.classList.toggle("scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    menuBtn.addEventListener("click", () => {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setNavOpen(false);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });

    $$("[data-currency]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.dataset.currency;
        if (next === getCurrency()) return;
        setCurrency(next);
        location.reload();
      });
    });
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function getJourney(id) {
    return LOOP.journeys.find((j) => j.id === id);
  }

  function saveBookings(list) {
    localStorage.setItem("loop_bookings", JSON.stringify(list));
  }

  function loadBookings() {
    try {
      return JSON.parse(localStorage.getItem("loop_bookings") || "[]");
    } catch {
      return [];
    }
  }

  function renderHome() {
    const home = LOOP.home || {};
    const strip = $("#dest-strip");
    if (strip) {
      const picks = (home.indiaStrip || [
        "forts-and-palaces",
        "kashi-antarah",
        "high-road-leh",
        "backwater-spices",
        "valley-of-serenity",
        "durga-pujo",
        "himalayan-expedition",
        "coffee-capital",
      ])
        .map(getJourney)
        .filter(Boolean);
      strip.innerHTML = picks
        .map(
          (j) => `<a class="dest-tile" href="journey.html?id=${j.id}">
            <img src="${j.image}" alt="${j.country}" loading="lazy">
            <span>${j.country}</span>
          </a>`
        )
        .join("");
    }

    const packs = $("#package-grid");
    if (packs) {
      packs.innerHTML = LOOP.collections
        .map(
          (c) => `<a class="package-tile" href="${c.href}">
            <img src="${c.image}" alt="${c.name}" loading="lazy">
            <span>${c.name}<small>${c.kicker}</small></span>
          </a>`
        )
        .join("");
    }

    const community = $("#community-grid");
    if (community) {
      const picks = LOOP.journeys.filter((j) => j.collection === "community");
      community.innerHTML = picks.map(card).join("");
    }

    const india = $("#india-grid");
    if (india) {
      const picks = LOOP.journeys.filter((j) => j.featured && j.region === "India").slice(0, 6);
      india.innerHTML = picks.map(card).join("");
    }

    const featured = $("#featured-grid");
    if (featured) {
      const highlightIds = home.worldHighlights || [
        "tropical-heaven-bali",
        "dreamy-maldives",
        "jewel-of-the-desert",
        "gorgeous-greece",
        "cherry-blossom-country",
        "turkey",
      ];
      const picks = highlightIds.map(getJourney).filter(Boolean);
      featured.innerHTML = picks.map(card).join("");
    }

    const regions = $("#region-list");
    if (regions) {
      const order = ["Europe", "Africa", "Asia", "Islands", "Middle East", "Oceania"];
      regions.innerHTML = order
        .map((name) => {
          const n = LOOP.journeys.filter((j) => j.region === name).length;
          return `<a href="journeys.html?region=${encodeURIComponent(name)}"><span>${name}</span><em>${n} trips</em></a>`;
        })
        .join("");
    }

    const proof = $("#home-proof");
    if (proof) {
      const t = LOOP.trust || {};
      const b = brand();
      const bits = [
        t.label || "Private trips · India first",
        t.licenseNote || (b.city ? `${b.city} desk` : ""),
        b.whatsapp || b.phone ? `WhatsApp ${b.whatsapp || b.phone}` : "",
        b.instagramHandle || "",
      ].filter(Boolean);
      proof.innerHTML = bits.map((s) => `<span>${s}</span>`).join("");
    }

    renderReviews("#reviews-grid");
    renderGallery("#gallery-grid");
  }

  function stars(n) {
    return "★".repeat(Math.max(0, Math.min(5, Number(n) || 0))) + "☆".repeat(Math.max(0, 5 - (Number(n) || 0)));
  }

  function renderReviews(sel) {
    const box = $(sel);
    if (!box) return;
    const list = LOOP.reviews || [];
    box.innerHTML = list
      .map(
        (r) => `<article class="review-card">
          <div class="review-photo"><img src="${r.photo}" alt="" loading="lazy"></div>
          <div class="review-body">
            <p class="review-stars" aria-label="${r.rating} out of 5">${stars(r.rating)}</p>
            <p class="review-text">“${r.text}”</p>
            <p class="review-meta"><strong>${r.name}</strong> · ${r.place}</p>
          </div>
        </article>`
      )
      .join("");
  }

  function renderGallery(sel) {
    const box = $(sel);
    if (!box) return;
    const list = LOOP.gallery || [];
    box.innerHTML = list
      .map(
        (g) => `<figure class="gallery-tile">
          <img src="${g.src}" alt="${g.caption}" loading="lazy">
          <figcaption>${g.caption}</figcaption>
        </figure>`
      )
      .join("");
  }

  function renderAbout() {
    const b = brand();
    const trust = LOOP.trust || {};
    const stats = $("#about-stats");
    if (stats) {
      const cells = [];
      if (trust.rating) cells.push(`<div class="about-stat"><strong>${trust.rating}★</strong><span>Guest rating</span></div>`);
      if (trust.tripsBooked) cells.push(`<div class="about-stat"><strong>${trust.tripsBooked}</strong><span>Trips booked</span></div>`);
      if (b.years) cells.push(`<div class="about-stat"><strong>${b.years}+</strong><span>Years at the desk</span></div>`);
      cells.push(`<div class="about-stat"><strong>WhatsApp</strong><span>${b.whatsapp || b.phone || "+91 99511 39299"}</span></div>`);
      cells.push(`<div class="about-stat"><strong>${b.city || "Hyderabad"}</strong><span>Desk</span></div>`);
      if (b.instagramHandle) cells.push(`<div class="about-stat"><strong>${b.instagramHandle}</strong><span>Instagram</span></div>`);
      stats.innerHTML = cells.join("");
    }
    const license = $("#about-license");
    if (license) {
      const lines = [
        `<p><strong>Desk</strong> · ${b.addressFull || b.city || "Hyderabad"}</p>`,
        `<p><strong>WhatsApp</strong> · <a href="${b.whatsappLink}" target="_blank" rel="noopener">${b.whatsapp || b.phone}</a></p>`,
        `<p><strong>Hours</strong> · ${b.hours || "10:00–18:00 IST"}</p>`,
      ];
      if (b.license) lines.push(`<p><strong>License</strong> · ${b.license}</p>`);
      if (b.iata) lines.push(`<p><strong>IATA</strong> · ${b.iata}</p>`);
      license.innerHTML = lines.join("");
    }
    const team = $("#team-grid");
    if (team) {
      const members = LOOP.team || [];
      if (!members.length) {
        const section = team.closest("section");
        if (section) section.hidden = true;
        team.innerHTML = "";
      } else {
        team.innerHTML = members
          .map(
            (m) => `<article class="team-card">
            <img src="${m.image}" alt="${m.name}" loading="lazy">
            <h3>${m.name}</h3>
            <p class="team-role">${m.role}</p>
            <p class="team-years">${m.years || ""}</p>
            <p class="team-bio">${m.bio || ""}</p>
          </article>`
          )
          .join("");
      }
    }
    renderReviews("#about-reviews");
  }

  function renderCollection() {
    const id = document.body.dataset.collection;
    const c = LOOP.collections.find((x) => x.id === id);
    if (!c) {
      location.href = "index.html";
      return;
    }

    document.title = `${c.name} — Loop Trips`;
    const trips = LOOP.journeys.filter((j) => j.collection === c.id);

    $("#collection-root").innerHTML = `
      <div class="page-hero" style="min-height:62vh">
        <img class="bg" src="${c.image}" alt="${c.name}">
        <div class="wrap">
          <p class="eyebrow">${c.kicker}</p>
          <h1>${c.name}</h1>
          <p>${c.lede}</p>
        </div>
      </div>

      <section style="padding-top:0;padding-bottom:0">
        <div class="wrap qualify">
          <article>
            <h3>For</h3>
            <p>${c.forWhom}</p>
          </article>
          <article>
            <h3>Not for</h3>
            <p>${c.notFor}</p>
          </article>
        </div>
      </section>

      <section>
        <div class="wrap">
          <div class="section-head">
            <div>
              <p class="eyebrow">${trips.length} trips</p>
              <h2>${c.name} journeys</h2>
            </div>
            <a class="more" href="journeys.html">All trips</a>
          </div>
          <div class="grid-3">${trips.map(card).join("")}</div>
        </div>
      </section>

      <div id="collection-extra"></div>

      <section style="padding-top:0">
        <div class="wrap">
          <div class="section-head">
            <div>
              <p class="eyebrow">Included in the idea</p>
              <h2>How we keep this list</h2>
            </div>
          </div>
          <ol class="ritual">
            ${c.ritual.map((r, i) => `<li><span>0${i + 1}</span><div>${r}</div></li>`).join("")}
          </ol>
        </div>
      </section>
    `;

    if (c.id === "surprise") renderSurpriseRitual();
    if (c.id === "group") renderGroupAssemble();
    if (c.id === "community") renderCommunityDetail();
  }

  function renderCommunityDetail() {
    const extra = $("#collection-extra");
    if (!extra) return;
    extra.innerHTML = `
      <section class="community-detail">
        <div class="wrap">
          <div class="section-head">
            <div>
              <p class="eyebrow">How Community works</p>
              <h2>A small circle. A real host. A seat for one.</h2>
            </div>
          </div>
          <div class="community-pillars">
            <article>
              <h3>Solo by design</h3>
              <p>Every Community trip holds seats for people travelling alone. You are not a third wheel. You are a chair at the table — Coorg mist, Kutch salt, Meghalaya rain.</p>
            </article>
            <article>
              <h3>Never more than ten</h3>
              <p>Eight to ten people. One host who lives there. One kitchen that belongs to the place. No coach. No microphone. No forced icebreakers.</p>
            </article>
            <article>
              <h3>From ₹50,000 — your budget after that</h3>
              <p>Prices start in the India band. Stay longer, upgrade the house, add a private day — tell us your ceiling and we reshape the week. There is a floor, not a cap.</p>
            </article>
          </div>
          <div class="btn-row" style="margin-top:8px">
            <a class="btn btn-fill" href="concierge.html?q=Community%20solo%20seat">Ask for a solo seat</a>
            <a class="btn" href="solo.html">Or see Solo trips</a>
          </div>
        </div>
      </section>`;
  }

  function renderSurpriseRitual() {
    const extra = $("#collection-extra");
    extra.innerHTML = `
      <section>
        <div class="wrap">
          <div class="section-head">
            <div>
              <p class="eyebrow">The ritual</p>
              <h2>Four questions. Then we stop asking.</h2>
            </div>
          </div>
          <div id="ritual-steps"></div>
          <div id="envelope" hidden></div>
        </div>
      </section>`;

    const questions = [
      {
        key: "element",
        title: "Land, water, or both?",
        options: [
          { id: "land", label: "Land", note: "Hills, desert, stone, forest." },
          { id: "water", label: "Water", note: "Coast, backwater, an island in India." },
          { id: "both", label: "Both", note: "A week that changes texture." },
        ],
      },
      {
        key: "pace",
        title: "How should the days feel?",
        options: [
          { id: "still", label: "Still", note: "Few moves. A house that holds you." },
          { id: "moving", label: "Moving", note: "A road, a sequence, a change of air." },
        ],
      },
      {
        key: "who",
        title: "Who is travelling?",
        options: [
          { id: "two", label: "Two", note: "A door that closes." },
          { id: "few", label: "A few", note: "We will still keep it sealed." },
        ],
      },
      {
        key: "length",
        title: "How long can you disappear?",
        options: [
          { id: "weekend", label: "A long weekend", note: "Four days. Leave Friday." },
          { id: "week", label: "A week", note: "Seven days. The proper length." },
          { id: "long", label: "Longer", note: "Eight days, for two." },
        ],
      },
    ];

    const answers = {};
    let step = 0;

    const draw = () => {
      if (step >= questions.length) {
        const pickId =
          answers.length === "weekend"
            ? "sealed-weekend"
            : answers.length === "long" || answers.who === "two"
              ? "sealed-two"
              : "sealed-seven";
        const j = getJourney(pickId);
        $("#ritual-steps").innerHTML = "";
        const env = $("#envelope");
        env.hidden = false;
        env.className = "envelope";
        env.innerHTML = `
          <p class="eyebrow">Sealed</p>
          <h2>${j.title}</h2>
          <p>${j.duration}. ${fromPrice(j)} per person — no ceiling; we reshape to your budget. Place withheld until forty-eight hours before you fly. You asked for ${answers.element}, ${answers.pace} days, travelling as ${answers.who === "two" ? "two" : "a few"}.</p>
          <div class="btn-row" style="margin-top:28px">
            <a class="btn btn-light" href="book.html?id=${j.id}">Hold the envelope</a>
            <a class="btn btn-ghost" href="journey.html?id=${j.id}">Read the terms</a>
          </div>`;
        env.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const q = questions[step];
      $("#ritual-steps").innerHTML = `
        <p class="eyebrow">0${step + 1} / 04</p>
        <h3 class="serif" style="font-size:clamp(1.8rem,3vw,2.6rem);margin:8px 0 22px">${q.title}</h3>
        <div class="ritual-board">
          ${q.options
            .map(
              (o) => `<button class="ask" type="button" data-id="${o.id}">
                ${o.label}<small>${o.note}</small>
              </button>`
            )
            .join("")}
        </div>`;
      $$(".ask").forEach((btn) => {
        btn.addEventListener("click", () => {
          answers[q.key] = btn.dataset.id;
          step += 1;
          draw();
        });
      });
    };

    draw();
  }

  function renderGroupAssemble() {
    const extra = $("#collection-extra");
    extra.innerHTML = `
      <section>
        <div class="wrap">
          <div class="section-head">
            <div>
              <p class="eyebrow">Assemble</p>
              <h2>How many chairs?</h2>
            </div>
          </div>
          <div class="form-grid" style="max-width:640px;margin-bottom:36px">
            <div class="field">
              <label for="chairs">People</label>
              <input id="chairs" type="number" min="8" max="24" value="12">
            </div>
            <div class="field">
              <label for="occasion">Occasion</label>
              <select id="occasion">
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
          <p id="group-note" class="card-cities" style="margin-bottom:22px"></p>
          <div class="grid-3" id="group-picks"></div>
        </div>
      </section>`;

    const draw = () => {
      const n = Math.max(8, Math.min(24, Number($("#chairs").value) || 12));
      const occasion = $("#occasion").value;
      const prefer =
        occasion === "company"
          ? "company-ridge"
          : occasion === "friends"
            ? "friends-of-the-house"
            : "haveli-family";
      const list = LOOP.journeys
        .filter((j) => j.collection === "group")
        .sort((a, b) => (a.id === prefer ? -1 : b.id === prefer ? 1 : 0))
        .filter((j) => n >= (j.minPax || 8) && n <= (j.maxPax || 24));
      $("#group-note").textContent = list.length
        ? `${n} people. ${list.length} house${list.length === 1 ? "" : "s"} will hold that circle.`
        : `${n} people is outside what we hold. Stay between 8 and 24, or write to the desk.`;
      $("#group-picks").innerHTML = list.map(card).join("");
    };

    $("#chairs").addEventListener("input", draw);
    $("#occasion").addEventListener("change", draw);
    draw();
  }

  function renderCatalog() {
    const grid = $("#catalog-grid");
    const search = $("#search");
    const chips = $$(".chip");
    let collection = param("collection") || "";
    let region = param("region") || "";

    const syncChips = () => {
      chips.forEach((c) => {
        if (c.dataset.collection === "All") {
          c.classList.toggle("on", !collection && !region);
        } else if (c.dataset.collection) {
          c.classList.toggle("on", !region && c.dataset.collection === collection);
        } else if (c.dataset.region) {
          c.classList.toggle("on", c.dataset.region === region);
        }
      });
    };

    const draw = () => {
      const q = (search.value || "").toLowerCase().trim();
      const list = LOOP.journeys.filter((j) => {
        const colOk = !collection || j.collection === collection;
        const regionOk = !region || j.region === region;
        const hay = `${j.title} ${j.country} ${j.locations.join(" ")} ${j.theme} ${j.collection}`.toLowerCase();
        return colOk && regionOk && (!q || hay.includes(q));
      });
      $("#count").textContent = `${list.length} trip${list.length === 1 ? "" : "s"}`;
      grid.innerHTML = list.length
        ? list.map(card).join("")
        : `<p class="empty">No trips match that search.</p>`;
    };

    chips.forEach((c) =>
      c.addEventListener("click", () => {
        const url = new URL(location.href);
        if (c.dataset.collection === "All") {
          collection = "";
          region = "";
          url.searchParams.delete("collection");
          url.searchParams.delete("region");
        } else if (c.dataset.collection) {
          collection = c.dataset.collection;
          region = "";
          url.searchParams.set("collection", collection);
          url.searchParams.delete("region");
        } else if (c.dataset.region) {
          region = c.dataset.region;
          collection = "";
          url.searchParams.set("region", region);
          url.searchParams.delete("collection");
        }
        history.replaceState({}, "", url);
        syncChips();
        draw();
      })
    );
    search.addEventListener("input", draw);
    syncChips();
    draw();
  }

  function renderDetail() {
    const j = getJourney(param("id"));
    if (!j) {
      location.href = "journeys.html";
      return;
    }

    const col = colOf(j);
    document.title = `${j.title} · ${j.country} — Loop Trips`;

    const heroBg = $("#hero-bg");
    if (heroBg && j.image) {
      heroBg.src = j.image;
      heroBg.alt = `${j.title}, ${j.country}`;
    }
    $("#d-crumbs").innerHTML = `<a href="index.html">Home</a> / <a href="${col.href || "journeys.html"}">${col.name}</a> / ${j.title}`;
    $("#d-title").textContent = j.title;
    $("#d-sub").textContent = j.sealed
      ? `${j.country} · Revealed 48 hours before you fly`
      : `${j.country} · ${j.locations.join(" · ")}`;
    $("#d-story").textContent = j.story;
    $("#d-card-title").textContent = j.title;
    $("#d-duration").textContent = j.duration;
    $("#d-best").textContent = j.bestTime;
    $("#d-price").textContent = fromPrice(j);
    $("#d-status").textContent = j.status;
    $("#d-pax").textContent = j.minPax
      ? `${j.minPax}–${j.maxPax} guests`
      : `${j.pax || 2} guests`;

    $("#f-duration").textContent = j.duration;
    $("#f-places").textContent = j.sealed
      ? "Sealed"
      : j.locations.length === 1
        ? j.locations[0]
        : `${j.locations.length} places`;
    $("#f-price").textContent = `${fromPrice(j)} / person`;
    $("#f-pax").textContent = j.minPax ? `${j.minPax}–${j.maxPax}` : `${j.pax || 2} guests`;
    $("#f-best").textContent = j.bestTime;
    $("#f-status").textContent = j.status;

    $("#d-route").innerHTML = (j.locations || []).map((l) => `<li>${l}</li>`).join("") || "<li>—</li>";
    $("#d-highlights-main").innerHTML = (j.highlights || []).map((h) => `<li>${h}</li>`).join("") || "<li>Details confirmed with the desk after hold.</li>";
    $("#d-inclusions").innerHTML = (j.inclusions || []).map((h) => `<li>${h}</li>`).join("") || "<li>Confirmed on your itinerary.</li>";
    $("#d-exclusions").innerHTML = (LOOP.exclusions || []).map((h) => `<li>${h}</li>`).join("");
    const days = j.itinerary && j.itinerary.length ? j.itinerary : [{ day: "—", title: "Itinerary", text: "Day-by-day plan is confirmed with the desk after your hold." }];
    $("#d-itinerary").innerHTML = days
      .map(
        (d) => `<article>
          <div class="day">${d.day}</div>
          <div><h3>${d.title}</h3><p>${d.text}</p></div>
        </article>`
      )
      .join("");

    const gallery = [...(j.gallery || [])].filter((src) => src !== j.image).slice(0, 3);
    const gal = $("#d-gallery");
    if (gal) {
      if (!gallery.length) {
        gal.hidden = true;
      } else {
        gal.hidden = false;
        gal.innerHTML = gallery
          .map((src, i) => `<img src="${src}" alt="${j.title} photo ${i + 1}" loading="lazy">`)
          .join("");
      }
    }

    $("#book-now").href = `book.html?id=${j.id}`;
    const ask = document.getElementById("ask-trip");
    if (ask) ask.href = `concierge.html?about=${j.id}&q=${encodeURIComponent("Customise " + j.title + " to my budget")}`;
    const tripWa = $("#book-wa-trip");
    if (tripWa) {
      tripWa.href = waBookingLink(
        waEnquiryMessage({
          destination: `${j.title} (${j.country})`,
          budget: fromPrice(j),
        })
      );
    }

    const related = LOOP.journeys
      .filter((x) => x.collection === j.collection && x.id !== j.id)
      .slice(0, 3);
    $("#related").innerHTML = (related.length ? related : LOOP.journeys.filter((x) => x.collection !== "world").slice(0, 3))
      .map(card)
      .join("");
  }

  function renderBook() {
    const pre = getJourney(param("id"));
    const select = $("#journey-select");
    select.innerHTML = LOOP.journeys
      .map((j) => `<option value="${j.id}" ${pre && pre.id === j.id ? "selected" : ""}>${j.title} — ${j.country} · ${fromPrice(j)}</option>`)
      .join("");

    function syncWhatsAppLinks() {
      const j = getJourney(select.value);
      const msg = j
        ? waEnquiryMessage({
            destination: `${j.title} (${j.country})`,
            budget: fromPrice(j),
            extra: "Notes:",
          })
        : waEnquiryMessage();
      const href = waBookingLink(msg);
      ["book-wa", "sum-wa", "confirm-wa"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.href = href;
      });
    }
    syncWhatsAppLinks();

    const suiteBox = $("#suites");
    suiteBox.innerHTML = LOOP.suites
      .map(
        (s, i) => `<label class="choice ${i === 0 ? "on" : ""}">
          <div><strong>${s.name}</strong><small>${s.note}</small></div>
          <input type="radio" name="suite" value="${s.id}" ${i === 0 ? "checked" : ""} hidden>
        </label>`
      )
      .join("");

    const addonBox = $("#addons");
    addonBox.innerHTML = LOOP.addons
      .map(
        (a) => `<label class="choice">
          <div><strong>${a.name}</strong><small>${money(a.price)}</small></div>
          <input type="checkbox" name="addon" value="${a.id}">
        </label>`
      )
      .join("");

    $$(".choice", suiteBox).forEach((el) => {
      el.addEventListener("click", () => {
        $$(".choice", suiteBox).forEach((x) => x.classList.remove("on"));
        el.classList.add("on");
        el.querySelector("input").checked = true;
        updateSummary();
      });
    });
    $$(".choice", addonBox).forEach((el) => {
      el.addEventListener("click", () => {
        requestAnimationFrame(() => {
          el.classList.toggle("on", el.querySelector("input").checked);
          updateSummary();
        });
      });
    });

    const start = $("#start");
    const today = new Date();
    today.setDate(today.getDate() + 21);
    start.min = today.toISOString().slice(0, 10);
    start.value = start.min;

    const guestsInput = $("#guests");

    function syncGuests() {
      const j = getJourney(select.value);
      const max = j.maxPax || 8;
      const min = j.minPax || 1;
      guestsInput.min = min;
      guestsInput.max = max;
      if (Number(guestsInput.value) < min) guestsInput.value = min;
      if (Number(guestsInput.value) > max) guestsInput.value = max;
    }

    function clearFieldError(el) {
      if (!el) return;
      el.classList.remove("invalid");
      const tip = el.parentElement && el.parentElement.querySelector(".field-error");
      if (tip) tip.textContent = "";
    }

    function setFieldError(el, msg) {
      if (!el) return;
      el.classList.add("invalid");
      let tip = el.parentElement && el.parentElement.querySelector(".field-error");
      if (!tip && el.parentElement) {
        tip = document.createElement("p");
        tip.className = "field-error";
        el.parentElement.appendChild(tip);
      }
      if (tip) tip.textContent = msg;
    }

    function validateStep1() {
      let ok = true;
      if (!select.value) {
        setFieldError(select, "Select a trip to continue.");
        ok = false;
      } else clearFieldError(select);
      if (!start.value) {
        setFieldError(start, "Choose a departure date.");
        ok = false;
      } else clearFieldError(start);
      const guests = Number(guestsInput.value);
      if (!guests || guests < 1) {
        setFieldError(guestsInput, "Enter at least 1 guest.");
        ok = false;
      } else clearFieldError(guestsInput);
      return ok;
    }

    function validateStep2() {
      let ok = true;
      const first = $("#first");
      const last = $("#last");
      const email = $("#email");
      const phone = $("#phone");
      if (!first.value.trim()) {
        setFieldError(first, "First name is required.");
        ok = false;
      } else clearFieldError(first);
      if (!last.value.trim()) {
        setFieldError(last, "Last name is required.");
        ok = false;
      } else clearFieldError(last);
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setFieldError(email, "Enter a valid email address.");
        ok = false;
      } else clearFieldError(email);
      if (!phone.value.trim() || phone.value.trim().replace(/\D/g, "").length < 10) {
        setFieldError(phone, "Enter a valid phone / WhatsApp number.");
        ok = false;
      } else clearFieldError(phone);
      $("#form-error").textContent = ok ? "" : "Please fix the highlighted fields.";
      return ok;
    }

    ["journey-select", "guests", "start", "first", "last", "email", "phone", "notes"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => {
        clearFieldError(el);
        updateSummary();
      });
      if (el) el.addEventListener("change", updateSummary);
    });
    select.addEventListener("change", () => {
      syncGuests();
      syncWhatsAppLinks();
      updateSummary();
    });

    let step = 1;
    const showStep = () => {
      $$("[data-step-panel]").forEach((p) => {
        p.hidden = Number(p.dataset.stepPanel) !== step;
      });
      $$(".steps span").forEach((s, i) => s.classList.toggle("on", i < step));
      $("#back-btn").hidden = step === 1;
      $("#next-btn").textContent = step === 3 ? "Send trip request" : "Continue";
    };

    $("#next-btn").addEventListener("click", () => {
      if (step === 1 && !validateStep1()) return;
      if (step === 2 && !validateStep2()) return;
      if (step === 3) {
        confirmBooking();
        return;
      }
      step += 1;
      showStep();
      updateSummary();
    });
    $("#back-btn").addEventListener("click", () => {
      step = Math.max(1, step - 1);
      showStep();
    });

    function state() {
      const j = getJourney(select.value);
      const guests = Math.max(j.minPax || 1, Number($("#guests").value) || 2);
      const suite = LOOP.suites.find((s) => s.id === $("input[name=suite]:checked").value);
      const addons = $$("input[name=addon]:checked").map((i) => LOOP.addons.find((a) => a.id === i.value));
      const perPerson = Math.round(j.price * (1 + suite.add));
      const base = perPerson * guests;
      const extra = addons.reduce((s, a) => s + a.price, 0);
      return { j, guests, suite, addons, perPerson, base, extra, total: Math.round(base + extra), start: start.value };
    }

    function updateSummary() {
      const s = state();
      const col = colOf(s.j);
      $("#sum-title").textContent = s.j.title;
      const addonRows = s.addons.length
        ? s.addons.map((a) => `<div class="row"><span>${a.name}</span><span>${money(a.price)}</span></div>`).join("")
        : `<div class="row"><span>Additions</span><span>None</span></div>`;
      $("#sum-body").innerHTML = `
        <div class="row"><span>Selected trip</span><span>${s.j.sealed ? "Surprise sealed" : s.j.country}</span></div>
        <div class="row"><span>Collection</span><span>${col.name}</span></div>
        <div class="row"><span>Duration</span><span>${s.j.duration}</span></div>
        <div class="row"><span>Departure</span><span>${s.start || "—"}</span></div>
        <div class="row"><span>Guests</span><span>${s.guests}</span></div>
        <div class="row"><span>From price / person</span><span>${money(s.j.price)}</span></div>
        <div class="row"><span>${s.suite.name} suite</span><span>${money(s.perPerson)} × ${s.guests}</span></div>
        ${addonRows}
      `;
      $("#sum-total").textContent = money(s.total);
      const img = $("#sum-img");
      if (img && s.j.image) {
        img.src = s.j.image;
        img.alt = s.j.title;
      }
    }

    function confirmBooking() {
      const s = state();
      const ref = "LOOP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const booking = {
        ref,
        journeyId: s.j.id,
        title: s.j.title,
        country: s.j.country,
        image: s.j.image,
        collection: s.j.collection,
        currency: getCurrency(),
        guests: s.guests,
        suite: s.suite.name,
        addons: s.addons.map((a) => a.name),
        start: s.start,
        total: s.total,
        name: `${$("#first").value} ${$("#last").value}`.trim(),
        email: $("#email").value,
        phone: $("#phone").value,
        notes: $("#notes").value,
        created: new Date().toISOString(),
      };
      const all = loadBookings();
      all.unshift(booking);
      saveBookings(all);

      const waMsg = [
        `Hi Loop Trips — trip request (ref ${ref})`,
        `Trip: ${s.j.title} (${s.j.country})`,
        `Dates: ${s.start}`,
        `Travellers: ${s.guests}`,
        `Suite: ${s.suite.name}`,
        s.addons.length ? `Additions: ${s.addons.map((a) => a.name).join(", ")}` : "",
        `Estimated total: ${money(s.total)}`,
        `Name: ${booking.name}`,
        `Email: ${booking.email}`,
        `Phone: ${booking.phone}`,
        booking.notes ? `Notes: ${booking.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      const waHref = waBookingLink(waMsg);

      $("#wizard").hidden = true;
      $("#confirm").hidden = false;
      $("#ref-code").textContent = ref;
      $("#confirm-copy").textContent = `${s.j.title} · ${s.guests} guest${s.guests > 1 ? "s" : ""} · departing ${s.start} · ${money(s.total)}. Send this request on WhatsApp so the desk can confirm your itinerary.`;
      const confirmWa = $("#confirm-wa");
      if (confirmWa) confirmWa.href = waHref;
      window.open(waHref, "_blank", "noopener");
    }

    syncGuests();
    updateSummary();
    showStep();
  }

  function renderBookings() {
    const list = loadBookings();
    const box = $("#booking-list");
    if (!list.length) {
      box.innerHTML = `<p class="empty">No trip requests yet. <a href="book.html">Request a journey</a> or <a href="${waBookingLink(waEnquiryMessage())}" target="_blank" rel="noopener">WhatsApp the desk</a>.</p>`;
      return;
    }
    box.innerHTML = list
      .map(
        (b) => `<article class="booking-item">
          <img src="${b.image || ""}" alt="${b.title}">
          <div>
            <p class="eyebrow">${b.ref}</p>
            <h3 style="font-size:1.6rem">${b.title}</h3>
            <p style="color:var(--mute);font-size:.9rem">${b.country} · ${b.start} · ${b.guests} guests · ${b.suite}</p>
          </div>
          <div style="text-align:right">
            <div class="price">${money(b.total)}</div>
            <button class="btn btn-dark" style="margin-top:10px;padding:8px 12px" data-cancel="${b.ref}">Release</button>
          </div>
        </article>`
      )
      .join("");

    box.addEventListener("click", (e) => {
      const ref = e.target.dataset.cancel;
      if (!ref) return;
      saveBookings(loadBookings().filter((b) => b.ref !== ref));
      renderBookings();
    });
  }

  function renderContact() {
    const b = brand();
    const desk = $("#contact-desk");
    if (desk) {
      desk.innerHTML = `
        <p class="eyebrow">Desk</p>
        <h2>${b.city || "Hyderabad"}</h2>
        <p class="contact-address">${b.addressFull || ""}</p>
        <ul class="contact-list">
          <li><span>WhatsApp</span><a href="${b.whatsappLink}" target="_blank" rel="noopener">${b.whatsapp || b.phone}</a></li>
          <li><span>Phone</span><a href="tel:${b.phoneTel}">${b.phone}</a></li>
          <li><span>Email</span><a href="mailto:${b.email}">${b.email}</a></li>
          <li><span>Hours</span><span>${b.hours}</span></li>
          ${b.instagramHandle ? `<li><span>Instagram</span><a href="${b.instagram}" target="_blank" rel="noopener">${b.instagramHandle}</a></li>` : ""}
          ${b.license ? `<li><span>License</span><span>${b.license}</span></li>` : ""}
          ${b.iata ? `<li><span>IATA</span><span>${b.iata}</span></li>` : ""}
        </ul>
        <a class="btn btn-fill wa-btn" href="${waBookingLink(waEnquiryMessage())}" target="_blank" rel="noopener">WhatsApp the desk</a>
        <p class="contact-note">Message us on WhatsApp for the fastest reply, or <a href="book.html">request a trip</a> with dates and budget.</p>
      `;
    }
    const waHref = waBookingLink(waEnquiryMessage());
    ["contact-wa", "contact-done-wa"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = waHref;
    });
    const form = $("#contact-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("#c-name");
        const email = $("#c-email");
        const about = $("#c-about");
        const msg = $("#c-msg");
        let ok = true;
        [["c-name", name, "Name is required."], ["c-email", email, "Valid email is required."], ["c-msg", msg, "Please write a short message."]].forEach(([, el, text]) => {
          const tip = el.parentElement.querySelector(".field-error") || (() => {
            const p = document.createElement("p");
            p.className = "field-error";
            el.parentElement.appendChild(p);
            return p;
          })();
          const bad = !el.value.trim() || (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
          el.classList.toggle("invalid", bad);
          tip.textContent = bad ? text : "";
          if (bad) ok = false;
        });
        if (!ok) return;
        const waMsg = [
          "Hi Loop Trips!",
          `Name: ${name.value.trim()}`,
          `Email: ${email.value.trim()}`,
          about.value.trim() ? `Trip style: ${about.value.trim()}` : "",
          "",
          msg.value.trim(),
        ]
          .filter((line, i, arr) => line || (i > 0 && arr[i - 1]))
          .join("\n");
        const contactWa = waBookingLink(waMsg);
        window.open(contactWa, "_blank", "noopener");
        const doneWa = $("#contact-done-wa");
        if (doneWa) doneWa.href = contactWa;
        form.hidden = true;
        $("#contact-done").hidden = false;
      });
    }
  }

  mountChrome();
  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "collection") renderCollection();
  if (page === "journeys") renderCatalog();
  if (page === "journey") renderDetail();
  if (page === "book") renderBook();
  if (page === "bookings") renderBookings();
  if (page === "contact") renderContact();
  if (page === "about") renderAbout();
})();
