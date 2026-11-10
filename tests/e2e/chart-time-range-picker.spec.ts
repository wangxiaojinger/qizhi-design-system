import { expect, test } from "@playwright/test";

test("外部更新丢弃时间草稿并将面板中的焦点还给触发器", async ({ page }) => {
  await page.goto("/tests/fixtures/time-range-picker/controlled.html");
  const trigger = page.getByRole("button", { name: /^时间范围/ });
  const dialog = page.getByRole("dialog", { name: "选择时间范围" });
  const start = dialog.getByLabel("开始时间");
  await trigger.press("Enter");
  await trigger.press("Tab");
  await expect(start).toBeFocused();
  await start.fill("2026-01-01T05:00");

  await page.evaluate(() => window.dispatchEvent(new Event("fixture:update-range")));

  await expect(trigger).toContainText("2026-01-02");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(start).toHaveValue("2026-01-02T00:00");
});

test("外部更新时间范围时保留面板外的焦点", async ({ page }) => {
  await page.goto("/tests/fixtures/time-range-picker/controlled.html");
  const trigger = page.getByRole("button", { name: /^时间范围/ });
  const dialog = page.getByRole("dialog", { name: "选择时间范围" });
  const next = page.getByRole("button", { name: "下一控件" });
  await trigger.press("Enter");
  await expect(dialog).toBeVisible();
  await next.focus();

  await page.evaluate(() => window.dispatchEvent(new Event("fixture:update-range")));

  await expect(trigger).toContainText("2026-01-02");
  await expect(dialog).toBeHidden();
  await expect(next).toBeFocused();
});
