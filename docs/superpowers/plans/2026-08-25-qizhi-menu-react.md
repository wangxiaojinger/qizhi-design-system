# QIZHI Menu React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站两个 Menu Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式 Menu 复合组件和同源 React Island 文档。

**Architecture:** 使用 `Menu`、`Menu.Item`、`Menu.Group` 统一水平和垂直菜单，通过 Context 管理选择与 roving tabindex。顶部导航和左侧框架只承担 Demo 布局，机房、语言、空间及溢出选择继续复用公共 Dropdown。

**Tech Stack:** React 19、TypeScript、CSS、Vitest、Testing Library、Playwright、Vite、pnpm。

**Spec:** `docs/superpowers/specs/2026-08-25-qizhi-menu-react-design.md`

## Global Constraints

- 只实现水平、垂直、分组、菜单项、选中、禁用和键盘导航；不发布 SubMenu 或 `defaultOpenKeys`。
- 保留两个旧站 Demo 的标题、说明、顺序、数据、布局、尺寸、初始状态与已证实交互。
- Demo 不使用原生 `button`、`input`、`select`、`textarea`、自写 SVG、内联布局样式或 Menu 私有 `__*` 选择器。
- 顶部机房、语言、溢出项和左侧工作空间选择复用公共 Dropdown；分隔线复用 Divider；图标只使用正式 QIZHI Icon。
- 左侧外框为 `210px × 800px`，内边距 `54px 20px 24px 24px`，菜单内部宽度 `166px`，菜单项内边距 `8px 12px`。
- React Demo TSX 是预览、展示和复制代码的唯一来源。
- 文档操作区复用 `component-example-actions`、QIZHI Button、CodeIcon、CopyIcon 和 `qizhi-code-action`；预览到操作区 `12px`，操作区右内边距 `0px`。
- 视觉验收覆盖 1440、1024、375 三档、计算样式、真实坐标、完整交互、复制内容、控制台、溢出和人工截图。
- 自动验证最高标记为 `candidate_pass`，独立最终验收保持 `pending`。

---

### Task 1: 公共 Menu 复合组件和状态模型

**Files:**
- Create: `packages/qizhi-react/src/menu/Menu.types.ts`
- Create: `packages/qizhi-react/src/menu/Menu.tsx`
- Create: `packages/qizhi-react/src/menu/menu.css`
- Create: `packages/qizhi-react/src/menu/Menu.test.tsx`
- Create: `packages/qizhi-react/src/menu/Menu.types.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: React `Children`、Context、`forwardRef`、`useId`、`useRef`、`useState`；正式 QIZHI Icon 作为 `ReactNode` 传入。
- Produces: `Menu`, `Menu.Item`, `Menu.Group`, `MenuProps`, `MenuItemProps`, `MenuGroupProps`, `MenuMode`, `MenuComponent`。

- [ ] **Step 1: 写公共行为失败测试**

在 `Menu.test.tsx` 建立以下真实行为：

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { Menu } from "./Menu";

describe("Menu", () => {
  it("selects items in uncontrolled mode and reports the selected key", () => {
    const onSelect = vi.fn();
    render(
      <Menu defaultSelectedKey="model" onSelect={onSelect} aria-label="功能导航">
        <Menu.Item itemKey="workbench">工作台</Menu.Item>
        <Menu.Item itemKey="model">模型服务</Menu.Item>
      </Menu>,
    );
    const model = screen.getByRole("menuitem", { name: "模型服务" });
    const workbench = screen.getByRole("menuitem", { name: "工作台" });
    expect(model).toHaveAttribute("aria-current", "page");
    expect(model).toHaveAttribute("tabindex", "0");
    fireEvent.click(workbench);
    expect(workbench).toHaveAttribute("aria-current", "page");
    expect(onSelect).toHaveBeenCalledWith("workbench");
  });

  it("keeps controlled selection owned by the caller", () => {
    const onSelect = vi.fn();
    render(
      <Menu selectedKey="model" onSelect={onSelect} aria-label="受控导航">
        <Menu.Item itemKey="workbench">工作台</Menu.Item>
        <Menu.Item itemKey="model">模型服务</Menu.Item>
      </Menu>,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "工作台" }));
    expect(onSelect).toHaveBeenCalledWith("workbench");
    expect(screen.getByRole("menuitem", { name: "模型服务" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("uses direction-aware roving focus and skips disabled items", () => {
    render(
      <Menu mode="horizontal" defaultSelectedKey="model" aria-label="顶部导航">
        <Menu.Item itemKey="workbench">工作台</Menu.Item>
        <Menu.Item itemKey="disabled" disabled>不可用</Menu.Item>
        <Menu.Item itemKey="model">模型服务</Menu.Item>
      </Menu>,
    );
    const model = screen.getByRole("menuitem", { name: "模型服务" });
    model.focus();
    fireEvent.keyDown(model, { key: "ArrowRight" });
    expect(screen.getByRole("menuitem", { name: "工作台" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(model).toHaveFocus();
  });

  it("renders vertical groups, icons, disabled semantics and forwarded refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Menu ref={ref} aria-label="侧边导航">
        <Menu.Group title="模型开发与训练">
          <Menu.Item itemKey="interactive" icon={<span data-testid="icon" />}>
            交互式建模
          </Menu.Item>
          <Menu.Item itemKey="disabled" disabled>不可用</Menu.Item>
        </Menu.Group>
      </Menu>,
    );
    expect(ref.current).toHaveAttribute("role", "menu");
    expect(screen.getByRole("group", { name: "模型开发与训练" }))
      .toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "不可用" }))
      .toHaveAttribute("aria-disabled", "true");
    expect(screen.getByTestId("icon").parentElement)
      .toHaveAttribute("aria-hidden", "true");
  });
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
pnpm exec vitest run packages/qizhi-react/src/menu/Menu.test.tsx
```

