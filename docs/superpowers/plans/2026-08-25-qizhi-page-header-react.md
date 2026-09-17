# QIZHI PageHeader React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站唯一 PageHeader Demo 迁移为 QIZHI 公共 React 组件和同源文档 Island。

**Architecture:** 公共包输出语义化 `PageHeader`，内部统一欢迎语结构和固定视觉契约；文档应用通过 raw import 读取实际 Demo TSX，并复用公共代码操作区和 API 表。

**Tech Stack:** React 19、TypeScript、CSS、Vitest、Testing Library、Playwright、Vite

**Spec:** `docs/specs/qizhi-page-header-contract-v1.md`

## Global Constraints

- 仅迁移旧站唯一“基础用法”Demo，不补充旧站没有的能力。
- 文案、说明、顺序、54px 高度和响应式契约逐字逐项保持。
- Demo TSX 是预览、展示和复制的唯一来源。
- 修改公共能力必须同步类型、导出、API、测试和 E2E。
- 自动验证最高为 `candidate_pass`，独立最终验收保持 `pending`。

---

### Task 1: 公共 PageHeader

**Files:**
- Create: `packages/qizhi-react/src/page-header/PageHeader.types.ts`
- Create: `packages/qizhi-react/src/page-header/PageHeader.tsx`
- Create: `packages/qizhi-react/src/page-header/pageHeader.css`
- Create: `packages/qizhi-react/src/page-header/index.ts`
- Create: `packages/qizhi-react/src/page-header/PageHeader.test.tsx`
- Create: `packages/qizhi-react/src/page-header/PageHeader.types.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `PageHeaderProps extends ComponentPropsWithoutRef<"header">`
- Produces: `PageHeader`, forwarding `Ref<HTMLElement>`

- [ ] Write tests that render the real component and assert semantic header, exact copy, class/attributes/ref, and no nested interactive implementation.
- [ ] Run the tests and verify RED because the public module does not exist.
- [ ] Implement the minimal component, types, CSS, local index, and root exports.
- [ ] Run component tests and typecheck to verify GREEN.

### Task 2: 同源文档 Island

**Files:**
- Create: `apps/qizhi-docs/src/page-header/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/page-header/PageHeaderDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/page-header/pageHeaderDocs.registry.ts`
- Create: `apps/qizhi-docs/src/page-header/pageHeaderApi.ts`
- Create: `apps/qizhi-docs/src/page-header/PageHeaderApiTable.tsx`
- Create: `apps/qizhi-docs/src/page-header/PageHeaderDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/page-header/pageHeaderDocs.css`
- Create: `apps/qizhi-docs/src/page-header/main.tsx`
- Create: `apps/qizhi-docs/src/page-header/pageHeaderDocs.test.tsx`
- Create: `tests/contracts/page-header-style-ownership.test.ts`
- Modify: `tests/contracts/workspace.test.tsx`
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `PageHeader`, `PageHeaderProps`
- Produces: one raw-source-backed demo definition and a four-row API table

- [ ] Write docs, ownership, export and exact-contract tests.
- [ ] Run the tests and verify RED because the Island and public styles do not exist.
- [ ] Implement the Demo, registry, shared codebox, API table and Island.
- [ ] Replace only the legacy PageHeader section with the React mount, remove migrated legacy CSS, add the PageHeader module.
- [ ] Run scoped tests and typecheck to verify GREEN.

### Task 3: Browser and full verification

**Files:**
- Create: `tests/e2e/page-header-react-island.spec.ts`
- Create: `docs/verification/page-header-react-island.md`

**Interfaces:**
- Consumes: `#component-page-header` and the production docs server
- Produces: 1440、1024、375 computed geometry, interaction, source/copy, overflow, console and screenshot evidence

- [ ] Add E2E assertions for exact copy, 48px preview padding, 54px header/greeting, 18px/22px/600 typography, common action shell, display/copy equality and no overflow.
- [ ] Run the three viewport projects and inspect all target screenshots.
- [ ] Run `node --check script.js`, typecheck, scoped tests, full tests, build, and `git diff --check`.
- [ ] Record evidence with `candidate_pass` and independent `pending`.
