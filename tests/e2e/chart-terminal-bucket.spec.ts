import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const day = (date: number) => Date.UTC(2026, 0, date);
const timeText = (time: number) => new Date(time).toISOString().slice(0, 19).replace("T", " ");

async function plotGeometry(plot: Locator, scrollRatio: number) {
  const visibleLeft = await plot.evaluate((node, ratio) => {
    const scroll = node.closest(".qizhi-chart__scroll")!;
    scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) * ratio;
    return scroll.getBoundingClientRect().left;
  }, scrollRatio);
  const box = await plot.boundingBox();
  if (!box) throw new Error("缺少图表绘图区");
  return { box, y: box.y + 100, visibleLeft };
}

async function openPlot(page: Page, query: string, scrollRatio = 1) {
  await page.goto(`/tests/fixtures/chart-engine/terminal-bucket.html?${query}`);
  const plot = page.getByRole("group", { name: "末桶探针绘图区" });
  await expect(plot).toHaveAttribute("data-ready", "true");
  await plot.scrollIntoViewIfNeeded();
  return { plot, ...await plotGeometry(plot, scrollRatio) };
}

const parseTime = (time: string) => Date.parse(time.replace(" ", "T") + "Z");

function expectContinuousTime(ends: readonly string[]) {
  for (let index = 1; index < ends.length; index++) {
    const interval = parseTime(ends[index]) - parseTime(ends[index - 1]);
    expect(interval, "结束时间不应回跳").toBeGreaterThanOrEqual(0);
    expect(interval, "相邻样本的时间差不应超过两小时").toBeLessThanOrEqual(2 * 3_600_000);
  }
}

test("连续性检查能抓住回跳到已见过的时间", async ({ page }) => {
  await page.setContent('<output aria-label="拖选预览"></output>');
  const preview = page.getByLabel("拖选预览");
  const ends: string[] = [];
  for (const hour of ["01", "02", "01", "03"]) {
    await preview.evaluate((node, hour) => { node.textContent = `2026-01-03 ${hour}:00:00`; }, hour);
    ends.push(await preview.innerText());
  }
  const [first, second, repeated, last] = ends;
  expectContinuousTime([first, first, second, last]);
  expect(() => expectContinuousTime([first, last, "2026-01-03 06:00:00"])).toThrow(/不应超过两小时/);
  expect(() => expectContinuousTime([first, second, repeated, last])).toThrow(/不应回跳/);
});

test("显式末桶的折线图右端连续取值，正反拖选预览与查询一致", async ({ page }) => {
  await page.addInitScript(() => {
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      if (text === "01-03 00:00") {
        const transform = this.getTransform();
        this.canvas.dataset.lastSampleX = String((transform.a * x + transform.c * y + transform.e) / this.canvas.width);
      }
      return fillText.call(this, text, x, y, maxWidth);
    };
  });
  const { plot, box, y, visibleLeft } = await openPlot(page, "kind=line&explicit");
  const left = Math.max(box.x + box.width * 0.35, visibleLeft + 15);
  const preview = plot.locator(".qizhi-chart__range-selection-label");
  const canvas = plot.locator("canvas");
  await expect(canvas).toHaveAttribute("data-last-sample-x", /^(0\.[0-9]+)$/);
  const sampleX = Number(await canvas.getAttribute("data-last-sample-x"));
  expect(sampleX).toBeGreaterThan(0.6);
  expect(sampleX).toBeLessThan(0.75);
  await page.mouse.move(left, y);
  await page.mouse.down();
  const ends: string[] = [];
  for (let offset = 0.63; offset < 0.99; offset += 0.015) {
    await page.mouse.move(box.x + box.width * offset, y);
    ends.push((await preview.innerText()).split(" ～ ")[1]);
  }
  const interior = [...new Set(ends)].filter(end => /^2026-01-03 (0[1-9]|1\d|2[0-3]):/.test(end));
  expect(interior.length).toBeGreaterThan(5);

  const right = Math.min(box.x + box.width - 1, page.viewportSize()!.width - 1);
  await page.mouse.move(right - 6, y);
  const inside = await preview.innerText();
  await page.mouse.move(right, y);
  await expect(preview).toHaveText(/～ 2026-01-04 00:00:00$/);
  const forward = await preview.innerText();
  ends.push(inside.split(" ～ ")[1], forward.split(" ～ ")[1]);
  expectContinuousTime(ends);
  await page.mouse.up();
  const result = JSON.parse(await page.getByLabel("提交时间").innerText());
  expect(forward).toBe(`${timeText(result.start)} ～ ${timeText(result.end)}`);
  await expect(page.getByRole("list", { name: "查询结果" }).getByRole("listitem").last()).toHaveText("2026-01-03T00:00:00.000Z");

  // Start just inside the plot so the reverse gesture can capture the pointer.
  await page.mouse.move(right - 6, y);
  await page.mouse.down();
  await page.mouse.move(left, y, { steps: 8 });
  await expect(preview).toHaveText(inside);
  const reverse = await preview.innerText();
  await page.mouse.up();
  const reverseResult = JSON.parse(await page.getByLabel("提交时间").innerText());
  expect(reverse).toBe(`${timeText(reverseResult.start)} ～ ${timeText(reverseResult.end)}`);
});

