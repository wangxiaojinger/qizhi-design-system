import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("原有折线图全部支持鼠标聚焦，状态恢复后同样生效", async ({ page }, info) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/#component-chart");
  const doc = page.locator("#component-chart");
  await expect(doc.locator(".codebox-wrapper")).toHaveCount(12);
  for (const id of ["图表-加载中", "图表-错误状态"]) await page.locator(`[id="${id}"]`).getByRole("switch").click();
  const charts = doc.locator('.qizhi-chart[data-kind="line"]');
  await expect(charts).toHaveCount(8);
  mkdirSync("/tmp/qizhi-existing-lines", { recursive: true });
  let tested = 0;
  for (let i = 0; i < 8; i++) {
    const chart = charts.nth(i);
    if (await chart.locator("tbody tr").count() === 0) continue;
    const plot = chart.locator(".qizhi-chart__plot");
    await expect(plot).toHaveAttribute("data-ready", "true", { timeout: 30000 });
    await expect(plot).toHaveAttribute("role", "listbox");
    const selected = chart.locator('[role="option"][aria-selected="true"]');
    // 在首个分类点的纵向范围使用真实鼠标命中；不依赖内部引擎对象。
    let hit = -1;
    for (let y = 25; y <= 240; y += 4) {
      await plot.click({ position: { x: 44, y } });
      if (await selected.count()) { hit = y; break; }
    }
    expect(hit).toBeGreaterThan(0);
    await page.mouse.move(0, 0); await page.waitForTimeout(220);
    await expect(selected).toHaveCount(1);
    if (i === 0) await chart.screenshot({ path: `/tmp/qizhi-existing-lines/${info.project.name}.png` });
    await plot.click({ position: { x: 44, y: hit } });
    await expect(selected).toHaveCount(0);
    await plot.press("Home"); await plot.press("Space");
    await expect(selected).toHaveCount(1);
    await plot.click({ position: { x: 60, y: 26 } });
    await expect(selected).toHaveCount(0);
    expect(await chart.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    tested++;
  }
  expect(tested).toBe(7);
  expect(errors).toEqual([]);
});
