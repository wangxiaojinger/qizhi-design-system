import { expect, test } from "@playwright/test";

test("Pagination 保持九组 Demo、核心交互和三档响应式", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#component-pagination");

  await expect(page.getByRole("heading", { name: "分页 Pagination" })).toBeVisible();
  await expect(page.locator("#component-pagination article.codebox-wrapper")).toHaveCount(9);
  await page.locator("#pagination-basic button[aria-label='下一页']").click();
  await expect(page.locator("#pagination-basic [aria-current='page']")).toHaveText("2");
  await expect(page.locator("#pagination-basic [aria-current='page']")).toHaveCSS("border-color", "rgb(51, 102, 255)");
  await page.locator("#pagination-more button[aria-label='向后 5 页']").click();
  await expect(page.locator("#pagination-more [aria-current='page']")).toHaveText("10");
  await expect(page.locator("#pagination-more button[aria-label='向后 5 页'] circle")).toHaveCount(3);
  expect(await page.locator("#pagination-more button[aria-label='向后 5 页'] circle").evaluateAll((circles) => circles.every((circle) => circle.getAttribute("cy") === "8"))).toBe(true);

  await page.locator("#pagination-page-size [role='combobox']").click();
  await page.getByRole("option", { name: "20 条/页" }).click();
  await expect(page.locator("#pagination-page-size [aria-current='page']")).toHaveText("1");

  const jumper = page.locator("#pagination-jumper input[aria-label='跳转页码']");
  await expect(jumper.locator("xpath=..")).toHaveClass(/qizhi-input/);
  await expect(jumper).toHaveCSS("border-top-width", "0px");
  await jumper.fill("99");
  await jumper.press("Enter");
  await expect(page.locator("#pagination-jumper [aria-current='page']")).toHaveText("20");
  await expect(jumper).toBeFocused();
  await expect(jumper).toHaveValue("");

  await page.locator("#pagination-size button[role='radio']", { hasText: "迷你" }).click();
  await expect(page.locator("#pagination-size .qizhi-pagination__item").first()).toHaveCSS("width", "24px");
  const simple = page.locator("#pagination-simple input[aria-label='当前页码']");
  await simple.fill("4");
  await simple.press("Enter");
  await expect(simple).toBeFocused();

  await page.locator("#pagination-controlled-total button[aria-label='下一页']").click();
  await expect(page.locator("#pagination-controlled-total .qizhi-pagination__total")).toHaveText("当前共 30 条");
  await expect(page.locator("#pagination-complete nav[aria-disabled='true'] button:not(:disabled)")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const sectionOverflow = await page.locator("#component-pagination").evaluate((node) => ({ fits: node.scrollWidth <= node.clientWidth, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, offenders: [...node.querySelectorAll<HTMLElement>("*")].filter((element) => element.scrollWidth > element.clientWidth + 1).slice(0, 8).map((element) => ({ className: element.className, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth })) }));
  expect(sectionOverflow, JSON.stringify(sectionOverflow.offenders)).toMatchObject({ fits: true });
  await page.locator("#component-pagination").screenshot({ path: testInfo.outputPath(`pagination-${testInfo.project.name}.png`) });
  expect(errors).toEqual([]);
});
