import { expect, test } from "@playwright/test";

test("Skeleton React Island preserves geometry, animation, and code", async ({
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

  await page.goto("/#component-skeleton");
  const section = page.locator("#component-skeleton");
  await expect(page.getByRole("heading", { name: "骨架屏 Skeleton" }))
    .toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(3);
  await expect(section.getByRole("table", { name: "Skeleton API" }))
    .toBeVisible();

  const basic = section.locator("#Skeleton-基础用法");
  const basicSkeleton = basic.getByRole("status", { name: "内容加载中" });
  const basicRows = basicSkeleton.locator(".qizhi-skeleton__row");
  await expect(basicRows).toHaveCount(3);
  const basicContentWidth = await basicSkeleton.locator(
    ".qizhi-skeleton__content",
  ).evaluate((node) => node.getBoundingClientRect().width);
  expect(await basicRows.nth(0).evaluate(
    (node) => node.getBoundingClientRect().width,
  )).toBeCloseTo(basicContentWidth, 1);
  expect(await basicRows.nth(2).evaluate(
    (node) => node.getBoundingClientRect().width,
  )).toBeCloseTo(basicContentWidth * 0.6, 1);

  const text = section.locator("#Skeleton-文本行数和宽度");
  const textSkeleton = text.getByRole("status", {
    name: "图文内容加载中",
  });
  const image = textSkeleton.locator(".qizhi-skeleton__image");
  await expect(image).toHaveCSS("width", "48px");
  await expect(image).toHaveCSS("height", "48px");
  await expect(image).toHaveCSS("border-radius", "2px");
  const textContentWidth = await textSkeleton.locator(
    ".qizhi-skeleton__content",
  ).evaluate((node) => node.getBoundingClientRect().width);
  const textRows = textSkeleton.locator(".qizhi-skeleton__row");
  for (const [index, expected] of [
    [0, textContentWidth],
    [1, Math.min(textContentWidth, 600)],
    [2, Math.min(textContentWidth, 400)],
  ] as const) {
    expect(await textRows.nth(index).evaluate(
      (node) => node.getBoundingClientRect().width,
    )).toBeCloseTo(expected, 1);
  }

  const animation = section.locator("#Skeleton-动画");
  const toggle = animation.getByRole("switch", {
    name: "切换骨架屏动画",
  });
  const animated = animation.getByRole("status", {
    name: "内容加载中，动画已开启",
  });
  const animatedRow = animated.locator(".qizhi-skeleton__row").first();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(animatedRow).toHaveCSS(
    "animation-name",
    "qizhi-skeleton-shimmer",
  );
  await expect(animated.locator(".qizhi-skeleton__image"))
    .toHaveCSS("border-radius", "50%");
  const controlBox = await animation.locator(
    ".skeleton-animation-demo__control",
  ).boundingBox();
  const animatedBox = await animated.boundingBox();
  expect(animatedBox!.y - (controlBox!.y + controlBox!.height)).toBe(40);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(animation.getByRole("status", {
    name: "内容加载中，动画已关闭",
  })).not.toHaveClass(/qizhi-skeleton--animated/);
  await toggle.focus();
  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(animatedRow).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await basic.screenshot({ path: testInfo.outputPath("skeleton-basic.png") });
  await text.screenshot({ path: testInfo.outputPath("skeleton-text.png") });
  await animation.screenshot({
    path: testInfo.outputPath("skeleton-animation.png"),
  });

  const firstArticle = section.locator("article.codebox-wrapper").first();
  await expect(firstArticle.locator(":scope > .demo"))
    .toHaveCSS("margin-bottom", "12px");
  await expect(firstArticle.locator(":scope > .component-example-actions"))
    .toHaveCSS("padding-right", "0px");
  await firstArticle.getByRole("button", { name: "查看代码" }).click();
  const displayed = firstArticle.locator("pre");
  await firstArticle.getByRole("button", { name: "复制代码" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(await displayed.innerText());

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
