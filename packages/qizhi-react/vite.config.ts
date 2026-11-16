import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        "theme/index": resolve(import.meta.dirname, "src/theme/index.ts"),
      },
      formats: ["es"],
      cssFileName: "qizhi-react",
    },
    rollupOptions: {
      external: (id) => id === "@wangxiaojinger/qizhi-tokens"
        || /^(antd|@ant-design\/icons|react|react-dom)(\/|$)/.test(id),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
