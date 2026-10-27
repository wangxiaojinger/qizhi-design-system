import { expect, test, type Locator, type Page } from "@playwright/test";
const fixture = "/tests/e2e/fixtures/table-customization.html";
const main = (page: Page) => page.locator("#main");
const cell = (page: Page, key: string) => main(page).locator(`th[data-column-key="${key}"]`);
const width = (node: Locator) => node.evaluate((element) => element.getBoundingClientRect().width);
const events = async (page: Page) => JSON.parse(await page.getByTestId("events").innerText());
async function resize(page: Page, key: string, delta: number, cancel = false) {
  const handle = cell(page, key).getByRole("separator");
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + delta, box.y + box.height / 2, { steps: 8 });
  if (cancel) await page.keyboard.press("Escape");
  await page.mouse.up();
}
async function order(page: Page) { return main(page).locator("th[data-column-key]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-column-key"))); }
test.beforeEach(async ({ page }) => { await page.goto(fixture); await expect(cell(page, "a")).toBeVisible(); });
test("真实首末调宽独立钳制、单次回调，取消恢复几何", async ({ page }) => {
  const b = await width(cell(page, "b"));
  await resize(page, "a", 500);
  await expect.poll(() => width(cell(page, "a"))).toBeCloseTo(200, 0);
  expect(await width(cell(page, "b"))).toBeCloseTo(b, 0);
  expect(await events(page)).toHaveLength(1);
  await resize(page, "a", -500);
  await expect.poll(() => width(cell(page, "a"))).toBeCloseTo(80, 0);
  await resize(page, "f", 30);
  await expect.poll(() => width(cell(page, "f"))).toBeCloseTo(130, 0);
  expect(await events(page)).toHaveLength(3);
  await resize(page, "f", 50, true);
  expect(await width(cell(page, "f"))).toBeCloseTo(130, 0);
  expect(await events(page)).toHaveLength(3);
});
test("固定偏移和表头表体几何保持一致，窄容器内部滚动", async ({ page }) => {
  await resize(page, "a", 35);
  await page.getByRole("button", { name: "切换容器" }).click();
  const scroll = main(page).locator(".qizhi-table__scroll");
  expect(await scroll.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await scroll.evaluate((el) => { el.scrollLeft = 180; });
  for (const key of ["a", "b", "f"]) {
    const geometry = await main(page).evaluate((root, key) => {
      const th = root.querySelector(`th[data-column-key="${key}"]`)!;
      const td = root.querySelector(`td[data-column-key="${key}"]`)!;
      return { h: th.getBoundingClientRect().toJSON(), d: td.getBoundingClientRect().toJSON(), left: getComputedStyle(th).left };
    }, key);
    expect(geometry.h.width).toBeCloseTo(geometry.d.width, 0);
    expect(geometry.h.x).toBeCloseTo(geometry.d.x, 0);
    if (key === "b") expect(parseFloat(geometry.left)).toBeCloseTo(135, 0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("隐藏重现保留完整顺序及手动宽度，父重绘与容器变化不重置", async ({ page }) => {
  await resize(page, "b", 25);
  await cell(page, "b").getByRole("button", { name: "移动列 乙" }).press("ArrowLeft");
  await main(page).getByRole("button", { name: "列设置" }).click();
  await page.getByRole("checkbox", { name: "乙", exact: true }).locator("..").click();
  await expect(cell(page, "b")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "乙", exact: true }).locator("..").click();
  expect((await order(page)).slice(0, 2)).toEqual(["b", "a"]);
  expect(await width(cell(page, "b"))).toBeCloseTo(145, 0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "父重绘" }).click();
  await page.getByRole("button", { name: "切换容器" }).click();
  expect(await width(cell(page, "b"))).toBeCloseTo(145, 0);
});
test("同固定区指针移动，锁列和固定区屏障阻断，键盘调宽", async ({ page }) => {
  await cell(page, "b").getByRole("button", { name: "移动列 乙" }).dragTo(cell(page, "a"), { targetPosition: { x: 10, y: 12 } });
  await expect.poll(() => order(page)).toEqual(["b", "a", "c", "d", "e", "f"]);
  await cell(page, "c").getByRole("button", { name: "移动列 内容" }).press("ArrowRight");
  await cell(page, "a").getByRole("button", { name: "移动列 甲" }).press("ArrowRight");
  expect(await order(page)).toEqual(["b", "a", "c", "d", "e", "f"]);
  const separator = cell(page, "a").getByRole("separator");
  const before = await width(cell(page, "a"));
  await separator.press("ArrowRight");
  await separator.press("Shift+ArrowLeft");
  expect(await width(cell(page, "a"))).toBeCloseTo(before + 7, 0);
});
test("受控拒绝保持表格和设置面板权威值", async ({ page }) => {
  await page.goto(`${fixture}?mode=reject`);
  const before = await width(cell(page, "a"));
  await resize(page, "a", 30);
  expect(await width(cell(page, "a"))).toBeCloseTo(before, 0);
  await main(page).getByRole("button", { name: "列设置" }).click();
  const input = page.getByRole("spinbutton", { name: "列宽甲" });
  await input.fill("170"); await input.press("Enter"); await input.blur();
  await expect(input).toHaveValue(String(before));
  expect(await width(cell(page, "a"))).toBeCloseTo(before, 0);
});
test("原生auto和百分比首次从真实像素起点调宽，其他列保持", async ({ page }) => {
  await page.goto(`${fixture}?mode=auto`);
  const before = await width(cell(page, "a"));
  const others = await Promise.all(["b", "c"].map((key) => width(cell(page, key))));
  await resize(page, "a", 25);
  await expect.poll(() => width(cell(page, "a"))).toBeCloseTo(before + 25, 0);
  expect(await width(cell(page, "b"))).toBeCloseTo(others[0], 0);
  expect(await width(cell(page, "c"))).toBeCloseTo(others[1], 0);
  await page.getByRole("button", { name: "父重绘" }).click();
  expect(await width(cell(page, "a"))).toBeCloseTo(before + 25, 0);
});
test("auto恢复默认后内容变化，下一次调宽使用新的实际基准", async ({ page }) => {
  await page.goto(`${fixture}?mode=auto`);
  await resize(page, "a", 25);
  await main(page).getByRole("button", { name: "列设置", exact: true }).click();
  await page.getByRole("button", { name: "恢复默认布局" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "改变文本" }).click();
  const before = await width(cell(page, "b"));
  await resize(page, "a", 10);
  await expect.poll(() => width(cell(page, "b"))).toBeCloseTo(before, 0);
});
for (const kind of ["弹窗", "抽屉"]) test(`${kind}中Escape先关列面板并恢复焦点`, async ({ page }) => {
  await page.getByRole("button", { name: `打开${kind}` }).click();
  const table = page.getByRole("table", { name: `${kind}表格` });
  await expect(table).toBeVisible();
  const trigger = table.locator("xpath=../..").getByRole("button", { name: "列设置" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "列设置" })).toBeVisible();
  await page.getByRole("spinbutton", { name: "列宽甲" }).focus();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "列设置" })).toBeHidden();
  await expect(table).toBeVisible();
  await expect(trigger).toBeFocused();
});
