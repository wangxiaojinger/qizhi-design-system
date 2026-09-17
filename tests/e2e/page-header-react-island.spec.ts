import { expect, test } from "@playwright/test";

test("PageHeader React Island preserves the legacy contract", async ({
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

  await page.goto("/#component-page-header");
  const section = page.locator("#component-page-header");
  await expect(section).toHaveClass(/is-visible/);
  await expect(page.getByRole("heading", {
    name: "页头 PageHeader",
  })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(1);
  await expect(section.getByRole("heading", { name: "基础用法" }))
    .toBeVisible();
  await expect(section.getByText(
    "基础页头用于展示当前工作区的欢迎语，高度固定为 54px。",
  )).toBeVisible();
  await expect(section.getByRole("table", { name: "PageHeader API" }))
    .toBeVisible();

  const article = section.locator("article.codebox-wrapper");
  const demo = article.locator(":scope > .demo");
  const header = demo.locator(".qizhi-page-header");
  const greeting = header.locator(".qizhi-page-header__greeting");
  await expect(demo).toHaveCSS("padding-top", "48px");
  await expect(demo).toHaveCSS("padding-right", "48px");
  await expect(demo).toHaveCSS("padding-bottom", "48px");
  await expect(demo).toHaveCSS("padding-left", "48px");
  await expect(header).toHaveCSS("height", "54px");
  await expect(greeting).toHaveCSS("min-height", "54px");
  await expect(greeting).toHaveCSS("font-size", "18px");
  await expect(greeting).toHaveCSS("line-height", "22px");
  await expect(greeting).toHaveCSS("font-weight", "600");
  await expect(greeting).toHaveText(
    "Good day，欢迎使用 启智 开启新的一天 😃",
  );

  const headerBox = await header.boundingBox();
  const greetingBox = await greeting.boundingBox();
  expect(headerBox?.height).toBe(54);
  expect(greetingBox?.height).toBe(54);

  await expect(demo).toHaveCSS("margin-bottom", "12px");
  const actions = article.locator(
    ":scope > .component-example-actions",
  );
  await expect(actions).toHaveCSS("padding-right", "0px");
  const viewport = page.viewportSize()!;
  if (viewport.width <= 600) {
    await expect(actions).toHaveCSS("padding-left", "0px");
    await expect(actions).toHaveCSS("flex-wrap", "wrap");
  }

  await section.getByRole("button", { name: "查看代码" }).click();
  const displayed = section.locator(
    "#page-header-code-页头-基础用法 pre",
  );
  await expect(displayed).toContainText(
    'import { PageHeader } from "@wangxiaojinger/qizhi-react"',
  );
  await section.getByRole("button", { name: "复制代码" }).click();
  await expect.poll(() => page.evaluate(() => (
    navigator.clipboard.readText()
  ))).toBe(await displayed.innerText());

  await article.screenshot({
    path: testInfo.outputPath("page-header-basic.png"),
  });

  expect(await article.evaluate((node) => (
    node.scrollWidth <= node.clientWidth
  ))).toBe(true);
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  expect(errors).toEqual([]);
});
