# QIZHI TopNavigation Public Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the current `TopNavigationPreview` into the public `@wangxiaojinger/qizhi-react` `TopNavigation` business component without changing the Demo's visible copy, data, geometry, states, interactions, accessibility, or responsive result.

**Architecture:** Move the complete navigation implementation, component-owned CSS, and exact visual assets into a focused `packages/qizhi-react/src/top-navigation` module. Refactor the existing Demo into a thin same-source consumer of the public component, then make Page Builder inventory and the generated workbench consume the public business component instead of recomposing primitives.

**Tech Stack:** React 19, TypeScript 7, QIZHI React primitives, Vitest, Testing Library, Playwright, Vite, Python Page Builder validators.

**Spec:** `docs/superpowers/specs/2026-08-30-qizhi-top-navigation-public-component-design.md`

## Global Constraints

- The existing Demo title, description, order, data, copy, layout, dimensions, UI, initial state, pointer behavior, keyboard behavior, accessibility semantics, and responsive result must not change.
- The Demo implementation may change only to consume the public component and remain the single source for preview, displayed code, and copied code.
- The public component must not import from `apps/qizhi-docs` or require `menuDocs.css` in consumers.
- Interactive elements must reuse public QIZHI `Menu`, `Dropdown`, `Button`, and `Divider`; do not add native interactive tags or handwritten SVG.
- Component styling belongs to `topNavigation.css`; Demo and generated-page CSS must not select `qizhi-top-navigation__*` internals.
- Preserve unrelated worktree changes. Every Git staging command names only the files from its task.
- Automated completion is at most `candidate_pass`; independent verification remains `pending`.

---

## File Map

**Create**

- `packages/qizhi-react/src/top-navigation/TopNavigation.types.ts` — public item, option, and component Props contracts.
- `packages/qizhi-react/src/top-navigation/TopNavigation.tsx` — public navigation composition and behavior.
- `packages/qizhi-react/src/top-navigation/topNavigation.css` — complete component-owned visual and responsive contract.
- `packages/qizhi-react/src/top-navigation/TopNavigation.test.tsx` — controlled/uncontrolled, callback, option, overflow lifecycle, and accessibility tests.
- `packages/qizhi-react/src/top-navigation/assets/qizhi-logo.svg` — byte-identical package-owned copy of the current Demo logo.
- `packages/qizhi-react/src/top-navigation/assets/explore.svg` — byte-identical package-owned explore asset.
- `packages/qizhi-react/src/top-navigation/assets/help.svg` — byte-identical package-owned help asset.
- `packages/qizhi-react/src/top-navigation/assets/internet.svg` — byte-identical package-owned language asset.
- `packages/qizhi-react/src/top-navigation/assets/location.svg` — byte-identical package-owned region asset.
- `packages/qizhi-react/src/top-navigation/assets/operations-center.svg` — byte-identical package-owned operations asset.
- `apps/qizhi-docs/src/menu/topNavigationApi.ts` — generated API source for `component-api.json`.
- `tests/contracts/top-navigation-style-ownership.test.ts` — package/docs dependency and CSS ownership gate.

**Modify**

- `packages/qizhi-react/src/index.ts` — export `TopNavigation` and its public types; load component CSS.
- `apps/qizhi-docs/src/menu/demos/TopNavigationDemo.tsx` — replace the private implementation with a thin public-component Demo.
- `apps/qizhi-docs/src/menu/menuDocs.css` — remove only migrated top-navigation rules; keep docs shell and side-menu rules.
- `apps/qizhi-docs/src/menu/menuDocs.test.tsx` — lock the new public-component boundary and unchanged visible contract.
- `apps/qizhi-docs/src/api/component-api.json` — regenerate from `topNavigationApi.ts`.
- `tests/e2e/menu-react-island.spec.ts` — update stable selectors and preserve all geometry/interaction assertions.
- `skills/qizhi-react-page-builder/SKILL.md` — require public business components before primitive recomposition.
- `generated-react-pages/ai-lifecycle-workbench/src/App.tsx` — consume `TopNavigation`.
- `generated-react-pages/ai-lifecycle-workbench/src/page.css` — delete the page-owned top-navigation imitation.
- `generated-react-pages/ai-lifecycle-workbench/src/App.test.tsx` — assert one public top-navigation root and no primitive recomposition shell.
- `generated-react-pages/ai-lifecycle-workbench/page-spec.md` — record the actual public component and Demo.
- `generated-react-pages/ai-lifecycle-workbench/generation-report.md` — record replacement and verification evidence.

