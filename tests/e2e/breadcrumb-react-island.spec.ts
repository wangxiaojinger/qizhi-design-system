import { expect, test } from "@playwright/test";

test("Breadcrumb React Island preserves both legacy contracts", async ({
  context,
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-breadcrumb");
  const section = page.locator("#component-breadcrumb");
  await expect(page.getByRole("heading", {
    name: "面包屑 Breadcrumb",
  })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(2);
  await expect(section.getByRole("table", { name: "Breadcrumb API" }))
    .toBeVisible();
  await expect(section.getByRole("table", {
    name: "Breadcrumb.Item API",
  })).toBeVisible();

  const basic = section.getByRole("navigation", { name: "基础面包屑" });
  const channel = basic.getByRole("link", { name: "频道" });
  const home = basic.getByText("首页");
  await expect(basic).toHaveCSS("font-size", "14px");
  await expect(basic).toHaveCSS("line-height", "22px");
  await expect(channel).toHaveAttribute("href", "#components-navigation");
  await expect(home).toHaveCSS("color", "rgb(134, 144, 156)");
  await expect(channel).toHaveCSS("color", "rgb(134, 144, 156)");
  await expect(basic.locator('[aria-current="page"]'))
    .toHaveText("消息");

  const separators = basic.locator(".qizhi-breadcrumb__separator");
  await expect(separators).toHaveCount(2);
  for (const separator of await separators.all()) {
    await expect(separator).toHaveText("/");
    await expect(separator).toHaveAttribute("aria-hidden", "true");
    await expect(separator).toHaveCSS("margin-left", "8px");
    await expect(separator).toHaveCSS("margin-right", "8px");
  }

  await channel.hover();
  await expect(channel).toHaveCSS("color", "rgb(51, 102, 255)");
  await channel.focus();
  await expect(channel).toHaveCSS("outline-width", "2px");
  await expect(channel).toHaveCSS("outline-offset", "3px");
  await channel.click();
  await expect(page).toHaveURL(/#components-navigation$/);
  await page.goto("/#component-breadcrumb");

  const normal = section.getByRole("navigation", {
    name: "带图标的面包屑",
    exact: true,
  });
  const small = section.getByRole("navigation", {
    name: "小尺寸带图标的面包屑",
    exact: true,
  });
  await expect(normal).toHaveCSS("font-size", "14px");
  await expect(normal).toHaveCSS("line-height", "22px");
  await expect(small).toHaveCSS("font-size", "12px");
  await expect(small).toHaveCSS("line-height", "20px");
  for (const breadcrumb of [normal, small]) {
    await expect(breadcrumb.locator("svg")).toHaveCount(1);
    await expect(breadcrumb.locator("svg path")).toHaveAttribute(
      "d",
      "M19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20C20 20.5523 19.5523 21 19 21ZM13 19H18V9.15745L12 3.7029L6 9.15745V19H11V13H13V19Z",
    );
  }

  const row = section.locator(".breadcrumb-demo-row");
  await expect(row).toHaveCSS("column-gap", "40px");
  await expect(row).toHaveCSS("row-gap", "24px");
  const normalBox = await normal.boundingBox();
  const smallBox = await small.boundingBox();
  const viewport = page.viewportSize()!;
  if (viewport.width <= 600) {
    const actualRowGap = smallBox!.y - (
      normalBox!.y + normalBox!.height
    );
    expect(Math.abs(actualRowGap - 24)).toBeLessThanOrEqual(1);
  } else {
    const normalCenter = normalBox!.y + normalBox!.height / 2;
    const smallCenter = smallBox!.y + smallBox!.height / 2;
    expect(Math.abs(normalCenter - smallCenter)).toBeLessThanOrEqual(1);
    expect(Math.round(smallBox!.x - (normalBox!.x + normalBox!.width)))
      .toBe(40);
  }

  const firstArticle = section.locator("article.codebox-wrapper").first();
  await expect(firstArticle).toHaveClass(/qizhi-react-demo-codebox/);
  await expect(firstArticle.locator(":scope > .demo"))
    .toHaveCSS("margin-bottom", "12px");
  const actions = firstArticle.locator(
    ":scope > .component-example-actions",
  );
  await expect(actions).toHaveCSS("padding-right", "0px");
  if (viewport.width <= 600) {
    await expect(actions).toHaveCSS("padding-left", "0px");
    await expect(actions).toHaveCSS("flex-wrap", "wrap");
  }

  await section.getByRole("button", { name: "查看代码" }).first().click();
  const displayed = section.locator(
    "#breadcrumb-code-面包屑-基础用法 pre",
  );
  await section.getByRole("button", { name: "复制代码" }).first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await displayed.innerText());

  await firstArticle.screenshot({
    path: testInfo.outputPath("breadcrumb-basic.png"),
  });
  await section.locator("#面包屑-自定义图标").screenshot({
    path: testInfo.outputPath("breadcrumb-custom-icon.png"),
  });

  for (const article of await section.locator("article.codebox-wrapper").all()) {
    await expect.poll(() => article.evaluate((node) => (
      node.scrollWidth <= node.clientWidth
    ))).toBe(true);
  }
  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
