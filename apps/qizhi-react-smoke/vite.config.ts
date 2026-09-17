import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        icon: resolve(import.meta.dirname, "icon.html"),
      },
    },
  },
});
