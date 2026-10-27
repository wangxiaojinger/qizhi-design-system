import { expect, test } from "@playwright/test";

test("工程表格：确定列宽、文本全文、局部加载和容器固定列", async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/tests/e2e/fixtures/table-engineering.html");
  const table = page.getByRole("table", { name: "标准列表", exact: true });
  await expect(table).toBeVisible();
  const getWidths = () => table.locator("col").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
  await expect.poll(async () => (await getWidths())[1]).toBeGreaterThanOrEqual(180);
  const original = await getWidths();
  expect(original[1]).toBeLessThanOrEqual(261);
  expect(original[2]).toBeLessThanOrEqual(321);
  expect(original[5]).toBe(88);
  const scroller = table.locator("..");
  const size = await scroller.evaluate((node) => ({ client: node.clientWidth, scroll: node.scrollWidth }));
  const frame = await table.evaluate((node) => {
    const style = getComputedStyle(node);
    return parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  });
  if (size.client >= 684 + frame) {
    expect(Math.abs(original.reduce((a, b) => a + b, 0) + frame - size.client)).toBeLessThanOrEqual(1);
    expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  }
  else expect(size.scroll).toBeGreaterThan(size.client);
  await scroller.evaluate((node) => { node.scrollLeft = node.scrollWidth; });
  await table.getByRole("button", { name: "Open", exact: true }).first().click();
  const reachable = await table.getByRole("button", { name: "Open", exact: true }).first().boundingBox();
  const visibleScroller = await scroller.boundingBox();
  expect(reachable!.x + reachable!.width).toBeLessThanOrEqual(visibleScroller!.x + visibleScroller!.width + 1);
  await scroller.evaluate((node) => { node.scrollLeft = 0; });
  // Programmatic scrolling can move another text cell under the stationary
  // pointer. End that hover before the separate keyboard-focus assertions.
  await page.mouse.move(0, 0);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  const leaf = table.locator('tbody td[data-column-key="name"] .qizhi-table__text').first();
  await expect(leaf).toHaveAttribute("tabindex", "0");
  const lineBox = await leaf.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(node);
    const lines = [...range.getClientRects()].filter((line) => line.top < box.bottom - 1);
    return { height: box.height, lines: lines.map((line) => ({ top: line.top - box.top, bottom: line.bottom - box.top })) };
  });
  expect(lineBox.height).toBeGreaterThanOrEqual(43);
  expect(lineBox.height).toBeLessThanOrEqual(45);
  expect(lineBox.lines.every((line) => line.top >= -0.1 && line.bottom <= lineBox.height + 0.1)).toBe(true);
  await scroller.screenshot({ path: testInfo.outputPath("text-lines.png") });
  await leaf.focus();
  await expect(page.getByRole("tooltip")).toContainText("gjpqy_");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await leaf.click();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await leaf.click();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await leaf.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "切换文本", exact: true }).click();
  await expect(table.locator("tbody tr").first().locator("td").nth(1)).toHaveText("Short");
  await expect(table.locator("tbody tr").first().locator("td").nth(1).locator("[tabindex]")).toHaveCount(0);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  expect(await getWidths()).toEqual(original);
  await page.getByRole("button", { name: "切换语言", exact: true }).click();
  await expect(table.getByRole("columnheader", { name: /^Name/ })).toBeVisible();
  expect(await getWidths()).toEqual(original);
  await page.getByRole("button", { name: "切换加载", exact: true }).click();
  const overlay = page.locator("#main [role=status]");
  await expect(overlay).toHaveText("数据加载中");
  const headerBox = await table.locator("thead").boundingBox();
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);
  expect(await getWidths()).toEqual(original);
  await page.getByRole("button", { name: "切换加载", exact: true }).click();
  for (const expectedWidth of [640, 641]) {
    await page.getByRole("button", { name: "切换容器", exact: true }).click();
    const actualWidth = await scroller.evaluate((node) => node.clientWidth);
    await expect.poll(async () => table.locator("thead .is-fixed-left").count())
      .toBe(actualWidth <= 640 ? 0 : 2);
    if (actualWidth === expectedWidth) expect(actualWidth).toBe(expectedWidth);
  }
  await page.getByRole("button", { name: "切换空态", exact: true }).click();
  for (const id of ["main", "custom"]) {
    const gaps = await page.locator(`#${id} .qizhi-table__empty-cell`).evaluate((node) => {
      const cell = node.getBoundingClientRect();
      const image = node.querySelector(".qizhi-empty__image")!.getBoundingClientRect();
      const description = node.querySelector(".qizhi-empty__description")!.getBoundingClientRect();
      return [image.top - cell.top, cell.bottom - description.bottom];
    });
    expect(gaps.every((gap) => Math.abs(gap - 36) <= 1)).toBe(true);
  }
  await page.getByRole("button", { name: "切换加载", exact: true }).click();
  await expect(page.locator("#main .qizhi-empty")).toHaveCount(0);
  await page.getByRole("button", { name: "切换表头", exact: true }).click();
  await expect(table.locator("thead")).toHaveCount(0);
  const top = await overlay.evaluate((node) => Number.parseFloat(getComputedStyle(node).top));
  const bodyTop = await table.evaluate((node) => (node as HTMLTableElement).tBodies[0].getBoundingClientRect().top - node.closest(".qizhi-table")!.getBoundingClientRect().top);
  expect(top).toBeCloseTo(bodyTop, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("engineering.png"), fullPage: true });
  expect(errors).toEqual([]);
  const dynamicLeaf = page.getByRole("table", { name: "动态文本测量", exact: true })
    .locator(".qizhi-table__text");
  await expect(dynamicLeaf).toHaveAttribute("tabindex", "0");
  await dynamicLeaf.focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.getByRole("button", { name: "切换文本容器", exact: true }).click();
  await expect(dynamicLeaf).not.toHaveAttribute("tabindex");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.getByRole("button", { name: "切换文本容器", exact: true }).click();
  await expect(dynamicLeaf).toHaveAttribute("tabindex", "0");
});

