import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const screenshotDir = resolve(root, "screenshots");
const baseUrl = process.env.AGENT_PAGE_URL ?? "http://127.0.0.1:5173/";
await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  permissions: ["clipboard-read", "clipboard-write"],
  acceptDownloads: true,
});
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
const failedResources = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
});

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const checkOverflow = async (label) => {
  const metrics = await page.evaluate(() => {
    const selectors = ["html", "body", ".agent-page-main", ".agent-page-list", ".agent-page-detail"];
    return selectors.map((selector) => {
      const element = document.querySelector(selector);
      return element ? {
        selector,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      } : null;
    }).filter(Boolean);
  });
  metrics.forEach((metric) => {
    assert(metric.scrollWidth <= metric.clientWidth + 1, `${label}: ${metric.selector} 横向溢出 ${metric.scrollWidth}/${metric.clientWidth}`);
  });
  return metrics;
};

const getRow = (name) => page.getByRole("row", { name: new RegExp(name) });

const checkListTable = async (label) => {
  const metrics = await page.evaluate(() => {
    const root = document.querySelector(".agent-page-table");
    const scroller = root?.querySelector(".qizhi-table__scroll");
    const actionHeader = root?.querySelector("th.is-fixed-right");
    const deleteButton = root?.querySelector(".agent-page-row-action-button--delete");
    const deleteCell = deleteButton?.closest("td");
    if (!root || !scroller || !actionHeader || !deleteButton || !deleteCell) return null;
    const rootRect = root.getBoundingClientRect();
    const actionRect = actionHeader.getBoundingClientRect();
    const deleteRect = deleteButton.getBoundingClientRect();
    const deleteCellRect = deleteCell.getBoundingClientRect();
    const probe = document.createElement("span");
    probe.style.color = "var(--color-text-3)";
    document.body.append(probe);
    const expectedDeleteColor = getComputedStyle(probe).color;
    probe.remove();
    return {
      clientWidth: scroller.clientWidth,
      scrollWidth: scroller.scrollWidth,
      actionRight: actionRect.right,
      tableRight: rootRect.right,
      actionPosition: getComputedStyle(actionHeader).position,
      deleteRight: deleteRect.right,
      deleteCellRight: deleteCellRect.right,
      deleteColor: getComputedStyle(deleteButton).color,
      expectedDeleteColor,
    };
  });
  assert(metrics, `${label}: 列表几何数据缺失`);
  assert(metrics.scrollWidth <= metrics.clientWidth + 1, `${label}: 列表出现横向滚动 ${metrics.scrollWidth}/${metrics.clientWidth}`);
  assert(Math.abs(metrics.actionRight - metrics.tableRight) <= 1, `${label}: 操作列未固定在表格右侧`);
  assert(metrics.actionPosition === "sticky", `${label}: 操作列未使用右侧固定能力`);
  assert(metrics.deleteRight <= metrics.deleteCellRight + 1, `${label}: 删除操作被裁切 (${metrics.deleteRight}/${metrics.deleteCellRight})`);
  assert(metrics.deleteColor === metrics.expectedDeleteColor, `${label}: 删除颜色不是 color-text-3 (${metrics.deleteColor}/${metrics.expectedDeleteColor})`);
  return metrics;
};

await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Agent 管理列表" }).waitFor();
assert(await page.getByText("Mock Demo").count() === 0, "列表仍展示 Mock Demo 说明");
assert(await page.getByText("Mock 状态").count() === 0, "列表仍展示 Mock 状态控件");
assert(await page.getByRole("radiogroup", { name: "Agent 范围" }).evaluate((node) => node.classList.contains("qizhi-radio-group-type-button")), "范围切换未使用公共线框型 Radio.Group");
assert(await page.getByRole("combobox", { name: "所属项目筛选" }).inputValue() === "全部", "项目筛选仍包含字段前缀");
await page.getByRole("button", { name: "切换空间，当前HW-H800-Public" }).click();
const workspacePopup = page.locator(".qizhi-side-navigation__workspace-dropdown > .qizhi-dropdown__popup");
await workspacePopup.waitFor();
const workspaceLayer = await workspacePopup.evaluate((popup) => {
  const rect = popup.getBoundingClientRect();
  const probeX = Math.min(window.innerWidth - 1, rect.right - 2);
  const probeY = Math.min(window.innerHeight - 1, rect.top + rect.height / 2);
  const topElement = document.elementFromPoint(probeX, probeY);
  return {
    zIndex: getComputedStyle(popup).zIndex,
    visibleAtOverlap: Boolean(topElement && popup.contains(topElement)),
  };
});
assert(workspaceLayer.visibleAtOverlap, "空间下拉菜单仍被右侧内容遮挡");
await page.screenshot({
  path: resolve(screenshotDir, "00-workspace-dropdown-1440.png"),
  fullPage: false,
});
await page.keyboard.press("Escape");
const [helpBox, languageBox] = await Promise.all([
  page.getByRole("button", { name: "资源/帮助" }).getByText("资源/帮助", { exact: true }).boundingBox(),
  page.getByRole("button", { name: /中文/ }).getByText("中文", { exact: true }).boundingBox(),
]);
assert(helpBox && languageBox && helpBox.x + helpBox.width <= languageBox.x, "1440 顶部工具文字发生重叠");
await checkOverflow("1440 list");
await checkListTable("1440 list");
const listDensity = await page.locator(".agent-page-table").evaluate((table) => {
  const header = table.querySelector(".qizhi-table__th");
  const cell = table.querySelector(".qizhi-table__td");
  return {
    headerHeight: header?.getBoundingClientRect().height ?? 0,
    cellHeight: cell?.getBoundingClientRect().height ?? 0,
  };
});
assert(listDensity.headerHeight === 56, `Agent 表头高度不是旧规范默认值 56px：${listDensity.headerHeight}px`);
assert(listDensity.cellHeight === 56, `Agent 内容行高度不是旧规范默认值 56px：${listDensity.cellHeight}px`);
await page.screenshot({ path: resolve(screenshotDir, "01-list-1440.png"), fullPage: true });

