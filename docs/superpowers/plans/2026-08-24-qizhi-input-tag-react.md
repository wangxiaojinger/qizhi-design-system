# QIZHI InputTag React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 6 个 InputTag Demo 按确认契约迁移为 QIZHI 公共 React 组件与同源文档。

**Architecture:** 新增独立 `InputTag` 公共组件，内部复用 `Tag`、`CloseIcon` 和公共输入容器协议；文档采用 Input 的 registry/codebox/API 结构。响应式折叠使用真实标签宽度和 `ResizeObserver`，不改造 Select、TreeSelect 等消费者。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite、Playwright。

**Spec:** `docs/specs/qizhi-input-tag-migration-map-v1.md`

## Global Constraints

- 保持 6 个 Demo 的标题、原始说明、顺序、数据、文案、尺寸和初始状态。
- 预览 TSX、展示 TSX、复制 TSX 必须来自同一 Demo 模块；共享 Demo CSS 同源展示和复制。
- 不新增旧站无证据能力，不替换 Select、TreeSelect、Cascader 内部标签。
- 每项行为先写失败测试并观察预期失败，再写最小实现。
- 最终验证 1440、1024、375 三档、控制台、横向溢出和目标截图。

---

### Task 1: 公共 InputTag 行为与类型

**Files:**
- Create: `packages/qizhi-react/src/input-tag/InputTag.types.ts`
- Create: `packages/qizhi-react/src/input-tag/InputTag.tsx`
- Create: `packages/qizhi-react/src/input-tag/inputTag.css`
- Create: `packages/qizhi-react/src/input-tag/InputTag.test.tsx`
- Modify: `packages/qizhi-react/src/tag/Tag.types.ts`
- Modify: `packages/qizhi-react/src/tag/Tag.tsx`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `packages/qizhi-react/src/index.css`

**Interfaces:**
- Consumes: `Tag`, `CloseIcon`, `controlContainerClassName`。
- Produces: `InputTag`, `InputTagProps`, `InputTagValue`, `InputTagLabelValue`, `InputTagSize`。

- [ ] **Step 1: 写失败测试**

覆盖 Enter/逗号提交、空输入 Backspace、删除、清空与焦点恢复、
`labelInValue`、`validate` 拒绝/格式化、`saveOnBlur`、固定和响应式折叠。

- [ ] **Step 2: 运行测试并确认因组件尚不存在而失败**

Run: `pnpm exec vitest run packages/qizhi-react/src/input-tag/InputTag.test.tsx`
Expected: FAIL，缺少 `InputTag` 模块或对应行为。

- [ ] **Step 3: 实现最小公共组件**

实现受控/非受控数组、输入提交、标签操作、真实宽度测量和 ref；`Tag` 仅增加
`closeAriaLabel?: string`，InputTag 使用 `删除 ${label}`。

- [ ] **Step 4: 运行公共组件测试**

Run: `pnpm exec vitest run packages/qizhi-react/src/input-tag packages/qizhi-react/src/tag`
Expected: PASS。

### Task 2: 六个同源文档 Demo 与 API

**Files:**
- Create: `apps/qizhi-docs/src/input-tag/InputTagDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/input-tag/InputTagDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/input-tag/InputTagApiTable.tsx`
- Create: `apps/qizhi-docs/src/input-tag/inputTagApi.ts`
- Create: `apps/qizhi-docs/src/input-tag/inputTagDocs.registry.ts`
- Create: `apps/qizhi-docs/src/input-tag/inputTagDocs.test.tsx`
- Create: `apps/qizhi-docs/src/input-tag/inputTagDocs.css`
- Create: `apps/qizhi-docs/src/input-tag/inputTagDemos.css`
- Create: `apps/qizhi-docs/src/input-tag/main.tsx`
- Create: `apps/qizhi-docs/src/input-tag/demos/*.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `InputTag` 公共 API、`Radio.Group`、公共 Codebox/API 表基线。
- Produces: `inputTagDemos` 单一 registry、`#input-tag-API`、React Island 入口。

- [ ] **Step 1: 写失败的文档契约测试**

锁定 6 个 ID、标题、原始说明、顺序、Demo 数量、公共组件引用、API 和
每个 Demo 的 TSX/CSS 来源。

- [ ] **Step 2: 运行测试并观察预期失败**

Run: `pnpm exec vitest run apps/qizhi-docs/src/input-tag/inputTagDocs.test.tsx`
Expected: FAIL，文档模块尚不存在。

- [ ] **Step 3: 实现 Demo、registry、codebox、API 与入口挂载**

删除 `#component-input-tag` 旧静态内容但保留路由根 ID；挂载新的 module script。

- [ ] **Step 4: 运行定向测试和类型检查**

Run: `pnpm exec vitest run packages/qizhi-react/src/input-tag apps/qizhi-docs/src/input-tag && pnpm typecheck`
Expected: PASS。

### Task 3: 浏览器契约、全量回归与验收记录

**Files:**
- Create: `tests/e2e/input-tag-react-island.spec.ts`
- Create: `docs/specs/qizhi-input-tag-contract-v1.md`
- Create: `docs/verification/input-tag-react-island.md`

**Interfaces:**
- Consumes: React Island、组件 API、文档 registry。
- Produces: 三档可重复验收和 `candidate_pass` 记录。

- [ ] **Step 1: 写浏览器契约测试**

覆盖 6 个 Demo、28/32/36px、Enter/逗号/Backspace、删除/清空/失焦、校验、
格式化、固定/响应式折叠、同源代码、无溢出、控制台和截图。

- [ ] **Step 2: 运行三档测试并修正真实失败**

Run: `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test tests/e2e/input-tag-react-island.spec.ts`
Expected: 3 projects PASS。

- [ ] **Step 3: 完成全量验证**

Run: `pnpm test && pnpm typecheck && pnpm build && node --check script.js && git diff --check`
Expected: 全部退出码 0；构建仅允许记录既有 chunk 警告。

- [ ] **Step 4: 人工查看三档目标截图并写入验收记录**

记录实际测试数量、截图结论、限制及独立验证 `pending`。

