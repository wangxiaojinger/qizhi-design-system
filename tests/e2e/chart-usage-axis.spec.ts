import { expect, test } from "@playwright/test";

const end = Date.parse("2026-11-12T07:36:24Z");
const day = 86_400_000;

test("图表分类的原有时间图共用实时快捷范围，小时轴与悬浮提示分别格式化", async ({ page }) => {
  await page.clock.setFixedTime(end + 850);
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    const labels = new WeakMap<HTMLCanvasElement, Map<number, string>>();
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      if (/\d{2}:\d{2}/.test(text)) {
        const transform = this.getTransform();
        const position = transform.a * x + transform.c * y + transform.e;
        const ticks = labels.get(this.canvas) ?? new Map<number, string>();
        ticks.set(position, text);
        labels.set(this.canvas, ticks);
        this.canvas.dataset.usageTicks = JSON.stringify([...ticks].sort(([a], [b]) => a - b));
      }
      original.call(this, text, x, y, maxWidth);
    };
  });
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  const doc = page.locator("#component-chart");
  const controls = doc.getByRole("group", { name: "图表共同时间范围" });
  const startField = controls.getByRole("combobox", { name: "开始时间", exact: true });
  const endField = controls.getByRole("combobox", { name: "结束时间（不含）", exact: true });
  await expect(endField).toHaveValue("2026-11-12 15:36:24");
  await startField.hover();
  await expect(controls.locator(".qizhi-date-picker__suffix svg")).toBeVisible();
  await startField.click();
  await expect(startField).toHaveCSS("caret-color", "rgba(0, 0, 0, 0)");
  await expect(startField).toBeFocused();
  await page.getByRole("button", { name: "近 24 小时" }).click();
  await expect(controls.getByRole("combobox", { name: "聚合粒度" })).toHaveValue("自动（按小时）");
  await expect(startField).toHaveValue("2026-11-11 15:36:24");
  await expect(endField).toHaveValue("2026-11-12 15:36:24");

  for (const field of [startField, endField]) {
    expect(await field.evaluate((input: HTMLInputElement) => {
      const style = getComputedStyle(input);
      const canvas = document.createElement("canvas").getContext("2d")!;
      canvas.font = style.font;
      const available = input.getBoundingClientRect().width - parseFloat(style.borderRightWidth) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      return available >= canvas.measureText(input.value).width;
    })).toBe(true);
  }

  await endField.click();
  const dialog = page.getByRole("dialog", { name: "选择日期时间范围" });
  await expect(dialog.getByRole("button", { name: "2026年11月13日", exact: true })).toBeDisabled();
  for (const [name, value] of [["时", "16"], ["分", "37"], ["秒", "25"]]) {
    await expect(dialog.getByRole("listbox", { name }).getByRole("option", { name: value, exact: true })).toBeDisabled();
  }
  await endField.fill("2026-11-12 15:36:25");
  await dialog.getByRole("button", { name: "确认", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveText("结束时间不能晚于当前时间。");
  await endField.press("Escape");
  await expect(endField).toHaveValue("2026-11-12 15:36:24");

  const charts = doc.locator('.qizhi-chart[data-usage-axis="true"][data-state="normal"]');
  await expect(charts).toHaveCount(9);
  const tooltip = page.getByRole("tooltip");
  for (const chart of await charts.all()) {
    const plot = chart.locator(".qizhi-chart__plot");
    await expect(plot).toHaveAttribute("data-ready", "true");
    const labels: [number, string][] = JSON.parse((await plot.locator("canvas").getAttribute("data-usage-ticks"))!);
    expect(labels.length).toBeGreaterThanOrEqual(2);
    expect(labels.every(([, label]) => /^\d{2}:\d{2}$/.test(label))).toBe(true);
    const gap = (labels.at(-1)![0] - labels[0][0]) / (labels.length - 1);
    labels.slice(1).forEach(([x], index) => expect(Math.abs(x - labels[index][0] - gap)).toBeLessThanOrEqual(1));
    await plot.scrollIntoViewIfNeeded();
    const box = (await plot.boundingBox())!;
    const canvasWidth = Number(await plot.locator("canvas").getAttribute("width"));
    await page.mouse.move(box.x + labels[0][0] * box.width / canvasWidth, box.y + 100);
    await expect(tooltip.locator("strong")).toHaveText("11月11日 15:36");
    await plot.press("End");
    await expect(tooltip.locator("strong")).toHaveText("11月12日 15:00");
    await plot.press("Escape");
  }

  const rows = doc.getByRole("region", { name: "请求量趋势图", exact: true }).locator("tbody tr");
  const original = (await rows.first().textContent())!;
  await startField.click();
  await page.getByRole("dialog").getByRole("button", { name: "确认", exact: true }).click();
  await expect(rows.first()).toHaveText(original);

  const refreshed = end + 7_000;
  await page.clock.setFixedTime(refreshed + 200);
  await controls.getByRole("button", { name: "刷新" }).click();
  const display = (time: number) => new Date(time + 8 * 3_600_000).toISOString().slice(0, 19).replace("T", " ");
  await expect(startField).toHaveValue(display(refreshed - day));
  await expect(endField).toHaveValue(display(refreshed));
  await expect(doc.locator(".codebox-wrapper")).toHaveCount(12);
});

