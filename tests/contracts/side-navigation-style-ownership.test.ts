import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

it("publishes SideNavigation without a docs-source dependency", () => {
  const indexSource = read("packages/qizhi-react/src/index.ts");
  const demoSource = read(
    "apps/qizhi-docs/src/menu/demos/SideMenuDemo.tsx",
  );
  const docsCss = read("apps/qizhi-docs/src/menu/menuDocs.css");
  const componentCss = read(
    "packages/qizhi-react/src/side-navigation/sideNavigation.css",
  );

  expect(indexSource).toContain(
    'export { SideNavigation } from "./side-navigation/SideNavigation"',
  );
  expect(indexSource).toContain(
    'import "./side-navigation/sideNavigation.css"',
  );
  expect(demoSource).toContain(
    'import { SideNavigation } from "@wangxiaojinger/qizhi-react"',
  );
  expect(demoSource).not.toContain("function SideNavigationPreview");
  expect(docsCss).not.toContain(".qizhi-side-navigation");
  expect(docsCss).not.toContain(".menu-side-demo");
  expect(demoSource).toContain('className="side-navigation-demo"');
  expect(docsCss).toMatch(
    /\.side-navigation-demo\s*{[^}]*height:\s*800px;/s,
  );
  expect(docsCss).toMatch(
    /\.side-navigation-demo\s*>\s*\*\s*{[^}]*height:\s*100%;[^}]*min-height:\s*0;/s,
  );
  expect(componentCss).toMatch(
    /\.qizhi-side-navigation\s*{[^}]*height:\s*100%;[^}]*min-height:\s*calc\(100dvh - 56px\);/s,
  );
  expect(componentCss).not.toMatch(/height:\s*800px/);
  expect(componentCss).toMatch(
    /@media \(max-width:\s*991\.98px\)[\s\S]*\.qizhi-side-navigation\s*{[^}]*height:\s*auto;[^}]*min-height:\s*0;/,
  );
});
