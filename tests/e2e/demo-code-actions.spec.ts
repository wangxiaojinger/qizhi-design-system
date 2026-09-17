import { expect, test } from "@playwright/test";

const migratedPages = [
  "component-select",
  "component-tree-select",
  "component-date-picker",
  "component-timeline",
  "component-statistic",
  "component-time-picker",
  "component-upload",
  "component-drawer",
  "component-message",
  "component-modal",
  "component-notification",
  "component-alert",
] as const;

for (const pageId of migratedPages) {
  test(`${pageId} 复用按钮页的 Demo 操作区间距`, async ({ page }) => {
    await page.goto(`/#${pageId}`);

    const codebox = page.locator(`#${pageId} article.codebox-wrapper`).first();
    const demo = codebox.locator(":scope > .demo");
    const actions = codebox.locator(":scope > .component-example-actions");

    await expect(demo).toBeVisible();
    await expect(actions).toBeVisible();
    await expect(demo).toHaveCSS("margin-bottom", "12px");
    await expect(actions).toHaveCSS("padding-right", "0px");

    const demoBox = await demo.boundingBox();
    const actionsBox = await actions.boundingBox();
    expect(demoBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect(Math.round(actionsBox!.y - (demoBox!.y + demoBox!.height)))
      .toBe(12);
  });
}
