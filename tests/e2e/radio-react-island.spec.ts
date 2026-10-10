import { expect, test } from "@playwright/test";

test("Radio 保持三组 Demo、三档尺寸和响应式几何", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/#component-radio");
  await expect(page.getByRole("button", { name: "查看代码" })).toHaveCount(3);

  await expect(page.locator("#component-radio .codebox-wrapper")).toHaveCount(3);
  await expect(page.locator("#radio-API")).toBeVisible();
  await expect(page.getByRole("table", { name: "Radio API" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Radio.Group API" })).toBeVisible();
  await expect(page.locator("#单选框-基础用法 .qizhi-radio")).toHaveCount(2);
  await expect(page.locator("#单选框-单选框组 .qizhi-radio")).toHaveCount(12);
  await expect(page.locator("#单选框-线框型单选按钮组 [data-radio-preview] .qizhi-radio-button")).toHaveCount(3);

  const basic = page.getByRole("radio", { name: "单选框", exact: true });
  const mask = page.locator("#单选框-基础用法 .qizhi-radio-mask").first();
  await expect(basic.locator("xpath=.." )).toHaveCSS("font-size", "14px");
  await expect(mask).toHaveCSS("width", "14px");
  await expect(mask).toHaveCSS("height", "14px");

  const outline = page.locator("#单选框-线框型单选按钮组 [data-radio-preview] .qizhi-radio-button").first();
  await expect(outline).toHaveCSS("height", "32px");
  await expect(outline).toHaveCSS("min-width", "0px");
  await expect(outline).toHaveCSS("padding-left", "16px");
  await expect(outline).toHaveCSS("padding-right", "16px");
  await expect(outline).toHaveCSS("border-top-left-radius", "2px");
  await expect(outline).toHaveCSS("border-bottom-left-radius", "2px");
  const outlineLast = page.locator("#单选框-线框型单选按钮组 [data-radio-preview] .qizhi-radio-button").last();
  await expect(outlineLast).toHaveCSS("border-top-right-radius", "2px");
  await expect(outlineLast).toHaveCSS("border-bottom-right-radius", "2px");
  expect(Math.round((await outline.boundingBox())!.width)).toBeLessThan(88);
  const sizeControlItem = page.locator("#单选框-线框型单选按钮组").getByRole("radio", { name: "small 28px" });
  await expect(sizeControlItem).toHaveCSS("white-space", "nowrap");
  expect(Math.round((await sizeControlItem.boundingBox())!.height)).toBe(26);

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  for (const demo of await page.locator("#component-radio .codebox-wrapper > .demo").all()) {
    expect(await demo.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.locator("#component-radio").screenshot({ path: testInfo.outputPath(`radio-${testInfo.project.name}.png`) });
});

test("Radio 鼠标、键盘、禁用、数量回退和尺寸控制", async ({ page }, testInfo) => {
  await page.goto("/#component-radio");
  await expect(page.getByRole("button", { name: "查看代码" })).toHaveCount(3);
  await expect(page.locator("#radio-API")).toBeVisible();

  const basic = page.getByRole("radio", { name: "单选框", exact: true });
  await basic.locator("xpath=..").click();
  await expect(basic).toBeChecked();
  await expect(basic.locator("xpath=../span[contains(@class, 'qizhi-radio-mask-wrapper')]/span")).toHaveCSS("box-shadow", "none");
  const disabled = page.getByRole("radio", { name: "禁用单选框" });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toBeChecked();

  const childrenGroup = page.getByRole("radiogroup", { name: "children 写法" });
  const optionTwo = childrenGroup.getByRole("radio", { name: "选项二" });
  await optionTwo.focus();
  await optionTwo.press("Space");
  await expect(optionTwo).toBeChecked();
  await expect(optionTwo.locator("xpath=../span[contains(@class, 'qizhi-radio-mask-wrapper')]/span")).not.toHaveCSS("box-shadow", "none");
  await expect(childrenGroup.getByRole("radio", { name: "选项一" })).not.toBeChecked();

  const outlineDemo = page.locator("#单选框-线框型单选按钮组");
  await outlineDemo.getByRole("radio", { name: "4", exact: true }).click();
  await outlineDemo.getByRole("radio", { name: "深圳" }).locator("xpath=..").click();
  await expect(outlineDemo.getByRole("radio", { name: "深圳" })).toBeChecked();
  await expect(outlineDemo.getByRole("radio", { name: "深圳" }).locator("xpath=..")).toHaveCSS("box-shadow", "none");
  await outlineDemo.getByRole("radio", { name: "2", exact: true }).click();
  await expect(outlineDemo.locator("[data-radio-preview] .qizhi-radio-button")).toHaveCount(2);
  await expect(outlineDemo.getByRole("radio", { name: "北京" })).toBeChecked();
  await outlineDemo.getByRole("radio", { name: "2", exact: true }).focus();
  await outlineDemo.getByRole("radio", { name: "2", exact: true }).press("ArrowRight");
  await expect(outlineDemo.getByRole("radio", { name: "3", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(outlineDemo.locator("[data-radio-preview] .qizhi-radio-button")).toHaveCount(3);
  await outlineDemo.getByRole("radio", { name: "small 28px" }).click();
  await expect(outlineDemo.locator("[data-radio-preview] .qizhi-radio-button").first()).toHaveCSS("height", "28px");
  await outlineDemo.getByRole("radio", { name: "large 36px" }).click();
  await expect(outlineDemo.locator("[data-radio-preview] .qizhi-radio-button").first()).toHaveCSS("height", "36px");

  await page.locator("#component-radio").screenshot({ path: testInfo.outputPath(`radio-selected-${testInfo.project.name}.png`) });
});
