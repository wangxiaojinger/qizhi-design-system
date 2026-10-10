import { expect, test } from "@playwright/test";

test("AutoComplete 保持 8 组旧站 Demo 并支持完整交互", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-auto-complete");
  await page.locator("#component-auto-complete").scrollIntoViewIfNeeded();
  await expect(page.locator("#component-auto-complete [role=combobox]")).toHaveCount(8);

  const basic = page.locator("#自动补全-基础用法 [role=combobox]");
  await basic.fill("bei");
  await expect(page.locator("#自动补全-基础用法 [role=option]")).toHaveCount(5);
  await basic.press("ArrowDown");
  await expect(basic).toHaveAttribute("aria-activedescendant", /option-0$/);
  await basic.press("Enter");
  await expect(basic).toHaveValue("bei_0");

  const strict = page.locator("#自动补全-区分大小写 [role=combobox]");
  await strict.fill("B");
  await expect(page.locator("#自动补全-区分大小写 .qizhi-auto-complete__state[role=status]")).toHaveText("暂无匹配结果");
  await expect(page.locator("#自动补全-区分大小写 [role=option]")).toHaveCount(0);
  await strict.fill("b");
  await expect(page.locator("#自动补全-区分大小写 [role=option]")).toHaveCount(3);

  const customInput = page.locator("#自动补全-自定义输入组件 .qizhi-auto-complete");
  const customRect = await customInput.boundingBox();
  expect(customRect?.height).toBe(80);
  expect(customRect?.width).toBeLessThanOrEqual(testInfo.project.name === "mobile-375" ? 303 : 320);

  const complex = page.locator("#自动补全-复杂用法 [role=combobox]");
  await expect(complex).toHaveValue("Beijing");
  await complex.focus();
  await expect(page.getByRole("tooltip")).toContainText("Beijing");
  await complex.fill("invalid");
  await page.locator("#自动补全-复杂用法 .qz-demo-title").click();
  await expect(complex).toHaveValue("");

  const certain = page.locator("#自动补全-查询模式-确定类目 [role=combobox]");
  await certain.fill("model");
  const certainDemo = page.locator("#自动补全-查询模式-确定类目");
  await expect(certainDemo.getByRole("option")).toHaveCount(9);
  await expect(certainDemo.getByText("Group-1", { exact: true })).toBeVisible();
  await expect(certainDemo.locator('[data-icon="icon-搜索-搜索"]')).toBeVisible();

  const popupPadding = await certainDemo.getByRole("listbox").evaluate((node) => {
    const style = getComputedStyle(node);
    return { left: style.paddingLeft, right: style.paddingRight };
  });
  expect(popupPadding).toEqual({ left: "4px", right: "4px" });

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await page.locator("#component-auto-complete").evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.locator("#component-auto-complete").screenshot({ path: testInfo.outputPath("auto-complete-open-page.png") });
});
