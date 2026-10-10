#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { runtimeAuditFingerprint, staticAuditFingerprint } from "./theme-audit-provenance.mjs";

const root = path.resolve(process.cwd());
const staticPath = path.join(root, "docs/superpowers/specs/2026-10-09-qizhi-theme-gap-audit-data.json");
const runtimePath = path.join(root, "docs/superpowers/specs/2026-10-09-qizhi-theme-runtime-audit-data.json");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const staticArtifact = read(staticPath);
const runtimeArtifact = read(runtimePath);
const errors = [];

if (staticArtifact.status !== "passed") errors.push(`static artifact status is ${staticArtifact.status}`);
if (staticArtifact.sourceFingerprint !== staticAuditFingerprint(root)) errors.push("static artifact is stale");
if (new Set(staticArtifact.findings?.map(({ id }) => id)).size !== staticArtifact.findings?.length) errors.push("static artifact contains duplicate finding ids");
if (runtimeArtifact.status !== "passed") errors.push(`runtime artifact status is ${runtimeArtifact.status}`);
if (runtimeArtifact.sourceFingerprint !== runtimeAuditFingerprint(root)) errors.push("runtime artifact is stale");
if (runtimeArtifact.summary?.failedChecks?.length) errors.push("runtime artifact contains failed checks");
if (runtimeArtifact.summary?.missingMatrixChecks?.length) errors.push("runtime artifact contains missing matrix checks");
if (runtimeArtifact.summary?.consoleOrPageErrors) errors.push("runtime artifact contains console or page errors");
if (runtimeArtifact.summary?.overflowViewports?.length) errors.push("runtime artifact contains overflowing viewports");

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ static: "current", runtime: "current" }));
}
