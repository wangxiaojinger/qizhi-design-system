import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

it("publishes TopNavigation without a docs-source dependency", () => {
  const indexSource = read("packages/qizhi-react/src/index.ts");
  const demoSource = read(
    "apps/qizhi-docs/src/menu/demos/TopNavigationDemo.tsx",
  );
  const docsCss = read("apps/qizhi-docs/src/menu/menuDocs.css");
  const componentCss = read(
    "packages/qizhi-react/src/top-navigation/topNavigation.css",
  );

  expect(indexSource).toContain(
    'export { TopNavigation } from "./top-navigation/TopNavigation"',
  );
  expect(indexSource).toContain(
    'import "./top-navigation/topNavigation.css"',
  );
  expect(demoSource).toContain(
    'import { TopNavigation } from "@wangxiaojinger/qizhi-react"',
  );
  expect(demoSource).not.toContain("function TopNavigationPreview");
  expect(docsCss).not.toContain(".qizhi-top-navigation");
  expect(componentCss).toMatch(
    /\.qizhi-top-navigation__region-wrap\s*{[^}]*margin-right:\s*20px;/s,
  );
  expect(componentCss).toMatch(
    /\.qizhi-top-navigation\s*{[^}]*background-color:\s*inherit;/s,
  );
});

it("publishes the exact generated TopNavigation API", () => {
  const manifest = JSON.parse(
    read("apps/qizhi-docs/src/api/component-api.json"),
  );
  expect(manifest.apis.topNavigationApi.items.map(
    (item: { name: string }) => item.name,
  )).toEqual([
    "logo",
    "productName",
    "tenantName",
    "items",
    "selectedKey",
    "defaultSelectedKey",
    "onSelect",
    "regions",
    "region",
    "defaultRegion",
    "onRegionChange",
    "languages",
    "language",
    "defaultLanguage",
    "onLanguageChange",
    "helpLabel",
    "onHelp",
    "onUserMenu",
    "className",
    "aria-label",
  ]);
});
