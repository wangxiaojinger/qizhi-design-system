import { expect, test } from "@playwright/test";

test("Divider React Island exposes the approved component contract", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#components-divider");
  await expect(page.getByRole("button", { name: "查看代码" })).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "分割线 Divider" })).toBeVisible();
  await expect(page.locator("#components-divider article.codebox-wrapper")).toHaveCount(3);
  await expect(page.locator("#divider-API")).toHaveCount(1);
  await expect(page.locator('.nav-link[href="#components-divider"]')).toHaveClass(/is-active/);

  const solid = page.locator("#divider-basic .qizhi-divider--solid").first();
  const dashed = page.locator("#divider-basic .qizhi-divider--dashed").first();
  const dotted = page.locator("#divider-basic .qizhi-divider--dotted").first();
  await expect(solid).toHaveCSS("border-bottom-style", "solid");
  await expect(dashed).toHaveCSS("border-bottom-style", "dashed");
  await expect(dotted).toHaveCSS("border-bottom-style", "dotted");

  const leftText = page.locator("#divider-with-text .qizhi-divider--orientation-left");
  await expect(leftText.locator(".qizhi-divider__text")).toHaveText("Text");
  await expect.poll(() => leftText.evaluate((element) => getComputedStyle(element, "::before").width)).toBe("64px");

  const vertical = page.locator("#divider-vertical .qizhi-divider--vertical").first();
  await expect(vertical).toHaveAttribute("role", "separator");
  await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
  await expect(vertical).toHaveCSS("width", "1px");
  await expect(vertical).toHaveCSS("min-height", "16px");
  await expect(vertical).toHaveCSS("height", "16px");
  expect(await page.locator("#divider-vertical .divider-inline-demo").evaluate((node) => {
    const item = node.querySelector("span")!.getBoundingClientRect();
    const divider = node.querySelector(".qizhi-divider--vertical")!.getBoundingClientRect();
    return Math.abs((item.top + item.height / 2) - (divider.top + divider.height / 2));
  })).toBe(0);

  await page.getByRole("button", { name: "查看代码" }).first().click();
  await expect(page.locator("#divider-code-divider-basic code")).toContainText('import { Divider } from "@wangxiaojinger/qizhi-react";');
  await expect(page.locator("#divider-code-divider-basic code")).toHaveCSS("font-size", "13px");

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: `test-results/divider-react-island-${testInfo.project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
});
