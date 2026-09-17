# QIZHI Avatar React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧规范站 Avatar 的 5 个 Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式 Avatar、Avatar.Group 和 CameraIcon，并让官网、类型、API 元数据、复制代码和浏览器行为保持同源一致。

**Architecture:** 公共行为和样式只进入 `packages/qizhi-react`；官网 Island 只组织 5 个独立 Demo、公共代码操作和结构化 API 表。采用测试先行：每个组件能力先写会因缺少实现而失败的测试，再补最小实现；最后执行全量验证与 1440/1024/375 浏览器验收。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Testing Library、Playwright、pnpm workspace

**Spec:** `docs/specs/qizhi-avatar-contract-v1.md`

## Global Constraints

- Demo 必须严格保留旧站 5 个标题、说明、顺序、数量和布局，不增加旧站与公共展示规范之外的 UI。
- 公共组件只从 `@wangxiaojinger/qizhi-react` 导入；官网不得复制 Avatar、Button、Space 或 Icon 实现。
- Demo 预览、查看代码和复制代码必须读取同一份 TSX 源文件。
- 不显示 `Demo.tsx`、`Demo.css`、路径、语言徽标或额外 Tab。
- 用户可见文案和可访问名称使用简体中文。
- Camera、User、Edit、Code、Copy 图标必须复用正式 QIZHI Icon。
- 右下角触发入口复用 24px `Button size="mini" iconOnly`；不创建私有 18px 按钮。
- v1 不提供 Dropdown、`maxCount`、上传、图片失败回退、在线状态、Tooltip、徽标、加载或禁用状态。
- 不修改全局 Token、壳层信息架构或技术栈。
- 完成状态最多为 `candidate_pass`；独立最终验证保持 `pending`。

---

### Task 1: 新增 CameraIcon 公共图标

**Files:**
- Create: `packages/qizhi-react/src/icon/CameraIcon.tsx`
- Modify: `packages/qizhi-react/src/icon/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `packages/qizhi-react/src/icon/FoundationIcons.test.tsx`

**Interfaces:**
- Consumes: `createQizhiIcon(displayName, viewBox, path)` 与 `QizhiIconProps`。
- Produces: `CameraIcon: ForwardRefExoticComponent<QizhiIconProps & RefAttributes<SVGSVGElement>>`，可从 `@wangxiaojinger/qizhi-react` 和 `@wangxiaojinger/qizhi-react/icon` 导入。

- [ ] **Step 1: 在 `FoundationIcons.test.tsx` 写失败测试**

```tsx
import { render, screen } from "@testing-library/react";
import { CameraIcon } from "./CameraIcon";

