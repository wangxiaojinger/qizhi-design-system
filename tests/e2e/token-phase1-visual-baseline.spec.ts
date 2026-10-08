import { expect, test } from "@playwright/test";

const prepare = async (page: import("@playwright/test").Page, hash: string) => {
  await page.goto(`/${hash}`);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "*, *::before, *::after { caret-color: transparent !important; transition: none !important; }" });
};

test("Button matches the pre-migration visual baseline", async ({ page }) => {
  await prepare(page, "#components-button");
  await expect(page.locator("#基本用法 .demo")).toHaveScreenshot("button-basic.png");
  await expect(page.locator("#按钮尺寸 .demo")).toHaveScreenshot("button-sizes.png");
});

test("Input matches the pre-migration visual baseline", async ({ page }) => {
  await prepare(page, "#component-input");
  await expect(page.locator("#输入框状态 .demo")).toHaveScreenshot("input-states.png");
  await expect(page.locator("#四种尺寸 .demo")).toHaveScreenshot("input-sizes.png");
});

test("Select matches the pre-migration visual baseline", async ({ page }) => {
  await prepare(page, "#component-select");
  const basic = page.locator("#选择器-基础用法 .demo");
  await expect(basic).toHaveScreenshot("select-states.png");
  await basic.getByRole("combobox").first().click();
  await expect(page.locator(".qizhi-select-popup").last()).toHaveScreenshot("select-popup.png");
});

test("Modal matches the pre-migration visual baseline", async ({ page }) => {
  await prepare(page, "#component-modal");
  const section = page.locator("#component-modal");
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(7);
  await expect(section.getByTestId("modal-trigger")).toHaveCount(9);
  await section.getByTestId("modal-trigger").first().click();
  await expect(page.getByRole("dialog", { name: "对话框标题" })).toHaveScreenshot("modal-basic.png");
});
