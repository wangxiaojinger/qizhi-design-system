import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageRoot = new URL("../", import.meta.url);

test("publishes the complete neutral enterprise-admin token contract", async () => {
  const manifest = JSON.parse(await readFile(new URL("src/tokens.json", packageRoot), "utf8"));
  const { tokens } = manifest;
  const required = [
    "font.family.mono", "font.size.3xl", "line.height.ratio.base", "spacing.10",
    "radius.full", "control.height.xl", "layout.sider.width", "transition.fast",
    "admin.card.foreground", "admin.sidebar.selected", "admin.shadow.drawer",
    "chart.cost.series.1", "bg.base.tertiary", "text.disabled",
    "status.primary.surface.l1", "focus.ring.shadow", "control.accent",
  ];

  for (const name of required) assert.ok(tokens[name], `missing ${name}`);
  assert.equal(tokens["admin.primary"].value, "#171717");
  assert.equal(tokens["control.accent"].value, "var(--admin-primary)");
  assert.equal(tokens["control.accent.hover"].value, "var(--admin-primary-hover)");
  assert.equal(tokens["admin.brand.identity"], undefined);
});
