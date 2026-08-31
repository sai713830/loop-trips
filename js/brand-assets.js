(function (global) {
  function isAdminPage() {
    return Boolean(document.querySelector('link[href="/css/admin.css"]'));
  }

  function root() {
    return isAdminPage() ? "/" : "";
  }

  function asset(path) {
    return `${root()}${path.replace(/^\//, "")}`;
  }

  const assets = {
    logo: asset("img/logo.png"),
    logoMark: asset("img/logo-mark.png"),
    logoAlt: "Loop Trips — Bharat first, world beyond",
    faviconSvg: asset("favicon.svg"),
    faviconPng: asset("img/logo.png"),
    appleTouch: asset("img/apple-touch-icon.png"),
    ogImage: asset("img/logo.png"),
    themeColor: "#161412",
  };

  global.LOOP_BRAND_ASSETS = assets;

  function upsertLink(rel, href, attrs) {
    const head = document.head;
    const existing = head.querySelector(`link[rel="${rel}"][href="${href}"]`);
    if (existing) return existing;
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value != null) link.setAttribute(key, value);
    });
    head.appendChild(link);
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

  function injectBrandHead() {
    upsertLink("icon", assets.faviconSvg, { type: "image/svg+xml" });
    upsertLink("icon", assets.faviconPng, { type: "image/png", sizes: "32x32" });
    upsertLink("apple-touch-icon", assets.appleTouch, { sizes: "180x180" });
    upsertMeta('meta[name="theme-color"]', { name: "theme-color", content: assets.themeColor });

    if (!document.head.querySelector('meta[property="og:image"]')) {
      upsertMeta('meta[property="og:image"]', {
        property: "og:image",
        content: new URL(assets.ogImage, global.location.origin).href,
      });
    }
  }

  injectBrandHead();
})(window);
