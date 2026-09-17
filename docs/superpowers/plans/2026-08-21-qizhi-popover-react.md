# QIZHI Popover React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已确认的 Popover 旧站证据迁移为 `@wangxiaojinger/qizhi-react` 正式组件和同源官网文档。

**Architecture:** `packages/qizhi-react/src/popover` 负责公开类型、Portal、定位和交互；`apps/qizhi-docs/src/popover` 只组织 4 个 Demo、同源代码和 API 元数据。

**Tech Stack:** React 19、TypeScript、CSS、Vitest、Testing Library、Vite、Playwright

**Spec:** `docs/specs/qizhi-popover-contract-v1.md`

## Global Constraints

- 只迁移 Popover，不改写 Dropdown、Select 或 Cascader。
- 官网触发与操作按钮复用 `Button`，横向间距复用 `Space`。
- API 仅包含契约 v1 能力；预览、展示代码和复制代码同源。
- 必须使用测试先行，并在 1440/1024/375 实际浏览器验收。

---

### Task 1: 正式 Popover 组件

**Files:** Create `packages/qizhi-react/src/popover/*`; modify `packages/qizhi-react/src/index.ts`.

- [ ] 先写受控/非受控、4 种触发、Escape/外部关闭、ref/事件保留、12 方位失败测试。
- [ ] 运行定向测试，确认因 Popover 未实现而失败。
- [ ] 实现最小类型、Portal、位置、交互、样式和公共导出。
- [ ] 重跑定向测试并确认通过。

### Task 2: 官网 Island、Demo 与 API

**Files:** Create `apps/qizhi-docs/src/popover/*`; modify `index.html`.

- [ ] 先写 4 个 Demo、18 个触发入口、同源代码、复用 Button/Space 和 API 一致性失败测试。
- [ ] 运行定向文档测试，确认因模块缺失而失败。
- [ ] 实现 Island、4 个独立 Demo、注册表、API 元数据与响应式布局。
- [ ] 将 `#component-popover` 交给 React 挂载，代码预览与 Demo TSX 同源。

### Task 3: 完整验证

**Files:** Create `tests/e2e/popover-react-island.spec.ts` and `docs/verification/popover-react-island.md`.

- [ ] 添加 4 种触发、关闭/焦点恢复、12 方位、Portal 裁切链、几何和三视口断言。
- [ ] 执行 `pnpm typecheck`、定向测试、`pnpm test`、`pnpm build`。
- [ ] 执行 Popover 定向 E2E 与全量 `pnpm e2e`，如实记录既有失败。
- [ ] 人工查看 1440/1024/375 打开态局部截图，记录实际边界。
