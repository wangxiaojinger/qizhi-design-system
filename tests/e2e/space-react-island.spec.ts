import { expect, test } from "@playwright/test";

test("Space preserves five demos, public behavior and same-source code", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-space");
  const section = page.locator('#component-space[data-react-island="space"]');
  await expect(section.locator("article.codebox-wrapper")).toHaveCount(5);
  await expect(section.locator('table[aria-label="Space API"] tbody tr td:first-child')).toHaveText([
    "wrap", "align", "direction", "split", "className", "size", "style",
  ]);
  await expect(section.locator('.qizhi-space-type-definition[aria-label="SpaceSize 类型定义"]'))
    .toContainText('export type SpaceSize = "mini" | "small" | "medium" | "large" | number;');

  const vertical = section.locator("#space-vertical .qizhi-space");
  await expect(vertical).toHaveCSS("flex-direction", "column");
  await expect(vertical).toHaveCSS("align-items", "flex-start");
  await expect(vertical).toHaveCSS("gap", "8px");

  const size = section.locator("#space-size .qizhi-space");
  const expectActualHorizontalGap = async (locator: typeof size, expected: number) => {
    expect(await locator.evaluate((node) => {
      const children = Array.from(node.children).map((child) => child.getBoundingClientRect());
      return children.slice(1).map((child, index) => child.left - children[index].right);
    })).toEqual([expected, expected]);
  };
  const sizeDemo = section.locator("#space-size");
  for (const [name, expected] of Object.entries({ mini: 4, small: 8, medium: 16, large: 24 })) {
    await sizeDemo.locator(".qizhi-segmented-item", { hasText: name }).click();
    await expect(size).toHaveCSS("gap", `${expected}px`);
    await expectActualHorizontalGap(size, expected);
  }
  await sizeDemo.getByRole("radio", { name: "mini" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(sizeDemo.getByRole("radio", { name: "small" })).toBeChecked();
  await expect(sizeDemo.locator(".qizhi-segmented-item", { hasText: "small" })).toHaveClass(/is-active/);
  await expect(sizeDemo.locator(".qizhi-segmented-item", { hasText: "small" })).toHaveCSS("outline-style", "solid");
  await expect(size).toHaveCSS("gap", "8px");
  await expectActualHorizontalGap(size, 8);

  const align = section.locator("#space-align .qizhi-space");
  const alignDemo = section.locator("#space-align");
  await alignDemo.locator(".qizhi-segmented-item", { hasText: "start" }).click();
  expect(await align.evaluate((node) => {
    const tops = Array.from(node.children).map((child) => child.getBoundingClientRect().top);
    const sameRowTops = innerWidth <= 600 ? tops.slice(0, 2) : tops;
    return new Set(sameRowTops).size;
  })).toBe(1);
  await alignDemo.locator(".qizhi-segmented-item", { hasText: "end" }).click();
  expect(await align.evaluate((node) => {
    const bottoms = Array.from(node.children).map((child) => child.getBoundingClientRect().bottom);
    const sameRowBottoms = innerWidth <= 600 ? bottoms.slice(0, 2) : bottoms;
    return new Set(sameRowBottoms).size;
  })).toBe(1);
  await alignDemo.locator(".qizhi-segmented-item", { hasText: "baseline" }).click();
  await expect(align).toHaveCSS("align-items", "baseline");

  const wrap = section.locator("#space-wrap .qizhi-space");
  await expect(wrap).toHaveCSS("flex-wrap", "wrap");
  await expect(wrap).toHaveCSS("column-gap", "12px");
  await expect(wrap).toHaveCSS("row-gap", "18px");
  const split = section.locator("#space-split .qizhi-space");
  await expect(split.locator("[role=separator]")).toHaveCount(2);
  expect(await split.evaluate((node) => {
    const centerY = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.top + rect.height / 2;
    };
    const children = Array.from(node.children);
    const linkCenter = centerY(children[0]);
    return children.filter((child) => child.getAttribute("role") === "separator")
      .map((divider) => Math.abs(centerY(divider) - linkCenter));
  })).toEqual([0, 0]);

  for (const segmented of await section.locator(".space-interactive-demo > .qizhi-segmented").all()) {
    expect(await segmented.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    for (const item of await segmented.locator(".qizhi-segmented-item").all()) {
      expect(await item.evaluate((node) => node.getBoundingClientRect().right <=
        node.parentElement!.getBoundingClientRect().right + 0.5)).toBe(true);
    }
  }

  for (const codebox of await section.locator("article.codebox-wrapper").all()) {
    const boxModel = await codebox.evaluate((node) => {
      const demo = node.querySelector(":scope > .demo")!;
      const actions = node.querySelector(":scope > .component-example-actions")!;
      const demoRect = demo.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const actionsStyle = getComputedStyle(actions);
      return {
        demoActionsGap: actionsRect.top - demoRect.bottom,
        equalWidths: Math.abs(node.getBoundingClientRect().width - demoRect.width) < 0.5
          && Math.abs(demoRect.width - actionsRect.width) < 0.5,
        paddingRight: actionsStyle.paddingRight,
        overflow: node.scrollWidth <= node.clientWidth,
      };
    });
    expect(boxModel).toEqual({
      demoActionsGap: 12,
      equalWidths: true,
      paddingRight: "0px",
      overflow: true,
    });
    await codebox.getByRole("button", { name: "查看代码" }).click();
    const displayed = codebox.locator("pre");
    await codebox.getByRole("button", { name: "复制代码" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(await displayed.innerText());
  }
  expect(await section.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(errors).toEqual([]);
});
