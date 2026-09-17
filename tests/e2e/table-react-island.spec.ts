import { expect, test } from "@playwright/test";

test("Table 保持十组 Demo、核心交互和三档响应式", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-table");

  await expect(page.getByRole("heading", { name: "表格 Table" })).toBeVisible();
  await expect(page.locator("#component-table article.codebox-wrapper")).toHaveCount(10);
  await expect(page.locator("#table-basic tbody tr")).toHaveCount(4);
  const basicTable = page.locator("#table-basic .qizhi-table");
  const basicTableElement = page.locator("#table-basic table");
  const basicHeaders = page.locator("#table-basic thead th");
  await expect(basicTable).not.toHaveClass(/is-bordered/);
  await expect(basicTableElement).toHaveCSS("border-top-width", "0px");
  await expect(basicTableElement).toHaveCSS("border-right-width", "0px");
  await expect(basicTableElement).toHaveCSS("border-bottom-width", "0px");
  await expect(basicTableElement).toHaveCSS("border-left-width", "0px");
  await expect(basicHeaders.first(), "旧站表头列间使用 16px 短分割线").toHaveCSS("position", "relative");
  expect(await basicHeaders.first().evaluate((node) => {
    const divider = getComputedStyle(node, "::after");
    return { width: divider.width, height: divider.height, color: divider.backgroundColor };
  })).toEqual({ width: "1px", height: "16px", color: "rgb(229, 230, 235)" });
  await expect(page.locator("#table-basic tbody tr").first().locator("td").first()).toHaveCSS("border-bottom-color", "rgb(242, 243, 245)");
  await page.locator("#table-basic tbody tr").first().hover();
  await expect(page.locator("#table-basic tbody tr").first().locator("td").first()).toHaveCSS("background-color", "rgb(247, 248, 250)");

  await page.locator("#table-sort button", { hasText: "薪水" }).click();
  await expect(page.locator("#table-sort .qizhi-table__sorter-icon")).toHaveCount(8);
  await expect(page.locator("#table-sort .qizhi-table__sorter svg path")).toHaveCount(8);
  await expect(page.locator("#table-sort .qizhi-table__sorter").first()).toHaveCSS("color", "rgb(134, 144, 156)");
  await expect(page.locator("#table-sort .qizhi-table__sorter-icon path").first()).toHaveCSS("fill-opacity", "1");
  await expect(page.locator("#table-sort tbody tr").first()).toContainText("17000");
  await page.locator("#table-selection button[role='radio']", { hasText: "单选框" }).click();
  await page.locator("#table-selection input[type='radio']:not(:disabled)").first().check();
  await expect(page.locator("#table-selection input[type='radio']:checked")).toHaveCount(1);
  const disabledSelectionRow = page.locator("#table-selection input:disabled").locator("xpath=ancestor::tr");
  await expect(disabledSelectionRow).not.toHaveClass(/is-selected/);
  await expect(disabledSelectionRow.locator("td").first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(disabledSelectionRow.locator("td").nth(1)).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const selectionHeader = page.locator("#table-selection thead th");
  await expect(selectionHeader.first()).toHaveCSS("background-color", await selectionHeader.nth(1).evaluate((node) => getComputedStyle(node).backgroundColor));

  await page.locator("#table-expand button[aria-label^='收起']").click();
  await expect(page.locator("#table-expand .qizhi-table__expanded")).toHaveCount(0);
  await page.locator("#table-expand button[aria-label^='展开']").first().click();
  await expect(page.locator("#table-expand .qizhi-table__expanded")).toBeVisible();
  const expandHeader = page.locator("#table-expand thead th");
  await expect(expandHeader.first()).toHaveCSS("background-color", await expandHeader.nth(1).evaluate((node) => getComputedStyle(node).backgroundColor));
  await page.locator("#table-tree button[role='switch']").click();
  await expect(page.locator("#table-tree button[role='switch']")).toHaveAttribute("aria-checked", "false");

  await page.locator("#table-props button[role='switch']", { hasText: "" }).last().click();
  await expect(page.locator("#table-props .qizhi-empty")).toBeVisible();
  await expect(page.locator("#table-sticky, #table-grouped")).toHaveCount(0);
  await expect(page.locator("#table-merge td[rowspan='2']")).toHaveCount(1);
  await expect(page.locator("#table-fixed tbody tr").last().locator("td").first()).toHaveCSS("border-bottom-width", "0px");
  const fixedTable = page.locator("#table-fixed .qizhi-table");
  const fixedScroller = page.locator("#table-fixed .qizhi-table__scroll");
  await expect(fixedTable).not.toHaveClass(/has-(left|right)-fixed-shadow/);
  expect(await page.locator("#table-fixed th.is-fixed-left").evaluate((node) => getComputedStyle(node, "::before").boxShadow)).toBe("none");
  await fixedScroller.evaluate((node) => { node.scrollLeft = 120; node.dispatchEvent(new Event("scroll")); });
  await expect(fixedTable).toHaveClass(/has-left-fixed-shadow/);
  expect(await page.locator("#table-fixed th.is-fixed-left").evaluate((node) => getComputedStyle(node, "::before").boxShadow)).toContain("rgba(29, 33, 41, 0.18)");

  const dragRows = page.locator("#table-drag tbody tr[data-row-key]");
  const firstText = await dragRows.first().innerText();
  await dragRows.first().dragTo(dragRows.nth(1));
  await expect(dragRows.nth(1)).toContainText(firstText.split("\n")[0]);

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const demos = await page.locator("#component-table .demo").evaluateAll((nodes) => nodes.map((node) => ({ id: node.closest("article")?.id, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth })));
  expect(demos.filter((demo) => demo.scrollWidth > demo.clientWidth + 1)).toEqual([]);
  await page.locator("#component-table").screenshot({ path: testInfo.outputPath(`table-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test("Table 三档 size 的表头与内容行保持同高", async ({ page }) => {
  await page.goto("/#component-table");

  const basicHeader = page.locator("#table-basic .qizhi-table__th").first();
  const basicCell = page.locator("#table-basic .qizhi-table__td").first();
  await expect(basicHeader, "默认 Table 表头必须与旧规范同为 56px").toHaveCSS("height", "56px");
  await expect(basicCell, "默认 Table 内容行必须为 56px").toHaveCSS("height", "56px");

  const propsDemo = page.locator("#table-props");
  const propsHeader = propsDemo.locator(".qizhi-table__th").first();
  const propsCell = propsDemo.locator(".qizhi-table__td").first();
  await expect(propsHeader).toHaveCSS("height", "56px");
  await expect(propsCell).toHaveCSS("height", "56px");
  await propsDemo.getByRole("radio", { name: "中等 48px" }).click();
  await expect(propsHeader).toHaveCSS("height", "48px");
  await expect(propsCell).toHaveCSS("height", "48px");
  await propsDemo.getByRole("radio", { name: "小 40px" }).click();
  await expect(propsHeader).toHaveCSS("height", "40px");
  await expect(propsCell).toHaveCSS("height", "40px");
});
