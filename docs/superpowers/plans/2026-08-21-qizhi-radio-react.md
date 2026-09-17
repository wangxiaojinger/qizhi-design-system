# QIZHI Radio React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已确认的 4 组旧站 Radio Demo 迁移为可从 `@wangxiaojinger/qizhi-react` 导入的正式 Radio 与 Radio.Group。

**Architecture:** `packages/qizhi-react` 是 Radio 行为、类型与样式的唯一来源，`apps/qizhi-docs` 通过 React Island 真实调用并从独立 Demo TSX 读取预览/复制源码。填充型按钮复用已有 `qizhi-segmented` 视觉协议，文档操作复用 Button、CodeIcon 和 CopyIcon。

**Tech Stack:** React 19、TypeScript 7、Vitest、Testing Library、Vite、Playwright、CSS

**Spec:** `docs/specs/qizhi-radio-contract-v1.md`

## Global Constraints

- 仅迁移 Radio，不扩大到独立 Segmented、Table 行选择或 Choice Card。
- 保留 4 组 Demo 的标题、原说明、顺序、数量、默认状态与可见交互。
- 所有公共导出使用 QIZHI 命名，不引入 Arco API。
- 每个生产行为先写失败测试，确认 RED 后再实现。
- 不显示 Demo 文件名、路径、语言徽标或额外工具栏。

---

### Task 1: Radio 公共组件与类型

**Files:**
- Create: `packages/qizhi-react/src/radio/Radio.types.ts`
- Create: `packages/qizhi-react/src/radio/Radio.test.tsx`
- Create: `packages/qizhi-react/src/radio/Radio.types.test.tsx`
- Create: `packages/qizhi-react/src/radio/Radio.tsx`
- Create: `packages/qizhi-react/src/radio/radio.css`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `Radio` with static `Radio.Group`, `RadioProps`, `RadioGroupProps`, `RadioOption`, `RadioValue`, `RadioType`, `RadioMode`, `RadioSize`.

- [ ] 先写行为与类型失败测试，覆盖单项、Group、options、禁用、两种 mode、三种 size、受控/非受控、事件与 ref。
- [ ] 运行 `pnpm test packages/qizhi-react/src/radio/Radio.test.tsx packages/qizhi-react/src/radio/Radio.types.test.tsx`，确认因 Radio 尚未存在而 RED。
- [ ] 实现最小 Radio/Group、context 值协调、原生 input 语义和 QIZHI 样式。
- [ ] 增加公共导出和 CSS 入口，再运行定向测试确认 GREEN。

### Task 2: Radio 文档 Island、Demo 与 API

**Files:**
- Create: `apps/qizhi-docs/src/radio/radioDocs.test.tsx`
- Create: `apps/qizhi-docs/src/radio/RadioDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/radio/RadioDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/radio/RadioApiTable.tsx`
- Create: `apps/qizhi-docs/src/radio/radioApi.ts`
- Create: `apps/qizhi-docs/src/radio/radioDocs.registry.ts`
- Create: `apps/qizhi-docs/src/radio/radioDocs.css`
- Create: `apps/qizhi-docs/src/radio/main.tsx`
- Create: `apps/qizhi-docs/src/radio/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/radio/demos/GroupDemo.tsx`
- Create: `apps/qizhi-docs/src/radio/demos/OutlineButtonDemo.tsx`
- Create: `apps/qizhi-docs/src/radio/demos/FillButtonDemo.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Radio`, `Button`, `CodeIcon`, `CopyIcon` from `@wangxiaojinger/qizhi-react`.
- Produces: `radioDemos`, `radioApi`, `radioGroupApi`, `RadioDocsIsland` and mount entry.

- [ ] 先写文档失败测试，固定 4 组 Demo 顺序、原文案、实例数、默认值、同源代码和 API 列。
- [ ] 运行 `pnpm test apps/qizhi-docs/src/radio/radioDocs.test.tsx`，确认因文档岛尚未存在而 RED。
- [ ] 实现四个独立 Demo、数量/尺寸联动、通用代码操作、API 表和岛挂载。
- [ ] 替换 `#component-radio` 内容并加载 Radio 入口，运行文档定向测试确认 GREEN。

### Task 3: 结构、类型、测试与构建门槛

**Files:**
- Modify: `apps/qizhi-docs/src/apiAnchors.test.tsx`
- Modify: `tests/contracts/workspace.test.tsx` only if the public export matrix requires explicit Radio coverage.

**Interfaces:**
- Consumes: Radio package and docs outputs from Tasks 1-2.
- Produces: verified package/docs integration.

- [ ] 先增加锚点/公共导出失败断言，运行相关测试确认 RED。
- [ ] 完成最小整合修复并确认定向 GREEN。
- [ ] 运行 `node --check script.js`、`pnpm typecheck`、`pnpm test`、`pnpm build`，修复本次引入的失败。

### Task 4: Radio 三档浏览器与截图验收

**Files:**
- Create: `tests/e2e/radio-react-island.spec.ts`
- Create: `docs/verification/radio-react-island.md`

**Interfaces:**
- Consumes: built Radio docs Island.
- Produces: repeatable 1440/1024/375 interaction, geometry, overflow, console and screenshot evidence.

- [ ] 先写 Playwright 用例，覆盖 4 组 Demo、三尺寸、鼠标/键盘/禁用、数量回退、无溢出和控制台。
- [ ] 运行 `pnpm exec playwright test tests/e2e/radio-react-island.spec.ts`，确认用例在文档整合缺失时能失败，完成修复后重跑。
- [ ] 对 desktop-1440、narrow-1024、mobile-375 输出局部截图，逐张人工查看标记、文字、控制器、换行、间距和边界。
- [ ] 写入真实命令、通过数、截图结论、限制和 `candidate_pass` / `pending` 状态。
