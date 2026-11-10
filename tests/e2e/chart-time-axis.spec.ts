import { expect, test } from "@playwright/test";

test("小时数据使用短刻度，长格式标签按绘图区宽度避让", async ({ page }) => {
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#component-chart .qizhi-chart__plot[data-ready='true']").first()).toBeVisible();
  const results = await page.evaluate(async () => {
    const enginePath = "/packages/qizhi-react/src/chart/chartEngine.ts";
    const modelPath = "/packages/qizhi-react/src/chart/chartModel.ts";
    const { renderChart } = await import(enginePath);
    const { normalizeChart } = await import(modelPath);
    const width = Math.max(260, Math.min(700, innerWidth - 90));
    const series = [{ key: "requests", label: "请求量" }];
    const data = Array.from({ length: 36 }, (_, index) => ({
      x: new Date(Date.UTC(2026, 8, 1, index)).toISOString(), series: "requests", value: index + 1,
    }));
    const results = [];
    for (const kind of ["line", "bar"] as const) {
      for (const useDefaultTimeLabels of [true, false]) {
        const host = document.createElement("div");
        document.body.append(host);
        const chart = await renderChart(host, {
          model: normalizeChart(data, series), series, visibleKeys: ["requests"], width, height: 280,
          kind, mode: "normal", useDefaultTimeLabels, xFormatter: (value: string) => value, valueFormatter: String,
        });
        const labels = chart.getContext().canvas.document.getElementsByTagName("text")
          .map((element: { style: { text: string }; getBBox: () => { x: number; width: number } }) => {
            const text = String(element.style.text);
            const bounds = element.getBBox();
            return { text, left: bounds.x, right: bounds.x + bounds.width };
          })
          .filter((label: { text: string }) => label.text.includes(":"))
          .sort((a: { left: number }, b: { left: number }) => a.left - b.left);
        results.push({ labels, useDefaultTimeLabels, width, kind });
        chart.destroy();
        host.remove();
      }
    }
    return results;
  });

  for (const { labels, useDefaultTimeLabels, width, kind } of results) {
    expect(labels.length, `${kind} default=${useDefaultTimeLabels}`).toBeGreaterThan(0);
    for (const [index, label] of labels.entries()) {
      expect(label.left).toBeGreaterThanOrEqual(43);
      expect(label.right).toBeLessThanOrEqual(width + 1);
      if (index) expect(label.left - labels[index - 1].right).toBeGreaterThanOrEqual(6);
      expect(label.text).toMatch(useDefaultTimeLabels ? /^\d{2}-\d{2} \d{2}:\d{2}$/ : /T.*(?:Z|…)$/);
    }
  }
});

test("折线图与柱状图的日期刻度按固定间隔居中对齐", async ({ page }) => {
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#component-chart .qizhi-chart__plot[data-ready='true']").first()).toBeVisible();
  const results = await page.evaluate(async () => {
    const enginePath = "/packages/qizhi-react/src/chart/chartEngine.ts";
    const modelPath = "/packages/qizhi-react/src/chart/chartModel.ts";
    const { renderChart } = await import(enginePath);
    const { normalizeChart } = await import(modelPath);
    const series = [{ key: "requests", label: "请求量" }];
    const data = Array.from({ length: 10 }, (_, index) => ({
      x: `2026-09-${String(index + 1).padStart(2, "0")}`, series: "requests", value: index + 1,
    }));
    const results = [];
    for (const kind of ["line", "bar"] as const) {
      for (const width of [720, 330]) {
        const host = document.createElement("div");
        document.body.append(host);
        const chart = await renderChart(host, {
          model: normalizeChart(data, series), series, visibleKeys: ["requests"], width, height: 280,
          kind, mode: "normal", xFormatter: (value: string) => `9月${Number(value.slice(-2))}日`, valueFormatter: String,
        });
        const labels = chart.getContext().canvas.document.getElementsByTagName("text")
          .map((element: { style: { text: string }; getBBox: () => { x: number; width: number } }) => {
            const { x, width } = element.getBBox();
            return { text: String(element.style.text), left: x, right: x + width, center: x + width / 2 };
          })
          .filter(({ text }: { text: string }) => /^9月\d+日$/.test(text))
          .sort((a: { center: number }, b: { center: number }) => a.center - b.center);
        results.push({ kind, width, labels });
        chart.destroy();
        host.remove();
      }
    }
    return results;
  });
  for (const { kind, width, labels } of results) {
    const days = width === 720 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 3, 5, 7, 9];
    expect(labels.map(({ text }: { text: string }) => text), kind).toEqual(days.map(day => `9月${day}日`));
    const gap = labels[1].center - labels[0].center;
    for (const [index, label] of labels.entries()) {
      expect(label.left).toBeGreaterThanOrEqual(0);
      expect(label.right).toBeLessThanOrEqual(width);
      if (index) {
        expect(Math.abs(label.center - labels[index - 1].center - gap)).toBeLessThan(1);
        expect(label.left - labels[index - 1].right).toBeGreaterThanOrEqual(6);
      }
    }
  }
});

