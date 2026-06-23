/* =========================================================
   Zhihao Cao — Homepage interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const STORE_KEY = "zc-theme";

  function applyTheme(t) {
    root.setAttribute("data-theme", t);
  }
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }
  initTheme();
  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(STORE_KEY, next); } catch (e) {}
  });

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  function closeMenu() { burger.classList.remove("open"); navLinks.classList.remove("open"); }
  burger.addEventListener("click", function () {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- Scroll progress + back-to-top + navbar shadow ---------- */
  const progress = document.getElementById("navProgress");
  const toTop = document.getElementById("toTop");
  function onScroll() {
    const st = window.scrollY || document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
    toTop.classList.toggle("show", st > 480);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Scroll-spy ---------- */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const linkMap = {};
  document.querySelectorAll(".nav__link").forEach(function (l) {
    const id = l.getAttribute("href").slice(1);
    linkMap[id] = l;
  });
  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        const id = en.target.id;
        Object.values(linkMap).forEach(function (l) { l.classList.remove("active"); });
        if (linkMap[id]) linkMap[id].classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        revObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
    revObs.observe(el);
  });

  /* ---------- BibTeX toggle + copy ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1600);
  }
  document.querySelectorAll("[data-bibtex]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const key = btn.getAttribute("data-bibtex");
      const pre = document.getElementById("bib-" + key);
      if (!pre) return;
      const opening = !pre.classList.contains("show");
      pre.classList.toggle("show");
      if (opening) {
        const text = pre.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () { showToast("BibTeX copied to clipboard"); },
            function () { showToast("BibTeX expanded"); }
          );
        } else {
          showToast("BibTeX expanded");
        }
      }
    });
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    try { yearEl.textContent = String(new Date().getFullYear()); } catch (e) {}
  }
})();