test("工程表格：body 挂载的弹窗与抽屉不依赖页面祖先", async ({ page }, testInfo) => {
  await page.goto("/tests/e2e/fixtures/table-engineering.html");
  for (const [button, label] of [["打开弹窗", "弹窗表格"], ["打开抽屉", "抽屉表格"]]) {
    await page.getByRole("button", { name: button, exact: true }).click();
    const dialog = page.getByRole("dialog");
    const table = dialog.getByRole("table", { name: label, exact: true });
    await expect(table).toBeVisible();
    const geometry = await table.locator("..").evaluate((node) => ({ width: node.clientWidth, viewport: innerWidth }));
    expect(geometry.width).toBeLessThanOrEqual(geometry.viewport);
    await expect.poll(async () => table.locator("thead .is-fixed-left").count()).toBe(geometry.width <= 640 ? 0 : 2);
    const text = table.locator('tbody td[data-column-key="name"] .qizhi-table__text').first();
    await text.focus();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await expect(page.getByRole("tooltip")).toHaveCSS("opacity", "1");
    const popup = await page.getByRole("tooltip").boundingBox();
    expect(popup!.x).toBeGreaterThanOrEqual(7);
    expect(popup!.x + popup!.width).toBeLessThanOrEqual(page.viewportSize()!.width - 7);
    await dialog.screenshot({ path: testInfo.outputPath(`${label}.png`) });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await text.click();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await dialog.getByRole("button", { name: /关闭/ }).focus();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /关闭/ }).click();
    await expect(dialog).toHaveCount(0);
  }
});

test("1920 宽屏保持名称说明上限、操作紧凑并分摊剩余空间", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "宽屏几何仅需一个浏览器实例");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/tests/e2e/fixtures/table-engineering.html");
  const table = page.getByRole("table", { name: "标准列表", exact: true });
  await expect(table).toBeVisible();
  await expect.poll(async () => table.locator("col").nth(1).evaluate((node) => node.getBoundingClientRect().width)).toBe(260);
  const columns = await table.locator("col").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
  expect(columns[2]).toBe(320);
  expect(columns[5]).toBe(88);
  const available = await table.locator("..").evaluate((node) => node.clientWidth);
  const frame = await table.evaluate((node) => {
    const style = getComputedStyle(node);
    return parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  });
  expect(Math.abs(columns.reduce((a, b) => a + b, 0) + frame - available)).toBeLessThanOrEqual(1);
  expect(columns[3]).toBeCloseTo(columns[4], 1);
  await page.screenshot({ path: testInfo.outputPath("wide-1920.png"), fullPage: true });
});
