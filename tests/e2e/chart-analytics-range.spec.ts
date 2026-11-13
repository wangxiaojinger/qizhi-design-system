import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

async function plotPosition(plot: Locator) {
  await expect(plot).toHaveAttribute("data-ready", "true");
  await plot.scrollIntoViewIfNeeded();
  return plot.evaluate(node => {
    const bounds = node.getBoundingClientRect();
    const viewport = node.closest(".qizhi-chart__scroll")!.getBoundingClientRect();
    const left = Math.max(bounds.left + 64, viewport.left, 0);
    const right = Math.min(bounds.right - 12, viewport.right, innerWidth);
    return { left, width: right - left, y: bounds.top + bounds.height / 2 };
  });
}

async function drag(page: Page, plot: Locator, fractions: number[], cancel = false) {
  const box = await plotPosition(plot);
  await page.mouse.move(box.left + box.width * fractions[0], box.y);
  await page.mouse.down();
  for (const fraction of fractions.slice(1)) {
    await page.mouse.move(box.left + box.width * fraction, box.y, { steps: 8 });
  }
  await expect(plot.locator(".qizhi-chart__range-selection")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const preview = await plot.locator(".qizhi-chart__range-selection-label").textContent();
  if (cancel) await page.keyboard.press("Escape");
  await page.mouse.up();
  return preview;
}

test("每张时间图直接在绘图区更新同一个页面范围", async ({ page }, testInfo) => {
  await page.goto("/#component-chart");
  const doc = page.locator("#component-chart");
  await expect(doc.locator(".codebox-wrapper")).toHaveCount(12);
  await expect(doc.locator(".qizhi-chart__range-track")).toHaveCount(0);
  await expect(doc.locator(".codebox-wrapper .qizhi-chart__plot--range-selectable")).toHaveCount(9);
  const controls = doc.getByRole("group", { name: "图表共同时间范围" });
  const trigger = controls.getByRole("combobox", { name: "开始时间", exact: true });
  const granularity = controls.getByRole("combobox", { name: "聚合粒度" });
  await trigger.click();
  const picker = page.getByRole("dialog", { name: "选择日期时间范围" });
  await expect(picker).toBeVisible();
  const panel = (await picker.boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(0);
  expect(panel.x + panel.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await picker.getByRole("button", { name: "近 24 小时" }).click();
  await expect(granularity).toHaveValue("自动（按小时）");
  await trigger.click();
  await controls.getByLabel("开始时间").fill("2026-09-01T00:00");
  await controls.getByLabel("结束时间（不含）").fill("2026-09-08T00:00");
  await picker.getByRole("button", { name: "确认" }).click();
  await expect(granularity).toHaveValue("自动（按天）");

  const line = doc.getByRole("region", { name: "请求量趋势图", exact: true });
  const bar = doc.getByRole("region", { name: "每日请求量柱状图", exact: true });
  const linePlot = line.locator(".qizhi-chart__plot--range-selectable");
  const barPlot = bar.locator(".qizhi-chart__plot--range-selectable");
  const chartRows = (chart: Locator) => chart.locator("tbody tr");
  const back = controls.getByRole("button", { name: "返回上一时间范围" });
  await expect(chartRows(line)).toHaveCount(7);
  await expect(chartRows(bar)).toHaveCount(7);

  const before = await trigger.inputValue();
  await drag(page, linePlot, [0.77, 0.96, 0.77, 0.07]);
  await expect(back).toBeVisible();
  await expect(trigger).not.toHaveValue(before);
  const lineCount = await chartRows(line).count();
  expect(lineCount).toBeGreaterThan(0);

  await expect(chartRows(bar)).toHaveCount(lineCount);
  await back.click();
  await expect(chartRows(bar)).toHaveCount(7);

  await drag(page, barPlot, [0.07, 0.8], true);
  await expect(back).toHaveCount(0);
  await expect(chartRows(line)).toHaveCount(7);
  await bar.screenshot({ path: testInfo.outputPath("chart-without-range-track.png") });
  await drag(page, barPlot, [0.07, 0.8]);
  await expect(back).toBeVisible();
  const barCount = await chartRows(bar).count();
  expect(barCount).toBeGreaterThan(0);

  await expect(chartRows(line)).toHaveCount(barCount);
});

test("触屏横向拖选柱状图绘图区也联动折线图", async ({ page, context }) => {
  test.skip(page.viewportSize()!.width !== 375, "在手机视口验证触屏手势");
  await page.goto("/#component-chart");
  const doc = page.locator("#component-chart");
  const line = doc.getByRole("region", { name: "请求量趋势图", exact: true });
  const bar = doc.getByRole("region", { name: "每日请求量柱状图", exact: true });
  const plot = bar.locator('.qizhi-chart__plot--range-selectable[data-ready="true"]');
  const box = await plotPosition(plot);
  const client = await context.newCDPSession(page);
  const point = (ratio: number) => ({ x: box.left + box.width * ratio, y: box.y });
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(0.19)] });
  for (const ratio of [0.26, 0.36, 0.45, 0.55, 0.68, 0.77]) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(ratio)] });
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(doc.getByRole("button", { name: "返回上一时间范围" })).toBeVisible();
  const count = await bar.locator("tbody tr").count();
  expect(count).toBeGreaterThan(0);

  await expect(line.locator("tbody tr")).toHaveCount(count);
});

