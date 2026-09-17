import { expect, test } from "@playwright/test";

test("Tree 保持十三组 Demo、核心交互和三档响应式", async ({
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

  await page.goto("/#component-tree");
  await expect(page.getByRole("heading", { name: "树 Tree" })).toBeVisible();
  await expect(page.locator("#component-tree article.codebox-wrapper"))
    .toHaveCount(13);

  const basic = page.locator("#树-基础用法");
  await expect(basic.getByRole("treeitem", { name: "Branch 0-0-1" }))
    .toHaveAttribute("aria-selected", "true");
  await basic.getByRole("button", { name: "选择Branch 0-0-1" }).click();
  await expect(basic.getByRole("treeitem", { name: "Branch 0-0-1" }))
    .toHaveAttribute("aria-selected", "false");

  const checkable = page.locator("#树-带复选框的树");
  await expect(checkable.getByRole("checkbox", { name: "勾选Trunk 0-1" }))
    .toBeChecked();
  await checkable
    .getByRole("checkbox", { name: "勾选Leaf" })
    .last()
    .locator("xpath=..")
    .click();
  await expect(checkable.getByRole("checkbox", { name: "勾选Trunk 0-1" }))
    .toHaveAttribute("aria-checked", "mixed");

  const lazy = page.locator("#动态加载");
  await lazy.getByRole("button", { name: "展开Trunk 0-1" }).click();
  await expect(lazy.getByRole("treeitem", { name: "leaf" }).last())
    .toBeVisible();

  const search = page.locator("#搜索树");
  await search.getByRole("textbox", { name: "搜索树节点" }).fill("0-1-2");
  await expect(search.getByRole("treeitem", { name: "Leaf 0-1-2-0" }))
    .toBeVisible();
  await expect(search.getByRole("treeitem", { name: "Leaf 0-0-1-1" }))
    .not.toBeVisible();

  const drag = page.locator("#拖拽");
  await drag.evaluate((root) => {
    const source = root.querySelector('[aria-label="Trunk 0-0"]');
    const target = root.querySelector('[aria-label="Trunk 0-1"]');
    if (!source || !target) throw new Error("找不到待拖拽节点");
    const transfer = new DataTransfer();
    source.dispatchEvent(new DragEvent("dragstart", {
      bubbles: true,
      dataTransfer: transfer,
    }));
    target.dispatchEvent(new DragEvent("dragover", {
      bubbles: true,
      cancelable: true,
      dataTransfer: transfer,
    }));
    target.dispatchEvent(new DragEvent("drop", {
      bubbles: true,
      cancelable: true,
      dataTransfer: transfer,
    }));
  });
  await expect(drag.getByRole("treeitem").first())
    .toHaveAttribute("aria-label", "Trunk 0-1");

  const demos = await page.locator("#component-tree .codebox-wrapper")
    .evaluateAll((nodes) => nodes.map((node) => ({
      id: node.id,
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
    })));
  expect(demos.filter((demo) => (
    demo.scrollWidth > demo.clientWidth + 1
  ))).toEqual([]);
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth
      <= document.documentElement.clientWidth
  ))).toBe(true);

  await page.locator("#component-tree").screenshot({
    path: testInfo.outputPath(`tree-${testInfo.project.name}.png`),
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
