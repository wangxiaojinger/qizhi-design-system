# QIZHI Unified Control Container Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Input、Select、Cascader、DatePicker、AutoComplete 使用同一套“外层容器负责完整盒模型，内部输入负责值、焦点和语义”的结构契约。

**Architecture:** 新增仅供组件包内部使用的 `qizhi-control-container` 结构标记与基础样式，不新增公共 Props。各组件保留自己的尺寸、状态与交互样式；Input.TextArea 把边框、背景、圆角和状态从内部 textarea 移到外层容器。AutoComplete 默认触发器继续复用 Input，自定义触发器继续由调用方负责视觉。

**Tech Stack:** React、TypeScript、CSS、Vitest、Testing Library、Playwright

**Spec:** `docs/methodology/react-component-migration.md`、五个 `docs/specs/qizhi-*-contract-v1.md`

## Global Constraints

- 不新增或照搬 Arco API。
- 公共 Props、默认值和事件参数保持兼容；结构调整不自动变成新 API。
- 内部原生 input/textarea 保留真实语义、ref、事件和键盘能力。
- 边框、圆角、背景、hover、active、focus-visible、disabled、error、warning 由统一控件容器承担。
- Demo 预览、展示代码、复制代码与 API 元数据保持同源。

---

### Task 1: 建立统一结构契约和失败测试

**Files:**
- Create: `packages/qizhi-react/src/control-container/controlContainer.ts`
- Create: `packages/qizhi-react/src/control-container/controlContainer.css`
- Create: `packages/qizhi-react/src/control-container/controlContainer.test.tsx`
- Modify: 五个组件单元测试

**Interfaces:**
- Produces: `CONTROL_CONTAINER_CLASS_NAME`、`controlContainerClassName(...classes)`。

- [ ] 为五个默认控件和 Input.TextArea 写断言：视觉边界包含 `qizhi-control-container`，内部 input/textarea 的计算职责不包含边框。
- [ ] 运行定向测试并确认因统一结构标记缺失、TextArea 边框仍在内部而失败。
- [ ] 实现内部类名工具和公共基础 CSS。
- [ ] 运行定向测试确认通过。

### Task 2: 接入五个 React 组件

**Files:**
- Modify: `packages/qizhi-react/src/input/Input.tsx`
- Modify: `packages/qizhi-react/src/input/input.css`
- Modify: `packages/qizhi-react/src/select/Select.tsx`
- Modify: `packages/qizhi-react/src/cascader/Cascader.tsx`
- Modify: `packages/qizhi-react/src/date-picker/DatePicker.tsx`
- Modify: `packages/qizhi-react/src/auto-complete/AutoComplete.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: `controlContainerClassName`。
- Produces: 五类组件可稳定检索的统一视觉边界；不新增公共导出。

- [ ] Input 与 TextArea 外层接入统一容器，内部字段保持原生 ref/事件。
- [ ] Select 的 `.qizhi-select__control` 接入统一容器，外层定位包装不承担边框。
- [ ] Cascader 默认根容器和 DatePicker 根容器接入统一容器。
- [ ] AutoComplete 默认形态通过正式 Input 继承统一容器；测试自定义触发器不被强加边框。
- [ ] 运行五组件单元与类型测试。

### Task 3: 同步契约、API 和官网同源性

**Files:**
- Modify: `docs/specs/qizhi-input-contract-v1.md`
- Modify: `docs/specs/qizhi-select-contract-v1.md`
- Modify: `docs/specs/qizhi-cascader-contract-v1.md`
- Modify: `docs/specs/qizhi-date-picker-contract-v1.md`
- Modify: `docs/specs/qizhi-auto-complete-contract-v1.md`
- Modify when required by verified API drift: `apps/qizhi-docs/src/*/*Api.ts`

**Interfaces:**
- Produces: 明确的 DOM 与样式契约；公共 API 无变化时不制造新表格条目。

- [ ] 在五份契约中记录统一控件容器规则和自定义触发器例外。
- [ ] 对照 TypeScript Props 与 API 元数据；只修复实际不一致。
- [ ] 运行五组件文档测试，确认 Demo、展示代码和复制代码仍同源。

### Task 4: 全量验证与三视口验收

**Files:**
- Modify only if regression is found: `tests/e2e/*-react-island.spec.ts`
- Create verification screenshots in temporary output only; do not commit screenshots.

**Interfaces:**
- Produces: 可重跑的单元、文档、类型、构建与浏览器证据。

- [ ] 运行五组件定向测试和文档测试。
- [ ] 运行 `pnpm typecheck`、`pnpm test`、`pnpm build`。
- [ ] 在 1440、1024、375 检查默认、hover、active、清空、禁用、错误/警告、多选/范围和自定义触发器。
- [ ] 记录外层与内部字段计算盒模型、页面溢出、控制台结果。
- [ ] 截取并人工查看五组件局部截图后再报告 `candidate_pass`。