for (const kind of ["line", "bar"]) {
  test(`${kind} 只传回调也能查到末桶`, async ({ page }) => {
    const { plot, box, y, visibleLeft } = await openPlot(page, `kind=${kind}`);
    await page.mouse.move(Math.max(box.x + box.width * 0.48, visibleLeft + 15), y);
    await page.mouse.down();
    await page.mouse.move(Math.min(box.x + box.width - 1, page.viewportSize()!.width - 1), y, { steps: 8 });
    await expect(plot.locator(".qizhi-chart__range-selection-label")).toHaveText(/～ 2026-01-04 00:00:00$/);
    await page.mouse.up();
    const result = JSON.parse(await page.getByLabel("提交时间").innerText());
    expect(result.end).toBe(day(4));
    await expect(page.getByRole("list", { name: "查询结果" }).getByRole("listitem").last()).toHaveText("2026-01-03T00:00:00.000Z");
  });
}

for (const kind of ["line", "bar"]) {
  for (const domain of ["inferred", "explicit"]) {
    test(`${kind} ${domain} 二次框选不越出首次时间范围`, async ({ page }) => {
      const query = `kind=${kind}&local${domain === "explicit" ? "&explicit" : ""}`;
      const { plot, box, y, visibleLeft } = await openPlot(page, query, 0.55);
      const preview = plot.locator(".qizhi-chart__range-selection-label");
      await page.mouse.move(Math.max(box.x + box.width * 0.27, visibleLeft + 12), y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.8, y, { steps: 8 });
      const [firstStart, firstEnd] = (await preview.innerText()).split(" ～ ").map(parseTime);
      expect(firstStart).toBeGreaterThan(day(1));
      expect(firstStart).toBeLessThanOrEqual(day(2));
      expect(firstEnd).toBeGreaterThan(day(3));
      expect(firstEnd).toBeLessThan(day(4));
      await page.mouse.up();
      await expect(preview).toBeHidden();
      await expect(plot).toHaveAttribute("data-ready", "true");

      const { box: zoomed, visibleLeft: zoomedLeft } = await plotGeometry(plot, 1);
      const right = Math.min(zoomed.x + zoomed.width - 1, page.viewportSize()!.width - 1);
      await page.mouse.move(Math.max(zoomed.x + zoomed.width * 0.52, zoomedLeft + 12), y);
      await page.mouse.down();
      await page.mouse.move(right, y, { steps: 8 });
      const [secondStart, secondEnd] = (await preview.innerText()).split(" ～ ").map(parseTime);
      expect(secondStart).toBeGreaterThanOrEqual(firstStart);
      expect(secondEnd).toBeLessThanOrEqual(firstEnd);
      expect(secondEnd).toBeGreaterThan(secondStart);
      await page.mouse.up();
      await expect(preview).toBeHidden();
    });
  }
}

