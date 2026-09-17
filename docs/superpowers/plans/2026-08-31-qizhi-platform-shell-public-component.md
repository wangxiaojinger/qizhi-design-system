# QIZHI PlatformShell Public Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the stable framework in `FrameworkPreviewDemo` into the public `@wangxiaojinger/qizhi-react` `PlatformShell` business component and migrate existing generated pages to consume it.

**Architecture:** `PlatformShell` owns the complete `Layout + TopNavigation + conditional SideNavigation + greeting + content` composition, navigation state, known business-domain mapping, component CSS, and responsive behavior. The Layout Demo retains only its documentation canvas, while AI Workbench and Agent Management pass page content and public navigation props into the shell.

**Tech Stack:** React 19, TypeScript 7, QIZHI React, Vitest, Testing Library, Playwright, Vite, Python Page Builder validator.

**Spec:** `docs/superpowers/specs/2026-08-31-qizhi-platform-shell-public-component-design.md`

## Global Constraints

- Preserve the current Framework Demo copy, navigation flow, geometry, initial state, interactions, accessibility, and 1440/1024/375 visual result.
- Reuse public `Layout`, `TopNavigation`, and `SideNavigation`; do not add native interactive controls, handwritten SVG, third-party UI, or a second navigation implementation.
- Component-owned structure and responsive styles live in `platformShell.css`; Demo and generated-page CSS must not select `.qizhi-platform-shell__*` internals.
- The 960px maximum width, documentation padding, border, radius, and shadow remain Demo canvas styles.
- Unknown selected keys hide the sider instead of inventing a business-domain mapping.
- Preserve unrelated worktree changes. Do not commit, merge, clean, or stage broad paths without explicit user authorization.
- Automated completion is at most `candidate_pass`; independent verification remains `pending`.

---

## File Map

**Create**

- `packages/qizhi-react/src/platform-shell/PlatformShell.types.ts`
- `packages/qizhi-react/src/platform-shell/PlatformShell.tsx`
- `packages/qizhi-react/src/platform-shell/platformShell.css`
- `packages/qizhi-react/src/platform-shell/PlatformShell.test.tsx`
- `tests/contracts/platform-shell-style-ownership.test.ts`
- `apps/qizhi-docs/src/layout/platformShellApi.ts`

**Modify**

- `packages/qizhi-react/src/index.ts`
- `apps/qizhi-docs/src/layout/demos/FrameworkPreviewDemo.tsx`
- `apps/qizhi-docs/src/layout/layoutDocs.css`
- `apps/qizhi-docs/src/layout/layoutDocs.registry.test.tsx`
- `apps/qizhi-docs/src/layout/LayoutApiTable.tsx`
- `apps/qizhi-docs/src/api/component-api.json`
- `tests/e2e/layout-react-island.spec.ts`
- `skills/qizhi-react-page-builder/SKILL.md`
- `generated-react-pages/ai-lifecycle-workbench/src/App.tsx`
- `generated-react-pages/ai-lifecycle-workbench/src/page.css`
- `generated-react-pages/ai-lifecycle-workbench/src/App.test.tsx`
- `generated-react-pages/ai-lifecycle-workbench/page-spec.md`
- `generated-react-pages/ai-lifecycle-workbench/generation-report.md`
- `generated-react-pages/agent-management/src/AgentProductShell.tsx`
- `generated-react-pages/agent-management/src/page.css`
- `generated-react-pages/agent-management/page-spec.md`
- `generated-react-pages/agent-management/generation-report.md`
- `docs/verification/menu-react-island.md`

---

### Task 1: Freeze the Public Boundary and Observe RED

**Files:**

- Create: `tests/contracts/platform-shell-style-ownership.test.ts`
- Modify: `apps/qizhi-docs/src/layout/layoutDocs.registry.test.tsx`
- Create: `packages/qizhi-react/src/platform-shell/PlatformShell.test.tsx`

