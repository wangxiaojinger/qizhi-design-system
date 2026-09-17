import { expect, test } from "@playwright/test";

test("Switch 文档保持旧站尺寸、状态和交互", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-switch");
  await page.locator("#component-switch").scrollIntoViewIfNeeded();

  const basic = page.locator("#开关-基础用法 [role=switch]").first();
  const disabledUnchecked = page.getByRole("switch", { name: "禁用未选中开关" });
  await expect(basic).toHaveCSS("background-color", "rgb(229, 230, 235)");
  await expect(disabledUnchecked).toHaveCSS("background-color", "rgb(242, 243, 245)");
  await expect(disabledUnchecked).toHaveCSS("opacity", "1");
  await basic.click();
  await expect(basic).toHaveAttribute("aria-checked", "true");
  await basic.press("Space");
  await expect(basic).toHaveAttribute("aria-checked", "false");

  const textSwitch = page.locator("#开关-自定义文案 [role=switch]");
  await expect(textSwitch).toHaveText("OFF");
  await textSwitch.click();
  await expect(textSwitch).toHaveText("ON");

  const loading = page.locator("#开关-加载中 [role=switch]");
  await expect(loading).toHaveAttribute("aria-checked", "true");
  await loading.click({ force: true });
  await expect(loading).toHaveAttribute("aria-checked", "true");

  const dimensions = await page.locator("#开关-不同尺寸的开关 [role=switch]").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return [rect.width, rect.height];
  }));
  expect(dimensions).toEqual([[44, 24], [32, 16]]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await page.locator("#component-switch").evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  expect(errors).toEqual([]);

  await page.locator("#component-switch").screenshot({ path: testInfo.outputPath("switch-open-page.png") });
});
