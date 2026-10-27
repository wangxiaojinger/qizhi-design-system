import { expect, test } from "@playwright/test";

test("模型目录：布局保存、刷新恢复、账号隔离、重置与独立开关", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#table-customization");
  const demo = page.locator("#table-customization");
  const table = demo.getByRole("table", { name: "Qways 模型目录" });
  await expect(table).toBeVisible();
  await expect(demo.getByText("模型数据与价格均为演示，非真实报价。")).toBeVisible();
  const keys = () => page.evaluate(() => Object.keys(localStorage)
    .filter((key) => key.startsWith("qizhi-table-layout:")));
  expect(await keys()).toHaveLength(0);
  await demo.getByRole("button", { name: "列设置", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "列设置", exact: true });
  const width = panel.getByRole("spinbutton", { name: "列宽模型名称" });
  await width.fill("240");
  await width.press("Enter");
  await panel.getByRole("checkbox", { name: "供应商", exact: true }).locator("xpath=ancestor::label").click();
  await page.keyboard.press("Escape");
  await expect(table.locator('th[data-column-key="provider"]')).toHaveCount(0);
  expect(await keys()).toHaveLength(1);
  await page.reload();
  await expect(table.locator('th[data-column-key="provider"]')).toHaveCount(0);
  await expect.poll(() => table.locator('th[data-column-key="name"]')
    .evaluate((node) => node.getBoundingClientRect().width)).toBeCloseTo(240, 0);
  await demo.getByRole("combobox", { name: "布局作用域" }).click();
  await page.getByRole("option", { name: "用户 B（个人）" }).click();
  await expect(table.locator('th[data-column-key="provider"]')).toHaveCount(1);
  expect(await keys()).toHaveLength(1);
  await demo.getByRole("combobox", { name: "布局作用域" }).click();
  await page.getByRole("option", { name: "用户 A（个人）" }).click();
  await expect(table.locator('th[data-column-key="provider"]')).toHaveCount(0);
  await demo.getByRole("button", { name: "列设置", exact: true }).click();
  await panel.getByRole("button", { name: "恢复默认布局" }).click();
  await page.keyboard.press("Escape");
  expect(await keys()).toHaveLength(0);
  await page.reload();
  await expect(table.locator('th[data-column-key="provider"]')).toHaveCount(1);
  await demo.getByRole("switch", { name: "列设置入口" }).click();
  await expect(demo.getByRole("button", { name: "列设置", exact: true })).toHaveCount(0);
  await expect(table.getByRole("separator")).toHaveCount(9);
  await demo.getByRole("switch", { name: "列调宽" }).click();
  await expect(table.getByRole("separator")).toHaveCount(0);
  await expect(table.getByRole("button", { name: /移动列/ })).toHaveCount(9);
  await demo.getByRole("switch", { name: "列移动" }).click();
  await expect(table.getByRole("button", { name: /移动列/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});

test("模型目录：保存失败不撤销显示，损坏缓存安全回退", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "qizhi-table-layout:app=qways-model-console:user=user-a:space=personal-a:table=model-catalog:business=v1",
      "{broken",
    );
    Storage.prototype.setItem = () => { throw new DOMException("quota", "QuotaExceededError"); };
  });
  await page.goto("/#table-customization");
  const demo = page.locator("#table-customization");
  await demo.getByRole("button", { name: "列设置", exact: true }).click();
  await page.getByRole("dialog", { name: "列设置", exact: true })
    .getByRole("checkbox", { name: "供应商", exact: true }).locator("xpath=ancestor::label").click();
  await page.keyboard.press("Escape");
  await expect(demo.locator('th[data-column-key="provider"]')).toHaveCount(0);
  await expect(demo.getByRole("status").filter({ hasText: "当前布局仍已更新" })).toBeVisible();
});
