import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

const read = (path: string) => readFileSync(resolve(root, path), "utf8");

it("mounts Menu as a React Island and keeps demo styles at the public boundary", () => {
  const indexSource = read("index.html");
  const demoCss = read("apps/qizhi-docs/src/menu/menuDocs.css");
  const demoSources = [
    read("apps/qizhi-docs/src/menu/demos/TopNavigationDemo.tsx"),
    read("apps/qizhi-docs/src/menu/demos/SideMenuDemo.tsx"),
  ];

  expect(indexSource).toContain(
    '<section class="doc-section" id="component-menu" '
      + 'data-react-island="menu"></section>',
  );
  expect(indexSource).toContain(
    '<script type="module" '
      + 'src="/apps/qizhi-docs/src/menu/main.tsx"></script>',
  );
  expect(demoCss).not.toMatch(
    /\.qizhi-(menu|dropdown|divider|btn)__[\w-]+/,
  );
  for (const source of demoSources) {
    expect(source).not.toMatch(/<(button|input|select|textarea)\b/);
    expect(source).not.toContain("<svg");
    expect(source).not.toContain("style={{");
  }
});