Expected: FAIL，因为 `./Menu` 尚不存在；修正任何测试语法问题后仍应因公共组件缺失而失败。

- [ ] **Step 3: 写类型契约失败测试**

在 `Menu.types.test.tsx` 中锁定复合 API，不允许 SubMenu：

```tsx
import { Menu } from "./Menu";

describe("Menu type contract", () => {
  it("publishes only the approved compound API", () => {
    const menu = (
      <Menu mode="horizontal" defaultSelectedKey="home">
        <Menu.Item itemKey="home">首页</Menu.Item>
        <Menu.Group title="分组">
          <Menu.Item itemKey="detail">详情</Menu.Item>
        </Menu.Group>
      </Menu>
    );
    // @ts-expect-error v1 没有 SubMenu。
    const submenu = <Menu.SubMenu itemKey="more" title="更多" />;
    // @ts-expect-error v1 没有 defaultOpenKeys。
    const openKeys = <Menu defaultOpenKeys={["more"]} />;
    expect(menu).toBeTruthy();
    expect(submenu).toBeTruthy();
    expect(openKeys).toBeTruthy();
  });
});
```

- [ ] **Step 4: 实现最小类型和组件**

`Menu.types.ts` 使用以下签名：

```tsx
export type MenuMode = "horizontal" | "vertical";

export interface MenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  mode?: MenuMode;
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface MenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  itemKey: string;
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  title: ReactNode;
  children?: ReactNode;
}

export interface MenuComponent {
  (props: MenuProps): ReactElement;
  Item: (props: MenuItemProps) => ReactElement;
  Group: (props: MenuGroupProps) => ReactElement;
}
```

`Menu.tsx` 必须：

- 使用 Context 向 Item 提供 mode、selectedKey、选择函数和注册/聚焦能力。
- 根角色按 mode 输出 `menubar` 或 `menu`。
- 只查询当前 Menu 根内、属于该根的可用 `.qizhi-menu__item`，避免嵌套消费者串线。
- Left/Right 或 Up/Down 循环导航，Home/End 跳到首尾，跳过 disabled。
- 键盘移动只聚焦，不触发选择。
- 受控模式不写内部 selectedKey；非受控模式点击后更新内部状态。
- Group 使用 `useId()` 生成标题 ID，并以 `role="group" aria-labelledby` 关联。

- [ ] **Step 5: 实现公共样式**