**Interfaces:**

- Consumes: current Framework Demo source, `layoutDocs.css`, package root export, real navigation components.
- Produces: failing tests for public export, thin Demo consumption, real shell behavior, and style ownership.

- [ ] **Step 1: Record the scoped baseline**

Run:

```bash
git status --short -- packages/qizhi-react/src/index.ts apps/qizhi-docs/src/layout generated-react-pages/ai-lifecycle-workbench generated-react-pages/agent-management
shasum -a 256 apps/qizhi-docs/src/layout/demos/FrameworkPreviewDemo.tsx apps/qizhi-docs/src/layout/layoutDocs.css
```

Expected: current status and source hashes are recorded without modifying or attributing pre-existing changes.

- [ ] **Step 2: Add the style ownership gate**

Create a test that reads the real artifacts and requires these outcomes:

```ts
expect(indexSource).toContain(
  'export { PlatformShell } from "./platform-shell/PlatformShell"',
);
expect(indexSource).toContain(
  'import "./platform-shell/platformShell.css"',
);
expect(demoSource).toContain(
  'import { PlatformShell } from "@wangxiaojinger/qizhi-react"',
);
expect(demoSource).not.toContain("<Layout");
expect(demoSource).not.toContain("<TopNavigation");
expect(demoSource).not.toContain("<SideNavigation");
expect(docsCss).not.toContain(".layout-framework-demo__body");
expect(docsCss).not.toContain(".qizhi-platform-shell__");
```

- [ ] **Step 3: Add behavior-first component tests**

Write tests against the real component for these independently observable behaviors:

```tsx
it("starts on workbench without a sider", () => {
  render(<PlatformShell><div>页面内容</div></PlatformShell>);
  expect(screen.getByRole("menuitem", { name: "工作台" }))
    .toHaveAttribute("aria-current", "page");
  expect(screen.queryByRole("navigation", { name: "空间导航" }))
    .not.toBeInTheDocument();
  expect(screen.getByText("页面内容")).toBeInTheDocument();
});

it("maps uncontrolled navigation to the matching sider", async () => {
  render(<PlatformShell><div>内容区</div></PlatformShell>);
  await userEvent.click(screen.getByRole("menuitem", { name: "Agent" }));
  expect(screen.getByRole("menuitem", { name: "Skills 工坊" }))
    .toHaveAttribute("aria-current", "page");
});

it("keeps controlled navigation unchanged and reports selection", async () => {
  const onSelect = vi.fn();
  render(
    <PlatformShell selectedKey="workbench" onSelect={onSelect}>
      <div>内容区</div>
    </PlatformShell>,
  );
  await userEvent.click(screen.getByRole("menuitem", { name: "模型服务" }));
  expect(onSelect).toHaveBeenCalledWith("model-service");
  expect(screen.queryByRole("navigation", { name: "空间导航" }))
    .not.toBeInTheDocument();
});
```

Add literal cases for all five mappings, unknown-key no-sider behavior, `greeting={null}`, custom greeting, `topNavigationProps`, and `sideNavigationProps` workspace/selection forwarding.

- [ ] **Step 4: Update the registry boundary assertion**

Require the displayed source to contain `PlatformShell` from `@wangxiaojinger/qizhi-react` and to omit direct imports/usages of `Layout`, `TopNavigation`, and `SideNavigation`.

- [ ] **Step 5: Verify RED**

Run:

```bash
./node_modules/.bin/vitest run packages/qizhi-react/src/platform-shell/PlatformShell.test.tsx tests/contracts/platform-shell-style-ownership.test.ts apps/qizhi-docs/src/layout/layoutDocs.registry.test.tsx
./node_modules/.bin/tsc --noEmit -p packages/qizhi-react/tsconfig.json
```

Expected: Vitest may exhibit the documented worker-startup environment block; TypeScript must fail specifically because `./PlatformShell` does not exist. Record the two outcomes separately.

