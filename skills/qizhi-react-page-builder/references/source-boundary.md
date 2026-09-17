# Source boundary

## Allowed design evidence

| Need | Allowed source | Use |
|---|---|---|
| Component availability | `packages/qizhi-react/src/index.ts` | Public component names and import path |
| Icon availability | `packages/qizhi-react/src/icon/index.ts` | Public icon names and import path |
| Component use | `apps/qizhi-docs/src/<component>/demos/*.tsx` | Props, states, composition, interaction, initial values |
| Demo discovery | Matching `*Docs.registry.ts` | Demo order and file mapping only |
| Component API | `apps/qizhi-docs/src/api/component-api.json` | Public props, descriptions, types, and defaults |
| Visual values | `packages/qizhi-tokens/src/tokens.json` | Public color and design-variable names, values, categories, and descriptions |

## Not design evidence

- `index.html`, `script.js`, legacy static component markup, or static business pages.
- Handwritten API-table TSX, `*Api.ts` metadata, specs, migration notes, plans, checklists, E2E screenshots, or unrelated tests.
- Demo shell, docs navigation, code panels, action bars, or docs-only CSS.
- Ant Design, Arco Design, another component library, browser defaults, or invented conventions.

Repository instructions, package metadata, TypeScript declarations, and build configuration may be inspected only to execute safely or diagnose compilation. They cannot introduce visible UI, values, variants, or behavior.

## Output boundary

Allowed non-component markup is limited to semantic layout and business content: `main`, `header`, `nav`, `aside`, `section`, `article`, `div`, `span`, headings, paragraphs, lists, and text. If any such element becomes clickable, editable, selectable, dismissible, expandable, draggable, or stateful, it must be replaced by a public QIZHI React component.

Missing component or token means `capability_gap`. The page must not hide the gap behind native controls, custom JSX components, copied component internals, handwritten SVG, hard-coded visual values, or a third-party library.

## Component-layer boundary

| Layer | Public page-building role | Fixed examples |
|---|---|---|
| 平台框架组件 | Platform shell and stable navigation regions | `PlatformShell`, `TopNavigation`, `SideNavigation` |
| 业务组件 | Complete business UI, structure, state, and interaction | Business guide, overview, object cards, object selection, detail header |
| 基础组件 | Generic primitives used only where no complete higher-layer component matches | `Button`, `Menu`, `Layout`, `Table`, `Form` |

The source section where a Demo is documented does not determine its public
layer. Menu “顶部导航” is `TopNavigation`; Menu “左侧导航” is
`SideNavigation`; Layout “框架结构预览” is `PlatformShell`. Once a complete
higher-layer component matches, lower-layer composition is outside the output
boundary.
