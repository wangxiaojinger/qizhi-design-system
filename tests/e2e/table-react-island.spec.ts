import { expect, test } from "@playwright/test";

test("Table 保持十二组 Demo、核心交互和三档响应式", async ({ page }, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-table", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "表格 Table" })).toBeVisible();
  await expect(page.locator("#component-table article.codebox-wrapper")).toHaveCount(13);
  await expect(page.locator("#table-basic tbody tr")).toHaveCount(3);
  const demoTables = page.locator("#component-table article.codebox-wrapper .qizhi-table table");
  expect(await demoTables.count()).toBeGreaterThanOrEqual(13);
  for (const table of await demoTables.all()) {
    const cells = table.locator(":scope > tbody > tr:last-child > td");
    for (const cell of await cells.all()) {
      await expect(cell, "每个表格 Demo 最后一行保留底部分割线").toHaveCSS("border-bottom-width", "1px");
      await expect(cell).toHaveCSS("border-bottom-style", "solid");
    }
  }
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
  const basicNameLink = page.getByRole("button", { name: "约翰·布朗", exact: true });
  const basicAgeCell = page.locator("#table-basic tbody tr").first().locator("td").nth(1);
  const basicDeleteLink = page.getByRole("button", { name: "删除 约翰·布朗" });
  await expect(basicNameLink).toHaveCSS("color", await basicAgeCell.evaluate((node) => getComputedStyle(node).color));
  await expect(basicDeleteLink).toHaveCSS("color", "rgb(134, 144, 156)");
  await basicNameLink.hover();
  await expect(basicNameLink).toHaveCSS("color", "rgb(87, 135, 255)");
  await expect(basicNameLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.mouse.down();
  await expect(basicNameLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.mouse.up();
  const basicInviteLink = page.getByRole("button", { name: "邀请 约翰·布朗" });
  await basicInviteLink.hover();
  await expect(basicInviteLink).toHaveCSS("color", "rgb(87, 135, 255)");
  await expect(basicInviteLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const firstBasicRow = page.locator("#table-basic tbody tr").first();
  const secondBasicRow = page.locator("#table-basic tbody tr").nth(1);
  await expect(firstBasicRow.locator(".qizhi-tag")).toHaveCount(3);
  await expect(firstBasicRow.locator(".qizhi-tag-gray")).toHaveCount(0);
  await expect(firstBasicRow.locator(".qizhi-tag").first()).toHaveCSS(
    "color",
    "rgb(78, 89, 105)",
  );
  await expect(firstBasicRow.getByText("+2", { exact: true })).toBeVisible();
  await firstBasicRow.getByText("+2", { exact: true }).hover();
  await expect(page.getByRole("tooltip")).toContainText("设计系统");
  await expect(page.getByRole("tooltip")).toContainText("可访问性");
  const longTag = firstBasicRow.locator(".qizhi-tag", {
    hasText: "资深前端开发工程师",
  });
  await expect(longTag).toHaveAttribute("aria-expanded", "false");
  await longTag.hover();
  await expect(page.getByRole("tooltip", {
    name: "资深前端开发工程师",
    exact: true,
  })).toBeVisible();
  expect((await firstBasicRow.boundingBox())?.height).toBe((await secondBasicRow.boundingBox())?.height);
  await page.locator("#table-basic tbody tr").first().hover();
  await expect(page.locator("#table-basic tbody tr").first().locator("td").first()).toHaveCSS("background-color", "rgb(247, 248, 250)");
  await page.getByRole("button", { name: "邀请 约翰·布朗" }).click();
  await expect(page.locator("#table-basic [aria-live='polite']")).toHaveText("已邀请 约翰·布朗");
  await page.getByRole("button", { name: "删除 约翰·布朗" }).click();
  await expect(page.locator("#table-basic tbody tr")).toHaveCount(2);

  const salaryHeader = page.locator("#table-sort th", { hasText: "薪水" });
  const salarySort = salaryHeader.getByRole("button");
  await expect(page.locator("#table-sort [aria-live='polite']")).toHaveCount(0);
  await expect(page.locator("#table-sort tbody tr").first()).toContainText("23000");
  await salaryHeader.locator(".qizhi-table__sorter-target").hover();
  await expect(page.getByRole("tooltip", {
    name: "点击升序排序",
    exact: true,
  })).toBeVisible();
  const salaryBox = await salaryHeader.boundingBox();
  expect(salaryBox).not.toBeNull();
  const resizeHandle = salaryHeader.getByRole("separator");
  const resizeHitWidth = await resizeHandle.count() ? await resizeHandle.evaluate((node) => node.getBoundingClientRect().width) : 0;
  // Reserve the edge only when business configuration enables resizing.
  await salaryHeader.click({
    position: { x: salaryBox!.width - resizeHitWidth - 8, y: salaryBox!.height / 2 },
  });
  await expect(page.locator("#table-sort tbody tr").first()).toContainText("17000");
  await salarySort.click();
  await expect(page.locator("#table-sort .qizhi-table__sorter-icon")).toHaveCount(8);
  await expect(page.locator("#table-sort .qizhi-table__sorter svg path")).toHaveCount(8);
  await expect(page.locator("#table-sort .qizhi-table__sorter").first()).toHaveCSS("color", "rgb(134, 144, 156)");
  await expect(page.locator("#table-sort .qizhi-table__sorter-icon path").first()).toHaveCSS("fill-opacity", "1");
  await expect(page.locator("#table-sort tbody tr").first()).toContainText("27000");
  const nameSort = page.locator("#table-sort th", { hasText: "姓名" })
    .getByRole("button");
  await nameSort.hover();
  await expect(page.getByRole("tooltip", {
    name: "点击降序排序",
    exact: true,
  })).toBeVisible();
  await page.locator("#table-selection button[role='radio']", { hasText: "单选框" }).click();
  await page.locator("#table-selection .qizhi-radio:not(.qizhi-radio-disabled)").first().click();
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
  await expect(page.locator("#table-fixed tbody tr").last().locator("td").first()).toHaveCSS("border-bottom-width", "1px");
  const fixedTable = page.locator("#table-fixed .qizhi-table");
  const fixedScroller = page.locator("#table-fixed .qizhi-table__scroll");
  const fixedViewLink = page.locator("#table-fixed").getByRole("button", {
    name: "查看",
  }).first();
  await fixedViewLink.hover();
  await expect(fixedViewLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const fixedWidth = await fixedScroller.evaluate((node) => node.clientWidth);
  if (fixedWidth > 640) await expect(fixedViewLink.locator("xpath=ancestor::td")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(fixedTable).not.toHaveClass(/has-(left|right)-fixed-shadow/);
  if (fixedWidth > 640) expect(await page.locator("#table-fixed th.is-fixed-left").evaluate((node) => getComputedStyle(node, "::before").boxShadow)).toBe("none");
  await fixedScroller.evaluate((node) => { node.scrollLeft = 120; node.dispatchEvent(new Event("scroll")); });
  if (fixedWidth > 640) {
    await expect(fixedTable).toHaveClass(/has-left-fixed-shadow/);
    expect(await page.locator("#table-fixed th.is-fixed-left").evaluate((node) => getComputedStyle(node, "::before").boxShadow)).toContain("rgba(29, 33, 41, 0.18)");
  } else {
    await expect(page.locator("#table-fixed th.is-fixed-left")).toHaveCount(0);
    await expect(fixedTable).not.toHaveClass(/has-left-fixed-shadow/);
  }

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

test("Table 显式自然换行与内置两行省略及按需全文", async ({ page }) => {
  await page.goto("/#component-table", { waitUntil: "domcontentloaded" });

  const contentDemo = page.locator("#table-content");
  const wrappedTableCell = contentDemo.locator("tbody tr").first().locator(".qizhi-table__td").nth(1);
  const wrappedCell = wrappedTableCell.locator(".qizhi-table__cell");
  const ellipsisCell = contentDemo.locator("tbody tr").first().locator(".qizhi-table__cell").nth(2);

  const wrappedGeometry = await wrappedCell.evaluate((node) => ({
    height: node.getBoundingClientRect().height,
    lineHeight: Number.parseFloat(getComputedStyle(node).lineHeight),
  }));
  expect(wrappedGeometry.height).toBeGreaterThan(wrappedGeometry.lineHeight * 1.5);
  await expect(wrappedCell).toHaveCSS("white-space", "normal");
  const defaultLeaf = ellipsisCell.locator(".qizhi-table__text.is-rows-2");
  await expect(defaultLeaf).toBeVisible();
  await expect(defaultLeaf).toHaveAttribute("tabindex", "0");
  await defaultLeaf.focus();
  await expect(page.getByRole("tooltip")).toContainText("未配置 Table 或列级 ellipsis");
});

test("嵌套表格单元格不继承展开容器的水平缩进", async ({ page }) => {
  await page.goto("/#component-table", { waitUntil: "domcontentloaded" });

  const nestedTable = page.locator("#table-nested .qizhi-table .qizhi-table");
  const nestedNameCell = nestedTable.locator("tbody .qizhi-table__td").first();
  const expectedInlinePadding = (page.viewportSize()?.width ?? 0) <= 600 ? "12px" : "16px";

  await expect(nestedTable).toBeVisible();
  await expect(nestedNameCell).toHaveCSS("padding-left", expectedInlinePadding);
  await expect(nestedNameCell).toHaveCSS("padding-right", expectedInlinePadding);
  expect(await nestedNameCell.evaluate((node) => node.getBoundingClientRect().height)).toBeLessThan(80);
});

test("Table 排序图标的可见箭头为 8px 且间距为 4px", async ({ page }) => {
  await page.goto("/#component-table", { waitUntil: "domcontentloaded" });

  const icons = page.locator("#table-sort .qizhi-table__sorter").first().locator(".qizhi-table__sorter-icon");
  await expect(icons).toHaveCount(2);
  const geometry = await icons.evaluateAll((nodes) => {
    const [ascend, descend] = nodes.map((node) => node.querySelector("path")!.getBoundingClientRect());
    return {
      arrowWidth: ascend.width,
      arrowHeight: ascend.height,
      visibleGap: descend.top - ascend.bottom,
    };
  });
  expect(geometry.arrowWidth).toBe(8);
  expect(geometry.arrowHeight).toBe(4);
  expect(geometry.visibleGap).toBe(4);
});

test("Table 三档 size 通过单元格内边距控制密度", async ({ page }) => {
  await page.goto("/#component-table", { waitUntil: "domcontentloaded" });

  const basicHeader = page.locator("#table-basic .qizhi-table__th").first();
  const basicCell = page.locator("#table-basic .qizhi-table__td").first();
  await expect(basicHeader).toHaveCSS("padding-top", "16px");
  await expect(basicHeader).toHaveCSS("padding-bottom", "16px");
  await expect(basicCell).toHaveCSS("padding-top", "16px");
  await expect(basicCell).toHaveCSS("padding-bottom", "16px");

  const propsDemo = page.locator("#table-props");
  const propsHeader = propsDemo.locator(".qizhi-table__th:not(.qizhi-table__selection)").first();
  const propsCell = propsDemo.locator(".qizhi-table__td").first();
  await expect(propsHeader).toHaveCSS("padding-top", "16px");
  await expect(propsCell).toHaveCSS("padding-top", "16px");
  await propsDemo.getByRole("radio", { name: "中等", exact: true }).click();
  await expect(propsHeader).toHaveCSS("padding-top", "12px");
  await expect(propsCell).toHaveCSS("padding-top", "12px");
  await propsDemo.getByRole("radio", { name: "小", exact: true }).click();
  await expect(propsHeader).toHaveCSS("padding-top", "8px");
  await expect(propsCell).toHaveCSS("padding-top", "8px");
});

test("Table 组件 Token 与旧尺度变量均可覆盖既有职责", async ({ page }) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(request.url()));

  await page.goto("/#component-table", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: `:root {
      --component-table-header-background: rgb(1, 2, 3);
      --component-table-cell-padding-block-large: 20px;
      --component-table-cell-padding-inline: 18px;
      --component-table-cell-padding-inline-compact: 10px;
      --component-table-row-hover-background: rgb(4, 5, 6);
      --component-table-row-selected-background: rgb(7, 8, 9);
      --component-table-fixed-z-index: 7;
    }`,
  });

  const basicHeader = page.locator("#table-basic .qizhi-table__th").first();
  const basicCell = page.locator("#table-basic .qizhi-table__td").first();
  await expect(basicHeader).toHaveCSS("background-color", "rgb(1, 2, 3)");
  await expect(basicCell).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(basicCell).toHaveCSS("padding-top", "20px");
  await expect(basicCell).toHaveCSS(
    "padding-left",
    (page.viewportSize()?.width ?? 0) <= 600 ? "10px" : "18px",
  );

  await page.locator("#table-basic tbody tr").first().hover();
  await expect(basicCell).toHaveCSS("background-color", "rgb(4, 5, 6)");

  const selectionRow = page.locator("#table-selection tbody tr").first();
  await selectionRow.locator(".qizhi-checkbox").click();
  await basicHeader.hover();
  await expect(selectionRow.locator(".qizhi-table__td").first())
    .toHaveCSS("background-color", "rgb(7, 8, 9)");
  const fixedWidth = await page.locator("#table-fixed .qizhi-table__scroll").evaluate((node) => node.clientWidth);
  if (fixedWidth > 640) {
    await expect(page.locator("#table-fixed th.is-fixed-left").first()).toHaveCSS("z-index", "7");
  } else {
    await expect(page.locator("#table-fixed th.is-fixed-left")).toHaveCount(0);
  }

  const outerExpandedCell = page.locator("#table-nested .qizhi-table__expanded > td").first();
  const nestedCell = page.locator("#table-nested .qizhi-table__expanded .qizhi-table__td").first();
  await expect(outerExpandedCell).toHaveCSS("padding-left", "64px");
  await expect(nestedCell).toHaveCSS(
    "padding-left",
    (page.viewportSize()?.width ?? 0) <= 600 ? "10px" : "18px",
  );

  await page.addStyleTag({
    content: `:root {
      --component-table-cell-padding-block-large: initial;
      --space-16: 22px;
    }`,
  });
  await expect(basicCell).toHaveCSS("padding-top", "22px");
  expect({ errors, failedRequests }).toEqual({ errors: [], failedRequests: [] });
});
