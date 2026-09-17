# QIZHI Breadcrumb React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the two legacy Breadcrumb demos to a public, typed QIZHI
React component with an official-source HomeIcon and same-source docs code.

**Architecture:** `Breadcrumb` owns navigation/list/item/separator semantics
and package styles; `Breadcrumb.Item` reuses public `Link` for linked items.
The docs island owns only the two legacy demo layouts and renders raw Demo TSX
through the shared Demo codebox shell.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, Playwright.

**Spec:** `docs/specs/qizhi-breadcrumb-contract-v1.md`

## Global Constraints

- Preserve exact legacy titles, descriptions, order, copy, data, size, layout,
  initial state, and interaction.
- Demo TSX is the only preview/display/copy source.
- No native Demo interactive controls, self-authored SVG, inline layout style,
  or CSS access to another component's private `__*` node.
- Reuse `Link`, shared Demo codebox actions, and official Remix Icon v4.7.0
  `home-4-line.svg` geometry.
- Browser acceptance covers 1440, 1024, and 375.

---

### Task 1: Public HomeIcon and Breadcrumb

**Files:**
- Create: `packages/qizhi-react/src/icon/HomeIcon.tsx`
- Create: `packages/qizhi-react/src/breadcrumb/Breadcrumb.types.ts`
- Create: `packages/qizhi-react/src/breadcrumb/Breadcrumb.tsx`
- Create: `packages/qizhi-react/src/breadcrumb/breadcrumb.css`
- Create: `packages/qizhi-react/src/breadcrumb/index.ts`
- Test: `packages/qizhi-react/src/breadcrumb/Breadcrumb.test.tsx`
- Test: `packages/qizhi-react/src/breadcrumb/Breadcrumb.types.test.tsx`
- Modify: `packages/qizhi-react/src/icon/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: public `Link`, `createQizhiIcon`, and React native attributes.
- Produces: `Breadcrumb`, `Breadcrumb.Item`, `BreadcrumbProps`,
  `BreadcrumbItemProps`, `BreadcrumbSize`, and `HomeIcon`.

- [ ] Write behavior tests asserting semantic nav/list output, automatic
  slash separators, link href, current-page semantics, small size, custom
  separator, icon accessibility, native attributes, and refs.
- [ ] Write type tests for valid and invalid sizes and native attributes.
- [ ] Run the scoped tests and confirm unresolved public modules fail.
- [ ] Implement the official 24px HomeIcon path with `createQizhiIcon`.
- [ ] Implement the smallest compound Breadcrumb API satisfying the tests.
- [ ] Add package-owned default/small/wrap/link/separator styles.
- [ ] Export all approved public values and types; rerun scoped tests.

### Task 2: Same-source Breadcrumb documentation island

**Files:**
- Create: `apps/qizhi-docs/src/breadcrumb/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/breadcrumb/demos/CustomIconDemo.tsx`
- Create: `apps/qizhi-docs/src/breadcrumb/BreadcrumbDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/breadcrumb/BreadcrumbApiTable.tsx`
- Create: `apps/qizhi-docs/src/breadcrumb/breadcrumbApi.ts`
- Create: `apps/qizhi-docs/src/breadcrumb/breadcrumbDocs.registry.ts`
- Create: `apps/qizhi-docs/src/breadcrumb/BreadcrumbDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/breadcrumb/breadcrumbDocs.css`
- Create: `apps/qizhi-docs/src/breadcrumb/main.tsx`
- Test: `apps/qizhi-docs/src/breadcrumb/breadcrumbDocs.test.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: Task 1 public exports and shared Demo codebox controls.
- Produces: two ordered legacy demos and the documented v1 API table.

- [ ] Write docs tests locking exact page/Demo copy, order, values, href,
  labels, sizes, HomeIcon use, shared shell, raw-source equality constraints,
  and the exact approved API rows.
- [ ] Run the docs tests and confirm the missing docs island fails.
- [ ] Implement the two formatted Demo TSX files with no forbidden markup.
- [ ] Register each Demo through its own `?raw` import.
- [ ] Implement the shared-shell codebox, API table, island, styles, and mount.
- [ ] Replace only `#component-breadcrumb` with the React mount contract and
  add its module entry; keep legacy source evidence in the v1 spec.
- [ ] Rerun component/docs/type/style ownership tests to green.

### Task 3: Browser and repository verification

**Files:**
- Create: `tests/contracts/breadcrumb-style-ownership.test.ts`
- Create: `tests/e2e/breadcrumb-react-island.spec.ts`
- Create: `docs/verification/breadcrumb-react-island.md`
- Modify: `styles.css`
- Modify: `tests/contracts/workspace.test.tsx`

**Interfaces:**
- Consumes: the complete public component and docs island.
- Produces: regression evidence and `candidate_pass` verification record.

- [ ] Add a style-ownership gate that fails while legacy public Breadcrumb
  styles remain in `styles.css`.
- [ ] Remove only the legacy public Breadcrumb behavior styles; retain or move
  the wrapping row layout to scoped docs CSS.
- [ ] Add workspace public-import coverage.
- [ ] Add 1440/1024/375 E2E for exact geometry, row wrapping, hover/focus,
  link navigation, code/copy equality, overflow, console, and screenshots.
- [ ] Run `node --check script.js`, TypeScript, scoped tests, all Vitest tests,
  the three Playwright projects, and `pnpm build`.
- [ ] Inspect loading-independent target screenshots and record only
  `candidate_pass`; keep independent acceptance `pending`.
