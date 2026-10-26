/* RANDPOWERSTATE (PTY) LTD
   UI (nav, lightbox, floating contact, FAQ, case filters, contact form) + motion layer
   (GSAP, ScrollTrigger, Lenis). Everything degrades: without GSAP the page uses CSS
   reveals; with reduced motion it keeps fades and counters but drops pinning,
   parallax and smooth scroll. */
(function () {
  "use strict";

  var html = document.documentElement;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  html.classList.add("js");

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- motion profile ----------
     Full motion is the default; the footer toggle stores "reduced" for visitors
     who want a calmer page. ?motion=reduced|full also works. */
  var q = location.search.match(/[?&]motion=(full|reduced)/);
  if (q) store("rps-motion", q[1]);
  var full = store("rps-motion") !== "reduced";
  if (!full) html.classList.add("no-motion");

  var refresh = function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };

  /* ---------- nav ---------- */
  var toggle = $(".nav-toggle");
  var nav = $(".nav");
  var lenis = null;
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && nav.classList.contains("open")) toggle.click();
    });
  }

  /* ---------- header: solid after scroll, hide on scroll down ---------- */
  var head = $(".site-head");
  var lastY = 0;
  function onScrollHead(y) {
    if (!head) return;
    head.classList.toggle("solid", y > 40);
    if (nav && nav.classList.contains("open")) return;
    head.classList.toggle("hide", y > 320 && y > lastY + 2);
    if (y < lastY - 2) head.classList.remove("hide");
    lastY = y;
  }
  window.addEventListener("scroll", function () { onScrollHead(window.scrollY); }, { passive: true });
  onScrollHead(window.scrollY);

  /* ---------- floating contact button ---------- */
  var fabWrap = document.createElement("div");
  fabWrap.className = "fab-wrap";
  fabWrap.innerHTML =
    '<div class="fab-panel" id="fab-panel" role="dialog" aria-label="Contact RANDPOWERSTATE">' +
      '<header><b>Let’s talk systems.</b><span>WhatsApp is fastest, usually same-day.</span></header>' +
      '<a href="https://wa.me/27788149120?text=Hi%20RANDPOWERSTATE%2C%20I%27d%20like%20to%20find%20out%20more%20about%20your%20services." target="_blank" rel="noopener"><span><small>WhatsApp</small>+27 78 814 9120</span>↗</a>' +
      '<a href="tel:+27788149120"><span><small>Call</small>+27 78 814 9120</span>→</a>' +
      '<a href="mailto:info@randpowerstate.co.za"><span><small>Email</small>info@randpowerstate.co.za</span>→</a>' +
      '<a href="contact.html"><span><small>Visit</small>6 Gunning Street, Kimberley</span>→</a>' +
    '</div>' +
    '<button class="fab" type="button" aria-expanded="false" aria-controls="fab-panel">' +
      '<span>Talk <span class="label-long">to us</span></span><span class="ic" aria-hidden="true">+</span>' +
    '</button>';
  document.body.appendChild(fabWrap);
  setTimeout(function () { fabWrap.classList.add("in"); }, html.classList.contains("is-preloading") ? 3400 : 900);
  var fab = $(".fab", fabWrap);
  var fabPanel = $(".fab-panel", fabWrap);
  function setFab(open) {
    fabPanel.classList.toggle("open", open);
    fab.setAttribute("aria-expanded", open ? "true" : "false");
  }
  fab.addEventListener("click", function () { setFab(!fabPanel.classList.contains("open")); });
  document.addEventListener("click", function (e) { if (!fabWrap.contains(e.target)) setFab(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setFab(false); });
  // tuck it away while a contact block or the footer is on screen
  var hideFor = $$("#contact, .methods, .site-foot");
  if (hideFor.length && "IntersectionObserver" in window) {
    var seen = new Set();
    var fo = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.isIntersecting ? seen.add(en.target) : seen.delete(en.target); });
      fabWrap.classList.toggle("away", seen.size > 0);
      if (seen.size) setFab(false);
    }, { threshold: 0.15 });
    hideFor.forEach(function (el) { fo.observe(el); });
  }

  /* ---------- lightbox ---------- */
  var lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Image preview");
  lb.innerHTML = '<button type="button">Close ✕</button><img alt="">';
  document.body.appendChild(lb);
  var lbImg = $("img", lb), lbBtn = $("button", lb), lastFocus = null;
  function closeLb() { lb.classList.remove("open"); lbImg.removeAttribute("src"); if (lenis) lenis.start(); if (lastFocus) lastFocus.focus(); }
  lbBtn.addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) closeLb(); });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-full]");
    if (!t) return;
    e.preventDefault();
    lastFocus = t;
    var img = $("img", t);
    lbImg.src = t.getAttribute("data-full");
    lbImg.alt = img ? img.alt : "";
    lb.classList.add("open");
    if (lenis) lenis.stop();
    lbBtn.focus();
  });

  /* ---------- FAQ accordion ---------- */
  $$(".faq-item").forEach(function (item) {
    var btn = $(".faq-q", item);
    btn.addEventListener("click", function () {
      var open = !item.classList.contains("open");
      $$(".faq-item.open").forEach(function (o) { if (o !== item) { o.classList.remove("open"); $(".faq-q", o).setAttribute("aria-expanded", "false"); } });
      item.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      setTimeout(refresh, 650);
    });
  });

  /* ---------- case study filters ---------- */
  var filterBtns = $$(".filters button");
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      filterBtns.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      var shown = [];
      $$(".case-card").forEach(function (c) {
        var on = f === "*" || c.getAttribute("data-category") === f;
        c.hidden = !on;
        if (on) shown.push(c);
      });
      if (window.gsap) window.gsap.fromTo(shown, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.05, overwrite: true });
      refresh();
    });
  });

  /* ---------- contact form ----------
     The site is static (GitHub Pages) with no form backend, so the form builds a
     pre-filled mailto: link and hands off to the visitor's email app. To add a
     backend later (Formspree, a serverless function), point the form's action at it. */
  var form = $(".mailto-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = function (n) { return form.querySelector("[name='" + n + "']").value.trim(); };
      var name = val("name"), email = val("email"), subject = val("subject"), message = val("message");
      var msg = $(".form-msg", form);
      if (!name || !email || !subject || !message) {
        msg.textContent = "Please fill in all fields before sending.";
        msg.className = "form-msg show error";
        return;
      }
      location.href = "mailto:info@randpowerstate.co.za?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message);
      msg.textContent = "Your email app should now open with your message pre-filled. Just hit send to reach us.";
      msg.className = "form-msg show ok";
    });
  }

  /* ---------- footer bits ---------- */
  $$("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
  $$(".motion-toggle").forEach(function (b) {
    b.setAttribute("aria-pressed", full ? "true" : "false");
    b.addEventListener("click", function () { store("rps-motion", full ? "reduced" : "full"); location.reload(); });
  });
  var clock = $("[data-clock]");
  if (clock) {
    var tick = function () {
      try { clock.textContent = new Date().toLocaleTimeString("en-ZA", { timeZone: "Africa/Johannesburg", hour: "2-digit", minute: "2-digit" }) + " SAST"; } catch (e) {}
    };
    tick(); setInterval(tick, 30000);
  }

  /* ---------- fallback reveal (no GSAP) ---------- */
  function fallbackReveal() {
    html.classList.remove("is-preloading", "pt-in");
    html.classList.add("ready");
    var h = html.getAttribute("data-hash"), t = h && document.getElementById(h);
    if (t) { t.scrollIntoView(); history.replaceState(null, "", "#" + h); }
    var els = $$(".rv");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  if (!window.gsap || !window.ScrollTrigger) { fallbackReveal(); return; }

  /* =====================================================================
     Motion layer
     ===================================================================== */
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  html.classList.add("has-motion");
  gsap.ticker.lagSmoothing(0);
  var EASE = "expo.out";

  /* smooth, heavy scroll */
  if (window.Lenis && full) {
    lenis = new window.Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.3 });
    lenis.on("scroll", function (e) { ST.update(); onScrollHead(e.scroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        // glide there, then correct once if images loaded mid-flight and moved the target
        lenis.scrollTo(target, { offset: 0, duration: 1.4, onComplete: function () {
          if (Math.abs(target.getBoundingClientRect().top) > 4) lenis.scrollTo(target, { offset: 0, duration: 0.5 });
        } });
        history.replaceState(null, "", id);
      });
    });
  }

  /* scroll progress */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);
  gsap.to(progress, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* split words into masked spans, keeping inline elements */
  function split(el) {
    if (el.dataset.split) return $$(".swi", el);
    el.dataset.split = "1";
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "sw"; w.setAttribute("aria-hidden", "true");
            var i = document.createElement("span"); i.className = "swi"; i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    })(el);
    return $$(".swi", el);
  }

  /* page transition: wipe in on arrival, wipe out on internal navigation */
  var pt = document.createElement("div");
  pt.className = "pt";
  pt.setAttribute("aria-hidden", "true");
  document.body.appendChild(pt);
  if (html.classList.contains("pt-in")) {
    gsap.set(pt, { scaleY: 1, transformOrigin: "top" });
    html.classList.remove("pt-in");
    gsap.to(pt, { scaleY: 0, duration: 1, ease: "expo.inOut", delay: 0.05 });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|https?):/i.test(href) || !/(\.html|^\/)(#.*)?$/.test(href)) return;
    e.preventDefault();
    try { sessionStorage.setItem("rps-pt", "1"); } catch (err) {}
    gsap.set(pt, { transformOrigin: "bottom" });
    gsap.to(pt, { scaleY: 1, duration: 0.7, ease: "expo.inOut", onComplete: function () { location.href = a.href; } });
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) gsap.set(pt, { scaleY: 0 }); });

  /* ---------- hero intro (runs after preloader on the home page) ---------- */
  function heroIntro() {
    var hero = $(".hero, .case-hero, .err");
    if (!hero) { html.classList.add("ready"); return; }
    var tl = gsap.timeline({ defaults: { ease: EASE }, onStart: function () { html.classList.add("ready"); } });
    var h1 = $("h1", hero);
    if (h1) tl.from(split(h1), { yPercent: 115, rotate: 3, duration: 1.4, stagger: 0.05 }, 0);
    var eb = $$(".eyebrow, .crumb", hero);
    if (eb.length) tl.from(eb, { y: 20, opacity: 0, duration: 1, stagger: 0.08 }, 0.1);
    var code = $(".code", hero);
    if (code) tl.from(code, { yPercent: 40, opacity: 0, duration: 1.6 }, 0);
    var mapBg = $(".hero-bg", hero);
    if (mapBg) {
      tl.from(mapBg, { opacity: 0, duration: 2 }, 0);
      // rest slightly overscaled so the cursor parallax never shows an edge
      tl.fromTo($(".map-stage", mapBg), { scale: 1.2 }, { scale: 1.05, duration: 3, ease: "expo.out" }, 0);
      // arterials light up one after another, then the office pin drops in
      var roads = $$(".map-roads path", mapBg);
      roads.forEach(function (p) { var len = p.getTotalLength(); gsap.set(p, { strokeDasharray: len, strokeDashoffset: len }); });
      if (roads.length) tl.to(roads, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", stagger: { each: 0.025, from: "random" } }, 0.8);
      var bits = $$(".map-hole, .map-label", mapBg);
      if (bits.length) tl.from(bits, { opacity: 0, duration: 1 }, 1.6);
      var pin = $(".map-pin", mapBg);
      if (pin) tl.from(pin, { opacity: 0, y: -40, duration: 1.2, ease: "back.out(2)" }, 1.9);
      var credit = $(".map-credit", hero);
      if (credit) tl.from(credit, { opacity: 0, duration: 1 }, 2.2);
    }
    // stagger the glint across the accent words so it reads as one sweep
    $$(".l2 .swi", hero).forEach(function (w, i) { w.style.animationDelay = (2.4 + i * 0.12) + "s"; });
    var rest = $$(".hero-sub > *, .case-hero .lede, .case-hero .btns, .case-hero .filters, .err .lede, .err .btns", hero);
    if (rest.length) tl.from(rest, { y: 30, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.5);
    var bar = $$(".hero-bar > div, .facts > div", hero);
    if (bar.length) tl.from(bar, { y: 40, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.7);
  }

  /* ---------- preloader (first visit per session, home only) ---------- */
  var pre = $(".preloader");
  if (pre && html.classList.contains("is-preloading")) {
    // failsafe: never let a stalled preloader hide the page
    setTimeout(function () {
      if (!html.classList.contains("is-preloading")) return;
      html.classList.remove("is-preloading");
      gsap.set($$(".hero .swi, .hero-photo, .hero-photo img, .hero-sub > *, .hero-bar > div, .hero .eyebrow"), { clearProps: "all" });
      if (lenis) lenis.start();
    }, 7000);
    if (lenis) lenis.stop();
    var count = $(".count", pre), obj = { v: 0 };
    gsap.timeline()
      .to(obj, { v: 100, duration: 1.7, ease: "power3.inOut", onUpdate: function () { count.textContent = String(Math.round(obj.v)).padStart(3, "0"); } })
      .to($(".bar", pre), { scaleX: 1, duration: 1.7, ease: "power3.inOut" }, 0)
      .from($(".name", pre), { yPercent: 100, opacity: 0, duration: 1, ease: EASE }, 0.1)
      .to(pre, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "+=0.15")
      .add(function () { heroIntro(); }, "-=0.55")
      .add(function () {
        html.classList.remove("is-preloading");
        try { sessionStorage.setItem("rps-visited", "1"); } catch (e) {}
        if (lenis) lenis.start();
        ST.refresh();
      });
  } else {
    html.classList.remove("is-preloading");
    // wait for the display font so headings don't reflow mid-animation
    var started = false;
    var go = function () { if (started) return; started = true; heroIntro(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 900);
  }

  /* ---------- hero pin + curtain ---------- */
  var mm = gsap.matchMedia();
  var heroEl = $(".hero");
  if (heroEl && full) {
    mm.add("(min-width: 981px)", function () {
      // one trigger pins the hero and drives its fade, so the fade isn't offset by its own pin.
      // explicit start values: .hero-top is still hidden (pre-intro) when this is created
      gsap.timeline({ scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", pin: true, pinSpacing: false, scrub: true } })
        .fromTo($(".hero-top", heroEl), { yPercent: 0, scale: 1, opacity: 1 }, { yPercent: -12, scale: 0.94, opacity: 0.25, ease: "none", immediateRender: false }, 0)
        .fromTo($(".glow", heroEl), { scale: 1 }, { scale: 1.4, ease: "none", immediateRender: false }, 0);
    });
  }

  /* ---------- hero spotlight + map parallax follow the cursor ---------- */
  if (heroEl && finePointer && full) {
    var pos = $(".map-stage", heroEl);
    var mx = pos && gsap.quickTo(pos, "x", { duration: 1.6, ease: "power3" });
    var my = pos && gsap.quickTo(pos, "y", { duration: 1.6, ease: "power3" });
    heroEl.addEventListener("mousemove", function (e) {
      var r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty("--mx", (e.clientX - r.left) + "px");
      heroEl.style.setProperty("--my", (e.clientY - r.top) + "px");
      if (pos) {
        mx(((e.clientX - r.left) / r.width - 0.5) * -24);
        my(((e.clientY - r.top) / r.height - 0.5) * -16);
      }
    });
    heroEl.addEventListener("mouseleave", function () { if (pos) { mx(0); my(0); } });
  }

  /* ---------- headings: masked word rise ---------- */
  $$("section:not(.hero):not(.case-hero) .h-xl, section:not(.hero):not(.case-hero) .h-lg, .cs-head h2, .photo-band h2, .hend h3, .contact .big").forEach(function (h) {
    var words = split(h);
    gsap.from(words, { yPercent: 115, rotate: 2, duration: 1.3, ease: EASE, stagger: 0.045, scrollTrigger: { trigger: h, start: "top 88%" } });
  });

  /* eyebrows: slide in */
  $$("section:not(.hero):not(.case-hero) .eyebrow").forEach(function (el) {
    gsap.from(el, { x: -24, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: el, start: "top 92%" } });
  });

  /* ---------- light sweep statement ---------- */
  // words light up one by one as you scroll; the current word glows blue
  $$(".sweep").forEach(function (el) {
    var words = split(el);
    gsap.set(words, { opacity: 0.14 });
    var lit = -1;
    ST.create({
      trigger: el, start: "top 80%", end: "bottom 40%", scrub: full ? 0.5 : true,
      onUpdate: function (self) {
        var n = Math.round(self.progress * words.length);
        if (n === lit) return;
        lit = n;
        words.forEach(function (w, i) {
          gsap.to(w, { opacity: i < n ? 1 : 0.14, duration: 0.35, overwrite: true });
          w.classList.toggle("lit", i === n - 1 && n < words.length);
        });
      }
    });
  });

  /* ---------- counters ---------- */
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
  $$("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count")), o = { v: 0 };
    el.textContent = "0";
    ST.create({ trigger: el, start: "top 90%", once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 2, ease: "power3.out", onUpdate: function () { el.textContent = fmt(o.v); } });
    } });
  });

  /* ---------- generic fade-up blocks ---------- */
  if ($(".rv")) {
    ST.batch(".rv", {
      start: "top 90%",
      onEnter: function (batch) { gsap.fromTo(batch, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: EASE, stagger: 0.09, overwrite: true }); }
    });
    gsap.set(".rv", { opacity: 0 });
  }

  /* ---------- boxy cells cascade ---------- */
  ["stats", "pillars", "briefs", "cases", "trio", "quotes", "contact-list", "methods", "steps", "form", "pager"].forEach(function (cls) {
    $$("." + cls).forEach(function (grid) {
      var kids = Array.prototype.slice.call(grid.children);
      gsap.from(kids, { y: 60, opacity: 0, duration: 1.1, ease: EASE, stagger: { each: 0.06, from: "start" }, scrollTrigger: { trigger: grid, start: "top 86%" } });
    });
  });

  /* rows rise as they arrive */
  $$(".svc, .faq-item, .cs-head").forEach(function (row) {
    gsap.from(row, { y: 40, opacity: 0, duration: 1.1, ease: EASE, scrollTrigger: { trigger: row, start: "top 90%" } });
  });

  /* service numerals slide up inside their row */
  $$(".svc .big").forEach(function (n) {
    gsap.from(n, { yPercent: 60, opacity: 0, duration: 1.4, ease: EASE, scrollTrigger: { trigger: n, start: "top 88%" } });
  });

  /* process rail draws as you scroll through the steps */
  $$(".steps-rail i").forEach(function (rail) {
    gsap.to(rail, { scaleX: 1, ease: "none", scrollTrigger: { trigger: rail.closest(".steps-wrap"), start: "top 80%", end: "bottom 60%", scrub: 0.6 } });
  });

  /* ---------- image wipes ---------- */
  function wipe(el, delay) {
    var img = $("img, iframe", el);
    var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%" }, delay: delay || 0 });
    tl.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
    if (img && full) tl.from(img, { scale: 1.3, duration: 1.8, ease: EASE }, 0);
  }
  $$(".shot, .cs-head .logo-cell").forEach(function (el) { wipe(el); });

  /* ---------- parallax ---------- */
  if (full) {
    $$("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.getAttribute("data-parallax")) || 12;
      gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  /* ---------- marquee driven by scroll velocity ---------- */
  $$(".marquee-track").forEach(function (track) {
    track.innerHTML += track.innerHTML; // seamless loop
    var x = 0, dir = -1, boost = 0;
    var half = function () { return track.scrollWidth / 2; };
    if (full) {
      ST.create({ trigger: track, start: "top bottom", end: "bottom top", onUpdate: function (self) {
        dir = self.direction === 1 ? -1 : 1;
        boost = Math.min(Math.abs(self.getVelocity()) / 220, 14);
      } });
    }
    gsap.ticker.add(function (t, dt) {
      var speed = (0.9 + boost) * (dt / 16.7);
      boost *= 0.94;
      x += dir * speed;
      var h = half();
      if (x <= -h) x += h;
      if (x > 0) x -= h;
      gsap.set(track, { x: x });
    });
  });

  /* ---------- horizontal work track (desktop, full motion) ---------- */
  var track = $(".htrack");
  if (track && full) {
    mm.add("(min-width: 981px)", function () {
      var sec = track.closest(".work-sec");
      var bar = $(".hprogress i", sec);
      var dist = function () { return track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft || 0); };
      var tween = gsap.to(track, {
        x: function () { return -dist(); },
        ease: "none",
        scrollTrigger: {
          trigger: $(".hpin", sec) || sec, start: "top top", end: function () { return "+=" + dist(); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { if (bar) gsap.set(bar, { scaleX: self.progress }); }
        }
      });
      $$(".hpanel", track).forEach(function (p) {
        var media = $(".media:not(.logos) img", p);
        if (media) gsap.fromTo(media, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: p, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        gsap.from($$(".body > *", p), { y: 40, opacity: 0, duration: 1, ease: EASE, stagger: 0.06, scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 75%" } });
      });
    });
  }

  /* ---------- footer wordmark fill ---------- */
  $$(".wordmark .fill").forEach(function (f) {
    gsap.fromTo(f, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: f.parentElement, start: "top 95%", end: "bottom bottom", scrub: 0.5 } });
  });

  /* ---------- magnetic buttons ---------- */
  if (finePointer && full) {
    $$(".fab, .btn.primary, .nav .cta, .hpanel .go").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- keep measurements honest as lazy images arrive ---------- */
  var refreshT = null;
  var queueRefresh = function () { clearTimeout(refreshT); refreshT = setTimeout(function () { ST.refresh(); }, 180); };
  $$("img[loading='lazy']").forEach(function (img) { if (!img.complete) img.addEventListener("load", queueRefresh, { once: true }); });

  /* ---------- arriving with #section: settle first, then glide there ---------- */
  window.addEventListener("load", function () {
    ST.refresh();
    var hash = html.getAttribute("data-hash");
    if (!hash) return;
    var target = document.getElementById(hash);
    html.removeAttribute("data-hash");
    if (!target) return;
    setTimeout(function () {
      ST.refresh();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      else target.scrollIntoView({ behavior: full ? "smooth" : "auto" });
      history.replaceState(null, "", "#" + hash);
    }, 500);
  });
})();
