# QIZHI Empty React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已确认的 Empty 旧站 Demo 与指定 Figma SVG 迁移为 `@wangxiaojinger/qizhi-react` 正式组件和同源官网文档。

**Architecture:** `packages/qizhi-react/src/empty` 是类型、DOM、样式和默认资产的唯一来源；`apps/qizhi-docs/src/empty` 只组合正式组件、同源 Demo 与 API 元数据。原生壳层仅替换 `#component-empty` 内容并增加 Island 入口。

**Tech Stack:** React 19、TypeScript、CSS、Vitest、Testing Library、Vite、Playwright

**Spec:** `docs/specs/qizhi-empty-contract-v1.md`

## Global Constraints

- 只迁移 Empty，不扩大其他消费者重构。
- 使用用户上传 SVG 原始字节，不手绘近似图。
- API 仅包含契约 v1 能力；代码预览与复制来自同一 TSX。
- 按 1440/1024/375 验收并人工查看截图。

---

### Task 1: 正式 Empty 组件

**Files:**
- Create: `packages/qizhi-react/src/empty/Empty.test.tsx`
- Create: `packages/qizhi-react/src/empty/Empty.types.ts`
- Create: `packages/qizhi-react/src/empty/Empty.tsx`
- Create: `packages/qizhi-react/src/empty/empty.css`
- Create: `packages/qizhi-react/src/empty/qizhi-empty.svg`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:** Produces `EmptyProps` and `Empty` from `@wangxiaojinger/qizhi-react`.

- [ ] 写默认 SVG、描述、隐藏描述、ref 和根属性失败测试。
- [ ] 运行 `pnpm test -- packages/qizhi-react/src/empty/Empty.test.tsx`，确认因模块缺失失败。
- [ ] 实现最小组件、样式和导出，复制并校验附件哈希。
- [ ] 重跑定向测试并确认通过。

### Task 2: 官网 Island、同源 Demo 与 API

**Files:**
- Create: `apps/qizhi-docs/src/empty/*`
- Modify: `index.html`
- Test: `apps/qizhi-docs/src/empty/emptyDocs.test.tsx`

**Interfaces:** Consumes `Empty`、`Button`、`CodeIcon`、`CopyIcon`; produces one Demo and `empty-API` anchor.

- [ ] 写 Demo 数量、标题、正式组件、同源源码和 API 的失败测试。
- [ ] 运行定向文档测试，确认因文档模块缺失失败。
- [ ] 实现 Island、注册表、Demo、代码操作和 API 元数据。
- [ ] 将原静态区块交给 Island 挂载并增加模块入口。
- [ ] 重跑文档测试并确认通过。

### Task 3: 浏览器契约与完整验证

**Files:**
- Create: `tests/e2e/empty-react-island.spec.ts`
- Create: `docs/verification/empty-react-island.md`

**Interfaces:** Verifies the public docs route and package behavior.

- [ ] 添加三档尺寸、SVG、描述、操作区、同源代码、溢出与控制台断言。
- [ ] 执行 `pnpm typecheck`、定向测试、`pnpm test`、`pnpm build`。
- [ ] 执行 Empty 定向 E2E 和全量 `pnpm e2e`。
- [ ] 人工查看 1440/1024/375 截图，记录真实结果与限制。