await page.getByPlaceholder("输入关键字搜索").fill("memory-agent");
assert(await page.getByRole("row").count() > 1, "组合筛选后没有结果");
await page.getByPlaceholder("输入关键字搜索").fill("");

await page.getByRole("button", { name: "+ 新建 Agent" }).click();
const createDrawer = page.getByRole("dialog", { name: "新建 Agent" });
await createDrawer.waitFor();
assert(await createDrawer.getByRole("textbox", { name: "版本号" }).isEnabled(), "新建时版本号不可编辑");
assert(await createDrawer.getByRole("radiogroup", { name: "录入方式" }).evaluate((node) => node.classList.contains("qizhi-radio-group-type-button")), "录入方式未使用公共线框型 Radio.Group");
const drawerBodyColors = await createDrawer.locator(".qizhi-drawer-body").evaluate((body) => {
  const probe = document.createElement("span");
  probe.style.background = "var(--color-fill-1)";
  document.body.append(probe);
  const expected = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return { actual: getComputedStyle(body).backgroundColor, expected };
});
assert(drawerBodyColors.actual === drawerBodyColors.expected, `Drawer body 背景不是 color-fill-1：${drawerBodyColors.actual}/${drawerBodyColors.expected}`);
const formGeometry = await createDrawer.evaluate((drawer) => {
  const form = drawer.querySelector(".agent-page-form");
  const body = drawer.querySelector(".qizhi-drawer-body");
  const section = drawer.querySelector(".agent-page-form-section");
  const input = drawer.querySelector(".agent-page-control-full");
  const instruction = drawer.querySelector('[aria-label="Agent 指令内容"]');
  if (!form || !body || !section || !input || !instruction) return null;
  const formStyle = getComputedStyle(form);
  const bodyStyle = getComputedStyle(body);
  return {
    padding: [formStyle.paddingTop, formStyle.paddingRight, formStyle.paddingBottom, formStyle.paddingLeft],
    gap: formStyle.gap,
    bodyPadding: [bodyStyle.paddingTop, bodyStyle.paddingRight, bodyStyle.paddingBottom, bodyStyle.paddingLeft],
    bodyContentWidth: body.clientWidth
      - Number.parseFloat(bodyStyle.paddingLeft)
      - Number.parseFloat(bodyStyle.paddingRight),
    sectionWidth: section.getBoundingClientRect().width,
    inputWidth: input.getBoundingClientRect().width,
    instructionHeight: instruction.getBoundingClientRect().height,
  };
});
assert(formGeometry, "新建表单几何数据缺失");
assert(formGeometry.padding.every((value) => value === "0px"), `表单 padding 未取消：${formGeometry.padding.join("/")}`);
assert(formGeometry.gap === "16px", `表单模块间距不是 16px：${formGeometry.gap}`);
assert(formGeometry.bodyPadding.join("/") === "16px/24px/16px/24px", `Drawer body padding 错误：${formGeometry.bodyPadding.join("/")}`);
assert(Math.abs(formGeometry.sectionWidth - formGeometry.bodyContentWidth) <= 1, `表单分区未跟随 Drawer 内容宽度：${formGeometry.sectionWidth}/${formGeometry.bodyContentWidth}`);
assert(Math.abs(formGeometry.inputWidth - 558) <= 1, `桌面表单输入控件宽度不是 558px：${formGeometry.inputWidth}`);
assert(formGeometry.instructionHeight <= 84, `Agent 指令文本域仍然过高：${formGeometry.instructionHeight}px`);
await createDrawer.getByRole("button", { name: "新建" }).click();
await createDrawer.getByText("请输入 Agent 名称").waitFor();
await createDrawer.getByPlaceholder("请输入 Agent 名称").fill("browser-created-agent");
await createDrawer.getByRole("combobox", { name: "所属项目" }).click();
await page.getByRole("option", { name: "基础-启智" }).click();
await createDrawer.getByRole("textbox", { name: "标签" }).fill("浏览器标签");
await createDrawer.getByPlaceholder("请输入 Agent 指令内容").fill("# Browser Created\n\n- 仅用于本地交互验证");