`menu.css` 只定义组件能力：

```css
.qizhi-menu { box-sizing: border-box; }
.qizhi-menu--horizontal { display: flex; align-items: center; }
.qizhi-menu--vertical { display: flex; flex-direction: column; }
.qizhi-menu__item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-2);
  font: inherit;
  cursor: pointer;
}
.qizhi-menu__item.is-selected {
  background: var(--color-primary-light-1);
  color: rgb(var(--primary-6));
}
.qizhi-menu__item:focus-visible {
  outline: 2px solid rgb(var(--primary-6));
  outline-offset: 2px;
}
.qizhi-menu__item:disabled { cursor: not-allowed; opacity: 0.5; }
.qizhi-menu__item-icon { display: inline-flex; flex: 0 0 auto; }
.qizhi-menu__item-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qizhi-menu__group { display: flex; flex-direction: column; }
```

- [ ] **Step 6: 导出并验证 GREEN**

在 `packages/qizhi-react/src/index.ts` 导出组件、类型并导入 `menu.css`。运行：

```bash
pnpm exec vitest run packages/qizhi-react/src/menu/Menu.test.tsx packages/qizhi-react/src/menu/Menu.types.test.tsx
pnpm --filter @wangxiaojinger/qizhi-react typecheck
```

Expected: 全部 PASS，TypeScript 无错误。

- [ ] **Step 7: 提交 Task 1 范围文件**

```bash
git add packages/qizhi-react/src/menu packages/qizhi-react/src/index.ts
git commit -m "feat(menu): add public compound component"
```

只在独立且干净的执行工作树提交；共享脏工作树中保留为未提交范围改动并在交付时说明。

---

### Task 2: 两个旧站 Demo、API 与同源文档

**Files:**
- Create: `apps/qizhi-docs/src/menu/MenuDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/menu/MenuDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/menu/MenuApiTable.tsx`
- Create: `apps/qizhi-docs/src/menu/menuApi.ts`
- Create: `apps/qizhi-docs/src/menu/menuDocs.registry.ts`
- Create: `apps/qizhi-docs/src/menu/menuDocs.css`
- Create: `apps/qizhi-docs/src/menu/demos/TopNavigationDemo.tsx`
- Create: `apps/qizhi-docs/src/menu/demos/SideMenuDemo.tsx`
- Create: `apps/qizhi-docs/src/menu/menuDocs.test.tsx`

**Interfaces:**
- Consumes: Task 1 的 `Menu`, `Menu.Item`, `Menu.Group`；现有 `Dropdown`, `Divider`, `Button`, `CodeIcon`, `CopyIcon` 与正式 QIZHI Icon。
- Produces: `menuDemos`, `menuApi`, `MenuDocsIsland`，供 Task 3 挂载和 Task 4 E2E 使用。

- [ ] **Step 1: 写旧站保真和边界失败测试**

`menuDocs.test.tsx` 锁定：

```tsx
expect(menuDemos.map((demo) => [demo.id, demo.title, demo.description]))
  .toEqual([
    [
      "顶部导航菜单",
      "顶部导航栏",
      "设置 mode 为 horizontal 时，使用水平菜单。",
    ],
    [
      "左侧菜单",
      "左侧菜单",
      "菜单内可以嵌入多个子项，通过 defaultOpenKeys 可以设置默认打开的子项。",
    ],
  ]);

expect(screen.getByRole("menuitem", { name: "模型服务" }))
  .toHaveAttribute("aria-current", "page");
expect(screen.getByRole("menuitem", { name: "空间概览" }))
  .toHaveAttribute("aria-current", "page");

for (const demo of menuDemos) {
  expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
  expect(demo.source).not.toMatch(/<(button|input|select|textarea)\b/);
  expect(demo.source).not.toContain("<svg");
  expect(demo.source).not.toContain("style={{");
  expect(demo.source).not.toMatch(/qizhi-menu__/);
  expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
    .toBeLessThanOrEqual(80);
}
```

再断言每个 Codebox 均有 `查看代码`、`复制代码`，不存在 `Demo.tsx` 路径 UI；API 名称精确为：

