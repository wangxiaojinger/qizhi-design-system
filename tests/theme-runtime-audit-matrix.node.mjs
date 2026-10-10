import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { THEME_RUNTIME_MATRIX } from "../scripts/theme-runtime-audit-matrix.mjs";

const tokenSource = JSON.parse(fs.readFileSync(new URL("../packages/qizhi-tokens/src/tokens.json", import.meta.url), "utf8"));
const expectedComponents = [...new Set(
  Object.values(tokenSource.tokens)
    .map((token) => token.cssVariable?.match(/^--component-([^-]+)/)?.[1])
    .filter(Boolean),
)];

test("theme runtime matrix covers every published component-token namespace", () => {
  assert.deepEqual(Object.keys(THEME_RUNTIME_MATRIX).sort(), expectedComponents.sort());
});

test("each component records brand, local-theme, and density dispositions", () => {
  for (const [component, coverage] of Object.entries(THEME_RUNTIME_MATRIX)) {
    for (const dimension of ["brand", "localTheme", "density"]) {
      assert.ok(coverage[dimension], `${component}.${dimension} is missing`);
      assert.ok(["applicable", "not-applicable"].includes(coverage[dimension].applicability));
      assert.ok(coverage[dimension].reason.length > 0);
      if (coverage[dimension].applicability === "applicable") {
        assert.ok(coverage[dimension].checks.length > 0, `${component}.${dimension} has no runtime check`);
      }
    }
  }
});

test("portal components declare their inheritance boundary explicitly", () => {
  for (const component of ["select", "modal", "tooltip", "popover"]) {
    assert.equal(THEME_RUNTIME_MATRIX[component].portal, true);
    assert.match(THEME_RUNTIME_MATRIX[component].localTheme.reason, /Portal|portal/);
  }
  assert.equal(THEME_RUNTIME_MATRIX.dropdown.portal, false);
});
