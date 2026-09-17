import { expect, test } from "@playwright/test";

test("Business guidance preserves the legacy flow", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#business-guidance-flow");
  const section = page.locator("#business-guidance-flow");
  await expect(section.getByRole("heading", { name: "引导与流程" }))
    .toBeVisible();
  await expect(section.getByRole("table", { name: "BusinessGuide API" }))
    .toBeVisible();
  const guide = section.locator(".qizhi-business-guide");
  await expect(guide).toBeVisible();
  const closeButton = section.getByRole("button", { name: "关闭业务引导" });
  await expect(closeButton).toHaveCSS("color", "rgb(134, 144, 156)");
  await expect(guide.getByRole("heading", { level: 3 })).toHaveCount(3);
  const actionLists = guide.locator(".qizhi-business-guide__actions");
  await expect(actionLists.nth(1)).toHaveCSS("gap", "16px");
  await expect(actionLists.nth(2)).toHaveCSS("gap", "16px");
  await expect(actionLists.nth(1)).toHaveCSS("list-style-type", "disc");
  await expect.poll(() => guide.evaluate((node) => (
    node.scrollWidth <= node.clientWidth
  ))).toBe(true);
  await closeButton.click();
  const restore = section.getByRole("button", { name: "重新显示" });
  await expect(guide).toHaveCount(0);
  await expect(restore).toBeVisible();
  await expect(restore).toBeFocused();
  await restore.click();
  await expect(section.getByRole("button", { name: "关闭业务引导" }))
    .toBeFocused();
  await section.screenshot({
    path: testInfo.outputPath(`business-guidance-${testInfo.project.name}.png`),
  });
  await expect.poll(() => section.evaluate((node) => (
    node.scrollWidth <= node.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
