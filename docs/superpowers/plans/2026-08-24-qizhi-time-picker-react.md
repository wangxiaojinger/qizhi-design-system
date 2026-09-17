# QIZHI TimePicker React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 8 个 TimePicker Demo 迁移为同源、可测试的 `@wangxiaojinger/qizhi-react` 正式组件。

**Architecture:** `TimePicker` 与 `TimePicker.RangePicker` 共享同一个内部状态机和内部 TimePanel；TimePanel 同时供 DatePicker 使用。文档岛只负责组织同源 Demo、公共操作区和 API 元数据，ConfigProvider 静态消费者继续由旧运行时负责。

**Tech Stack:** React、TypeScript、Vite raw imports、Vitest、Testing Library、Playwright。

**Spec:** `docs/specs/qizhi-time-picker-contract-v1.md`

## Global Constraints

- 保留 8 个 Demo 的原始标题、说明、顺序、数据、尺寸和交互。
- 不新增契约“v1 明确不支持”中的 API。
- Demo 不写原生 input、私有 TimePanel 或公共组件私有选择器。
- 所有新增组件代码先有失败测试，再写最小实现。
- 实现、类型、API、预览、展示与复制代码必须同源。

---

### Task 1: 公共类型和共享时间面板

**Files:**
- Create: `packages/qizhi-react/src/time-picker/TimePicker.types.test.tsx`
- Create: `packages/qizhi-react/src/time-picker/TimePicker.types.ts`
- Create: `packages/qizhi-react/src/time-picker/TimePanel.test.tsx`
- Create: `packages/qizhi-react/src/time-picker/TimePanel.tsx`
- Modify: `packages/qizhi-react/src/date-picker/DatePicker.tsx`

**Interfaces:**
- Produces: `TimePickerProps`、`TimeRangePickerProps`、`TimePickerStep`、`TimePanel`。
- Consumes: `InputStatus` 与 DatePicker 已有三列时间语义。

- [ ] 写失败的类型测试，锁定单值/范围组合、回调值和 ref。
- [ ] 运行定向测试，确认因类型与模块不存在失败。
- [ ] 写失败的 TimePanel 行为测试，锁定两列/三列、2/5/10 步长和键盘选择。
- [ ] 实现最小类型与共享面板，并让 DatePicker 使用共享面板。
- [ ] 运行 TimePanel、DatePicker 和类型测试，确认通过。

### Task 2: TimePicker 正式组件

**Files:**
- Create: `packages/qizhi-react/src/time-picker/TimePicker.test.tsx`
- Create: `packages/qizhi-react/src/time-picker/TimePicker.tsx`
- Create: `packages/qizhi-react/src/time-picker/timePicker.css`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `TimePicker`、`TimePicker.RangePicker` 和全部公共类型导出。
- Consumes: Task 1 的 TimePanel、`TimeIcon`、control container、浮层定位函数。

- [ ] 写失败测试：非受控选择、受控值、范围字段、HH:mm、步长、禁用。
- [ ] 写失败测试：Enter/Space/Escape、外部关闭、焦点恢复和 ARIA。
- [ ] 运行测试并确认因正式组件缺失而失败。
- [ ] 实现最小组件、Portal、状态和 QIZHI 样式。
- [ ] 运行 TimePicker、DatePicker 和类型测试，修复回归直到通过。

### Task 3: 八个同源官网 Demo 与 API

**Files:**
- Create: `apps/qizhi-docs/src/time-picker/demos/*.tsx`
- Create: `apps/qizhi-docs/src/time-picker/timePickerDocs.registry.ts`
- Create: `apps/qizhi-docs/src/time-picker/timePickerApi.ts`
- Create: `apps/qizhi-docs/src/time-picker/TimePickerApiTable.tsx`
- Create: `apps/qizhi-docs/src/time-picker/TimePickerDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/time-picker/TimePickerDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/time-picker/timePickerDocs.css`
- Create: `apps/qizhi-docs/src/time-picker/timePickerDocs.test.tsx`
- Create: `apps/qizhi-docs/src/time-picker/main.tsx`
- Modify: `index.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: 8 个真实组件 Demo、结构化 API 表、React Island 入口。
- Consumes: Task 2 公共 TimePicker、公共 ApiTable 与 DemoCodebox 协议。

- [ ] 写失败的文档测试，锁定 8 个标题、原文、顺序和初值。
- [ ] 锁定 Demo 不含原生 input、内联布局和公共组件私有 `__*` 选择器。
- [ ] 运行文档测试并确认因 registry/Island 不存在失败。
- [ ] 实现 8 个独立 TSX、raw 同源 registry、API 表和文档岛。
- [ ] 将 `#component-time-picker` 替换为 Island root，并配置 Vite 入口。
- [ ] 运行文档测试、typecheck 和 build，确认通过。

### Task 4: 回归与三档浏览器验收

**Files:**
- Create: `tests/e2e/time-picker-react-island.spec.ts`
- Create: `docs/verification/time-picker-react-island.md`
- Modify: `tests/contracts/workspace.test.tsx`（仅在公共导出契约需要时）

**Interfaces:**
- Consumes: 完整 TimePicker 页面和 ConfigProvider 静态消费者。
- Produces: 可重复运行的三档验收证据与 `candidate_pass` 记录。

- [ ] 写 E2E 契约，覆盖 8 Demo、真实选择、范围、尺寸、禁用、格式和步长。
- [ ] 锁定 1440/1024/375 无横向溢出、控制台无错误和 ConfigProvider 回归。
- [ ] 启动 Vite，运行 TimePicker E2E 三项目。
- [ ] 检查弹层、触发器、列容器和直接子列的实际尺寸及祖先裁切链。
- [ ] 人工查看三档打开态截图；发现差异先修复并重跑。
- [ ] 运行 `pnpm typecheck`、`pnpm test`、`pnpm build`、`git diff --check`。
- [ ] 写入真实通过数、警告和独立验收 `pending`，不扩大完成声明。