```tsx
[
  "mode",
  "selectedKey",
  "defaultSelectedKey",
  "onSelect",
  "children",
  "className",
  "style",
  "ref",
]
```

- [ ] **Step 2: 运行测试并确认 RED**

```bash
pnpm exec vitest run apps/qizhi-docs/src/menu/menuDocs.test.tsx
```

Expected: FAIL，因为 Menu 文档注册表和 Island 尚不存在。

- [ ] **Step 3: 实现顶部导航 Demo**

`TopNavigationDemo.tsx`：

- 使用 `useState("model-service")` 控制 Menu 选中项。
- Menu.Item 数据精确保留：工作台、定制模型、模型服务、Agent、探索、运营中心。
- 机房 Dropdown 初始七宝机房；保留松江、长名称张江机房和禁用机房。
- 语言 Dropdown 初始中文，提供 English。
- 窄屏溢出 Dropdown 只承载当前不可见主菜单项，并选择后同步 Menu selectedKey。
- Logo 用现有 `assets/qizhi-logo.svg`；探索、运营中心、帮助、语言、头像使用正式 QIZHI Icon，不使用 `<img>` 图标或自写 SVG。
- Demo 布局只使用 `menu-top-demo__*` 类，不能选择 `.qizhi-menu__*`。

- [ ] **Step 4: 实现左侧菜单 Demo**

`SideMenuDemo.tsx`：

- 使用 Dropdown 控制工作空间，初始“空间名称4”，提供空间名称1–5。
- 使用 Menu vertical，`defaultSelectedKey="overview"`。
- 使用 Menu.Group 保留分组：模型开发与训练、模型评测、数据管理、OpenClaw、AI资产管理。
- 保留菜单项：空间概览、交互式建模、分布式训练、弹性计算、大模型微调、高性能计算、评测集管理、评测任务、数据集管理、OpenClaw 工作台、文件、镜像管理、模型服务。
- 工作空间触发器复用 QIZHI Button 或 Dropdown 接受的正式触发组件；长名称通过 Tooltip 或现有 `data-tooltip` 公共能力在 hover/focus 显示完整文本。

- [ ] **Step 5: 实现注册表、API 和公共 Codebox 外壳**

- `menuDocs.registry.ts` 使用 `?raw` 导入两个真实 Demo TSX。
- `MenuDemoCodebox.tsx` 复制现有 Button 基线的结构与 `useCopyFeedback`，不维护第二份代码字符串。
- `menuApi.ts` 使用 `ComponentApiItem<keyof MenuProps>` 约束 API 表。
- `MenuApiTable.tsx` 使用公共 `ApiTable`，表格无障碍名称为 `Menu API`。
- `MenuDocsIsland.tsx` 保留标题“菜单 Menu”和说明“收纳、排列并展示一系列选项的列表。”。

- [ ] **Step 6: 实现 Demo 布局样式**

`menuDocs.css` 只选择 Demo 自有类和公共组件根类，不选择 `.qizhi-menu__*`、`.qizhi-dropdown__*` 等私有后代。必须包含：

```css
#component-menu .codebox-wrapper > .demo { margin-bottom: 12px; }
#component-menu .component-example-actions { padding-right: 0; }
.menu-side-demo__viewport {
  box-sizing: border-box;
  width: min(100%, 210px);
  height: 800px;
  padding: 54px 20px 24px 24px;
  overflow-x: hidden;
  overflow-y: auto;
  background: #dce8ff;
}
.menu-side-demo__content { width: min(100%, 166px); }
```

菜单项 `8px 12px` 内边距属于 Menu vertical 正式视觉能力，应放在公共 `menu.css` 的 vertical 规则中，不由 Demo 覆盖私有 Item。

- [ ] **Step 7: 运行文档测试并确认 GREEN**

```bash
pnpm exec vitest run apps/qizhi-docs/src/menu/menuDocs.test.tsx packages/qizhi-react/src/menu/Menu.test.tsx
```

Expected: 全部 PASS。

- [ ] **Step 8: 提交 Task 2 范围文件**

```bash
git add apps/qizhi-docs/src/menu packages/qizhi-react/src/menu/menu.css
git commit -m "docs(menu): migrate legacy demos to React"
```

