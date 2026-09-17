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
