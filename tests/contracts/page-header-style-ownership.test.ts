import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

it("moves PageHeader visual behavior into the React package", () => {
  const componentPath = resolve(
    root,
    "packages/qizhi-react/src/page-header/pageHeader.css",
  );
  expect(existsSync(componentPath)).toBe(true);
  if (!existsSync(componentPath)) return;

  const legacy = readFileSync(resolve(root, "styles.css"), "utf8");
  const component = readFileSync(componentPath, "utf8");
  const docs = readFileSync(
    resolve(root, "apps/qizhi-docs/src/page-header/pageHeaderDocs.css"),
    "utf8",
  );

  expect(component).toContain(
    ".qizhi-page-header .qizhi-page-header__greeting",
  );
  expect(component).toContain("height: 54px");
  expect(component).toContain("min-height: 54px");
  expect(component).not.toContain("page-header-demo");
  expect(docs).toContain("#component-page-header .demo");
  expect(legacy).not.toContain(".qizhi-page-header__greeting");
  expect(legacy).not.toContain(".qizhi-page-header-demo");
});
