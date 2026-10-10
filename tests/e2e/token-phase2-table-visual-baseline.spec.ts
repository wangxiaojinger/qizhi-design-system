import { expect, test } from "@playwright/test";

const prepare = async (page: import("@playwright/test").Page) => {
  await page.goto("/#component-table", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: "*, *::before, *::after { caret-color: transparent !important; transition: none !important; }",
  });
};

test("Table basic matches the pre-migration visual baseline", async ({ page }) => {
  await prepare(page);
  await expect(page.locator("#table-basic .demo")).toHaveScreenshot("table-basic.png");
});

test("Table density matches the pre-migration visual baseline", async ({ page }) => {
  await prepare(page);
  await expect(page.locator("#table-props .demo")).toHaveScreenshot("table-density.png");
});

test("Table fixed columns match the pre-migration visual baseline", async ({ page }) => {
  await prepare(page);
  await expect(page.locator("#table-fixed .demo")).toHaveScreenshot("table-fixed.png");
});

test("Table wrapping matches the pre-migration visual baseline", async ({ page }) => {
  await prepare(page);
  await expect(page.locator("#table-content .demo")).toHaveScreenshot("table-content.png");
});
