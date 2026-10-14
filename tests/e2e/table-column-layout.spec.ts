import { expect, test } from "@playwright/test";

test("Table 列宽约束、容器变化、隐藏表头与多固定列兼容", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/tests/e2e/fixtures/table-layout.html");
  const widths = () => page.locator("#constrained col").evaluateAll((cols) => cols.map((col) => col.getBoundingClientRect().width));
  await expect.poll(async () => (await widths()).slice(1)).toEqual([96, 120]);
  const original = await widths();
  expect(original[0]).toBeGreaterThanOrEqual(160);
  expect(original[0]).toBeLessThanOrEqual(500);
  await expect(page.locator("#constrained td").nth(1)).toHaveCSS("text-align", "center");
  await expect(page.locator("#constrained .qizhi-table__sort")).toHaveCSS("justify-content", "flex-end");
  const geometry = async () => page.locator("#constrained .qizhi-table__scroll").evaluate((node) => ({ width: node.clientWidth, scroll: node.scrollWidth }));
  const initial = await geometry();
  if (initial.width >= 376) expect(initial.scroll).toBeLessThanOrEqual(initial.width + 1);
  else expect(initial.scroll).toBeGreaterThan(initial.width);
  await page.getByRole("button", { name: "下一页" }).click();
  await expect(page.locator("#constrained tbody")).toContainText("VeryLong");
  expect(await widths()).toEqual(original);
  await page.locator("#constrained").getByRole("button", { name: "按金额升序排序" }).click();
  expect(await widths()).toEqual(original);
  await page.getByRole("button", { name: "切换空态" }).click();
  expect(await widths()).toEqual(original);
  await page.getByRole("button", { name: "切换空态" }).click();
  await page.getByRole("button", { name: "切换加载" }).click();
  await expect(page.locator("#constrained [role=status]")).toBeVisible();
  expect(await widths()).toEqual(original);
  await page.getByRole("button", { name: "切换加载" }).click();
  await page.getByRole("button", { name: "异步更新数据" }).click();
  await expect(page.locator("#constrained tbody")).toContainText("Async");
  expect(await widths()).toEqual(original);
  await page.getByRole("button", { name: "改变容器" }).click();
  await expect.poll(widths).toEqual([160, 96, 120]);
  const small = await geometry();
  expect(small.scroll).toBeGreaterThan(small.width);
  await page.getByRole("button", { name: "切换表头" }).click();
  await expect(page.locator("#constrained thead")).toHaveCount(0);
  expect(await widths()).toEqual([160, 96, 120]);
  await expect.poll(async () => page.locator("#fixed tbody tr").first().locator("td.is-fixed-left").evaluateAll((cells) => Math.abs(Number.parseFloat(getComputedStyle(cells[1]).left) - cells[0].getBoundingClientRect().width))).toBeLessThan(1);
  await expect.poll(async () => page.locator("#fixed tbody tr").first().locator("td.is-fixed-right").evaluateAll((cells) => Math.abs(Number.parseFloat(getComputedStyle(cells[0]).right) - cells[1].getBoundingClientRect().width))).toBeLessThan(1);
  const fixedScroller = page.locator("#fixed .qizhi-table__scroll");
  for (const position of [0, 120, 10000]) {
    await fixedScroller.evaluate((node, left) => { node.scrollLeft = left; }, position);
    const boxes = await page.locator("#fixed tbody tr").first().locator("td:is(.is-fixed-left,.is-fixed-right)").evaluateAll((cells) => cells.map((cell) => { const box = cell.getBoundingClientRect(); return { left: box.left, right: box.right }; }));
    expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left + 1);
    expect(boxes[1].right).toBeLessThanOrEqual(boxes[2].left + 1);
    expect(boxes[2].right).toBeLessThanOrEqual(boxes[3].left + 1);
  }
  await page.getByRole("button", { name: "切换表头" }).click();
  const aligned = await page.locator("#fixed").evaluate((section) => {
    const headers = Array.from(section.querySelectorAll("th"));
    const cells = Array.from(section.querySelectorAll("tbody tr:first-child td"));
    return headers.map((header, index) => Math.abs(header.getBoundingClientRect().width - cells[index].getBoundingClientRect().width));
  });
  expect(aligned.every((difference) => difference <= 1)).toBe(true);
  const compactWidth = await page.locator("#compact table").evaluate((node) => node.getBoundingClientRect().width);
  expect(compactWidth).toBe(376);
  await expect(page.locator("#auto table")).toHaveCSS("table-layout", "auto");
  const alignment = await page.locator("#cell-override .qizhi-table__cell").first().evaluate((node) => {
    const content = node.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(node.firstChild!);
    const text = range.getBoundingClientRect();
    return Math.abs((content.left + content.right) / 2 - (text.left + text.right) / 2);
  });
  expect(alignment).toBeLessThanOrEqual(1);
  expect(await page.locator("#auto col").first().evaluate((node) => node.getBoundingClientRect().width)).toBeGreaterThanOrEqual(80);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("table-layout.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("Table 新布局 Demo 可复制且实际容器不溢出", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-table");
  const demo = page.locator("#table-layout");
  await expect(demo.getByRole("heading", { name: "列宽与自适应", exact: true })).toBeVisible();
  const demoGeometry = await demo.evaluate((node) => ({ width: node.getBoundingClientRect().width, parent: node.parentElement!.getBoundingClientRect().width }));
  expect(demoGeometry.width).toBeLessThanOrEqual(demoGeometry.parent + 1);
  const table = demo.getByRole("table", { name: "受约束的弹性列表" });
  await expect(table).toBeVisible();
  const overflow = await demo.locator(".qizhi-table").evaluateAll((tables) => tables.map((node) => ({ width: node.getBoundingClientRect().width, parent: node.parentElement!.getBoundingClientRect().width })));
  expect(overflow.every((item) => item.width <= item.parent + 1)).toBe(true);
  const fixedTable = demo.getByRole("table", { name: "多个固定列列表" });
  await expect(fixedTable).toBeVisible();
  for (const position of [0, 90, 10000]) {
    await fixedTable.locator("..").evaluate((node, left) => { node.scrollLeft = left; }, position);
    const boxes = await fixedTable.locator("tbody tr").first().locator("td:is(.is-fixed-left,.is-fixed-right)").evaluateAll((cells) => cells.map((cell) => { const box = cell.getBoundingClientRect(); return { left: box.left, right: box.right }; }));
    expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left + 1);
    expect(boxes[1].right).toBeLessThanOrEqual(boxes[2].left + 1);
  }
  await demo.screenshot({ path: testInfo.outputPath("table-layout-demo.png") });
  await demo.getByRole("button", { name: "查看代码" }).click();
  await expect(demo.locator("code")).toContainText("minWidth");
  await expect(demo.locator("code")).toContainText("grow");
  expect(errors).toEqual([]);
});