只提交上述路径，不混入共享工作树中的其他组件改动。

---

### Task 3: React Island 接入、契约和消费范围检查

**Files:**
- Create: `apps/qizhi-docs/src/menu/main.tsx`
- Create: `docs/specs/qizhi-menu-contract-v1.md`
- Create: `tests/contracts/menu-style-ownership.test.ts`
- Modify: `index.html`
- Verify: `packages/qizhi-react/src/dropdown/*`
- Verify: `apps/qizhi-docs/src/dropdown/*`
- Verify: `packages/qizhi-react/src/cascader/CascaderPopup.tsx`

**Interfaces:**
- Consumes: Task 2 的 `MenuDocsIsland`。
- Produces: `#component-menu[data-react-island="menu"]` 和 `/apps/qizhi-docs/src/menu/main.tsx` 入口。

- [ ] **Step 1: 写 Island 与样式所有权失败测试**

`menu-style-ownership.test.ts` 读取真实文件并断言：

```ts
expect(indexSource).toContain(
  '<section class="doc-section" id="component-menu" data-react-island="menu"></section>',
);
expect(indexSource).toContain(
  '<script type="module" src="/apps/qizhi-docs/src/menu/main.tsx"></script>',
);
expect(demoCss).not.toMatch(/\.qizhi-(menu|dropdown|divider|btn)__[\w-]+/);
for (const source of demoSources) {
  expect(source).not.toMatch(/<(button|input|select|textarea)\b/);
  expect(source).not.toContain("<svg");
  expect(source).not.toContain("style={{");
}
```

- [ ] **Step 2: 运行契约测试并确认 RED**

```bash
pnpm exec vitest run tests/contracts/menu-style-ownership.test.ts
```

Expected: FAIL，因为 `index.html` 尚未挂载 Menu React Island。

- [ ] **Step 3: 接入 React Island**

`main.tsx`：

```tsx
import { createRoot } from "react-dom/client";
import { MenuDocsIsland } from "./MenuDocsIsland";

const root = document.getElementById("component-menu");
if (root) createRoot(root).render(<MenuDocsIsland />);
```

将 `index.html` 原 Menu 静态区块替换为空 Island 容器，并在其他 React Island 入口附近增加 Menu module script。只改 HTML 时不修改 `styles.css`、`script.js` 或资源查询版本。

- [ ] **Step 4: 写正式 v1 契约**

`qizhi-menu-contract-v1.md` 必须记录：两个旧站 Demo、明确排除 SubMenu/defaultOpenKeys、公共 API、Dropdown/Divider/Icon 复用、210px/166px 几何、键盘与验收状态。

- [ ] **Step 5: 搜索全部相近消费者并记录边界**

```bash
rg -n "Dropdown\.Menu|Dropdown\.Item|role=\"menu\"|role=\"menubar\"|qizhi-menu" \
  packages/qizhi-react/src apps/qizhi-docs/src
```

确认：

- Dropdown 浮层继续使用 Dropdown.Menu/Item，不迁移为站内导航 Menu。
- Cascader listbox 继续复用 Dropdown.Menu/Item 的容器能力，不改成 Menu 语义。
- 文档站全局左侧壳层仍是静态站路由，不在本任务中迁移。
- 只记录任务外发现，不扩大修改范围。

- [ ] **Step 6: 验证契约、文档和类型**

```bash
pnpm exec vitest run \
  packages/qizhi-react/src/menu/Menu.test.tsx \
  packages/qizhi-react/src/menu/Menu.types.test.tsx \
  apps/qizhi-docs/src/menu/menuDocs.test.tsx \
  tests/contracts/menu-style-ownership.test.ts
pnpm typecheck
node --check script.js
```

Expected: 全部 PASS。

- [ ] **Step 7: 提交 Task 3 范围文件**

```bash
git add index.html apps/qizhi-docs/src/menu/main.tsx \
  docs/specs/qizhi-menu-contract-v1.md \
  tests/contracts/menu-style-ownership.test.ts
git commit -m "feat(menu): mount React Island and lock contracts"
```

