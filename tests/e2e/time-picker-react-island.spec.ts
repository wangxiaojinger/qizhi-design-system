import { expect, test } from "@playwright/test";

const expectPopupAttachedToTrigger = async (
  trigger: import("@playwright/test").Locator,
  popup: import("@playwright/test").Locator,
) => {
  await expect.poll(async () => {
    const triggerBox = await trigger.boundingBox();
    const popupBox = await popup.boundingBox();
    if (!triggerBox || !popupBox) return false;
    const alignedLeft = Math.abs(popupBox.x - triggerBox.x) <= 1;
    const below = Math.abs(popupBox.y - (triggerBox.y + triggerBox.height + 4)) <= 1;
    const above = Math.abs(triggerBox.y - (popupBox.y + popupBox.height + 4)) <= 1;
    return alignedLeft && (below || above);
  }).toBe(true);
};

test("TimePicker React Island preserves all eight approved contracts", async ({ context, page }, testInfo) => {
  test.setTimeout(60_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-time-picker");
  const section = page.locator("#component-time-picker");
  await expect(page.getByRole("heading", { name: "时间选择器 TimePicker" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(8);
  await expect(section.getByRole("table", { name: "TimePicker API" })).toBeVisible();

  const basic = section.locator("#时间选择器-基础用法");
  const basicInput = basic.getByRole("combobox", { name: "选择时间" });
  await expect(basicInput).toHaveValue("");
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await expect(basic.locator(".qizhi-time-picker")).toHaveCSS("width", "194px");
    await expect(basic.locator(".qizhi-time-picker")).toHaveCSS("height", "32px");
  }
  await basicInput.click();
  const basicPopup = page.getByRole("dialog", { name: "选择时间" });
  await expect(basicPopup).toBeVisible();
  await expectPopupAttachedToTrigger(basic.locator(".qizhi-time-picker"), basicPopup);
  await expect(basicPopup.getByRole("listbox")).toHaveCount(3);
  await expect.poll(() => basicPopup.evaluate((popup) => {
    const rect = popup.getBoundingClientRect();
    return rect.left >= 0 && rect.top >= 0 &&
      rect.right <= window.innerWidth && rect.bottom <= window.innerHeight;
  })).toBe(true);
  await expect.poll(() => basicPopup.locator(".qizhi-time-panel__column").evaluateAll(
    (columns) => columns.map((column) => Math.round(column.getBoundingClientRect().width)),
  )).toEqual([64, 64, 64]);
  const clippingAncestors = await basicPopup.evaluate((popup) => {
    const offenders: string[] = [];
    const popupRect = popup.getBoundingClientRect();
    let ancestor: Element | null = popup.parentElement;
    while (ancestor) {
      const style = getComputedStyle(ancestor);
      const rect = ancestor.getBoundingClientRect();
      const clippedX = (style.overflowX === "hidden" || style.overflowX === "clip") &&
        (popupRect.left < rect.left || popupRect.right > rect.right);
      const clippedY = (style.overflowY === "hidden" || style.overflowY === "clip") &&
        (popupRect.top < rect.top || popupRect.bottom > rect.bottom);
      if (clippedX || clippedY) {
        offenders.push(`${ancestor.tagName}:overflow=${style.overflowX}/${style.overflowY}`);
      }
      if (style.clipPath !== "none") {
        offenders.push(`${ancestor.tagName}:clip=${style.clipPath};contain=${style.contain}`);
      }
      if (/paint|strict/.test(style.contain) &&
        (popupRect.left < rect.left || popupRect.right > rect.right ||
          popupRect.top < rect.top || popupRect.bottom > rect.bottom)) {
        offenders.push(`${ancestor.tagName}:contain=${style.contain}`);
      }
      ancestor = ancestor.parentElement;
    }
    return offenders;
  });
  expect(clippingAncestors).toEqual([]);
  await basicPopup.getByRole("listbox", { name: "时" }).getByRole("option", { name: "09" }).click();
  await expect(basicInput).toHaveValue("09:00:00");
  await page.evaluate(() => window.scrollBy(0, 24));
  await expectPopupAttachedToTrigger(basic.locator(".qizhi-time-picker"), basicPopup);
  const viewport = page.viewportSize();
  if (viewport) {
    await page.setViewportSize({ width: viewport.width - 20, height: viewport.height });
    await expectPopupAttachedToTrigger(basic.locator(".qizhi-time-picker"), basicPopup);
    await page.setViewportSize(viewport);
  }
  await basicPopup.screenshot({ path: testInfo.outputPath("time-picker-basic-open.png") });
  await basicInput.press("Escape");
  await expect(basicPopup).toBeHidden();
  await expect(basicInput).toBeFocused();

  const range = section.locator("#时间选择器-范围选择器");
  const start = range.getByRole("combobox", { name: "开始时间" });
  const end = range.getByRole("combobox", { name: "结束时间" });
  await start.click();
  await page.getByRole("dialog", { name: "选择时间范围" })
    .getByRole("listbox", { name: "时" }).getByRole("option", { name: "18" }).click();
  await end.click();
  await page.getByRole("dialog", { name: "选择时间范围" })
    .getByRole("listbox", { name: "时" }).getByRole("option", { name: "08" }).click();
  await expect(start).toHaveValue("08:00:00");
  await expect(end).toHaveValue("18:00:00");
  await range.screenshot({ path: testInfo.outputPath("time-picker-range-open.png") });
  await end.press("Escape");

  const status = section.locator("#时间选择器-不同状态");
  await expect(status.locator(".qizhi-time-picker--error")).toHaveCount(2);
  await expect(status.locator(".qizhi-time-picker--warning")).toHaveCount(2);

  const controlled = section.locator("#时间选择器-受控组件");
  const controlledInput = controlled.getByRole("combobox", { name: "选择时间" });
  await controlledInput.click();
  await page.getByRole("dialog", { name: "选择时间" })
    .getByRole("listbox", { name: "时" }).getByRole("option", { name: "12" }).click();
  await expect(controlledInput).toHaveValue("12:00:00");
  await controlledInput.press("Escape");

  const size = section.locator("#时间选择器-不同尺寸");
  await size.getByText("mini", { exact: true }).click();
  await expect(size.locator(".qizhi-time-picker")).toHaveCSS("height", "24px");
  await size.getByText("large", { exact: true }).click();
  await expect(size.locator(".qizhi-time-picker")).toHaveCSS("height", "36px");

  const disabled = section.locator("#时间选择器-禁用");
  await expect(disabled.getByRole("combobox")).toHaveCount(3);
  await expect(disabled.getByRole("combobox").nth(0)).toBeDisabled();
  await expect(disabled.getByRole("combobox").nth(1)).toHaveValue("08:30:00");

  const format = section.locator("#时间选择器-定制时分");
  const formatInput = format.getByRole("combobox", { name: "选择时间" });
  await expect(formatInput).toHaveValue("09:24");
  await formatInput.click();
  await expect(page.getByRole("dialog", { name: "选择时间" }).getByRole("listbox"))
    .toHaveCount(2);
  await expect(format.locator(".qizhi-time-picker")).toHaveCSS("width", "130px");
  await format.screenshot({ path: testInfo.outputPath("time-picker-format-open.png") });
  await formatInput.press("Escape");

  const step = section.locator("#时间选择器-定制步长");
  const stepInput = step.getByRole("combobox", { name: "选择时间" });
  await expect(stepInput).toHaveValue("10:25:30");
  await stepInput.click();
  const stepPopup = page.getByRole("dialog", { name: "选择时间" });
  await expect(stepPopup.getByRole("listbox", { name: "时" }).getByRole("option"))
    .toHaveCount(12);
  await expect(stepPopup.getByRole("listbox", { name: "分" }).getByRole("option"))
    .toHaveCount(12);
  await expect(stepPopup.getByRole("listbox", { name: "秒" }).getByRole("option"))
    .toHaveCount(6);
  await step.screenshot({ path: testInfo.outputPath("time-picker-step-open.png") });
  await stepInput.press("Escape");

  await section.getByRole("button", { name: "查看代码" }).first().click();
  const displayedCode = section.locator("#time-picker-code-时间选择器-基础用法");
  await expect(displayedCode).toContainText("<TimePicker");
  await section.getByRole("button", { name: "复制代码" }).first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await displayedCode.locator("pre").innerText());
  await expect(section.getByRole("button", { name: "复制样式" })).toHaveCount(0);
  await expect(section.locator(".component-example-actions .qizhi-code-action")).toHaveCount(16);

  for (const article of await section.locator("article.codebox-wrapper").all()) {
    await expect.poll(() => article.evaluate((element) =>
      element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.goto("/#component-config-provider");
  const legacyRange = page.locator("[data-config-time-range]");
  await expect(legacyRange.getByRole("combobox")).toHaveCount(2);
  await legacyRange.getByRole("combobox").first().click();
  await expect(legacyRange.getByRole("dialog", { name: "选择时间" })).toBeVisible();
  expect(errors).toEqual([]);
});
