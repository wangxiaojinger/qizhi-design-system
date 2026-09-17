import { expect, test } from "@playwright/test";

test("Tabs 保持十一组业务 Demo、核心交互和三档响应式", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    failedRequests.push(request.url());
  });
  await page.goto("/#component-tabs");

  await expect(page.getByRole("heading", { name: "标签页 Tabs" }))
    .toBeVisible();
  await expect(page.locator("#component-tabs article.codebox-wrapper"))
    .toHaveCount(11);

  const basic = page.locator("#标签页-基础用法");
  await basic.getByRole("tab", { name: "标签二" }).click();
  await expect(basic.getByRole("tabpanel", { name: "标签二" }))
    .toContainText("标签二内容区");
  await basic.getByRole("tab", { name: "标签二" }).press("ArrowRight");
  await expect(basic.getByRole("tab", { name: "标签三" }))
    .toHaveAttribute("aria-selected", "true");
  expect(await basic.getByRole("tab", { name: "标签三" }).evaluate((node) => {
    const indicator = getComputedStyle(node, "::after");
    return { bottom: indicator.bottom, zIndex: indicator.zIndex };
  })).toEqual({ bottom: "0px", zIndex: "1" });

  const sizeGaps = await page.locator(
    "#标签页-不同尺寸 .tabs-docs-size > .qizhi-tabs",
  ).evaluateAll((nodes) => nodes.slice(1).map((node, index) => (
    node.getBoundingClientRect().top
      - nodes[index].getBoundingClientRect().bottom
  )));
  expect(sizeGaps).toEqual([12, 12]);

  const type = page.locator("#标签页-不同类型");
  await type.getByText("capsule", { exact: true }).click();
  await expect(type.getByRole("radio", { name: "capsule" }))
    .toBeChecked();
  await expect(type.getByRole("tab", { name: "Tab 2" })).toBeDisabled();

  const missingPanels = await page.locator("#component-tabs [role=tab]")
    .evaluateAll((tabs) => tabs.filter((tab) => {
      const controls = tab.getAttribute("aria-controls");
      return !controls || !document.getElementById(controls);
    }).length);
  expect(missingPanels).toBe(0);
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);
  const demos = await page.locator("#component-tabs .codebox-wrapper")
    .evaluateAll((nodes) => nodes.map((node) => ({
      id: node.id,
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
    })));
  expect(demos.filter((demo) => (
    demo.scrollWidth > demo.clientWidth + 1
  ))).toEqual([]);
  await page.locator("#component-tabs").screenshot({
    path: testInfo.outputPath(`tabs-${testInfo.project.name}.png`),
  });
  const remixIconFailure = failedRequests.some((url) => (
    url.startsWith("https://cdn.jsdelivr.net/npm/remixicon@")
  ));
  const unexpectedRequests = failedRequests.filter((url) => (
    !url.startsWith("https://cdn.jsdelivr.net/npm/remixicon@")
  ));
  const unexpectedErrors = errors.filter((message) => (
    !(remixIconFailure && message.includes("ERR_CONNECTION_CLOSED"))
  ));
  expect({
    errors: unexpectedErrors,
    failedRequests: unexpectedRequests,
  }).toEqual({ errors: [], failedRequests: [] });
});
