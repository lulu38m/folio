#!/usr/bin/env node
// folio check: open a personal site in a real browser, screenshot it and measure what reads as generated.
// Usage:
//   node check_site.mjs site/dist --out work/check                  (the built Astro site, served locally)
//   node check_site.mjs site/dist --announce --out site/public      (renders /announce/ to announce.png, 1200x627)
//   node check_site.mjs some/page.html --out work/check             (a single HTML file still works)
//   node check_site.mjs site/dist --allow gradient --out work/check (the page's one deliberate break, rules.md §8)
//   node check_site.mjs site/dist --video --out work/check          (records desktop.webm and phone.webm scrolling the page, to watch the motion)
// Needs Playwright with Chromium: npm i -D playwright && npx playwright install chromium
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from "node:fs";
import { resolve, join, dirname, extname, normalize } from "node:path";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

async function loadPlaywright() {
  try { return await import("playwright"); } catch {}
  for (const base of (process.env.NODE_PATH || "").split(":").concat(["/opt/npm-tools/node_modules", "/usr/lib/node_modules", "/usr/local/lib/node_modules"])) {
    if (!base) continue;
    try { return createRequire(join(base, "noop.js"))("playwright"); } catch {}
  }
  console.error("Playwright not found. Install it: npm i -D playwright && npx playwright install chromium");
  process.exit(3);
}

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--") && !["--out", "--allow"].includes(args[args.indexOf(a) - 1]));
const outIdx = args.indexOf("--out");
const out = resolve(outIdx >= 0 ? args[outIdx + 1] : "work/check");
const announce = args.includes("--announce");
const video = args.includes("--video");
// Style FAILs end with a [tag]. One of them may be the page's deliberate break (rules.md §8): it is then
// reported as ALLOWED. Honesty, privacy, legibility and the stack are never tagged, so never allowed.
const BREAKS = ["gradient", "shadow", "blur", "eyebrow", "gauge", "palette", "emoji", "layout"];
const allowIdx = args.indexOf("--allow");
const allow = allowIdx >= 0 ? args[allowIdx + 1] : null;
if (allowIdx >= 0 && (!BREAKS.includes(allow) || args.filter((a) => a === "--allow").length > 1)) {
  console.error(`--allow takes one of: ${BREAKS.join(", ")} (one break per page, rules.md §8)`); process.exit(1);
}
if (!target || !existsSync(target)) { console.error("usage: check_site.mjs <site/dist | page.html> [--out dir] [--announce | --video] [--allow tag]"); process.exit(1); }
mkdirSync(out, { recursive: true });

