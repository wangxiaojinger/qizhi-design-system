# QIZHI Descriptions React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧规范站的 2 个 Descriptions Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式 `Descriptions`、`Descriptions.Item`，并让官网、类型、API 元数据、复制代码和三档浏览器表现同源一致。

**Architecture:** 公共组件、类型和样式只进入 `packages/qizhi-react/src/descriptions`；官网 Island 只组织两个独立 Demo、公共代码操作和结构化 API 表。基础 Demo 的状态值直接消费正式 `Tag`，不创建或覆盖第二套状态组件。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Testing Library、Playwright、pnpm workspace

**Spec:** `docs/specs/qizhi-descriptions-contract-v1.md`

## Global Constraints

- 严格保留旧站 2 个 Demo 的标题、说明、顺序、3 组列表和 6+3+3 个字段项。
- 公共组件只从 `@wangxiaojinger/qizhi-react` 导入；官网不得复制 Descriptions、Tag、Button 或 Icon 实现。
- “运行中”必须直接使用 `Tag color="green"` 的正式 24px 默认尺寸，不得用本地 span 或 Demo 样式覆盖。
- Demo 预览、查看代码和复制代码必须读取同一份 TSX 源文件。
- 不显示 `Demo.tsx`、`Demo.css`、路径、语言徽标或额外 Tab。
- v1 不提供 `column`、`span`、`data`、`border`、`size`、`colon`、加载、编辑、折叠、排序或分页。
- 桌面和窄屏固定三列；不大于 767.98px 固定单列；根宽度不超过 720px。
- 不修改全局 Token、壳层信息架构、Tag API 或技术栈。
- 当前工作区包含既有未提交内容；只编辑本任务文件，不自动创建 Git 提交。
- 完成状态最多为 `candidate_pass`；独立最终验证保持 `pending`。

---

### Task 1: 建立 Descriptions 类型与语义 DOM

**Files:**
- Create: `packages/qizhi-react/src/descriptions/Descriptions.types.ts`
- Create: `packages/qizhi-react/src/descriptions/Descriptions.types.test.tsx`
- Create: `packages/qizhi-react/src/descriptions/Descriptions.test.tsx`
- Create: `packages/qizhi-react/src/descriptions/Descriptions.tsx`

**Interfaces:**
- Consumes: React `HTMLAttributes`、`ReactNode`、`forwardRef`。
- Produces: `DescriptionsLayout`、`DescriptionsLabelAlign`、`DescriptionsProps`、`DescriptionsItemProps`、`DescriptionsComponent`、`Descriptions` 和 `Descriptions.Item`。

- [ ] **Step 1: 写类型失败测试**

```tsx
import { Descriptions } from "./Descriptions";

<Descriptions title="项目信息" layout="horizontal" labelAlign="right">
  <Descriptions.Item label="项目名称">QIZHI Design System</Descriptions.Item>
</Descriptions>;
// @ts-expect-error v1 不接受任意 layout
<Descriptions layout="inline" />;
// @ts-expect-error Item 的 label 必填
<Descriptions.Item>值</Descriptions.Item>;
```

- [ ] **Step 2: 运行 `pnpm typecheck` 并确认 RED**

Expected: FAIL，原因是 Descriptions 模块不存在，而不是测试语法错误。

- [ ] **Step 3: 写语义 DOM 失败测试**

```tsx
test("Descriptions 使用审定默认值、语义元素并透传 ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(<Descriptions ref={ref} title="项目信息" data-testid="descriptions"><Descriptions.Item label="版本">1.0.0</Descriptions.Item></Descriptions>);
  const root = screen.getByTestId("descriptions");
  expect(root).toHaveClass("qizhi-descriptions-layout-horizontal", "qizhi-descriptions-label-align-left");
  expect(root.querySelector("dl dt")?.textContent).toBe("版本");
  expect(root.querySelector("dl dd")?.textContent).toBe("1.0.0");
  expect(ref.current).toBe(root);
});
```

- [ ] **Step 4: 实现最小类型与组件**

根元素为 `div`，有标题时渲染 `.qizhi-descriptions__title`，字段容器使用 `dl`。`Descriptions.Item` 根为 `div`，内部使用 `dt` 和 `dd`；默认 `layout="horizontal"`、`labelAlign="left"`，并正确合并原生属性、className 和 ref。