await createDrawer.getByRole("button", { name: "+ 选择Skill" }).click();
let selector = page.getByRole("dialog", { name: "选择 Skill" });
await selector.getByRole("checkbox", { name: /选择长期记忆/ }).focus();
await page.keyboard.press("Space");
await selector.getByRole("button", { name: "确认" }).click();
await createDrawer.getByText("长期记忆").waitFor();

await createDrawer.getByRole("button", { name: "+ 选择MCP" }).click();
selector = page.getByRole("dialog", { name: "选择 MCP" });
await selector.getByRole("checkbox", { name: /选择知识库 MCP/ }).focus();
await page.keyboard.press("Space");
assert(await selector.getByRole("checkbox", { name: /选择异常示例 MCP/ }).isDisabled(), "异常 MCP 未禁用");
await selector.getByRole("button", { name: "确认" }).click();
await createDrawer.getByText("知识库 MCP").waitFor();
await page.screenshot({ path: resolve(screenshotDir, "02-create-drawer-1440.png"), fullPage: true });
await createDrawer.getByRole("button", { name: "新建" }).click();
await createDrawer.waitFor({ state: "hidden" });
await page.getByPlaceholder("输入关键字搜索").fill("browser-created-agent");
await getRow("browser-created-agent").waitFor();

let row = getRow("browser-created-agent");
assert(await row.getByText("浏览器标签", { exact: true }).count() === 1, "新建后列表未展示已输入标签");
await page.screenshot({ path: resolve(screenshotDir, "02b-created-tag-row-1440.png"), fullPage: true });
await row.getByRole("button", { name: "编辑" }).click();
const editDrawer = page.getByRole("dialog", { name: "编辑 Agent" });
await editDrawer.waitFor();
assert(await editDrawer.getByRole("textbox", { name: "版本号" }).isDisabled(), "编辑时版本号仍可编辑");
const description = editDrawer.getByPlaceholder("请输入 Agent 的功能描述");
await description.fill("浏览器已编辑描述");
await page.screenshot({ path: resolve(screenshotDir, "03-edit-drawer-1440.png"), fullPage: true });
await editDrawer.getByRole("button", { name: "保存" }).click();
await editDrawer.waitFor({ state: "hidden" });

row = getRow("browser-created-agent");
await row.getByRole("button", { name: "编辑" }).click();
await page.getByRole("dialog", { name: "编辑 Agent" }).getByPlaceholder("请输入 Agent 的功能描述").fill("未保存内容");
await page.getByRole("button", { name: "关闭抽屉", exact: true }).click();
let discard = page.getByRole("dialog", { name: "放弃未保存内容" });
await discard.getByRole("button", { name: "继续编辑" }).click();
await page.getByRole("button", { name: "关闭抽屉", exact: true }).click();
discard = page.getByRole("dialog", { name: "放弃未保存内容" });
await discard.getByRole("button", { name: "放弃并关闭" }).click();
await page.getByRole("dialog", { name: "编辑 Agent" }).waitFor({ state: "hidden" });

row = getRow("browser-created-agent");
await row.getByRole("button", { name: "详情" }).click();
await page.getByText("Agent 详情").waitFor();
assert(await page.locator(".agent-page-detail-header-card.qizhi-detail-header").count() === 1, "详情页未复用公共 DetailHeader");
await checkOverflow("1440 detail");
await page.screenshot({ path: resolve(screenshotDir, "04-detail-1440.png"), fullPage: true });
const instructionSwitch = page.getByRole("radiogroup", { name: "指令查看模式" });
await instructionSwitch.getByText("Markdown", { exact: true }).click();
await page.locator(".agent-page-instruction-markdown").waitFor();
await instructionSwitch.getByText("预览", { exact: true }).click();

