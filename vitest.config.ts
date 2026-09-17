import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@wangxiaojinger/qizhi-react/icon", replacement: fileURLToPath(new URL("./packages/qizhi-react/src/icon/index.ts", import.meta.url)) },
      { find: "@wangxiaojinger/qizhi-react", replacement: fileURLToPath(new URL("./packages/qizhi-react/src/index.ts", import.meta.url)) },
    ],
  },
  test: { environment: "jsdom", setupFiles: ["./tests/setup.ts"], globals: true, restoreMocks: true, exclude: ["tests/e2e/**", "node_modules/**", "dist/**", "generated-react-pages/**"] }
});
