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
      const chart = await renderChart(host, { kind: mode === "line" ? "line" : "bar", mode: mode === "line" ? "normal" : mode, model: normalizeChart(data, series), series, visibleKeys: series.map(s => s.key), width: Math.floor(original.getBoundingClientRect().width), height: 280, xFormatter: (x: string) => x, valueFormatter: (value: number) => value.toFixed(2) });
      if (mode === "normal" || mode === "stacked") widths.push(...chart.getContext().canvas!.document.getElementsByClassName("element").map((element: { getBBox: () => { width: number } }) => element.getBBox().width));
      const labels = chart.getContext().canvas!.document.getElementsByTagName("text");
      for (const label of labels) {
        if (/^\d+$/.test(String(label.style.text))) {
          const box = label.getBBox();
          if (mode !== "line") {
            const scale = chart.getContext().views![0].scale.x;
            const center = 44.5 + (scale.map(String(label.style.text)) + scale.getBandWidth(String(label.style.text)) / 2) * (Math.floor(original.getBoundingClientRect().width) - 45);
            if (Math.abs(box.x + box.width / 2 - center) > 0.6) throw new Error("柱状图日期未对齐柱组中心");
          }
          if (box.x < 43.5 || box.x + box.width > Math.floor(original.getBoundingClientRect().width) + 0.5) throw new Error("横轴标签超出轴线端点");
          if (Math.abs(box.y - 252) > 0.5) throw new Error(`横轴标签间距不是12像素：${box.y - 240}`);
        }
        if (/^\d+\.\d{2}$/.test(String(label.style.text)) && Math.abs(label.getBBox().x) > 0.5) throw new Error("纵轴刻度未与内容左缘对齐");
      }
      chart.destroy(); host.remove();
    }
    return widths;
  });
  const viewport = page.viewportSize()!.width;
  const expected = viewport >= 1280 ? 32 : viewport >= 768 ? 16 : 10;
  for (const mode of ["normal", "stacked"]) {
    const chart = page.locator(`#component-chart .qizhi-chart[data-kind="bar"][data-mode="${mode}"]`).first();
    await chart.screenshot({path: `/tmp/qizhi-width-${info.project.name}-${mode}.png`});
  }
  for (const width of result) expect(width).toBeCloseTo(expected, 2);
});