---

### Task 2: Implement and Export PlatformShell

**Files:**

- Create: `packages/qizhi-react/src/platform-shell/PlatformShell.types.ts`
- Create: `packages/qizhi-react/src/platform-shell/PlatformShell.tsx`
- Create: `packages/qizhi-react/src/platform-shell/platformShell.css`
- Modify: `packages/qizhi-react/src/index.ts`
- Test: `packages/qizhi-react/src/platform-shell/PlatformShell.test.tsx`

**Interfaces:**

- Consumes: `Layout`, `TopNavigation`, `SideNavigation`, `TopNavigationProps`, `SideNavigationProps`.
- Produces: `PlatformShell` and `PlatformShellProps` at the `@wangxiaojinger/qizhi-react` root.

- [ ] **Step 1: Define the approved public type**

```ts
import type { ReactNode } from "react";
import type { SideNavigationProps } from "../side-navigation/SideNavigation.types";
import type { TopNavigationProps } from "../top-navigation/TopNavigation.types";

export interface PlatformShellProps {
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string) => void;
  topNavigationProps?: Omit<
    TopNavigationProps,
    "selectedKey" | "defaultSelectedKey" | "onSelect"
  >;
  sideNavigationProps?: Omit<SideNavigationProps, "variant">;
  greeting?: ReactNode;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}
```

- [ ] **Step 2: Implement the exact state and mapping rules**

Use controlled state when `selectedKey !== undefined`; otherwise initialize internal state from `defaultSelectedKey ?? "workbench"`. The only sider variants are this literal set:

```ts
const sideVariants = new Set([
  "custom-model",
  "model-service",
  "agent",
  "explore",
  "operations",
]);
```

On top navigation selection, update internal state only when uncontrolled, always call `onSelect`, and render `SideNavigation` only when the current key belongs to the set.

- [ ] **Step 3: Implement the semantic composition**

```tsx
<section className="qizhi-platform-shell" aria-label={ariaLabel}>
  <Layout.Header className="qizhi-platform-shell__header">
    <TopNavigation {...topNavigationProps} selectedKey={currentKey} onSelect={select} />
  </Layout.Header>
  <Layout className="qizhi-platform-shell__body">
    {sideVariant ? (
      <Layout.Sider className="qizhi-platform-shell__sider">
        <SideNavigation {...sideNavigationProps} variant={sideVariant} />
      </Layout.Sider>
    ) : null}
    <Layout.Content className="qizhi-platform-shell__main">
      {greeting !== null ? (
        <div className="qizhi-platform-shell__greeting">
          {greeting ?? "Good day，欢迎使用 启智 开启新的一天 😃"}
        </div>
      ) : null}
      {children}
    </Layout.Content>
  </Layout>
</section>
```

The outer section must also receive `data-mode={currentKey}` and the caller `className`.

- [ ] **Step 4: Migrate exact framework-owned CSS**

Move the existing 56px header, 800px row body, 210px sider, main padding/background, greeting typography, and 991.98/480 responsive rules into `.qizhi-platform-shell*`. Do not move `.layout-framework-preview` padding or the 960px canvas border/radius/shadow.

- [ ] **Step 5: Export implementation, type, and CSS**

Add:

```ts
import "./platform-shell/platformShell.css";
export { PlatformShell } from "./platform-shell/PlatformShell";
export type { PlatformShellProps } from "./platform-shell/PlatformShell.types";
```

- [ ] **Step 6: Verify GREEN with installed direct tools**

Run:

```bash
./node_modules/.bin/tsc --noEmit -p packages/qizhi-react/tsconfig.json
./node_modules/.bin/vite build
./node_modules/.bin/tsc -p packages/qizhi-react/tsconfig.build.json
```

Expected: typecheck, package build, and declaration generation exit 0; built output contains `platform-shell/PlatformShell.js` and the public declaration.

---

