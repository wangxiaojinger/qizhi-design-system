import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  ...(process.env.CI ? { timeout: 90_000, expect: { timeout: 20_000 } } : {}),
  use: { baseURL: process.env.QIZHI_DOCS_BASE_URL ?? "http://127.0.0.1:5173", channel: "chrome", trace: process.env.CI ? "retain-on-failure" : "off" },
  projects: [
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
    { name: "narrow-1024", use: { viewport: { width: 1024, height: 900 } } },
    { name: "mobile-375", use: { viewport: { width: 375, height: 812 } } },
  ],
});
