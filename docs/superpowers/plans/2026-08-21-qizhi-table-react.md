# QIZHI Table React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 12 个 Table Demo 迁移为可发布的 `@wangxiaojinger/qizhi-react` Table 组件和一致的 React 文档。

**Architecture:** 泛型 Table 负责列模型、行模型、排序、选择、展开/树形、合并、拖拽和分页组合；文档 Island 只组合正式组件并从 Demo 文件读取复制源码。样式使用 `qizhi-table` 命名和既有语义 token。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite、Playwright

**Spec:** `docs/specs/qizhi-table-contract-v1.md`

## Global Constraints

- Demo 标题、说明、顺序、状态和交互以旧站为准。
- 公共 Pagination、Empty、Button、Link、Icon 必须复用。
- 拖拽只支持指针，不声明键盘移动。
- API、实现、API 表和复制源码保持一致。
- 用户可见文案默认中文，不展示 Demo 文件名。

---

### Task 1: Table 公共组件

**Files:**
- Create: `packages/qizhi-react/src/table/Table.types.ts`
- Create: `packages/qizhi-react/src/table/Table.tsx`
- Create: `packages/qizhi-react/src/table/table.css`
- Test: `packages/qizhi-react/src/table/Table.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: `PaginationProps`、`Empty`
- Produces: `Table` 及契约内全部 Table 类型

- [ ] 写排序、选择、展开、树形、合并、拖拽和分页的失败测试。
- [ ] 运行 `pnpm test packages/qizhi-react/src/table/Table.test.tsx`，确认因 Table 尚不存在而失败。
- [ ] 实现最小公共组件、类型和样式，使行为测试通过。
- [ ] 运行组件测试并修复类型与无障碍状态。

### Task 2: Table 文档 Island

**Files:**
- Create: `apps/qizhi-docs/src/table/TableDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/table/TableDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/table/tableDocs.registry.ts`
- Create: `apps/qizhi-docs/src/table/tableApi.ts`
- Create: `apps/qizhi-docs/src/table/TableApiTable.tsx`
- Create: `apps/qizhi-docs/src/table/tableDocs.css`
- Create: `apps/qizhi-docs/src/table/main.tsx`
- Create: `apps/qizhi-docs/src/table/demos/*.tsx`
- Test: `apps/qizhi-docs/src/table/tableDocs.test.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Table`、`Pagination`、`Empty`、`Button`、`Link`、文档 `ApiTable` 和 `CodeHighlight`
- Produces: 12 个旧站顺序的 Demo、复制源码、Table API 表

- [ ] 写文档标题顺序、Demo 数量、正式组件复用、API 字段和复制源码的失败测试。
- [ ] 运行文档测试，确认缺少 Table Island 而失败。
- [ ] 实现 12 个 Demo、注册表、API 表和 React 挂载入口。
- [ ] 运行组件与文档测试，确保源码、API 与实际调用一致。

### Task 3: 分层验证与浏览器验收

**Files:**
- Create: `tests/e2e/table-react-island.spec.ts`
- Create: `docs/verification/table-react-island.md`

**Interfaces:**
- Consumes: `#component-table` React Island 与 12 个 Demo
- Produces: 自动化交互证据和三档截图验收记录

- [ ] 写 E2E 场景覆盖排序、选择、展开、树形、属性、吸顶、拖拽和分页。
- [ ] 运行 `pnpm typecheck`、Table 组件/文档测试、`pnpm build`。
- [ ] 启动 Vite，在 1440、1024、375 三档实际操作并截图。
- [ ] 人工查看截图，记录布局、溢出、控制台和已知限制。
- [ ] 运行完整 `pnpm verify` 与目标 E2E，形成最终证据。