### Task 3: Make the Layout Demo a Thin Public Consumer

**Files:**

- Modify: `apps/qizhi-docs/src/layout/demos/FrameworkPreviewDemo.tsx`
- Modify: `apps/qizhi-docs/src/layout/layoutDocs.css`
- Modify: `apps/qizhi-docs/src/layout/layoutDocs.registry.test.tsx`
- Modify: `tests/e2e/layout-react-island.spec.ts`

**Interfaces:**

- Consumes: public `PlatformShell`.
- Produces: unchanged rendered framework with one-source preview/display/copy code.

- [ ] **Step 1: Replace direct composition with one public component**

```tsx
import { useState } from "react";
import { PlatformShell } from "@wangxiaojinger/qizhi-react";

export default function FrameworkPreviewDemo() {
  const [selectedKey, setSelectedKey] = useState("workbench");
  return (
    <PlatformShell
      className="layout-framework-demo"
      selectedKey={selectedKey}
      onSelect={setSelectedKey}
    >
      <div className="layout-framework-demo__content">内容区</div>
    </PlatformShell>
  );
}
```

- [ ] **Step 2: Reduce Demo CSS to canvas ownership**

Keep `.layout-framework-preview`, `.layout-framework-demo` width/margin/border/radius/shadow, and `.layout-framework-demo__content` content-placeholder visuals. Delete all Demo-owned header/body/sider/main/greeting and responsive internal rules. Do not add selectors for `.qizhi-platform-shell__*`.

- [ ] **Step 3: Update E2E selectors without weakening assertions**

Select the public root and its real regions, retaining assertions for 56px header, 210px/800px sider, workbench no-sider padding, five mapping transitions, workspace dropdown visibility/cropping, Escape, `scrollWidth <= clientWidth`, and console errors.

- [ ] **Step 4: Run docs type/build and the boundary gate**

```bash
./node_modules/.bin/tsc --noEmit
node scripts/build-component-api.mjs --check
./node_modules/.bin/vite build
```

Expected: all exit 0; root build may retain the existing chunk-size warning only.

---

### Task 4: Publish API and Strengthen Page Builder Rules

**Files:**

- Create: `apps/qizhi-docs/src/layout/platformShellApi.ts`
- Modify: `apps/qizhi-docs/src/layout/LayoutApiTable.tsx`
- Modify: `apps/qizhi-docs/src/api/component-api.json`
- Modify: `skills/qizhi-react-page-builder/SKILL.md`

**Interfaces:**

- Consumes: `PlatformShellProps`.
- Produces: public API manifest group `platformShellApi` and business-shell priority rule.

- [ ] **Step 1: Add all nine documented properties**

Create `platformShellApi` entries for `selectedKey`, `defaultSelectedKey`, `onSelect`, `topNavigationProps`, `sideNavigationProps`, `greeting`, `children`, `className`, and `aria-label`, using the exact types and defaults from the design spec.

- [ ] **Step 2: Render the API table**

Append:

```tsx
<h3>PlatformShell</h3>
<ApiTable api="platformShellApi" label="PlatformShell API" />
```

- [ ] **Step 3: Generate and check the manifest**

```bash
node scripts/build-component-api.mjs
node scripts/build-component-api.mjs --check
```

Expected: generation reports 92 component API groups and the check reports current.

- [ ] **Step 4: Update Page Builder priority**

Require `PlatformShell` before composing `Layout`, `TopNavigation`, or `SideNavigation` whenever the requested page uses the standard QIZHI platform framework. Continue requiring the two navigation components independently when no full platform shell is needed.

---

### Task 5: Migrate Existing Generated Pages

**Files:**

- Modify: AI Workbench files listed in the File Map.
- Modify: Agent Management files listed in the File Map.

**Interfaces:**

- Consumes: public `PlatformShell` and existing page children.
- Produces: generated pages with no direct platform-shell recomposition.

