# QIZHI Button Contract v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已确认的 QIZHI Button v1 契约实现为可构建、可测试、可由官网和 AI 元数据精确调用的正式 React 组件。

**Architecture:** `packages/qizhi-react` 是 Button 行为、类型和样式的唯一正式实现；`apps/qizhi-docs` 只从正式包导入组件并用结构化元数据渲染 API。文档 Demo 源文件同时驱动预览和代码展示，避免双份实现。

**Tech Stack:** React 19、TypeScript 7、Vite 8、Vitest 4、Testing Library、Playwright。

**Spec:** `docs/specs/qizhi-button-contract-v1.md`

## Global Constraints

- 公开命名只使用 QIZHI / `qizhi-*`，不新增 Arco 代码命名。
- 保持现有规范站视觉壳层和 QIZHI token，不改品牌基线。
- 所有行为变更先写失败测试并验证 RED，再实现 GREEN。
- 不手写第二套展示组件；官网必须消费 `@wangxiaojinger/qizhi-react`。

---

### Task 1: Button 类型、元素模式与无障碍行为

**Files:**
- Modify: `packages/qizhi-react/src/button/Button.types.ts`
- Modify: `packages/qizhi-react/src/button/Button.tsx`
- Modify: `packages/qizhi-react/src/button/Button.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `ButtonProps`, `ButtonHandle`, six `ButtonType` values, three `ButtonShape` values, native-button/link discriminated union.

- [ ] 写失败测试：默认类型映射、outline/round、链接模式、禁用链接、加载焦点、iconOnly、className 数组和 ref。
- [ ] 运行 `pnpm test packages/qizhi-react/src/button/Button.test.tsx`，确认因契约能力缺失而失败。
- [ ] 实现最小类型与运行时行为。
- [ ] 重跑目标测试，确认通过。

### Task 2: Button.Group 与组合视觉

**Files:**
- Create: `packages/qizhi-react/src/button/ButtonGroup.tsx`
- Modify: `packages/qizhi-react/src/button/Button.types.ts`
- Modify: `packages/qizhi-react/src/button/Button.tsx`
- Modify: `packages/qizhi-react/src/button/Button.test.tsx`
- Modify: `packages/qizhi-react/src/button/button.css`

**Interfaces:**
- Produces: `Button.Group`, `ButtonGroupProps`，转发 `HTMLDivElement` ref。

- [ ] 写失败测试：Group 导出、原生 div 属性/ref、子按钮独立点击和公共类名。
- [ ] 运行目标测试确认 RED。
- [ ] 实现 Group 和首中尾圆角、相邻边框、focus 层级、RTL 样式。
- [ ] 重跑目标测试确认 GREEN。

### Task 3: 官网 Demo 顺序与真实源码

**Files:**
- Create: `apps/qizhi-docs/src/button/demos/ShapeDemo.tsx`
- Create: `apps/qizhi-docs/src/button/demos/GroupDemo.tsx`
- Modify: `apps/qizhi-docs/src/button/demos/BasicDemo.tsx`
- Modify: `apps/qizhi-docs/src/button/buttonDocs.registry.ts`
- Modify: `apps/qizhi-docs/src/button/buttonDocs.registry.test.tsx`
- Modify: `apps/qizhi-docs/src/button/ButtonDocsIsland.test.tsx`
- Modify: `tests/e2e/button-react-island.spec.ts`

**Interfaces:**
- Produces: 九个按 Arco 顺序注册的 Button Demo，预览和代码使用同一 TSX 源文件。

- [ ] 写失败测试：九个 Demo 的顺序、Shape/Group 调用和源码导入。
- [ ] 运行文档测试确认 RED。
- [ ] 创建 Shape/Group Demo 并更新 registry。
- [ ] 重跑文档测试确认 GREEN。

### Task 4: 结构化 API 元数据和双 API 表

**Files:**
- Modify: `apps/qizhi-docs/src/button/buttonApi.ts`
- Modify: `apps/qizhi-docs/src/button/ApiTable.tsx`
- Modify: `apps/qizhi-docs/src/button/buttonDocs.registry.test.tsx`
- Modify: `apps/qizhi-docs/src/button/ButtonDocsIsland.test.tsx`

**Interfaces:**
- Produces: `buttonApi`、`buttonGroupApi`，每项含 `name/description/type/defaultValue`。

- [ ] 写失败测试：完整属性集合、准确独立描述、Button.Group API 表。
- [ ] 运行文档测试确认 RED。
- [ ] 实现结构化元数据和表格渲染。
- [ ] 重跑文档测试确认 GREEN。

### Task 5: 样式、工程说明与完整验证

**Files:**
- Modify: `packages/qizhi-react/src/button/button.css`
- Modify: `apps/qizhi-docs/src/button/buttonDocs.css`
- Modify: `AGENTS.md`（仅修正当前工作树已存在 React 工具链这一过时事实）

**Interfaces:**
- Consumes: Tasks 1-4 的正式 Button、Group、Demo 与 API 元数据。
- Produces: 保持规范站视觉的完整 Button 页面和可验证工程说明。

- [ ] 补充 outline/round/Group/loading/focus 的 QIZHI token 样式与响应式规则。
- [ ] 运行 `pnpm typecheck`、`pnpm test`、`pnpm build`。
- [ ] 运行 `node --check script.js` 和结构搜索检查。
- [ ] 运行 Playwright Button e2e，检查 1440、1024、375、控制台、横向溢出与截图。
- [ ] 人工查看三张目标截图，仅在证据齐全后报告 candidate_pass。

