/* 比昨个好 — reads CMS content (content/*.json) and updates pages.
   Fails silently: if a file/field is missing, the static default stays. */
(function () {
  "use strict";
  var qAll = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var q = function (s, r) { return (r || document).querySelector(s); };
  var byId = function (id) { return document.getElementById(id); };

  function getJSON(path) {
    return fetch(path, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function setT(id, v) { var e = byId(id); if (e && v != null) e.textContent = v; }
  function setH(id, v) { var e = byId(id); if (e && v != null) e.innerHTML = String(v).split(" / ").map(esc).join("<br>"); }
  function pad(n) { return ("0" + n).slice(-2); }

  /* ---------- contact / QR (all pages) ---------- */
  function applySettings(cfg) {
    if (!cfg) return;
    if (cfg.email) {
      qAll('a[href^="mailto:"]').forEach(function (a) { a.href = "mailto:" + cfg.email; });
      qAll('[data-site="email"]').forEach(function (el) {
        el.textContent = cfg.email;
        if (el.tagName === "A") el.href = "mailto:" + cfg.email;
      });
    }
    if (cfg.company) qAll('[data-site="company"]').forEach(function (el) { el.textContent = cfg.company; });
    if (cfg.wechat_qr) { var img = q('[data-site="qr"]'); if (img) img.src = cfg.wechat_qr; }
    if (cfg.wechat_note) { var n = q('[data-site="qr-note"]'); if (n) n.innerHTML = esc(cfg.wechat_note); }
    qAll('[data-site="phone"]').forEach(function (el) {
      if (cfg.phone) { el.textContent = cfg.phone; el.style.display = ""; } else { el.style.display = "none"; }
    });
  }

  /* ---------- homepage ---------- */
  function applyHome(d) {
    if (!d) return;
    setT("hm-hero-eyebrow", d.hero_eyebrow);
    setT("hm-h1a", d.hero_l1); setT("hm-h1b", d.hero_l2_prefix); setT("hm-h1c", d.hero_l2_accent);
    setT("hm-hero-lead", d.hero_lead);
    if (Array.isArray(d.hero_tags)) {
      var t = byId("hm-hero-tags");
      if (t) t.innerHTML = d.hero_tags.map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join("");
    }
    if (Array.isArray(d.oi_rows)) {
      var ol = byId("hm-oi");
      if (ol) ol.innerHTML = d.oi_rows.map(function (r, i) {
        var act = i === d.oi_rows.length - 1 ? " is-active" : "";
        return '<li class="sig-row' + act + '"><span class="sig-idx">' + pad(i + 1) +
          '</span><span class="sig-stage"><b>' + esc(r.cn) + "</b><em>" + esc(r.en) +
          '</em></span><span class="sig-state">' + esc(r.state) + "</span></li>";
      }).join("");
    }
    setH("hm-funnel-head", d.funnel_head);
    setT("hm-fn-title", d.fn_title); setT("hm-fn-sub", d.fn_sub);
    if (Array.isArray(d.fn_rows)) {
      var ul = byId("hm-fn"); var bc = ["b1", "b2", "b3"];
      if (ul) ul.innerHTML = d.fn_rows.map(function (r, i) {
        var hot = r.hot ? " hot" : "";
        return '<li class="fn-row"><span class="fn-badge ' + (bc[i] || "b3") + '">' + esc(r.badge) +
          '</span><span class="fn-body"><b>' + esc(r.name) + "</b><em>" + esc(r.tactics) +
          '</em></span><span class="fn-goal' + hot + '">' + esc(r.goal) + "</span></li>";
      }).join("");
    }
    setT("hm-fn-note", d.fn_note);
    setT("hm-cap-head", d.cap_head);
    if (Array.isArray(d.caps)) {
      var cg = byId("hm-caps");
      if (cg) cg.innerHTML = d.caps.map(function (c, i) {
        return '<div class="cap reveal in"><span class="cap-no">' + pad(i + 1) + "</span><h3>" +
          esc(c.title) + '</h3><span class="cap-en">' + esc(c.en) + "</span><p>" + esc(c.desc) + "</p></div>";
      }).join("");
    }
    setT("hm-expand-head", d.expand_head);
    setT("hm-cta-eyebrow", d.cta_eyebrow);
    setH("hm-cta-head", d.cta_head);
    setT("hm-cta-sub", d.cta_sub);
  }

  /* ---------- content-marketing (business) page ---------- */
  function applyBusiness(d) {
    if (!d) return;
    setT("bz-eyebrow", d.eyebrow); setT("bz-h1", d.title); setT("bz-lead", d.lead);
    if (Array.isArray(d.plats)) {
      var pc = byId("bz-plats");
      if (pc) pc.innerHTML = d.plats.map(function (pl, i) {
        return '<div class="plat"><span class="pi">' + esc(pl.tag_en) + "</span><h3>" + esc(pl.title) +
          "</h3><p>" + esc(pl.desc) + '</p><span class="pmark">' + pad(i + 1) + "</span></div>";
      }).join("");
    }
    setT("bz-cta-eyebrow", d.cta_eyebrow); setH("bz-cta-head", d.cta_head); setT("bz-cta-sub", d.cta_sub);
  }

  /* ---------- drama ---------- */
  function applyFeatured(f) {
    if (!f) return;
    var img = byId("ft-poster");
    if (img && f.poster) { img.src = f.poster; if (f.title_en) img.alt = f.title_en + " 海报"; }
    setT("ft-genre", f.genre); setT("ft-title-en", f.title_en); setT("ft-title-cn", f.title_cn);
    var tag = byId("ft-tagline");
    if (tag) { if (f.tagline) { tag.textContent = f.tagline; tag.style.display = ""; } else { tag.style.display = "none"; } }
  }
  function renderSlate(list) {
    var wall = byId("poster-wall");
    if (!wall || !list || !list.length) return;
    wall.innerHTML = list.map(function (w) {
      var live = w.live ? '<span class="live"><i></i>热播 · TikTok</span>' : "";
      var alt = esc((w.title_cn || "") + " " + (w.title_en || "") + (w.genre ? " · " + w.genre : ""));
      return '<a class="poster' + (w.live ? " is-live" : "") + '" href="#"><img src="' +
        esc(w.poster) + '" alt="' + alt + '" loading="lazy">' + live + "</a>";
    }).join("");
  }

  function boot() {
    getJSON("content/settings.json").then(applySettings);
    if (byId("hm-hero-eyebrow")) getJSON("content/home.json").then(applyHome);
    if (byId("bz-eyebrow")) getJSON("content/business.json").then(applyBusiness);
    if (document.body && document.body.getAttribute("data-page") === "drama") {
      getJSON("content/works.json").then(function (w) { if (!w) return; applyFeatured(w.featured); renderSlate(w.slate); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