- [ ] **Step 1: Add RED consumer tests**

Require each product shell to contain one `.qizhi-platform-shell` root and prohibit direct `Layout.Header`, `TopNavigation`, `Layout.Sider`, and `SideNavigation` composition in the shell source.

- [ ] **Step 2: Migrate AI Workbench**

Replace the outer `Layout` and Header composition with controlled `PlatformShell`, forwarding its existing `productName`, `tenantName`, region, language, and callbacks through `topNavigationProps`. Pass the existing workbench body as children and set `greeting={null}` because the page already owns its PRD-specific heading region.

- [ ] **Step 3: Migrate Agent Management**

Replace `AgentProductShell` internals with:

```tsx
<PlatformShell
  className="agent-page-product-shell"
  selectedKey="agent"
  sideNavigationProps={{
    selectedKey: "agent-item",
    workspaces: ["HW-H800-Public"],
    defaultWorkspace: "HW-H800-Public",
    className: "agent-page-side-navigation",
  }}
>
  {children}
</PlatformShell>
```

- [ ] **Step 4: Remove only obsolete shell CSS**

Delete rules that reproduce Header/body/Sider/greeting structure. Retain page-owned content spacing and the 375px external root-height constraint needed to keep Agent content in the first screen. Page CSS must not select `.qizhi-platform-shell__*`.

- [ ] **Step 5: Update page specs and reports**

Record the public component, matching Framework Demo, forwarded props, mock-only behavior, browser evidence, and independent-verification boundary. Remove claims that the pages compose the shell with Layout primitives.

- [ ] **Step 6: Validate and build both pages**

```bash
python3 skills/qizhi-react-page-builder/scripts/validate_react_output.py generated-react-pages/ai-lifecycle-workbench
python3 skills/qizhi-react-page-builder/scripts/validate_react_output.py generated-react-pages/agent-management
```

Then run each page's installed direct TypeScript and Vite tools. Expected: both boundary validators and builds exit 0; any environment runner block is reported separately from product failures.

---

### Task 6: Three-Viewport Browser Acceptance and Documentation

**Files:**

- Modify: `docs/verification/menu-react-island.md`
- Create/update: browser JSON and screenshot artifacts under each generated page's `screenshots/` directory.

**Interfaces:**

- Consumes: running docs, AI Workbench, and Agent Management previews.
- Produces: auditable 1440/1024/375 evidence and final status.

- [ ] **Step 1: Start actual Vite previews**

Start docs and both generated pages on explicit available localhost ports and record the actual URLs.

- [ ] **Step 2: Exercise the Framework Demo at all three widths**

Verify literal values and paths:

- root count 1 and Header height 56;
- workbench has no sider and main left padding 24;
- custom model produces 210 × 800 sider on desktop;
- model service → 模型部署;
- Agent → Skills 工坊;
- 探索 → 模型广场;
- 运营中心 → 资源概览;
- workspace dropdown opens fully, Escape closes, focus returns;
- section and page `scrollWidth <= clientWidth`;
- console/page errors remain empty.

- [ ] **Step 3: Exercise both generated pages**

At 1440/1024/375 verify exactly one public shell, correct selected navigation, correct sider presence, content geometry, key page interactions, no obsolete shell class roots, no horizontal overflow, and empty console errors.

- [ ] **Step 4: Capture and inspect screenshots**

Capture the framework default/open-sider/open-workspace states and both generated pages at all three widths. Open the screenshots and inspect navigation height, sider width/height, greeting, content offset, selected blocks, popup edges, and mobile stacking before declaring visual success.

- [ ] **Step 5: Run final checks and document limitations**

Re-run root type/build/API check, package type/build/declaration generation, both Page Builder validators/builds, and public-boundary gate. Record the existing Vitest worker-startup limitation if it remains. Mark completion only as `candidate_pass`, leave `independent_verification: pending`, and do not merge or commit the dirty shared worktree.
