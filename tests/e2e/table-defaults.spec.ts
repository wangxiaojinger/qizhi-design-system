import { expect, test, type Locator } from "@playwright/test";

const fixed = async (table: Locator) => {
  const width = await table.locator("..").evaluate((node) => node.clientWidth);
  await expect.poll(() => table.locator("thead .is-fixed-left").count()).toBe(width <= 640 ? 0 : 2);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/e2e/fixtures/table-defaults.html");
});

test("显式开启边框计入填充预算，无多余横向滚动且手动尺寸不失真", async ({ page }) => {
  const table = page.locator("#budget table");
  const geometry = () => table.evaluate((node) => {
    const scroller = node.parentElement!;
    const style = getComputedStyle(node);
    const frame = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    return { client: scroller.clientWidth, scroll: scroller.scrollWidth, frame,
      outer: node.getBoundingClientRect().width, column: node.querySelector("col")!.getBoundingClientRect().width };
  });
  await expect.poll(async () => (await geometry()).scroll - (await geometry()).client).toBe(0);
  const initial = await geometry();
  expect(initial.column).toBeCloseTo(initial.client - initial.frame, 0);
  expect(initial.outer).toBeCloseTo(initial.client, 0);
  const handle = table.getByRole("separator");
  await handle.press("Home");
  await handle.press("ArrowRight");
  await expect.poll(async () => (await geometry()).column).toBeCloseTo(128, 0);
  const manual = await geometry();
  expect(manual.outer).toBeCloseTo(128 + manual.frame, 0);
});

test("最小Table默认无边框不调宽，两行提示及业务开启覆盖", async ({ page }, testInfo) => {
  const plain = page.locator("#plain");
  const table = plain.getByRole("table");
  await expect(plain.locator(".qizhi-table")).not.toHaveClass(/is-bordered/);
  await expect(plain.getByRole("separator")).toHaveCount(0);
  await expect(plain.getByRole("button", { name: "列显隐", exact: true })).toHaveCount(0);
  await expect(plain.getByRole("button", { name: /移动列/ })).toHaveCount(0);
  await expect(plain.getByRole("checkbox")).toHaveCount(0);
  await fixed(table);
  const leaf = table.locator('tbody tr:first-child td').nth(1).locator('.qizhi-table__text');
  await expect(leaf).toHaveClass(/is-rows-2/);
  expect(await leaf.evaluate((node) => node.getBoundingClientRect().height))
    .toBeLessThanOrEqual(44);
  await expect(leaf).toHaveAttribute("tabindex", "0");
  await leaf.focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  const short = table.locator('tbody tr:last-child td').nth(1).locator('.qizhi-table__text');
  await expect(short).not.toHaveAttribute("tabindex");
  await expect(table.locator('tbody tr:last-child td').nth(2)).toHaveText("-");
  await expect(table.locator('tbody tr:first-child td').nth(0)).toHaveText("0");
  await expect(table.getByRole("button", { name: "详情", exact: true })).toHaveCount(2);
  await expect(table.locator('tbody tr').first().locator('td').nth(4).locator('.qizhi-table__text')).toHaveCount(0);
  await plain.screenshot({ path: testInfo.outputPath("built-in-defaults.png") });
  await page.getByRole("button", { name: "切换调宽", exact: true }).click();
  await expect(plain.getByRole("separator")).toHaveCount(4);
  const handle = table.getByRole("separator", { name: "调整列宽 模型名称", exact: true });
  const width = () => table.locator('th[data-column-key="name"]').evaluate((node) => node.getBoundingClientRect().width);
  await handle.press("Home");
  await handle.press("ArrowRight");
  await handle.press("ArrowRight");
  const manual = 156;
  await expect.poll(width).toBeCloseTo(manual, 0);
  const geometry = await table.evaluate((node) => [...node.querySelectorAll('thead th[data-column-key]')].map((th) => {
    const td = node.querySelector(`tbody td[data-column-key="${(th as HTMLElement).dataset.columnKey}"]`)!;
    return Math.abs(th.getBoundingClientRect().width - td.getBoundingClientRect().width);
  }));
  expect(geometry.every((delta) => delta <= 1)).toBe(true);
  await page.getByRole("button", { name: "改变容器", exact: true }).click();
  await fixed(table);
  await expect.poll(width).toBeCloseTo(manual, 0);
  const override = page.locator("#override");
  await expect(override.locator(".qizhi-table")).not.toHaveClass(/is-bordered|is-hoverable/);
  await expect(override.getByRole("separator")).toHaveCount(0);
  await expect(override.locator(".qizhi-table__text")).toHaveCount(0);
  await expect(override.locator("thead .is-fixed-left")).toHaveCount(2);
  await plain.screenshot({ path: testInfo.outputPath("explicit-resize.png") });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("最小Table三项列功能独立按需开启，加载空态默认生效", async ({ page }) => {
  const plain = page.locator("#plain");
  await page.getByRole("button", { name: "开启移动显隐", exact: true }).click();
  await expect(plain.getByRole("separator")).toHaveCount(0);
  await expect(plain.getByRole("button", { name: /移动列/ })).toHaveCount(4);
  await plain.getByRole("button", { name: "列显隐", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "列显隐", exact: true });
  await expect(panel.getByRole("spinbutton")).toHaveCount(0);
  expect(await panel.locator(".qizhi-table__column-settings__list").evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
  expect(await panel.locator(".qizhi-checkbox-text").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).whiteSpace === "nowrap"))).toBe(true);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "切换调宽", exact: true }).click();
  await expect(plain.getByRole("separator")).toHaveCount(4);
  await page.getByRole("button", { name: "切换加载", exact: true }).click();
  const loading = plain.locator(".qizhi-table__loading");
  await expect(loading).toHaveAttribute("data-scope", "body");
  const header = await plain.locator("thead").boundingBox();
  const overlay = await loading.boundingBox();
  expect(overlay!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
  await expect(plain.getByRole("button", { name: "详情", exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "切换加载", exact: true }).click();
  await page.getByRole("button", { name: "切换空态", exact: true }).click();
  await expect(plain.locator(".qizhi-table__empty-content")).toHaveCSS("padding-top", "36px");
  await expect(plain.locator(".qizhi-table__empty-content")).toHaveCSS("padding-bottom", "36px");
});

test("弹窗抽屉中的最小Table继承默认值并按容器解除固定", async ({ page }, testInfo) => {
  for (const [button, label] of [["打开弹窗", "弹窗最小默认表格"], ["打开抽屉", "抽屉最小默认表格"]]) {
    await page.getByRole("button", { name: button, exact: true }).click();
    const dialog = page.getByRole("dialog");
    const table = dialog.getByRole("table", { name: label, exact: true });
    await expect(table).toBeVisible();
    await expect(table.getByRole("separator")).toHaveCount(0);
    await fixed(table);
    await expect(table.locator(".qizhi-table__text.is-rows-2").first()).toBeVisible();
    await dialog.screenshot({ path: testInfo.outputPath(`${label}.png`) });
    await dialog.getByRole("button", { name: /关闭/ }).first().click();
    await expect(dialog).toHaveCount(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
