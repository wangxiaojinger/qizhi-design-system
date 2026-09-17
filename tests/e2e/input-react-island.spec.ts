import { expect, test } from "@playwright/test";

test("Input React Island exposes the approved component family", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-input");
  await expect(page.getByRole("heading", { name: "输入框 Input" })).toBeVisible();
  await expect(page.locator("#component-input article.codebox-wrapper")).toHaveCount(14);
  await expect(page.locator("#input-API")).toHaveCount(1);
  await expect(page.locator('.nav-link[href="#component-input"]')).toHaveClass(/is-active/);

  const basic = page.locator("#输入框-基本用法 .qizhi-input__field");
  await expect(basic).toHaveAttribute("placeholder", "请输入内容");
  if ((page.viewportSize()?.width ?? 0) > 600) await expect(page.locator("#输入框-基本用法 .qizhi-input")).toHaveCSS("width", "350px");
  await basic.fill("QIZHI");
  const basicRoot = page.locator("#输入框-基本用法 .qizhi-input");
  const basicClear = page.locator("#输入框-基本用法 .qizhi-input__clear");
  await expect(basicClear).toBeVisible();
  await expect(basicClear).toHaveCSS("color", "rgb(134, 144, 156)");
  await expect(basicClear).toHaveCSS("margin-right", "8px");
  await expect(basicClear).toHaveCSS("transition-duration", "0.16s");
  await expect.poll(async () => {
    const rootBox = await basicRoot.boundingBox();
    const iconBox = await basicClear.locator("svg").boundingBox();
    return rootBox && iconBox ? Math.round(rootBox.x + rootBox.width - iconBox.x - iconBox.width) : null;
  }).toBe(11);
  await basicClear.hover();
  await expect(basicClear).toHaveCSS("color", "rgb(134, 144, 156)");
  const clearBox = await basicClear.boundingBox();
  if (!clearBox) throw new Error("Clear button is not measurable");
  await page.mouse.move(clearBox.x + clearBox.width / 2, clearBox.y + clearBox.height / 2);
  await page.mouse.down();
  await expect(basicClear).toHaveCSS("color", "rgb(78, 89, 105)");
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.mouse.move(0, 0);
  await expect(basicClear).toBeHidden();
  await basicRoot.hover();
  await expect(basicClear).toBeVisible();
  await basicClear.click();
  await expect(basic).toHaveAttribute("value", "");

  await expect(page.locator("#四种尺寸 .qizhi-radio-group-type-button")).toHaveCount(1);
  await expect(page.locator("#四种尺寸 .qizhi-radio-button")).toHaveCount(4);
  await expect(page.locator("#四种尺寸 .input-size-demo__grid .qizhi-input")).toHaveCount(4);
  for (const [size, height] of [["mini", 24], ["small", 28], ["default", 32], ["large", 36]] as const) {
    await page.locator("#四种尺寸 .qizhi-radio-button", { hasText: size }).click();
    await expect.poll(() => page.locator("#四种尺寸 .qizhi-input").evaluateAll(
      (elements) => elements.map((element) => element.getBoundingClientRect().height),
    )).toEqual([height, height, height, height]);
    await expect.poll(() => page.locator("#四种尺寸 .qizhi-input__addon").evaluateAll(
      (elements) => elements.map((element) => element.getBoundingClientRect().height),
    )).toEqual([height, height]);
  }
  if ((page.viewportSize()?.width ?? 0) > 600) {
    await expect.poll(() => page.locator("#四种尺寸 .input-size-demo__grid > *").evaluateAll(
      (elements) => elements.map((element) => element.getBoundingClientRect().width),
    )).toEqual([350, 350, 350, 350]);
  }
  const heightSlider = page.getByRole("slider", { name: "自定义输入框高度" });
  await heightSlider.press("Home");
  for (let index = 0; index < 16; index += 1) {
    await heightSlider.press("ArrowRight");
  }
  await expect(heightSlider).toHaveAttribute("aria-valuenow", "40");
  await expect(page.locator("#四种尺寸 .input-size-demo__grid .qizhi-input").first()).toHaveCSS("height", "40px");
  await expect.poll(() => page.locator("#四种尺寸 .qizhi-input__addon").evaluateAll(
    (elements) => elements.map((element) => getComputedStyle(element).height),
  )).toEqual(["40px", "40px"]);
  await page.locator("#四种尺寸 .qizhi-radio-button", { hasText: "default" }).click();
  await expect(page.locator("#四种尺寸 .input-size-demo__grid .qizhi-input").first()).toHaveCSS("height", "32px");

  await expect(page.locator("#前置、后置标签 .qizhi-input__group")).toHaveCount(4);
  await expect(page.locator("#前置、后置标签 .qizhi-input__addon").first()).toHaveCSS("white-space", "nowrap");
  await expect(page.locator("#前置、后置标签 select")).toHaveCount(0);
  await expect(page.locator("#前置、后置标签 .qizhi-dropdown")).toHaveCount(1);
  await expect(page.locator("#前置、后置标签 .input-demo-dropdown__trigger")).toHaveClass(/qizhi-btn/);
  await expect(page.locator("#前置、后置标签 .input-demo-dropdown__arrow")).toHaveCSS("color", "rgb(134, 144, 156)");
  const timeUnitTrigger = page.getByRole("button", { name: "时间单位：分钟" });
  await timeUnitTrigger.click();
  await expect(page.locator("#前置、后置标签 .qizhi-dropdown__popup")).toBeVisible();
  await page.locator("#前置、后置标签").getByRole("menuitem", { name: "小时" }).click();
  await expect(page.getByRole("button", { name: "时间单位：小时" })).toBeFocused();
  if ((page.viewportSize()?.width ?? 0) > 600) {
    await expect.poll(() => page.locator("#前置、后置标签 .input-addon-demo > *").evaluateAll(
      (elements) => elements.map((element) => element.getBoundingClientRect().width),
    )).toEqual([350, 350, 350, 350]);
    await expect.poll(() => page.locator("#前后缀 .input-affix-demo > *").evaluateAll(
      (elements) => elements.map((element) => element.getBoundingClientRect().width),
    )).toEqual([350, 350, 350, 350]);
  }
  await expect(page.locator("#输入框组合 .qizhi-input__group")).toHaveCount(3);
  await expect(page.locator("#输入框组合 select")).toHaveCount(0);
  await expect(page.locator("#输入框组合 .qizhi-dropdown")).toHaveCount(3);
  await expect(page.locator("#输入框组合 .input-demo-dropdown__trigger.qizhi-btn")).toHaveCount(3);
  const firstCityTrigger = page.locator("#输入框组合 .input-demo-city-dropdown .input-demo-dropdown__trigger").first();
  await firstCityTrigger.click();
  await page.locator("#输入框组合 .input-demo-city-dropdown").first().getByRole("menuitem", { name: "天津" }).click();
  await expect(page.getByRole("button", { name: "城市：天津" })).toBeFocused();
  await expect(page.locator("#输入框组合 .input-combo-demo__loose")).toHaveCount(1);
  await expect(page.locator("#字数统计 .qizhi-textarea")).toHaveCount(3);

  await expect(page.locator("#前后缀 .input-affix-demo")).toHaveCSS("column-gap", "16px");
  await expect(page.locator("#前后缀 .input-affix-demo")).toHaveCSS("row-gap", "12px");
  await expect(page.locator("#搜索框 .input-search-demo")).toHaveCSS("column-gap", "16px");
  await expect(page.locator("#搜索框-Loading .input-search-demo")).toHaveCSS("row-gap", "12px");
  await expect(page.locator("#搜索框 .qizhi-input")).toHaveCount(1);
  await expect(page.locator("#搜索框-Loading .qizhi-input")).toHaveCount(1);
  await expect(page.locator("#文本域 .input-textarea-demo")).toHaveCSS("column-gap", "24px");
  await expect(page.locator("#文本域 .qizhi-textarea").nth(1)).toHaveClass(/qizhi-textarea--disabled/);
  await expect(page.locator("#文本域 .qizhi-textarea").nth(1).locator(".qizhi-textarea__control")).toHaveCSS("background-color", "rgb(247, 248, 250)");
  await expect(page.locator("#文本域 textarea").first()).toHaveCSS("color", "rgb(29, 33, 41)");
  await expect(page.locator("#适应文本高度文本域 .input-textarea-demo")).toHaveCSS("row-gap", "16px");
  await expect.poll(() => page.locator("#适应文本高度文本域 textarea").evaluateAll(
    (elements) => elements.map((element, index) => {
      const textarea = element as HTMLTextAreaElement;
      return index === 0
        ? textarea.getBoundingClientRect().height >= textarea.scrollHeight
        : textarea.scrollHeight > textarea.clientHeight && getComputedStyle(textarea).overflowY === "auto";
    }),
  )).toEqual([true, true]);
  await expect(page.locator("#密码输入 .input-password-demo")).toHaveCSS("column-gap", "24px");
  await expect(page.locator('#搜索框 [data-icon="icon-搜索-搜索"]')).toHaveCount(1);
  await expect(page.locator('#搜索框-Loading [data-icon="icon-加载中"]')).toHaveCount(1);
  const searchField = page.locator("#搜索框 input");
  const searchRoot = page.locator("#搜索框 .qizhi-input");
  const searchIcon = page.locator('#搜索框 [data-icon="icon-搜索-搜索"]');
  await searchField.fill("QIZHI");
  await searchRoot.hover();
  await expect(page.locator("#搜索框 .qizhi-input__clear")).toHaveCount(0);
  await expect(searchIcon).toBeVisible();
  await expect.poll(() => page.locator("#前后缀 .qizhi-input__addon svg").evaluateAll(
    (icons) => icons.map((icon) => [icon.getBoundingClientRect().width, icon.getBoundingClientRect().height]),
  )).toEqual([[16, 16]]);
  const passwordToggle = page.locator("#密码输入 .qizhi-input-password__toggle").first();
  await expect(passwordToggle).toHaveCSS("color", "rgb(134, 144, 156)");
  await passwordToggle.hover();
  await expect(passwordToggle).toHaveCSS("color", "rgb(134, 144, 156)");
  await expect(page.locator('#密码输入 [data-icon="icon-眼睛-隐藏"]')).toHaveCount(1);
  await expect(page.locator('#密码输入 [data-icon="icon-眼睛-可见"]')).toHaveCount(1);

  for (const selector of [
    "#前后缀 .input-affix-demo",
    "#搜索框 .input-search-demo",
    "#搜索框-Loading .input-search-demo",
    "#输入框组合 .input-combo-demo",
    "#文本域 .input-textarea-demo",
    "#适应文本高度文本域 .input-textarea-demo",
  ]) {
    await expect.poll(() => page.locator(selector).evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    )).toBe(true);
  }

  const password = page.locator("#密码输入 input").first();
  await page.locator("#密码输入 button[aria-label='显示密码']").click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toBeFocused();
  await expect(page.locator('#密码输入 [data-icon="icon-眼睛-可见"]')).toHaveCount(2);

  const overflow = page.locator("#字数统计 input").nth(1);
  await expect(overflow).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#字数统计 .qizhi-input__word-limit--error")).toContainText("/10");

  const normalize = page.locator("#格式化输入值 input").nth(1);
  await normalize.fill(" QIZHI ");
  await normalize.press("Enter");
  await expect(normalize).toHaveValue("QIZHI");

  await page.getByRole("button", { name: "查看代码" }).first().click();
  await expect(page.locator("#input-code-输入框-基本用法")).not.toContainText("Demo.tsx");
  await expect(page.locator("#input-code-输入框-基本用法")).not.toContainText("Demo.css");
  await expect(page.locator("#input-code-输入框-基本用法 .qizhi-code-source-label")).toHaveText(["TSX", "CSS"]);
  await expect(page.locator("#input-code-输入框-基本用法")).toContainText("#component-input");
  await expect(page.locator("#input-code-输入框-基本用法")).not.toContainText("--qizhi-color-text-3");
  await expect(page.getByRole("button", { name: "复制样式" })).toHaveCount(14);

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("input-docs.png"), fullPage: true });
  await page.locator("#四种尺寸").screenshot({ path: testInfo.outputPath("input-size-demo.png") });
  await page.locator("#前置、后置标签").screenshot({ path: testInfo.outputPath("input-addon-demo.png") });
  await page.locator("#文本域").screenshot({ path: testInfo.outputPath("input-textarea-demo.png") });
  expect(errors).toEqual([]);
});
