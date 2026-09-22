import { expect, test } from "@playwright/test";

test("更新日志入口、内容与布局可正常使用", async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/#changelog");

  const navLink = page.locator('.nav-link[href="#changelog"]');
  const section = page.locator("#changelog");
  await expect(section).toBeVisible();
  await expect(section.getByRole("heading", { name: "更新日志", level: 2 })).toBeVisible();
  await expect(navLink).toHaveClass(/is-active/);
  await expect(section.locator(".qizhi-changelog__entry")).toHaveCount(13);
  await expect(section.locator(".qizhi-changelog__day")).toHaveCount(3);
  await expect(section.locator(".qizhi-changelog__day").first()).toContainText("2 次更新");
  await expect(section.locator("#changelog-2026-09-21")).toContainText("10 次更新");
  await expect(section.locator("#changelog-2026-09-17")).toContainText("1 次更新");
  await expect(section.locator(".qizhi-changelog__entry").first()).toContainText("新增更新日志模块");
  await expect(section.locator(".qizhi-changelog__entry").nth(1)).toContainText("c290d94");
  const bodyTypography = await section.locator(".qizhi-changelog__entry").first().evaluate((entry) => {
    const titleStyle = getComputedStyle(entry.querySelector("h3")!);
    const bodyStyle = getComputedStyle(entry.querySelector("li")!);
    return {
      titleFontSize: titleStyle.fontSize,
      titleFontWeight: titleStyle.fontWeight,
      titleLineHeight: titleStyle.lineHeight,
      bodyFontSize: bodyStyle.fontSize,
      bodyFontWeight: bodyStyle.fontWeight,
      bodyLineHeight: bodyStyle.lineHeight,
    };
  });
  expect(bodyTypography).toEqual({
    titleFontSize: "15px",
    titleFontWeight: "500",
    titleLineHeight: "22.5px",
    bodyFontSize: "15px",
    bodyFontWeight: "400",
    bodyLineHeight: "22.5px",
  });
  const changelogHeaderStyle = await section.locator(".doc-header").evaluate((header) => {
    const title = getComputedStyle(header.querySelector("h2")!);
    const lead = getComputedStyle(header.querySelector(".doc-lead")!);
    return {
      titleFontSize: title.fontSize,
      titleMarginBottom: title.marginBottom,
      leadMarginTop: lead.marginTop,
      paddingBottom: getComputedStyle(header).paddingBottom,
    };
  });
  const referenceHeaderStyle = await page.locator("#design-tokens .doc-header").evaluate((header) => {
    const title = getComputedStyle(header.querySelector("h2")!);
    const lead = getComputedStyle(header.querySelector(".doc-lead")!);
    return {
      titleFontSize: title.fontSize,
      titleMarginBottom: title.marginBottom,
      leadMarginTop: lead.marginTop,
      paddingBottom: getComputedStyle(header).paddingBottom,
    };
  });
  expect(changelogHeaderStyle).toEqual(referenceHeaderStyle);

  const navOrder = await page.locator('.nav-link[href="#design-tokens"], .nav-link[href="#changelog"]').evaluateAll(
    (links) => links.map((link) => link.getAttribute("href")),
  );
  expect(navOrder).toEqual(["#design-tokens", "#changelog"]);

  if (testInfo.project.name === "desktop-1440") {
    const toc = page.locator(".toc");
    await expect(toc).toBeVisible();
    await expect(toc.locator(".toc-link")).toHaveText([
      "2026-09-22",
      "2026-09-21",
      "2026-09-17",
    ]);
    await toc.getByRole("link", { name: "2026-09-21" }).click();
    await expect(page).toHaveURL(/#changelog-2026-09-21$/);
    await expect(section.locator("#changelog-2026-09-21")).toBeVisible();
  }

  const ids = await section.locator("[id]").evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(consoleErrors).toEqual([]);
});
