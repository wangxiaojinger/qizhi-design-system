# QIZHI DetailHeader React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站详情头部迁移为公共 React 组件与同源文档 Island，保持内容、视觉和交互契约。

**Architecture:** `DetailHeader` 只提供业务头部的稳定结构与受控状态展示；Demo 组合现有公共 Button、Tooltip、Avatar、Tabs、Drawer、Table、Link 和图标。文档 registry 通过 `?raw` 读取真实 Demo TSX，并复用公共代码操作区和 API 表。

**Tech Stack:** React、TypeScript、CSS、Vitest、Testing Library、Playwright、Vite。

**Spec:** `docs/specs/qizhi-detail-header-contract-v1.md`

## Global Constraints

- 原文、顺序、数据、默认状态、尺寸和交互不得改写。
- Demo 不得出现原生交互标签、自绘 SVG、内联布局或跨组件私有选择器。
- 新能力同步更新实现、类型、导出、API、Demo、展示/复制代码、测试和 E2E。
- 自动验收后状态最多为 `candidate_pass`。

---

### Task 1: 公共 DetailHeader

**Files:**
- Create: `packages/qizhi-react/src/detail-header/DetailHeader.types.ts`
- Create: `packages/qizhi-react/src/detail-header/DetailHeader.tsx`
- Create: `packages/qizhi-react/src/detail-header/detailHeader.css`
- Create: `packages/qizhi-react/src/detail-header/DetailHeader.test.tsx`
- Create: `packages/qizhi-react/src/detail-header/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `DetailHeader`, `DetailHeaderProps`, `DetailHeaderProperty`, `DetailHeaderStatus`。

- [ ] 先写测试：语义 article、标题关联、状态、属性、审计、操作与 tabs 槽位全部渲染。
- [ ] 运行测试并确认因模块不存在而失败。
- [ ] 实现最小公共组件、类型、CSS 与导出。
- [ ] 运行组件测试和 typecheck 至通过。

### Task 2: 同源文档 Island

**Files:**
- Create: `apps/qizhi-docs/src/business-detail-header/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/business-detail-header/DetailHeaderDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/business-detail-header/detailHeaderDocs.registry.ts`
- Create: `apps/qizhi-docs/src/business-detail-header/DetailHeaderApiTable.tsx`
- Create: `apps/qizhi-docs/src/business-detail-header/detailHeaderDocs.css`
- Create: `apps/qizhi-docs/src/business-detail-header/DetailHeaderDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/business-detail-header/detailHeaderDocs.test.tsx`
- Create: `apps/qizhi-docs/src/business-detail-header/main.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `DetailHeader` 与现有公共组件。
- Produces: `#business-detail-header[data-react-island="business-detail-header"]`。

- [ ] 先写文档测试：精确标题/说明/顺序、公共操作区、API、同源与无原生交互标签。
- [ ] 运行测试并确认因 Island 不存在而失败。
- [ ] 实现单一 BasicDemo、交互说明、API 表和公共操作区。
- [ ] 将旧 HTML 区块替换为 React mount，并注册 module script。
- [ ] 运行文档测试和契约搜索至通过。

### Task 3: 浏览器契约

**Files:**
- Create: `tests/e2e/business-detail-header-react-island.spec.ts`
- Create: `docs/verification/business-detail-header-react-island.md`

**Interfaces:**
- Consumes: 生产文档服务与 `#business-detail-header`。

- [ ] 先写 E2E：三档无溢出、状态双向切换、Tooltip、Tabs、Drawer 打开/关闭及关键几何。
- [ ] 运行并确认旧静态实现不满足 React/API/同源门禁。
- [ ] 完成注册与响应式修复。
- [ ] 运行单测、typecheck、build、三档 E2E、控制台检查并人工查看关键截图。
