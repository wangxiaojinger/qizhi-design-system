import { expect, test } from "@playwright/test";

test("刷新保留各组件章节和正文偏移，导航仍可正常切换", async ({ page }, info) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  for (const paneId of ["component-chart", "components-button", "component-table"]) {
    await page.goto(`/#${paneId}`);
    const pane = page.locator(`#${paneId}`);
    await expect(pane).toHaveClass(/is-visible/);
    const section = pane.locator(".codebox-wrapper").nth(2);
    await expect(section).toBeVisible();
    const id = await section.getAttribute("id");
    expect(id).toBeTruthy();
    await page.waitForTimeout(500);
    await section.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + 85, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe(`#${id}`);
    const before = await section.evaluate(el => el.getBoundingClientRect().top);
    await page.reload();
    await expect(pane).toHaveClass(/is-visible/);
    await expect(section).toBeVisible();
    await page.waitForTimeout(300);
    await expect.poll(() => section.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(before, 0);
    await page.waitForTimeout(700);
    expect(await section.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(before, 0);
    expect(await page.evaluate(() => decodeURIComponent(location.hash))).toBe(`#${id}`);
    if (paneId === "component-chart") await page.screenshot({ path: `/tmp/qizhi-reading-${info.project.name}.png` });
  }
  await page.goto("/#overview");
  await expect(page.locator("#overview")).toHaveClass(/is-visible/);
  await page.goBack();
  await expect(page.locator("#component-table")).toHaveClass(/is-visible/);
  await page.goForward();
  await expect(page.locator("#overview")).toHaveClass(/is-visible/);
  expect(errors).toEqual([]);
});

test("新标签页直接打开异步组件章节不会回概述", async ({ page }) => {
  await page.goto("/#图表-分组柱状图");
  await expect(page.locator("#component-chart")).toHaveClass(/is-visible/);
  await expect(page.locator('[id="图表-分组柱状图"]')).toBeInViewport();
  expect(await page.evaluate(() => decodeURIComponent(location.hash))).toBe("#图表-分组柱状图");
});


test("存储不可用仍能定位异步章节，手动滚动不会被恢复逻辑拉回", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "sessionStorage", { get() { throw new Error("storage unavailable"); } }));
  await page.goto("/#图表-分组柱状图");
  await expect(page.locator("#component-chart")).toHaveClass(/is-visible/);
  await page.reload();
  await expect(page.locator('[id="图表-分组柱状图"]')).toBeInViewport();
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(400);
  const y = await page.evaluate(() => scrollY);
  await page.waitForTimeout(2600);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(y, 0);
});
