import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const day = (date: number) => Date.UTC(2026, 0, date);
const parseTime = (time: string) => Date.parse(time.replace(" ", "T") + "Z");

async function startBrush(page: Page, plot: Locator) {
  const box = await plot.boundingBox();
  if (!box) throw new Error("缺少绘图区");
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * 0.43, y);
  await page.mouse.down();
  await page.mouse.move(Math.min(box.x + box.width * 0.75, page.viewportSize()!.width - 2), y, { steps: 8 });
  await expect(plot.locator(".qizhi-chart__range-selection-label")).toBeVisible();
}

async function openPlot(page: Page, kind: string) {
  await page.goto(`/tests/fixtures/chart-engine/controlled.html?kind=${kind}`);
  const plot = page.getByRole("group", { name: "受控图表绘图区" });
  await expect(plot).toHaveAttribute("data-ready", "true");
  return plot;
}

for (const kind of ["bar", "line"]) {
  test(`${kind} 拖选期间时间域变化会取消旧手势`, async ({ page }) => {
    const plot = await openPlot(page, kind);
    const submission = page.getByLabel("提交结果");
    await startBrush(page, plot);
    const preview = plot.locator(".qizhi-chart__range-selection-label");
    const before = (await preview.innerText()).split(" ～ ");
    expect(parseTime(before[1])).toBeGreaterThan(day(2));
    await page.evaluate(() => window.dispatchEvent(new Event("qizhi-test-shift-domain")));
    await expect(page.getByLabel("当前结束时间")).toHaveText(String(day(2)));
    await page.mouse.up();
    await expect(submission).toHaveText("");
    await expect(preview).toBeHidden();

    await expect(plot).toHaveAttribute("data-ready", "true");
    await startBrush(page, plot);
    await page.mouse.up();
    const range = JSON.parse(await submission.innerText()).range;
    expect(range.end).toBeLessThanOrEqual(day(2));
    expect(range.end).toBeGreaterThan(range.start);
  });

  test(`${kind} 同一时间域重新渲染会用最新筛选回调提交`, async ({ page }) => {
    const plot = await openPlot(page, kind);
    await startBrush(page, plot);
    const preview = plot.locator(".qizhi-chart__range-selection-label");
    const [start, end] = (await preview.innerText()).split(" ～ ").map(parseTime);
    await page.evaluate(() => window.dispatchEvent(new Event("qizhi-test-change-scope")));
    await expect(page.getByLabel("当前筛选")).toHaveText("新筛选");
    await expect(preview).toBeVisible();
    await page.mouse.up();
    await expect(page.getByLabel("提交结果")).toHaveText(JSON.stringify({ scope: "新筛选", range: { start, end } }));
  });

  test(`${kind} 时间域改变后键盘提示跟随数据点`, async ({ page }) => {
    const plot = await openPlot(page, kind);
    const canvas = plot.locator("canvas");
    const tip = page.getByRole("tooltip");
    await plot.press("Home");
    await expect(tip).toBeVisible();
    const originalTip = await tip.boundingBox();

    await page.evaluate(() => window.dispatchEvent(new Event("qizhi-test-shift-domain")));
    await expect(page.getByLabel("当前结束时间")).toHaveText(String(day(2)));
    await expect(plot).toHaveAttribute("data-ready", "true");
    await expect(plot).toBeFocused();
    await expect.poll(async () => {
      const box = await canvas.boundingBox();
      const tooltip = await tip.boundingBox();
      if (!box || !tooltip) return Infinity;
      const anchor = box.x + 44 + (box.width - 45) / 2;
      const expected = anchor + 12 + tooltip.width <= page.viewportSize()!.width - 8
        ? anchor + 12 : Math.max(8, anchor - 12 - tooltip.width);
      return Math.abs(tooltip.x - expected);
    }).toBeLessThan(2);
    expect((await tip.boundingBox())?.x).not.toBe(originalTip?.x);
  });
}
