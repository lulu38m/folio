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
  console.error(`Node ${process.versions.node}: Astro needs Node 22.23 or later (Node 24 LTS recommended).`);
  process.exit(1);
}
if (existsSync(dest) && readdirSync(dest).length) {
  console.error(`${dest} is not empty. Use a new folder.`);
  process.exit(1);
}
cpSync(template, dest, { recursive: true, filter: (src) => !/node_modules|[\\/]dist([\\/]|$)|[\\/]\.astro([\\/]|$)/.test(src) });
console.log(`copied the template to ${dest}`);
if (!args.includes("--no-install")) {
  execSync("npm install --no-audit --no-fund", { cwd: dest, stdio: "inherit" });
}
console.log(`next: tokens in src/styles/tokens.css, the page in src/pages/index.astro, then npm run build`);
