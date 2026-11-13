import { expect, test } from "@playwright/test";

test("外部更新丢弃时间草稿并将面板中的焦点还给触发器", async ({ page }) => {
  await page.goto("/tests/fixtures/time-range-picker/controlled.html");
  const trigger = page.getByRole("combobox", { name: "开始时间", exact: true });
  const dialog = page.getByRole("dialog", { name: "选择日期时间范围" });
  const start = trigger;
  await trigger.press("Enter");
  await expect(start).toBeFocused();
  await start.fill("2026-01-01T05:00");

  await page.evaluate(() => window.dispatchEvent(new Event("fixture:update-range")));

  await expect(trigger).toHaveValue("2026-01-02 00:00:00");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(start).toHaveValue("2026-01-02 00:00:00");
});

test("外部更新时间范围时保留面板外的焦点", async ({ page }) => {
  await page.goto("/tests/fixtures/time-range-picker/controlled.html");
  const trigger = page.getByRole("combobox", { name: "开始时间", exact: true });
  const dialog = page.getByRole("dialog", { name: "选择日期时间范围" });
  const next = page.getByRole("button", { name: "下一控件" });
  await trigger.press("Enter");
  await expect(dialog).toBeVisible();
  await next.focus();

  await page.evaluate(() => window.dispatchEvent(new Event("fixture:update-range")));

  await expect(trigger).toHaveValue("2026-01-02 00:00:00");
  await expect(dialog).toBeHidden();
  await expect(next).toBeFocused();
});

test("直接使用一个启智范围面板选择日期和时间", async ({ page }) => {
  await page.goto("/tests/fixtures/time-range-picker/controlled.html");
  const end = page.getByRole("combobox", { name: "结束时间（不含）" });
  await end.click();
  const calendar = page.getByRole("dialog", { name: "选择日期时间范围" });
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await calendar.getByRole("button", { name: "2026年1月3日" }).click();
  await calendar.getByRole("listbox", { name: "时", exact: true }).getByRole("option", { name: "12", exact: true }).click();
  await expect(end).toHaveValue("2026-01-03 12:00:00");
  await calendar.getByRole("button", { name: "确认" }).click();
  await expect(calendar).toBeHidden();
  await expect(end).toHaveValue("2026-01-03 12:00:00");
  await expect(end).toBeFocused();
});
