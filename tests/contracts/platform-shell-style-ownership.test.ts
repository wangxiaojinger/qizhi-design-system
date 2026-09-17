import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

it("publishes PlatformShell while keeping framework structure out of docs styles", () => {
  const indexSource = read("packages/qizhi-react/src/index.ts");
  const demoSource = read(
    "apps/qizhi-docs/src/layout/demos/FrameworkPreviewDemo.tsx",
  );
  const docsCss = read("apps/qizhi-docs/src/layout/layoutDocs.css");
  const shellCss = read(
    "packages/qizhi-react/src/platform-shell/platformShell.css",
  );

  expect(indexSource).toContain(
    'export { PlatformShell } from "./platform-shell/PlatformShell"',
  );
  expect(indexSource).toContain(
    'import "./platform-shell/platformShell.css"',
  );
  expect(demoSource).toContain(
    'import { PlatformShell } from "@wangxiaojinger/qizhi-react"',
  );
  expect(demoSource).not.toContain("<Layout");
  expect(demoSource).not.toContain("<TopNavigation");
  expect(demoSource).not.toContain("<SideNavigation");
  expect(docsCss).not.toContain(".layout-framework-demo__body");
  expect(docsCss).not.toContain(".qizhi-platform-shell__");
  expect(shellCss).not.toMatch(/(?:min-)?height:\s*800px/);
  expect(shellCss).toMatch(
    /\.qizhi-platform-shell__sider\s*{[^}]*position:\s*sticky;[^}]*top:\s*56px;[^}]*align-self:\s*flex-start;[^}]*(?:^|[;\n])\s*height:\s*calc\(100dvh - 56px\);[^}]*min-height:\s*calc\(100dvh - 56px\);/m,
  );
  expect(shellCss).toMatch(
    /\.qizhi-platform-shell__sider\s*>\s*\.qizhi-side-navigation\s*{[^}]*height:\s*100%;/s,
  );
  expect(shellCss).toMatch(
    /@media \(max-width:\s*991\.98px\)[\s\S]*\.qizhi-platform-shell__sider\s*{[^}]*position:\s*static;[^}]*flex:\s*0 0 auto;[^}]*height:\s*auto;[^}]*min-height:\s*0;/,
  );
  expect(shellCss).toMatch(
    /\.qizhi-platform-shell\.is-header-sticky\s+\.qizhi-platform-shell__header\s*{[\s\S]*position:\s*sticky;[\s\S]*top:\s*0;[\s\S]*backdrop-filter:\s*blur\(/,
  );
  expect(shellCss).toMatch(
    /\.qizhi-platform-shell__greeting\s*{[\s\S]*flex:\s*0 0 56px;[\s\S]*line-height:\s*56px;/,
  );
});

it("keeps the workbench scrollable without a visible page scrollbar", () => {
  const pageCss = read("generated-react-pages/workbench-home/src/page.css");

  expect(pageCss).toMatch(/html\s*{[^}]*scrollbar-width:\s*none;/s);
  expect(pageCss).toMatch(
    /html,\s*body\s*{[^}]*overscroll-behavior:\s*none;/s,
  );
  expect(pageCss).toMatch(
    /html::-webkit-scrollbar\s*{[^}]*display:\s*none;/s,
  );
  expect(pageCss).not.toMatch(/(?:html|body)\s*{[^}]*overflow:\s*hidden;/s);
  expect(pageCss).toMatch(
    /\.workbench-page\s*{[^}]*padding:\s*0 0 32px;/s,
  );
  expect(pageCss).toMatch(
    /\.skills-page\s*{[^}]*padding:\s*0;/s,
  );
  expect(pageCss).not.toMatch(
    /@media \(max-width:\s*680px\)[\s\S]*?\.workbench-page\s*{[^}]*padding:\s*0 8px 32px;/,
  );
  expect(pageCss).toMatch(
    /\.workbench-side-column\s*{[^}]*gap:\s*16px;/s,
  );
  expect(pageCss).toMatch(
    /\.profile-card\s*>\s*\.qizhi-btn\s*{[^}]*align-self:\s*start;/s,
  );
  expect(pageCss).toMatch(
    /\.project-section,\s*\.side-card\s*{[^}]*border:\s*0;[^}]*border-radius:\s*12px;/s,
  );
  expect(pageCss).toMatch(
    /\.launch-banner\s*{[^}]*border-radius:\s*12px;/s,
  );
  expect(pageCss).toMatch(
    /\.workbench-overview\s*{[^}]*box-shadow:\s*none;/s,
  );
});
