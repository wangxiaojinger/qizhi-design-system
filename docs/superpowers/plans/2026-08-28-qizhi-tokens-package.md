# QIZHI Tokens Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立以结构化 manifest 为唯一事实源的 `@wangxiaojinger/qizhi-tokens`，生成兼容现有变量值的 CSS，并让旧站、`@wangxiaojinger/qizhi-react` 与 `$qizhi-react-page-builder` 消费同一来源。

**Architecture:** `packages/qizhi-tokens/src/tokens.json` 保存当前公共 `:root` 变量的名称、原始值、类别和描述；构建脚本确定性生成 `dist/style.css` 与类型化 JavaScript。旧站先通过额外 `<link>` 加载生成 CSS，同时暂时保留原 `styles.css :root` 作为兼容回退；React 包构建时导入 token CSS；Page Builder 只读取公开 manifest。

**Tech Stack:** Node.js ESM、JSON、CSS Custom Properties、pnpm workspace、Vitest、Vite、Playwright。

**Spec:** 用户在 2026-08-28 当前会话确认的 QIZHI token 分层与无损迁移方案。

## Global Constraints

- 不改变任何现有 token 名称或值。
- 不实现暗色模式、动态色板算法、Design Lab、品牌切换或 token 重命名。
- 保留旧站 `styles.css :root` 到独立视觉回归完成，避免一次性破坏消费者。
- 不覆盖工作树中已有的 React 迁移与图标分类改动。
- 自动化通过最高声明 `candidate_pass`；独立最终验证保持 `pending`。

---

### Task 1: Token manifest and deterministic build

**Files:**
- Create: `packages/qizhi-tokens/package.json`
- Create: `packages/qizhi-tokens/src/tokens.json`
- Create: `packages/qizhi-tokens/scripts/build.mjs`
- Create: `packages/qizhi-tokens/scripts/validate.mjs`
- Create: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Generate: `packages/qizhi-tokens/dist/style.css`
- Generate: `packages/qizhi-tokens/dist/index.js`
- Generate: `packages/qizhi-tokens/dist/index.d.ts`

**Interfaces:**
- Consumes: current `styles.css` first `:root` declarations as migration evidence.
- Produces: `@wangxiaojinger/qizhi-tokens/style.css`, `@wangxiaojinger/qizhi-tokens/tokens.json`, and typed `tokens` export.

- [ ] Write tests asserting manifest uniqueness, reference resolution, current name/value parity, and deterministic generated outputs.
- [ ] Run `node --test packages/qizhi-tokens/tests/tokens.node.mjs` and confirm failure because the package does not exist.
- [ ] Add the package, structured manifest, build and validation scripts.
- [ ] Generate artifacts and rerun the tests until they pass.

### Task 2: Old-site compatibility consumption

**Files:**
- Modify: `index.html`
- Test: `packages/qizhi-tokens/tests/tokens.node.mjs`

**Interfaces:**
- Consumes: `packages/qizhi-tokens/dist/style.css`.
- Produces: a token stylesheet loaded before the unchanged legacy `styles.css` fallback.

- [ ] Add a failing test requiring the token stylesheet link before `styles.css`.
- [ ] Run the focused test and confirm the expected failure.
- [ ] Add the versioned token stylesheet link without changing unrelated HTML.
- [ ] Rerun the focused test.

### Task 3: React package consumption

**Files:**
- Modify: `packages/qizhi-react/package.json`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` through pnpm.
- Test: `packages/qizhi-tokens/tests/tokens.node.mjs`

**Interfaces:**
- Consumes: `@wangxiaojinger/qizhi-tokens/style.css`.
- Produces: QIZHI React full-style output containing default token definitions.

- [ ] Add failing assertions for the workspace dependency, React style import, and root verify scripts.
- [ ] Run the focused test and confirm failure.
- [ ] Add the dependency/import and include token verification in root commands.
- [ ] Refresh the lockfile without changing dependency versions.
- [ ] Run token tests, React typecheck and React build.

### Task 4: Page Builder manifest consumption

**Files:**
- Modify: `skills/qizhi-react-page-builder/SKILL.md`
- Modify: `skills/qizhi-react-page-builder/references/source-boundary.md`
- Modify: `skills/qizhi-react-page-builder/scripts/inventory_react.py`
- Modify: `skills/qizhi-react-page-builder/tests/test_source_scope.py`

**Interfaces:**
- Consumes: `packages/qizhi-tokens/src/tokens.json`.
- Produces: token inventory with name, value, category and description; rejects the old `styles.css:root` source.

- [ ] Change tests first to require manifest data and reject the old CSS source.
- [ ] Run the Python suite and confirm the intended failures.
- [ ] Update the Skill contract, source boundary and inventory implementation.
- [ ] Run the Python suite and official Skill validator.

### Task 5: Regression verification

**Files:**
- Create: `/private/tmp` screenshots and reports only; do not commit them.

**Interfaces:**
- Consumes: built token CSS, old site, React docs site.
- Produces: evidence for `candidate_pass` without claiming independent acceptance.

- [ ] Run token tests and validation.
- [ ] Run `node --check script.js`, structural HTML checks, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- [ ] Compare all generated token computed values with the legacy `:root` values.
- [ ] Verify old-site 1440/1024/375 loading, overflow and console state.
- [ ] Exercise representative token-sensitive interactions and inspect screenshots.
- [ ] Record any pre-existing failures separately and keep independent verification `pending`.
