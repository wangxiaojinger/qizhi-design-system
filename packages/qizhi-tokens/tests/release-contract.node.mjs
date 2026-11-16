import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("publishes both QIZHI packages as the 1.1.0 contract", async () => {
  for (const path of ["../package.json", "../../qizhi-react/package.json"]) {
    const manifest = JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
    assert.equal(manifest.version, "1.1.0", `${manifest.name} must be released as 1.1.0`);
  }
});
