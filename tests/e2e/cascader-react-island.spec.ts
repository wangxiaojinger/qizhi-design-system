import { expect, test } from "@playwright/test";

test("Cascader React Island keeps the complete docs and page width", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/#component-cascader");
  await expect(page.getByRole("heading", { name: "级联选择 Cascader" })).toBeVisible();
  await expect(page.locator("#component-cascader .codebox-wrapper")).toHaveCount(15);
  await expect(page.locator("#cascader-API")).toHaveCount(1);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("cascader-docs.png"), fullPage: false });
});

test("Cascader selects a path and restores focus with Escape", async ({ page }) => {
  await page.goto("/#component-cascader");
  const section = page.locator("#级联选择-基础用法");
  const input = section.locator(".qizhi-cascader").first().getByRole("combobox");
  await input.focus();
  await input.press("Enter");
  await expect(input).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("option", { name: "上海", exact: true }).click();
  await page.getByRole("option", { name: "上海市", exact: true }).click();
  await page.getByRole("option", { name: "黄浦", exact: true }).click();
  await expect(input).toHaveValue("上海 / 上海市 / 黄浦");
  await input.press("Enter");
  await input.press("Escape");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "false");
});

test("Cascader hover mode expands first and selects the final option on click", async ({ page }, testInfo) => {
  await page.goto("/#component-cascader");
  const section = page.locator("#级联选择-基础用法");
  const input = section.locator(".qizhi-cascader").nth(1).getByRole("combobox");

  await input.hover();
  await page.getByRole("option", { name: "北京", exact: true }).hover();
  const submenuIcon = page.getByRole("option", { name: "北京市", exact: true }).locator("svg");
  await expect(submenuIcon).toHaveCount(1);
  await expect(submenuIcon).toHaveCSS("width", "12px");
  await expect(submenuIcon).toHaveCSS("height", "12px");
  await page.getByRole("option", { name: "北京市", exact: true }).hover();
  const finalOption = page.getByRole("option", { name: "东城", exact: true });
  await finalOption.hover();

  await expect(input).toHaveAttribute("aria-expanded", "true");
  await expect(input).toHaveValue("");
  await expect(page.locator(".qizhi-cascader-popup").getByRole("listbox")).toHaveCount(3);
  const horizontalOverflow = await page.locator(".qizhi-cascader-popup").evaluate(
    (element) => element.scrollWidth - element.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath("cascader-hover-final-option.png"), fullPage: false });

  await finalOption.click();
  await expect(input).toHaveValue("北京 / 北京市 / 东城");
  await expect(input).toHaveAttribute("aria-expanded", "false");
});

test("Cascader multiple tags stay contained and ellipsize when space is insufficient", async ({ page }, testInfo) => {
  await page.goto("/#component-cascader");
  const section = page.locator("#级联选择-前置标签");
  const cascader = section.locator(".qizhi-cascader").nth(1);
  const input = cascader.getByRole("combobox");

  await input.hover();
  await page.getByRole("option", { name: "北京", exact: true }).hover();
  await page.getByRole("option", { name: "朝阳", exact: true }).click();

  const tag = cascader.getByRole("listitem", { name: "北京 / 朝阳" });
  await expect(tag).toBeVisible();
  const tagGeometry = await tag.evaluate((element) => {
    const cascader = element.closest(".qizhi-cascader");
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      cascaderHeight: cascader?.getBoundingClientRect().height,
    };
  });
  if (tagGeometry.scrollWidth > tagGeometry.clientWidth) {
    await expect(tag).toHaveCSS("text-overflow", "ellipsis");
  }
  const containment = await tag.evaluate((element) => {
    const tag = element.getBoundingClientRect();
    const cascader = element.closest(".qizhi-cascader")!.getBoundingClientRect();
    return { left: tag.left - cascader.left, right: cascader.right - tag.right };
  });
  expect(containment.left).toBeGreaterThanOrEqual(0);
  expect(containment.right).toBeGreaterThanOrEqual(0);
  expect(tagGeometry.cascaderHeight).toBe(32);
  await page.screenshot({ path: testInfo.outputPath("cascader-multiple-tag.png"), fullPage: false });
});

test("Cascader size demo follows the legacy segmented layout", async ({ page }, testInfo) => {
  await page.goto("/#component-cascader");
  const section = page.locator("#级联选择-不同尺寸");
  const controls = section.locator(".qizhi-cascader");

  const sizeControl = section.getByRole("radiogroup", { name: "级联选择尺寸" });
  await expect(sizeControl.getByRole("radio")).toHaveCount(4);
  const segmentedOverflow = await sizeControl.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(segmentedOverflow).toBeLessThanOrEqual(1);
  await expect(controls).toHaveCount(2);
  await section.getByRole("radio", { name: "mini" }).click();

  for (const control of await controls.all()) {
    await expect(control).toHaveCSS("min-height", "24px");
  }
  const widths = await controls.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
  expect(widths[0]).toBe(widths[1]);
  expect(widths[0]).toBeGreaterThan(0);
  expect(widths[0]).toBeLessThanOrEqual(300);
  const positions = await controls.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }));
  const controlsWidth = await section.locator(".cascader-size-demo__controls")
    .evaluate((element) => element.clientWidth);
  if (controlsWidth < widths[0] + widths[1] + 24) {
    expect(positions[1].top).toBeGreaterThan(positions[0].top);
  } else {
    expect(positions[1].top).toBe(positions[0].top);
    expect(positions[1].left - positions[0].left - widths[0]).toBe(24);
  }
  await page.screenshot({ path: testInfo.outputPath("cascader-size-demo.png"), fullPage: false });
});