test("日图内拖选几小时，预览与实际查询范围一致", async ({ page }) => {
  test.skip(page.viewportSize()!.width !== 1440, "用完整日图轴验证小时级区间");
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    const labels = new WeakMap<HTMLCanvasElement, Map<number, string>>();
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      const canvas = this.canvas;
      if (canvas.closest('[aria-label="费用趋势图"]') && /^\d+\.\d+$/.test(text)) {
        const transform = this.getTransform();
        const verticalPosition = Math.round(transform.b * x + transform.d * y + transform.f);
        const ticks = labels.get(canvas) ?? new Map();
        ticks.set(verticalPosition, text);
        labels.set(canvas, ticks);
        canvas.dataset.testAxisLabels = JSON.stringify([...ticks.values()]);
      }
      original.call(this, text, x, y, maxWidth);
    };
  });
  await page.clock.setFixedTime(Date.UTC(2026, 8, 10, 16));
  await page.goto("/#component-chart");
  const doc = page.locator("#component-chart");
  const controls = doc.getByRole("group", { name: "图表共同时间范围" });
  const trigger = controls.getByRole("combobox", { name: "开始时间", exact: true });
  const line = doc.getByRole("region", { name: "请求量趋势图", exact: true });
  const bar = doc.getByRole("region", { name: "每日请求量柱状图", exact: true });
  const plot = line.locator('.qizhi-chart__plot--range-selectable[data-ready="true"]');
  await plot.scrollIntoViewIfNeeded();
  const box = (await plot.boundingBox())!;
  // The initial shared range spans ten calendar days.
  const hourPosition = (h: number) => box.x + 44 + (box.width - 48) * h / (10 * 24);
  const y = box.y + 100;
  await page.mouse.move(hourPosition(5.25), y);
  await page.mouse.down();
  await page.mouse.move(hourPosition(10.25), y, { steps: 8 });
  const selection = plot.locator(".qizhi-chart__range-selection");
  await expect(selection).toHaveCSS("border-left-style", "dashed");
  await expect(selection).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(plot.locator(".qizhi-chart__range-guide")).toHaveCSS("border-top-style", "dashed");
  const label = plot.locator(".qizhi-chart__range-selection-label");
  await expect(label).toHaveText(/^2026-09-01 \d{2}:00:00 ～ 2026-09-01 \d{2}:00:00$/);
  const [start, end] = (await label.textContent())!.split(" ～ ").map(value => value.slice(11, 16));
  const hours = Number(end.slice(0, 2)) - Number(start.slice(0, 2));
  expect(hours).toBeGreaterThan(0);
  expect(hours).toBeLessThan(24);
  await page.mouse.up();
  await expect(controls.getByRole("combobox", { name: "聚合粒度" })).toHaveValue("自动（按小时）");
  await expect(trigger).toHaveValue(`2026-09-01 ${start}:00`);
  await expect(controls.getByLabel("结束时间（不含）")).toHaveValue(`2026-09-01 ${end}:00`);
  await expect(line.locator("tbody tr")).toHaveCount(hours);
  await expect(bar.locator("tbody tr")).toHaveCount(hours);
  await plot.press("Home");
  await expect(page.getByRole("tooltip").locator("strong")).toHaveText(`9月1日 ${start}`);

  const costPlot = doc.getByRole("region", { name: "费用趋势图", exact: true }).locator('.qizhi-chart__plot[data-ready="true"]');
  await costPlot.press("Home");
  const costTooltip = page.getByRole("tooltip");
  await expect(costTooltip.locator("strong")).toHaveText(`9月1日 ${start}`);
  await expect(costTooltip).toContainText(/\d+\.\d{2,3} 元/);
  const costCanvas = costPlot.locator("canvas");
  await expect(costCanvas).toHaveAttribute("data-test-axis-labels", /0\.005/);
  const costTicks: string[] = JSON.parse((await costCanvas.getAttribute("data-test-axis-labels"))!);
  expect(costTicks.length).toBeGreaterThan(3);
  expect(new Set(costTicks).size).toBe(costTicks.length);
});

