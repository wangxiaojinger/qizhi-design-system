# QIZHI Tag React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 6 组 Tag Demo 迁移为可导入、可测试、文档同源的 `@wangxiaojinger/qizhi-react` Tag，并补全确认过的关闭与显示隐藏交互。

**Architecture:** `packages/qizhi-react` 提供 Tag、类型、样式和所需图标；`apps/qizhi-docs` 仅组织 6 个独立 Demo、公共代码操作和结构化 API。文档局部 Toggle 复用旧站 Switch DOM/CSS 协议，不扩张 Tag API 或迁移完整 Switch。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite、Playwright。

**Spec:** `docs/specs/qizhi-tag-contract-v1.md`

## Global Constraints

- 6 个 Demo 的标题、说明、顺序、实例数量、尺寸、状态和布局必须与旧站证据一致。
- 所有正式组件和图标使用 QIZHI 命名；文档 Demo 从 `@wangxiaojinger/qizhi-react` 导入。
- API 仅包含契约中实际实现的 Tag 能力；代码预览和复制与 Demo TSX 同源。
- 用户可见文案默认中文；不显示 `Demo.tsx`、路径或语言徽标。
- 遵循严格 TDD：每项行为先运行失败测试，再写最小实现。

---

### Task 1: 正式 Tag 与图标

**Files:**
- Create: `packages/qizhi-react/src/tag/Tag.types.ts`
- Create: `packages/qizhi-react/src/tag/Tag.tsx`
- Create: `packages/qizhi-react/src/tag/Tag.test.tsx`
- Create: `packages/qizhi-react/src/tag/tag.css`
- Create: `packages/qizhi-react/src/icon/CheckCircleIcon.tsx`
- Create: `packages/qizhi-react/src/icon/StarIcon.tsx`
- Modify: `packages/qizhi-react/src/icon/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `Tag`, `TagProps`, `TagSize`, `TagPresetColor`, `CheckCircleIcon`, `StarIcon` from `@wangxiaojinger/qizhi-react`.

- [ ] 写失败测试，覆盖默认结构、四尺寸、颜色/边框、图标、关闭/visible、受控和非受控 checkable、Enter/Space、ref 与 ARIA。
- [ ] 运行 `pnpm vitest run packages/qizhi-react/src/tag/Tag.test.tsx`，确认因 Tag 尚不存在而失败。
- [ ] 实现最小类型、组件、样式和图标导出。
- [ ] 重跑 Tag 测试，确认全部通过且无控制台警告。

### Task 2: 六组同源 Demo 与 API

**Files:**
- Create: `apps/qizhi-docs/src/tag/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/tag/demos/ClosableDemo.tsx`
- Create: `apps/qizhi-docs/src/tag/demos/ColorDemo.tsx`
- Create: `apps/qizhi-docs/src/tag/demos/CheckableDemo.tsx`
- Create: `apps/qizhi-docs/src/tag/demos/SizeDemo.tsx`
- Create: `apps/qizhi-docs/src/tag/demos/BorderedDemo.tsx`
- Create: `apps/qizhi-docs/src/tag/tagDocs.registry.ts`
- Create: `apps/qizhi-docs/src/tag/tagApi.ts`
- Create: `apps/qizhi-docs/src/tag/TagDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/tag/TagApiTable.tsx`
- Create: `apps/qizhi-docs/src/tag/TagDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/tag/main.tsx`
- Create: `apps/qizhi-docs/src/tag/tagDocs.css`
- Create: `apps/qizhi-docs/src/tag/tagDocs.test.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: Task 1 的正式 Tag、Space、Button、CodeIcon、CopyIcon、CheckCircleIcon、StarIcon。
- Produces: 6 个稳定 Demo 定义、`tagApi` 元数据、`tag-API` 锚点和 `qizhi:react-island-ready` 事件。

- [ ] 写失败文档测试，断言 6 个 Demo 的顺序/文案/实例、正式组件复用、关闭和 Toggle、同源代码、API 行与锚点。
- [ ] 运行 `pnpm vitest run apps/qizhi-docs/src/tag/tagDocs.test.tsx`，确认因 Tag 文档岛不存在而失败。
- [ ] 实现 6 个独立 Demo、registry、API 表、公共代码操作和 React Island 挂载。
- [ ] 重跑文档测试，确认全部通过。

### Task 3: 三档浏览器契约与全量验证

**Files:**
- Create: `tests/e2e/tag-react-island.spec.ts`
- Create: `docs/verification/tag-react-island.md`

**Interfaces:**
- Consumes: Task 1、2 的正式组件和文档站。
- Produces: 可重跑的三档行为、几何、溢出、截图证据与 `candidate_pass` 记录。

- [ ] 写 Playwright 测试，覆盖 6 个 Demo、20/24/28/32px、关闭、Toggle、鼠标/Enter/Space、颜色/边框、1440/1024/375 换行、页面溢出和控制台。
- [ ] 启动 `pnpm dev`，运行 Tag Playwright，先确认测试能暴露未满足的浏览器契约，再修正实现。
- [ ] 执行 `node --check script.js`、`pnpm verify`、`pnpm exec playwright test tests/e2e/tag-react-island.spec.ts`。
- [ ] 人工查看 1440/1024/375 打开态/交互后截图，记录几何、颜色、边缘、换行和无裁切结论。
- [ ] 写入 `docs/verification/tag-react-island.md`，仅声明 `candidate_pass`，独立验证保持 `pending`。
