import { expect, test } from "@playwright/test";

test("InputNumber React Island preserves the seven confirmed contracts", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-input-number");
  await expect(page.getByRole("heading", { name: "数字输入框 InputNumber" })).toBeVisible();
  await expect(page.locator("#component-input-number article.codebox-wrapper")).toHaveCount(7);
  await expect(page.locator("#component-input-number .code-preview code")).toHaveCount(20);
  await expect(page.getByText("只列出 QIZHI InputNumber v1 已实现能力。"))
    .toHaveCount(0);
  await expect(page.locator('.nav-link[href="#component-input-number"]')).toHaveClass(/is-active/);

  const basic = page.locator("#数字输入框-基础用法");
  const basicInput = basic.getByRole("spinbutton", { name: "基础数字输入框" });
  await expect(basicInput).toHaveValue("");
  if ((page.viewportSize()?.width ?? 0) > 600) {
    await expect(basic.locator(".qizhi-input-number").first()).toHaveCSS("width", "160px");
  }
  await basic.locator(".qizhi-input-number").first().hover();
  await expect(basic.locator(".qizhi-input-number__steps").first()).toHaveCSS("opacity", "1");
  await basic.locator(".qizhi-input-number").first().getByRole("button", { name: "增加" }).click();
  await expect(basicInput).toHaveValue("1");
  await basicInput.fill("15");
  await basic.locator(".qizhi-input-number").first().getByRole("button", { name: "增加" }).click();
  await expect(basicInput).toHaveValue("15");
  await expect(basic.getByRole("spinbutton", { name: "禁用数字输入框" })).toBeDisabled();

  const buttonMode = page.locator("#数字输入框-按钮模式");
  const buttonInput = buttonMode.getByRole("spinbutton", {
    name: "按钮模式数字输入框",
    exact: true,
  });
  await buttonMode.locator(".qizhi-input-number").first().getByRole("button", { name: "增加" }).click();
  await expect(buttonInput).toHaveValue("501");
  if ((page.viewportSize()?.width ?? 0) > 600) {
    await expect(buttonMode.locator(".qizhi-input-number").first()).toHaveCSS("width", "162px");
    await expect.poll(() => buttonMode.locator(".qizhi-input-number").first()
      .locator(".qizhi-input-number__step--addon").evaluateAll((buttons) =>
        buttons.map((button) => Math.round(button.getBoundingClientRect().height)),
      )).toEqual([30, 30]);
    await expect(buttonMode.locator(".qizhi-input-number").first()
      .locator(".qizhi-input-number__step--addon").first())
      .toHaveCSS("background-color", "rgb(247, 248, 250)");
    await expect(buttonMode.locator(".qizhi-input-number").nth(1))
      .toHaveCSS("background-color", "rgb(247, 248, 250)");
  }

  const size = page.locator("#数字输入框-三种尺寸");
  for (const [name, height] of [["small", 28], ["default", 32], ["large", 36]] as const) {
    await size.locator(".qizhi-radio-button", { hasText: name }).click();
    await expect(size.locator(".qizhi-input-number").first()).toHaveCSS("height", `${height}px`);
    await expect(size.locator(".qizhi-input-number").nth(1)).toHaveCSS("height", `${height}px`);
  }
  await size.locator(".qizhi-radio-button", { hasText: "default" }).click();
  await size.screenshot({ path: testInfo.outputPath("input-number-size.png") });

  const precision = page.locator("#数字输入框-精度和步长");
  const twoDecimals = precision.getByRole("spinbutton", { name: "两位小数" });
  await precision.locator(".qizhi-input-number").nth(1).hover();
  await precision.locator(".qizhi-input-number").nth(1).getByRole("button", { name: "减少" }).click();
  await expect(twoDecimals).toHaveValue("1.10");

  const formatter = page.locator("#数字输入框-格式化展示值");
  const delayed = formatter.getByRole("spinbutton", { name: "输入完成后格式化" });
  await expect(delayed).toHaveValue("12,000");
  await delayed.fill("12345");
  await expect(delayed).toHaveValue("12345");
  await delayed.blur();
  await expect(delayed).toHaveValue("12,345");
  await formatter.locator(".qizhi-input-number").nth(1).hover();
  await formatter.locator(".qizhi-input-number").nth(1).getByRole("button", { name: "增加" }).click();
  await expect(delayed).toHaveValue("13,345");
  await formatter.screenshot({ path: testInfo.outputPath("input-number-formatter.png") });

  const affix = page.locator("#数字输入框-前缀及后缀");
  await expect(affix.getByText("%", { exact: true })).toBeVisible();
  await expect(affix.getByText("¥", { exact: true })).toHaveCount(2);

  const strict = page.locator("#数字输入框-高精度");
  const strictInput = strict.getByRole("spinbutton", { name: "高精度数字输入框" });
  await strict.getByRole("button", { name: "增加" }).click();
  await expect(strictInput).toHaveValue("100000000000000000001");
  if ((page.viewportSize()?.width ?? 0) > 600) {
    await expect(strict.locator(".qizhi-input-number")).toHaveCSS("width", "480px");
  }
  await strict.screenshot({ path: testInfo.outputPath("input-number-strict.png") });

  await page.getByRole("button", { name: "查看代码" }).first().click();
  const code = page.locator("#input-number-code-数字输入框-基础用法");
  await expect(code).toContainText("<InputNumber");
  await expect(code).not.toContainText("Demo.tsx");
  await expect(page.getByRole("button", { name: "复制样式" })).toHaveCount(0);

  for (const article of await page.locator("#component-input-number article.codebox-wrapper").all()) {
    await expect.poll(() => article.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    )).toBe(true);
  }
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);
  expect(errors).toEqual([]);
});
