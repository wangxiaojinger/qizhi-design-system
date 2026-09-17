# QIZHI Slider React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved public Slider and migrate the nine legacy demos without changing their visible contract.

**Architecture:** `packages/qizhi-react` owns Slider behavior, types, icons, and styles. `apps/qizhi-docs` renders independent same-source TSX demos and structured API metadata. The existing static Watermark and Upload consumers remain on the legacy runtime for this bounded migration.

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library, Vite, Playwright

**Spec:** `docs/specs/qizhi-slider-contract-v1.md`

## Global Constraints

- Preserve all nine legacy titles, descriptions, order, values, layouts, dimensions, states, and interactions.
- Keep the empty description for “控制 tooltip 的展示” empty.
- Reuse public Tooltip, InputNumber, Button, CodeIcon, CopyIcon, ApiTable, and CodeHighlight.
- Preview, displayed TSX, and copied TSX use the same Demo file.
- Do not add `showInput`, `size`, `reverse`, status colors, file labels, badges, or extra actions.

---

### Task 1: Public Slider contract and icon

**Files:**
- Create: `packages/qizhi-react/src/slider/Slider.types.ts`
- Create: `packages/qizhi-react/src/slider/Slider.test.tsx`
- Create: `packages/qizhi-react/src/slider/Slider.tsx`
- Create: `packages/qizhi-react/src/slider/slider.css`
- Create: `packages/qizhi-react/src/icon/VolumeUpIcon.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Produces: `Slider`, `SliderProps`, `SliderValue`, `SliderRangeConfig`, `VolumeUpIcon`.

- [ ] Write tests for normalization, controlled and uncontrolled values, pointer/keyboard interaction, disabled behavior, multiple handles, marks, Tooltip formatting, vertical layout, and draggable two-value bars.
- [ ] Run `pnpm exec vitest run packages/qizhi-react/src/slider/Slider.test.tsx` and confirm failure because Slider does not exist.
- [ ] Implement only the approved public contract and QIZHI styles.
- [ ] Re-run the directed test and confirm all cases pass.

### Task 2: Nine same-source documentation demos

**Files:**
- Create: `apps/qizhi-docs/src/slider/` documentation island, registry, API metadata, CSS, tests, and nine files under `demos/`.
- Create: `apps/qizhi-docs/src/slider/main.tsx`
- Modify: `index.html`
- Modify: `vite.config.ts`

**Interfaces:**
- Consumes: public `Slider`, `InputNumber`, `VolumeUpIcon`, `Button`, `CodeIcon`, and `CopyIcon`.
- Produces: the `#component-slider` React Island and `slider-API` anchor.

- [ ] Write a failing documentation test that locks the nine exact titles/descriptions, empty description, imports, actions, API rows, and same-source registry.
- [ ] Run the directed test and confirm failure while the static page is still present.
- [ ] Implement the nine Demo TSX files and shared documentation shell without extra visible UI.
- [ ] Register the island entry and replace only the legacy Slider section body.
- [ ] Re-run the directed documentation test and confirm it passes.

### Task 3: Replace the React Input native range consumer

**Files:**
- Modify: `apps/qizhi-docs/src/input/demos/SizeDemo.tsx`
- Modify: `apps/qizhi-docs/src/input/inputDemos.css`
- Modify: `apps/qizhi-docs/src/input/inputDocs.test.tsx`
- Modify: `tests/e2e/input-react-island.spec.ts`

**Interfaces:**
- Consumes: public `Slider` with min 24, max 60, and controlled number value.

- [ ] Add a failing test requiring the public Slider instead of `input[type="range"]`.
- [ ] Replace the native control while preserving copy, value, dimensions, and Input height synchronization.
- [ ] Run Input and Slider directed tests and confirm they pass.

### Task 4: Browser and release verification

**Files:**
- Create: `tests/e2e/slider-react-island.spec.ts`
- Create: `docs/verification/slider-react-island.md`

**Interfaces:**
- Verifies the spec through public package, docs, and browser boundaries.

- [ ] Add E2E coverage for nine demos, keyboard, pointer, disabled state, range/multiple values, InputNumber synchronization, vertical marks, Tooltip, draggable bar, and overflow.
- [ ] Run directed Vitest, typecheck, build, `node --check script.js`, and `git diff --check`.
- [ ] Run Slider E2E at 1440, 1024, and 375.
- [ ] Inspect target screenshots and record actual results and remaining limitations.