test("十天按小时显示时，折线和柱状图横轴只显示时分", async ({ page }) => {
  await page.clock.setFixedTime(Date.UTC(2026, 8, 10, 16));
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      if (/^\d{2}:\d{2}$/.test(text)) {
        const labels = new Set((this.canvas.dataset.longTicks ?? "").split("|").filter(Boolean));
        labels.add(text);
        this.canvas.dataset.longTicks = [...labels].join("|");
      }
      original.call(this, text, x, y, maxWidth);
    };
  });
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  await page.getByRole("combobox", { name: "聚合粒度" }).click();
  await page.getByRole("option", { name: "按小时", exact: true }).click();
  for (const name of ["请求量趋势图", "每日请求量柱状图"]) {
    const canvas = page.getByRole("region", { name, exact: true }).locator("canvas");
    await expect(canvas).toHaveAttribute("data-long-ticks", page.viewportSize()!.width < 400
      ? /^00:00\|(?:.+\|)?23:00$/ : /^00:00\|.+\|23:00$/);
  }
});

const names = [
    "零值与缺失请求量趋势图", "请求量趋势图", "不同服务请求量趋势图",
    "每日请求量柱状图", "输入与输出用量分组柱状图", "输入与输出用量堆叠柱状图",
    "费用趋势图", "服务请求量图例与提示信息示例", "可响应和键盘操作的输入输出用量堆叠柱状图",
  ];

for (const name of names) test(`框选${name}后同步九张图，刷新保留固定范围`, async ({ page }) => {
  test.setTimeout(90000);
  const now = Date.parse("2026-11-13T02:20:09Z");
  await page.clock.setFixedTime(now);
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  const doc = page.locator("#component-chart");
  const controls = doc.getByRole("group", { name: "图表共同时间范围" });
  const start = controls.getByRole("combobox", { name: "开始时间", exact: true });
  const end = controls.getByRole("combobox", { name: "结束时间（不含）", exact: true });
  const chart = (name: string) => doc.getByRole("region", { name, exact: true });
  const hour = 3_600_000;
  await page.clock.setFixedTime(now);
  await start.click();
  await page.getByRole("button", { name: "近 24 小时", exact: true }).click();
  const plot = chart(name).locator(".qizhi-chart__plot");
  await expect(plot).toHaveAttribute("data-ready", "true");
  await plot.scrollIntoViewIfNeeded();
  const box = (await plot.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.32, box.y + 85);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.58, box.y + 85, { steps: 8 });
  const [from, to] = (await plot.locator(".qizhi-chart__range-selection-label").innerText()).split(" ～ ");
  await page.mouse.up();
  await expect(start).toHaveValue(from);
  await expect(end).toHaveValue(to);
  const parse = (value: string) => Date.parse(value.replace(" ", "T") + "+08:00");
  const first = Math.floor(parse(from) / hour);
  const expected = Array.from({ length: Math.ceil(parse(to) / hour) - first },
    (_, index) => new Date((first + index) * hour).toISOString());
  for (const other of names) {
    await expect(chart(other).locator("tbody tr td:first-child")).toHaveText(expected);
  }
  if (name === names[0]) {
    await expect(chart(name)).toHaveAttribute("data-state", "missing");
    await expect(chart(name).getByText("暂无有效数据", { exact: true })).toBeVisible();
  }
  await page.clock.setFixedTime(now + 120_000);
  await controls.getByRole("button", { name: "刷新", exact: true }).click();
  await expect(start).toHaveValue(from);
  await expect(end).toHaveValue(to);
  for (const other of names) {
    await expect(chart(other).locator("tbody tr td:first-child")).toHaveText(expected);
  }
});

test("连续框选两次，刷新后可逐次恢复全部图表", async ({ page }) => {
  await page.clock.setFixedTime(end);
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  const controls = page.getByRole("group", { name: "图表共同时间范围" });
  const start = controls.getByRole("combobox", { name: "开始时间", exact: true });
  const finish = controls.getByRole("combobox", { name: "结束时间（不含）", exact: true });
  const back = controls.getByRole("button", { name: "返回上一时间范围" });
  await start.click();
  await page.getByRole("button", { name: "近 24 小时", exact: true }).click();
  const charts = page.locator('#component-chart [data-usage-axis="true"]:has(tbody tr)');
  await expect(charts).toHaveCount(9);
  const snapshot = async () => ({
    start: await start.inputValue(),
    end: await finish.inputValue(),
    rows: await Promise.all((await charts.all()).map(chart => chart.locator("tbody tr").allTextContents())),
  });
  const check = async (expected: Awaited<ReturnType<typeof snapshot>>) => {
    await expect.poll(snapshot).toEqual(expected);
  };
  const initial = await snapshot();
  const select = async (name: string) => {
    const plot = page.getByRole("region", { name, exact: true }).locator(".qizhi-chart__plot");
    await expect(plot).toHaveAttribute("data-ready", "true");
    await plot.scrollIntoViewIfNeeded();
    const box = (await plot.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.3, box.y + 85);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.65, box.y + 85, { steps: 8 });
    const [from, to] = (await plot.locator(".qizhi-chart__range-selection-label").innerText()).split(" ～ ");
    await page.mouse.up();
    await expect(start).toHaveValue(from);
    await expect(finish).toHaveValue(to);
    const firstHour = Math.floor(Date.parse(from.replace(" ", "T") + "+08:00") / 3_600_000);
    const lastHour = Math.ceil(Date.parse(to.replace(" ", "T") + "+08:00") / 3_600_000);
    const buckets = Array.from({ length: lastHour - firstHour }, (_, i) => new Date((firstHour + i) * 3_600_000).toISOString());
    for (const chart of await charts.all()) await expect(chart.locator("tbody tr td:first-child")).toHaveText(buckets);
  };
  await select("请求量趋势图");
  const first = await snapshot();
  await select("每日请求量柱状图");
  const second = await snapshot();
  expect(second.rows[0].length).toBeLessThan(first.rows[0].length);
  await page.clock.setFixedTime(end + 120_000);
  await controls.getByRole("button", { name: "刷新", exact: true }).click();
  await check(second);
  await back.click();
  await check(first);
  await back.click();
  await check(initial);
  await expect(back).toHaveCount(0);
});
