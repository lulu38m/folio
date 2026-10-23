#!/usr/bin/env node
// Start a person's site from the folio template (Astro + React islands + Tailwind + Motion).
// Usage: node new_site.mjs site [--no-install]
// Copies <skill>/assets/site-template to the folder, then runs npm install. Refuses a non-empty folder.
import { cpSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const dest = resolve(args.find((a) => !a.startsWith("--")) || "site");
const template = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "site-template");
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 23)) {
  // Astro needs Node 22.23+. Rather than stop, run this script again on Node 24 fetched by npx (no nvm needed).
  console.error(`Node ${process.versions.node} is too old for Astro (22.23+). Running on Node 24 through npx instead.`);
  try {
    execSync(`npx -y -p node@24 -- node "${fileURLToPath(import.meta.url)}" ${args.map((a) => JSON.stringify(a)).join(" ")}`, { stdio: "inherit" });
  } catch {
    console.error("That failed. Install Node 24: nvm install 24 && nvm use 24, fnm use --install-if-missing 24, or https://nodejs.org.");
    process.exit(1);
  }
  console.error("This machine's Node is old: build and check the site with Node 24 the same way:");
  console.error("  npx -y -p node@24 -- npm run build      (in site/)");
  process.exit(0);
}
// A folder holding only public/fonts (fetch_fonts.mjs run first) is fine: the fonts are kept.
const onlyFonts = (d) => { try { return readdirSync(d).every((n) => n === "public") && readdirSync(join(d, "public")).every((n) => n === "fonts"); } catch { return false; } };
if (existsSync(dest) && readdirSync(dest).length && !onlyFonts(dest)) {
  console.error(`${dest} is not empty. Use a new folder.`);
  process.exit(1);
}
cpSync(template, dest, { recursive: true, filter: (src) => !/node_modules|[\\/]dist([\\/]|$)|[\\/]\.astro([\\/]|$)/.test(src) });
console.log(`copied the template to ${dest}`);
if (!args.includes("--no-install")) {
  execSync("npm install --no-audit --no-fund", { cwd: dest, stdio: "inherit" });
}
console.log(`next: tokens in src/styles/tokens.css, the page in src/pages/index.astro, then npm run build`);
