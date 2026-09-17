import { expect, test } from "@playwright/test";

test("Checkbox 保持五组 Demo、API、尺寸和响应式布局", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-checkbox");

  await expect(page.locator("#component-checkbox .codebox-wrapper")).toHaveCount(5);
  await expect(page.getByRole("table", { name: "Checkbox API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Checkbox.Group API" })).toBeVisible();
  await expect(page.locator("#复选框-基础用法 .qizhi-checkbox")).toHaveCount(4);
  await expect(page.locator("#复选框-受控 .qizhi-checkbox")).toHaveCount(2);
  await expect(page.locator("#复选框-复选框组 .qizhi-checkbox")).toHaveCount(10);
  await expect(page.locator("#复选框-全选 .qizhi-checkbox")).toHaveCount(4);
  await expect(page.locator("#复选框-布局 .qizhi-checkbox")).toHaveCount(5);

  const first = page.locator("#复选框-基础用法 .qizhi-checkbox").first();
  const mask = first.locator(".qizhi-checkbox-mask");
  await expect(first).toHaveCSS("font-size", "14px");
  await expect(first).toHaveCSS("line-height", "22px");
  await expect(mask).toHaveCSS("width", "14px");
  await expect(mask).toHaveCSS("height", "14px");
  await expect(mask).toHaveCSS("border-radius", "2px");

  const expectedColumns = testInfo.project.name === "mobile-375" ? 2 : 3;
  const layoutItems = page.locator("#复选框-布局 .checkbox-layout-demo .qizhi-checkbox");
  const rows = await layoutItems.evaluateAll((items) => [...new Set(items.map((item) => Math.round(item.getBoundingClientRect().y)))]);
  expect(rows).toHaveLength(Math.ceil(5 / expectedColumns));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  for (const demo of await page.locator("#component-checkbox .codebox-wrapper > .demo").all()) {
    expect(await demo.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.locator("#component-checkbox").screenshot({ path: testInfo.outputPath(`checkbox-${testInfo.project.name}.png`) });
});

test("Checkbox 支持鼠标、键盘、禁用、受控和全选半选联动", async ({ page }, testInfo) => {
  await page.goto("/#component-checkbox");
  const basic = page.locator("#复选框-基础用法");
  const unchecked = basic.getByRole("checkbox", { name: "复选框", exact: true });
  const uncheckedMask = unchecked.locator("xpath=../span[contains(@class, 'qizhi-checkbox-mask-wrapper')]/span");
  await unchecked.locator("xpath=..").click();
  await expect(unchecked).toBeChecked();
  await expect(uncheckedMask).toHaveCSS("box-shadow", "none");
  await expect(uncheckedMask).toHaveCSS("border-color", "rgb(51, 102, 255)");
  await unchecked.locator("xpath=..").click();
  await expect(unchecked).not.toBeChecked();
  await expect(uncheckedMask).toHaveCSS("border-color", "rgb(201, 205, 212)");
  await basic.screenshot({ path: testInfo.outputPath(`checkbox-unchecked-${testInfo.project.name}.png`) });
  await unchecked.locator("xpath=..").click();
  await expect(unchecked).toBeChecked();
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(unchecked).toBeFocused();
  await unchecked.press("Space");
  await expect(unchecked).not.toBeChecked();
  await expect(uncheckedMask).not.toHaveCSS("box-shadow", "none");
  await expect(basic.getByRole("checkbox", { name: "禁用", exact: true })).toBeDisabled();
  await expect(basic.getByRole("checkbox", { name: "禁用已选中", exact: true })).toBeChecked();
  const initiallyChecked = basic.getByRole("checkbox", { name: "已选中", exact: true });
  const initiallyCheckedMask = initiallyChecked.locator("xpath=../span[contains(@class, 'qizhi-checkbox-mask-wrapper')]/span");
  await initiallyChecked.locator("xpath=..").click();
  await expect(initiallyChecked).not.toBeChecked();
  await page.mouse.move(0, 0);
  await expect(initiallyCheckedMask).toHaveCSS("border-color", "rgb(201, 205, 212)");

  const controlled = page.locator("#复选框-受控");
  await controlled.getByRole("button", { name: "选中" }).click();
  await expect(controlled.getByRole("checkbox", { name: "复选框", exact: true })).toBeChecked();
  await expect(controlled.getByRole("checkbox", { name: "禁用复选框", exact: true })).toBeChecked();
  await controlled.getByRole("button", { name: "取消选中" }).click();
  await expect(controlled.getByRole("checkbox", { name: "复选框", exact: true })).not.toBeChecked();

  const all = page.locator("#复选框-全选");
  const master = all.getByRole("checkbox", { name: "全选" });
  await expect.poll(() => master.evaluate((input: HTMLInputElement) => input.indeterminate)).toBe(true);
  await master.locator("xpath=..").click();
  await expect(all.getByRole("checkbox", { name: "取消全选" })).toBeChecked();
  await all.getByRole("checkbox", { name: "选项 1" }).locator("xpath=..").click();
  await expect.poll(() => all.getByRole("checkbox", { name: "全选" }).evaluate((input: HTMLInputElement) => input.indeterminate)).toBe(true);

  await page.getByRole("button", { name: "查看代码" }).first().click();
  await expect(page.locator("#checkbox-code-复选框-基础用法")).not.toContainText("Demo.tsx");
  await expect(page.locator("#checkbox-code-复选框-基础用法")).not.toContainText("Demo.css");
  await page.locator("#component-checkbox").screenshot({ path: testInfo.outputPath(`checkbox-interaction-${testInfo.project.name}.png`) });
});
