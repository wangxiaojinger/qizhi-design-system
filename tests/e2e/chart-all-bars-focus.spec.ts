import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("文档原有四个柱状图支持真实鼠标选择和再次取消", async ({page}, info) => {
  test.setTimeout(60000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  const charts = page.locator('#component-chart .qizhi-chart[data-kind="bar"]');
  await expect(charts).toHaveCount(4);
  mkdirSync("/tmp/qizhi-all-bars", { recursive: true });
  for (let i = 0; i < 4; i++) {
    const chart = charts.nth(i), plot = chart.locator(".qizhi-chart__plot");
    await expect(plot).toHaveAttribute("data-ready", "true", { timeout: 30000 });
    await expect(plot).toHaveAttribute("role", "listbox");
    const count = await chart.locator("tbody tr").count();
    const grouped = await chart.getAttribute("data-mode") === "grouped";
    const width = await plot.evaluate(el => Math.floor(el.getBoundingClientRect().width));
    // 与当前分类带宽一致，点击第一分类第一系列柱形的实体下部。
    const x = 44.5 + (grouped ? 0.675 : 0.85) / (count + 0.7) * (width - 45);
    await plot.click({ position: { x, y: 230 } });
    await expect(chart.locator('[role="option"][aria-selected="true"]')).toHaveCount(1);
    await page.mouse.move(0, 0); await page.waitForTimeout(220);
    if (i < 4) await chart.screenshot({ path: `/tmp/qizhi-all-bars/${info.project.name}-${i}.png` });
    await plot.click({ position: { x, y: 230 } });
    await expect(chart.locator('[role="option"][aria-selected="true"]')).toHaveCount(0);
    expect(await chart.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});
