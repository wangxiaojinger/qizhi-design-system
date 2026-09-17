import { expect, test } from "@playwright/test";

test("Timeline 保持九组 Demo、原始交互和三档几何", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-timeline");
  await expect(page.getByRole("heading", { name: "时间轴 Timeline" }))
    .toBeVisible();
  await expect(page.locator("#component-timeline article.codebox-wrapper"))
    .toHaveCount(9);
  await expect(page.getByRole("table", { name: "Timeline API" }))
    .toBeVisible();
  await expect(page.getByRole("table", { name: "TimelineItem API" }))
    .toBeVisible();

  const basic = page.locator("#时间轴-基础用法");
  const switchControl = basic.getByRole("switch", { name: "倒序展示" });
  const contents = basic.locator(".qizhi-timeline-item-content");
  await expect(contents).toHaveText([
    "第一个里程碑",
    "第二个里程碑",
    "第三个里程碑",
  ]);
  await switchControl.focus();
  await switchControl.press("Space");
  await expect(switchControl).toHaveAttribute("aria-checked", "true");
  await expect(contents).toHaveText([
    "第三个里程碑",
    "第二个里程碑",
    "第一个里程碑",
  ]);

  const firstContent = page.locator(
    "#component-timeline .qizhi-timeline-item-content",
  ).first();
  const firstLabel = page.locator(
    "#component-timeline .qizhi-timeline-item-label",
  ).first();
  await expect(firstContent).toHaveCSS("font-size", "14px");
  await expect(firstContent).toHaveCSS("line-height", "20px");
  await expect(firstLabel).toHaveCSS("font-size", "12px");
  await expect(firstLabel).toHaveCSS("line-height", "17px");

  const firstGeometry = await basic.locator(".qizhi-timeline-item").first()
    .evaluate((item) => {
      const dot = item.querySelector(
        ".qizhi-timeline-item-dot",
      )!.getBoundingClientRect();
      const title = item.querySelector(
        ".qizhi-timeline-item-content",
      )!.getBoundingClientRect();
      return {
        dotCenter: dot.top + dot.height / 2,
        titleCenter: title.top + title.height / 2,
      };
    });
  expect(Math.abs(firstGeometry.dotCenter - firstGeometry.titleCenter))
    .toBeLessThanOrEqual(1);

  const alternate = page.locator(
    "#时间轴-时间轴展示类型 .qizhi-timeline",
  ).first();
  const positions = await alternate.locator(".qizhi-timeline-item")
    .evaluateAll((items) => items.map((item) => {
      const dot = item.querySelector(
        ".qizhi-timeline-item-dot-wrapper",
      )!.getBoundingClientRect();
      const content = item.querySelector(
        ".qizhi-timeline-item-content-wrapper",
      )!.getBoundingClientRect();
      return {
        dotLeft: dot.left,
        dotRight: dot.right,
        contentLeft: content.left,
        contentRight: content.right,
      };
    }));
  expect(positions[0].contentLeft).toBeGreaterThanOrEqual(
    positions[0].dotRight,
  );
  expect(positions[1].contentRight).toBeLessThanOrEqual(
    positions[1].dotLeft,
  );
  expect(positions[2].contentLeft).toBeGreaterThanOrEqual(
    positions[2].dotRight,
  );

  const leakedLegacyLines = await page.locator(
    "#component-timeline .qizhi-timeline-item",
  ).evaluateAll((items) => items.filter((item) => (
    getComputedStyle(item, "::before").content !== "none"
  )).length);
  expect(leakedLegacyLines).toBe(0);

  if (testInfo.project.name !== "mobile-375") {
    const horizontalGeometry = await page.locator(
      "#时间轴-横向时间轴 .qizhi-timeline-item",
    ).first().evaluate((item) => {
      const dot = item.querySelector(
        ".qizhi-timeline-item-dot",
      )!.getBoundingClientRect();
      const line = item.querySelector(
        ".qizhi-timeline-item-line",
      )!.getBoundingClientRect();
      return {
        dotCenter: dot.top + dot.height / 2,
        lineCenter: line.top + line.height / 2,
      };
    });
    expect(Math.abs(
      horizontalGeometry.dotCenter - horizontalGeometry.lineCenter,
    )).toBeLessThanOrEqual(0.1);
  }

  if (testInfo.project.name === "mobile-375") {
    await expect(page.locator("#时间轴-横向时间轴 .qizhi-timeline"))
      .toHaveCSS("display", "block");
    await expect(page.locator("#时间轴-纵向时间轴 .timeline-docs-two-column"))
      .toHaveCSS("grid-template-columns", /301px|277px|253px|229px/);
  } else {
    await expect(page.locator("#时间轴-横向时间轴 .qizhi-timeline"))
      .toHaveCSS("display", "grid");
  }

  const demos = await page.locator(
    "#component-timeline .codebox-wrapper > .demo",
  ).evaluateAll((nodes) => nodes.map((node) => ({
    id: node.parentElement?.id,
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
  })));
  expect(demos.filter((demo) => demo.scrollWidth > demo.clientWidth + 1))
    .toEqual([]);
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);

  await page.locator("#component-timeline").screenshot({
    path: testInfo.outputPath(`timeline-${testInfo.project.name}.png`),
  });
});