test("十天小时数据只在等距日历刻度显示日期", async ({ page }) => {
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#component-chart .qizhi-chart__plot[data-ready='true']").first()).toBeVisible();
  const results = await page.evaluate(async () => {
    const enginePath = "/packages/qizhi-react/src/chart/chartEngine.ts";
    const modelPath = "/packages/qizhi-react/src/chart/chartModel.ts";
    const { renderChart } = await import(enginePath);
    const { normalizeChart } = await import(modelPath);
    const series = [{ key: "requests", label: "请求量" }];
    const data = Array.from({ length: 240 }, (_, index) => ({
      x: new Date(Date.UTC(2026, 8, 1, index)).toISOString(), series: "requests", value: index % 8 + 1,
    }));
    const results = [];
    for (const kind of ["line", "bar"] as const) {
      for (const width of [320, 700, 1200]) {
        const host = document.createElement("div");
        document.body.append(host);
        const chart = await renderChart(host, {
          model: normalizeChart(data, series), series, visibleKeys: ["requests"], width, height: 280,
          kind, mode: "normal", useDefaultTimeLabels: true, xFormatter: String, valueFormatter: String,
        });
        const labels = chart.getContext().canvas.document.getElementsByTagName("text")
          .map((element: { style: { text: string }; getBBox: () => { x: number; width: number } }) => {
            const { x, width } = element.getBBox();
            return { text: String(element.style.text), left: x, right: x + width, center: x + width / 2 };
          })
          .filter(({ text }: { text: string }) => /^09-\d{2}$/.test(text))
          .sort((a: { center: number }, b: { center: number }) => a.center - b.center);
        results.push({ kind, width, labels });
        chart.destroy();
        host.remove();
      }
    }
    return results;
  });
  for (const { kind, width, labels } of results) {
    const days = width === 320 ? [1, 3, 5, 7, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(labels.map(({ text }: { text: string }) => Number(text.slice(3))), `${kind} ${width}`).toEqual(days);
    const gap = labels[1].center - labels[0].center;
    for (const [index, label] of labels.entries()) {
      expect(label.left).toBeGreaterThanOrEqual(0);
      expect(label.right).toBeLessThanOrEqual(width);
      if (index) {
        expect(Math.abs(label.center - labels[index - 1].center - gap)).toBeLessThan(1);
        expect(label.left - labels[index - 1].right).toBeGreaterThanOrEqual(6);
      }
    }
  }
});

for (const { scenario, days, missingHour, startHour } of [
  { scenario: "完整小时序列", days: 10, missingHour: -1, startHour: 0 },
  { scenario: "缺一小时", days: 3, missingHour: 45, startHour: 0 },
  { scenario: "首日从中午开始", days: 3, missingHour: -1, startHour: 12 },
]) {
  test(`上海时区的自定义日期刻度按当地日期去重（${scenario}）`, async ({ page }) => {
    await page.addInitScript(() => {
      const original = CanvasRenderingContext2D.prototype.fillText;
      const labels = new WeakMap<HTMLCanvasElement, Map<number, string>>();
      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
        if (this.canvas.closest("#custom-calendar-probe") && /^09-\d{2}$/.test(text)) {
          const transform = this.getTransform();
          const position = transform.a * x + transform.c * y + transform.e;
          const ticks = labels.get(this.canvas) ?? new Map<number, string>();
          ticks.set(position, text);
          labels.set(this.canvas, ticks);
          this.canvas.dataset.calendarTicks = JSON.stringify([...ticks].sort(([left], [right]) => left - right));
        }
        original.call(this, text, x, y, maxWidth);
      };
    });
    await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
    await page.evaluate(async ({ days, missingHour, startHour }) => {
      const chartView = "/packages/qizhi-react/src/chart/ChartView.tsx";
      const chartDocs = "/apps/qizhi-docs/src/chart/main.tsx";
      const reactUrl = (await (await fetch(chartView)).text()).match(/\/node_modules\/\.vite\/deps\/react\.js\?v=\w+/)![0];
      const reactDomUrl = (await (await fetch(chartDocs)).text()).match(/\/node_modules\/\.vite\/deps\/react-dom_client\.js\?v=\w+/)![0];
      const { default: React } = await import(reactUrl);
      const { default: { createRoot } } = await import(reactDomUrl);
      const linePath = "/packages/qizhi-react/src/chart/LineChart.tsx";
      const barPath = "/packages/qizhi-react/src/chart/BarChart.tsx";
      const { LineChart } = await import(linePath);
      const { BarChart } = await import(barPath);
      const host = document.createElement("div");
      host.id = "custom-calendar-probe";
      host.style.cssText = "position:fixed; top:0; left:0; z-index:10000";
      host.style.width = days > 3 ? "1200px" : "min(100vw, 1200px)";
      document.body.append(host);
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit" });
      const xFormatter = (value: string) => date.formatToParts(new Date(value))
        .filter(({ type }) => type === "month" || type === "day").map(part => part.value).join("-");
      const series = [{ key: "requests", label: "请求量" }];
      const data = Array.from({ length: days * 24 - startHour }, (_, index) => ({
        x: new Date(Date.UTC(2026, 8, 1, startHour + index - 8)).toISOString(), series: "requests", value: index % 8 + 1,
      })).filter((_, index) => index !== missingHour);
      createRoot(host).render(React.createElement(React.Fragment, null,
        React.createElement(LineChart, { data, series, xFormatter, label: "上海日期折线" }),
        React.createElement(BarChart, { data, series, xFormatter, label: "上海日期柱状" }),
      ));
    }, { days, missingHour, startHour });

    for (const name of ["上海日期折线", "上海日期柱状"]) {
      const chart = page.getByRole("region", { name });
      const canvas = chart.locator('.qizhi-chart__plot[data-ready="true"] canvas[data-calendar-ticks]');
      await expect(canvas).toHaveCount(1);
      const ticks: [number, string][] = JSON.parse((await canvas.getAttribute("data-calendar-ticks"))!);
      expect.soft(ticks.map(([, label]) => label), name).toEqual(Array.from({ length: days }, (_, index) => `09-${String(index + 1).padStart(2, "0")}`));
      if (ticks.length !== days) continue;
      const hourSpacing = (ticks[1][0] - ticks[0][0]) / (24 - startHour);
      expect(hourSpacing).toBeGreaterThan(0);
      for (let index = 2; index < ticks.length; index++) {
        const slots = missingHour >= (index - 1) * 24 - startHour && missingHour < index * 24 - startHour ? 23 : 24;
        expect.soft(Math.abs(ticks[index][0] - ticks[index - 1][0] - hourSpacing * slots), name).toBeLessThan(1);
      }
    }
  });
}
