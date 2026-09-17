import { expect, test } from "@playwright/test";

const uniqueRows = async (locator: ReturnType<import("@playwright/test").Page["locator"]>) => {
  const centers = await locator.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return Math.round(rect.top + rect.height / 2);
  }));
  return new Set(centers).size;
};

test("Tag 六组 Demo 的 UI、尺寸和响应式布局", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/#component-tag");

  await expect(page.locator("#component-tag .codebox-wrapper")).toHaveCount(6);
  await expect(page.locator("#tag-API")).toBeVisible();
  await expect(page.locator("#标签-基础用法 .qizhi-tag")).toHaveCount(4);
  await expect(page.locator("#标签-多彩标签 .qizhi-tag")).toHaveCount(12);
  await expect(page.locator("#标签-带边框的标签 .qizhi-tag")).toHaveCount(7);
  await expect(page.locator("#标签-基础用法 .qizhi-tag").first()).toHaveCSS("border-radius", "2px");

  const sizeTags = page.locator("#标签-不同尺寸 .qizhi-tag");
  for (const [index, height] of [20, 24, 28, 32].entries()) await expect(sizeTags.nth(index)).toHaveCSS("height", `${height}px`);
  await expect(page.locator("#标签-可选中 .qizhi-tag").first()).toHaveCSS("height", "32px");
  await expect(page.locator("#标签-可选中 .qizhi-tag").first()).toHaveCSS("font-weight", "600");
  await expect(page.locator("#标签-多彩标签 .qizhi-tag-red")).toHaveCSS("background-color", "rgba(255, 77, 79, 0.1)");
  await expect(page.getByRole("checkbox", { name: "Toutiao" })).toHaveCSS("background-color", "rgba(255, 77, 79, 0.1)");
  await expect(page.locator("#标签-基础用法 > .demo")).toHaveCSS("margin-bottom", "12px");
  await expect(page.locator("#标签-基础用法 > .component-example-actions")).toHaveCSS("padding-right", "0px");

  const bordered = page.locator("#标签-带边框的标签 .qizhi-tag").first();
  expect(await bordered.evaluate((node) => getComputedStyle(node).borderTopColor)).not.toBe("rgba(0, 0, 0, 0)");
  await expect(bordered).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const borderedRed = page.locator("#标签-带边框的标签 .qizhi-tag-red");
  await expect(borderedRed).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(borderedRed).toHaveCSS("border-color", "rgba(255, 77, 79, 0.35)");
  await expect(borderedRed).toHaveCSS("color", "rgb(255, 77, 79)");

  const viewport = page.viewportSize()!.width;
  const basicRows = await uniqueRows(page.locator("#标签-基础用法 .qizhi-tag"));
  const colorRows = await uniqueRows(page.locator("#标签-多彩标签 .qizhi-tag"));
  const sizeRows = await uniqueRows(sizeTags);
  const borderedRows = await uniqueRows(page.locator("#标签-带边框的标签 .qizhi-tag"));
  if (viewport === 1440) expect([basicRows, colorRows, sizeRows, borderedRows]).toEqual([1, 1, 1, 1]);
  if (viewport === 1024) expect([basicRows, colorRows, sizeRows, borderedRows]).toEqual([1, 2, 1, 1]);
  if (viewport === 375) expect([basicRows, colorRows, sizeRows, borderedRows]).toEqual([2, 4, 2, 3]);

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.locator("#component-tag").screenshot({ path: testInfo.outputPath(`tag-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});

test("Tag 关闭、Toggle 与可选中交互", async ({ page }) => {
  await page.goto("/#component-tag");
  const closable = page.locator("#标签-可关闭标签");
  await expect(closable.locator(".qizhi-tag")).toHaveCount(2);
  await closable.getByRole("button", { name: "关闭标签" }).first().click();
  await expect(closable.locator(".qizhi-tag")).toHaveCount(1);
  const toggle = closable.getByRole("switch", { name: "显示标签" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(closable.locator(".qizhi-tag")).toHaveCount(0);
  await toggle.click();
  await expect(closable.locator(".qizhi-tag")).toHaveCount(1);

  const awesome = page.getByRole("checkbox", { name: "Awesome" });
  await awesome.click();
  await expect(awesome).toHaveAttribute("aria-checked", "true");
  await awesome.press("Enter");
  await expect(awesome).toHaveAttribute("aria-checked", "false");
  await awesome.press("Space");
  await expect(awesome).toHaveAttribute("aria-checked", "true");
});
