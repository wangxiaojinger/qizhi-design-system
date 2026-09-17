# QIZHI Button React Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保留现有静态规范站及未迁移分类，将【按钮 Button】替换为调用 `@wangxiaojinger/qizhi-react` 正式 Button 包的 React Island，并让七组 Demo、展示源码和 API 同源。

**Architecture:** 根目录新增 pnpm workspace 和 Vite 入口；`packages/qizhi-react` 独占 Button 实现、类型、图标和公共样式，`apps/qizhi-docs` 只负责 Button 文档数据、Demo 与交互。现有 `index.html` 仅将 `#components-button` 的静态正文替换为 React root，其他静态章节及现有 `script.js` 保持工作。

**Tech Stack:** React 19.2.8、TypeScript 7.0.2、Vite 8.2.1、pnpm 11.19.0、Vitest 4.1.10、Testing Library、Playwright、CSS Custom Properties。

**Spec:** `docs/superpowers/specs/2026-08-18-button-react-island-design.md`

## Global Constraints

- 当前目录不是 Git 仓库；不得声称生成 commit。每个任务以聚焦测试和文件差异清单作为检查点。
- 旧规范站是视觉和内容基线；除 `#components-button` 及其专属脚本/样式外，不重构其他分类。
- `packages/qizhi-react` 是 Button 唯一实现来源；文档站不得定义本地 Button 或复制公共 Button 样式。
- 保留七个章节、现有示例数量、中文文案、图标资产、hash、左侧导航和右侧目录。
- 不新增 `arco-*` 或 `ac-*` 命名；公共命名使用 `qizhi` / `qz`。
- 展示代码必须来自实际 Demo 文件；API 属性名必须受 `keyof ButtonProps` 约束。
- 本期不实现 CodePen、CodeSandbox、码上掘金或其他组件迁移。
- 浏览器验收固定覆盖 1440、1024、375；完成状态最高为 `candidate_pass`，独立验证为 `pending`。

---

### Task 1: 建立可验证的 React Workspace 与静态站入口

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/contracts/workspace.test.ts`
- Modify: `index.html`（只增加 React module 入口，暂不替换 Button DOM）
- Create: `apps/qizhi-docs/src/button/main.tsx`
- Create: `apps/qizhi-docs/src/button/WorkspaceProbe.tsx`

**Interfaces:**
- Produces: 根级命令 `pnpm test`、`pnpm typecheck`、`pnpm build`、`pnpm dev`；Vite 可加载旧 `index.html`、`styles.css`、`script.js` 和 React module。
- Consumes: 当前静态站根页面和本地资产。

- [ ] **Step 1: 写 workspace 失败测试**

```tsx
import { render, screen } from "@testing-library/react";
import { WorkspaceProbe } from "../../apps/qizhi-docs/src/button/WorkspaceProbe";

