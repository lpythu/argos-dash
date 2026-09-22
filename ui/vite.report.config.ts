import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const outDir = path.resolve(import.meta.dirname, "dist-report")

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 1_000_000,
    minify: true,
    lib: {
      entry: path.resolve(import.meta.dirname, "src/report-view/main.tsx"),
      name: "ArgosReport",
      formats: ["iife"],
      fileName: () => "viewer.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: "viewer[extname]",
        entryFileNames: "viewer.js",
      },
    },
  },
})