- [ ] **Step 5: 运行组件与类型测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/descriptions && pnpm typecheck`

Expected: PASS。

---

### Task 2: 完成 Descriptions 样式与组合规则

**Files:**
- Create: `packages/qizhi-react/src/descriptions/descriptions.css`
- Modify: `packages/qizhi-react/src/descriptions/Descriptions.test.tsx`

**Interfaces:**
- Consumes: Task 1 的稳定公共类名。
- Produces: 720px 上限、标题与正文排版、水平/垂直布局、左右对齐、三列/单列响应式。

- [ ] **Step 1: 写样式契约失败测试**

读取 CSS 文本并断言包含：`max-width: 720px`、三列 `repeat(3, minmax(0, 1fr))`、`@media (max-width: 767.98px)`、右对齐 72px 标签列、水平冒号、垂直无冒号、6px Item 间距，以及标题 16px/24px、字段 14px/22px。

- [ ] **Step 2: 运行组件测试并确认 RED**

Run: `pnpm exec vitest run packages/qizhi-react/src/descriptions/Descriptions.test.tsx`

Expected: FAIL，原因是 CSS 或契约规则不存在。

- [ ] **Step 3: 实现最小公共 CSS**

使用现有 `--color-text-*`、`--border-radius-*` 等 Token；水平布局三列 gap 为 `18px 28px`，垂直布局三列 gap 为 `16px 32px`，垂直 Item 内 gap 6px。垂直布局强制标签左对齐；移动端三种组合均切换为单列。

- [ ] **Step 4: 运行组件测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/descriptions`

Expected: PASS。

---

### Task 3: 接入正式包公共导出与消费边界

**Files:**
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `tests/contracts/workspace.test.tsx`

**Interfaces:**
- Consumes: `Descriptions`、类型和 `descriptions.css`。
- Produces: 从 `@wangxiaojinger/qizhi-react` 可导入的 `Descriptions`、`DescriptionsProps`、`DescriptionsItemProps`、`DescriptionsLayout` 和 `DescriptionsLabelAlign`。

- [ ] **Step 1: 写包消费失败测试**

```tsx
import { Descriptions, Tag } from "@wangxiaojinger/qizhi-react";

render(<Descriptions title="项目信息"><Descriptions.Item label="状态"><Tag color="green">运行中</Tag></Descriptions.Item></Descriptions>);
expect(screen.getByText("运行中").closest(".qizhi-tag")).toHaveClass("qizhi-tag-green");
```

- [ ] **Step 2: 运行 workspace 契约测试并确认 RED**

Run: `pnpm exec vitest run tests/contracts/workspace.test.tsx`

Expected: FAIL，原因是包根尚未导出 Descriptions。

- [ ] **Step 3: 增加组件、类型和 CSS 导出**

在包根 `index.ts` 导出组件与审定类型并导入 `descriptions.css`；不修改 package exports、Tag 或构建架构。

- [ ] **Step 4: 运行组件和包契约测试并确认 GREEN**

Run: `pnpm exec vitest run packages/qizhi-react/src/descriptions tests/contracts/workspace.test.tsx`

Expected: PASS。

---

### Task 4: 建立 2 个同源 Demo 与注册表

**Files:**
- Create: `apps/qizhi-docs/src/descriptions/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/descriptions/demos/LabelAlignDemo.tsx`
- Create: `apps/qizhi-docs/src/descriptions/descriptionsDocs.registry.ts`
- Create: `apps/qizhi-docs/src/descriptions/descriptionsDocs.registry.test.tsx`

**Interfaces:**
- Consumes: `Descriptions`、`Tag` from `@wangxiaojinger/qizhi-react` 与 Vite `?raw`。
- Produces: `descriptionsDemos`，每项包含 `id/title/description/component/source`。

- [ ] **Step 1: 写注册表失败测试**

断言顺序为 `descriptions-basic`、`descriptions-label-align`，标题和说明逐字等于旧站；源码必须包含 `Descriptions`、`Descriptions.Item`、`Tag` 和 `from "@wangxiaojinger/qizhi-react"`，不包含本地状态 span、`Demo.tsx`、`Demo.css`、Arco 或 Remix 类名。

- [ ] **Step 2: 运行注册表测试并确认 RED**

Run: `pnpm exec vitest run apps/qizhi-docs/src/descriptions/descriptionsDocs.registry.test.tsx`

Expected: FAIL，原因是 Demo 与注册表不存在。

- [ ] **Step 3: 实现 BasicDemo**

渲染标题“项目信息”和 6 个字段；内容逐字保持旧站。“运行中”使用 `<Tag color="green">运行中</Tag>`，不得传入 style 或 Demo 专属 className。

- [ ] **Step 4: 实现 LabelAlignDemo**

依次渲染标题“右对齐标签”的 `labelAlign="right"` 水平列表和标题“垂直排列”的 `layout="vertical"` 列表，每组 3 个旧站字段。两组之间只使用文档布局容器。

- [ ] **Step 5: 用 `?raw` 建立同源注册表并确认 GREEN**

Run: `pnpm exec vitest run apps/qizhi-docs/src/descriptions/descriptionsDocs.registry.test.tsx`

Expected: PASS。

