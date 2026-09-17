import { expect, test } from "@playwright/test";

test("Business object selection preserves the legacy contract", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#business-object-selection");
  const section = page.locator("#business-object-selection");
  await expect(section.getByRole("heading", { name: "对象选择", exact: true })).toBeVisible();
  await expect(section.locator(".codebox-wrapper")).toHaveCount(4);
  await expect(section.locator("#business-object-selection-API table")).toHaveCount(5);
  await expect(section.getByRole("table", { name: "BasicChoiceCards API" }))
    .toBeVisible();
  await expect(section.getByRole("table", { name: "IconChoiceCards API" }))
    .toBeVisible();
  await expect(section.locator(".component-example-actions .qizhi-code-action"))
    .toHaveCount(8);
  if (testInfo.project.name === "desktop-1440") {
    const toc = page.locator(".toc");
    await expect(toc).toBeVisible();
    await expect(toc.locator(".toc-link")).toHaveText([
      "基础选项卡",
      "不同尺寸",
      "带图标选项卡",
      "业务对象选择器",
      "API",
    ]);
  }

  const basic = section.getByRole("radiogroup", { name: "选择部署模式" });
  const dedicated = basic.getByRole("radio", { name: /专属实例/ });
  const scheduled = basic.getByRole("radio", { name: /定时实例/ });
  await expect(dedicated).not.toBeChecked();
  await expect(scheduled).toBeDisabled();
  await basic.getByText("专属实例", { exact: true }).click();
  await expect(dedicated).toBeChecked();

  await expect(section.getByRole("radio", { name: /公共空间/ })).toBeChecked();
  await expect(section.getByRole("radiogroup", { name: "选择服务模式" })
    .getByRole("radio", { name: /专属实例/ })).toBeChecked();
  await expect(section.getByRole("radio", { name: /自定义部署/ })).toBeChecked();
  await section.getByRole("radio", { name: /自定义部署/ }).press("ArrowRight");
  await expect(section.getByRole("radio", { name: /大语言模型部署/ })).toBeChecked();

  if (testInfo.project.name === "desktop-1440") {
    await expect(section.locator(".business-choice-basic").first()).toHaveCSS("width", "558px");
    const basicWidths = await basic.locator(".qizhi-choice-card")
      .evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().width));
    expect(basicWidths).toEqual([275, 275]);
    await expect(section.locator(".business-choice-small")).toHaveCSS("width", "408px");
    await expect(section.locator(".business-choice-icons")).toHaveCSS("width", "704px");
  }

  await expect(section.getByText("INF-v2-8k")).toBeVisible();
  await expect(section.getByText("V2", { exact: true }).last()).toBeVisible();
  const switchButton = section.getByRole("button", { name: /切换/ });
  await expect(switchButton.locator(":scope > :first-child")).toHaveClass(/qizhi-btn__label/);
  await expect(switchButton.locator(":scope > :last-child")).toHaveClass(/qizhi-btn__icon/);
  const switchColors = await switchButton.evaluate((node) => {
    const labelColor = getComputedStyle(node.querySelector<HTMLElement>(".qizhi-btn__label")!).color;
    const iconPathStyle = getComputedStyle(node.querySelector<SVGPathElement>(".qizhi-object-selector__switch-icon path")!);
    return { label: labelColor, iconFill: iconPathStyle.fill, iconFillOpacity: iconPathStyle.fillOpacity };
  });
  expect(switchColors.iconFill).toBe(switchColors.label);
  expect(switchColors.iconFillOpacity).toBe("1");
  const selectedIcon = section.locator(".qizhi-selected-object__icon");
  await expect(selectedIcon).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const selectedIconFrame = await selectedIcon.evaluate((node) => {
    const style = getComputedStyle(node, "::before");
    return { backgroundImage: style.backgroundImage, paddingTop: style.paddingTop };
  });
  expect(selectedIconFrame.backgroundImage).toContain("rgb(129, 139, 255)");
  expect(selectedIconFrame.backgroundImage).toContain("rgb(161, 123, 255)");
  expect(selectedIconFrame.paddingTop).toBe("1px");
  await switchButton.click();
  const dialog = page.getByRole("dialog", { name: "选择模型" });
  await expect(dialog).toBeVisible();
  const objectIcon = dialog.locator(".qizhi-object-option__icon").first();
  await expect(objectIcon).toHaveCSS("width", "18px");
  await expect(objectIcon).toHaveCSS("height", "18px");
  await expect(objectIcon).toHaveCSS("border-top-width", "0px");
  await expect(objectIcon).toHaveCSS("border-radius", "4px");
  await expect(objectIcon).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const iconFrame = await objectIcon.evaluate((node) => {
    const style = getComputedStyle(node, "::before");
    return {
      backgroundImage: style.backgroundImage,
      paddingTop: style.paddingTop,
    };
  });
  expect(iconFrame.backgroundImage).toContain("linear-gradient");
  expect(iconFrame.backgroundImage).toContain("rgb(129, 139, 255)");
  expect(iconFrame.backgroundImage).toContain("rgb(161, 123, 255)");
  expect(iconFrame.paddingTop).toBe("1px");
  await expect(objectIcon.locator("svg")).toHaveAttribute("viewBox", "0 0 24 24");
  await expect(objectIcon.locator("svg")).toHaveCSS("width", "14px");
  await expect(objectIcon.locator("svg")).toHaveCSS("height", "14px");
  const iconToTextGap = await dialog.locator(".qizhi-object-option").first().evaluate((node) => {
    const icon = node.querySelector<HTMLElement>(".qizhi-object-option__icon")!;
    const body = node.querySelector<HTMLElement>(".qizhi-object-option__body")!;
    return Math.round(body.getBoundingClientRect().left - icon.getBoundingClientRect().right);
  });
  expect(iconToTextGap).toBe(8);
  await expect(dialog.getByText(/已选模型 1\/1/)).toHaveCSS("font-size", "14px");
  if (testInfo.project.name === "desktop-1440") {
    await expect(dialog).toHaveCSS("width", "920px");
  }
  const search = dialog.getByRole("textbox", { name: "搜索模型" });
  await search.fill("vision");
  await expect(dialog.getByRole("option", { name: /INF-1.5-vision-pro/ })).toBeVisible();
  await expect(dialog.getByRole("option", { name: /INF-v2-8k/ })).toHaveCount(0);
  await search.fill("");
  const projectFilter = dialog.getByRole("combobox", { name: "筛选所属项目" });
  await projectFilter.click();
  await page.getByRole("option", { name: "所属项目：具身智能" }).click();
  await expect(projectFilter).toHaveValue("所属项目：具身智能");
  await expect(dialog.getByRole("option")).toHaveCount(3);
  const firstOption = dialog.getByRole("option", { name: /INF-v2-8k/ });
  await firstOption.focus();
  await firstOption.press("ArrowDown");
  const secondOption = dialog.getByRole("option", { name: /INF-v1-128k/ });
  await expect(secondOption).toHaveAttribute("aria-selected", "true");
  await expect(dialog.getByRole("button", { name: "确认" })).toBeDisabled();
  await dialog.getByText("V3", { exact: true }).click();
  await dialog.getByRole("button", { name: "取消" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(switchButton).toBeFocused();
  await expect(section.getByText("INF-v2-8k")).toBeVisible();

  await switchButton.click();
  await dialog.getByRole("option", { name: /INF-v1-128k/ }).click();
  await dialog.getByText("V3", { exact: true }).click();
  await dialog.getByRole("button", { name: "确认" }).click();
  await expect(section.getByText("INF-v1-128k")).toBeVisible();
  await expect(section.getByText("V3", { exact: true }).last()).toBeVisible();

  const updatedSwitch = section.getByRole("button", { name: /切换/ });
  await updatedSwitch.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("opacity", "1");
  const modalGeometry = await dialog.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const ancestors = [];
    let current: HTMLElement | null = node.parentElement;
    while (current) {
      const style = getComputedStyle(current);
      const ancestorRect = current.getBoundingClientRect();
      ancestors.push({
        tag: current.tagName,
        className: current.className,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        clipsX: ["hidden", "clip"].includes(style.overflowX)
          && (rect.left < ancestorRect.left || rect.right > ancestorRect.right),
        clipsY: ["hidden", "clip"].includes(style.overflowY)
          && (rect.top < ancestorRect.top || rect.bottom > ancestorRect.bottom),
      });
      current = current.parentElement;
    }
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
      ancestors,
    };
  });
  expect(modalGeometry.left).toBeGreaterThanOrEqual(0);
  expect(modalGeometry.top).toBeGreaterThanOrEqual(0);
  expect(modalGeometry.right).toBeLessThanOrEqual(modalGeometry.viewportWidth);
  expect(modalGeometry.bottom).toBeLessThanOrEqual(modalGeometry.viewportHeight);
  expect(modalGeometry.ancestors.some((ancestor) => ancestor.clipsX || ancestor.clipsY))
    .toBe(false);
  await page.screenshot({
    path: testInfo.outputPath(`business-object-selector-open-${testInfo.project.name}.png`),
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(updatedSwitch).toBeFocused();

  await updatedSwitch.click();
  await dialog.getByRole("button", { name: "关闭对话框" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(updatedSwitch).toBeFocused();

  await updatedSwitch.click();
  await page.locator(".qizhi-modal__mask").click({ position: { x: 4, y: 4 } });
  await expect(dialog).toHaveCount(0);
  await expect(updatedSwitch).toBeFocused();

  const firstCodebox = section.locator(".codebox-wrapper").first();
  await firstCodebox.getByRole("button", { name: "查看代码" }).click();
  await expect(firstCodebox.locator(".qizhi-code-wrapper"))
    .toContainText("BasicChoiceCards");
  await expect(firstCodebox.locator(":scope > .component-example-actions"))
    .toHaveCSS("padding-right", "0px");
  await expect(section.locator(".codebox-wrapper").last().locator(":scope > .demo"))
    .toHaveCSS("margin-bottom", "12px");

  await expect.poll(() => section.evaluate((node) => (
    node.scrollWidth <= node.clientWidth
  ))).toBe(true);
  await section.screenshot({
    path: testInfo.outputPath(`business-object-selection-${testInfo.project.name}.png`),
  });
  expect(errors).toEqual([]);
});
