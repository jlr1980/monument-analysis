import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local dev runs at /, production build is rooted at /monument-analysis/ to match
// the GitHub Pages path (jlr1980.github.io/monument-analysis).
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/monument-analysis/" : "/",
  plugins: [react()],
  assetsInclude: ["**/*.md"],
}));