test("自动模式长选区按日查询并提示边界调整", async ({ page }) => {
  test.skip(page.viewportSize()!.width !== 1440, "使用完整时间轴验证超过 10 天的选区");
  await page.clock.setFixedTime(Date.UTC(2026, 8, 11));
  await page.goto("/#component-chart");
  const doc = page.locator("#component-chart");
  const controls = doc.getByRole("group", { name: "图表共同时间范围" });
  const trigger = controls.getByRole("combobox", { name: "开始时间", exact: true });
  await trigger.click();
  await page.getByRole("dialog", { name: "选择日期时间范围" }).getByRole("button", { name: "近 30 天" }).click();
  await expect(trigger).toHaveValue("2026-08-12 00:00:00");

  const plot = doc.getByRole("region", { name: "请求量趋势图", exact: true }).locator(".qizhi-chart__plot--range-selectable");
  const preview = await drag(page, plot, [0.45, 0.98]);
  await expect(controls.getByRole("combobox", { name: "聚合粒度" })).toHaveValue("自动（按天）");
  await expect(trigger).not.toHaveValue("2026-08-12 00:00:00");
  const times = [await trigger.inputValue(), await controls.getByLabel("结束时间（不含）").inputValue()];
  expect(times).toHaveLength(2);
  expect(preview).toBe(times.join(" ～ "));
  expect(times.every(time => time.endsWith("00:00:00"))).toBe(true);
  expect(Date.parse(times[1].replace(" ", "T") + "Z") - Date.parse(times[0].replace(" ", "T") + "Z")).toBeGreaterThan(10 * 86_400_000);
  await expect(doc.getByText("已按自然日对齐选区，使用按天粒度查询。")).toBeVisible();
  await controls.getByRole("button", { name: "返回上一时间范围" }).click();
  await expect(trigger).toHaveValue("2026-08-12 00:00:00");
});

test("响应式柱状图框选后也联动共同范围，并可返回上一范围", async ({ page }) => {
  await page.clock.setFixedTime(Date.UTC(2026, 10, 13, 2));
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  const chart = page.getByRole("region", { name: "可响应和键盘操作的输入输出用量堆叠柱状图" });
  const rows = chart.locator("tbody tr");
  const controls = page.getByRole("group", { name: "图表共同时间范围" });
  const field = controls.getByRole("combobox", { name: "开始时间", exact: true });
  const initial = await field.inputValue();
  await expect(rows).toHaveCount(11);
  await drag(page, chart.locator(".qizhi-chart__plot--range-selectable"), [0.28, 0.68]);
  await expect(field).not.toHaveValue(initial);
  await controls.getByRole("combobox", { name: "聚合粒度" }).click();
  await page.getByRole("option", { name: "按天", exact: true }).click();
  await controls.getByRole("button", { name: "返回上一时间范围" }).click();
  await expect(field).toHaveValue(initial);
  await expect(rows).toHaveCount(11);
});

for (const name of ["请求量趋势图", "每日请求量柱状图"]) {
  test(`${name}拖到右端包含末桶，已确认无记录的小时补零`, async ({ page }) => {
    test.skip(page.viewportSize()!.width !== 1440, "使用完整绘图区验证右端边界");
    await page.goto("/#component-chart");
    const trigger = page.getByRole("group", { name: "图表共同时间范围" }).getByRole("combobox", { name: "开始时间", exact: true });
    await trigger.click();
    const controls = page.getByRole("group", { name: "图表共同时间范围" });
    await controls.getByLabel("开始时间").fill("2026-09-04T00:00");
    await controls.getByLabel("结束时间（不含）").fill("2026-09-11T00:00");
    await page.getByRole("dialog").getByRole("button", { name: "确认" }).click();
    const chart = page.getByRole("region", { name, exact: true });
    const rows = chart.locator("tbody tr");
    await expect(rows.last()).toContainText("2026-09-10T00:00:00");
    const plot = chart.locator('.qizhi-chart__plot[data-ready="true"]');
    await plot.scrollIntoViewIfNeeded();
    const box = (await plot.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.83, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 1, box.y + 100, { steps: 8 });
    await expect(plot.locator(".qizhi-chart__range-selection-label")).toHaveText(/～ 2026-09-11 00:00:00$/);
    await page.mouse.up();
    await expect(page.getByLabel("结束时间（不含）")).toHaveValue("2026-09-11 00:00:00");
    await expect(rows.last()).toContainText("2026-09-10T23:00:00");
    const bar = page.getByRole("region", { name: "每日请求量柱状图", exact: true });
    await expect(bar.locator("tbody tr").last().locator("td").last()).toHaveText("0 次");
  });
}