for (const kind of ["line", "bar"]) {
  test(`${kind} 缩到单个时间戳后仍可继续框选`, async ({ page }) => {
    const { plot, box, y, visibleLeft } = await openPlot(page, `kind=${kind}&local`);
    const preview = plot.locator(".qizhi-chart__range-selection-label");
    const rows = page.locator("table[aria-label='末桶探针数据'] tbody tr");
    const reset = page.getByRole("button", { name: "重置时间范围" });
    await expect(rows).toHaveCount(3);

    await page.mouse.move(Math.max(box.x + box.width * 0.54, visibleLeft + 12), y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.91, y, { steps: 8 });
    const [firstStart, firstEnd] = (await preview.innerText()).split(" ～ ").map(parseTime);
    expect(firstStart).toBeGreaterThan(day(2));
    expect(firstStart).toBeLessThan(day(3));
    expect(firstEnd).toBeGreaterThan(day(3));
    await page.mouse.up();
    await expect(reset).toBeVisible();
    await expect(rows).toHaveCount(1);
    await expect(plot).toHaveAttribute("data-ready", "true");

    const { box: zoomed, visibleLeft: zoomedLeft } = await plotGeometry(plot, 1);
    const right = Math.min(zoomed.x + zoomed.width - 1, page.viewportSize()!.width - 1);
    await page.mouse.move(Math.max(zoomed.x + zoomed.width * 0.5, zoomedLeft + 12), y);
    await page.mouse.down();
    await page.mouse.move(right, y, { steps: 8 });
    await expect(preview, "单个时间戳缩放后应仍显示框选预览").toBeVisible({ timeout: 2000 });
    const [secondStart, secondEnd] = (await preview.innerText()).split(" ～ ").map(parseTime);
    expect(secondStart).toBeGreaterThan(firstStart);
    expect(secondEnd).toBeLessThanOrEqual(firstEnd);
    expect(secondEnd).toBeGreaterThan(secondStart);
    // On narrow screens the left boundary is off-screen while the plot is scrolled right.
    const { visibleLeft: leftEdge } = await plotGeometry(plot, 0);
    await page.mouse.move(Math.max(0, leftEdge + 1), y, { steps: 8 });
    const [reverseStart, reverseEnd] = (await preview.innerText()).split(" ～ ").map(parseTime);
    expect(reverseStart).toBe(firstStart);
    expect(reverseEnd).toBeLessThan(firstEnd);
    await plotGeometry(plot, 1);
    await page.mouse.move(right, y, { steps: 8 });
    await expect(preview).toHaveText(`${timeText(secondStart)} ～ ${timeText(secondEnd)}`);
    await page.mouse.up();
    await expect(preview).toBeHidden();
    if (secondStart <= day(3) && day(3) < secondEnd) {
      await expect(rows).toHaveCount(1);
    } else {
      await expect(plot.getByText("暂无数据")).toBeVisible();
    }
    await reset.click();
    await expect(rows).toHaveCount(3);
  });
}

