# QIZHI Alert React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站警告提示 Alert 的 9 个 Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式组件与同源 React 文档。

**Architecture:** `packages/qizhi-react/src/alert` 拥有公共行为、类型和视觉；`apps/qizhi-docs/src/alert` 只组织 9 个独立 Demo、同源代码操作区和 API 元数据。静态 `#component-alert` 改为 React Island 挂载点。

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite, Playwright, CSS

**Spec:** `docs/specs/qizhi-alert-contract-v1.md`

## Global Constraints

- 保留旧站 9 个 Demo 的标题、说明、顺序、文案、尺寸、默认状态和交互。
- Demo 不使用原生交互标签、自写 SVG、内联布局或其他公共组件的 `__*` 私有选择器。
- 展示与复制代码只来自实际 Demo TSX。
- 操作区完整复用 Button Demo 基线。
- 公共 API 改动后独立验收状态为 `pending`。

---

### Task 1: 公共 Alert 契约与实现

**Files:**
- Create: `packages/qizhi-react/src/alert/Alert.types.ts`
- Create: `packages/qizhi-react/src/alert/Alert.test.tsx`
- Create: `packages/qizhi-react/src/alert/Alert.tsx`
- Create: `packages/qizhi-react/src/alert/alert.css`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:** Produces `Alert`, `AlertProps`, `AlertType`, `AlertSize`, `AlertCloseElement`.

- [ ] 先写渲染默认值、5 种类型、3 种尺寸、inline、banner、图标和关闭行为测试。
- [ ] 运行 `pnpm vitest run packages/qizhi-react/src/alert/Alert.test.tsx`，确认因组件缺失而失败。
- [ ] 实现最小公共组件、QIZHI 图标映射、原生属性透传和关闭状态。
- [ ] 重跑定向测试，确认全部通过。

### Task 2: 9 个同源 Docs Demo 与 API

**Files:**
- Create: `apps/qizhi-docs/src/alert/*`
- Modify: `index.html`
- Modify: `script.js`
- Modify: `tests/e2e/demo-code-actions.spec.ts`

**Interfaces:** Consumes Task 1 exports; produces `AlertDocsIsland` and 9 Demo registry entries.

- [ ] 先写 Docs 门禁，锁定 9 个标题、说明、实例数、公共导入、无原生交互标签、无内联布局与 API 表。
- [ ] 运行定向 Docs 测试，确认因 Alert Docs Island 缺失而失败。
- [ ] 实现 9 个 Demo、registry、DemoCodebox、API 表、布局 CSS 和挂载入口。
- [ ] 将 `#component-alert` 替换为空 React 挂载点，注册 module script，并让旧站 `initAlertDemos` 在 Island 上早返回。
- [ ] 重跑定向 Docs 测试，确认通过。

### Task 3: 构建、E2E 与视觉验收

**Files:**
- Create: `tests/e2e/alert-react-island.spec.ts`
- Create: `docs/verification/alert-react-island.md`

**Interfaces:** Verifies Tasks 1-2 at 1440, 1024, and 375.

- [ ] 先写 E2E，覆盖 9 个 Demo、默认语义、尺寸、关闭、自定义关闭、无图标、banner、代码同源和溢出。
- [ ] 运行 E2E，确认旧页因未挂载 Island/API 而失败。
- [ ] 运行 `pnpm typecheck`、`pnpm test`、`pnpm build`、`node --check script.js`。
- [ ] 在 1440/1024/375 运行 Alert E2E，生成打开/关闭前的目标截图并人工查看。
- [ ] 记录实际命令、数量、视觉结论、限制和 `candidate_pass` / `pending` 边界。
