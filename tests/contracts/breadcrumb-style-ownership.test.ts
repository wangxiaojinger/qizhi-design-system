import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

it("moves public Breadcrumb behavior styles into the React package", () => {
  const legacy = readFileSync(resolve(root, "styles.css"), "utf8");
  const component = readFileSync(
    resolve(root, "packages/qizhi-react/src/breadcrumb/breadcrumb.css"),
    "utf8",
  );
  const docs = readFileSync(
    resolve(root, "apps/qizhi-docs/src/breadcrumb/breadcrumbDocs.css"),
    "utf8",
  );

  expect(component).toContain(".qizhi-breadcrumb__separator");
  expect(component).toMatch(
    /\.qizhi-breadcrumb__item\s*\{[^}]*color:\s*var\(--color-text-3\)/s,
  );
  expect(component).toMatch(
    /--qizhi-link-color:\s*var\(--color-text-3\)/,
  );
  expect(component).not.toContain("qizhi-breadcrumb-demo-row");
  expect(docs).toContain(".breadcrumb-demo-row");
  expect(legacy).not.toContain(".qizhi-breadcrumb__list");
  expect(legacy).not.toContain(".qizhi-breadcrumb-demo-row");
});
