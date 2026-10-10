import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";

import { THEME_RUNTIME_MATRIX } from "./theme-runtime-audit-matrix.mjs";
import { runtimeAuditFingerprint } from "./theme-audit-provenance.mjs";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];

const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};

const requestedBaseURL = argument("--base-url", process.env.QIZHI_DOCS_BASE_URL ?? null);
let baseURL = requestedBaseURL;
const outputPath = path.resolve(
  argument("--output", "docs/superpowers/specs/2026-10-09-qizhi-theme-runtime-audit-data.json"),
);
const root = path.resolve(process.cwd());

const writeArtifact = async (artifact) => {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
};

const availablePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.unref();
  server.on("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});

async function startLocalServer() {
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  const viteCli = path.join(root, "node_modules/vite/bin/vite.js");
  const child = spawn(process.execPath, [viteCli, "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", (chunk) => { logs += chunk; });
  child.stderr.on("data", (chunk) => { logs += chunk; });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Vite exited before becoming ready.\n${logs}`);
    try {
      const response = await fetch(url);
      if (response.ok) return { child, url };
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  child.kill("SIGTERM");
  throw new Error(`Timed out waiting for Vite at ${url}.\n${logs}`);
}

async function stopLocalServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

const css = async (locator, property) => locator.evaluate((node, name) => getComputedStyle(node).getPropertyValue(name), property);
const setVars = async (locator, variables) => locator.evaluate((node, entries) => {
  for (const [name, value] of Object.entries(entries)) node.style.setProperty(name, value);
}, variables);

const check = (id, actual, expected, pass = actual === expected) => ({ id, pass, expected, actual });

async function prepare(page, hash) {
  await page.goto(`${baseURL}/${hash}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
}

async function auditButton(page) {
  await prepare(page, "#components-button");
  const section = page.locator("#components-button");
  const target = section.locator(".qizhi-btn-primary").first();
  const sibling = section.locator(".qizhi-btn-primary").nth(1);
  const heightBefore = await css(target, "height");
  await setVars(page.locator("html"), { "--primary-6": "80, 120, 255" });
  const brandDefault = await css(target, "background-color");
  await target.hover();
  const brandHover = await css(target, "background-color");
  await page.mouse.move(0, 0);
  const siblingBefore = await css(sibling, "background-color");
  await setVars(section, { "--control-height-medium": "27px" });
  const mapHeight = await css(target, "height");
  await setVars(target, {
    "--component-button-primary-default": "rgb(1, 2, 3)",
    "--component-button-control-height-medium": "28px",
  });
  return {
    brand: [check("brand-default", brandDefault, "rgb(80, 120, 255)"), check("brand-hover-independent", brandHover, "rgb(87, 135, 255)")],
    localTheme: [check("local-component-token", await css(target, "background-color"), "rgb(1, 2, 3)"), check("sibling-isolation", await css(sibling, "background-color"), siblingBefore)],
    density: [check("component-density", await css(target, "height"), "28px"), check("map-density-non-propagation", mapHeight, heightBefore)],
  };
}

async function auditInput(page) {
  await prepare(page, "#component-input");
  await page.locator("#component-input .component-intro-meta").waitFor({ state: "visible" });
  const section = page.locator("#component-input");
  const target = section.locator(".qizhi-input").first();
  const sibling = section.locator(".qizhi-input").nth(1);
  const heightBefore = await css(target, "height");
  await setVars(page.locator("html"), { "--primary-6": "80, 120, 255" });
  await target.locator("input").focus();
  const brandFocus = await css(target, "border-color");
  const siblingBefore = await css(sibling, "border-color");
  await setVars(section, { "--control-height-medium": "27px" });
  const mapHeight = await css(target, "height");
  await setVars(target, {
    "--component-input-border-default": "rgb(1, 2, 3)",
    "--component-input-control-height-medium": "28px",
  });
  await page.getByRole("heading", { name: "输入框 Input" }).click();
  return {
    brand: [check("brand-focus", brandFocus, "rgb(80, 120, 255)")],
    localTheme: [check("local-component-token", await css(target, "border-color"), "rgb(1, 2, 3)"), check("sibling-isolation", await css(sibling, "border-color"), siblingBefore)],
    density: [check("component-density", await css(target, "height"), "28px"), check("map-density-non-propagation", mapHeight, heightBefore)],
  };
}

async function auditSelect(page) {
  await prepare(page, "#component-select");
  const section = page.locator("#选择器-基础用法");
  const target = section.locator(".qizhi-select").first();
  const control = target.locator(".qizhi-select__control");
  const heightBefore = await css(control, "height");
  await setVars(page.locator("html"), { "--primary-6": "80, 120, 255" });
  await control.click();
  const popup = page.locator("body > .qizhi-select-popup").first();
  await popup.waitFor({ state: "visible" });
  const brandFocus = await css(control, "border-color");
  const popupBefore = await css(popup, "background-color");
  await setVars(section, { "--control-height-medium": "27px" });
  const mapHeight = await css(control, "height");
  await setVars(section, { "--component-select-background-default": "rgb(1, 2, 3)", "--component-select-control-height-medium": "28px", "--component-select-option-height": "28px" });
  const portalLocal = await css(popup, "background-color");
  await setVars(page.locator("html"), { "--component-select-background-default": "rgb(4, 5, 6)", "--component-select-option-height": "28px" });
  return {
    brand: [check("brand-focus", brandFocus, "rgb(80, 120, 255)")],
    localTheme: [check("local-control-token", await css(control, "background-color"), "rgb(1, 2, 3)"), check("portal-local-boundary", portalLocal, popupBefore), check("portal-root-token", await css(popup, "background-color"), "rgb(4, 5, 6)")],
    density: [check("component-density", await css(control, "height"), "28px"), check("map-density-non-propagation", mapHeight, heightBefore), check("portal-density", await css(popup.getByRole("option").first(), "min-height"), "28px")],
  };
}

async function auditModal(page) {
  await prepare(page, "#component-modal");
  const section = page.locator("#component-modal");
  await setVars(section, { "--component-modal-background": "rgb(1, 2, 3)", "--component-modal-content-padding-block": "7px" });
  const trigger = section.getByTestId("modal-trigger").first();
  await trigger.waitFor({ state: "visible" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "对话框标题" });
  await dialog.waitFor({ state: "visible" });
  const before = await css(dialog, "background-color");
  await setVars(page.locator("html"), { "--component-modal-background": "rgb(4, 5, 6)", "--component-modal-content-padding-block": "7px" });
  return {
    brand: [],
    localTheme: [check("portal-local-boundary", before, "rgb(1, 2, 3)", before !== "rgb(1, 2, 3)"), check("portal-root-token", await css(dialog, "background-color"), "rgb(4, 5, 6)")],
    density: [check("portal-density", await css(dialog.locator(".qizhi-modal__body"), "padding-top"), "7px")],
  };
}

async function auditTable(page) {
  await prepare(page, "#component-table");
  const section = page.locator("#table-basic");
  const header = section.locator("th").first();
  const cell = section.locator("tbody td").first();
  await setVars(section, { "--component-table-header-background": "rgb(1, 2, 3)", "--component-table-cell-padding-block-large": "7px" });
  return {
    brand: [],
    localTheme: [check("local-component-token", await css(header, "background-color"), "rgb(1, 2, 3)")],
    density: [check("component-density", await css(cell, "padding-top"), "7px")],
  };
}

async function auditTooltip(page) {
  await prepare(page, "#component-tooltip");
  const section = page.locator("#文字气泡-基础用法");
  await setVars(section, { "--component-tooltip-background": "rgb(1, 2, 3)", "--component-tooltip-padding-inline": "7px" });
  await section.locator(".qizhi-typography-text").first().hover();
  const popup = page.getByRole("tooltip");
  await popup.waitFor({ state: "visible" });
  const local = await css(popup, "background-color");
  await setVars(page.locator("html"), { "--component-tooltip-background": "rgb(4, 5, 6)", "--component-tooltip-padding-inline": "7px" });
  return { brand: [], localTheme: [check("portal-local-boundary", local, "rgb(1, 2, 3)", local !== "rgb(1, 2, 3)"), check("portal-root-token", await css(popup, "background-color"), "rgb(4, 5, 6)")], density: [check("portal-density", await css(popup, "padding-left"), "7px")] };
}

async function auditPopover(page) {
  await prepare(page, "#component-popover");
  const section = page.locator("#popover-basic");
  await setVars(section, { "--component-popover-background": "rgb(1, 2, 3)", "--component-popover-padding-inline": "7px" });
  await section.locator(".popover-demo-trigger").hover();
  const popup = page.locator("body > .qizhi-popover").first();
  await popup.waitFor({ state: "visible" });
  const local = await css(popup, "background-color");
  await setVars(page.locator("html"), { "--component-popover-background": "rgb(4, 5, 6)", "--component-popover-padding-inline": "7px" });
  return { brand: [], localTheme: [check("portal-local-boundary", local, "rgb(1, 2, 3)", local !== "rgb(1, 2, 3)"), check("portal-root-token", await css(popup, "background-color"), "rgb(4, 5, 6)")], density: [check("portal-density", await css(popup, "padding-left"), "7px")] };
}

async function auditDropdown(page) {
  await prepare(page, "#component-dropdown");
  await page.locator("#component-dropdown .qz-nav-intro").waitFor({ state: "visible" });
  const section = page.locator("#下拉菜单-基础用法");
  const dropdown = section.locator(".qizhi-dropdown").first();
  await setVars(dropdown, { "--component-dropdown-popup-background": "rgb(1, 2, 3)", "--component-dropdown-item-min-height": "28px" });
  await dropdown.locator(".qizhi-dropdown__trigger").hover();
  const popup = dropdown.locator(".qizhi-dropdown__popup").first();
  await popup.waitFor({ state: "visible" });
  const item = popup.getByRole("menuitem").first();
  await setVars(page.locator("html"), { "--primary-6": "80, 120, 255" });
  const loading = page.locator(".qizhi-dropdown-button--loading .qizhi-dropdown-button__loading-toggle.qizhi-btn-primary").first();
  return {
    brand: [check("brand-loading", await css(loading, "background-color"), "rgb(80, 120, 255)")],
    localTheme: [check("local-component-token", await css(popup, "background-color"), "rgb(1, 2, 3)")],
    density: [check("component-density", await css(item, "min-height"), "28px")],
  };
}

const auditors = { button: auditButton, input: auditInput, select: auditSelect, modal: auditModal, table: auditTable, tooltip: auditTooltip, popover: auditPopover, dropdown: auditDropdown };

async function runAudit() {
  const sourceFingerprint = runtimeAuditFingerprint(root);
  let localServer = null;
  await writeArtifact({ schemaVersion: 2, status: "running", sourceFingerprint });
  try {
    if (!baseURL) {
      localServer = await startLocalServer();
      baseURL = localServer.url;
    }
    const browser = await chromium.launch({ headless: true });
    const results = [];
    try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const errors = [];
    const components = {};
    let overflow = false;
    for (const component of Object.keys(THEME_RUNTIME_MATRIX)) {
      const page = await context.newPage();
      page.on("console", (message) => { if (message.type() === "error") errors.push(`${component} console: ${message.text()}`); });
      page.on("pageerror", (error) => errors.push(`${component} pageerror: ${error.message}`));
      components[component] = await auditors[component](page);
      overflow ||= await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      await page.close();
    }
    results.push({ viewport, components, overflow, errors });
    await context.close();
  }
    } finally {
      await browser.close();
    }

const failedChecks = results.flatMap(({ viewport, components }) =>
  Object.entries(components).flatMap(([component, dimensions]) =>
    Object.entries(dimensions).flatMap(([dimension, checks]) =>
      checks
        .filter(({ pass }) => !pass)
        .map(({ id, actual, expected }) => ({
          viewport: viewport.name,
          component,
          dimension,
          id,
          actual,
          expected,
        })),
    ),
  ),
);
const missingMatrixChecks = results.flatMap(({ viewport, components }) =>
  Object.entries(THEME_RUNTIME_MATRIX).flatMap(([component, coverage]) =>
    ["brand", "localTheme", "density"].flatMap((dimension) => {
      const actualIds = new Set(components[component][dimension].map(({ id }) => id));
      return coverage[dimension].checks
        .filter((id) => !actualIds.has(id))
        .map((id) => ({ viewport: viewport.name, component, dimension, id }));
    }),
  ),
);
    const summary = { failedChecks, missingMatrixChecks, consoleOrPageErrors: results.reduce((count, result) => count + result.errors.length, 0), overflowViewports: results.filter((result) => result.overflow).map((result) => result.viewport.name) };
    const hasFailures = failedChecks.length || missingMatrixChecks.length || summary.consoleOrPageErrors || summary.overflowViewports.length;
    const artifact = { schemaVersion: 2, status: hasFailures ? "failed" : "passed", sourceFingerprint, serverMode: requestedBaseURL ? "external" : "self-started", baseURL, matrix: THEME_RUNTIME_MATRIX, viewports: results, summary };
    await writeArtifact(artifact);
    console.log(JSON.stringify({ outputPath, serverMode: artifact.serverMode, failedChecks: failedChecks.length, missingMatrixChecks: missingMatrixChecks.length, consoleOrPageErrors: artifact.summary.consoleOrPageErrors, overflowViewports: artifact.summary.overflowViewports }));
    if (hasFailures) process.exitCode = 1;
  } catch (error) {
    await writeArtifact({ schemaVersion: 2, status: "failed", sourceFingerprint, serverMode: requestedBaseURL ? "external" : "self-started", baseURL, error: error instanceof Error ? error.message : String(error) });
    throw error;
  } finally {
    await stopLocalServer(localServer?.child);
  }
}

await runAudit();
