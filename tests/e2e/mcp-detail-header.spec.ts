import { expect, test } from "@playwright/test";

const workbenchBaseUrl = process.env.QIZHI_WORKBENCH_BASE_URL;

test("Skill 使用完整业务头部", async ({ page }, testInfo) => {
  test.skip(!workbenchBaseUrl, "requires the external workbench preview via QIZHI_WORKBENCH_BASE_URL");
  await page.goto(workbenchBaseUrl!);
  await page.getByRole("menuitem", { name: "Agent", exact: true }).click();
  await page.getByRole("button", { name: "查看 research-summarizer 详情", exact: true }).click();
  await page.getByLabel("创建人", { exact: true }).hover();
  const tip = page.getByRole("tooltip", { name: "创建人", exact: true });
  await expect(tip).toHaveCSS("opacity", "1");
  await page.screenshot({ path: testInfo.outputPath("skill-tooltip.png") });
  const version = page.getByRole("button", { name: "查看当前版本 V1" });
  await version.click();
  const drawer = page.getByRole("dialog", { name: "版本列表" });
  await expect(drawer.getByRole("table", { name: "版本信息" })).toBeVisible();
  const section = drawer.locator(".qizhi-service-detail-header__version-section");
  await expect(section).toHaveCSS("padding", "16px");
  await expect(section).toHaveCSS("border-radius", "8px");
  await expect(section).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(tip).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath("skill-versions.png") });
  await page.keyboard.press("Escape");
  await expect(version).toBeFocused();
  await page.getByRole("tab", { name: "文件", exact: true }).click();
  await expect(page.getByRole("region", { name: "Skill.md 文件内容" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("MCP 审计提示及只读版本抽屉", async ({ page }, testInfo) => {
  test.skip(!workbenchBaseUrl, "requires the external workbench preview via QIZHI_WORKBENCH_BASE_URL");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(workbenchBaseUrl!);
  await page.getByRole("menuitem", { name: "Agent", exact: true }).click();
  await page.getByRole("menuitem", { name: "MCP 托管", exact: true }).click();
  await page.getByRole("row", { name: /科研公告监控/ }).getByRole("button", { name: "详情", exact: true }).click();
  for (const label of ["创建人", "创建时间"]) {
    const icon = page.getByLabel(label, { exact: true });
    await icon.hover();
    const tip = page.getByRole("tooltip", { name: label, exact: true });
    await expect(tip).toBeVisible();
    await expect(tip).toHaveCSS("opacity", "1");
    await expect(tip).toHaveText(label);
    const rect = await tip.boundingBox();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.y).toBeGreaterThanOrEqual(0);
    await page.screenshot({ path: testInfo.outputPath(`${label}.png`) });
    await page.mouse.move(0, 0);
    await icon.focus();
    await expect(tip).toBeVisible();
    await icon.press("Tab");
    await page.getByRole("button", { name: /查看部署版本/ }).focus();
    await expect(tip).toBeHidden();
  }
  const version = page.getByRole("button", { name: /查看部署版本/ });
  await version.click();
  const drawer = page.getByRole("dialog", { name: "版本列表" });
  await expect(drawer).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(drawer.getByRole("table", { name: "版本信息" })).toBeVisible();
  await expect(drawer.getByText("当前版本")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("版本列表.png") });
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(version).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("公共头部 Demo 保留版本抽屉与回滚交互", async ({ page }, testInfo) => {
  await page.goto("/#business-detail-header");
  const section = page.locator("#business-detail-header");
  await section.getByLabel("创建人", { exact: true }).hover();
  await expect(page.getByRole("tooltip", { name: "创建人", exact: true })).toBeVisible();
  await section.getByRole("button", { name: /查看部署版本/ }).click();
  const drawer = page.getByRole("dialog", { name: "版本列表" });
  await expect(drawer.getByRole("table", { name: "版本信息" })).toBeVisible();
  const currentRow = drawer.getByRole("row", { name: /V3/ });
  await expect(currentRow.getByText("当前版本")).toHaveClass(/qizhi-tag/);
  await expect(currentRow.getByRole("cell").last()).toHaveText("—");
  await expect(drawer.getByText("V2", { exact: true })).toHaveCount(1);
  const actionEdges = await drawer.locator("tbody tr td:last-child").evaluateAll((cells) => cells.map((cell) => {
    const content = cell.querySelector("button") ?? cell.querySelector("span")!;
    return content.getBoundingClientRect().left + parseFloat(getComputedStyle(content).paddingLeft);
  }));
  expect(actionEdges).toHaveLength(3);
  expect(Math.max(...actionEdges) - Math.min(...actionEdges)).toBeLessThanOrEqual(0.5);
  await page.screenshot({ path: testInfo.outputPath("current-version-tag.png") });
  await drawer.getByRole("button", { name: "回滚至此版本", exact: true }).last().click();
  await expect(drawer).toBeHidden();
  await expect(section.getByRole("button", { name: "查看部署版本 V1" })).toBeFocused();
});
