import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/qizhi-design-system-docs/" : "/",
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@wangxiaojinger/qizhi-tokens/style.css", replacement: fileURLToPath(new URL("./packages/qizhi-tokens/dist/style.css", import.meta.url)) },
      { find: "@wangxiaojinger/qizhi-react/style.css", replacement: fileURLToPath(new URL("./packages/qizhi-react/src/style.css", import.meta.url)) },
      { find: "@wangxiaojinger/qizhi-react", replacement: fileURLToPath(new URL("./packages/qizhi-react/src/index.ts", import.meta.url)) },
    ],
  },
}));
