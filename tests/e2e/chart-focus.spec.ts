import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
// 仅验收夹具暴露探针；业务组件没有引擎访问入口。
const probe = (page: import("@playwright/test").Page, action: string, args: unknown[] = []) => page.evaluate(({ action, args }) => (window as any).chartFocusProbe[action](...args), { action, args });
const pointerAt = async (page: import("@playwright/test").Page, plot: import("@playwright/test").Locator, x: number, y: number, action: "click" | "move" = "click") => {
  const point = await plot.evaluate((node, position) => {
    const scroll = node.closest(".qizhi-chart__scroll")!;
    scroll.scrollLeft = Math.max(0, position.x - scroll.clientWidth / 2);
    const rect = node.getBoundingClientRect();
    return { x: rect.left + position.x, y: rect.top + position.y };
  }, { x, y });
  await page.mouse[action](point.x, point.y);
};
test("公共聚焦：三种柱形与折线点选、切换、悬停、背景及旧调用兼容", async ({ page }, info) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/tests/fixtures/chart-engine/focus.html");
  const plot = page.locator("#public .qizhi-chart__plot");
  for (const mode of ["normal", "grouped", "stacked", "line"]) {
    await probe(page, "init", [mode]); await expect(plot).toHaveAttribute("data-ready", "true");
    const shapes = (await probe(page, "shapes")).filter((s: any) => !s.line);
    const a = shapes.find((s: any) => s.key === "09-02" && s.series === (mode === "normal" ? "cpu" : "gpu"));
    const b = shapes.find((s: any) => s.key === "09-01" && s.series === "cpu");
    const click = async (shape: any) => pointerAt(page, plot, shape.x + shape.width / 2, shape.y + shape.height / 2);
    await click(a);
    await expect.poll(() => probe(page, "changes")).toHaveLength(1);
    expect((await probe(page, "changes"))[0]).toMatchObject({ seriesKey: a.series, dataKey: "09-02", dataIndex: 1, data: { x: "09-02", series: a.series } });
    const selected = page.locator('#public [role="option"][aria-selected="true"]'); await expect(selected).toHaveCount(1);
    await pointerAt(page, plot, b.x + b.width / 2, b.y + b.height / 2, "move");
    await expect(page.getByRole("tooltip")).toBeVisible(); await expect(selected).toHaveText(/09-02/);
    await click(a); expect((await probe(page, "changes")).at(-1)).toBeNull();
    await click(a); await click(b); await expect(selected).toHaveText(/09-01/);
    await pointerAt(page, plot, 48, 26); await expect(selected).toHaveCount(0);
    await click(a); await page.mouse.move(0, 0); await page.waitForTimeout(220);
    mkdirSync("/tmp/qizhi-focus", { recursive: true });
    await page.locator("#public").screenshot({ path: `/tmp/qizhi-focus/${info.project.name}-${mode}.png` });
    expect(errors).toEqual([]);
  }
  await probe(page, "init", ["grouped", false, false]); await expect(plot).toHaveAttribute("data-ready", "true");
  const offShape = (await probe(page, "shapes")).find((s: any) => s.key === "09-02" && s.series === "gpu");
  await pointerAt(page, plot, offShape.x + offShape.width / 2, offShape.y + offShape.height / 2);
  expect(await probe(page, "changes")).toEqual([]);
  await probe(page, "focusEngine", [{ seriesKey: "gpu", dataIndex: 1, dataKey: "09-02" }]);
  for (const shape of await probe(page, "shapes")) expect(shape.opacity).toBe(1);
  await expect(page.locator('#public [role="option"]')).toHaveCount(0);
});
test("受控、背景开关、真实图形透明度与几何不变", async ({page}) => {
  await page.goto("/tests/fixtures/chart-engine/focus.html");
  await probe(page, "init", ["stacked", true, true, false]);
  const plot = page.locator("#public .qizhi-chart__plot"); await expect(plot).toHaveAttribute("data-ready", "true");
  const before = await probe(page, "shapes"); const a = before.find((s: any) => s.series === "gpu" && s.key === "09-02");
  await pointerAt(page, plot, a.x + a.width/2, a.y + a.height/2);
  await expect.poll(() => probe(page, "changes")).toHaveLength(1);
  await expect(page.locator('#public [aria-selected="true"]')).toHaveCount(0);
  const item = (await probe(page, "changes"))[0]; await probe(page, "set", [item]);
  await expect(page.locator('#public [aria-selected="true"]')).toHaveCount(1);
  await pointerAt(page, plot, 48, 26); expect(await probe(page, "changes")).toHaveLength(1);
  await probe(page, "focusEngine", [item, 0.2]); await page.waitForTimeout(230);
  const after = await probe(page, "shapes");
  for (let i=0; i<after.length; i++) { expect(after[i]).toMatchObject({ ...before[i], opacity: after[i].series === "gpu" && after[i].key === "09-02" ? 1 : 0.2 }); }
  await probe(page, "focusEngine", [null]); await page.waitForTimeout(230);
  for (const s of await probe(page, "shapes")) expect(s.opacity).toBe(1);
});