---

### Task 1: Freeze the Current Demo Contract and Add RED Ownership Gates

**Files:**

- Create: `tests/contracts/top-navigation-style-ownership.test.ts`
- Modify: `apps/qizhi-docs/src/menu/menuDocs.test.tsx`

**Interfaces:**

- Consumes: current `TopNavigationPreview`, `menuDocs.css`, package index, and Demo registry.
- Produces: failing tests that require a public `TopNavigation` export, package-owned styles, and a thin Demo consumer while locking existing copy and behavior.

- [ ] **Step 1: Record the current scoped diff and source hashes without modifying files**

Run:

```bash
git status --short -- packages/qizhi-react/src/index.ts apps/qizhi-docs/src/menu tests/e2e/menu-react-island.spec.ts
shasum -a 256 apps/qizhi-docs/src/menu/demos/TopNavigationDemo.tsx apps/qizhi-docs/src/menu/menuDocs.css assets/qizhi-logo.svg assets/icons/explore.svg assets/icons/help.svg assets/icons/internet.svg assets/icons/location.svg assets/icons/operations-center.svg
```

Expected: a written baseline in the task log; do not claim any pre-existing change was introduced by this task.

- [ ] **Step 2: Add the public-boundary contract test**

Create `tests/contracts/top-navigation-style-ownership.test.ts` with these exact assertions:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

it("publishes TopNavigation without a docs-source dependency", () => {
  const indexSource = read("packages/qizhi-react/src/index.ts");
  const demoSource = read(
    "apps/qizhi-docs/src/menu/demos/TopNavigationDemo.tsx",
  );
  const docsCss = read("apps/qizhi-docs/src/menu/menuDocs.css");

  expect(indexSource).toContain(
    'export { TopNavigation } from "./top-navigation/TopNavigation"',
  );
  expect(indexSource).toContain(
    'import "./top-navigation/topNavigation.css"',
  );
  expect(demoSource).toContain('import { TopNavigation } from "@wangxiaojinger/qizhi-react"');
  expect(demoSource).not.toContain("function TopNavigationPreview");
  expect(docsCss).not.toContain(".qizhi-top-navigation");
});
```

- [ ] **Step 3: Add unchanged visible-contract assertions to the Menu docs test**

In `apps/qizhi-docs/src/menu/menuDocs.test.tsx`, replace class-name ownership assertions for the top Demo with public-root and visible-result assertions:

```tsx
const top = topDemo.querySelector(".qizhi-top-navigation")!;
expect(top).toBeInTheDocument();
expect(within(topDemo).getByText("启智")).toBeInTheDocument();
expect(within(topDemo).getByText("租户名称XX")).toBeInTheDocument();
expect(within(topDemo).getByText("资源/帮助")).toBeInTheDocument();
expect(within(topDemo).getByRole("button", { name: /七宝/ }))
  .toHaveTextContent("七宝");
expect(within(topDemo).getByRole("menuitem", { name: "模型服务" }))
  .toHaveAttribute("aria-current", "page");
```

Keep the existing exact registry title/description/order assertions and complete menu-item/overflow-option arrays unchanged.

- [ ] **Step 4: Run the focused tests and observe RED**

Run:

```bash
pnpm vitest run tests/contracts/top-navigation-style-ownership.test.ts apps/qizhi-docs/src/menu/menuDocs.test.tsx
```

Expected: FAIL because `TopNavigation` is not exported, the public root does not exist, and the Demo still owns `TopNavigationPreview`.

- [ ] **Step 5: Commit only the RED gates**

```bash
git add tests/contracts/top-navigation-style-ownership.test.ts apps/qizhi-docs/src/menu/menuDocs.test.tsx
git commit -m "test: lock top navigation public component contract"
```

---

### Task 2: Implement the Public TopNavigation Component

**Files:**

- Create: `packages/qizhi-react/src/top-navigation/TopNavigation.types.ts`
- Create: `packages/qizhi-react/src/top-navigation/TopNavigation.tsx`
- Create: `packages/qizhi-react/src/top-navigation/topNavigation.css`
- Create: `packages/qizhi-react/src/top-navigation/TopNavigation.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**

