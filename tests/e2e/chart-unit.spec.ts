import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
test("十二个图表的单位跟随标题且无绘图区单位列", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  const charts = page.locator("#component-chart .qizhi-chart");
  await expect(charts).toHaveCount(12);
  await expect(charts.getByRole("button", { name: /^(查看数据|收起数据)$/ })).toHaveCount(0);
  await expect(page.locator('#component-chart [data-ready="true"]')).toHaveCount(9, { timeout: 30000 });
  await expect(charts.locator(".qizhi-chart__plot .qizhi-chart__unit")).toHaveCount(0);
  await expect(charts.locator(".qizhi-chart__title > .qizhi-chart__unit")).toHaveCount(12);
  for (const chart of await charts.all()) {
    const unit = chart.locator(".qizhi-chart__title > .qizhi-chart__unit");
    await expect(unit).toHaveText(/^（.+）$/);
    expect(await chart.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const edges = await chart.evaluate(el => {
      const title = el.querySelector(".qizhi-chart__title")!.getBoundingClientRect().left;
      return [...el.querySelectorAll(".qizhi-chart__plot, .qizhi-chart__legend")].map(node => node.getBoundingClientRect().left - title);
    });
    for (const offset of edges) expect(offset).toBeCloseTo(0, 1);
  }
  mkdirSync("/tmp/qizhi-chart-unit", { recursive: true });
  for (const index of [0, 2, 3, 4, 5]) await charts.nth(index).screenshot({ path: `/tmp/qizhi-chart-unit/${testInfo.project.name}-${index}.png` });
});
