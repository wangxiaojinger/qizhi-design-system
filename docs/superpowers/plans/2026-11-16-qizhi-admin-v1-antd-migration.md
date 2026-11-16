# QIZHI 后台设计系统 v1.0 Ant Design 清理式迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the published blue self-built QIZHI UI system with a v1.0 neutral enterprise-admin Token system and React 19 + Ant Design 6 component package.

**Architecture:** `@wangxiaojinger/qizhi-tokens` becomes the versioned source of CSS primitive and semantic backend variables. `@wangxiaojinger/qizhi-react` depends on those variables, exposes a `QizhiProvider` that owns the Ant Design `ConfigProvider`, then exports only reviewed Ant Design aliases and admin composition components. The old Token manifest, custom component implementation, static documentation surface and compatibility contract are removed atomically after the new package, smoke consumer and documentation build prove the v1 package works.

**Tech Stack:** pnpm workspaces, Node 24, React 19, TypeScript 7, Ant Design 6, Vite 8, Vitest 4, Playwright, GitHub Packages.

---

## Locked file structure

| Path | Responsibility |
| --- | --- |
| `packages/qizhi-tokens/src/tokens.json` | Single structured Token manifest for v1 backend primitives, semantic roles and component mapping values. |
| `packages/qizhi-tokens/scripts/build.mjs` | Validates and renders CSS, JSON and TypeScript outputs without legacy migration artifacts. |
| `packages/qizhi-tokens/scripts/token-utils.mjs` | Validates naming, tiers, references, light/dark theme declarations and generated public types. |
| `packages/qizhi-react/src/theme/antd-theme.ts` | Reads computed CSS values and produces an Ant Design `ThemeConfig`. |
| `packages/qizhi-react/src/theme/component-config.ts` | Holds consumer-owned Ant Design semantic styles for Form, Table, Drawer and Modal. |
| `packages/qizhi-react/src/provider/QizhiProvider.tsx` | Owns `ConfigProvider`, `App`, locale and controlled `data-theme` lifecycle. |
| `packages/qizhi-react/src/components/antd.ts` | Re-exports the permitted Ant Design primitive surface. |
| `packages/qizhi-react/src/admin/*.tsx` | Contains provider-independent PageHeader, cards, search/filter controls and table actions. |
| `packages/qizhi-react/src/index.ts` | Single public public API with CSS side-effect import. |
| `apps/qizhi-react-smoke/src/*` | Consumer application used to build and render the packed v1 packages. |
| `apps/qizhi-docs/src/*` | Vite React documentation entry and v1 examples; no parallel component implementation. |
| `README.md` and `.github/workflows/*.yml` | Installation, breaking-change guidance, CI and Release publishing. |

## Task 1: Replace the Token source with the backend Token contract

**Files:**
- Delete: `packages/qizhi-tokens/src/legacy-contract.json`
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/scripts/token-utils.mjs`
- Modify: `packages/qizhi-tokens/scripts/build.mjs`
- Modify: `packages/qizhi-tokens/package.json`
- Replace: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Delete: `packages/qizhi-tokens/MIGRATION.md`
- Test: `packages/qizhi-tokens/tests/tokens.node.mjs`

- [ ] **Step 1: Write a failing Token test for the v1 public semantic surface.**

```js
const required = [
  "spacing.16", "radius.8", "font.size.base", "control.height.md",
  "bg.base.default", "text.default", "border.neutral.l1",
  "admin.primary", "admin.sidebar", "status.error.default",
  "component.table.header.background", "component.drawer.body.background",
];
for (const name of required) assert.ok(tokens[name], `missing ${name}`);
assert.equal(tokens["admin.primary"].value, "#171717");
assert.equal(tokens["bg.base.default"].value, "var(--admin-card)");
assert.equal(tokens["component.table.header.background"].value, "var(--bg-bg-base-secondary)");
```

- [ ] **Step 2: Run the focused Token test and verify it fails because the old manifest has no `admin.primary`.**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL mentioning `missing admin.primary`.

- [ ] **Step 3: Replace `tokens.json` with v1 Primitive, Semantic and Component entries.**

Use the exact current backend values and names as the source of truth:

```json
{
  "name": "QIZHI Admin Design Tokens",
  "version": "1.0.0",
  "tokens": {
    "spacing.16": { "name": "spacing.16", "value": "16px", "cssVariable": "--spacing-16", "category": "基础尺度", "description": "标准内容间距", "tier": "seed", "status": "stable" },
    "admin.primary": { "name": "admin.primary", "value": "#171717", "cssVariable": "--admin-primary", "category": "后台语义色", "description": "主操作背景", "tier": "map", "status": "stable" },
    "bg.base.default": { "name": "bg.base.default", "value": "var(--admin-card)", "cssVariable": "--bg-bg-base-default", "category": "背景语义", "description": "默认容器背景", "tier": "alias", "status": "stable" },
    "component.table.header.background": { "name": "component.table.header.background", "value": "var(--bg-bg-base-secondary)", "cssVariable": "--component-table-header-background", "category": "组件语义", "description": "表格表头背景", "tier": "component", "status": "stable" }
  }
}
```

Include the full current backend primitive scale, `--admin-*`, `--bg-*`, `--text-*`, `--border-*`, `--status-*`, focus, shadow, chart and layout variables. Encode dark values with an explicit `themes.dark` declaration per Token rather than a second untracked CSS source.

- [ ] **Step 4: Extend renderer and validation for dark overrides without allowing cross-tier references.**

```js
const renderTheme = (tokens, theme) => Object.values(tokens)
  .filter((token) => token.themes?.[theme] !== undefined)
  .map((token) => `  ${token.cssVariable}: ${token.themes[theme]};`)
  .join("\n");