- Consumes: public `Menu`, `Dropdown`, `Button`, `Divider`, `ChevronDownIcon`, `MoreIcon`, and `ProfileFilledIcon`.
- Produces: `TopNavigation`, `TopNavigationProps`, `TopNavigationItem`, and `TopNavigationOption` from `@wangxiaojinger/qizhi-react`.

- [ ] **Step 1: Write failing public behavior tests**

Create `TopNavigation.test.tsx` covering these exact cases:

```tsx
it("preserves the current default copy and selections", () => {
  render(<TopNavigation />);
  expect(screen.getByText("启智")).toBeInTheDocument();
  expect(screen.getByText("租户名称XX")).toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: "模型服务" }))
    .toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("button", { name: /七宝/ })).toHaveTextContent("七宝");
  expect(screen.getByRole("button", { name: /中文/ })).toHaveTextContent("中文");
});

it("supports controlled navigation selection", async () => {
  const onSelect = vi.fn();
  render(<TopNavigation selectedKey="workbench" onSelect={onSelect} />);
  await userEvent.click(screen.getByRole("menuitem", { name: "模型服务" }));
  expect(onSelect).toHaveBeenCalledWith("model-service");
  expect(screen.getByRole("menuitem", { name: "工作台" }))
    .toHaveAttribute("aria-current", "page");
});

it("supports uncontrolled region and language selection", async () => {
  render(<TopNavigation />);
  await userEvent.click(screen.getByRole("button", { name: /七宝/ }));
  await userEvent.click(screen.getByRole("menuitemradio", {
    name: "张江科研二号楼1楼404机房",
  }));
  expect(screen.getByRole("button", { name: /张江/ })).toHaveTextContent("张江");
  await userEvent.click(screen.getByRole("button", { name: /中文/ }));
  await userEvent.click(screen.getByRole("menuitemradio", { name: "English" }));
  expect(screen.getByRole("button", { name: /English/ }))
    .toHaveTextContent("English");
});
```

Also test custom `items`, disabled items/options, `onRegionChange`, `onLanguageChange`, `onHelp`, `onUserMenu`, one ResizeObserver creation, and cleanup of resize/scroll listeners on unmount.

- [ ] **Step 2: Run the component test and observe RED**

Run:

```bash
pnpm vitest run packages/qizhi-react/src/top-navigation/TopNavigation.test.tsx
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the public types exactly as specified**

Create `TopNavigation.types.ts` with `TopNavigationItem`, `TopNavigationOption`, and `TopNavigationProps` from the approved design. Use `ReactNode` for visual content, readonly arrays for item collections, controlled values plus defaults, callbacks, `className`, and `aria-label`. Do not add loading, permissions, routes, or network properties.

- [ ] **Step 4: Move the complete behavior into `TopNavigation.tsx`**

Start from the current `TopNavigationPreview` behavior, then make only these boundary changes:

```tsx
export function TopNavigation({
  logo = <img src={qizhiLogo} alt="" />,
  productName = "启智",
  tenantName = "租户名称XX",
  items = defaultItems,
  selectedKey: controlledSelectedKey,
  defaultSelectedKey = "model-service",
  onSelect,
  regions = defaultRegions,
  region: controlledRegion,
  defaultRegion = "qibao",
  onRegionChange,
  languages = defaultLanguages,
  language: controlledLanguage,
  defaultLanguage = "zh-CN",
  onLanguageChange,
  helpLabel = "资源/帮助",
  onHelp,
  onUserMenu,
  className,
  "aria-label": ariaLabel = "启智顶部导航",
}: TopNavigationProps) {
  // Preserve the current selection, overflow, scroll, ResizeObserver,
  // Dropdown, keyboard, and cleanup behavior here.
}
```

Use `qizhi-top-navigation` and `qizhi-top-navigation__*` class names. Preserve the five top-level regions in this order: brand, region, scroll shell, overflow, actions.

- [ ] **Step 5: Create package-owned copies of the exact Demo assets**

Using `apply_patch`, create the six files under `packages/qizhi-react/src/top-navigation/assets/` from these exact sources:

```text
assets/qizhi-logo.svg -> qizhi-logo.svg
assets/icons/explore.svg -> explore.svg
assets/icons/help.svg -> help.svg
assets/icons/internet.svg -> internet.svg
assets/icons/location.svg -> location.svg
assets/icons/operations-center.svg -> operations-center.svg
```

After creation, verify byte equality:

```bash
cmp assets/qizhi-logo.svg packages/qizhi-react/src/top-navigation/assets/qizhi-logo.svg
cmp assets/icons/explore.svg packages/qizhi-react/src/top-navigation/assets/explore.svg
cmp assets/icons/help.svg packages/qizhi-react/src/top-navigation/assets/help.svg
cmp assets/icons/internet.svg packages/qizhi-react/src/top-navigation/assets/internet.svg
cmp assets/icons/location.svg packages/qizhi-react/src/top-navigation/assets/location.svg
cmp assets/icons/operations-center.svg packages/qizhi-react/src/top-navigation/assets/operations-center.svg
```

Expected: all six commands exit 0 with no output.

- [ ] **Step 6: Move only component-owned visual rules into `topNavigation.css`**

Copy the current `.menu-top-demo` and `.menu-top-demo__*` rules byte-for-byte in declarations, rename their selector prefix to `.qizhi-top-navigation`, and preserve the existing container queries. Do not move `#component-menu`, `.codebox-wrapper`, `.demo`, `.component-example-actions`, API-section, or side-menu rules.

