import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/qizhi-design-system-docs/" : "/",
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@wangxiaojinger/qizhi-react/icon", replacement: fileURLToPath(new URL("./packages/qizhi-react/src/icon/index.ts", import.meta.url)) },
      { find: "@wangxiaojinger/qizhi-react", replacement: fileURLToPath(new URL("./packages/qizhi-react/src/index.ts", import.meta.url)) },
    ],
  },
}));
