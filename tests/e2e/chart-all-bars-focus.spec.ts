import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("文档原有四个柱状图支持真实鼠标选择和再次取消", async ({page}, info) => {
  test.setTimeout(60000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  const charts = page.locator('#component-chart .codebox-wrapper .qizhi-chart[data-kind="bar"]');
  await expect(charts).toHaveCount(4);
  mkdirSync("/tmp/qizhi-all-bars", { recursive: true });
  for (let i = 0; i < 4; i++) {
    const chart = charts.nth(i), plot = chart.locator(".qizhi-chart__plot");
    await expect(plot).toHaveAttribute("data-ready", "true", { timeout: 30000 });
    await expect(plot).toHaveAttribute("role", "listbox");
    const x = await plot.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext("2d")!;
      const scale = canvas.width / canvas.getBoundingClientRect().width;
      const pixels = context.getImageData(0, Math.floor(230 * scale), canvas.width, 1).data;
      // Find the first colored bar at the click height on the rendered canvas.
      for (let i = 0; i < pixels.length; i += 4) {
        const [red, green, blue, alpha] = pixels.subarray(i, i + 4);
        if (alpha > 200 && Math.max(red, green, blue) - Math.min(red, green, blue) > 70) return i / 4 / scale + 1;
      }
      throw new Error("未找到可点击的柱形");
    });
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