- [ ] **Step 7: Export the component and load its stylesheet**

Add to `packages/qizhi-react/src/index.ts`:

```ts
export { TopNavigation } from "./top-navigation/TopNavigation";
export type {
  TopNavigationItem,
  TopNavigationOption,
  TopNavigationProps,
} from "./top-navigation/TopNavigation.types";
```

Add beside other stylesheet imports:

```ts
import "./top-navigation/topNavigation.css";
```

- [ ] **Step 8: Run focused unit tests and typecheck**

Run:

```bash
pnpm vitest run packages/qizhi-react/src/top-navigation/TopNavigation.test.tsx tests/contracts/top-navigation-style-ownership.test.ts
pnpm --filter @wangxiaojinger/qizhi-react typecheck
```

Expected: component behavior tests PASS; ownership test may remain RED only because the Demo has not yet been refactored.

- [ ] **Step 9: Commit only the public component files**

```bash
git add packages/qizhi-react/src/top-navigation packages/qizhi-react/src/index.ts
git commit -m "feat: publish QIZHI TopNavigation"
```

---

### Task 3: Refactor the Demo to the Public Component Without Visual Change

**Files:**

- Modify: `apps/qizhi-docs/src/menu/demos/TopNavigationDemo.tsx`
- Modify: `apps/qizhi-docs/src/menu/menuDocs.css`
- Modify: `apps/qizhi-docs/src/menu/menuDocs.test.tsx`
- Modify: `tests/contracts/top-navigation-style-ownership.test.ts`

**Interfaces:**

- Consumes: public `TopNavigation` and its default data/behavior.
- Produces: one thin Demo source with unchanged visible result and no second navigation implementation.

- [ ] **Step 1: Replace the Demo implementation with the public component**

Reduce `TopNavigationDemo.tsx` to:

```tsx
import { TopNavigation } from "@wangxiaojinger/qizhi-react";

export default function TopNavigationDemo() {
  return <TopNavigation />;
}
```

Do not change `menuDocs.registry.ts`, its title, description, ID, or order.

- [ ] **Step 2: Remove only migrated top-navigation selectors from `menuDocs.css`**

Delete the `.menu-top-demo` and `.menu-top-demo__*` rule block plus its top-navigation container-query branches. Keep all `#component-menu` documentation-shell rules and every `.menu-side-demo__*` rule.

- [ ] **Step 3: Update docs tests to assert public ownership and unchanged content**

Use `.qizhi-top-navigation` selectors only inside component-package tests and E2E. Docs tests should prefer roles and visible copy; the ownership contract should assert that `TopNavigationDemo.tsx` contains the public import and does not contain `useState`, `ResizeObserver`, or `function TopNavigationPreview`.

- [ ] **Step 4: Run the RED gates to GREEN**

Run:

