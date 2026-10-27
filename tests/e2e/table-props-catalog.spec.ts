import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/#component-table");
  await expect(page.locator("#table-props").getByRole("table")).toBeVisible();
});

test("属性示例：排序表头在移动与调宽四组合下保持正确左内边距", async ({ page }, testInfo) => {
  const demo = page.locator("#table-props");
  const metrics = () => demo.getByRole("table").evaluate((table) => {
    const th = table.querySelector('th[data-column-key="status"]')!;
    const button = th.querySelector(".qizhi-table__sort")!;
    const text = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)!;
    const range = document.createRange();
    range.selectNodeContents(text);
    const cell = table.querySelector('tbody td[data-column-key="status"] .qizhi-table__cell')!;
    return { delta: range.getBoundingClientRect().left - cell.getBoundingClientRect().left };
  });
  for (const reorder of [true, false]) {
    for (const resize of [true, false]) {
      for (const [label, enabled] of [["列移动", reorder], ["列调宽", resize]] as const) {
        const control = demo.getByRole("switch", { name: label, exact: true });
        if ((await control.getAttribute("aria-checked") === "true") !== enabled) await control.click();
      }
      await expect.poll(async () => (await metrics()).delta).toBeCloseTo(reorder ? 24 : 0, 0);
    }
  }
  await demo.locator(".qizhi-table__scroll").evaluate((node) => {
    if (node.clientWidth < 540) {
      node.scrollLeft = (node.querySelector('th[data-column-key="status"]') as HTMLElement)
        .offsetLeft - 16;
    }
  });
  await demo.locator(".qizhi-table").screenshot({
    path: testInfo.outputPath("sortable-header-padding.png"),
  });
});

test("属性示例：模型目录、列能力组合、隐藏表头后保留手动布局", async ({ page }) => {
  const demo = page.locator("#table-props");
  const table = demo.getByRole("table");
  await expect(table).toContainText("Qways");
  await expect(demo.getByRole("radiogroup", { name: "分页位置" })).toHaveCount(0);
  await expect(demo.locator(".qizhi-pagination")).toHaveClass(/is-bottomRight/);
  const headerHeights = await table.locator("th").evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().height));
  expect(headerHeights.every((height) => height <= 60)).toBe(true);
  const controlHeights = await demo.locator(".table-props-demo__controls label")
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
  expect(controlHeights.every((height) => height <= 24)).toBe(true);
  await expect(demo.getByRole("switch", { name: "斑马纹" })).toHaveCount(0);
  await expect(demo.getByRole("button", { name: /试用/ })).toHaveCount(0);
  await expect(table.locator(".qizhi-table__text.is-rows-2").first()).toBeVisible();
  const header = table.locator("th[data-column-key]").first();
  const key = await header.getAttribute("data-column-key");
  await demo.getByRole("button", { name: "列设置", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "列设置", exact: true });
  const input = panel.getByRole("spinbutton").first();
  await input.fill("220");
  await input.press("Enter");
  await page.keyboard.press("Escape");
  const actual = () => table.locator(`th[data-column-key="${key}"]`)
    .evaluate((node) => node.getBoundingClientRect().width);
  await expect.poll(actual).toBeCloseTo(220, 0);
  await demo.getByRole("switch", { name: "列调宽", exact: true }).click();
  await expect(table.getByRole("separator")).toHaveCount(0);
  expect(await actual()).toBeCloseTo(220, 0);
  await demo.getByRole("switch", { name: "表头", exact: true }).click();
  await expect(table.locator("thead")).toHaveCount(0);
  await demo.getByRole("button", { name: "列设置", exact: true }).click();
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await demo.getByRole("switch", { name: "表头", exact: true }).click();
  expect(await actual()).toBeCloseTo(220, 0);
  await demo.getByRole("switch", { name: "列设置入口", exact: true }).click();
  await expect(demo.getByRole("button", { name: "列设置", exact: true })).toHaveCount(0);
  await expect(table.getByRole("button", { name: /移动列/ }).first()).toBeVisible();
  await demo.getByRole("switch", { name: "列移动", exact: true }).click();
  await expect(table.getByRole("button", { name: /移动列/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test("属性示例：数据区加载保留数据、默认与自定义空态36px留白、容器断点", async ({ page }) => {
  const demo = page.locator("#table-props");
  const table = demo.getByRole("table");
  const rowsBefore = await table.locator("tbody").innerText();
  await demo.getByRole("switch", { name: "加载中", exact: true }).click();
  await expect(demo.locator('.qizhi-table__loading[data-scope="body"]')).toBeVisible();
  expect(await table.locator("tbody").innerText()).toBe(rowsBefore);
  const geometry = await demo.locator(".qizhi-table").evaluate((root) => ({
    header: root.querySelector("thead")!.getBoundingClientRect().bottom,
    loading: root.querySelector(".qizhi-table__loading")!.getBoundingClientRect().top,
  }));
  expect(geometry.loading).toBeGreaterThanOrEqual(geometry.header - 1);
  await demo.getByRole("switch", { name: "加载中", exact: true }).click();
  await demo.getByRole("switch", { name: "无数据", exact: true }).click();
  const empty = demo.locator(".qizhi-table__empty-content");
  await expect(empty).toHaveCSS("padding-top", "36px");
  await expect(empty).toHaveCSS("padding-bottom", "36px");
  await demo.getByRole("switch", { name: "自定义空态", exact: true }).click();
  await expect(empty).toHaveCSS("padding-top", "36px");
  await expect(empty).toHaveCSS("padding-bottom", "36px");
  await demo.getByRole("switch", { name: "无数据", exact: true }).click();
  await demo.locator(".qizhi-table").evaluate((node) => {
    const host = node.parentElement!;
    host.style.width = "330px";
    host.style.maxWidth = "100%";
  });
  await expect(table.locator("th.is-fixed-left,th.is-fixed-right")).toHaveCount(0);
  const scroller = demo.locator(".qizhi-table__scroll");
  expect(await scroller.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
});

test("属性示例：只对实际两行截断提供全文提示，关闭提示不改变行数", async ({ page }) => {
  const demo = page.locator("#table-props");
  const truncated = demo.locator('.qizhi-table__text.is-rows-2[role="button"]').first();
  await expect(truncated).toBeVisible();
  await truncated.scrollIntoViewIfNeeded();
  await truncated.hover();
  await expect(page.locator(".qizhi-table__text-tooltip-popup")).toBeVisible();
  await page.keyboard.press("Escape");
  await demo.getByRole("switch", { name: "全文提示", exact: true }).click();
  await expect(demo.locator('.qizhi-table__text[role="button"]')).toHaveCount(0);
  await expect(demo.locator(".qizhi-table__text.is-rows-2").first()).toBeVisible();
});
