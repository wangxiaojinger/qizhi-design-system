import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { renderCss, validateManifest } from "../scripts/token-utils.mjs";

const packageRoot = new URL("../", import.meta.url);
const manifest = async () => JSON.parse(await readFile(new URL("src/tokens.json", packageRoot), "utf8"));

test("the v1 manifest validates without legacy compatibility entries", async () => {
  const value = await manifest();
  assert.deepEqual(validateManifest(value), []);
  assert.equal(value.version, "1.0.0");
  assert.equal(value.tokens["admin.primary"].value, "#171717");
  assert.equal(value.tokens["admin.primary"].themes.dark, "#e5e5e5");
  assert.equal(value.tokens["component.drawer.body.background"].value, "var(--bg-bg-base-default)");
});

test("the stylesheet exports light defaults and explicit dark overrides", async () => {
  const css = renderCss(await manifest());
  assert.match(css, /:root \{/);
  assert.match(css, /--admin-primary: #171717/);
  assert.match(css, /body\[data-theme="dark"\] \{/);
  assert.match(css, /--admin-primary: #e5e5e5/);
});
