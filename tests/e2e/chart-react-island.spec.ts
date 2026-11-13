import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
const shots = "/tmp/qizhi-chart-shots";

test("图表文档：三视口布局、提示、图例、状态、源码与键盘", async ({ page, context }, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.clock.setFixedTime(Date.UTC(2026, 8, 10, 16));
  await page.goto("/#component-chart");
  const doc = page.locator("#component-chart");
  const controls = doc.getByRole("group", { name: "图表共同时间范围" });
  await controls.getByLabel("开始时间", { exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "确认", exact: true }).click();
  await expect(doc.locator(".codebox-wrapper")).toHaveCount(12);
  await expect(doc.locator('[data-ready="true"]')).toHaveCount(9, { timeout: 30000 });
  await expect(doc.locator('[data-state="engine-error"]')).toHaveCount(0);
  const articles = doc.locator(".codebox-wrapper");
  mkdirSync(shots, { recursive: true });
  for (let index = 0; index < 12; index++) {
    const article = articles.nth(index); await article.scrollIntoViewIfNeeded();
    const metrics = await article.evaluate(element => {
      const demo = element.querySelector(".demo")!; const chart = demo.querySelector(".qizhi-chart")!; const plot = chart.querySelector(".qizhi-chart__plot")!;
      const actions = element.querySelector(".component-example-actions")!;
      const scroll = chart.querySelector(".qizhi-chart__scroll")!;
      return { usageAxis: chart.getAttribute("data-usage-axis") === "true", overflow: element.scrollWidth > element.clientWidth + 1, demoOverflow: demo.scrollWidth > demo.clientWidth + 1,
        plot: plot.getBoundingClientRect().width, chart: chart.getBoundingClientRect().width, height: plot.getBoundingClientRect().height, rightEdge: chart.getBoundingClientRect().right, viewport: innerWidth, scrollWidth: scroll.clientWidth, scrollContent: scroll.scrollWidth, overflowX: getComputedStyle(scroll).overflowX,
        gap: getComputedStyle(demo).marginBottom, right: getComputedStyle(actions).paddingRight, cardPadding: getComputedStyle(chart).paddingLeft, radius: getComputedStyle(chart).borderRadius, background: getComputedStyle(chart).backgroundImage, titleSize: getComputedStyle(chart.querySelector(".qizhi-chart__title")!).fontSize };
    });
    expect(metrics.overflow).toBe(false); expect(metrics.demoOverflow).toBe(false);
    expect(metrics.rightEdge).toBeLessThanOrEqual(metrics.viewport);
    expect(metrics.plot).toBeCloseTo((metrics.usageAxis ? metrics.chart - 48 : Math.max(520, metrics.chart - 48)), 0); expect(metrics.height).toBe(280);
    expect(metrics.scrollWidth).toBeCloseTo(metrics.chart - 48, 0);
    expect(metrics.overflowX).toBe("auto");
    if (!metrics.usageAxis && metrics.scrollWidth < 520) expect(metrics.scrollContent).toBeGreaterThan(metrics.scrollWidth);
    expect(metrics.gap).toBe("12px"); expect(metrics.right).toBe("0px");
    expect(metrics.cardPadding).toBe("24px"); expect(metrics.radius).toBe("8px"); expect(metrics.titleSize).toBe("14px"); expect(metrics.background).toContain("rgb(247, 249, 252)");
    await article.locator(".demo").screenshot({ path: resolve(shots, `${testInfo.project.name}-${index + 1}.png`) });
  }
  const multi = articles.nth(1); await multi.scrollIntoViewIfNeeded();
  const plot = multi.getByRole("listbox", { name: /绘图区/ });
  await plot.press("Home");
  await expect(page.getByRole("tooltip")).toContainText("80 次");
  await expect(page.getByRole("tooltip")).toContainText("40 次");
  const bounds = await page.getByRole("tooltip").evaluate(element => {
    const rect = element.getBoundingClientRect();
    const ancestors = []; let parent = element.parentElement;
    while (parent) { const css = getComputedStyle(parent); ancestors.push({ tag: parent.tagName, overflow: css.overflow, clip: css.clipPath, contain: css.contain }); parent = parent.parentElement; }
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, ancestors, width: innerWidth, height: innerHeight };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0); expect(bounds.right).toBeLessThanOrEqual(bounds.width);
  expect(bounds.top).toBeGreaterThanOrEqual(0); expect(bounds.bottom).toBeLessThanOrEqual(bounds.height);
  expect(bounds.ancestors[0].tag).toBe("BODY");
  await page.screenshot({ path: resolve(shots, `${testInfo.project.name}-tooltip.png`) });
  await plot.press("ArrowRight"); await expect(page.getByRole("tooltip")).toContainText("100 次");
  await plot.press("End"); await expect(page.getByRole("tooltip")).toContainText("0 次");
  await plot.press("Escape"); await expect(page.getByRole("tooltip")).toHaveCount(0);
  const legends = multi.locator(".qizhi-chart__legend button");
  await expect(multi.locator(".qizhi-chart__legend")).toHaveCSS("justify-content", "flex-start");
  await expect(multi.locator(".qizhi-chart__swatch").first()).toHaveCSS("width", "6px");
  await expect(multi.locator(".qizhi-chart__swatch").first()).toHaveCSS("height", "2px");
  await legends.nth(0).press("Space"); await expect(legends.nth(0)).toHaveAttribute("aria-pressed", "false"); await expect(legends.nth(0)).toHaveCSS("opacity", "0.3");
  await legends.nth(1).press("Enter"); await expect(legends.nth(1)).toHaveAttribute("aria-pressed", "true");
  await legends.nth(0).click(); await expect(legends.nth(0)).toHaveAttribute("aria-pressed", "true");
  await expect(doc.getByRole("button", { name: "查看数据", exact: true })).toHaveCount(0);
  await expect(multi.getByRole("table")).toContainText("160 次");
  await expect(doc.getByRole("button", { name: "收起数据", exact: true })).toHaveCount(0);
  const box = await plot.boundingBox(); if (!box) throw new Error("绘图区不可见");
  const scrollBox = await multi.locator(".qizhi-chart__scroll").boundingBox();
  if (!scrollBox) throw new Error("图表滚动视口不可见");
  await page.mouse.move(scrollBox.x + scrollBox.width / 2, box.y + 120); await expect(page.getByRole("tooltip")).toBeVisible();
  await page.mouse.move(0, 0); await expect(page.getByRole("tooltip")).toHaveCount(0);
  for (const index of [7, 9]) {
    const article = articles.nth(index); await article.getByRole("switch").click(); await expect(article.locator('[data-ready="true"]')).toHaveCount(1);
    await article.getByRole("switch").click(); await expect(article.locator('[data-ready="true"]')).toHaveCount(0);
  }
  const switches = articles.nth(6).getByRole("switch");
  await switches.nth(0).click(); await expect(articles.nth(6).getByRole("group", { name: "图例", exact: true })).toHaveCount(0); await switches.nth(0).click();
  await switches.nth(1).click(); await articles.nth(6).getByRole("listbox", { name: /绘图区/ }).press("Home"); await expect(page.getByRole("tooltip")).toHaveCount(0);
  await switches.nth(1).click();
  const first = articles.nth(0); await first.getByRole("button", { name: "查看代码", exact: true }).click();
  await expect(first.locator("pre")).toContainText('from "@wangxiaojinger/qizhi-react"');
  await first.getByRole("button", { name: "复制代码", exact: true }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("value: 120"); expect(clipboard).toContain("LineChart"); expect(clipboard).not.toContain("@antv");
  await first.getByRole("button", { name: "收起代码", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/#component-tree"); await page.goBack(); await expect(doc).toBeVisible(); await expect(first.locator('[data-ready="true"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});
