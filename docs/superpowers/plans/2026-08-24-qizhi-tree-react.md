# QIZHI Tree React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧规范站 13 个 Tree Demo 迁移为可导入、可测试、可访问的 `@wangxiaojinger/qizhi-react` Tree。

**Architecture:** Tree 使用数据驱动的递归模型和受控/非受控状态，节点视觉由正式组件 CSS 负责。官网 React Island 直接消费正式包，并以 raw TSX 作为预览、展示和复制的唯一源码。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite、Playwright

**Spec:** `docs/specs/qizhi-tree-contract-v1.md`

## Global Constraints

- 保留旧站 13 个 Demo 的标题、说明、顺序、数据和初始状态。
- 不提供 `blockNode`，不恢复填充型分段组件。
- Checkbox、Button、Radio、Input 与 Icon 必须复用正式 QIZHI 组件。
- 实现、类型、API 元数据、预览源码和复制源码必须一致。

---

### Task 1: Tree 公共契约与基础交互

**Files:**
- Create: `packages/qizhi-react/src/tree/Tree.types.ts`
- Create: `packages/qizhi-react/src/tree/Tree.test.tsx`
- Create: `packages/qizhi-react/src/tree/Tree.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `Tree`, `TreeProps`, `TreeNodeData`, `TreeKey`, `TreeSize`, `TreeCheckedStrategy`。

- [ ] **Step 1: Write failing tests** for render, expand, selection, controlled state and keyboard navigation.
- [ ] **Step 2: Run** `pnpm test packages/qizhi-react/src/tree/Tree.test.tsx` and confirm failure because Tree is absent.
- [ ] **Step 3: Implement** the minimal recursive tree and state model.
- [ ] **Step 4: Run the targeted test** and confirm it passes.

### Task 2: Checkbox、异步与拖拽能力

**Files:**
- Modify: `packages/qizhi-react/src/tree/Tree.test.tsx`
- Modify: `packages/qizhi-react/src/tree/Tree.tsx`
- Create: `packages/qizhi-react/src/tree/treeModel.ts`

**Interfaces:**
- Produces: parent/child check propagation, checkedStrategy output, immutable loading updates and immutable drop reorder.

- [ ] **Step 1: Add failing tests** for linked/strict checking, loading and successful/invalid drop.
- [ ] **Step 2: Run the targeted test** and confirm expected failures.
- [ ] **Step 3: Implement minimal model helpers and wire callbacks.**
- [ ] **Step 4: Run the targeted test** and confirm it passes.

### Task 3: 正式视觉与尺寸

**Files:**
- Create: `packages/qizhi-react/src/tree/tree.css`
- Modify: `packages/qizhi-react/src/tree/Tree.test.tsx`

**Interfaces:**
- Produces: QIZHI Tree class contract and four size tokens.

- [ ] **Step 1: Add failing class/state assertions** for sizes, selected, disabled, loading and checkable.
- [ ] **Step 2: Run tests** and confirm the missing style contract fails.
- [ ] **Step 3: Add scoped CSS** using existing semantic tokens and exact old-site geometry.
- [ ] **Step 4: Run tests** and keep all targeted tests green.

### Task 4: 13 个同源官网 Demo 与 API

**Files:**
- Create: `apps/qizhi-docs/src/tree/` and 13 files under `apps/qizhi-docs/src/tree/demos/`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Tree`, `Checkbox`, `Button`, `Radio`, `Input`, QIZHI icons, `ApiTable` and code action primitives.
- Produces: `treeDemos`, `treeApi`, `TreeDocsIsland` and Tree React Island entry.

- [ ] **Step 1: Write failing docs tests** for 13 titles, source imports, code actions and exact API metadata.
- [ ] **Step 2: Run docs tests** and confirm failure because the Island is absent.
- [ ] **Step 3: Implement demos, registry, API and Island** with Chinese visible copy except frozen old-site labels.
- [ ] **Step 4: Run docs tests** and confirm all pass.

### Task 5: 分层验收

**Files:**
- Create: `tests/e2e/tree-react-island.spec.ts`
- Create: `docs/verification/tree-react-island.md`

**Interfaces:**
- Produces: executable three-viewport acceptance and evidence report.

- [ ] **Step 1: Add E2E assertions** for all 13 Demos, expansion, selection, checking, loading, drag, search, size, code copy, geometry and overflow.
- [ ] **Step 2: Run** targeted unit/docs tests, `node --check script.js`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- [ ] **Step 3: Run Playwright** at 1440/1024/375 and capture opened/interactive states.
- [ ] **Step 4: Inspect screenshots manually** and record verified results and limitations.