for (const kind of ["line", "bar"]) {
  test(`${kind} 单点框选覆盖刻度时保留数据`, async ({ page }) => {
    await page.addInitScript(() => {
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
        if (text === "00:00") {
          const transform = this.getTransform();
          this.canvas.dataset.singleTick = String((transform.a * x + transform.c * y + transform.e) / this.canvas.width);
        }
        return fillText.call(this, text, x, y, maxWidth);
      };
    });
    const { plot, box, y, visibleLeft } = await openPlot(page, `kind=${kind}&local`);
    const preview = plot.locator(".qizhi-chart__range-selection-label");
    const rows = page.locator("table[aria-label='末桶探针数据'] tbody tr");
    await page.mouse.move(Math.max(box.x + box.width * 0.54, visibleLeft + 12), y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.91, y, { steps: 8 });
    const [firstStart, firstEnd] = (await preview.innerText()).split(" ～ ").map(parseTime);
    await page.mouse.up();
    await expect(rows).toHaveCount(1);

    await plotGeometry(plot, 0);
    const canvas = plot.locator("canvas[data-single-tick]");
    await expect(canvas).toHaveCount(1);
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error("缺少单点画布");
    const tickX = canvasBox.x + canvasBox.width * Number(await canvas.getAttribute("data-single-tick"));
    await page.mouse.move(tickX + 20, y);
    await page.mouse.down();
    await page.mouse.move(tickX - 20, y, { steps: 8 });
    await expect(preview).toBeVisible({ timeout: 2000 });
    const overlay = await plot.locator(".qizhi-chart__range-selection").boundingBox();
    if (!overlay) throw new Error("缺少框选覆盖层");
    expect(overlay.x).toBeLessThanOrEqual(tickX + 1);
    expect(overlay.x + overlay.width).toBeGreaterThanOrEqual(tickX - 1);
    const [start, end] = (await preview.innerText()).split(" ～ ").map(parseTime);
    expect(start).toBeGreaterThanOrEqual(firstStart);
    expect(end).toBeLessThanOrEqual(firstEnd);
    expect(start, "覆盖刻度的选区应包含该点时间").toBeLessThanOrEqual(day(3));
    expect(end, "覆盖刻度的选区应包含该点时间").toBeGreaterThan(day(3));
    await page.mouse.up();
    await expect(preview).toBeHidden();
    await expect(rows).toHaveCount(1);
    await expect(plot).toHaveAttribute("data-ready", "true");
  });
}

for (const crossing of [false, true]) {
  test(`单柱位于时间起点时${crossing ? "跨柱框选保留数据" : "左半边提交有效范围"}`, async ({ page }) => {
    await page.addInitScript(() => {
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
        if (text === "00:00") {
          const transform = this.getTransform();
          this.canvas.dataset.startTick = String((transform.a * x + transform.c * y + transform.e) / this.canvas.width);
        }
        return fillText.call(this, text, x, y, maxWidth);
      };
    });
    const { plot, box, y } = await openPlot(page, "kind=bar&explicit&single", 0);
    const canvas = plot.locator("canvas[data-start-tick]");
    await expect(canvas).toHaveCount(1);
    const tickX = box.x + box.width * Number(await canvas.getAttribute("data-start-tick"));
    const start = crossing ? tickX + box.width * 0.12 : box.x + box.width * 0.29;
    const end = crossing ? tickX - box.width * 0.07 : box.x + box.width * 0.45;
    await page.mouse.move(start, y);
    await page.mouse.down();
    await page.mouse.move(end, y, { steps: 8 });
    const preview = plot.locator(".qizhi-chart__range-selection-label");
    const [from, to] = (await preview.innerText()).split(" ～ ").map(parseTime);
    expect(from).toBeGreaterThanOrEqual(day(1));
    expect(to).toBeLessThanOrEqual(day(4));
    expect(to).toBeGreaterThan(from);
    if (crossing) {
      expect(from).toBe(day(1));
      const overlay = await plot.locator(".qizhi-chart__range-selection").boundingBox();
      if (!overlay) throw new Error("缺少跨柱选区");
      expect(overlay.x).toBeLessThanOrEqual(tickX + 1);
      expect(overlay.x + overlay.width).toBeGreaterThan(tickX);
    } else {
      expect(from).toBeGreaterThan(day(1));
    }
    await page.mouse.up();
    await expect(page.getByLabel("提交时间")).toHaveText(JSON.stringify({ start: from, end: to }));
    await expect(page.getByRole("list", { name: "查询结果" }).getByRole("listitem")).toHaveCount(crossing ? 1 : 0);
  });
}