await page.getByRole("button", { name: "+ 新增版本" }).click();
const versionDrawer = page.getByRole("dialog", { name: "新增版本" });
await versionDrawer.getByRole("button", { name: "新建" }).click();
await versionDrawer.waitFor({ state: "hidden" });
await page.getByRole("button", { name: /V2/ }).waitFor();

await page.getByRole("button", { name: "返回 Agent 管理列表" }).click();
await page.waitForTimeout(3200);
await page.getByPlaceholder("输入关键字搜索").fill("memory-agent-01");
row = getRow("memory-agent-01");
await row.getByRole("button", { name: "删除" }).click();
let deleteDialog = page.getByRole("dialog", { name: "删除 Agent" });
await page.waitForTimeout(250);
await page.screenshot({ path: resolve(screenshotDir, "05-delete-confirm-1440.png"), fullPage: true });
await deleteDialog.getByRole("button", { name: "删除" }).click();
await deleteDialog.getByText("该 Agent 仍被其他对象引用，当前不会执行删除。").waitFor();
await deleteDialog.getByRole("button", { name: "知道了" }).click();

const scopeSwitch = page.getByRole("radiogroup", { name: "Agent 范围" });
await scopeSwitch.getByText("全部", { exact: true }).click();
await page.getByPlaceholder("输入关键字搜索").fill("analysis-agent-02");
row = getRow("analysis-agent-02");
await row.getByRole("button", { name: "删除" }).click();
deleteDialog = page.getByRole("dialog", { name: "删除 Agent" });
await deleteDialog.getByRole("button", { name: "删除" }).click();
await deleteDialog.getByText("删除失败，请重试或取消。").waitFor();
await page.screenshot({ path: resolve(screenshotDir, "06-delete-failure-1440.png"), fullPage: true });
await deleteDialog.getByRole("button", { name: "取消" }).click();

await scopeSwitch.getByText("我创建的", { exact: true }).click();
await page.getByPlaceholder("输入关键字搜索").fill("analysis-agent-03");
row = getRow("analysis-agent-03");
await row.getByRole("button", { name: "删除" }).click();
deleteDialog = page.getByRole("dialog", { name: "删除 Agent" });
await deleteDialog.getByRole("button", { name: "删除" }).click();
await row.waitFor({ state: "hidden" });

await page.setViewportSize({ width: 1024, height: 900 });
await page.reload({ waitUntil: "networkidle" });
await checkOverflow("1024 list");
await checkListTable("1024 list");
await page.screenshot({ path: resolve(screenshotDir, "07-list-1024.png"), fullPage: true });

await page.setViewportSize({ width: 375, height: 812 });
await page.reload({ waitUntil: "networkidle" });
const mobileMetrics = await checkOverflow("375 list");
await checkListTable("375 list");
const mobileMainBox = await page.locator(".agent-page-workspace-main").boundingBox();
assert(mobileMainBox && mobileMainBox.y < 650, "375 左侧导航过高，主内容被推离首屏");
const mobileSiderOverflow = await page.locator(".agent-page-sider").evaluate((node) => (
  getComputedStyle(node).overflow
));
assert(mobileSiderOverflow === "hidden", "375 左侧导航子内容可能与主内容叠压");
const directChildren = await page.evaluate(() => {
  const toolbar = document.querySelector(".agent-page-toolbar");
  return toolbar ? [...toolbar.children].map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, left: rect.left, right: rect.right };
  }) : [];
});
assert(directChildren.every((child) => child.right <= 375.5 && child.left >= -0.5), "375 toolbar 直接子项越界");
await page.screenshot({ path: resolve(screenshotDir, "08-list-375.png"), fullPage: true });
await page.getByRole("button", { name: "+ 新建 Agent" }).click();
const mobileDrawer = page.getByRole("dialog", { name: "新建 Agent" });
const drawerBox = await mobileDrawer.boundingBox();
assert(drawerBox && drawerBox.x >= 0 && drawerBox.x + drawerBox.width <= 375.5, "375 Drawer 越出视口");
await page.screenshot({ path: resolve(screenshotDir, "09-create-drawer-375.png"), fullPage: false });
await mobileDrawer.getByRole("button", { name: "取消" }).click();

assert(consoleErrors.length === 0, `控制台错误：${consoleErrors.join(" | ")}`);
assert(pageErrors.length === 0, `页面错误：${pageErrors.join(" | ")}`);
assert(failedResources.length === 0, `资源加载错误：${failedResources.join(" | ")}`);

console.log(JSON.stringify({
  status: "browser_candidate_pass",
  viewports: [1440, 1024, 375],
  screenshots: 11,
  consoleErrors,
  pageErrors,
  failedResources,
  mobileMetrics,
  directChildren,
}, null, 2));

await browser.close();
