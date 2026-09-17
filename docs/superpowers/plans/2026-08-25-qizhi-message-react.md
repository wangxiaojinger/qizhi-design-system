# QIZHI Message React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 7 个 Message Demo 迁移为 QIZHI 自有 React 公共组件与同源文档。

**Architecture:** `@wangxiaojinger/qizhi-react` 提供全局 Message 管理器、React 消息层和 `useMessage` 局部上下文；文档注册表直接导入格式化 TSX 原文。旧站静态初始化跳过 React Island，其他旧消费者保持不变。

**Tech Stack:** React、TypeScript、Vitest、Testing Library、Vite、Playwright。

**Spec:** `docs/specs/qizhi-message-contract-v1.md`

## Global Constraints

- 7 个 Demo 的标题、说明、顺序、数据和文案不翻译、不简化、不补写。
- `closable` 默认值按确认后的运行契约固定为 `false`。
- Demo UI、格式化 TSX、展示代码和复制代码必须同源。
- 必须复用 QIZHI Button 和正式图标，并执行 1440、1024、375 三档浏览器验收。

---

### Task 1: 公共 Message 组件

**Files:**
- Create: `packages/qizhi-react/src/message/Message.types.ts`
- Create: `packages/qizhi-react/src/message/Message.tsx`
- Create: `packages/qizhi-react/src/message/message.css`
- Test: `packages/qizhi-react/src/message/Message.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `Message`, `useMessage`, `MessageConfig`, `MessageType`, `MessageApi`。

- [ ] 写失败测试，锁定默认关闭策略、类型、id 更新、关闭函数、自动关闭、全局配置和局部 holder。
- [ ] 运行测试并确认因 Message 模块缺失而失败。
- [ ] 实现最小公共 API、React 消息层、计时器、焦点/ARIA 和样式。
- [ ] 运行组件测试、类型检查并修复至通过。

### Task 2: 七个同源 Demo 与 API 文档

**Files:**
- Create: `apps/qizhi-docs/src/message/demos/*.tsx`
- Create: `apps/qizhi-docs/src/message/messageDocs.registry.ts`
- Create: `apps/qizhi-docs/src/message/MessageDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/message/messageApi.ts`
- Create: `apps/qizhi-docs/src/message/MessageApiTable.tsx`
- Create: `apps/qizhi-docs/src/message/MessageDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/message/messageDocs.css`
- Create: `apps/qizhi-docs/src/message/main.tsx`
- Test: `apps/qizhi-docs/src/message/messageDocs.test.tsx`
- Modify: `index.html`
- Modify: `script.js`

**Interfaces:**
- Consumes: Task 1 的公共 `Message`、`useMessage`、Button 与图标。
- Produces: 7 个 React Demo、结构化 API 和同源代码操作区。

- [ ] 写失败测试，锁定 7 个 Demo、原始文案/数据和禁止自制标签。
- [ ] 运行并确认因注册表缺失而失败。
- [ ] 实现 7 个格式化 Demo、注册表、API 表、Island 和静态初始化隔离。
- [ ] 运行文档测试、类型检查并修复至通过。

### Task 3: 三档浏览器契约与最终验证

**Files:**
- Create: `tests/e2e/message-react-island.spec.ts`
- Modify: `tests/e2e/demo-code-actions.spec.ts`
- Create: `docs/verification/message-react-island.md`

**Interfaces:**
- Consumes: Task 1、Task 2 的最终公开行为。
- Produces: 三档视觉、坐标、时序、交互、同源与旧消费者回归证据。

- [ ] 写浏览器契约，覆盖 7 个 Demo、重复点击、更新、手动/自动/关闭按钮、局部 holder、键盘、计算样式和截图。
- [ ] 在实现未接入前运行并确认失败。
- [ ] 完成 Island 接入和必要的最小样式修正。
- [ ] 运行 `node --check script.js`、`pnpm typecheck`、`pnpm test`、`pnpm build`、三档 Playwright 与 `git diff --check`。
- [ ] 人工查看各类型、更新态、关闭态和 contextHolder 截图，记录 `candidate_pass / pending`。
