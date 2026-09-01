(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const money = (n) => {
    const cur = localStorage.getItem("loop_currency") === "USD" ? "USD" : "INR";
    const value = cur === "USD" ? Math.round(Number(n) / 83) : Math.round(Number(n));
    return new Intl.NumberFormat(cur === "USD" ? "en-US" : "en-IN", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const colOf = (j) =>
    (LOOP.collections || []).find((c) => c.id === j.collection) || LOOP.world;

  const MONTHS = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  };

  const SEASONS = {
    winter: [12, 1, 2],
    summer: [6, 7, 8],
    spring: [3, 4, 5],
    autumn: [9, 10, 11],
    fall: [9, 10, 11],
    monsoon: [6, 7, 8, 9],
  };

  const THEME_WORDS = {
    Coast: ["beach", "beaches", "island", "islands", "ocean", "sea", "honeymoon", "lagoon", "atoll", "coast"],
    Safari: ["safari", "wildlife", "animals", "kenya", "kruger", "mara", "big five"],
    Mountains: ["mountain", "mountains", "himalaya", "himalayas", "alps", "trek", "trekking", "altitude"],
    Heritage: ["heritage", "history", "historic", "palace", "palaces"],
    Wellness: ["wellness", "yoga", "spa", "quiet", "slow", "ayurveda", "peace"],
    Cities: ["city", "cities", "urban", "capital"],
    Culture: ["culture", "food", "festival"],
    Design: ["design", "architecture"],
    Sanatan: ["sanatan", "teerth", "yatra", "darshan", "kashi", "varanasi", "dham", "ujjain", "pilgrimage"],
    Biker: ["bike", "biker", "motorcycle", "ride", "enfield", "leh", "spiti", "ghat"],
    Community: ["community", "table", "circle", "host", "solo but not alone"],
    Solar: ["solar", "surya", "sun", "konark", "modhera", "solstice", "rann"],
    Solo: ["solo", "alone", "myself", "single"],
    Surprise: ["surprise", "sealed", "envelope", "mystery", "don't know", "dont know"],
    Group: ["group", "family", "company", "offsite", "haveli", "friends"],
  };

  const SUGGESTIONS = [
    "Kashi under ₹90,000",
    "Community solo seat in Coorg",
    "Bali from 1 lakh",
    "Solo in Kerala",
    "Family of twelve, a haveli",
    "Maldives, honeymoon, 2 lakh",
  ];

  function monthRange(a, b) {
    const out = [];
    let i = a;
    for (let n = 0; n < 12; n++) {
      out.push(i);
      if (i === b) break;
      i = i === 12 ? 1 : i + 1;
    }
    return out;
  }

  function monthsFromBest(str) {
    if (!str) return [];
    if (/year-round/i.test(str)) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const parts = str.split(",").map((s) => s.trim());
    const found = new Set();
    parts.forEach((part) => {
      const names = part.toLowerCase().match(/[a-z]+/g) || [];
      const nums = names.map((n) => MONTHS[n]).filter(Boolean);
      if (nums.length === 1) found.add(nums[0]);
      if (nums.length >= 2) monthRange(nums[0], nums[1]).forEach((m) => found.add(m));
    });
    return [...found];
  }

  function inrPrice(j) {
    return j.price;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function createConcierge(options = {}) {
    const stage = $(options.stage || "#ai-stage");
    const form = $(options.form || "#ai-form");
    const input = $(options.input || "#ai-input");
    if (!stage || !form || !input) return null;

    const compact = Boolean(options.compact);
    const state = {
      history: [],
      intent: {},
      lastIds: [],
    };

    function parseIntent(text, prev) {
      const q = text.toLowerCase().replace(/[’]/g, "'");
      const intent = { ...(prev || {}) };
      intent.raw = text;

      const lakh = q.match(/([\d.]+)\s*lakh/);
      const rupee =
        q.match(/₹\s*([\d,]+)/) ||
        q.match(/rs\.?\s*([\d,]+)/i) ||
        q.match(/inr\s*([\d,]+)/);
      const bareBudget =
        q.match(/(?:under|below|less than|around|about|budget(?:\s+of)?|upto|up to)\s*([\d,]+)\b/) ||
        q.match(/\b([\d,]+)\s*(?:budget|max|ceiling)\b/);
      const dollar = q.match(/\$\s*([\d,]+)/);

      if (lakh) {
        intent.budgetInr = Math.round(Number(lakh[1]) * 100000);
        intent.currency = "INR";
      } else if (rupee) {
        intent.budgetInr = Number(rupee[1].replace(/,/g, ""));
        intent.currency = "INR";
      } else if (bareBudget) {
        const n = Number(bareBudget[1].replace(/,/g, ""));
        intent.budgetInr = n < 5000 ? n * 100000 : n;
        intent.currency = "INR";
      } else if (dollar) {
        const n = Number(dollar[1].replace(/,/g, ""));
        intent.budgetInr = n < 5000 ? Math.round(n * 83) : n;
        intent.currency = "INR";
      }

      if (/cheap|budget trip|affordable/.test(q)) {
        intent.budgetInr = Math.min(intent.budgetInr || 50000, 50000);
        intent.currency = "INR";
      }
      if (/luxury|splurge|no budget/.test(q)) {
        delete intent.budget;
        delete intent.budgetInr;
      }

      const dayM = q.match(/(\d+)\s*(?:day|days|d)\b/);
      const nightM = q.match(/(\d+)\s*(?:night|nights|n)\b/);
      if (dayM) intent.days = Number(dayM[1]);
      else if (nightM) intent.days = Number(nightM[1]) + 1;
      else if (/long weekend|weekend/.test(q)) intent.days = 4;
      else if (/two weeks|2 weeks|fortnight/.test(q)) intent.days = 14;
      else if (/a week|one week|1 week/.test(q)) intent.days = 7;
      if (/shorter|fewer days/.test(q) && intent.days) intent.days = Math.max(4, intent.days - 3);
      if (/longer/.test(q) && intent.days) intent.days += 4;

      Object.keys(MONTHS).forEach((name) => {
        if (new RegExp(`\\b${name}\\b`).test(q) && name.length > 2) intent.month = MONTHS[name];
      });
      Object.keys(SEASONS).forEach((s) => {
        if (q.includes(s)) intent.months = SEASONS[s];
      });
      if (intent.month) intent.months = [intent.month];

      if (/europe/.test(q)) intent.region = "Europe";
      if (/africa/.test(q)) intent.region = "Africa";
      if (/\bindia\b/.test(q)) intent.region = "India";
      if (/\basia\b/.test(q)) intent.region = "Asia";
      if (/island|islands|beach|beaches|maldives|seychelles/.test(q)) intent.regionPref = "Islands";
      if (/oceania|zealand|australia/.test(q)) intent.region = "Oceania";
      if (/middle east|dubai/.test(q)) intent.region = "Middle East";
      if (/america|usa|united states|canada|brazil|peru|south america|north america/.test(q)) intent.region = "Americas";
      if (/russia|moscow|petersburg/.test(q)) intent.region = "Europe";

      if (/sanatan|teerth|yatra|darshan|kashi|char dham|ujjain|dwarka|rameswaram/.test(q))
        intent.collection = "sanatan";
      if (/\bbike|\bbiker|motorcycle|manali to leh|spiti|enfield/.test(q)) intent.collection = "biker";
      if (/community|a table|coorg table|kutch circle|meghalaya/.test(q)) intent.collection = "community";
      if (/solar|surya|konark|modhera|solstice|white sun/.test(q)) intent.collection = "solo";
      if (/\bsolo\b|alone|by myself|just me/.test(q)) intent.collection = "solo";
      if (/surprise|sealed|envelope|mystery|don't know|dont know|surprise me/.test(q))
        intent.collection = "surprise";
      if (/group|haveli|offsite|family of|chairs/.test(q)) intent.collection = "group";

      Object.keys(THEME_WORDS).forEach((theme) => {
        if (THEME_WORDS[theme].some((w) => new RegExp(`\\b${w}\\b`).test(q))) intent.theme = theme;
      });
      if (/honeymoon|anniversary|romantic/.test(q)) {
        intent.theme = intent.theme || "Surprise";
        intent.vibe = "romantic";
      }
      if (/family/.test(q)) intent.vibe = "family";
      if (/warm|tropical/.test(q)) intent.warm = true;
      if (/cold|snow|alpine/.test(q)) intent.cold = true;
      if (/remote|quiet|away/.test(q)) intent.quiet = true;

      const placeHit = LOOP.journeys.find((j) => {
        const hay = `${j.country} ${j.title} ${j.locations.join(" ")}`.toLowerCase();
        return hay.split(/[^a-z]+/).some((w) => w.length > 3 && q.includes(w));
      });
      if (placeHit) intent.place = placeHit.country;

      if (/not that|something else|other options|different/.test(q)) intent.exclude = state.lastIds.slice();

      return intent;
    }

    function scoreTrip(j, intent) {
      let score = 8;
      const reasons = [];
      const col = colOf(j);
      const hay = `${j.title} ${j.country} ${j.region} ${j.theme} ${j.collection} ${j.locations.join(" ")} ${j.blurb}`.toLowerCase();

      if (intent.exclude && intent.exclude.includes(j.id)) return { score: -100, reasons };

      if (intent.collection && j.collection === intent.collection) {
        score += 48;
        reasons.push(`${col.name} — the way of leaving you named.`);
      }

      if (intent.place && hay.includes(intent.place.toLowerCase())) {
        score += 55;
        reasons.push(`It is in ${j.country}, which you named.`);
      }
      if (intent.region && j.region === intent.region) {
        score += 32;
        reasons.push(`${j.region} — the region you asked for.`);
      }
      if (intent.regionPref && (j.region === intent.regionPref || j.theme === "Coast")) {
        score += 28;
        reasons.push("Water, and time to use it.");
      }
      if (intent.theme && (j.theme === intent.theme || j.collection === String(intent.theme).toLowerCase())) {
        score += 30;
        reasons.push(`${j.theme} is the point of this itinerary.`);
      }

      if (intent.budgetInr) {
        const p = inrPrice(j);
        if (p <= intent.budgetInr) {
          score += 26;
          reasons.push(`${money(j.price)} sits inside your ceiling.`);
        } else if (p <= intent.budgetInr * 1.15) {
          score += 6;
        } else {
          score -= 35;
        }
      }

      if (intent.days) {
        const d = Math.abs(j.days - intent.days);
        if (d <= 1) {
          score += 24;
          reasons.push(`${j.duration} matches the length you want.`);
        } else if (d <= 3) {
          score += 12;
          reasons.push(`${j.duration} is close to ${intent.days} days.`);
        } else if (d <= 6) score += 2;
        else score -= 12;
      }

      if (intent.months && intent.months.length) {
        const good = monthsFromBest(j.bestTime);
        const ok = intent.months.some((m) => good.includes(m));
        if (ok) {
          score += 22;
          reasons.push(`Best in ${j.bestTime}.`);
        } else if (good.length) {
          score -= 18;
        }
      }

      if (intent.vibe === "romantic" && (j.sealed || ["Coast", "Wellness", "Surprise"].includes(j.theme))) {
        score += 14;
        reasons.push("Built for two.");
      }
      if (intent.vibe === "family" && j.collection === "group") {
        score += 20;
        reasons.push("A house, not a hotel corridor.");
      }
      if (intent.warm && (j.theme === "Coast" || j.region === "Islands" || j.collection === "solo")) {
        score += 12;
      }
      if (intent.cold && (j.theme === "Mountains" || j.collection === "biker" || /nordic|swiss|kashmir|ladakh|japan/i.test(hay))) {
        score += 12;
      }
      if (intent.quiet && ["Wellness", "Mountains", "Sanatan", "Surprise"].includes(j.theme)) score += 8;

      const words = (intent.raw || "").toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
      words.forEach((w) => {
        if (hay.includes(w)) score += 4;
      });

      if (j.featured) score += 3;
      if (j.collection && j.collection !== "world") score += 4;
      return { score, reasons };
    }

    function recommend(intent) {
      const ranked = LOOP.journeys
        .map((j) => {
          const { score, reasons } = scoreTrip(j, intent);
          return { j, score, reasons };
        })
        .sort((a, b) => b.score - a.score);

      let picks = ranked.filter((r) => r.score >= 12).slice(0, 3);
      if (picks.length < 3) picks = ranked.slice(0, 3);
      return picks;
    }

    function speak(intent, picks) {
      const bits = [];
      if (intent.collection) bits.push(intent.collection);
      if (intent.place) bits.push(intent.place);
      if (intent.region && !intent.place) bits.push(intent.region);
      if (intent.days) bits.push(`${intent.days} days`);
      if (intent.budgetInr) bits.push(`up to ${money(intent.budgetInr)}`);
      if (intent.theme && !intent.collection) bits.push(intent.theme.toLowerCase());
      const frame = bits.length ? bits.join(" · ") : "what you described";
      const top = picks[0];
      if (compact) {
        const n = picks.length;
        return `${n} package${n === 1 ? "" : "s"} for ${frame} — from ${money(top.j.price)}.`;
      }
      return `For ${frame}, I would start with ${top.j.title}. ${top.reasons[0] || top.j.blurb} The other two are close. Open one, or tell me to go shorter, cheaper, or more Indian.`;
    }

    function card(p) {
      const col = colOf(p.j);
      const cities = p.j.sealed
        ? "Revealed 48 hours before you fly"
        : (p.j.locations || []).slice(0, 3).join(" · ");
      const status = p.j.status && p.j.status !== "Open"
        ? `<span class="map-rec-status">${escapeHtml(p.j.status)}</span>`
        : "";

      if (compact) {
        return `<article class="map-rec-card">
          <a class="map-rec-media" href="/trip/${p.j.id}">
            <img src="${p.j.image || ""}" alt="${p.j.title}" loading="lazy">
            ${status}
          </a>
          <div class="map-rec-body">
            <p class="map-rec-kicker">${col.name} · ${p.j.country}</p>
            <h3><a href="/trip/${p.j.id}">${p.j.title}</a></h3>
            <p class="map-rec-cities">${cities || p.j.blurb || ""}</p>
            <div class="map-rec-foot">
              <span class="map-rec-price">From ${money(p.j.price)}</span>
              <span class="map-rec-duration">${p.j.duration}</span>
            </div>
            <div class="map-rec-actions">
              <a class="btn btn-fill" href="/trip/${p.j.id}">View trip</a>
              <a class="btn" href="book.html?id=${p.j.id}">Book</a>
            </div>
          </div>
        </article>`;
      }

      const why = p.reasons.slice(0, 2).join(" ");
      return `<article class="ai-card">
        <a href="/trip/${p.j.id}">
          <img src="${p.j.image || ""}" alt="${p.j.title}">
        </a>
        <div>
          <p class="card-kicker">${col.name} · ${p.j.duration}</p>
          <h3>${p.j.title}</h3>
          <p class="ai-why">${why || p.j.blurb}</p>
          <div class="line">
            <span class="price">From ${money(p.j.price)} / person</span>
            <span>${p.j.status}</span>
          </div>
          <div class="btn-row" style="margin-top:14px">
            <a class="btn btn-fill" href="/trip/${p.j.id}">View trip</a>
            <a class="btn btn-dark" href="book.html?id=${p.j.id}">Book</a>
          </div>
        </div>
      </article>`;
    }

    function renderWelcome() {
      if (compact) {
        stage.innerHTML = `
          <div class="map-concierge-idle">
            <p class="map-concierge-idle-text">Tap a pin on the map — matching packages and from-prices appear here.</p>
          </div>`;
        return;
      }
      stage.innerHTML = `
        <div class="ai-welcome">
          <p class="eyebrow">Loop Concierge</p>
          <h1>Tell it how you travel.</h1>
          <p class="lede">It reads India — Sanatan, biker, community, solo, surprise, group — and the world list. No account. Try a sentence.</p>
          <div class="ai-chips">
            ${SUGGESTIONS.map((s) => `<button type="button" data-ask="${s}">${s}</button>`).join("")}
          </div>
        </div>`;
    }

    function renderThinking() {
      stage.innerHTML = `
        <div class="ai-think">
          <span class="ai-pulse"></span>
          <p>Reading ${LOOP.journeys.length} itineraries…</p>
        </div>`;
    }

    function renderReply(intent, picks, query) {
      state.lastIds = picks.map((p) => p.j.id);
      const follow = ["Cheaper", "Shorter", "More Indian", "Surprise me", "Something else"];
      if (compact) {
        stage.innerHTML = `
          <div class="ai-reply map-rec-reply">
            <p class="map-rec-summary">${speak(intent, picks)}</p>
            <div class="map-rec-grid">${picks.map(card).join("")}</div>
            <div class="ai-chips map-rec-chips">
              ${follow.map((s) => `<button type="button" data-ask="${s}">${s}</button>`).join("")}
            </div>
          </div>`;
        return;
      }
      stage.innerHTML = `
        <div class="ai-reply">
          <p class="ai-you">${escapeHtml(query)}</p>
          <h2>${speak(intent, picks)}</h2>
          <div class="ai-results">${picks.map(card).join("")}</div>
          <div class="ai-chips">
            ${follow.map((s) => `<button type="button" data-ask="${s}">${s}</button>`).join("")}
          </div>
        </div>`;
    }

    async function ask(text) {
      const q = text.trim();
      if (!q) return;
      input.value = "";
      state.intent = parseIntent(q, state.intent);
      if (/more indian/.test(q.toLowerCase())) state.intent.region = "India";
      state.history.push(q);
      renderThinking();
      await new Promise((r) => setTimeout(r, 720));
      const picks = recommend(state.intent);
      renderReply(state.intent, picks, q);
      stage.scrollTo({ top: 0, behavior: "smooth" });
      if (typeof options.onReply === "function") options.onReply(q, picks);
    }

    if (options.welcome !== false) renderWelcome();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      ask(input.value);
    });
    stage.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ask]");
      if (btn) ask(btn.dataset.ask);
    });

    return { ask, stage, input, renderWelcome };
  }

  window.LoopConcierge = { create: createConcierge };

  if (document.body.dataset.page === "concierge") {
    const api = createConcierge();
    if (!api) return;

    const params = new URLSearchParams(location.search);
    const about = params.get("about");
    const q = params.get("q");
    if (about) {
      const j = LOOP.journeys.find((x) => x.id === about);
      if (j) api.ask(`Tell me about ${j.title} in ${j.country}, and trips like it`);
    } else if (q) {
      api.ask(q);
    } else {
      api.input.focus();
    }
  }
})();
