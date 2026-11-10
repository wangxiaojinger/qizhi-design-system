import { expect, test } from "@playwright/test";

test("折线、柱状和堆叠柱状图根据实际 Y 轴刻度预留空间", async ({ page }) => {
  await page.goto("/#component-chart", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#component-chart .qizhi-chart__plot[data-ready='true']").first()).toBeVisible();
  const results = await page.evaluate(async () => {
    const enginePath = "/packages/qizhi-react/src/chart/chartEngine.ts";
    const modelPath = "/packages/qizhi-react/src/chart/chartModel.ts";
    const { renderChart } = await import(enginePath);
    const { normalizeChart } = await import(modelPath);
    const width = Math.min(600, innerWidth - 80);
    const allSeries = [{ key: "a", label: "A" }, { key: "b", label: "B" }];
    const valueFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 20 }).format;
    const variants = [["line", "normal"], ["bar", "normal"], ["bar", "stacked"]] as const;
    const results = [];
    for (const [kind, mode] of variants) {
      const series = mode === "normal" && kind === "bar" ? allSeries.slice(0, 1) : allSeries;
      for (const multiplier of [1, 100_000]) {
        const host = document.createElement("div");
        document.body.append(host);
        const data = [11.666666666666666, 8.75].flatMap((value, index) => series.map(({ key }, seriesIndex) => ({
          x: `bucket-${index}`, series: key, value: value * multiplier * (seriesIndex ? -0.5 : 1),
        })));
        const chart = await renderChart(host, {
          model: normalizeChart(data, series), series, visibleKeys: series.map(({ key }) => key), width, height: 260,
          kind, mode, xFormatter: String, valueFormatter,
        });
        const labels = chart.getContext().canvas.document.getElementsByTagName("text")
          .filter((element: { style: { text: string } }) => /^-?\d/.test(element.style.text))
          .map((element: { getBBox: () => { x: number; width: number } }) => {
            const { x, width } = element.getBBox();
            return { left: x, right: x + width };
          });
        results.push({ kind, mode, multiplier, left: chart.plotPadding.left, labels });
        chart.destroy();
        host.remove();
      }
    }
    return results;
  });

  for (const { kind, mode, multiplier, left, labels } of results) {
    const variant = `${kind} ${mode} ×${multiplier}`;
    expect(labels.length, variant).toBeGreaterThan(1);
    if (multiplier === 1) expect(left, variant).toBe(44);
    else expect(left, variant).toBeGreaterThan(44);
    for (const label of labels) {
      expect(label.left, variant).toBeGreaterThanOrEqual(0);
      expect(label.right, variant).toBeLessThan(left);
    }
  }
});