test("Cascader search portal is unclipped and stays inside the viewport", async ({ page }, testInfo) => {
  await page.goto("/#component-cascader");
  const input = page.locator("#级联选择-允许搜索 .qizhi-cascader")
    .first().getByRole("combobox");
  await input.scrollIntoViewIfNeeded();
  await input.fill("黄浦");
  const popup = page.locator(".qizhi-cascader-popup");
  await expect(popup).toBeVisible();
  await expect(popup.getByRole("option", { name: "上海 / 上海市 / 黄浦" })).toBeVisible();

  const geometry = await popup.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const trigger = document.querySelector("#级联选择-允许搜索 [role='combobox']")?.getBoundingClientRect();
    return {
      parent: element.parentElement?.tagName,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      triggerTop: trigger?.top,
      triggerBottom: trigger?.bottom,
      position: getComputedStyle(element).position,
      inlineStyle: element.getAttribute("style"),
    };
  });
  expect(geometry.parent).toBe("BODY");
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.top).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.bottom, JSON.stringify(geometry)).toBeLessThanOrEqual(geometry.viewportHeight);
  await page.screenshot({ path: testInfo.outputPath("cascader-search-open.png"), fullPage: false });
});

test("Cascader code panel uses the shared Input code surface", async ({ page }) => {
  await page.goto("/#component-cascader");
  const cascaderSection = page.locator("#级联选择-基础用法");
  await cascaderSection.getByRole("button", { name: "查看代码" }).click();
  const cascaderBackground = await cascaderSection
    .locator(".qizhi-code-wrapper pre").first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.goto("/#component-input");
  const inputSection = page.locator("#输入框-基本用法");
  await inputSection.getByRole("button", { name: "查看代码" }).click();
  const inputBackground = await inputSection
    .locator(".qizhi-code-wrapper pre").first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(cascaderBackground).toBe(inputBackground);
  expect(cascaderBackground).not.toBe("rgba(0, 0, 0, 0)");
});

test("Cascader clear action replaces the filled dropdown icon on hover", async ({ page }) => {
  await page.goto("/#component-cascader");
  const cascader = page.locator("#级联选择-允许清除 .qizhi-cascader");
  const clear = cascader.getByRole("button", { name: "清除" });
  const arrow = cascader.locator(".qizhi-cascader__arrow");

  await expect(clear).toBeHidden();
  await expect(arrow).toBeVisible();
  await expect(cascader.locator(".qizhi-cascader__clear svg")).toHaveCSS("width", "12px");
  await expect(cascader.locator(".qizhi-cascader__clear svg")).toHaveCSS("height", "12px");
  await expect(arrow.locator("svg")).toHaveCSS("width", "12px");
  await expect(arrow.locator("svg")).toHaveCSS("height", "12px");
  await expect(arrow.locator("svg")).toHaveAttribute("viewBox", "1.6 1.6 12.8 12.8");
  await cascader.hover();
  await expect(clear).toBeVisible();
  await expect(arrow).toBeHidden();
  await expect(arrow.locator("path")).toHaveAttribute("fill", "currentColor");
});

test("Cascader custom trigger keeps the legacy label-link presentation", async ({ page }) => {
  await page.goto("/#component-cascader");
  const section = page.locator("#级联选择-自定义选择框");
  const root = section.locator(".qizhi-cascader");
  const label = section.locator(".cascader-custom-trigger-label");
  const trigger = root.getByRole("combobox", { name: "选择城市" });

  await expect(root).toHaveCSS("border-top-width", "0px");
  await expect(root).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(label).toHaveCSS("color", "rgb(29, 33, 41)");
  await expect(trigger).toHaveCSS("color", "rgb(51, 102, 255)");
});

test("Cascader API follows the shared documentation baseline", async ({ page }) => {
  await page.goto("/#component-cascader");
  const api = page.locator("#cascader-API");
  const table = api.getByRole("table", { name: "Cascader API" });
  const modeRow = table.getByRole("row", { name: /^mode / });

  await expect(table).toBeVisible();
  await expect(modeRow.locator("td").first().locator("code"))
    .toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(modeRow.locator("td").nth(1).locator("code").first())
    .toHaveCSS("font-size", "12px");
  await expect(modeRow.locator("td").nth(2).locator("code"))
    .toHaveCSS("color", "rgb(245, 49, 157)");

  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
