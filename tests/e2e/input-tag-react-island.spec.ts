import { expect, test } from "@playwright/test";

test("InputTag React Island preserves the six legacy contracts", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-input-tag");
  await expect(page.getByRole("heading", { name: "标签输入框 InputTag" })).toBeVisible();
  await expect(page.locator("#component-input-tag article.codebox-wrapper")).toHaveCount(6);
  await expect(page.locator('.nav-link[href="#component-input-tag"]')).toHaveClass(/is-active/);

  const sizeDemo = page.locator("#标签输入框不同尺寸");
  await expect(sizeDemo.locator(".qizhi-radio-group-type-button")).toHaveCount(1);
  for (const [size, height] of [["small", 28], ["default", 32], ["large", 36]] as const) {
    await sizeDemo.locator(".qizhi-radio-button", { hasText: size }).click();
    await expect(sizeDemo.locator(".qizhi-input-tag")).toHaveCSS("height", `${height}px`);
  }
  await sizeDemo.locator(".qizhi-radio-button", { hasText: "default" }).click();
  await sizeDemo.screenshot({ path: testInfo.outputPath("input-tag-size.png") });
  const cityInput = sizeDemo.getByRole("textbox", { name: "城市标签" });
  await cityInput.fill("广州");
  await cityInput.press("Enter");
  await expect(sizeDemo.getByText("广州", { exact: true })).toBeVisible();
  await sizeDemo.getByRole("button", { name: "删除 广州" }).click();
  await expect(cityInput).toBeFocused();
  await sizeDemo.getByRole("button", { name: "清空" }).click();
  await expect(sizeDemo.locator(".qizhi-input-tag__tag")).toHaveCount(0);
  await expect(cityInput).toHaveAttribute("placeholder", "请输入标签");

  const labelDemo = page.locator("#获取选项的文本");
  await expect(labelDemo.locator(".input-tag-demo-result"))
    .toHaveText('[{"label":"选项一","value":"1"}]');
  const optionInput = labelDemo.getByRole("textbox", { name: "选项标签" });
  await optionInput.fill("选项二");
  await optionInput.press(",");
  await expect(labelDemo.locator(".input-tag-demo-result"))
    .toContainText('{"label":"选项二","value":"选项二"}');

  const validateDemo = page.locator("#校验与格式化输入");
  if ((page.viewportSize()?.width ?? 0) > 600) {
    await expect.poll(() => validateDemo.locator(".qizhi-input-tag").evaluateAll(
      (elements) => elements.map((element) => Math.round(element.getBoundingClientRect().width)),
    )).toEqual([350, 350]);
  }
  const validateInput = validateDemo.getByRole("textbox", { name: "校验标签" });
  await validateInput.fill("abc");
  await validateInput.press("Enter");
  await expect(validateDemo.getByText("长度必须大于 3", { exact: true })).toBeVisible();
  await expect(validateInput).toHaveAttribute("aria-invalid", "true");
  await expect(validateDemo.locator(".qizhi-input-tag").first())
    .toHaveCSS("border-color", "rgb(255, 77, 79)");
  await validateDemo.screenshot({ path: testInfo.outputPath("input-tag-validate.png") });
  await validateInput.fill("QIZHI");
  await validateInput.press("Enter");
  await expect(validateDemo.getByText("QIZHI", { exact: true })).toBeVisible();

  const formatInput = validateDemo.getByRole("textbox", { name: "格式化标签" });
  await formatInput.fill("模型");
  await formatInput.press("Enter");
  await expect(validateDemo.locator(".input-tag-demo-result"))
    .toHaveText('[{"word":"模型"}]');

  const blurDemo = page.locator("#失焦时保存");
  const blurInput = blurDemo.getByRole("textbox", { name: "失焦保存标签" });
  await blurInput.fill("待保存");
  await page.getByRole("heading", { name: "最大标签数" }).click();
  await expect(blurDemo.getByText("待保存", { exact: true })).toBeVisible();

  const maxDemo = page.locator("#最大标签数");
  await expect(maxDemo.locator(".qizhi-input-tag").first().locator(".qizhi-input-tag__tag"))
    .toHaveCount(3);
  await expect(maxDemo.getByText("+2", { exact: true })).toBeVisible();
  await expect(maxDemo.getByText("2 个更多", { exact: true })).toBeVisible();
  await expect(maxDemo.locator(".qizhi-input-tag__input").first())
    .toHaveCSS("width", "2px");
  await maxDemo.locator(".qizhi-input-tag").first()
    .getByRole("button", { name: "删除 1" }).click();
  await expect(maxDemo.locator(".qizhi-input-tag__more").first()).toHaveText("+1");

  const responsiveDemo = page.locator("#响应式显示Tag");
  await expect(responsiveDemo.locator(".qizhi-input-tag")).toHaveCount(2);
  await responsiveDemo.screenshot({ path: testInfo.outputPath("input-tag-responsive.png") });
  if ((page.viewportSize()?.width ?? 0) > 600) {
    await expect(responsiveDemo.locator(".qizhi-input-tag").first().locator(".qizhi-input-tag__tag"))
      .toHaveCount(3);
    await expect(responsiveDemo.locator(".qizhi-input-tag").nth(1).locator(".qizhi-input-tag__tag"))
      .toHaveCount(2);
    await expect(responsiveDemo.locator(".qizhi-input-tag__more").first())
      .toHaveText("+2");
    await expect(responsiveDemo.locator(".qizhi-input-tag__more").nth(1))
      .toHaveText("+3 个更多");
    await responsiveDemo.locator(".qizhi-input-tag").first()
      .getByRole("button", { name: "删除 标签 1" }).click();
    await expect(responsiveDemo.locator(".qizhi-input-tag").first()
      .locator(".qizhi-input-tag__more")).toHaveText("+1");
  } else {
    await expect(responsiveDemo.locator(".qizhi-input-tag__more")).toHaveCount(2);
  }

  await page.getByRole("button", { name: "查看代码" }).first().click();
  const code = page.locator("#input-tag-code-标签输入框不同尺寸");
  await expect(code.locator(".qizhi-code-source-label")).toHaveText(["TSX", "CSS"]);
  await expect(code).toContainText("#component-input-tag");
  await expect(page.getByRole("button", { name: "复制样式" })).toHaveCount(0);

  for (const selector of [
    "#标签输入框不同尺寸",
    "#校验与格式化输入",
    "#最大标签数",
    "#响应式显示Tag",
  ]) {
    await expect.poll(() => page.locator(selector).evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    )).toBe(true);
  }
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);

  expect(errors).toEqual([]);
});
