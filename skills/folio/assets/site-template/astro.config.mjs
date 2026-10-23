// folio site: a static Astro site. React only where something moves (islands), Tailwind for layout.
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  // Relative asset paths, so dist/ can be opened from a sub-folder or served by any static host.
  build: { assets: "_astro", format: "directory" },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
