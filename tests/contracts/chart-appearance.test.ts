import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
it("公共外壳与图例落实设计稿变量，渲染器使用平滑实线与实线网格", () => {
  const css=readFileSync("packages/qizhi-react/src/chart/chart.css","utf8");
  const engine=readFileSync("packages/qizhi-react/src/chart/chartEngine.ts","utf8");
  expect(css).toContain("var(--chart-surface)");
  expect(css).toContain("var(--chart-legend-gap)");
  expect(css).toContain('opacity: 0.3');
  expect(engine).toContain('shape: "smooth"');
  expect(engine).not.toContain('gridLineDash: [3, 3]');
  expect(engine).not.toContain('lineDash: seriesIndex % 2');
});
