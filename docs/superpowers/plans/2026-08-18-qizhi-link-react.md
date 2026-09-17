# QIZHI Link React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved QIZHI Link v1 as a tested `@wangxiaojinger/qizhi-react` component and make the QIZHI docs site render its real demos, code and API metadata.

**Architecture:** `packages/qizhi-react` owns Link behavior, types, icons and styles. `apps/qizhi-docs` owns only five TSX demos, same-source code display and structured API metadata; the legacy `#components-link` shell becomes a React island.

**Tech Stack:** React 19, TypeScript 7, Vitest, Testing Library, Vite, Playwright.

**Spec:** `docs/specs/qizhi-link-contract-v1.md`

## Global Constraints

- Use only QIZHI names and existing tokens; never introduce `arco-*` or `ac-*` identifiers.
- `href` selects `<a>`; missing `href` selects `<button>`.
- `icon=true` uses `LinkIcon` from `<icon-链接 />`; the custom example uses `EditIcon` from `<icon-编辑 />`.
- Link text is `14px`; icon/text gap is `6px`.
- The five approved demos are additive and use the real package component.
- Do not commit: the user will commit all migrated components together.

---

### Task 1: QIZHI Link icons

**Files:**
- Create: `packages/qizhi-react/src/icon/LinkIcon.tsx`
- Create: `packages/qizhi-react/src/icon/EditIcon.tsx`
- Modify: `packages/qizhi-react/src/icon/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`
- Test: `packages/qizhi-react/src/link/Link.test.tsx`

**Interfaces:**
- Consumes: `qz-icon-0-5226.svg`, `qz-icon-0-5232.svg` path data.
- Produces: `LinkIcon` and `EditIcon`, each accepting `SVGProps<SVGSVGElement>` and inheriting `currentColor`.

- [ ] Write a failing Link test importing both icons and asserting decorative SVGs use `aria-hidden="true"`.
- [ ] Run `pnpm vitest run packages/qizhi-react/src/link/Link.test.tsx`; expect failure because the modules do not exist.
- [ ] Implement the two SVG components from the approved QIZHI assets and export them from package roots.
- [ ] Re-run the focused test; expect the icon assertions to pass while later Link assertions remain red.

### Task 2: Formal Link component

**Files:**
- Create: `packages/qizhi-react/src/link/Link.types.ts`
- Create: `packages/qizhi-react/src/link/Link.tsx`
- Create: `packages/qizhi-react/src/link/link.css`
- Create: `packages/qizhi-react/src/link/Link.test.tsx`
- Create: `packages/qizhi-react/src/link/Link.types.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: `LinkIcon`, QIZHI color/radius tokens.
- Produces: `Link`, `LinkProps`, `LinkAnchorProps`, `LinkButtonProps`, `LinkStatus`, `LinkHandle`.

- [ ] Write failing behavior tests for anchor/button branching, default `htmlType`, native attributes, class arrays, status, hoverable, default/custom icon and both disabled branches.
- [ ] Write compile-time tests proving `href` and `htmlType` are mutually exclusive and event/ref types follow the root element.
- [ ] Run focused behavior and type tests; expect failures because Link is not exported.
- [ ] Implement the discriminated union, forwarded ref, disabled-anchor click suppression and minimal DOM.
- [ ] Implement token-based CSS for 14px typography, semantic colors, fill states, focus, disabled priority, 6px gap and reduced motion.
- [ ] Re-run focused tests and `pnpm --filter @wangxiaojinger/qizhi-react typecheck`; expect zero failures.

### Task 3: Real Link docs island

**Files:**
- Create: `apps/qizhi-docs/src/link/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/link/demos/StatusDemo.tsx`
- Create: `apps/qizhi-docs/src/link/demos/IconDemo.tsx`
- Create: `apps/qizhi-docs/src/link/demos/HoverableDemo.tsx`
- Create: `apps/qizhi-docs/src/link/demos/DropdownDemo.tsx`
- Create: `apps/qizhi-docs/src/link/linkDocs.registry.ts`
- Create: `apps/qizhi-docs/src/link/linkApi.ts`
- Create: `apps/qizhi-docs/src/link/LinkDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/link/LinkApiTable.tsx`
- Create: `apps/qizhi-docs/src/link/LinkDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/link/linkDocs.css`
- Create: `apps/qizhi-docs/src/link/main.tsx`
- Create: `apps/qizhi-docs/src/link/linkDocs.test.tsx`
- Modify: `apps/qizhi-docs/src/apiAnchors.test.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Link`, `LinkIcon`, `EditIcon`, `Button`, `CodeIcon`, `CopyIcon`, shared `CodeHighlight` and copy feedback.
- Produces: five same-source demos and `#link-API` structured documentation.

- [ ] Write failing docs tests for demo order, raw TSX imports, API names/defaults, `#link-API`, ready event and real component rendering.
- [ ] Run focused docs tests; expect failure because the island and registry do not exist.
- [ ] Implement the five demo files; demo navigation handlers may prevent navigation locally without changing Link defaults.
- [ ] Implement registry, reusable codebox, API metadata/table, scoped CSS and ready event.
- [ ] Replace only `index.html#components-link` content with the React mount target and add the module entry.
- [ ] Re-run docs tests and `node --check script.js`; expect zero failures.

### Task 4: Verification and evidence

**Files:**
- Create: `tests/e2e/link-react-island.spec.ts`
- Create: `docs/verification/link-react-island.md`
- Modify if evidence requires: Link implementation or scoped docs styles only.

**Interfaces:**
- Consumes: the complete component and docs island.
- Produces: repeatable three-viewport acceptance evidence and a `candidate_pass` record.

- [ ] Write E2E assertions for mouse/keyboard activation, disabled suppression, anchor attributes, 14px text, status hover colors, hoverless background, icon currentColor, API and no page overflow.
- [ ] Run the E2E spec at 1440, 1024 and 375; fix only evidence-backed failures.
- [ ] Capture and inspect a Link section screenshot, including hover/focus/disabled examples.
- [ ] Run `pnpm verify`, `node --check script.js` and `git diff --check`.
- [ ] Record exact commands, counts, visual conclusions, limits, `candidate_pass`, independent verification `pending`, and no Git commit.
