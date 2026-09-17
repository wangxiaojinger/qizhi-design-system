# QIZHI Form React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 3 个 Form Demo 迁移为正式 `@wangxiaojinger/qizhi-react` Form v1 与同源 React 文档。

**Architecture:** `packages/qizhi-react` 提供只负责布局和字段结构的 `Form`/`Form.Item`；`apps/qizhi-docs` 用现有正式组件重建 3 个 Demo，并从每个 Demo TSX raw import 展示与复制源码。旧站 `#component-form` 仅作为 React Island 挂载点。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、Vite、Playwright、CSS。

**Spec:** `docs/specs/qizhi-form-contract-v1.md`

## Global Constraints

- 逐字保留 3 个 Demo 的标题、原始说明、顺序、字段数据、文案和初始状态。
- Form v1 不提供字段注册、统一 values store、内建校验或异步提交。
- Demo、展示代码和复制代码读取同一 TSX 文件。
- 只复用 `@wangxiaojinger/qizhi-react` 正式组件和图标，不新增第三方依赖。
- 浏览器验收视口固定为 1440、1024、375。

---

### Task 1: Form 公共组件

**Files:**
- Create: `packages/qizhi-react/src/form/Form.types.ts`
- Create: `packages/qizhi-react/src/form/Form.tsx`
- Create: `packages/qizhi-react/src/form/form.css`
- Create: `packages/qizhi-react/src/form/Form.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `Form`, `FormProps`, `FormItemProps`, `FormLayout`。

- [ ] 写失败测试：默认垂直布局、水平布局、ref、原生属性、标签、必填语义和辅助说明。
- [ ] 运行 `pnpm exec vitest run packages/qizhi-react/src/form/Form.test.tsx`，确认因 Form 缺失失败。
- [ ] 实现最小 Form、Form.Item、类型、样式和包导出。
- [ ] 重跑 Form 测试并确认通过。

### Task 2: Form 文档岛和 3 个同源 Demo

**Files:**
- Create: `apps/qizhi-docs/src/form/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/form/demos/LayoutDemo.tsx`
- Create: `apps/qizhi-docs/src/form/demos/ControlledDemo.tsx`
- Create: `apps/qizhi-docs/src/form/formDocs.registry.ts`
- Create: `apps/qizhi-docs/src/form/formApi.ts`
- Create: `apps/qizhi-docs/src/form/FormApiTable.tsx`
- Create: `apps/qizhi-docs/src/form/FormDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/form/FormDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/form/formDocs.css`
- Create: `apps/qizhi-docs/src/form/formDocs.test.tsx`
- Create: `apps/qizhi-docs/src/form/main.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Form`, `Input`, `Select`, `Button`, `Radio`, `Tooltip` 和正式图标。
- Produces: 3 个旧站契约一致的 React Demo、Form/Form.Item API 表和挂载入口。

- [ ] 写失败测试：标题、原始说明、顺序、同源 import、字段数据、初始状态和 API 字段。
- [ ] 运行 `pnpm exec vitest run apps/qizhi-docs/src/form/formDocs.test.tsx`，确认因文档岛缺失失败。
- [ ] 实现 3 个 Demo、registry、代码操作、API 元数据和样式。
- [ ] 将旧静态 Form 内容缩减为 `#component-form` 挂载点并加入 module script。
- [ ] 重跑文档测试并确认通过。

### Task 3: 契约回归和浏览器验收

**Files:**
- Create: `tests/e2e/form-react-island.spec.ts`
- Create: `docs/verification/form-react-island.md`

**Interfaces:**
- Consumes: Form 文档岛的稳定锚点、字段名称和正式组件 DOM。
- Produces: 可重跑的三视口契约与交互验收。

- [ ] 写 E2E：3 个 Demo、字数、Select、布局切换、受控状态、Tooltip、源码展开/复制、几何和无横向溢出。
- [ ] 运行 scoped unit、typecheck、build 和 E2E。
- [ ] 在 1440/1024/375 截取目标局部截图并人工检查。
- [ ] 运行全量 `pnpm test`，记录通过数与限制。