// A built site (a folder) is served over http on a free local port: its asset paths are absolute (/_astro/…).
const isDir = statSync(target).isDirectory();
let server = null, base = null;
if (isDir) {
  const root = resolve(target);
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
    ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif",
    ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain", ".xml": "application/xml", ".ico": "image/x-icon", ".mp4": "video/mp4" };
  server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let f = normalize(join(root, p));
    if (!f.startsWith(root)) { res.writeHead(403).end(); return; }
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
    if (!existsSync(f)) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "content-type": types[extname(f)] || "application/octet-stream" }).end(readFileSync(f));
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${server.address().port}/`;
  if (!existsSync(join(root, "index.html"))) { console.error(`no index.html in ${root}: build the site first (npm run build)`); process.exit(1); }
}
const url = isDir ? base + (announce ? "announce/" : "") : pathToFileURL(resolve(target)).href;
const { chromium } = await loadPlaywright();
const launchOpts = {};
if (process.env.FOLIO_CHROMIUM) launchOpts.executablePath = process.env.FOLIO_CHROMIUM;
const browser = await chromium.launch(launchOpts);

if (video) {
  // A slow scroll from top to bottom at desktop and phone width, saved as webm: the screenshots do not show motion.
  const { renameSync, readdirSync, rmSync } = await import("node:fs");
  for (const [name, width, height] of [["desktop", 1440, 900], ["phone", 390, 844]]) {
    const dir = join(out, `.video-${name}`);
    const ctx = await browser.newContext({ viewport: { width, height }, recordVideo: { dir, size: { width, height } } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1800);
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let y = 0; y <= H; y += 9) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(28); }
    await page.waitForTimeout(1200);
    await ctx.close();
    const f = readdirSync(dir).find((n) => n.endsWith(".webm"));
    renameSync(join(dir, f), join(out, `${name}.webm`)); rmSync(dir, { recursive: true, force: true });
  }
  console.log(`wrote ${join(out, "desktop.webm")} and phone.webm: watch them; if the motion is what you notice first, take some away`);
  await browser.close();
  server?.close();
  process.exit(0);
}

if (announce) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 627 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const file = join(out, "announce.png");
  await page.screenshot({ path: file });
  const page2 = await browser.newPage({ viewport: { width: 1200, height: 627 }, deviceScaleFactor: 2 });
  await page2.goto(url, { waitUntil: "load" });
  await page2.evaluate(() => document.fonts.ready);
  await page2.waitForTimeout(400);
  await page2.screenshot({ path: join(out, "announce@2x.png") });
  console.log(`wrote ${file} and announce@2x.png`);
  await browser.close();
  server?.close();
  process.exit(0);
}

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "phone", width: 390, height: 844 },
];

const measure = () => {
  const R = { fail: [], warn: [], info: {} };
  const F = (m) => R.fail.push(m), W = (m) => R.warn.push(m);
  const T = (tag, m) => R.fail.push(`${m} [${tag}]`); // a style FAIL, the one kind a deliberate break can lift
  const vw = innerWidth, vh = innerHeight;
  const cs = (el) => getComputedStyle(el);
  const visible = (el) => { const s = cs(el); const r = el.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0; };
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hsl = ({ r, g, b }) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return { h, s: s * 100, l: l * 100 }; };
  const bgOf = (el) => { let e = el; const stack = []; while (e && e.nodeType === 1) { const s = cs(e); if (s.backgroundImage && s.backgroundImage !== "none" && !s.backgroundImage.includes("gradient")) return null; const c = parse(s.backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } e = e.parentElement; } let base = { r: 255, g: 255, b: 255, a: 1 }; for (let i = stack.length - 1; i >= 0; i--) { const c = stack[i]; base = { r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a), a: 1 }; } return base; };
  const all = [...document.body.querySelectorAll("*")].filter((el) => !["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "svg"].includes(el.tagName) && !el.closest("svg"));
  const textEls = all.filter((el) => visible(el) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1));
  const inCode = (el) => !!el.closest("pre,code,kbd,samp");

  // Title and h1
  const h1s = [...document.querySelectorAll("h1")].filter(visible);
  if (h1s.length !== 1) F(`h1: ${h1s.length} visible h1 (need exactly one, on the first screen)`);
  else if (h1s[0].getBoundingClientRect().top + scrollY > vh) F("h1: not on the first screen");

  // Headline line counts
  for (const h of [...document.querySelectorAll("h1,h2,h3")].filter(visible)) {
    // Lines = clusters of text rects on the same line (by vertical centre), whatever the markup (spans, blocks, islands)
    const rects = [];
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      rects.push(...[...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2));
    }
    const lineBoxes = [];
    for (const r of rects.sort((x, y) => x.top - y.top)) {
      const c = (r.top + r.bottom) / 2;
      if (!lineBoxes.some((l) => c >= l.top && c <= l.bottom)) lineBoxes.push({ top: r.top, bottom: r.bottom });
    }
    const lines = lineBoxes.length;
    if (lines > 2) F(`headline over two lines (${lines}): <${h.tagName.toLowerCase()}> "${h.textContent.trim().slice(0, 60)}"`);
  }

  // Overflow
  if (document.documentElement.scrollWidth > vw + 1) {
    const wide = all.filter((el) => visible(el) && (el.getBoundingClientRect().right > vw + 1 || el.getBoundingClientRect().left + el.scrollWidth > vw + 1) && cs(el).overflowX === "visible").slice(0, 3).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""));
    F(`horizontal overflow: page is ${document.documentElement.scrollWidth}px wide (${wide.join(", ")})`);
  }

  // Text sizes
  let tiny = 0, small = 0, smallBody = 0; const sizes = new Set();
  for (const el of textEls) {
    const fs = parseFloat(cs(el).fontSize); sizes.add(Math.round(fs));
    if (fs < 12) tiny++; else if (fs < 13) small++;
    if (["P", "LI", "DD", "TD"].includes(el.tagName) && fs < 15.5 && el.textContent.trim().length > 60) smallBody++;
  }
  if (tiny) F(`text under 12px: ${tiny} element(s)`);
  if (small) W(`text under 13px: ${small} element(s)`);
  if (smallBody > 2) W(`running text under 16px: ${smallBody} paragraph(s)`);
  // Sizes within 2px of each other count as one (clamp() rounding).
  const steps = [...sizes].sort((a, b) => a - b).reduce((acc, x) => (acc.length && x - acc[acc.length - 1] <= 2 ? acc : [...acc, x]), []);
  if (steps.length > 7) F(`too many type sizes: ${steps.length} (${steps.join(", ")}px); five, far apart`);
  else if (steps.length > 5) W(`${steps.length} type sizes (${steps.join(", ")}px); five at most, far apart`);
  R.info.sizes = [...sizes].sort((a, b) => a - b);

  // Fonts
  const fams = new Map();
  for (const el of textEls) { const first = cs(el).fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, ""); fams.set(first, (fams.get(first) || 0) + 1); }
  R.info.families = Object.fromEntries(fams);
  const declared = [...document.fonts].map((f) => ({ family: f.family.replace(/^["']|["']$/g, ""), status: f.status, weight: f.weight, style: f.style }));
  for (const [fam] of fams) {
    const decl = declared.filter((d) => d.family === fam);
    const generic = ["serif", "sans-serif", "monospace", "system-ui", "-apple-system", "inherit"].includes(fam);
    if (!decl.length && !generic) W(`font "${fam}" is used but not self-hosted (system fallback or missing @font-face)`);
    if (decl.length && !decl.some((d) => d.status === "loaded")) F(`font "${fam}" failed to load: the screenshots show a fallback`);
  }
  const textFams = [...fams.keys()].filter((f) => !/mono/i.test(f));
  if (textFams.length > 3) F(`${textFams.length} typefaces in use: ${textFams.join(", ")} (two at most)`);
  else if (textFams.length === 3) W(`three typefaces in use: ${textFams.join(", ")} (two at most)`);
  const overused = ["Inter", "Roboto", "Open Sans", "Poppins", "Montserrat", "Lato", "Raleway", "Nunito", "Space Grotesk", "Playfair Display", "Fraunces", "Instrument Serif", "DM Sans", "DM Serif Display", "Plus Jakarta Sans", "Geist", "Outfit", "Manrope", "Sora", "Syne", "Satoshi", "Clash Display", "General Sans", "Cormorant", "Cormorant Garamond", "Bricolage Grotesque", "JetBrains Mono", "Space Mono", "Oswald", "Bebas Neue", "Anton", "Arial", "Helvetica"];
  for (const f of fams.keys()) if (overused.includes(f)) W(`overused or default face: ${f}`);
  if ([...document.querySelectorAll("link[href]")].some((l) => /fonts\.(googleapis|gstatic)\.com/.test(l.href)) || [...document.querySelectorAll("style")].some((s) => /fonts\.(googleapis|gstatic)\.com/.test(s.textContent))) F("Google Fonts is linked: self-host the fonts (privacy, speed)");

  // Ornament: gradients, shadows, blur, mono, caps, borders, radius
  let grad = 0, shadow = 0, blur = 0, mono = 0, caps = 0, hair = 0, soft = 0, gradText = 0;
  for (const el of all) {
    if (!visible(el)) continue;
    const s = cs(el);
    if (s.backgroundImage.includes("gradient") && !el.closest("[data-scrim]")) grad++;
    if ((s.webkitBackgroundClip === "text" || s.backgroundClip === "text") && s.backgroundImage !== "none") gradText++;
    if (s.boxShadow !== "none" && !el.closest("[data-floats]")) shadow++;
    if (s.textShadow !== "none") shadow++;
    if ((s.backdropFilter && s.backdropFilter !== "none") || /blur/.test(s.filter)) blur++;
    if (textEls.includes(el)) {
      if (/mono|courier|consolas|menlo/i.test(s.fontFamily) && !inCode(el)) mono++;
      const fs = parseFloat(s.fontSize);
      const ls = s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing) / fs;
      const txt = el.textContent.trim();
      const isCaps = s.textTransform === "uppercase" || (txt.length > 3 && txt === txt.toUpperCase() && /[A-ZÀ-Ý]/.test(txt));
      if (isCaps && ls > 0.04 && fs < 17) caps++;
    }
    const inTable = !!el.closest("table,input,textarea,select,[data-ui]");
    if (!inTable) {
      const sides = ["Top", "Right", "Bottom", "Left"].filter((k) => { const w = parseFloat(s["border" + k + "Width"]); const st = s["border" + k + "Style"]; const c = parse(s["border" + k + "Color"]); return w > 0 && w < 2 && st !== "none" && c && c.a > 0.15; });
      if (sides.length) hair++;
      if (s.borderTopStyle === "dashed" || s.borderTopStyle === "dotted") hair++;
      if (el.tagName === "HR") hair++;
    }
    const rad = parseFloat(s.borderTopLeftRadius);
    const filled = (parse(s.backgroundColor) || { a: 0 }).a > 0 || parseFloat(s.borderTopWidth) > 0;
    if (filled && rad >= 6 && rad <= 20 && el.getBoundingClientRect().width > 120) soft++;
  }
  if (grad) T("gradient", `gradients: ${grad} element(s) (flat colour; a scrim over a photo must carry data-scrim)`);
  if (gradText) T("gradient", `gradient text: ${gradText}`);
  if (shadow) T("shadow", `shadows or glows on ${shadow} element(s) at rest (only things that float, marked data-floats)`);
  if (blur) T("blur", `blur or glass on ${blur} element(s)`);
  if (mono) W(`monospace outside code: ${mono} element(s) (defend it in one sentence: real code, a terminal in the person's world)`);
  if (caps >= 2) T("eyebrow", `tracked uppercase labels: ${caps} (eyebrows; put the words in the heading or the sentence)`);
  else if (caps === 1) W("one tracked uppercase label");
  if (hair) W(`thin rules or outlined boxes: ${hair} element(s) (space, tone steps, filled shapes instead, unless lines are the idea)`);
  if (soft >= 4) W(`soft medium radius on ${soft} boxes (square or fully round, chosen once)`);

  // CV-specific tells
  if (document.querySelector("progress,meter,[role=progressbar]")) T("gauge", "skill bars / gauges (progress, meter or progressbar): use words");
  const body = document.body.innerText;
  if (/[★☆✦✩⭐●○◉◯]{3,}/.test(body)) T("gauge", "star or dot ratings in text: use words (CECRL level, years, context)");
  const pctSkills = (body.match(/\b\d{2,3}\s?%/g) || []).length;
  if (pctSkills >= 4) W(`${pctSkills} percentages on the page: if they rate skills, remove them`);
  const emoji = (body.match(/\p{Extended_Pictographic}/gu) || []).filter((c) => !"©®™".includes(c));
  if (emoji.length) T("emoji", `emoji in the page: ${[...new Set(emoji)].join(" ")}`);

  // Copy
  const banned = [
    [/bienvenue sur mon (site|portfolio)/i, "F"], [/\b(hello|hi|salut|bonjour)\s*,?\s*(i'?m|je suis|moi c'est)\b/i, "F"], [/n'h[ée]sitez pas/i, "F"],
    [/passionn[ée]e?s?\b/i, "W"], [/dynamique et motiv[ée]/i, "F"], [/force de proposition/i, "W"], [/\bmotiv[ée]e? et rigoureu/i, "F"],
    [/\b(unlock|unleash|supercharge|elevate|empower|seamless(ly)?|effortless(ly)?|cutting-edge|next-gen(eration)?|world-class|game-chang)/i, "F"],
    [/\bpassionate about\b/i, "W"], [/available for (work|hire)|disponible imm[ée]diatement ?•/i, "W"], [/lorem ipsum|\bTODO\b|\[(your|votre) /i, "F"],
    [/\b(learn more|get started|en savoir plus)\b/i, "W"], [/scroll (down|to explore)|d[ée]filez/i, "W"], [/\bstep \d\b|[ée]tape 0\d/i, "W"],
  ];
  for (const [re, lvl] of banned) { const m = body.match(re); if (m) (lvl === "F" ? F : W)(`generated-voice copy: "${m[0]}"`); }
  const emd = (body.match(/—/g) || []).length;
  if (emd > 4) W(`${emd} em dashes (use full stops; one or two at most)`);
  const lang = (document.documentElement.lang || "").toLowerCase();
  if (!lang) W("no lang attribute on <html>");
  if (lang.startsWith("fr")) {
    const noSpace = (body.match(/[A-Za-zÀ-ÿ0-9»)][;!?](?=\s|$)/g) || []).length + (body.match(/[A-Za-zÀ-ÿ»)]:(?=\s)/g) || []).length;
    const plainSpace = (body.match(/ [;:!?](?=\s|$)/g) || []).length;
    if (noSpace + plainSpace) W(`French typography: ${noSpace} missing and ${plainSpace} ordinary spaces before ; : ! ? (use a narrow no-break space U+202F, or U+00A0 before :)`);
    if (/"[^"]{2,80}"/.test(body)) W("French typography: straight quotes; use « » with no-break spaces");
  }

  // Contrast
  let lowF = 0, lowW = 0; const lowEx = [];
  for (const el of textEls) {
    const s = cs(el); const fg = parse(s.color); const bg = bgOf(el);
    if (!fg || !bg) continue;
    const c = ratio({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) }, bg);
    const fs = parseFloat(s.fontSize), big = fs >= 24 || (fs >= 18.6 && parseInt(s.fontWeight) >= 700);
    if (c < (big ? 2.6 : 3)) { lowF++; if (lowEx.length < 3) lowEx.push(`"${el.textContent.trim().slice(0, 30)}" ${c.toFixed(1)}:1`); }
    else if (c < (big ? 3 : 4.5)) lowW++;
  }
  if (lowF) F(`low contrast: ${lowF} element(s) (${lowEx.join("; ")})`);
  if (lowW) W(`contrast under AA: ${lowW} element(s)`);

  // Palette families
  const bodyBg = bgOf(document.body) || { r: 255, g: 255, b: 255 };
  const gh = hsl(bodyBg);
  const cream = gh.h >= 22 && gh.h <= 62 && gh.s > 18 && gh.l > 84;
  let terracotta = 0, violet = 0, neon = 0;
  for (const el of all.filter(visible)) {
    const s = cs(el);
    for (const c of [parse(s.backgroundColor), textEls.includes(el) ? parse(s.color) : null]) {
      if (!c || c.a < 0.5) continue;
      const x = hsl(c);
      if (x.h >= 8 && x.h <= 28 && x.s >= 35 && x.s <= 80 && x.l >= 35 && x.l <= 62) terracotta++;
      if (x.h >= 235 && x.h <= 290 && x.s > 35 && x.l > 20 && x.l < 75) violet++;
      if (x.s > 60 && x.l > 45 && x.l < 75 && ((x.h > 60 && x.h < 170) || (x.h >= 170 && x.h < 200) || x.h < 15 || x.h > 345)) neon++;
    }
  }
  if (cream && terracotta) T("palette", "assistant palette: cream ground with terracotta/rust");
  else if (cream) W("yellow-cream ground: warmth from a low-chroma stone or a full field instead");
  if (terracotta > 2 && !cream) W("terracotta/rust accent: a colour of generated pages");
  if (violet) T("palette", `violet or indigo colour on ${violet} element(s)`);
  if (lum(bodyBg) < 0.03 && neon >= 1) T("palette", "near-black ground with an acid or neon accent (a generated look): use the dealt palette or redraw");

  // Centring
  const blocks = textEls.filter((el) => /^(P|H1|H2|H3|LI|BLOCKQUOTE)$/.test(el.tagName));
  const centred = blocks.filter((el) => cs(el).textAlign === "center").length;
  if (blocks.length >= 5 && centred / blocks.length > 0.7) W(`${Math.round((100 * centred) / blocks.length)}% of text is centred`);

  // Sections: headings and half-empty
  for (const sec of [...document.querySelectorAll("main section, body > section, main > article")].filter(visible)) {
    const txt = sec.innerText.trim();
    const hasHeading = !!sec.querySelector("h1,h2,h3,h4");
    if (txt.length > 160 && !hasHeading) W(`section without a heading: "${txt.slice(0, 40).replace(/\s+/g, " ")}…"`);
    if (vw >= 1200) {
      const r = sec.getBoundingClientRect(); if (r.height < 220) continue;
      const kids = [...sec.querySelectorAll("h1,h2,h3,h4,p,li,dd,dt,td,img,picture,svg,figure,a,button,blockquote,canvas,video")].filter(visible).map((k) => k.getBoundingClientRect()).filter((k) => k.width > 0);
      if (!kids.length) continue;
      const L = Math.min(...kids.map((k) => k.left)), Rr = Math.max(...kids.map((k) => k.right));
      if ((Rr - L) / r.width < 0.55) W(`section uses ${Math.round((100 * (Rr - L)) / r.width)}% of its width: "${(sec.querySelector("h2,h3")?.textContent || txt).trim().slice(0, 40)}" (close the empty half)`);
    }
  }

  // Section headings no larger than the text they announce (Tailwind's preflight resets h2 to the body size)
  {
    const bodyPx = parseFloat(cs(document.body).fontSize);
    const small = [...document.querySelectorAll("h2")].filter(visible).filter((h) => parseFloat(cs(h).fontSize) < bodyPx * 1.25);
    if (small.length) W(`${small.length} h2 at only ${Math.round(parseFloat(cs(small[0]).fontSize))}px for ${Math.round(bodyPx)}px body text ("${small[0].textContent.trim().slice(0, 30)}"): set it at text-head`);
  }

  // Collisions: text boxes that overlap other text (a grid class gone wrong, a negative margin, a pinned block)
  {
    // Block-level boxes only: an inline link wrapping over two lines has a box that covers its neighbours.
    // Decorative text (aria-hidden) counts too: a huge year or word set over a list is still a visible collision.
    const leaves = textEls.filter((el) => !el.closest("svg,[data-overlap]") && cs(el).position !== "fixed" && !/^inline/.test(cs(el).display))
      .map((el) => ({ el, r: el.getBoundingClientRect() })).filter(({ r }) => r.width > 4 && r.height > 4);
    let hits = 0; const ex = [];
    for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i], b = leaves[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w <= 2 || h <= 2) continue;
      if ((w * h) / Math.min(a.r.width * a.r.height, b.r.width * b.r.height) < 0.15) continue;
      hits++; if (ex.length < 2) ex.push(`"${a.el.textContent.trim().slice(0, 24)}" / "${b.el.textContent.trim().slice(0, 24)}"`);
    }
    if (hits) F(`text on top of text: ${hits} overlap(s) (${ex.join("; ")}). Check grid classes and negative margins`);
  }

  // Words cut in two: break-all / anywhere make an email or a long word break mid-word ("supinfo.c / om")
  {
    const cut = textEls.filter((el) => { const s = cs(el); return s.wordBreak === "break-all" || s.overflowWrap === "anywhere"; })
      .filter((el) => { const r = document.createRange(); r.selectNodeContents(el); const lines = new Set([...r.getClientRects()].map((x) => Math.round(x.top))); return lines.size > 1; });
    if (cut.length) W(`${cut.length} element(s) may break words in the middle (word-break: break-all or overflow-wrap: anywhere): break an email after the @ with <wbr>, or set it smaller`);
  }

  // Margins (desktop and phone)
  const boxes = textEls.filter((el) => !el.closest(".scroll-x,.scroll-x-rev,.scroll-y,.scroll-turn,[data-moves]")).map((el) => { const r = el.getBoundingClientRect(); const ml = Math.min(0, parseFloat(cs(el).marginLeft) || 0); return { left: r.left - ml, right: r.right, width: r.width }; }).filter((r) => r.width > 0 && r.width < vw * 0.98);
  if (boxes.length) {
    const left = Math.min(...boxes.map((b) => b.left)), right = vw - Math.max(...boxes.map((b) => b.right));
    R.info.margins = [Math.round(left), Math.round(right)];
    if (left < 15) W(`text ${Math.round(left)}px from the left edge (16px minimum)`);
    if (Math.abs(left - right) > 32 && right > 0) W(`unequal outer margins: ${Math.round(left)}px left, ${Math.round(right)}px right`);
  }

  // Fullness (desktop): sections that repeat one layout, long empty stretches, a page made of type alone
  if (vw >= 1200) {
    const bodyBgC = bgOf(document.body) || { r: 255, g: 255, b: 255 };
    const same = (a, b) => a && b && Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) < 6;
    const secs = [...document.querySelectorAll("main > section, main > div > section, body > section, main > article")].filter(visible);
    const shape = (sec) => {
      const r = sec.getBoundingClientRect();
      const h = sec.querySelector("h1,h2"); const hr = h?.getBoundingClientRect();
      const others = [...sec.querySelectorAll("p,li,dd,img,svg,figure,video,canvas")].filter((k) => visible(k) && !h?.contains(k)).map((k) => k.getBoundingClientRect());
      const beside = hr && others.some((o) => o.left >= hr.right - 4 && o.top < hr.bottom && o.bottom > hr.top);
      const centred = h && cs(h).textAlign === "center";
      const field = !same(bgOf(sec), bodyBgC);
      const pic = [...sec.querySelectorAll("img,svg,video,canvas,picture")].some((k) => { const b = k.getBoundingClientRect(); return b.width >= 64 && b.height >= 32; });
      const big = [...sec.querySelectorAll("*")].some((k) => visible(k) && parseFloat(cs(k).fontSize) >= 1.6 * parseFloat(cs(h || sec).fontSize) && k.textContent.trim().length > 2);
      return { key: [beside ? "split" : centred ? "centred" : "stacked", field ? "field" : "ground", pic ? "picture" : "", big ? "scale" : ""].join("/"), pic, field, h: r.height };
    };
    const shapes = secs.map(shape);
    let run = 1, worst = 1;
    for (let i = 1; i < shapes.length; i++) { run = shapes[i].key === shapes[i - 1].key ? run + 1 : 1; worst = Math.max(worst, run); }
    R.info.layouts = shapes.map((x) => x.key);
    if (worst >= 3) T("layout", `${worst} sections in a row with the same layout (${shapes.map((x) => x.key.split("/")[0]).join(", ")}): give each section the shape the sheet deals for its role`);
    else if (worst === 2) W(`two neighbouring sections share a layout (${shapes.map((x) => x.key.split("/")[0]).join(", ")})`);
    const withPic = shapes.filter((x) => x.pic).length, fields = shapes.filter((x) => x.field).length;
    if (secs.length >= 4 && withPic < 2) W(`only ${withPic} section(s) carry a picture or a drawing: draw the sheet's motif from the person's world and bring it back`);
    if (secs.length >= 4 && fields < 2) W(`only ${fields} full-width field(s): the page reads as one long sheet; give two sections their own ground (a surface step, the ink, a field)`);
    // Empty stretches: vertical gaps with no text, picture or field, measured over the whole page
    const marks = [...document.body.querySelectorAll("*")].filter(visible).filter((el) => {
      if (el.matches("img,svg,video,canvas,picture,button,a.button") || textEls.includes(el)) return true;
      return !same(bgOf(el), bodyBgC) && el.getBoundingClientRect().width > vw * 0.5 && el !== document.body;
    }).map((el) => { const r = el.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; }).sort((a, b) => a[0] - b[0]);
    let reach = marks.length ? marks[0][1] : 0, gap = 0;
    for (const [t, b] of marks) { if (t > reach) gap = Math.max(gap, t - reach); reach = Math.max(reach, b); }
    if (gap > vh * 0.6) W(`an empty stretch of ${Math.round(gap)}px (more than half a screen): close it with content, a drawing or a field`);
  }

  // Motion: the page should move a little, with the scroll as well as on load
  R.info.motion = { reveals: document.querySelectorAll("[data-reveal]").length, scroll: document.querySelectorAll("[data-scroll]").length, islands: document.querySelectorAll("astro-island").length };
  // Too much motion tires the reader (SKILL.md step 12): headings that rise once, one scroll move at most.
  if (vw >= 1200) {
    const reveals = R.info.motion.reveals, moving = document.querySelectorAll(".scroll-x,.scroll-x-rev,.scroll-y,.scroll-turn,.pin").length;
    if (reveals > 14) W(`${reveals} entrances (data-reveal): keep them for the section headings and the first screen, not every row`);
    if (R.info.motion.scroll > 2 || moving > 2) W(`${R.info.motion.scroll} scroll-linked block(s), ${moving} sliding, turning or pinned element(s): one scroll move at most, on the motif`);
  }

  // Hidden content (reveals that did not fire)
  const hidden = textEls.filter((el) => { let e = el; while (e && e !== document.body) { if (parseFloat(cs(e).opacity) < 0.05) return true; e = e.parentElement; } return false; });
  if (hidden.length) F(`${hidden.length} text element(s) still invisible after scrolling (a reveal did not fire)`);

  // Images
  for (const img of document.querySelectorAll("img")) {
    if (!img.hasAttribute("alt")) F(`image without alt: ${img.getAttribute("src")}`);
    if (img.complete && img.naturalWidth === 0) F(`broken image: ${img.getAttribute("src")}`);
  }

  // Meta and actions
  if (!document.querySelector('a[href^="mailto:"]')) W("no mailto link");
  const vp = document.querySelector('meta[name="viewport"]')?.content || "";
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(vp)) F("viewport blocks zoom (user-scalable=no or maximum-scale=1)");

  // SEO (references/seo.md), measured once at desktop width
  if (vw >= 1200) {
    const meta = (sel) => document.querySelector(sel)?.getAttribute("content") || document.querySelector(sel)?.getAttribute("href") || "";
    const title = document.title.trim();
    const h1txt = (h1s[0]?.innerText || "").replace(/\s+/g, " ").trim();
    if (!title) F("seo: no <title>");
    else {
      if (title.length > 60) W(`seo: <title> is ${title.length} characters (60 max, name first)`);
      const words = h1txt.split(/[\s,]+/).filter((w) => w.length >= 3);
      if (words.length && !words.some((w) => title.includes(w))) W("seo: the <title> does not contain the name shown in the h1");
    }
    const desc = meta('meta[name="description"]');
    if (!desc) F("seo: no meta description");
    else if (desc.length < 70 || desc.length > 160) W(`seo: meta description is ${desc.length} characters (70–160)`);
    const robots = meta('meta[name="robots"]');
    const indexable = !/noindex/i.test(robots);
    R.info.indexable = indexable;
    const canon = meta('link[rel="canonical"]');
    if (indexable && !canon) W("seo: no canonical link (run seo_head.py)");
    else if (canon && !/^https?:\/\//.test(canon)) F("seo: canonical URL must be absolute");
    for (const p of ["og:title", "og:description", "og:url"]) if (!meta(`meta[property="${p}"]`)) W(`seo: no ${p}`);
    const ogi = meta('meta[property="og:image"]');
    if (!ogi) W("seo: no og:image (announce.png)");
    else if (!/^https?:\/\//.test(ogi)) F(`seo: og:image must be an absolute URL (is "${ogi}"): LinkedIn and others ignore relative images`);
    if (!meta('meta[name="twitter:card"]')) W("seo: no twitter:card");
    if (document.head.innerHTML.includes("SITE_URL")) W("seo: SITE_URL placeholder still in the head: replace it with the real address before launch");
    if (!document.querySelector('link[rel~="icon"]')) W("seo: no favicon (seo_head.py writes favicon.svg)");
    // JSON-LD Person, public facts only
    const lds = [...document.querySelectorAll('script[type="application/ld+json"]')];
    let person = null;
    for (const s of lds) {
      try {
        const j = JSON.parse(s.textContent);
        const nodes = [j, j.mainEntity, ...(j["@graph"] || [])].filter(Boolean);
        person = person || nodes.find((n) => n["@type"] === "Person");
      } catch { F("seo: invalid JSON-LD (does not parse)"); }
    }
    if (!person) W("seo: no schema.org Person in JSON-LD (run seo_head.py)");
    else {
      const leak = ["telephone", "birthDate", "nationality", "gender"].filter((k) => person[k]);
      if (person.address?.streetAddress) leak.push("streetAddress");
      if (leak.length) F(`seo: JSON-LD publishes private fields: ${leak.join(", ")}`);
    }
    // Headings in order
    let prev = 0, skipped = 0;
    for (const h of [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible)) {
      const lvl = +h.tagName[1]; if (prev && lvl > prev + 1) skipped++; prev = lvl;
    }
    if (skipped) W(`seo: ${skipped} skipped heading level(s) (h1 → h2 → h3, in order)`);
    // Images and fonts
    const noDims = [...document.querySelectorAll("img")].filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).length;
    if (noDims) W(`seo: ${noDims} image(s) without width and height attributes (layout shift)`);
    if (document.fonts.size && !document.querySelector('link[rel="preload"][as="font"]')) W("seo: no font preload for the first screen (link rel=preload as=font)");
    // theme-color and dark pages
    // Read as the page loaded: a theme-color that follows the scroll (the chapitres sheet) has moved on by now.
    const tc = window.__folioThemeTop ?? meta('meta[name="theme-color"]');
    const firstBlock = ["main > section", "body > section", "header", "main"].map((q) => document.querySelector(q)).find(Boolean) || document.body;
    const fb = bgOf(firstBlock) || bodyBg;
    if (tc && /^#[0-9a-f]{6}$/i.test(tc)) {
      const t = { r: parseInt(tc.slice(1, 3), 16), g: parseInt(tc.slice(3, 5), 16), b: parseInt(tc.slice(5, 7), 16) };
      if (Math.abs(t.r - fb.r) + Math.abs(t.g - fb.g) + Math.abs(t.b - fb.b) > 30) W(`seo: theme-color ${tc} does not match the first screen's ground`);
    } else if (!tc) W("seo: no theme-color");
    if (lum(bodyBg) < 0.1 && !/dark/.test(cs(document.documentElement).colorScheme)) W("dark page without color-scheme: dark on <html>");
    // Link text and CSS hygiene
    const vague = [...document.querySelectorAll("a")].filter((a) => /^(ici|cliquez ici|click here|here|lien|link|en savoir plus|learn more)$/i.test(a.textContent.trim())).length;
    if (vague) W(`seo: ${vague} link(s) with vague text ("ici", "click here")`);
    const cssText = [...document.styleSheets].map((sh) => { try { return [...sh.cssRules].map((r) => r.cssText).join("\n"); } catch { return ""; } }).join("\n");
    if (/transition\s*:\s*all\b/.test(cssText)) W("transition: all in the CSS (list the properties)");
  }
  R.info.textLength = document.body.innerText.replace(/\s+/g, " ").length;
  return R;
};

