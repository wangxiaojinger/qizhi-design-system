import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: "@wangxiaojinger/qizhi-react/style.css",
        replacement: fileURLToPath(new URL("../../packages/qizhi-react/dist/qizhi-react.css", import.meta.url)),
      },
      {
        find: "@wangxiaojinger/qizhi-react/icon",
        replacement: fileURLToPath(new URL("../../packages/qizhi-react/src/icon/index.ts", import.meta.url)),
      },
      {
        find: /^@wangxiaojinger\/qizhi-react$/,
        replacement: fileURLToPath(new URL("../../packages/qizhi-react/src/index.ts", import.meta.url)),
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
