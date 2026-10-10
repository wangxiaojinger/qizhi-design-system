#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { auditRepository, summarizeAudit } from "./theme-gap-audit-lib.mjs";
import { staticAuditFingerprint } from "./theme-audit-provenance.mjs";

const root = path.resolve(process.cwd());
const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : null;
const audit = auditRepository(root);
const result = {
  schemaVersion: 2,
  status: "passed",
  sourceFingerprint: staticAuditFingerprint(root),
  root: ".",
  exclusions: [".git/**", "node_modules/**", "dist/**", "assets/remixicon/**"],
  summary: summarizeAudit(audit),
  files: audit.files,
  unreferencedFiles: audit.unreferencedFiles,
  findings: audit.findings,
};
const serialized = `${JSON.stringify(result, null, 2)}\n`;

if (output) fs.writeFileSync(path.resolve(root, output), serialized);
else process.stdout.write(serialized);