test("CameraIcon 使用 currentColor 并继承统一可访问协议", () => {
  const { container } = render(<CameraIcon title="拍摄头像" />);
  const icon = screen.getByRole("img", { name: "拍摄头像" });
  expect(icon).toHaveAttribute("viewBox", "0 0 16 16");
  expect(container.querySelectorAll('[stroke="currentColor"], [fill="currentColor"]').length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: 运行图标测试并确认 RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/icon/FoundationIcons.test.tsx`

Expected: FAIL，原因是 `CameraIcon` 模块或导出不存在，而不是测试语法错误。

- [ ] **Step 3: 实现最小 CameraIcon 并加入两层导出**

使用 `createQizhiIcon` 创建 16×16 线性相机图标，轮廓和镜头均使用 `currentColor`，不复制 Remix 类名或运行时依赖。同步在 `icon/index.ts` 和包根 `index.ts` 导出。

- [ ] **Step 4: 运行图标测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/icon/FoundationIcons.test.tsx`

Expected: PASS，且无 React 警告或控制台错误。

---

### Task 2: 建立 Avatar 类型与基础渲染

**Files:**
- Create: `packages/qizhi-react/src/avatar/Avatar.types.ts`
- Create: `packages/qizhi-react/src/avatar/Avatar.types.test.tsx`
- Create: `packages/qizhi-react/src/avatar/Avatar.test.tsx`
- Create: `packages/qizhi-react/src/avatar/Avatar.tsx`

**Interfaces:**
- Consumes: React `HTMLAttributes`、`MouseEventHandler`、`ReactNode`、`forwardRef`。
- Produces: `AvatarSize`、`AvatarShape`、`AvatarTriggerType`、`AvatarProps`、`AvatarGroupProps`、`AvatarComponent` 和基础 `Avatar`。

- [ ] **Step 1: 写类型失败测试**

```tsx
import { Avatar } from "./Avatar";

<Avatar size="mini" shape="circle">A</Avatar>;
<Avatar size="large" shape="square">QIZHI</Avatar>;
// @ts-expect-error Avatar v1 不接受任意数字尺寸
<Avatar size={48}>A</Avatar>;
// @ts-expect-error Avatar v1 不提供根节点 onClick
<Avatar onClick={() => undefined}>A</Avatar>;
```

- [ ] **Step 2: 运行类型测试并确认 RED**

Run: `pnpm typecheck`

Expected: FAIL，原因是 Avatar 类型与实现不存在。

- [ ] **Step 3: 写基础 DOM 失败测试**

```tsx
test("Avatar 使用审定默认值并透传根节点属性和 ref", () => {
  const ref = createRef<HTMLSpanElement>();
  render(<Avatar ref={ref} data-testid="avatar" aria-label="林猫猫">林</Avatar>);
  const avatar = screen.getByTestId("avatar");
  expect(avatar).toHaveClass("qizhi-avatar", "qizhi-avatar-size-default", "qizhi-avatar-shape-circle");
  expect(avatar).toHaveAttribute("aria-label", "林猫猫");
  expect(ref.current).toBe(avatar);
});
```

- [ ] **Step 4: 实现类型与基础 Avatar**

根元素为 `span`，内容容器为 `span.qizhi-avatar__content`。默认 `size="default"`、`shape="circle"`；透传 `className/style/data-*/aria-*` 并正确合并类名。

- [ ] **Step 5: 运行基础测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/avatar/Avatar.test.tsx packages/qizhi-react/src/avatar/Avatar.types.test.tsx`

Expected: PASS。

---

### Task 3: 用 ResizeObserver 实现文字自动缩放

**Files:**
- Modify: `packages/qizhi-react/src/avatar/Avatar.test.tsx`
- Modify: `packages/qizhi-react/src/avatar/Avatar.tsx`

**Interfaces:**
- Consumes: Avatar 根节点与 `.qizhi-avatar__content` 的可用宽度、`ResizeObserver`。
- Produces: CSS 自定义属性 `--qizhi-avatar-content-scale`，范围 `(0, 1]`。

- [ ] **Step 1: 写自动缩放失败测试**

测试中为根节点提供 `clientWidth=40`、内容提供 `scrollWidth=64`，触发 ResizeObserver 后断言：

```tsx
expect(avatar).toHaveStyle({ "--qizhi-avatar-content-scale": "0.5" });
```

同时覆盖短文本 `scrollWidth <= 可用宽度` 时缩放为 `1`，以及卸载时 observer 被断开。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/avatar/Avatar.test.tsx`

Expected: FAIL，原因是尚未测量或设置缩放变量。

- [ ] **Step 3: 实现最小测量逻辑**

内容横向内边界按头像宽度的 80% 计算；缩放值为 `Math.min(1, availableWidth / content.scrollWidth)`。在挂载、children/size 变化和 ResizeObserver 回调时更新，宽度不可用时降级为 1。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/avatar/Avatar.test.tsx`

Expected: PASS，且 observer 正确清理。

---

### Task 4: 实现 mask/button 触发入口并复用 Button

**Files:**
- Modify: `packages/qizhi-react/src/avatar/Avatar.test.tsx`
- Modify: `packages/qizhi-react/src/avatar/Avatar.tsx`

**Interfaces:**
- Consumes: `Button`、`triggerIcon`、`triggerType`、`onTriggerClick`、`triggerAriaLabel`。
- Produces: `.qizhi-avatar-trigger-mask` 或 `.qizhi-avatar-trigger-button` 内的真实 Button。

- [ ] **Step 1: 写触发入口失败测试**

覆盖以下行为：

```tsx
test("Avatar 仅在图标和回调都存在时渲染可访问触发按钮", async () => {
  const onTriggerClick = vi.fn();
  const user = userEvent.setup();
  render(<Avatar triggerIcon={<EditIcon />} triggerType="button" onTriggerClick={onTriggerClick}>A</Avatar>);
  const trigger = screen.getByRole("button", { name: "操作头像" });
  expect(trigger).toHaveClass("qizhi-btn", "qizhi-btn-size-mini", "qizhi-btn-icon-only");
  await user.click(trigger);
  expect(onTriggerClick).toHaveBeenCalledTimes(1);
});
```

另测 mask 类名、自定义中文名称、缺少图标或回调时不渲染入口、Enter/Space 仅各调用一次。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/avatar/Avatar.test.tsx`

Expected: FAIL，原因是触发入口不存在。

- [ ] **Step 3: 实现触发入口**

复用 `<Button size="mini" iconOnly icon={triggerIcon}>`。mask/button 只改变 Avatar 内部定位类；不复制 Button DOM、hover、active、focus-visible 或键盘逻辑。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/avatar/Avatar.test.tsx`

Expected: PASS。

---

### Task 5: 实现 Avatar.Group 尺寸覆盖与重叠契约

**Files:**
- Modify: `packages/qizhi-react/src/avatar/Avatar.types.ts`
- Modify: `packages/qizhi-react/src/avatar/Avatar.types.test.tsx`
- Modify: `packages/qizhi-react/src/avatar/Avatar.test.tsx`
- Modify: `packages/qizhi-react/src/avatar/Avatar.tsx`

**Interfaces:**
- Consumes: `AvatarGroupProps.size` 和 Avatar Context。
- Produces: `Avatar.Group`，默认 `size="default"`，只覆盖直接或嵌套 Avatar 消费到的尺寸，不修改普通子节点。

- [ ] **Step 1: 写 Group 失败测试**

```tsx
test("Avatar.Group 统一覆盖子 Avatar 尺寸并保留普通子节点", () => {
  render(<Avatar.Group size="small"><Avatar size="large">A</Avatar><span data-testid="plain">普通内容</span></Avatar.Group>);
  expect(screen.getByText("A").closest(".qizhi-avatar")).toHaveClass("qizhi-avatar-size-small");
  expect(screen.getByTestId("plain")).toBeInTheDocument();
});
```

另测 Group ref、className 和 aria-label 透传，以及 `Avatar.Group` 静态成员存在。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/avatar/Avatar.test.tsx packages/qizhi-react/src/avatar/Avatar.types.test.tsx`

Expected: FAIL，原因是 `Avatar.Group` 尚不存在。

- [ ] **Step 3: 实现 Group 与尺寸 Context**

使用内部 Context 传递 size，Avatar 优先采用 Group size。Group 根节点为 `div.qizhi-avatar-group qizhi-avatar-group-size-*`，不克隆或改写普通子节点。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/avatar/Avatar.test.tsx packages/qizhi-react/src/avatar/Avatar.types.test.tsx`

Expected: PASS。

---

### Task 6: 完成 Avatar 样式并接入包导出

**Files:**
- Create: `packages/qizhi-react/src/avatar/avatar.css`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `packages/qizhi-react/vite.config.ts`
- Modify: `packages/qizhi-react/package.json`
- Modify: `tests/contracts/workspace.test.tsx`

**Interfaces:**
- Consumes: Task 2-5 的类名和现有 Button/Token 样式。
- Produces: 64/40/32/24px、circle/square、自动缩放、Group 重叠、mask/button 定位及包导出。

- [ ] **Step 1: 写包契约失败测试**

在 `workspace.test.tsx` 断言 `Avatar`、`CameraIcon` 可从 `@wangxiaojinger/qizhi-react` 导入，并检查构建配置包含 Avatar CSS。补充组件样式文本断言：四档尺寸、4px Token 圆角、Group 的 -10/-8px 重叠和 trigger 类必须存在。

- [ ] **Step 2: 运行契约测试并确认 RED**

Run: `pnpm exec vitest run tests/contracts/workspace.test.tsx`

Expected: FAIL，原因是包导出或样式入口尚未接入。

- [ ] **Step 3: 实现最小 CSS 和导出**

CSS 使用现有语义 Token；默认背景 `rgb(var(--primary-6))`、白色前景。Group 直接 Avatar 使用 2px 白边与旧站阴影；mask 使用旧站 `rgba(29, 33, 41, 0.55)`；button 只负责定位正式 Button。

- [ ] **Step 4: 运行 Avatar 与包契约测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/avatar tests/contracts/workspace.test.tsx`

Expected: PASS。

---

### Task 7: 建立 5 个同源 Avatar Demo 和注册表

**Files:**
- Create: `apps/qizhi-docs/src/avatar/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/avatar/demos/SizeShapeDemo.tsx`
- Create: `apps/qizhi-docs/src/avatar/demos/GroupDemo.tsx`
- Create: `apps/qizhi-docs/src/avatar/demos/TriggerDemo.tsx`
- Create: `apps/qizhi-docs/src/avatar/demos/AutoFitDemo.tsx`
- Create: `apps/qizhi-docs/src/avatar/avatarDocs.registry.ts`
- Create: `apps/qizhi-docs/src/avatar/avatarDocs.registry.test.tsx`

**Interfaces:**
- Consumes: `Avatar`、`Space`、`CameraIcon`、`UserIcon`、`EditIcon` from `@wangxiaojinger/qizhi-react`，以及 Vite `?raw`。
- Produces: `avatarDemos`，每项包含 `id/title/description/component/source`。

- [ ] **Step 1: 写 Demo 注册表失败测试**

断言 5 个条目按以下顺序且文案逐字一致：`avatar-basic`、`avatar-size-shape`、`avatar-group`、`avatar-trigger`、`avatar-auto-fit`。断言源码包含 `from "@wangxiaojinger/qizhi-react"`，不包含 `Demo.tsx`/`Demo.css` 可见标题、Remix `ri-*` 或 Dropdown。

- [ ] **Step 2: 运行注册表测试并确认 RED**

Run: `pnpm exec vitest run apps/qizhi-docs/src/avatar/avatarDocs.registry.test.tsx`

Expected: FAIL，原因是 Avatar Demo 与注册表不存在。

- [ ] **Step 3: 实现 5 个最小 Demo**

严格使用旧站内容数量：基础 5 个、尺寸形状 8 个、Group 8 个、Trigger 2 个、自动缩放 4 个。Trigger Demo 用本地 state 输出中文 `role="status"` 反馈，不增加弹窗、上传器或菜单。

- [ ] **Step 4: 实现 `?raw` 同源注册表**

每个注册项直接绑定对应组件和同文件 raw source；不得手写第二份代码字符串。

- [ ] **Step 5: 运行注册表测试并确认 GREEN**

Run: `pnpm exec vitest run apps/qizhi-docs/src/avatar/avatarDocs.registry.test.tsx`

Expected: PASS。

---

### Task 8: 建立 Avatar 文档 Island、代码操作与 API 表

**Files:**
- Create: `apps/qizhi-docs/src/avatar/AvatarDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/avatar/AvatarApiTable.tsx`
- Create: `apps/qizhi-docs/src/avatar/AvatarDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/avatar/avatarApi.ts`
- Create: `apps/qizhi-docs/src/avatar/avatarDocs.css`
- Create: `apps/qizhi-docs/src/avatar/avatarDocs.test.tsx`
- Create: `apps/qizhi-docs/src/avatar/main.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `avatarDemos`、公共 `ApiTable`、`CodeHighlight`、`useCopyFeedback`、`Button`、`CodeIcon`、`CopyIcon`。
- Produces: `#component-avatar` React Island、`avatarApiItems` 和 `avatar-API` 稳定锚点。

- [ ] **Step 1: 写文档失败测试**

断言：

```tsx
expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([
  "基础用法", "大小和形状", "头像组", "交互按钮", "自动调整字体大小", "API",
]);
expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
```

同时断言每个 Demo 各有“查看代码”“复制代码”，代码展开后等于 raw source；API 含 `children/size/shape/triggerIcon/triggerType/onTriggerClick/triggerAriaLabel` 和 Group `size`，类型及默认值与契约一致。

- [ ] **Step 2: 运行文档测试并确认 RED**

Run: `pnpm exec vitest run apps/qizhi-docs/src/avatar/avatarDocs.test.tsx`

Expected: FAIL，原因是 Avatar 文档 Island 尚不存在。

- [ ] **Step 3: 实现文档 Island 和同源 Codebox**

沿用现有 Tag/Divider 文档模式，操作按钮复用正式 Button 和 Icon；复制状态使用中文 `role="status"`。挂载后发送 `qizhi:react-island-ready`。

- [ ] **Step 4: 实现结构化 API 数据和公共 ApiTable**

所有 API 条目只来自已审定契约；不加入 Arco 属性或 v1 排除能力。

- [ ] **Step 5: 将旧 `#component-avatar` 内容替换为 Island 挂载点并接入入口脚本**

保留原路由 ID 和左侧导航 href；只替换该 section 内部内容。增加 `/apps/qizhi-docs/src/avatar/main.tsx` 模块脚本，不修改壳层信息架构。

- [ ] **Step 6: 运行文档测试并确认 GREEN**

Run: `pnpm exec vitest run apps/qizhi-docs/src/avatar/avatarDocs.registry.test.tsx apps/qizhi-docs/src/avatar/avatarDocs.test.tsx apps/qizhi-docs/src/apiAnchors.test.tsx`

Expected: PASS。

---

### Task 9: 增加 Avatar 三视口 E2E 验收

**Files:**
- Create: `tests/e2e/avatar-react-island.spec.ts`

**Interfaces:**
- Consumes: `#component-avatar`、5 个 Demo 锚点、Avatar 公共类和触发按钮。
- Produces: 三视口可重跑的布局、交互、样式、溢出和截图证据。

- [ ] **Step 1: 写 E2E 测试并确认在功能未完全接入时失败**

为 `desktop-1440`、`narrow-1024`、`mobile-375` 建立项目参数。每档断言：5 个 Demo；基础 5 个、尺寸形状 8 个、Group 8 个、Trigger 2 个、自动缩放 4 个；页面 `scrollWidth === clientWidth`；控制台无新增错误。

- [ ] **Step 2: 加入几何与最终样式断言**

断言 64/40/32/24px；circle 为 50%；square 计算圆角为 4px；Group default 相邻头像左边界差 30px、small 为 24px；button 触发器为 24×24；四个自动缩放内容均未超出头像边界。

- [ ] **Step 3: 加入真实交互与键盘断言**

点击 mask 和 button 后分别读取中文状态反馈；Tab 聚焦触发按钮后用 Enter/Space 激活；每次只产生一次回调结果。

- [ ] **Step 4: 加入目标区域截图**

每档保存完整 Avatar 文档截图和 Trigger Demo 局部截图，确保截图包含头像、触发入口、最近 Demo 边界和焦点态。

- [ ] **Step 5: 运行 Avatar E2E 并修复由测试暴露的问题**

Run: `pnpm exec playwright test tests/e2e/avatar-react-island.spec.ts`

Expected: 3 个 viewport 项目全部 PASS；若失败，先新增或收紧可复现失败的断言，再最小修复实现。

---

### Task 10: 完整验证、截图人工复核与交付记录

**Files:**
- Create: `docs/verification/avatar-react-island.md`
- Modify only if verification exposes an Avatar-scoped defect: files from Task 1-9

**Interfaces:**
- Consumes: 全部 Avatar 实现、文档、测试和截图。
- Produces: 可重跑命令、实际结果、截图观察和限制记录。

- [ ] **Step 1: 运行脚本与结构检查**

Run: `node --check script.js`

Run:

```bash
node -e 'const fs=require("fs");const html=fs.readFileSync("index.html","utf8");const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);const dup=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];const missingHashes=[...html.matchAll(/href="#([^"]+)"/g)].map(x=>x[1]).filter(id=>!ids.includes(id));const missingControls=[...html.matchAll(/aria-controls="([^"]+)"/g)].map(x=>x[1]).filter(id=>!ids.includes(id));if(dup.length||missingHashes.length||missingControls.length){console.error({dup,missingHashes,missingControls});process.exit(1)}console.log({ids:ids.length,duplicateIds:0,missingHashes:0,missingControls:0})'
```

Expected: exit 0，并打印 `duplicateIds: 0`、`missingHashes: 0`、`missingControls: 0`。

- [ ] **Step 2: 运行组件测试和文档测试**

Run: `pnpm test`

Expected: exit 0，记录测试文件和测试数量；不得只记录 Avatar 子集。

- [ ] **Step 3: 运行类型检查**

Run: `pnpm typecheck`

Expected: exit 0，无 TypeScript 错误。

- [ ] **Step 4: 运行生产构建**

Run: `pnpm build`

Expected: exit 0；确认 Avatar、Avatar.Group 和 CameraIcon 可从包产物导入，样式入口包含 avatar.css。

- [ ] **Step 5: 运行完整浏览器测试**

Run: `pnpm e2e`

Expected: exit 0；记录通过项目数、失败数和控制台结果。

- [ ] **Step 6: 人工查看 1440/1024/375 截图**

逐张检查：标题和说明换行、五组数量、间距、头像文字裁切、Logo、Group 重叠边框与阴影、mask 遮罩、24px Button、焦点环、Demo 边界及页面横向溢出。截图未查看前不得填写视觉通过。

- [ ] **Step 7: 写验证记录**

在 `docs/verification/avatar-react-island.md` 记录日期、commit/worktree 状态、每条命令与 exit code、测试计数、三档截图路径、人工观察、已知限制，并写明：

```text
verification_after_implementation: candidate_pass
independent_final_verification: pending
```

- [ ] **Step 8: 复核最小范围差异**

Run: `git status --short` 和 `git diff --stat`。确认没有覆盖用户既有修改，没有生成任务外产物，没有修改全局 Token、壳层信息架构或无关组件。
