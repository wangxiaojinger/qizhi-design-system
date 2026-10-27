import { expect, test } from "@playwright/test";

test("列设置：宽度由最长列名自然撑开，短名称不预留固定空白", async ({ page }) => {
  await page.goto("/tests/e2e/fixtures/table-customization.html");
  const trigger = page.locator("#main").getByRole("button", { name: "列设置", exact: true });
  const popup = page.getByRole("dialog", { name: "列设置", exact: true });
  await trigger.click();
  const width = () => popup.evaluate((node) => node.getBoundingClientRect().width);
  const short = await width();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "切换列名" }).click();
  await trigger.click();
  await expect(popup.getByRole("checkbox", { name: "模型调用统计与工作空间名称" })).toBeVisible();
  await expect.poll(width).toBeGreaterThan(short + 40);
  const long = await width();
  expect(long).toBeLessThanOrEqual(page.viewportSize()!.width - 16);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "切换列名" }).click();
  await trigger.click();
  await expect.poll(width).toBeCloseTo(short, 0);
});

test("列设置：仅显隐、名称单行且无横向滚动", async ({ page }, testInfo) => {
  await page.goto("/#component-table");
  const demo = page.locator("#table-props");
  await demo.getByRole("button", { name: "列设置", exact: true }).click();
  const popup = page.getByRole("dialog", { name: "列设置", exact: true });
  await expect(popup).toBeVisible();
  await expect(popup.getByRole("spinbutton")).toHaveCount(0);
  await expect(popup.getByRole("button", { name: /前移|后移|恢复默认/ })).toHaveCount(0);
  const check = () => popup.evaluate((root) => {
    const list = root.querySelector(".qizhi-table__column-settings__list")!;
    const rows = [...list.querySelectorAll(".qizhi-table__column-settings__row")];
    return {
      overflow: list.scrollWidth - list.clientWidth,
      rows: rows.map((row) => {
        const label = row.querySelector(".qizhi-checkbox-text")!;
        const box = label.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(label);
        const text = range.getBoundingClientRect();
        const rowBox = row.getBoundingClientRect();
        const controls = [...row.querySelectorAll("button,input")];
        return {
          nowrap: getComputedStyle(label).whiteSpace,
          fits: text.width <= box.width + 1 && text.right <= rowBox.right + 1,
          controlsFit: controls.every((control) => {
            const rect = control.getBoundingClientRect();
            return rect.left >= rowBox.left - 1 && rect.right <= rowBox.right + 1;
          }),
        };
      }),
    };
  });
  await expect.poll(async () => (await check()).overflow).toBeLessThanOrEqual(1);
  const result = await check();
  expect(result.rows.every((row) => row.nowrap === "nowrap" && row.fits && row.controlsFit))
    .toBe(true);
  await popup.locator(".qizhi-table__column-settings__row").last().scrollIntoViewIfNeeded();
  expect((await check()).overflow).toBeLessThanOrEqual(1);
  await popup.screenshot({ path: testInfo.outputPath("column-settings.png") });
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
});
