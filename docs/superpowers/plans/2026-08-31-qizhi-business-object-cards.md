# QIZHI Object Display Business Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish seven fixed business-card boundaries and reorganize Object Display into seven same-source React Demos.

**Architecture:** Keep the already validated card DOM and CSS as the single implementation source. Add narrow public wrappers for the four previously generic/combined boundaries, preserve compatible low-level exports, then replace the two composite Demo files with five independent Demo files and update contracts, API metadata, tests and E2E.

**Tech Stack:** React 19, TypeScript, QIZHI React, Vitest, Testing Library, Vite, Playwright.

**Spec:** `docs/specs/qizhi-business-object-cards-contract-v1.md`

## Global Constraints

- Preserve the existing UI, copy, order, data, initial states and interactions inside each confirmed card.
- Demo files may only import public `@wangxiaojinger/qizhi-react` components/icons and may not style private `__*` descendants.
- New public APIs expose data/copy/callbacks, not arbitrary internal structure.
- No native interactive elements, handwritten SVG, third-party UI library or new token values.
- Do not commit, stage, clean, or overwrite unrelated dirty-worktree changes.

---

### Task 1: RED contracts for seven public boundaries

**Files:**
- Modify: `packages/qizhi-react/src/business-objects/BusinessObjects.test.tsx`
- Modify: `apps/qizhi-docs/src/business-object-display/businessObjectDisplayDocs.test.tsx`

**Interfaces:**
- Produces failing expectations for `MarketplaceModelCard`, `FinancialModelCard`, `ResourceSpecificationCard`, `BillingBudgetConfirmationCard` and seven independent Demos.

- [ ] Add behavior tests proving fixed action labels/order, callback routing, fixed confirmation headings and fixed metric order.
- [ ] Add docs tests expecting exactly seven Demo titles and rejecting removed composite titles/copy.
- [ ] Run focused tests and record RED caused by missing public components and old four-Demo registry.

### Task 2: Implement and export the four missing fixed business components

**Files:**
- Modify: `packages/qizhi-react/src/business-objects/BusinessObjects.types.ts`
- Modify: `packages/qizhi-react/src/business-objects/BusinessObjects.tsx`
- Modify: `packages/qizhi-react/src/business-objects/businessObjects.css` only if component ownership requires it
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `MarketplaceModelCard`, `FinancialModelCard`, `ResourceSpecificationCard`, `BillingBudgetConfirmationCard` and their Props.

- [ ] Add narrow Props using data and callbacks from the approved contract.
- [ ] Implement minimal wrappers over the current validated card renderers, fixing labels, action order, variants and confirmation composition internally.
- [ ] Export components and types from `@wangxiaojinger/qizhi-react`.
- [ ] Run focused component tests, TypeScript and package build; require GREEN.

### Task 3: Split Object Display into seven independent Demos

**Files:**
- Delete after replacements are active: `apps/qizhi-docs/src/business-object-display/demos/AiAssetsDemo.tsx`
- Delete after replacements are active: `apps/qizhi-docs/src/business-object-display/demos/ResourceObjectDemo.tsx`
- Create: `MarketplaceModelCardDemo.tsx`, `FinancialModelCardDemo.tsx`, `McpServiceCardDemo.tsx`, `ResourceSpecificationCardDemo.tsx`, `BillingBudgetConfirmationCardDemo.tsx`
- Modify: `businessObjectDisplay.registry.ts`
- Modify: `businessObjectDisplay.css`

**Interfaces:**
- Consumes the seven public business components.
- Produces seven same-source Demo records in the approved order.

- [ ] Move existing example data without rewriting copy.
- [ ] Remove the two composite titles/descriptions and nested model/resource headings.
- [ ] Keep model-grid and project-list layout in scoped Demo layout classes only.
- [ ] Run docs tests and enforce no native controls, SVG, inline style or private QIZHI descendant selectors.

### Task 4: Align API metadata, Page Builder boundary and E2E

**Files:**
- Modify: `businessObjectApi.ts`
- Modify: `BusinessObjectApiTable.tsx`
- Modify: `skills/qizhi-react-page-builder/SKILL.md`
- Modify: `tests/e2e/business-object-display-react-island.spec.ts`
- Modify: `docs/verification/business-object-display-react-island.md`
- Regenerate: `skills/qizhi-react-page-builder/references/component-api.json`

**Interfaces:**
- Produces machine-readable public APIs and a Page Builder rule requiring whole business-card imports.

- [ ] Replace generic ModelCard/ConfirmationSummary API presentation with the seven public business boundaries.
- [ ] Add the explicit Page Builder priority rule for fixed business cards.
- [ ] Update E2E counts, TOC order, interactions, geometry and popup ancestor-clipping checks.
- [ ] Regenerate and check the API manifest.

### Task 5: Full verification and visual acceptance

**Files:**
- Update: `docs/verification/business-object-display-react-island.md`
- Write screenshots only to the existing Playwright evidence output location.

**Interfaces:**
- Produces candidate evidence; independent verification remains pending.

- [ ] Run script syntax, API manifest, boundary scans, TypeScript, focused tests and builds.
- [ ] Run Object Display E2E at 1440, 1024 and 375.
- [ ] Inspect every target/open-state screenshot manually, including MCP popup edges and ancestor clipping.
- [ ] Report exact passes, failures, environment blockers and unchanged unrelated worktree state.