export const renderCss = (manifest) => [
  `:root {\n${renderTheme(manifest.tokens, "light") || renderDeclarations(manifest.tokens)}\n}`,
  `body[data-theme="dark"] {\n${renderTheme(manifest.tokens, "dark")}\n}`,
].filter(Boolean).join("\n\n") + "\n";
```

Update `validateManifest()` to validate `themes.light` and `themes.dark` values with the same missing-reference and tier rules as the default value.

- [ ] **Step 5: Remove migration-map exports and generate only v1 runtime artifacts.**

```js
await Promise.all([
  writeFile(new URL("style.css", distUrl), renderCss(manifest), "utf8"),
  writeFile(new URL("tokens.json", distUrl), `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
  writeFile(new URL("index.js", distUrl), `export const tokens = ${JSON.stringify(tokens, null, 2)};\n`, "utf8"),
  writeFile(new URL("index.d.ts", distUrl), renderTypes(), "utf8"),
]);
```

Remove `./migration-map.json` from `package.json` exports.

- [ ] **Step 6: Run Token build and focused tests.**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test && pnpm --filter @wangxiaojinger/qizhi-tokens build`

Expected: PASS; `dist/style.css` has a default block and `body[data-theme="dark"]` block, while no migration map is emitted.

- [ ] **Step 7: Commit the self-contained Token contract.**

```bash
git add packages/qizhi-tokens
git commit -m "feat(tokens): define neutral admin v1 contract"
```

## Task 2: Make Ant Design a v1 peer dependency and build the provider theme bridge

**Files:**
- Modify: `packages/qizhi-react/package.json`
- Modify: `packages/qizhi-react/vite.config.ts`
- Create: `packages/qizhi-react/src/theme/antd-theme.ts`
- Create: `packages/qizhi-react/src/theme/component-config.ts`
- Create: `packages/qizhi-react/src/theme/antd-theme.test.ts`
- Create: `packages/qizhi-react/src/provider/QizhiProvider.tsx`
- Create: `packages/qizhi-react/src/provider/QizhiProvider.test.tsx`

- [ ] **Step 1: Write failing unit tests for the CSS-to-AntD bridge and theme switching.**

```tsx
it("maps the neutral primary Token into Ant Design", () => {
  document.body.style.setProperty("--admin-primary", "#171717");
  expect(createQizhiTheme().token?.colorPrimary).toBe("#171717");
});

it("sets and clears the document theme attribute", () => {
  const { rerender } = render(<QizhiProvider theme="dark"><span>内容</span></QizhiProvider>);
  expect(document.body.dataset.theme).toBe("dark");
  rerender(<QizhiProvider theme="light"><span>内容</span></QizhiProvider>);
  expect(document.body.dataset.theme).toBeUndefined();
});
```

- [ ] **Step 2: Run the tests and verify they fail because the files and exports do not exist.**

Run: `pnpm exec vitest run packages/qizhi-react/src/theme/antd-theme.test.ts packages/qizhi-react/src/provider/QizhiProvider.test.tsx`

Expected: FAIL with unresolved modules.

- [ ] **Step 3: Replace obsolete package dependencies with Ant Design peers.**

```json
"peerDependencies": {
  "antd": "^6.6.6",
  "react": ">=19",
  "react-dom": ">=19"
},
"dependencies": {
  "@ant-design/icons": "^6.3.4",
  "@wangxiaojinger/qizhi-tokens": "workspace:*"
}
```

Remove `@antv/g2`, `prism-react-renderer`, `react-markdown` and `remark-gfm` from the v1 component package.

- [ ] **Step 4: Implement a pure `createQizhiTheme()` bridge and semantic component configuration.**

```ts
export function createQizhiTheme(): ThemeConfig {
  return {
    cssVar: { prefix: "qizhi" },
    token: {
      colorPrimary: cssToken("--admin-primary"),
      colorText: cssToken("--admin-foreground"),
      colorBgContainer: cssToken("--admin-card"),
      colorBorder: cssToken("--admin-input"),
      controlHeight: cssNumberToken("--control-height-md"),
      borderRadius: cssNumberToken("--radius-6"),
      fontFamily: cssToken("--font-family-default"),
    },
    components: { Table: tableTheme(), Tabs: tabsTheme(), Input: inputTheme(), Button: buttonTheme() },
  };
}
```

Move the reviewed semantic configuration for Form label weight, Table header cell, Drawer body and Modal z-index into `component-config.ts`; do not use `.ant-*` selectors.

- [ ] **Step 5: Implement `QizhiProvider`.**

```tsx
export function QizhiProvider({ children, locale, theme = "light" }: QizhiProviderProps) {
  useLayoutEffect(() => {
    if (theme === "dark") document.body.dataset.theme = "dark";
    else delete document.body.dataset.theme;
  }, [theme]);
  return <ConfigProvider {...qizhiComponentConfig} locale={locale} theme={createQizhiTheme()}><App>{children}</App></ConfigProvider>;
}
```

- [ ] **Step 6: Run focused provider tests.**

Run: `pnpm exec vitest run packages/qizhi-react/src/theme/antd-theme.test.ts packages/qizhi-react/src/provider/QizhiProvider.test.tsx`

Expected: PASS with both light and dark assertions.

- [ ] **Step 7: Commit the Ant Design runtime foundation.**

```bash
git add packages/qizhi-react/package.json packages/qizhi-react/vite.config.ts packages/qizhi-react/src/theme packages/qizhi-react/src/provider pnpm-lock.yaml
git commit -m "feat(react): add antd provider and theme bridge"
```

## Task 3: Replace self-built public primitives with the reviewed Ant Design surface

**Files:**
- Delete: `packages/qizhi-react/src/{alert,auto-complete,avatar,breadcrumb,business-choice-cards,business-guide,business-metrics,business-objects,cascader,chart,checkbox,choice-card,code-preview,content-viewer,control-container,date-picker,descriptions,detail-header,divider,drawer,dropdown,empty,form,granularity-select,icon,input,input-number,input-tag,layout,link,locale,log-viewer,markdown-viewer,menu,message,modal,notification,object-selector,page-header,pagination,platform-shell,popconfirm,popover,progress,radio,segmented,select,service-detail-header,side-navigation,skeleton,slider,space,spin,statistic,steps,switch,table,tabs,tag,task-overview,time-picker,time-range-picker,timeline,tooltip,top-navigation,tree,tree-select,typography,upload}/`
- Replace: `packages/qizhi-react/src/index.ts`
- Create: `packages/qizhi-react/src/components/antd.ts`
- Create: `packages/qizhi-react/src/components/antd.test.tsx`
- Modify: `packages/qizhi-react/vite.config.ts`
- Test: `packages/qizhi-react/src/components/antd.test.tsx`

- [ ] **Step 1: Write a failing export-surface test.**

```tsx
import { Button, Form, Input, Table, Tabs } from "./antd";

it("exports reviewed Ant Design primitives by identity", () => {
  expect(Button).toBe(AntButton);
  expect(Form).toBe(AntForm);
  expect(Input).toBe(AntInput);
  expect(Table).toBe(AntTable);
  expect(Tabs).toBe(AntTabs);
});
```

- [ ] **Step 2: Run the test and verify it fails before the public primitive module exists.**

Run: `pnpm exec vitest run packages/qizhi-react/src/components/antd.test.tsx`

Expected: FAIL with unresolved `./antd`.

- [ ] **Step 3: Create the explicit Ant Design export boundary.**

```ts
export {
  Alert, App, Button, Card, Checkbox, ConfigProvider, Divider, Drawer, Dropdown,
  Empty, Flex, Form, Input, InputNumber, Modal, Pagination, Radio, Select, Space,
  Spin, Switch, Table, Tabs, Tag, Tooltip, Typography,
} from "antd";
export type {
  ButtonProps, CardProps, ConfigProviderProps, DrawerProps, FormItemProps, InputProps,
  ModalProps, SelectProps, TableProps,
} from "antd";
```

Only add a primitive when it is declared in the v1 design document; consumers may import all other AntD exports directly from `antd`.

- [ ] **Step 4: Replace the root public entry.**

```ts
import "@wangxiaojinger/qizhi-tokens/style.css";
export { QizhiProvider } from "./provider/QizhiProvider";
export type { QizhiProviderProps, QizhiTheme } from "./provider/QizhiProvider";
export * from "./components/antd";
```

Remove all old components, custom CSS, custom icon generators, old subpath entrypoints and Vite entries. Update `package.json` exports to contain only `.` and `./style.css`.

- [ ] **Step 5: Run the primitive export test and package typecheck.**

Run: `pnpm exec vitest run packages/qizhi-react/src/components/antd.test.tsx && pnpm --filter @wangxiaojinger/qizhi-react typecheck`

Expected: PASS; no v1 source imports old custom component paths.

- [ ] **Step 6: Commit the public primitive replacement.**

```bash
git add packages/qizhi-react
git commit -m "feat(react): replace custom primitives with antd exports"
```

## Task 4: Add backend composition components

**Files:**
- Create: `packages/qizhi-react/src/admin/PageHeader.tsx`
- Create: `packages/qizhi-react/src/admin/SectionCard.tsx`
- Create: `packages/qizhi-react/src/admin/ListPageCard.tsx`
- Create: `packages/qizhi-react/src/admin/AdminSearchInput.tsx`
- Create: `packages/qizhi-react/src/admin/AdminFilterSelect.tsx`
- Create: `packages/qizhi-react/src/admin/TableActions.tsx`
- Create: `packages/qizhi-react/src/admin/HintFormItem.tsx`
- Create: `packages/qizhi-react/src/admin/index.ts`
- Create: `packages/qizhi-react/src/admin/admin.test.tsx`
- Modify: `packages/qizhi-react/src/index.ts`

- [ ] **Step 1: Write failing tests for the portable admin components.**

```tsx
it("uses caller-supplied labels in the filter control", () => {
  render(<AdminFilterSelect filterLabel="状态" allLabel="全部" options={[]} />);
  expect(screen.getByText("状态：")).toBeInTheDocument();
});

it("returns to the provided search callback when enter is pressed", async () => {
  const onSearch = vi.fn();
  render(<AdminSearchInput onSearch={onSearch} />);
  await userEvent.type(screen.getByRole("searchbox"), "成员{enter}");
  expect(onSearch).toHaveBeenCalledWith("成员");
});
```

- [ ] **Step 2: Run the test and verify it fails because the v1 admin components do not exist.**

Run: `pnpm exec vitest run packages/qizhi-react/src/admin/admin.test.tsx`

Expected: FAIL with unresolved imports.

- [ ] **Step 3: Implement the exact portable compositions.**

`PageHeader` uses `Flex` and `Typography.Title`; `SectionCard` composes `Card`; `ListPageCard` applies table containment and responsive toolbar layout; `AdminSearchInput` uses an Ant Design `Input` with `SearchOutlined`; `AdminFilterSelect` receives all labels through props and never imports project i18n; `TableActions` uses `Space` plus zero-inline link buttons; `HintFormItem` hides neutral extra guidance while validation errors exist.

Use `var(--spacing-*)`, `var(--font-size-*)`, `var(--text-*)` and `var(--border-*)` in every size or paint value. Do not add a CSS file for these components and do not depend on demo data.

- [ ] **Step 4: Export only the reviewed compositions.**

```ts
export {
  AdminFilterSelect, AdminSearchInput, HintFormItem, ListPageCard, PageHeader,
  SectionCard, TableActionButton, TableActions,
} from "./admin";
```

- [ ] **Step 5: Run the targeted admin component tests.**

Run: `pnpm exec vitest run packages/qizhi-react/src/admin/admin.test.tsx`

Expected: PASS with search, filter labels, card/header semantics and error-help behavior covered.

- [ ] **Step 6: Commit the backend compositions.**

```bash
git add packages/qizhi-react/src/admin packages/qizhi-react/src/index.ts
git commit -m "feat(react): add admin composition components"
```

## Task 5: Rebuild the smoke consumer and documentation for v1

**Files:**
- Replace: `apps/qizhi-react-smoke/package.json`
- Replace: `apps/qizhi-react-smoke/src/main.tsx`
- Replace: `apps/qizhi-react-smoke/src/App.tsx`
- Replace: `apps/qizhi-docs/src/**`
- Replace: `index.html`
- Replace: `styles.css`
- Replace: `script.js`
- Modify: `vite.config.ts`
- Modify: `apps/qizhi-docs/package.json`
- Test: `apps/qizhi-react-smoke/src/App.test.tsx`

- [ ] **Step 1: Write a failing smoke consumer test.**

```tsx
it("renders a neutral-admin table inside QizhiProvider", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "成员管理" })).toBeInTheDocument();
  expect(screen.getByRole("table")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the smoke test and verify it fails before the old consumer is removed.**

Run: `pnpm exec vitest run apps/qizhi-react-smoke/src/App.test.tsx`

Expected: FAIL because it imports the removed old public API.

- [ ] **Step 3: Rebuild the smoke application around the public v1 package only.**

```tsx
export default function App() {
  return <QizhiProvider><main><PageHeader title="成员管理" />
    <ListPageCard toolbar={<AdminSearchInput placeholder="搜索成员" />}>
      <Table columns={[{ title: "成员", dataIndex: "name" }]} dataSource={[{ key: "1", name: "王静" }]} pagination={false} />
    </ListPageCard>
  </main></QizhiProvider>;
}
```

- [ ] **Step 4: Replace old static docs with the v1 React documentation surface.**

The new document page must contain only: installation, `.npmrc` access requirements, `QizhiProvider` usage, light/dark toggle, Token groups, primitive examples, admin composition examples and migration notice. Remove all old anchors, old blue screenshots, prior component API tables, parallel Demo islands and old static interaction scripts.

- [ ] **Step 5: Run documentation and smoke build checks.**

Run: `pnpm --filter @wangxiaojinger/qizhi-react-smoke build && pnpm build`

Expected: PASS; the docs and smoke consumer import v1 package exports only.

- [ ] **Step 6: Commit the v1 consumer and documentation replacement.**

```bash
git add apps/qizhi-react-smoke apps/qizhi-docs index.html styles.css script.js vite.config.ts
git commit -m "docs: rebuild qizhi documentation for admin v1"
```

## Task 6: Finalize packaging, release pipeline and v1 validation

**Files:**
- Modify: `packages/qizhi-tokens/package.json`
- Modify: `packages/qizhi-react/package.json`
- Modify: `README.md`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/publish-packages.yml`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `docs/releases/v1.0.0-breaking-change.md`
- Delete: old docs, specs, tests and workflows that mention or build removed components

- [ ] **Step 1: Add release-contract tests that fail until both packages are `1.0.0`.**

```js
for (const packagePath of ["packages/qizhi-tokens/package.json", "packages/qizhi-react/package.json"]) {
  const manifest = JSON.parse(readFileSync(packagePath, "utf8"));
  expect(manifest.version).toBe("1.0.0");
}
```

- [ ] **Step 2: Run the release-contract test and verify it fails on the old version.**

Run: `pnpm exec vitest run tests/release-contract.test.ts`

Expected: FAIL because one or both package versions remain `0.7.1`.

- [ ] **Step 3: Set the two package versions to `1.0.0` and simplify release workflow inputs.**

Keep the existing Release trigger, `packages: write` permission, pre-publish version lookup and ordered Token → React publishing. Remove checks and build paths for deleted legacy components. The job must run `pnpm verify` before either `pnpm publish` command.

- [ ] **Step 4: Rewrite the README and create the breaking-change release note.**

Include exact private registry setup, package installation, CSS import, Provider setup, AntD peer dependency requirement, dark mode prop, no backward compatibility statement, old-version pinning guidance and upgrade procedure.

- [ ] **Step 5: Run final repository verification.**

Run: `pnpm install --frozen-lockfile && pnpm verify && pnpm --filter @wangxiaojinger/qizhi-react-smoke build`

Expected: PASS. Then run the v1 docs at 1440px, 1024px and 375px; verify theme toggle, table keyboard path, drawer/modal close-and-focus restoration and browser console.

- [ ] **Step 6: Commit final versioning, release and documentation.**

```bash
git add README.md package.json pnpm-lock.yaml packages/qizhi-tokens/package.json packages/qizhi-react/package.json .github/workflows docs/releases tests
git commit -m "chore: prepare qizhi admin design system v1"
```

## Plan self-review

- Spec coverage: Tasks 1–2 implement the Token and Theme bridge; Tasks 3–4 replace public components; Task 5 removes old consumer/docs surfaces; Task 6 covers semver, GitHub Packages and end-to-end verification.
- No compatibility layer remains in the planned v1 public entry, Token build or docs.
- The public names in Tasks 2–4 are consistent: `createQizhiTheme`, `QizhiProvider`, `QizhiProviderProps`, `AdminSearchInput` and `AdminFilterSelect`.