it("mounts a React island without replacing the legacy document shell", () => {
  render(<WorkspaceProbe />);
  expect(screen.getByTestId("qizhi-react-island")).toHaveTextContent("Button React Island");
});
```

- [ ] **Step 2: 运行测试并确认因模块与工具链不存在而失败**

Run: `pnpm vitest run tests/contracts/workspace.test.ts`

Expected: FAIL，错误明确指向 `WorkspaceProbe` 或测试配置不存在。

- [ ] **Step 3: 添加最小 workspace 配置**

根 `package.json` 固定包含：

```json
{
  "name": "qizhi-design-system",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.19.0",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build && pnpm --filter @wangxiaojinger/qizhi-react build",
    "typecheck": "pnpm -r typecheck",
    "test": "vitest run",
    "e2e": "playwright test",
    "verify": "pnpm typecheck && pnpm test && pnpm build"
  }
}
```

`pnpm-workspace.yaml` 精确包含 `packages/*` 和 `apps/*`。Vite 使用根 `index.html` 作为页面入口，别名 `@wangxiaojinger/qizhi-react` 在开发/测试阶段指向 `packages/qizhi-react/src/index.ts`。

- [ ] **Step 4: 实现最小 React probe 与 module mount**

`main.tsx` 仅在 `#qizhi-button-react-root` 存在时挂载；Task 1 暂不在生产 HTML 放置该 root，避免出现双份 Button。

- [ ] **Step 5: 安装依赖并验证测试、类型和静态资源构建**

Run: `pnpm install`

Run: `pnpm vitest run tests/contracts/workspace.test.ts`

Run: `pnpm typecheck`

Run: `pnpm build`

Expected: 全部 exit 0；构建后的首页仍包含旧站 Logo、CSS 和脚本资源。

### Task 2: 实现正式 Button 公共 API 与基础视觉

**Files:**
- Create: `packages/qizhi-react/package.json`
- Create: `packages/qizhi-react/tsconfig.json`
- Create: `packages/qizhi-react/tsconfig.build.json`
- Create: `packages/qizhi-react/vite.config.ts`
- Create: `packages/qizhi-react/src/index.ts`
- Create: `packages/qizhi-react/src/button/Button.tsx`
- Create: `packages/qizhi-react/src/button/Button.types.ts`
- Create: `packages/qizhi-react/src/button/button.css`
- Create: `packages/qizhi-react/src/button/Button.test.tsx`

**Interfaces:**
- Produces: `Button`, `ButtonProps`, `ButtonType`, `ButtonSize`, `ButtonStatus`, `ButtonShape`，以及 `@wangxiaojinger/qizhi-react/styles.css`。
- Consumes: React 原生 `ButtonHTMLAttributes<HTMLButtonElement>` 和当前 `:root` QIZHI token。

- [ ] **Step 1: 写失败测试定义默认值、原生属性与四种 type**

```tsx
it("renders defaults and forwards native button attributes", () => {
  render(<Button name="save" data-testid="button">保存</Button>);
  const button = screen.getByTestId("button");
  expect(button).toHaveAttribute("type", "button");
  expect(button).toHaveAttribute("name", "save");
  expect(button).toHaveClass("qizhi-btn-secondary", "qizhi-btn-size-default", "qizhi-btn-shape-square");
});

it.each(["primary", "secondary", "dashed", "text"] as const)("renders %s type", (type) => {
  render(<Button type={type}>{type}</Button>);
  expect(screen.getByRole("button")).toHaveClass(`qizhi-btn-${type}`);
});
```

- [ ] **Step 2: 运行聚焦测试并确认缺少 Button 而失败**

Run: `pnpm vitest run packages/qizhi-react/src/button/Button.test.tsx`

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现最小 Button 类型、DOM 和类名合并**

类型签名与 spec 完全一致；`className` 追加在组件类名之后，`htmlType` 映射到原生 `type`。不要在组件中写 Demo 布局逻辑。

- [ ] **Step 4: 迁移公共 Button CSS**

从现有 `styles.css` 中提取并校准 `.qizhi-btn` 的 type、size、shape、hover、active、focus-visible 和图标间距规则。保留：默认高 32px、左右 padding 12px、默认圆角与现有 token；公共 CSS 不包含 `.button-demo-row`、`.codebox-wrapper` 等文档选择器。

- [ ] **Step 5: 运行聚焦测试、类型检查和组件包构建**

Run: `pnpm vitest run packages/qizhi-react/src/button/Button.test.tsx`

Run: `pnpm --filter @wangxiaojinger/qizhi-react typecheck`

Run: `pnpm --filter @wangxiaojinger/qizhi-react build`

Expected: PASS；产出 ESM、声明文件和 `styles.css`。

### Task 3: 完成尺寸、状态、图标、禁用、加载和长按钮契约

**Files:**
- Modify: `packages/qizhi-react/src/button/Button.tsx`
- Modify: `packages/qizhi-react/src/button/button.css`
- Modify: `packages/qizhi-react/src/button/Button.test.tsx`
- Create: `packages/qizhi-react/src/icon/AddIcon.tsx`
- Create: `packages/qizhi-react/src/icon/DeleteIcon.tsx`
- Create: `packages/qizhi-react/src/icon/LoadingIcon.tsx`
- Create: `packages/qizhi-react/src/icon/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `AddIcon`、`DeleteIcon`、`LoadingIcon`；完整 Button API 行为。
- Consumes: `ButtonProps`、QIZHI `currentColor` SVG 路径和现有状态色 token。

- [ ] **Step 1: 写尺寸、状态、图标和 long 的失败测试**

```tsx
it.each(["mini", "small", "default", "large"] as const)("renders %s size", (size) => {
  render(<Button size={size}>{size}</Button>);
  expect(screen.getByRole("button")).toHaveClass(`qizhi-btn-size-${size}`);
});

it.each(["warning", "danger", "success"] as const)("renders %s status over type", (status) => {
  render(<Button type="primary" status={status}>{status}</Button>);
  expect(screen.getByRole("button")).toHaveClass("qizhi-btn-primary", `qizhi-btn-status-${status}`);
});

it("renders icon-only and long contracts", () => {
  const { rerender } = render(<Button icon={<AddIcon />} aria-label="添加" />);
  expect(screen.getByRole("button", { name: "添加" })).toHaveClass("qizhi-btn-icon-only");
  rerender(<Button long>主要按钮</Button>);
  expect(screen.getByRole("button")).toHaveClass("qizhi-btn-long");
});
```

- [ ] **Step 2: 运行测试并确认因能力缺失而失败**

Run: `pnpm vitest run packages/qizhi-react/src/button/Button.test.tsx`

Expected: FAIL，类名、图标导出或行为断言不满足。

- [ ] **Step 3: 实现尺寸、状态、shape、图标和 long**

纯图标判断为 `icon` 存在且 `children` 为空；渲染图标容器 `qizhi-btn__icon`。Add/Delete SVG 路径使用当前静态 Button Demo 已确认的路径，全部 `fill="currentColor"`。

- [ ] **Step 4: 写 disabled/loading 点击行为的失败测试**

```tsx
it("blocks disabled and loading clicks with correct accessibility state", async () => {
  const onClick = vi.fn();
  const { rerender } = render(<Button disabled onClick={onClick}>保存</Button>);
  await userEvent.click(screen.getByRole("button"));
  expect(onClick).not.toHaveBeenCalled();
  rerender(<Button loading onClick={onClick}>保存</Button>);
  const button = screen.getByRole("button");
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(button.querySelector(".qizhi-btn__loading-icon")).not.toBeNull();
  await userEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
});
```

- [ ] **Step 5: 运行失败测试，再实现 loading 最小行为与视觉**

Run: `pnpm vitest run packages/qizhi-react/src/button/Button.test.tsx`

Expected: 先 FAIL；实现后 PASS。加载态复用禁用色阶，圆形默认 32×32，加载图标无文字间距并居中。

- [ ] **Step 6: 运行组件完整测试、类型检查和构建**

Run: `pnpm vitest run packages/qizhi-react/src/button/Button.test.tsx`

Run: `pnpm --filter @wangxiaojinger/qizhi-react typecheck && pnpm --filter @wangxiaojinger/qizhi-react build`

Expected: 全部 PASS。

### Task 4: 建立七个同源 Demo、注册表和 API 元数据

**Files:**
- Create: `apps/qizhi-docs/src/button/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/button/demos/IconDemo.tsx`
- Create: `apps/qizhi-docs/src/button/demos/SizeDemo.tsx`
- Create: `apps/qizhi-docs/src/button/demos/StatusDemo.tsx`
- Create: `apps/qizhi-docs/src/button/demos/DisabledDemo.tsx`
- Create: `apps/qizhi-docs/src/button/demos/LoadingDemo.tsx`
- Create: `apps/qizhi-docs/src/button/demos/LongDemo.tsx`
- Create: `apps/qizhi-docs/src/button/buttonDocs.registry.ts`
- Create: `apps/qizhi-docs/src/button/buttonApi.ts`
- Create: `apps/qizhi-docs/src/button/buttonDocs.registry.test.tsx`

**Interfaces:**
- Produces: `ButtonDemoDefinition`、`buttonDemos`、`buttonApi`。
- Consumes: `Button`、QIZHI icons、Vite `?raw` imports 和 `ButtonProps`。

- [ ] **Step 1: 写失败测试约束七个章节和正式包导入**

```tsx
it("registers the seven preserved Button demos with real source", () => {
  expect(buttonDemos.map((demo) => demo.id)).toEqual([
    "基本用法", "图标按钮", "按钮尺寸", "按钮状态", "禁用按钮", "加载中按钮", "长按钮"
  ]);
  for (const demo of buttonDemos) {
    expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
    expect(demo.source).toContain(`export function ${demo.component.name}`);
  }
});

it("renders every registered demo", () => {
  for (const demo of buttonDemos) {
    const Demo = demo.component;
    const { unmount } = render(<Demo />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    unmount();
  }
});
```

- [ ] **Step 2: 运行测试并确认注册表不存在而失败**

Run: `pnpm vitest run apps/qizhi-docs/src/button/buttonDocs.registry.test.tsx`

Expected: FAIL，模块不存在。

- [ ] **Step 3: 按现有示例逐一实现七个 Demo**

保留当前示例数量：基础 4、图标 5、尺寸 4、状态 9、禁用 4、加载 9、长按钮 4。Loading Demo 的“点击加载”使用 React state 和定时恢复，组件本身只接收受控 `loading`。

- [ ] **Step 4: 用真实源码建立注册表**

每个 Demo 同时静态导入组件和 `./XxxDemo.tsx?raw` 源码；注册表只保存 `id`、标题、说明、组件和源码，不保存重复 JSX 字符串。

- [ ] **Step 5: 添加受类型约束的 API 元数据**

```ts
export const buttonApi = [
  { name: "type", type: '"primary" | "secondary" | "dashed" | "text"', defaultValue: '"secondary"' },
  { name: "size", type: '"mini" | "small" | "default" | "large"', defaultValue: '"default"' },
  { name: "status", type: '"default" | "warning" | "danger" | "success"', defaultValue: '"default"' },
  { name: "shape", type: '"square" | "circle"', defaultValue: '"square"' },
  { name: "icon", type: "ReactNode", defaultValue: "—" },
  { name: "loading", type: "boolean", defaultValue: "false" },
  { name: "long", type: "boolean", defaultValue: "false" },
  { name: "htmlType", type: '"button" | "submit" | "reset"', defaultValue: '"button"' },
  { name: "disabled", type: "boolean", defaultValue: "false" }
] as const satisfies readonly { name: keyof ButtonProps; type: string; defaultValue: string }[];
```

- [ ] **Step 6: 运行 Demo、API 和组件回归测试**

Run: `pnpm vitest run apps/qizhi-docs/src/button/buttonDocs.registry.test.tsx packages/qizhi-react/src/button/Button.test.tsx`

Expected: PASS，0 failures。

### Task 5: 用 React Island 替换 Button 静态正文并提供代码工具

**Files:**
- Create: `apps/qizhi-docs/src/button/ButtonDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/button/DemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/button/ApiTable.tsx`
- Create: `apps/qizhi-docs/src/button/useCopyFeedback.ts`
- Create: `apps/qizhi-docs/src/button/ButtonDocsIsland.test.tsx`
- Create: `apps/qizhi-docs/src/button/useCopyFeedback.test.tsx`
- Modify: `apps/qizhi-docs/src/button/main.tsx`
- Modify: `index.html:794-1028`
- Modify: `script.js:886-946`

**Interfaces:**
- Produces: `ButtonDocsIsland`、`DemoCodebox`、`ApiTable`、`useCopyFeedback()`。
- Consumes: `buttonDemos`、`buttonApi` 和现有文档容器类名。

- [ ] **Step 1: 写失败的页面结构测试**

```tsx
it("renders the preserved Button contract and API", () => {
  render(<ButtonDocsIsland />);
  expect(screen.getByRole("heading", { name: "按钮 Button" })).toBeInTheDocument();
  for (const name of ["基本用法", "图标按钮", "按钮尺寸", "按钮状态", "禁用按钮", "加载中按钮", "长按钮", "API"]) {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole("article")).toHaveLength(7);
  expect(screen.getByRole("row", { name: /loading.*boolean.*false/ })).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认页面不存在而失败**

Run: `pnpm vitest run apps/qizhi-docs/src/button/ButtonDocsIsland.test.tsx`

Expected: FAIL，缺少 `ButtonDocsIsland`。

- [ ] **Step 3: 实现 React 页面并复用原文档 DOM 协议**

React 组件只渲染 `#components-button` 的内部视觉结构，不再创建第二个 `<section>`；七个 codebox 的 id 不变。每个 `DemoCodebox` 使用真实 button 控制源码展开，维护 `aria-expanded`、`aria-controls`。

- [ ] **Step 4: 写并验证复制成功/失败测试**

```tsx
it("reports real clipboard success and failure", async () => {
  const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("denied"));
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  render(<CopyProbe source="formal source" />);
  await userEvent.click(screen.getByRole("button", { name: "复制代码" }));
  expect(screen.getByRole("status")).toHaveTextContent("复制成功");
  await userEvent.click(screen.getByRole("button", { name: "复制代码" }));
  expect(screen.getByRole("status")).toHaveTextContent("复制失败");
});
```

Run: `pnpm vitest run apps/qizhi-docs/src/button/useCopyFeedback.test.tsx`

Expected: 先 FAIL；实现 hook 后 PASS。

- [ ] **Step 5: 替换生产 HTML 的 Button 正文**

将原 `#components-button` 内部内容替换为：

```html
<div id="qizhi-button-react-root"></div>
<noscript><p>按钮 React 规范需要启用 JavaScript。</p></noscript>
```

保留外层 `<section id="components-button" class="doc-section">`，确保现有 hash 路由不变。`main.tsx` 导入 `@wangxiaojinger/qizhi-react/styles.css`，挂载完成后由 `ButtonDocsIsland` 的 effect 派发 `qizhi:react-island-ready`。`script.js` 只新增该事件的监听：当当前 pane 包含 Button root 时重新执行现有 `buildToc`、`updateSecondaryTocVisibility` 和滚动同步，使异步渲染出的七个章节进入右侧目录。删除 `initButtonPreviewStates` 和 `initLoadingButtonDemo` 及其两个注册语句；不得修改其他初始化函数。

- [ ] **Step 6: 运行页面、复制、路由结构和语法检查**

Run: `pnpm vitest run apps/qizhi-docs/src/button`

Run: `node --check script.js`

Run: `pnpm typecheck && pnpm build`

Expected: PASS；`#components-button` 唯一；其他本地 hash 仍有目标。

### Task 6: 收敛 Button 样式所有权并保持旧消费者兼容

**Files:**
- Modify: `styles.css`（删除重复公共 Button 实现，保留文档 Demo 布局）
- Modify: `packages/qizhi-react/src/button/button.css`
- Create: `tests/contracts/button-style-ownership.test.ts`

**Interfaces:**
- Produces: 公共 Button CSS 单一来源；旧静态消费者继续通过全局加载的组件 CSS 使用相同 QIZHI 类名。
- Consumes: Task 2/3 的正式 Button 类名与 Vite CSS 注入。

- [ ] **Step 1: 写失败测试识别重复公共样式**

测试读取 `styles.css` 与 `button.css`，断言 `.qizhi-btn`、`.qizhi-btn-primary`、`.qizhi-btn-size-default` 等公共定义只存在于组件包；`.button-demo-row`、`.button-long-demo` 等布局定义只存在于文档样式。

- [ ] **Step 2: 运行测试并确认重复定义导致失败**

Run: `pnpm vitest run tests/contracts/button-style-ownership.test.ts`

Expected: FAIL，报告仍位于 `styles.css` 的公共 Button 选择器。

- [ ] **Step 3: 逐条迁移公共规则并保留消费者兼容**

先搜索 Drawer、Popover、Tooltip、Tree、Upload 等 Button 消费者和文件后部覆盖。只删除已被正式组件 CSS 等价承接的公共规则；页面专属宽度、排列和上下文覆盖继续留在 `styles.css`。

- [ ] **Step 4: 运行所有组件、文档和样式所有权测试**

Run: `pnpm test`

Run: `pnpm typecheck && pnpm build`

Expected: PASS；构建 CSS 中公共 Button 基础规则只有一套。

### Task 7: 三视口浏览器验收、安装烟测与验证记录

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/button-react-island.spec.ts`
- Create: `scripts/verify-package-install.mjs`
- Modify: `package.json`（增加 `verify:install`）
- Create: `docs/verification/button-react-island.md`
- Output ignored: `test-results/button-react-island-{1440,1024,375}.png`

**Interfaces:**
- Produces: 浏览器证据、独立安装构建证据、`candidate_pass` 记录。
- Consumes: 根 Vite build、`@wangxiaojinger/qizhi-react` pack 产物和三个固定视口。

- [ ] **Step 1: 写真实浏览器测试**

每个视口访问 `/#components-button` 并验证：Button 标题、七章节、API、导航选择态、无根级溢出、控制台无 error、资源无 4xx/5xx。实际点击基础 Button，展开并复制源码；操作点击加载按钮，断言 `aria-busy=true`、disabled、恢复后可用；键盘 Tab 检查 focus-visible。

- [ ] **Step 2: 运行 E2E 并按真实失败修复**

Run: `pnpm e2e`

Expected: 修复后 1440、1024、375 全部 PASS。不得用隐藏元素、删除示例或放宽断言规避失败。

- [ ] **Step 3: 添加独立安装烟测**

脚本在系统临时目录执行：

1. `pnpm --filter @wangxiaojinger/qizhi-react build`
2. `pnpm --filter @wangxiaojinger/qizhi-react pack --pack-destination <temp>`
3. 创建最小 React/Vite 消费者
4. 安装 `.tgz`、React 和 Vite
5. 导入 `Button`、`AddIcon` 和 `@wangxiaojinger/qizhi-react/styles.css`
6. 构建消费者
7. 无论成功失败都删除临时目录

Run: `pnpm verify:install`

Expected: exit 0，消费者 `dist/index.html` 存在。

- [ ] **Step 4: 运行完整验证**

Run: `node --check script.js`

Run: `pnpm verify`

Run: `pnpm e2e`

Run: `pnpm verify:install`

Expected: 全部 exit 0；测试 0 failures。

- [ ] **Step 5: 人工查看截图**

逐张查看三个视口的 Button 首屏、加载态、源码展开态和 API。核对顶部栏、左侧导航、正文、右侧目录、Demo 边框、按钮间距、加载图标、焦点环和移动端换行；任何裁切、错位或视觉退化先修复再重跑。

- [ ] **Step 6: 写候选验证记录**

`docs/verification/button-react-island.md` 必须记录实际命令、测试数量、构建产物、安装烟测、三视口结果、截图人工结论、已知限制，以及“Button 为 `candidate_pass`；独立验证为 `pending`；其他分类仍为静态资产”。