test("现有折线示例键盘聚焦与复制代码同源", async ({page, context}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#component-chart");
  const demo = page.locator('[id="图表-基础折线"]');
  const plot = demo.getByRole("listbox");
  await expect(plot).toHaveAttribute("data-ready", "true");
  await plot.press("Home"); await plot.press("Enter");
  await expect(demo.locator('[aria-selected="true"]')).toHaveCount(1);
  await plot.press("Escape");
  await expect(demo.locator('[aria-selected="true"]')).toHaveCount(1);
  await plot.press("Enter");
  await expect(demo.locator('[aria-selected="true"]')).toHaveCount(0);
  await demo.getByRole("button", { name: "查看代码", exact: true }).click();
  await demo.getByRole("button", { name: "复制代码", exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("focusable");
  await expect(demo.locator("pre")).toHaveText(copied);
});

test("触屏点击选择与再次取消", async ({browser}, info) => {
  const context = await browser.newContext({ viewport: info.project.use.viewport, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto(`${process.env.QIZHI_DOCS_BASE_URL ?? "http://127.0.0.1:5173"}/tests/fixtures/chart-engine/focus.html`);
    await probe(page, "init", ["grouped"]);
    const plot = page.locator("#public .qizhi-chart__plot"); await expect(plot).toHaveAttribute("data-ready", "true");
    const a = (await probe(page, "shapes")).find((s: any) => s.series === "gpu" && s.key === "09-02");
    const rect = (await plot.boundingBox())!;
    await page.touchscreen.tap(rect.x + a.x + a.width/2, rect.y + a.y + a.height/2);
    await expect(page.locator('#public [aria-selected="true"]')).toHaveCount(1);
    await page.touchscreen.tap(rect.x + a.x + a.width/2, rect.y + a.y + a.height/2);
    await expect(page.locator('#public [aria-selected="true"]')).toHaveCount(0);
  } finally { await context.close(); }
});

test("折线聚焦点具有可见填充，其他点和连接线淡化", async ({page}) => {
  await page.goto("/tests/fixtures/chart-engine/focus.html"); await probe(page, "init", ["line"]);
  const before = await probe(page, "shapes");
  const plotWidth = await page.locator("#public .qizhi-chart__plot").evaluate(el => Math.floor(el.getBoundingClientRect().width));
  for (const point of before.filter((s: any) => !s.line)) {
    expect(point.fill).not.toMatch(/transparent|none/);
    expect(point.x + point.width).toBeLessThanOrEqual(plotWidth);
  }
  await probe(page, "focusEngine", [{ seriesKey: "gpu", dataIndex: 1, dataKey: "09-02" }]);
  await page.waitForTimeout(220);
  for (const shape of await probe(page, "shapes")) expect(shape.opacity).toBe(!shape.line && shape.series === "gpu" && shape.key === "09-02" ? 1 : 0.3);
});

test("横向滚动后悬停保留当前提示，继续滚动关闭旧提示", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-375", "手机视口提供横向滚动");
  await page.goto("/tests/fixtures/chart-engine/focus.html");
  await probe(page, "init", ["normal"]);
  const plot = page.locator("#public .qizhi-chart__plot");
  await expect(plot).toHaveAttribute("data-ready", "true");
  const shape = (await probe(page, "shapes")).find((item: { key: string }) => item.key === "09-03");
  await pointerAt(page, plot, shape.x + shape.width / 2, shape.y + shape.height / 2, "move");
  const scroll = page.locator("#public .qizhi-chart__scroll");
  expect(await scroll.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toContainText("09-03");

  // 模拟已更新布局的滚动通知晚于指针事件送达。
  await scroll.evaluate(node => {
    node.dispatchEvent(new Event("scroll"));
    return new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await expect(tooltip).toContainText("09-03");

  await scroll.evaluate(node => { node.scrollLeft = 0; });
  await expect(tooltip).toHaveCount(0);
});