```bash
pnpm vitest run tests/contracts/top-navigation-style-ownership.test.ts apps/qizhi-docs/src/menu/menuDocs.test.tsx packages/qizhi-react/src/top-navigation/TopNavigation.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Verify the displayed and copied source is the thin Demo source**

Run the docs test and assert the registry `source` includes `TopNavigation` and excludes `TopNavigationPreview`, native controls, handwritten SVG, inline style, and private `qizhi-*__*` selectors.

- [ ] **Step 6: Commit only the Demo migration**

```bash
git add apps/qizhi-docs/src/menu/demos/TopNavigationDemo.tsx apps/qizhi-docs/src/menu/menuDocs.css apps/qizhi-docs/src/menu/menuDocs.test.tsx tests/contracts/top-navigation-style-ownership.test.ts
git commit -m "refactor: source top navigation demo from public component"
```

---

### Task 4: Publish and Validate the Component API Contract

**Files:**

- Create: `apps/qizhi-docs/src/menu/topNavigationApi.ts`
- Modify: `apps/qizhi-docs/src/api/component-api.json`

**Interfaces:**

- Consumes: `TopNavigationProps`, `TopNavigationItem`, and `TopNavigationOption`.
- Produces: `topNavigationApi` in the generated API manifest for Page Builder inventory.

- [ ] **Step 1: Add a failing API-manifest assertion**

Extend the ownership contract with:

```ts
const manifest = JSON.parse(read("apps/qizhi-docs/src/api/component-api.json"));
expect(manifest.apis.topNavigationApi.items.map(
  (item: { name: string }) => item.name,
)).toEqual([
  "logo", "productName", "tenantName", "items",
  "selectedKey", "defaultSelectedKey", "onSelect",
  "regions", "region", "defaultRegion", "onRegionChange",
  "languages", "language", "defaultLanguage", "onLanguageChange",
  "helpLabel", "onHelp", "onUserMenu", "className", "aria-label",
]);
```

- [ ] **Step 2: Run the assertion and observe RED**

Run:

```bash
pnpm vitest run tests/contracts/top-navigation-style-ownership.test.ts
```

Expected: FAIL because `topNavigationApi` is missing.

- [ ] **Step 3: Create `topNavigationApi.ts` with exact public properties**

Export an array named `topNavigationApi`; each item must include string `name`, `description`, `type`, and `defaultValue`. Use the exact property order from the assertion and exact defaults from the component. Do not document loading, permissions, routes, or properties absent from `TopNavigationProps`.

- [ ] **Step 4: Regenerate and validate the manifest**

Run:

```bash
pnpm api:build
pnpm api:validate
pnpm vitest run tests/contracts/top-navigation-style-ownership.test.ts
```

Expected: API generation reports the new group; validation and contract test PASS.

- [ ] **Step 5: Commit only API files**

```bash
git add apps/qizhi-docs/src/menu/topNavigationApi.ts apps/qizhi-docs/src/api/component-api.json tests/contracts/top-navigation-style-ownership.test.ts
git commit -m "docs: publish TopNavigation API contract"
```

---

### Task 5: Update Page Builder and the Workbench Consumer

**Files:**

- Modify: `skills/qizhi-react-page-builder/SKILL.md`
- Modify: `generated-react-pages/ai-lifecycle-workbench/src/App.tsx`
- Modify: `generated-react-pages/ai-lifecycle-workbench/src/page.css`
- Modify: `generated-react-pages/ai-lifecycle-workbench/src/App.test.tsx`
- Modify: `generated-react-pages/ai-lifecycle-workbench/page-spec.md`
- Modify: `generated-react-pages/ai-lifecycle-workbench/generation-report.md`

**Interfaces:**

- Consumes: public `TopNavigation` and `topNavigationApi`.
- Produces: inventory evidence and a generated workbench with no page-owned navigation imitation.

- [ ] **Step 1: Add a failing generated-page structure test**

In `App.test.tsx`, assert:

```tsx
expect(container.querySelectorAll(".qizhi-top-navigation")).toHaveLength(1);
expect(container.querySelector(".topbar")).toBeNull();
expect(container.querySelector(".primary-nav-shell")).toBeNull();
expect(container.querySelector(".account-actions")).toBeNull();
```

- [ ] **Step 2: Run the page test and observe RED**

Run from `generated-react-pages/ai-lifecycle-workbench`:

```bash
../../node_modules/.bin/vitest run src/App.test.tsx
```

Expected: FAIL because the page still recomposes primitives.

- [ ] **Step 3: Replace the page-owned header with `TopNavigation`**

Import `TopNavigation`, remove the header-specific `Menu`, `Dropdown`, `Divider`, primitive header state and menu JSX, then render:

```tsx
<TopNavigation
  productName="启智"
  tenantName="AI 全生命周期管理平台"
  items={navigationItems}
  selectedKey={selectedNav}
  onSelect={(key) => {
    setSelectedNav(key);
    mockAction(key === "workbench" ? "工作台" : key);
  }}
  regions={regionOptions}
  region={region}
  onRegionChange={setRegion}
  languages={languageOptions}
  language={language}
  onLanguageChange={setLanguage}
  onHelp={() => mockAction("资源/帮助")}
  onUserMenu={() => mockAction("用户菜单")}
