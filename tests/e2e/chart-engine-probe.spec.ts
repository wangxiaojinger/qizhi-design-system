import { test, expect } from "@playwright/test";
test("首选五种引擎形态与负值堆叠验证", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => { errors.push(error.message); console.log("引擎错误", error.message); });
  await page.goto("/tests/fixtures/chart-engine/index.html");
  await expect(page.locator('[data-ready="true"]')).toHaveCount(5);
  for (const mode of ["line", "multi", "normal", "grouped", "stacked"]) {
    const element = page.locator(`[data-mode="${mode}"]`);
    expect(Number(await element.getAttribute("data-shapes"))).toBeGreaterThan(0);
  }
  expect(JSON.parse((await page.locator('[data-mode="stacked"]').getAttribute("data-domain"))!)).toEqual([-5, 6]);
  expect(errors).toEqual([]);
});

test("正式适配器的几何、缺失分段、颜色和销毁性能", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto("/tests/fixtures/chart-engine/adapter.html");
  await expect(page.locator('#probe[data-ready="true"]')).toHaveCount(1, { timeout: 45000 });
  const readShapes = async (mode: string) => JSON.parse((await page.locator(`[data-mode="${mode}"]`).getAttribute("data-shapes"))!) as { x: number; y: number; width: number; height: number }[];
  const normal = await readShapes("normal"), grouped = await readShapes("grouped"), stacked = await readShapes("stacked"), gap = await readShapes("line-gap");
  expect(normal).toHaveLength(4); expect(grouped).toHaveLength(8); expect(stacked).toHaveLength(8);
  expect(new Set(stacked.map(shape => shape.x.toFixed(2))).size).toBe(4);
  expect(new Set(grouped.map(shape => shape.x.toFixed(2))).size).toBe(8);
  expect(gap).toHaveLength(5); // 两段折线（含单点段）和三个非缺失点。
  expect(JSON.parse((await page.locator('[data-mode="stacked"]').getAttribute("data-colors"))!)).toEqual(["rgb(51, 102, 255)", "rgb(0, 224, 150)"]);
  const performance = JSON.parse((await page.locator("#probe").getAttribute("data-performance"))!);
  expect(performance.map((item: { canvasesAfterDestroy: number }) => item.canvasesAfterDestroy)).toEqual([0, 0, 0]);
  await testInfo.attach("图表性能与几何", { body: JSON.stringify({ performance, normal, grouped, stacked, gap }, null, 2), contentType: "application/json" });
  console.log("图表性能", JSON.stringify(performance)); expect(errors).toEqual([]);
});
