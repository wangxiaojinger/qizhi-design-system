import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

it("moves Steps behavior styles into the public React package", () => {
  const componentPath = resolve(
    root,
    "packages/qizhi-react/src/steps/steps.css",
  );
  expect(existsSync(componentPath)).toBe(true);
  if (!existsSync(componentPath)) return;

  const component = readFileSync(componentPath, "utf8");
  const legacy = readFileSync(resolve(root, "styles.css"), "utf8");
  const legacyScript = readFileSync(resolve(root, "script.js"), "utf8");
  const modalDocs = readFileSync(
    resolve(root, "apps/qizhi-docs/src/modal/modalDocs.css"),
    "utf8",
  );
  expect(component).toContain(".qizhi-steps__item--process");
  expect(component).toContain(".qizhi-steps--small");
  expect(component).not.toContain("steps-switch");
  expect(legacy).not.toContain(".qizhi-steps__item");
  expect(modalDocs).not.toContain(".qizhi-modal-step");
  expect(legacy).not.toContain(".qizhi-modal-step");
  expect(legacyScript).not.toContain("qizhi-modal-step");
});