---

### Task 5: 建立 Descriptions 文档 Island 与 API 表

**Files:**
- Create: `apps/qizhi-docs/src/descriptions/DescriptionsDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/descriptions/DescriptionsApiTable.tsx`
- Create: `apps/qizhi-docs/src/descriptions/DescriptionsDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/descriptions/descriptionsApi.ts`
- Create: `apps/qizhi-docs/src/descriptions/descriptionsDocs.css`
- Create: `apps/qizhi-docs/src/descriptions/descriptionsDocs.test.tsx`
- Create: `apps/qizhi-docs/src/descriptions/main.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `descriptionsDemos`、公共 `ApiTable`、`CodeHighlight`、`useCopyFeedback`、`Button`、`CodeIcon`、`CopyIcon`。
- Produces: `#component-descriptions` React Island、`descriptionsApiItems` 和 `descriptions-API` 锚点。

- [ ] **Step 1: 写文档失败测试**

```tsx
expect(screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent)).toEqual([
  "基本用法", "标签文本对齐", "API",
]);
expect(screen.queryByText(/Demo\.tsx|Demo\.css/)).not.toBeInTheDocument();
```

同时断言每个 Demo 各有查看/复制操作，展开代码等于 raw source；页面共有三组 Descriptions、12 个 Item；“运行中”的祖先为 `.qizhi-tag-green`；API 只包含 `children/title/layout/labelAlign` 与 Item `label/children`，类型和默认值逐项匹配契约。

- [ ] **Step 2: 运行文档测试并确认 RED**

Run: `pnpm exec vitest run apps/qizhi-docs/src/descriptions/descriptionsDocs.test.tsx`

Expected: FAIL，原因是文档 Island 不存在。

- [ ] **Step 3: 实现结构化 API 和公共文档 UI**

API 表复用 `ApiTable`；Demo 操作复用正式 Button/Icon、公共反馈 hook 与 CodeHighlight。Island 挂载后触发 `qizhi:react-island-ready`；文档 CSS 只定义第二个 Demo 的 32px 纵向组合间距及 Island 必需布局。

- [ ] **Step 4: 替换 `#component-descriptions` 内容并挂载 Island**

保留 section ID 和导航信息架构，只将 section 内静态内容替换为挂载根，并在 `index.html` 增加对应 module script；不修改 `styles.css` 或 `script.js`。

- [ ] **Step 5: 运行文档、API 锚点和组件测试并确认 GREEN**

Run: `pnpm exec vitest run apps/qizhi-docs/src/descriptions apps/qizhi-docs/src/apiAnchors.test.tsx packages/qizhi-react/src/descriptions`

Expected: PASS。

---

### Task 6: 增加三视口 E2E 并完成分层验收

**Files:**
- Create: `tests/e2e/descriptions-react-island.spec.ts`
- Create: `docs/verification/descriptions-react-island.md`

**Interfaces:**
- Consumes: 正式包、文档 Island 与 Playwright 三项目配置。
- Produces: 可重复运行的 1440/1024/375 几何、语义、复用和截图证据。

- [ ] **Step 1: 写 E2E 失败测试**

断言 2 个 Demo、3 组列表、12 个字段；桌面/窄屏 body 最终为三列、375 为单列；根宽度不超过 720px；标题 16px/24px、字段 14px/22px；右对齐标签列 72px；垂直 Item gap 6px 且标签无冒号；Tag 为正式 `.qizhi-tag-green` 且 24px；页面无横向溢出；console/page error 为 0。每档截取完整页面和目标局部截图。

- [ ] **Step 2: 运行 Descriptions E2E 并按失败证据修正**

Run: `QIZHI_DOCS_BASE_URL=http://127.0.0.1:<port> pnpm exec playwright test tests/e2e/descriptions-react-island.spec.ts`

Expected: 首次因 Island 尚未满足几何或测试不存在而 RED；修正后 6/6 PASS。

- [ ] **Step 3: 执行结构与自动化检查**

Run: `node --check script.js`、ID/hash/aria-controls 检查、`pnpm test`、`pnpm typecheck`、`pnpm build`、干净服务上的 `pnpm e2e`。

Expected: 所有命令 exit 0，失败数为 0；构建产物包含 Descriptions 模块和公共 CSS。

- [ ] **Step 4: 人工查看六张截图并记录结论**

逐张核对标题、说明、三列/单列、值换行、Tag、间距、边框、API 表内部滚动和页面外壳；截图未查看前不写视觉通过。

- [ ] **Step 5: 写验收记录并检查差异**

记录真实命令、通过数、警告、截图路径和限制；运行 `git diff --check` 与 scoped `git status`。最终只声明 `verification_after_implementation: candidate_pass`，独立最终验证保持 `pending`。