/>
```

Use option keys as state values; labels remain platform copy. Delete `.topbar`, `.brand`, `.primary-nav*`, and `.account-actions` CSS rather than overriding the component internals.

- [ ] **Step 4: Update the Skill business-component priority**

Add this rule under the Page Builder component mapping workflow:

```markdown
When a public business component represents a complete platform module, use it before composing primitives. For a platform top navigation, use `TopNavigation`; do not rebuild it with `Menu`, `Dropdown`, `Button`, or page-owned CSS.
```

Keep the prohibition on importing Demo source or Demo CSS.

- [ ] **Step 5: Verify inventory exposes the public component and API**

Run:

```bash
python3 skills/qizhi-react-page-builder/scripts/inventory_react.py --repo-root . --format json
```

Expected JSON conditions: `components` contains `TopNavigation`; `componentApis.topNavigationApi` contains the exact public properties.

- [ ] **Step 6: Update Page Spec and report accurately**

Record `TopNavigation` → `menu/demos/TopNavigationDemo.tsx`, list the exact public API, remove claims that the page recomposes the framework navigation, and keep Mock routing/auth/permissions as unimplemented behavior.

- [ ] **Step 7: Run page-level gates**

Run:

```bash
python3 skills/qizhi-react-page-builder/scripts/validate_react_output.py generated-react-pages/ai-lifecycle-workbench
cd generated-react-pages/ai-lifecycle-workbench
../../node_modules/.bin/tsc -p tsconfig.json --noEmit
../../node_modules/.bin/vite build
../../node_modules/.bin/vitest run src/App.test.tsx
```

Expected: all commands PASS; validator reports no Demo import, native control, handwritten SVG, inline style, raw page color, or private QIZHI selector.

- [ ] **Step 8: Commit only Page Builder and workbench files**

```bash
git add skills/qizhi-react-page-builder generated-react-pages/ai-lifecycle-workbench/src generated-react-pages/ai-lifecycle-workbench/page-spec.md generated-react-pages/ai-lifecycle-workbench/generation-report.md
git commit -m "feat: generate workbench with public TopNavigation"
```

---

### Task 6: Preserve Browser Geometry, Interaction, and Visual Output

**Files:**

- Modify: `tests/e2e/menu-react-island.spec.ts`
- Modify: `docs/verification/menu-react-island.md`

**Interfaces:**

- Consumes: public `.qizhi-top-navigation` root, stable roles/data attributes, and the unchanged Demo route.
- Produces: three-viewport evidence for Demo parity and generated-page consumption.

- [ ] **Step 1: Update only top-navigation selectors in E2E**

Replace `.menu-top-demo` prefixes with `.qizhi-top-navigation` prefixes. Keep every existing assertion for:

- 56px root height and `rgb(220, 232, 255)` background;
- 32px product, region, menu item, overflow, utility, and avatar geometry;
- 24px logo container and 16px logo image;
- exact selected/hover/active colors;
- region selection and disabled option;
- language selection;
- overflow item calculation and current selection;
- Left/Right/Home/End and focus-visible;
- Escape, outside close, and focus restoration;
- clipping ancestor chain;
- `scrollWidth <= clientWidth` and console/page errors.

Do not weaken numeric or screenshot assertions to make migration pass.

- [ ] **Step 2: Run E2E before any selector correction and observe RED**

Start the existing docs Vite server, then run:

```bash
pnpm e2e -- tests/e2e/menu-react-island.spec.ts
```

Expected: initial selector mismatch fails; after selector updates, behavior and geometry must independently pass at `desktop-1440`, `narrow-1024`, and `mobile-375`.

- [ ] **Step 3: Run the corrected three-project E2E**

Run:

```bash
pnpm e2e -- tests/e2e/menu-react-island.spec.ts
```

Expected: 3/3 projects PASS with screenshots for reference, Dropdown-open, overflow-hover, and default states.

- [ ] **Step 4: Inspect all target screenshots manually**

Open the generated 1440, 1024, and 375 screenshots. Compare brand, region, menu positions, dividers, action spacing, icons, avatar, Dropdown edges, responsive hiding, text truncation, shadows, and clipping against the pre-migration baseline. Record any pixel or behavior deviation as a failure; do not label it acceptable without user approval.

- [ ] **Step 5: Verify the generated workbench in three viewports**

Run its Vite server and use Chrome/Playwright to confirm one `.qizhi-top-navigation`, correct copy/data, no private-selector page CSS, `documentElement.scrollWidth === clientWidth`, and zero new console/page errors at 1440, 1024, and 375. Save screenshots under `generated-react-pages/ai-lifecycle-workbench/screenshots/` and record exact results in `generation-report.md`.

- [ ] **Step 6: Update the verification record**

In `docs/verification/menu-react-island.md`, record executed commands, 3/3 project results, direct-child geometry, interactions, screenshot paths, known pre-existing failures, `candidate_pass`, and `independent_verification: pending`.

- [ ] **Step 7: Commit E2E and verification evidence**

```bash
git add tests/e2e/menu-react-island.spec.ts docs/verification/menu-react-island.md generated-react-pages/ai-lifecycle-workbench/generation-report.md
git commit -m "test: verify public TopNavigation parity"
```

---

### Task 7: Run Final Package, Docs, API, Page Builder, and Diff Gates

**Files:**

- Verify all files from Tasks 1–6.

**Interfaces:**

- Consumes: the complete public component migration.
- Produces: final candidate evidence without claiming independent acceptance.

- [ ] **Step 1: Run focused tests**

```bash
pnpm vitest run packages/qizhi-react/src/top-navigation/TopNavigation.test.tsx apps/qizhi-docs/src/menu/menuDocs.test.tsx tests/contracts/top-navigation-style-ownership.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run API, type, and build gates**

