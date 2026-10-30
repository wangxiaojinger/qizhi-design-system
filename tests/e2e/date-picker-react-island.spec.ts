import { expect, test } from "@playwright/test";

test("日期时间范围保留独立时间并应用起止限制", async ({ page }, testInfo) => {
  await page.clock.setFixedTime(new Date(2026, 9, 12, 12));
  await page.goto("/#component-date-picker");
  const demo = page.locator('[id="日期选择器-不可选取的时间"]');
  const picker = demo.locator(".qizhi-date-picker--range.qizhi-date-picker--time");
  const start = picker.locator("[data-date-picker-start]");
  const end = picker.locator("[data-date-picker-end]");
  await start.click();
  const popup = page.getByRole("dialog", { name: "选择日期时间范围" });
  const days = popup.locator(".qizhi-date-picker__days button");
  await expect(days.nth(10)).toBeDisabled();
  await expect(days.nth(10)).toHaveCSS("color", "rgb(201, 205, 212)");
  await days.nth(12).click();
  await end.click();
  await days.nth(16).click();
  await start.click();
  const hours = popup.getByRole("listbox", { name: "时" });
  await expect(hours.getByRole("option", { name: "00" })).toHaveCount(0);
  await hours.getByRole("option", { name: "09" }).click();
  await end.click();
  await expect(hours.getByRole("option", { name: "09" })).toHaveCount(0);
  await hours.getByRole("option", { name: "03" }).click();
  await popup.getByRole("button", { name: "确认" }).click();
  await expect(start).toHaveValue(/13 09:00:00$/);
  await expect(end).toHaveValue(/17 03:00:00$/);
  await start.click();
  await expect(hours.getByRole("option", { name: "09" })).toHaveAttribute("aria-selected", "true");
  if ((page.viewportSize()?.width ?? 0) > 640) {
    const geometry = await popup.evaluate((node) => {
      const rect = (selector: string) => node.querySelector(selector)!.getBoundingClientRect();
      const textCenter = (selector: string) => { const range = document.createRange(); range.selectNodeContents(node.querySelector(selector)!); const box = range.getBoundingClientRect(); return box.y + box.height / 2; };
      const dateHeader = rect(".qizhi-date-picker__panel header");
      const timeHeader = rect(".qizhi-time-panel h3");
      const column = rect(".qizhi-time-panel__column");
      const footer = rect("footer");
      return { titleDelta: Math.abs(textCenter(".qizhi-date-picker__weekdays span") - textCenter(".qizhi-time-panel__column-title")), headerDelta: Math.abs(dateHeader.bottom - timeHeader.bottom), bottomDelta: Math.abs(column.bottom - footer.top) };
    });
    expect(geometry.headerDelta).toBeLessThanOrEqual(1);
    expect(geometry.titleDelta).toBeLessThanOrEqual(1);
    expect(geometry.bottomDelta).toBeLessThanOrEqual(1);
  }
  await popup.screenshot({ path: testInfo.outputPath("date-time-range.png") });
  await popup.getByRole("button", { name: "确认" }).click();
  await expect(start).toHaveValue(/13 09:00:00$/);
  await expect(end).toHaveValue(/17 03:00:00$/);
});
