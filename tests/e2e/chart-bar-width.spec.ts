import { test, expect } from "@playwright/test";
test("普通与堆叠柱按三档宽度收窄", async ({page}, info) => {
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  await expect(page.locator('#component-chart [data-ready="true"]').first()).toBeVisible({ timeout: 30000 });
  const result = await page.evaluate(async () => {
    // 与真实示例同宽、同七分类，使用正式适配器测量绘制图形。
    const enginePath = "/packages/qizhi-react/src/chart/chartEngine.ts";
    const { renderChart } = await import(enginePath);
    const modelPath = "/packages/qizhi-react/src/chart/chartModel.ts";
    const { normalizeChart } = await import(modelPath);
    const widths: number[] = [];
    for (const mode of ["normal", "grouped", "stacked", "line"] as const) {
      const original = document.querySelector(mode === "line" ? "#component-chart .qizhi-chart[data-kind=\"line\"] .qizhi-chart__plot" : `#component-chart .qizhi-chart[data-kind="bar"][data-mode="${mode}"] .qizhi-chart__plot`)!;
      const host = document.createElement("div"); document.body.append(host);
      const series = (mode === "normal" || mode === "line" ? ["a"] : ["a", "b"]).map(key => ({ key, label: key }));
      const data = Array.from({ length: 7 }, (_, i) => series.map(s => ({ x: String(i), series: s.key, value: i + 1 }))).flat();
      const width = Math.floor(original.getBoundingClientRect().width);
      const chart = await renderChart(host, { kind: mode === "line" ? "line" : "bar", mode: mode === "line" ? "normal" : mode, model: normalizeChart(data, series), series, visibleKeys: series.map(s => s.key), width, height: 280, xFormatter: (x: string) => x, valueFormatter: (value: number) => value.toFixed(2) });
      const { left, right, bottom } = chart.plotPadding;
      const canvas = chart.getContext().canvas!.document;
      const bars = canvas.getElementsByClassName("element").map((element: { __data__: { data: { x: string } }; getBBox: () => { x: number; width: number } }) => ({
        category: element.__data__.data.x,
        ...element.getBBox(),
      }));
      if (mode === "normal" || mode === "stacked") {
        if (bars.length !== 7 * series.length) throw new Error(`${mode} 柱形数量不符`);
        widths.push(...bars.map((bar: { width: number }) => bar.width));
      }
      let xLabels = 0;
      let yLabels = 0;
      for (const label of canvas.getElementsByTagName("text")) {
        const text = String(label.style.text);
        const box = label.getBBox();
        if (/^\d+$/.test(text)) {
          xLabels++;
          if (mode !== "line") {
            const group = bars.filter((bar: { category: string }) => bar.category === text);
            const groupLeft = Math.min(...group.map((bar: { x: number }) => bar.x));
            const groupRight = Math.max(...group.map((bar: { x: number; width: number }) => bar.x + bar.width));
            const center = (groupLeft + groupRight) / 2;
            if (group.length !== series.length || Math.abs(box.x + box.width / 2 - center) > 0.6) throw new Error(`${mode} 横轴标签 ${text} 未对齐实际柱组中心`);
          }
          if (box.x < left - 0.5 || box.x + box.width > width - right + 1.1) throw new Error("横轴标签超出轴线端点");
          if (Math.abs(box.y - (280 - bottom) - 12) > 0.5) throw new Error("横轴标签与轴线间距不是 12 像素");
        }
        if (/^\d+\.\d{2}$/.test(text)) {
          yLabels++;
          // G2 在像素边界处可能额外平移 1px，仍应统一右对齐到刻度栏。
          if (box.x < -0.5 || Math.abs(left - (box.x + box.width) - 16) > 1.1) throw new Error(`${mode} 纵轴标签 ${text} 被裁切或未右对齐`);
        }
      }
      if (xLabels < 2 || yLabels < 2) throw new Error(`${mode} 缺少可测量的刻度标签`);
      chart.destroy(); host.remove();
    }
    return widths;
  });
  const viewport = page.viewportSize()!.width;
  const expected = viewport >= 1280 ? 32 : viewport >= 768 ? 16 : 10;
  for (const mode of ["normal", "stacked"]) {
    const chart = page.locator(`#component-chart .qizhi-chart[data-kind="bar"][data-mode="${mode}"]`).first();
    await chart.screenshot({ path: info.outputPath(`bar-width-${mode}.png`) });
  }
  for (const width of result) expect(width).toBeCloseTo(expected, 2);
});