const report = { url, viewports: {} };
let jsBytes = 0;
for (const v of viewports) {
  const page = await browser.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const jsBodies = [];
  if (v.name === "desktop") page.on("response", (r) => {
    if (/javascript/.test(r.headers()["content-type"] || "") || /\.m?js(\?|$)/.test(r.url())) jsBodies.push(r.body().then((b) => b.length, () => 0));
  });
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1600); // let the load sequence finish before the first-screen picture
  await page.screenshot({ path: join(out, `${v.name}-fold.png`) });
  await page.evaluate(() => { window.__folioThemeTop = document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null; });
  const foldHidden = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((el) => {
    const r = el.getBoundingClientRect(); if (r.top >= innerHeight || r.bottom <= 0 || r.width === 0) return false;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) return false;
    for (let e = el; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (parseFloat(s.opacity) < 0.05 || /inset\(0(px)? 0(px)? 100%/.test(s.clipPath)) return true; }
    return false; }).length);
  const h =await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += Math.round(v.height * 0.5)) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(140); }
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(500);
  const r = await page.evaluate(measure);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, `${v.name}-full.png`), fullPage: true });
  if (errors.length) r.fail.push(`script errors: ${errors.slice(0, 2).join(" | ")}`);
  if (foldHidden) r.fail.push(`first screen: ${foldHidden} text element(s) still hidden 1.6 s after load (a reveal that did not fire; see motion.md)`);
  report.viewports[v.name] = r;
  if (v.name === "desktop") jsBytes = (await Promise.all(jsBodies)).reduce((t, n) => t + n, 0);
  await page.close();
}
// JavaScript weight: a personal page is read, not operated. React islands are fine; a heavy bundle is not.
{
  const kb = Math.round(jsBytes / 1024);
  report.viewports.desktop.info.jsKB = kb;
  if (kb > 800) report.viewports.desktop.fail.push(`JavaScript: ${kb} KB (800 KB max uncompressed; hydrate fewer islands, drop heavy components)`);
  else if (kb > 400) report.viewports.desktop.warn.push(`JavaScript: ${kb} KB (aim under 400 KB uncompressed: React and Motion take about 290)`);
}
// No script: the HTML alone must carry the page (search engines, slow phones, a failed bundle)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  const noJs = await page.evaluate(() => {
    const vis = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && parseFloat(s.opacity) > 0.05 && r.width > 0; };
    return { h1: [...document.querySelectorAll("h1")].filter(vis).length, heads: [...document.querySelectorAll("h2")].filter(vis).length, text: document.body.innerText.replace(/\s+/g, " ").length };
  });
  await ctx.close();
  const withJs = report.viewports.desktop.info;
  if (!noJs.h1) report.viewports.desktop.fail.push("no script: the h1 is missing or hidden in the HTML (render it in Astro, not only in a client island)");
  if (withJs.textLength && noJs.text < withJs.textLength * 0.85) report.viewports.desktop.fail.push(`no script: only ${Math.round((100 * noJs.text) / withJs.textLength)}% of the text is in the HTML (content rendered by client-only islands is invisible to search engines)`);
  withJs.noJsText = noJs.text;
}
// reduced motion: content must be there with no motion
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const hiddenRM = await page.evaluate(() => [...document.querySelectorAll("h1,h2,p")].filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.05).length);
  if (hiddenRM) report.viewports.desktop.fail.push(`reduced motion: ${hiddenRM} element(s) invisible on the first paint`);
  await page.close();
}
await browser.close();
server?.close();
writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2));

let totalF = 0, totalW = 0, totalA = 0;
for (const [name, r] of Object.entries(report.viewports)) {
  console.log(`\n== ${name} ==  margins ${r.info.margins?.join("/") ?? "?"}px · sizes ${r.info.sizes?.join(",")} · faces ${Object.keys(r.info.families || {}).join(", ")}${r.info.jsKB != null ? ` · JS ${r.info.jsKB} KB` : ""}`);
  for (const m of [...new Set(r.fail)]) {
    if (allow && m.endsWith(`[${allow}]`)) { console.log("ALLOWED", m); totalA++; }
    else { console.log("FAIL", m); totalF++; }
  }
  for (const m of [...new Set(r.warn)]) { console.log("WARN", m); totalW++; }
}
console.log(`\n${totalF} FAIL, ${totalW} WARN${allow ? `, ${totalA} ALLOWED (${allow}: defend it in work/notes.md)` : ""}. Screenshots in ${out}: ${viewports.map((v) => `${v.name}-fold.png, ${v.name}-full.png`).join("; ")}`);
console.log("Now look at every screenshot and critique it (references/critique.md). Passing is not the same as good.");
process.exit(totalF ? 2 : 0);