---

### Task 4: 三档 E2E、截图和完成门禁

**Files:**
- Create: `tests/e2e/menu-react-island.spec.ts`
- Create: `docs/verification/menu-react-island.md`
- Verify: `test-results/**/menu-*.png`

**Interfaces:**
- Consumes: Task 3 已挂载的 `#component-menu`、两个 Codebox 和 Menu API 表。
- Produces: 1440/1024/375 的浏览器证据和 `candidate_pass` 验证记录。

- [ ] **Step 1: 写 E2E 真实行为测试**

`menu-react-island.spec.ts` 必须：

- 监听 console error 和 pageerror。
- 访问 `/#component-menu`，断言 2 个 Demo 和 Menu API 表。
- 顶部初始选中“模型服务”，点击“工作台”后实际 `aria-current` 和样式同步。
- 从工作台使用 End、Home、Right 等真实按键验证焦点坐标变化且不自动选中。
- 打开机房 Dropdown，验证长名称、省略、禁用项、选择后标签更新、Escape 关闭和焦点恢复。
- 打开语言 Dropdown 并切换 English，再切回中文。
- 在窄屏验证主菜单滚动或溢出 Dropdown 的真实可用路径，不以 hidden 类名代替坐标检查。
- 左侧外框桌面宽 210px、高 800px，内部宽 166px；375 下宽度不超过 Demo clientWidth。
- 左侧初始选中“空间概览”，Down/End/Home 跳过不可用项并保持 roving tabindex。
- 工作空间 Dropdown 选择后同步文本、`aria-checked`、关闭和焦点恢复。
- 每个 Demo `scrollWidth <= clientWidth`，页面无横向溢出。
- 展开第一份代码并比较 `navigator.clipboard.readText()` 与渲染 `pre` 的全文。
- 验证 `.demo` margin-bottom 为 12px，操作区 padding-right 为 0px。
- 截取顶部导航默认/Dropdown 打开态、左侧菜单默认/空间 Dropdown 打开态和 375 手机布局。

- [ ] **Step 2: 启动或复用 Vite 预览**

```bash
pnpm exec vite --host 127.0.0.1 --port 5181
```

若端口占用，使用 Vite 输出的明确端口，并设置 `QIZHI_DOCS_BASE_URL`。

- [ ] **Step 3: 运行三档 E2E**

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5181 \
  pnpm exec playwright test tests/e2e/menu-react-island.spec.ts
```

Expected: desktop-1440、narrow-1024、mobile-375 全部 PASS；无新增控制台错误。

- [ ] **Step 4: 人工查看截图**

使用图像查看工具逐张检查：

- 顶部菜单选中背景、分隔、Logo、Dropdown 边缘和滚动遮罩。
- 210px 左侧框架、166px 内容、54/20/24/24 内边距、8/12 菜单项内边距。
- 长文本省略、Tooltip、焦点环、Dropdown 阴影和最近容器边界。
- 375 下没有文字遮挡、控件裁切或不可操作区域。

任何视觉异常都先增加失败断言，再按 TDD 修复。

- [ ] **Step 5: 写验证记录**

`menu-react-island.md` 记录命令、视口、计算尺寸、交互路径、截图结论、控制台结果和 `candidate_pass / independent acceptance pending`。

- [ ] **Step 6: 运行最终全量门禁**

```bash
pnpm test
pnpm typecheck
pnpm build
node --check script.js
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5181 \
  pnpm exec playwright test tests/e2e/menu-react-island.spec.ts
curl -sS -o /dev/null -w '%{http_code}\n' \
  'http://127.0.0.1:5181/#component-menu'
```

Expected: 单元/契约测试 0 failure；类型检查和构建 exit 0；三档 E2E 全部 PASS；预览返回 200。构建若只有仓库现存的大 chunk warning，记录为已知非阻断警告。

- [ ] **Step 7: 提交 Task 4 范围文件**

```bash
git add tests/e2e/menu-react-island.spec.ts \
  docs/verification/menu-react-island.md
git commit -m "test(menu): verify responsive React Island"
```

共享脏工作树不自动提交；交付时列出实际新增和修改文件。
