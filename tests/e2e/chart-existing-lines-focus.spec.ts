import { expect, test } from "@playwright/test";

test("原有折线图全部支持鼠标聚焦，状态恢复后同样生效", async ({ page }, info) => {
  test.setTimeout(90000);
  await page.route(/\/chartEngine\.ts(?:\?|$)/, async route => {
    const response = await route.fetch();
    const source = await response.text();
    const marker = "const click = (event) => {";
    if (!source.includes(marker)) throw new Error("Chart focus probe could not instrument the renderer");
    const body = source.replace(marker, `
      const firstPoint = records.find(record => !record.line);
      const element = host.querySelector("canvas");
      if (input.focusable && firstPoint && element) {
        const bounds = firstPoint.element.getBBox();
        element.dataset.focusProbePoint = JSON.stringify({
          x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2,
        });
      }
      ${marker}`);
    await route.fulfill({ response, body });
  });
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/#component-chart");
  const doc = page.locator("#component-chart");
  await expect(doc.locator(".codebox-wrapper")).toHaveCount(12);
  for (const id of ["图表-加载中", "图表-错误状态"]) await page.locator(`[id="${id}"]`).getByRole("switch").click();
  const charts = doc.locator('.qizhi-chart[data-kind="line"]');
  await expect(charts).toHaveCount(8);
  let tested = 0;
  for (let i = 0; i < 8; i++) {
    const chart = charts.nth(i);
    if (await chart.locator("tbody tr").count() === 0) continue;
    const plot = chart.locator(".qizhi-chart__plot");
    await expect(plot).toHaveAttribute("data-ready", "true", { timeout: 30000 });
    await expect(plot).toHaveAttribute("role", "listbox");
    const selected = chart.locator('[role="option"][aria-selected="true"]');
    const canvas = plot.locator("canvas[data-focus-probe-point]");
    await expect(canvas).toHaveCount(1);
    const point = JSON.parse((await canvas.getAttribute("data-focus-probe-point"))!);
    await plot.scrollIntoViewIfNeeded();
    const clickPoint = async () => {
      const box = await canvas.boundingBox();
      if (!box) throw new Error("缺少折线图画布");
      await page.mouse.click(box.x + point.x, box.y + point.y);
    };
    await clickPoint();
    await expect(selected).toHaveCount(1);
    await page.mouse.move(0, 0);
    await expect(selected).toHaveCount(1);
    if (i === 0) await chart.screenshot({ path: info.outputPath("focused-line.png") });
    await clickPoint();
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