```bash
pnpm api:validate
pnpm typecheck
pnpm --filter @wangxiaojinger/qizhi-react build
pnpm build
```

Expected: all commands PASS. If a pre-existing unrelated failure occurs, record its exact command and error separately; do not report the full gate as passing.

- [ ] **Step 3: Run Page Builder gates**

```bash
python3 skills/qizhi-react-page-builder/scripts/inventory_react.py --repo-root . --format markdown
python3 skills/qizhi-react-page-builder/scripts/validate_react_output.py generated-react-pages/ai-lifecycle-workbench
```

Expected: inventory lists `TopNavigation` and `topNavigationApi`; output boundary check PASS.

- [ ] **Step 4: Run three-viewport E2E again**

```bash
pnpm e2e -- tests/e2e/menu-react-island.spec.ts
```

Expected: 3/3 projects PASS with zero new console/page errors and no clipping or overflow failures.

- [ ] **Step 5: Check only scoped diffs and whitespace**

```bash
git diff --check -- packages/qizhi-react/src/top-navigation packages/qizhi-react/src/index.ts apps/qizhi-docs/src/menu apps/qizhi-docs/src/api/component-api.json tests/contracts/top-navigation-style-ownership.test.ts tests/e2e/menu-react-island.spec.ts skills/qizhi-react-page-builder generated-react-pages/ai-lifecycle-workbench docs/verification/menu-react-island.md
git status --short -- packages/qizhi-react/src/top-navigation packages/qizhi-react/src/index.ts apps/qizhi-docs/src/menu apps/qizhi-docs/src/api/component-api.json tests/contracts/top-navigation-style-ownership.test.ts tests/e2e/menu-react-island.spec.ts skills/qizhi-react-page-builder generated-react-pages/ai-lifecycle-workbench docs/verification/menu-react-island.md
```

Expected: no whitespace errors; every scoped path is intentional. Do not stage or clean unrelated user changes.

- [ ] **Step 6: Report the acceptance boundary**

Report exact files changed, actual commands/results, public API, Demo parity evidence, Page Builder behavior, capability gaps, Mock-only behavior, and screenshot paths. Final status must be `candidate_pass`; `independent_verification` remains `pending` until user review.
