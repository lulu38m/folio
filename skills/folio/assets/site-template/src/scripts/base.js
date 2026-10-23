// folio base script: reveal on scroll, copy-email helper, fit-to-width text. No dependencies.
// Loaded by layouts/Base.astro. The "js" class is set earlier, inline in <head>, so nothing flashes.
document.documentElement.classList.add("js");

// Reveal: elements with data-reveal get .in once they enter. Siblings in a group get --i for stagger.
(() => {
  const els = [...document.querySelectorAll("[data-reveal]")];
  document.querySelectorAll("[data-stagger]").forEach((g) =>
    [...g.querySelectorAll("[data-reveal]")].forEach((el, i) => el.style.setProperty("--i", i)));
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
  // Anything already on the first screen is revealed at once (in its stagger order); the rest on scroll.
  requestAnimationFrame(() => requestAnimationFrame(() =>
    els.forEach((el) => (el.getBoundingClientRect().top < innerHeight ? el.classList.add("in") : io.observe(el)))));
  // Safety: anything above the fold or still hidden after 2.5 s is shown.
  setTimeout(() => {
    els.forEach((el) => el.classList.add("in"));
    document.querySelectorAll(".draw-gate").forEach((el) => el.classList.add("drawn"));
  }, 2500);
})();

// Copy email: <button data-copy="name@example.com" data-done="Copié">Copier l'adresse</button>
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const label = btn.textContent;
    try { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = btn.dataset.done || "Copied"; }
    catch { location.href = "mailto:" + btn.dataset.copy; return; }
    btn.setAttribute("aria-live", "polite");
    setTimeout(() => { btn.textContent = label; }, 2000);
  });
});

// Fit text to its container's width: <span data-fit>Long Name</span> inside a block element.
// Measures at 100px and scales, so a display line runs exactly margin to margin.
(() => {
  const fit = () => document.querySelectorAll("[data-fit]").forEach((el) => {
    el.style.fontSize = "100px"; el.style.whiteSpace = "nowrap"; el.style.display = "inline-block";
    const avail = el.parentElement.clientWidth - parseFloat(getComputedStyle(el.parentElement).paddingLeft) - parseFloat(getComputedStyle(el.parentElement).paddingRight);
    const w = el.getBoundingClientRect().width;
    const max = parseFloat(el.dataset.fitMax || "9999");
    el.style.fontSize = Math.min(max, (100 * avail) / w * 0.995) + "px";
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
  let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fit, 80); });
})();
