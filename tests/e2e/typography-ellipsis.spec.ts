import { expect, test } from "@playwright/test";

test("Typography Ellipsis supports truncation, expansion and responsive docs", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#components-typography");
  const demo = page.locator(".typography-ellipsis-demo");
  await expect(demo.getByRole("heading", { name: "单行省略" })).toBeVisible();
  await expect(demo.locator(".qizhi-typography-ellipsis")).toHaveCount(5);
  await expect(demo.getByRole("button", { name: "展开" })).toHaveCount(4);

  const expandable = demo.locator("section").nth(2);
  const content = expandable.locator(".qizhi-typography-ellipsis__content");
  const collapsedHeight = await content.evaluate((element) => element.getBoundingClientRect().height);
  const action = expandable.getByRole("button", { name: "展开" });
  await action.click();
  await expect(expandable.getByRole("button", { name: "收起" })).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => content.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(collapsedHeight);
  await expandable.getByRole("button", { name: "收起" }).press("Space");
  await expect(expandable.getByRole("button", { name: "展开" })).toHaveAttribute("aria-expanded", "false");

  const disabled = demo.locator("section").nth(3);
  await expect(disabled.locator("button")).toHaveCount(0);
  await expect(disabled.locator(".qizhi-typography-ellipsis__content")).toHaveCSS("display", "block");

  const controlled = demo.locator("section").nth(4);
  await controlled.getByRole("button", { name: "展开" }).click();
  await expect(controlled.getByRole("button", { name: "收起" })).toHaveAttribute("aria-expanded", "true");

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});
