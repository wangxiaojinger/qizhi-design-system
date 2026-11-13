import { expect, test } from "@playwright/test";

for (const short of [false, true]) {
  test(`起点单柱的${short ? "重复短标签回退为时间" : "重复长标签回退为时间"}`, async ({ page }) => {
    await page.addInitScript(() => {
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (label, x, y, ...args) {
        if (/^01-01(?: 00:00(?::00)?)?$/.test(label)) {
          const transform = this.getTransform();
          const metrics = this.measureText(label);
          const anchor = transform.a * x + transform.c * y + transform.e;
          this.canvas.dataset.tickBounds = JSON.stringify({
            label, align: this.textAlign, left: anchor - metrics.actualBoundingBoxLeft * transform.a,
            right: anchor + metrics.actualBoundingBoxRight * transform.a, width: this.canvas.width,
          });
        }
        return fillText.call(this, label, x, y, ...args);
      };
    });
    await page.goto(`/tests/fixtures/chart-engine/start-bar-label.html${short ? "?short" : ""}`);
    const plot = page.getByRole("group", { name: "起点单柱绘图区" });
    await expect(plot).toHaveAttribute("data-ready", "true");
    const canvas = plot.locator("canvas[data-tick-bounds]");
    await expect(canvas).toHaveCount(1);
    const bounds = JSON.parse((await canvas.getAttribute("data-tick-bounds"))!);
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(bounds.width);
    expect(bounds.label).toMatch(/^01-01/);
    expect(bounds.align).toBe("left");
  });
}
