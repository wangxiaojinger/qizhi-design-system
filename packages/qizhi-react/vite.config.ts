import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        "icon/index": resolve(import.meta.dirname, "src/icon/index.ts"),
        "chart/index": resolve(import.meta.dirname, "src/chart/index.ts"),
        "markdown-viewer/index": resolve(import.meta.dirname, "src/markdown-viewer/index.ts"),
        "code-preview/index": resolve(import.meta.dirname, "src/code-preview/index.ts"),
      },
      formats: ["es"],
      cssFileName: "qizhi-react",
    },
    rollupOptions: {
      external: (id) => id === "@antv/g2"
        || id === "@wangxiaojinger/qizhi-tokens"
        || /^(react|react-dom|prism-react-renderer|react-markdown|remark-gfm)(\/|$)/.test(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
