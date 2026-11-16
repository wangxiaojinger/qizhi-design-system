import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageRoot = new URL("../", import.meta.url);

test("publishes the neutral admin v1 semantic surface", async () => {
  const manifest = JSON.parse(await readFile(new URL("src/tokens.json", packageRoot), "utf8"));
  const { tokens } = manifest;
  const required = [
    "spacing.16",
    "radius.8",
    "font.size.base",
    "control.height.md",
    "bg.base.default",
    "text.default",
    "border.neutral.l1",
    "admin.primary",
    "admin.sidebar",
    "status.error.default",
    "component.table.header.background",
    "component.drawer.body.background",
  ];

  for (const name of required) assert.ok(tokens[name], `missing ${name}`);
  assert.equal(tokens["admin.primary"].value, "#171717");
  assert.equal(tokens["bg.base.default"].value, "var(--admin-card)");
  assert.equal(tokens["component.table.header.background"].value, "var(--bg-bg-base-secondary)");
});
