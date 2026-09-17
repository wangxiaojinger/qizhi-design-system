import { expect, test } from "@playwright/test";

test("图标文档在三档视口保持六类 418 个图标、筛选和布局", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/#components-icon");

  const section = page.locator("#components-icon");
  await expect(section.getByRole("heading", { name: "图标 Icon" })).toBeVisible();
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(418);
  await expect(section.getByRole("radio", { name: "多色图标" })).toHaveCount(1);

  await section.getByRole("radio", { name: "线性图标" }).click();
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(259);
  await section.getByRole("radio", { name: "面性图标" }).click();
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(149);
  await section.getByRole("radio", { name: "多色图标" }).click();
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(10);
  await expect(section.getByRole("button", { name: "复制Skill 服务组件代码" }))
    .toBeVisible();
  await expect(section.getByRole("button", { name: "复制状态-完成组件代码" }).locator("path")).toHaveAttribute("fill", "#52C41A");
  await expect(section.getByRole("button", { name: "复制状态-失败组件代码" }).locator("path")).toHaveAttribute("fill", "#F5222D");
  await section.getByRole("heading", { name: /提示建议类图标/ }).locator("..").screenshot({
    path: testInfo.outputPath(`prompt-fixed-palette-icons-${testInfo.project.name}.png`),
  });
  await section.getByRole("radio", { name: "全部" }).click();
  await expect(section.getByRole("heading", { name: /提示建议类图标 43 个 React 组件/ })).toBeVisible();
  await expect(section.getByRole("heading", { name: /交互按钮类图标 71 个 React 组件/ })).toBeVisible();
  await expect(section.getByRole("heading", { name: /编辑类图标 53 个 React 组件/ })).toBeVisible();
  await expect(section.getByRole("heading", { name: /商标类图标 28 个 React 组件/ })).toBeVisible();
  await expect(section.getByRole("heading", { name: /通用类图标 185 个 React 组件/ })).toBeVisible();
  await expect(section.locator("foreignObject")).toHaveCount(0);
  const whiteLoadingCell = section.getByRole("button", { name: "复制状态-加载-白色组件代码" });
  await expect(whiteLoadingCell).not.toHaveClass(/qizhi-icon-docs__cell--dark-preview/);
  expect(await whiteLoadingCell.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(
    await section.getByRole("button", { name: "复制状态-加载-蓝色组件代码" }).evaluate((node) => getComputedStyle(node).backgroundColor),
  );
  const otherModelFill = await section.getByRole("button", { name: "复制其他模型组件代码" })
    .locator('rect[fill^="url"]')
    .evaluate((node) => getComputedStyle(node).fill);
  expect(otherModelFill).not.toBe("rgb(0, 0, 0)");
  await expect(section.getByRole("button", { name: "复制状态-未开始组件代码" }).locator("circle").nth(1)).toHaveAttribute("fill", "none");
  const filterWhiteSpace = await section.getByRole("radio", { name: "多色图标" }).evaluate((node) =>
    getComputedStyle(node).whiteSpace,
  );
  expect(filterWhiteSpace).toBe("nowrap");

  const firstCell = section.getByRole("button", { name: /复制.+组件代码/ }).first();
  await firstCell.focus();
  await expect(firstCell).toBeFocused();
  await firstCell.press("Enter");
  await expect(page.getByRole("status")).toContainText("复制成功!");
  await expect(firstCell.getByText("已复制")).toHaveCount(0);
  await expect(section.locator(".qizhi-icon-docs__usage")).toHaveCount(0);

  const grids = section.locator(".qizhi-icon-docs__grid");
  await expect(grids).toHaveCount(6);
  const grid = grids.first();
  const expectedColumns = testInfo.project.name === "desktop-1440"
    ? 6
    : testInfo.project.name === "narrow-1024"
      ? 4
      : 2;
  const renderedColumns = await grid.evaluate((node) =>
    getComputedStyle(node).gridTemplateColumns.split(" ").length,
  );
  expect(renderedColumns).toBe(expectedColumns);
  const cellMetrics = await grid.locator(".qizhi-icon-docs__cell").evaluateAll((cells) =>
    cells.map((cell) => {
      const rect = cell.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  );
  expect(cellMetrics.every(({ width, height }) => Math.abs(width - height) <= 1)).toBe(true);
  const promptCellMetrics = await grids.nth(1).locator(".qizhi-icon-docs__cell").evaluateAll((cells) =>
    cells.map((cell) => {
      const rect = cell.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  );
  expect(promptCellMetrics).toHaveLength(43);
  expect(promptCellMetrics.every(({ width, height }) => Math.abs(width - height) <= 1)).toBe(true);
  for (const [index, count] of [[2, 71], [3, 53]] as const) {
    const metrics = await grids.nth(index).locator(".qizhi-icon-docs__cell").evaluateAll((cells) => cells.map((cell) => {
      const rect = cell.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    expect(metrics).toHaveLength(count);
    expect(metrics.every(({ width, height }) => Math.abs(width - height) <= 1)).toBe(true);
    expect(await grids.nth(index).evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  for (const [index, count] of [[4, 28], [5, 185]] as const) {
    const metrics = await grids.nth(index).locator(".qizhi-icon-docs__cell").evaluateAll((cells) => cells.map((cell) => {
      const rect = cell.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    expect(metrics).toHaveLength(count);
    expect(metrics.every(({ width, height }) => Math.abs(width - height) <= 1)).toBe(true);
    expect(await grids.nth(index).evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  const edgeMetrics = await grid.evaluate((node) => {
    const gridRect = node.getBoundingClientRect();
    const cellRect = node.querySelector(".qizhi-icon-docs__cell")!.getBoundingClientRect();
    return { gridLeft: gridRect.left, cellLeft: cellRect.left };
  });
  expect(Math.abs(edgeMetrics.gridLeft - edgeMetrics.cellLeft)).toBeLessThanOrEqual(1);
  const iconColor = await firstCell.locator("svg").evaluate((node) => getComputedStyle(node).color);
  const cellColor = await firstCell.evaluate((node) => getComputedStyle(node).color);
  const text1Color = await section.evaluate((node) => getComputedStyle(node).getPropertyValue("--color-text-1").trim());
  expect(iconColor).toBe(text1Color);
  const iconPathOpacity = await firstCell.locator("svg path").first().evaluate((node) =>
    getComputedStyle(node).fillOpacity,
  );
  expect(iconPathOpacity).toBe("1");
  await firstCell.hover();
  await expect.poll(() => firstCell.locator("svg").evaluate((node) =>
    node.getBoundingClientRect().width,
  )).toBeGreaterThan(44.5);
  const hoveredIcon = await firstCell.locator("svg").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { width: rect.width, height: rect.height, color: getComputedStyle(node).color };
  });
  expect(Math.abs(hoveredIcon.width - 44.8)).toBeLessThanOrEqual(0.2);
  expect(Math.abs(hoveredIcon.height - 44.8)).toBeLessThanOrEqual(0.2);
  expect(hoveredIcon.color).toBe(iconColor);
  expect(await firstCell.evaluate((node) => getComputedStyle(node).color)).toBe(cellColor);
  expect(await grid.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  expect(await grids.nth(1).evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(section.getByRole("table", { name: "Icon API" })).toBeVisible();
  await expect(section.getByText(/尺寸和颜色可通过 className、style 或父级 CSS 继承/)).toBeVisible();
  await section.screenshot({ path: testInfo.outputPath(`direction-icons-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test("商标类与通用类支持语义检索、复制和局部截图", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#components-icon");
  const section = page.locator("#components-icon");
  const search = section.getByRole("searchbox", { name: "搜索图标" });

  await search.fill("RobotType");
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(4);
  await section.getByRole("heading", { name: /商标类图标/ }).locator("..").screenshot({
    path: testInfo.outputPath(`trademark-icons-${testInfo.project.name}.png`),
  });
  await section.getByRole("button", { name: "复制机器人-类型一组件代码" }).click();
  await expect(page.getByRole("status")).toHaveText("复制成功!<RobotType1Icon />");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    "<RobotType1Icon />",
  );

  await search.fill("CloudDownload");
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(2);
  await section.getByRole("heading", { name: /通用类图标/ }).locator("..").screenshot({
    path: testInfo.outputPath(`general-icons-${testInfo.project.name}.png`),
  });
  await section.getByRole("button", { name: "复制云下载组件代码" }).click();
  await expect(page.getByRole("status")).toHaveText("复制成功!<CloudDownloadIcon />");
});

test("交互按钮与编辑类支持检索、复制和局部截图", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#components-icon");
  const section = page.locator("#components-icon");
  const search = section.getByRole("searchbox", { name: "搜索图标" });

  await search.fill("UploadIcon");
  const upload = section.getByRole("button", { name: "复制上传组件代码" });
  await expect(upload).toBeVisible();
  await expect(upload.locator("path")).toHaveAttribute("fill", "currentColor");
  await upload.click();
  await expect(page.getByRole("status")).toHaveText("复制成功!<UploadIcon />");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    "<UploadIcon />",
  );
  await section.getByRole("heading", { name: /交互按钮类图标/ }).locator("..").screenshot({
    path: testInfo.outputPath(`interaction-upload-icon-${testInfo.project.name}.png`),
  });

  await search.fill("circleAction");
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(8);
  await section.getByRole("heading", { name: /交互按钮类图标/ }).locator("..").screenshot({
    path: testInfo.outputPath(`interaction-icons-${testInfo.project.name}.png`),
  });
  const circleClose = section.getByRole("button", { name: "复制圆形-关闭组件代码" });
  await circleClose.click();
  await expect(page.getByRole("status")).toHaveText("复制成功!<CircleCloseIcon />");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    "<CircleCloseIcon />",
  );

  await search.fill("tag");
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(4);
  await section.getByRole("heading", { name: /编辑类图标/ }).locator("..").screenshot({
    path: testInfo.outputPath(`edit-icons-${testInfo.project.name}.png`),
  });
  await section.getByRole("button", { name: "复制标签-单标签组件代码" }).click();
  await expect(page.getByRole("status")).toHaveText("复制成功!<TagIcon />");
});

test("方向图标支持中英文搜索、无结果恢复和复制", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#components-icon");
  const section = page.locator("#components-icon");
  const search = section.getByRole("searchbox", { name: "搜索图标" });

  await search.fill("向下实心箭头");
  await expect(section.getByRole("button", { name: "复制向下箭头（填充）组件代码" })).toBeVisible();
  await expect(section.getByRole("button", { name: /复制.+组件代码/ })).toHaveCount(1);
  await search.fill("不存在的旋转火箭图标");
  await expect(section.getByText("没有匹配的方向图标")).toBeVisible();
  await search.fill("ArrowRightAltIcon");
  const result = section.getByRole("button", { name: "复制向右箭头（样式二）组件代码" });
  await result.click();
  const toast = page.getByRole("status");
  await expect(toast).toHaveText("复制成功!<ArrowRightAltIcon />");
  await expect(result.getByText("已复制")).toHaveCount(0);
  await toast.screenshot({ path: testInfo.outputPath(`direction-icon-copy-toast-${testInfo.project.name}.png`) });
  const toastBox = await toast.boundingBox();
  expect(toastBox).not.toBeNull();
  expect(toastBox!.x).toBeGreaterThanOrEqual(0);
  expect(toastBox!.x + toastBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(Math.abs(toastBox!.x + toastBox!.width / 2 - page.viewportSize()!.width / 2)).toBeLessThanOrEqual(1);
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    "<ArrowRightAltIcon />",
  );

  await search.fill("成功状态");
  const promptResult = section.getByRole("button", { name: "复制状态-完成组件代码" });
  await promptResult.click();
  await expect(toast).toHaveText("复制成功!<StatusSuccessIcon />");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    "<StatusSuccessIcon />",
  );

  await search.fill("ExpandCollapseRightDiagonalExpandedFilledIcon");
  const compatibilityResult = section.getByRole("button", { name: "复制右斜向展开（填充）组件代码" });
  await compatibilityResult.click();
  await expect(toast).toHaveText("复制成功!<ExpandRightDiagonalFilledIcon />");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("<ExpandRightDiagonalFilledIcon />");
});
