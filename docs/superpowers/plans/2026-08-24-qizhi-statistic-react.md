# QIZHI Statistic React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 4 组 Statistic Demo 迁移为可从 `@wangxiaojinger/qizhi-react` 导入的正式组件与同源 React 文档。

**Architecture:** `packages/qizhi-react` 承担 Statistic 的格式化、DOM、加载呈现和样式；`apps/qizhi-docs` 只组织 4 个独立 Demo、API 元数据和同源代码区。原生 Statistic 页面被 React Island 根节点替代，不改动其他文档壳层。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite、Playwright

**Spec:** `docs/specs/qizhi-statistic-contract-v1.md`

## Global Constraints

- 保留 4 个 Demo 的标题、说明、顺序、数据、布局、初始状态和交互。
- 空说明保持为空，不翻译、不简化、不补写。
- 实现、类型、API 文档、展示代码和复制代码必须同源。
- 加载占位为 Statistic 内部能力，不新增公共 Skeleton。
- 不修改全局 Token，不覆盖无关工作区改动。

---

### Task 1: Statistic 类型、格式化与渲染

**Files:**
- Create: `packages/qizhi-react/src/statistic/Statistic.types.ts`
- Create: `packages/qizhi-react/src/statistic/Statistic.test.tsx`
- Create: `packages/qizhi-react/src/statistic/Statistic.tsx`
- Create: `packages/qizhi-react/src/statistic/statistic.css`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `Statistic` 和 `StatisticProps`；`value: number | string`，`format?: "YYYY/MM/DD HH:mm:ss"`。

- [ ] 先写失败测试，覆盖千分位、`precision={2}`、前后缀、extra、`<time>`、loading 和 ref。
- [ ] 运行 `pnpm exec vitest run packages/qizhi-react/src/statistic/Statistic.test.tsx`，确认因 Statistic 尚未实现而失败。
- [ ] 实现最小格式化和 DOM，加载时渲染 `role="status"`。
- [ ] 加入 Statistic 样式与 `prefers-reduced-motion`，并从包入口导出组件、类型和 CSS。
- [ ] 重跑范围测试，确认通过。

### Task 2: 四组同源 Demo 与 API 文档

**Files:**
- Create: `apps/qizhi-docs/src/statistic/demos/*.tsx`
- Create: `apps/qizhi-docs/src/statistic/statisticDocs.registry.ts`
- Create: `apps/qizhi-docs/src/statistic/StatisticDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/statistic/statisticApi.ts`
- Create: `apps/qizhi-docs/src/statistic/StatisticApiTable.tsx`
- Create: `apps/qizhi-docs/src/statistic/StatisticDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/statistic/statisticDocs.css`
- Create: `apps/qizhi-docs/src/statistic/statisticDocs.test.tsx`
- Create: `apps/qizhi-docs/src/statistic/main.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Statistic`, `StatisticProps`, `Switch`, `Button`, `CodeIcon`, `CopyIcon`, `ArrowUpIcon`, `ArrowDownIcon`.
- Produces: `statisticDemos` 与 `statisticApi`。

- [ ] 先写失败的文档契约测试，锁定 4 个 Demo 顺序、逐字说明、实例数、数据、初始加载状态、正式导入、`.tsx?raw` 同源和 API 键。
- [ ] 运行 `pnpm exec vitest run apps/qizhi-docs/src/statistic/statisticDocs.test.tsx`，确认因文档尚未实现而失败。
- [ ] 实现 4 个独立 Demo，加载 Demo 使用受控 `Switch`。
- [ ] 实现注册表、公共 Demo 操作区、API 元数据和 API 表。
- [ ] 将 `#component-statistic` 替换为 React Island 根节点，并添加 `main.tsx` 入口。
- [ ] 重跑范围测试，确认通过。

### Task 3: 三档 E2E 与交付验证

**Files:**
- Create: `tests/e2e/statistic-react-island.spec.ts`
- Create: `docs/verification/statistic-react-island.md`

**Interfaces:**
- Consumes: Statistic React Island 的稳定锚点和 QIZHI 公共 DOM 契约。
- Produces: 可重跑的三视口几何、交互、溢出和截图证据。

- [ ] 先写 Playwright 测试，覆盖 1440/1024/375、布局方向、字号、颜色、Switch 点击与 Space、Skeleton 和数值可见性、页面/Demo 溢出、控制台以及局部截图。
- [ ] 运行 Statistic E2E，修复测试揭示的契约差异。
- [ ] 运行 Statistic 单测、文档测试、`pnpm typecheck`、`pnpm build`、`node --check script.js`。
- [ ] 在 1440/1024/375 截取局部截图并人工查看标题、数值、前后缀、间距、Skeleton 与边界。
- [ ] 记录命令、通过数、已知限制和 `candidate_pass`。
