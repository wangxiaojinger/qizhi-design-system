import { expect, test } from "@playwright/test";

const circleStrokeWidth = (node: Element) => getComputedStyle(
  node.querySelector(".qizhi-progress__circle-fill")!,
).strokeWidth;

test("Progress React Island preserves icons, geometry, code, and interaction", async ({
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

  await page.goto("/#component-progress");
  const section = page.locator("#component-progress");
  await expect(page.getByRole("heading", { name: "进度条 Progress" }))
    .toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(9);
  await expect(section.getByRole("table", { name: "Progress API" }))
    .toBeVisible();

  const status = section.locator("#进度条-状态");
  await expect(status.getByRole("progressbar", { name: "警告进度" })
    .locator(".qizhi-progress__status-icon--warning-filled")).toBeVisible();
  await expect(status.getByRole("progressbar", { name: "错误进度" })
    .locator(".qizhi-progress__status-icon--circle-close-filled")).toBeVisible();
  await expect(status.getByRole("progressbar", { name: "成功进度" })
    .locator(".qizhi-progress__status-icon--circle-check-filled")).toBeVisible();

  const circle = section.locator("#进度条-环形进度条");
  await expect(circle.getByRole("progressbar", { name: "警告环形进度" })
    .locator(".qizhi-progress__status-icon--warning-filled")).toBeVisible();
  await expect(circle.getByRole("progressbar", { name: "错误环形进度" })
    .locator(".qizhi-progress__status-icon--close")).toBeVisible();
  await expect(circle.getByRole("progressbar", { name: "成功环形进度" })
    .locator(".qizhi-progress__status-icon--check")).toBeVisible();
  await expect(circle.locator(
    ".qizhi-progress__status-icon--circle-close-filled, "
      + ".qizhi-progress__status-icon--circle-check-filled",
  )).toHaveCount(0);
  await status.screenshot({ path: testInfo.outputPath("progress-status.png") });
  await circle.screenshot({ path: testInfo.outputPath("progress-circle.png") });

  const mini = section.locator("#进度条-微型进度条");
  const miniRows = mini.locator(".progress-demo-mini-row");
  for (const progress of await miniRows.nth(0).getByRole("progressbar").all()) {
    expect(await progress.evaluate(circleStrokeWidth))
      .toBe("2px");
  }
  for (const progress of await miniRows.nth(1).getByRole("progressbar").all()) {
    expect(await progress.evaluate(circleStrokeWidth))
      .toBe("4px");
  }
  await mini.screenshot({ path: testInfo.outputPath("progress-mini.png") });

  const steps = section.locator("#进度条-步骤进度条");
  const stepProgress = steps.getByRole("progressbar");
  await expect(stepProgress.nth(0).locator(".qizhi-progress__steps"))
    .toHaveCSS("height", "4px");
  await expect(stepProgress.nth(1).locator(".qizhi-progress__steps"))
    .toHaveCSS("height", "4px");
  await expect(stepProgress.nth(2).locator(".qizhi-progress__steps"))
    .toHaveCSS("height", "8px");
  for (const segment of await stepProgress.nth(2)
    .locator(".qizhi-progress__step").all()) {
    await expect(segment).toHaveCSS("width", "16px");
  }
  const compactBox = await stepProgress.nth(2).boundingBox();
  expect(compactBox!.width).toBe(152);
  await steps.screenshot({ path: testInfo.outputPath("progress-steps.png") });

  const trail = section.locator("#进度条-剩余进度条");
  const trailProgress = trail.getByRole("progressbar");
  await expect(trailProgress.nth(0).locator(".qizhi-progress__track"))
    .toHaveCSS("height", "4px");
  await expect(trailProgress.nth(1).locator(".qizhi-progress__steps"))
    .toHaveCSS("height", "4px");
  expect(await trailProgress.nth(2)
    .evaluate(circleStrokeWidth)).toBe("4px");
  await trail.screenshot({ path: testInfo.outputPath("progress-trail.png") });

  const sizes = section.locator("#进度条-不同尺寸");
  const sizeCircle = sizes.getByRole("progressbar", { name: "尺寸示例环形进度" });
  await expect(sizeCircle).toHaveCSS("width", "64px");
  await sizes.getByRole("radio", { name: "large" }).click();
  await expect(sizeCircle).toHaveCSS("width", "80px");
  await sizes.getByRole("radio", { name: "large" }).press("ArrowLeft");
  await expect(sizes.getByRole("radio", { name: "default" }))
    .toHaveAttribute("aria-checked", "true");
  await expect(sizeCircle).toHaveCSS("width", "64px");

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
