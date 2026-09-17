import { expect, test } from "@playwright/test";

test("MarkdownViewer Markdown 阅读器在三档视口安全展示", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/#component-markdown-viewer");
  const section = page.locator("#component-markdown-viewer");
  await expect(section.getByRole("heading", { name: "Markdown 阅读器 MarkdownViewer" })).toBeVisible();
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(4);
  await expect(section.getByRole("table", { name: "MarkdownViewer API" })).toBeVisible();

  const basic = page.locator("#markdown-viewer-basic");
  const source = basic.getByRole("textbox", { name: "基础文档 Markdown 源文" });
  await source.fill("# 实时预览\n\n输入后立即渲染。");
  await expect(basic.getByRole("heading", { name: "实时预览" })).toBeVisible();
  await expect(basic.getByRole("region", { name: "基础文档渲染结果" })).toContainText("输入后立即渲染。");

  const columns = await basic.locator(".markdown-live-demo").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
  expect(columns).toBe(testInfo.project.name === "mobile-375" ? 1 : 2);

  const states = page.locator("#markdown-viewer-states");
  await expect(states).toContainText('<button onclick="alert(1)">这段 HTML 仅作为文字展示</button>');
  await expect(states.locator("button").filter({ hasText: "这段 HTML" })).toHaveCount(0);
  await expect(page.locator("#markdown-viewer-gfm table")).toBeVisible();
  await expect(page.locator("#markdown-viewer-code .qizhi-code-preview").first()).toBeVisible();

  const demos = await section.locator(".codebox-wrapper > .demo").evaluateAll((nodes) => nodes.map((node) => ({ clientWidth: node.clientWidth, scrollWidth: node.scrollWidth })));
  expect(demos.filter((demo) => demo.scrollWidth > demo.clientWidth + 1)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
  await section.screenshot({ path: testInfo.outputPath(`markdown-viewer-${testInfo.project.name}.png`) });
});
