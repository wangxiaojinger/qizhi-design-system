import { readFileSync } from "node:fs";

const styles = readFileSync(
  "packages/qizhi-react/src/business-metrics/businessMetrics.css",
  "utf8",
);

describe("MetricCard selected corner", () => {
  it("restores the original selected-corner asset", () => {
    expect(styles).toContain(
      ".qizhi-metric-card.is-selected-primary::after",
    );
    expect(styles).toContain(
      'url("./assets/qizhi-task-overview-selected-corner.svg")',
    );
  });
});
