# QIZHI Select React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 18 组 Select Demo 1:1 迁移为 `@wangxiaojinger/qizhi-react` 正式组件和 React 文档岛。

**Architecture:** Select 在组件包中管理 combobox、选择、搜索、多选标签和 Portal 弹层；弹层列表复用 `Dropdown.Menu` / `Dropdown.Item`。文档岛仅组织 18 个独立 TSX Demo、同源代码和结构化 API。

**Tech Stack:** React 19、TypeScript 7、Vitest、Testing Library、Vite、Playwright。

**Spec:** `docs/specs/qizhi-select-contract-v1.md`

## Global Constraints

- 保留 18 组 Demo 顺序、标题、说明、数量、布局、尺寸、状态和交互。
- 弹层菜单复用公共 Dropdown 子组件；文档操作复用 Button 和 Icon。
- 不显示 Demo.tsx、路径、语言徽标或额外工具栏。
- 不覆盖工作树内现有用户改动，不在混合脏工作树中自动提交。

---

### Task 1: Select 类型与核心交互

**Files:**
- Create: `packages/qizhi-react/src/select/Select.types.ts`
- Create: `packages/qizhi-react/src/select/Select.tsx`
- Create: `packages/qizhi-react/src/select/Select.test.tsx`
- Create: `packages/qizhi-react/src/select/select.css`
- Modify: `packages/qizhi-react/src/index.ts`

- [ ] 先写单选/多选、禁用、清除、键盘、ARIA 和 Dropdown 复用的失败测试。
- [ ] 运行 Select 测试并确认因组件不存在而失败。
- [ ] 实现最小核心组件、类型、样式和公共导出。
- [ ] 运行 Select 测试直到全绿。

### Task 2: 高级行为

**Files:**
- Modify: `packages/qizhi-react/src/select/Select.tsx`
- Modify: `packages/qizhi-react/src/select/Select.types.ts`
- Modify: `packages/qizhi-react/src/select/Select.test.tsx`
- Modify: `packages/qizhi-react/src/select/select.css`

- [ ] 先写搜索、创建、分词、隐藏已选、拖拽、自定义触发器和扩展菜单的失败测试。
- [ ] 确认每组测试因对应能力缺失而失败。
- [ ] 实现最小行为并保持 Dropdown 复用。
- [ ] 运行 Select 完整单测。

### Task 3: 18 组文档 Demo 和 API

**Files:**
- Create: `apps/qizhi-docs/src/select/` 下文档岛、registry、API、CSS 及 18 个 Demo TSX
- Modify: `index.html`
- Test: `apps/qizhi-docs/src/select/selectDocs.test.tsx`

- [ ] 先写 Demo 顺序、标题、复制代码同源、API 一致和无附加标题的失败测试。
- [ ] 确认测试因 Select 文档岛不存在而失败。
- [ ] 实现 18 组 Demo、API 元数据和 React 挂载。
- [ ] 运行 Select 组件和文档测试。

### Task 4: 集成与浏览器验收

**Files:**
- Create: `tests/e2e/select-react-island.spec.ts`
- Create: `docs/verification/select-react-island.md`

- [ ] 先写 1440/1024/375 的交互、几何、溢出、键盘和截图断言。
- [ ] 运行 Select E2E 并修复失败。
- [ ] 运行 `pnpm typecheck`、`pnpm test`、`pnpm build` 和 Select E2E。
- [ ] 人工查看三档截图，记录尺寸、弹层裁切链、控制台和限制。
