/* =========================================================
   Zhihao Cao — Homepage interactions
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme (initial value is set inline in <head>) ---------- */
  const STORE_KEY = "zc-theme";
  document.getElementById("themeToggle").addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(STORE_KEY, next); } catch (e) {}
  });

  /* ---------- Explore menu ---------- */
  const exploreBtn = document.getElementById("exploreBtn");
  const exploreMenu = document.getElementById("exploreMenu");
  function setMenu(open) {
    exploreMenu.hidden = !open;
    exploreBtn.setAttribute("aria-expanded", String(open));
  }
  exploreBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    setMenu(exploreMenu.hidden);
  });
  exploreMenu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("click", function (e) {
    if (!exploreMenu.hidden && !exploreMenu.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !exploreMenu.hidden) {
      setMenu(false);
      exploreBtn.focus();
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".rv");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    const revObs = new IntersectionObserver(function (entries) {
      // elements that enter together fan in one after another
      entries.filter(function (en) { return en.isIntersecting; }).forEach(function (en, i) {
        en.target.style.transitionDelay = Math.min(i, 4) * 80 + "ms";
        en.target.classList.add("in");
        revObs.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- Carousel arrows ---------- */
  document.querySelectorAll(".arrows[data-for]").forEach(function (bar) {
    const track = document.getElementById(bar.getAttribute("data-for"));
    const prev = bar.querySelector('[data-dir="-1"]');
    const next = bar.querySelector('[data-dir="1"]');
    function update() {
      const max = track.scrollWidth - track.clientWidth - 2;
      bar.hidden = max <= 0;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    bar.addEventListener("click", function (e) {
      const btn = e.target.closest(".arrow");
      if (!btn) return;
      const tile = track.firstElementChild;
      const step = tile.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      track.scrollBy({ left: Number(btn.getAttribute("data-dir")) * step, behavior: reduceMotion ? "auto" : "smooth" });
    });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------- Carousel pager dots ---------- */
  document.querySelectorAll(".pager[data-for]").forEach(function (pager) {
    const track = document.getElementById(pager.getAttribute("data-for"));
    const cards = Array.from(track.children);
    function startOf(card) {
      return card.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft);
    }
    const dots = cards.map(function (card) {
      const dot = document.createElement("button");
      const title = card.querySelector("h3");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", title ? title.textContent.split(":")[0] : "Show item");
      dot.appendChild(document.createElement("i"));
      dot.addEventListener("click", function () {
        track.scrollTo({ left: startOf(card), behavior: reduceMotion ? "auto" : "smooth" });
      });
      pager.appendChild(dot);
      return dot;
    });
    function update() {
      const max = track.scrollWidth - track.clientWidth;
      let cur = 0;
      pager.hidden = max <= 2;
      if (track.scrollLeft >= max - 2) {
        cur = cards.length - 1; // the last card may never reach the start edge
      } else {
        cards.forEach(function (card, i) {
          if (startOf(card) <= track.scrollLeft + card.offsetWidth / 2) cur = i;
        });
      }
      dots.forEach(function (d, i) {
        d.classList.toggle("on", i === cur);
        d.setAttribute("aria-current", String(i === cur));
      });
    }
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------- Videos: play only while on screen ---------- */
  const videos = document.querySelectorAll("video[autoplay]");
  if (reduceMotion) {
    videos.forEach(function (v) { v.pause(); v.controls = true; });
  } else if ("IntersectionObserver" in window) {
    const vidObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          const p = en.target.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          en.target.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { vidObs.observe(v); });
  }

  /* ---------- BibTeX sheet ---------- */
  const sheet = document.getElementById("bibSheet");
  const bibOut = document.getElementById("bibOut");
  const bibCopy = document.getElementById("bibCopy");
  document.querySelectorAll("[data-bib]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const src = document.getElementById(btn.getAttribute("data-bib"));
      if (!src) return;
      bibOut.textContent = src.textContent;
      bibCopy.textContent = "Copy";
      if (sheet.showModal) sheet.showModal();
      else sheet.setAttribute("open", "");
    });
  });
  function closeSheet() {
    if (sheet.close) sheet.close();
    else sheet.removeAttribute("open");
  }
  document.getElementById("bibClose").addEventListener("click", closeSheet);
  sheet.addEventListener("click", function (e) {
    // clicks on the backdrop land on the dialog itself, outside its box
    const r = sheet.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (e.target === sheet && outside) closeSheet();
  });
  bibCopy.addEventListener("click", function () {
    const text = bibOut.textContent;
    function done() { bibCopy.textContent = "Copied"; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, selectAll);
    } else {
      selectAll();
    }
    function selectAll() {
      const range = document.createRange();
      range.selectNodeContents(bibOut);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      bibCopy.textContent = "Selected";
    }
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
