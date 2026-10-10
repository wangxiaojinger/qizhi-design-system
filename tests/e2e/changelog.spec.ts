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
  const dailyRecords = await section.locator(".qizhi-changelog__day").evaluateAll((days) => days.map((day) => ({
    id: day.id,
    date: day.querySelector("time")?.getAttribute("datetime") ?? "",
    countText: day.querySelector(".qizhi-changelog__count")?.textContent?.trim() ?? "",
    entryCount: day.querySelectorAll(".qizhi-changelog__entry").length,
    titles: [...day.querySelectorAll(".qizhi-changelog__entry h3")].map((title) => title.textContent?.trim() ?? ""),
  })));
  expect(dailyRecords.length).toBeGreaterThan(0);
  expect(new Set(dailyRecords.map(({ date }) => date)).size).toBe(dailyRecords.length);
  expect(dailyRecords.map(({ date }) => date)).toEqual([...dailyRecords.map(({ date }) => date)].sort().reverse());
  for (const record of dailyRecords) {
    expect(record.id).toBe(`changelog-${record.date}`);
    expect(record.countText).toBe(`${record.entryCount} 次更新`);
    expect(record.entryCount).toBeGreaterThan(0);
    expect(record.titles.every(Boolean)).toBe(true);
  }
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
    const tocTargets = await toc.locator(".toc-link").evaluateAll((links) => links.map((link) => ({
      href: link.getAttribute("href"),
      text: link.textContent?.trim(),
    })));
    expect(tocTargets).toEqual(dailyRecords.map(({ id, date }) => ({ href: `#${id}`, text: date })));
    const target = dailyRecords.at(Math.min(1, dailyRecords.length - 1))!;
    await toc.getByRole("link", { name: target.date }).click();
    await expect(page).toHaveURL(new RegExp(`#${target.id}$`));
    await expect(section.locator(`#${target.id}`)).toBeVisible();
  }

  const ids = await section.locator("[id]").evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(consoleErrors).toEqual([]);
});
