import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { fingerprintFiles } from "../scripts/theme-audit-provenance.mjs";

test("source fingerprint is stable for unchanged files and changes with content", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qizhi-theme-fingerprint-"));
  try {
    fs.writeFileSync(path.join(root, "source.css"), ".one { color: #fff; }\n");
    const first = fingerprintFiles(root, ["source.css"]);
    const unchanged = fingerprintFiles(root, ["source.css"]);
    fs.writeFileSync(path.join(root, "source.css"), ".one { color: #000; }\n");
    const changed = fingerprintFiles(root, ["source.css"]);

    assert.equal(first, unchanged);
    assert.notEqual(first, changed);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
