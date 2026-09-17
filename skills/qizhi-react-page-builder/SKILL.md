---
name: qizhi-react-page-builder
description: Use when generating a product page exclusively from current QIZHI React public components, generated API contracts, demos, and design tokens.
---

# QIZHI React Page Builder

Generate React pages without introducing another visual or component source.

## Design-source contract

The only allowed design evidence is:

1. Public components and icons exported by `packages/qizhi-react/src/index.ts` and `packages/qizhi-react/src/icon/index.ts`.
2. Usage demonstrated by `apps/qizhi-docs/src/*/demos/*.tsx` and the matching `*Docs.registry.ts` only when needed to locate those demos.
3. Props, descriptions, types, and defaults from the generated contract at `apps/qizhi-docs/src/api/component-api.json`.
4. Colors and design variables from the structured manifest at `packages/qizhi-tokens/src/tokens.json`.

Do not read handwritten API-table TSX or `*Api.ts` metadata directly during page generation. The generated API contract is the machine-readable source. Do not use the static site UI, old HTML examples, business pages, contract documents, migration plans, screenshots, third-party design systems, or general web conventions as design evidence. Project instructions and build configuration may be read for execution safety, but they do not authorize visible UI.

Run `scripts/inventory_react.py --repo-root <react-worktree> --format markdown` before choosing components. If an element is not a public export with a relevant Demo, record a capability gap; do not invent it.

## Component taxonomy and selection order

QIZHI React uses three component layers. Classify every mapped requirement and
select the highest complete layer that matches it:

1. **平台框架组件**：整个平台壳层或稳定导航模块。
   - 平台框架 `PlatformShell`：对应 Layout Demo 的“框架结构预览”，拥有顶部、
     侧边和内容区的完整组合及响应式行为。
   - 顶部导航 `TopNavigation`：对应 Menu Demo 的“顶部导航”。
   - 侧边导航 `SideNavigation`：对应 Menu Demo 的“左侧导航”。
2. **业务组件**：拥有固定业务结构、UI、状态和交互的完整模块，包括已公开的
   引导与流程、概览与指标、对象展示、对象选择和详情头部组件。
3. **基础组件**：Button、Menu、Layout、Table、Form 等通用原子或组合能力。

选择顺序为：完整 `PlatformShell` → 独立平台框架组件 → 完整业务组件 →
基础组件 → 允许的静态语义布局。页面只能向平台框架组件和业务组件传入 API
公开的数据、文案、状态和回调；不得把它们拆回基础组件重新制作。

平台页面默认先判断 `PlatformShell` 是否覆盖整体结构。只有需求明确不需要完整
平台壳层时，才分别使用 `TopNavigation` 或 `SideNavigation`。不能因为原 Demo
位于 Menu 或 Layout 文档中，就把这三项归为基础组件变体。

## Page contract

- Import interactive UI only from `@wangxiaojinger/qizhi-react` or `@wangxiaojinger/qizhi-react/icon`, plus `@wangxiaojinger/qizhi-react/style.css`. The React stylesheet already consumes `@wangxiaojinger/qizhi-tokens/style.css`; do not add a second token source.
- Confirm every prop in the generated API contract, then follow the selected Demo's real state, initial value, interaction, composition, and copy pattern. A Demo illustrates use; its private docs-shell CSS is not reusable page UI.
- Use ordinary semantic elements only for page layout, grouping, headings, paragraphs, and business copy. They must not imitate an existing or missing component.
- Page-owned CSS may define layout and responsive arrangement. Visual color values must use public CSS variables listed by the token manifest; do not add raw hex, rgb, hsl, named colors, gradients, shadows, radii, typography scales, or decorative effects not supplied by the allowed sources.
- Do not use native `button`, `input`, `select`, `textarea`, or handwritten `svg` in page TSX. Do not import another UI library, copy QIZHI component source, select `.qizhi-*__*` internals, or use inline layout styles.
- Preserve business requirements and copy from the user's input. Do not treat those as design-system evidence.
- Every generated page must implement the bilingual runtime in [references/localization-contract.md](references/localization-contract.md): shared `LocaleProvider`, `useLocale`, complete `zh-CN` and `en-US` dictionaries, one-click navigation switching, persistence, and synchronized document language.
- Every generated page must follow [references/responsive-layout-contract.md](references/responsive-layout-contract.md): document-level vertical scrolling, content-driven localized sizing, breakpoint-edge checks, zero horizontal overflow, and component-owned visuals controlled only through 公开 API.
- When a required public component or token is absent, stop that portion of implementation and report `capability_gap`; never substitute it.

## Workflow

1. Parse the request into confirmed product facts, reversible assumptions, open questions, and capability gaps.
2. Inventory only the four allowed source classes.
3. Map every visible or interactive requirement to a public component and a matching Demo. Mark layout/text separately and apply the three-layer selection order above. Do not rebuild `PlatformShell`, `TopNavigation`, or `SideNavigation` with `Layout`, `Menu`, `Dropdown`, `Button`, or page-owned CSS.
   When the request matches an Object Display business card, use the complete
   `TaskCard`, `MarketplaceModelCard`, `FinancialModelCard`, `McpServiceCard`,
   `ProjectCard`, `ResourceSpecificationCard`, or
   `BillingBudgetCard` demonstrated by its independent Demo.
   These components own their fixed UI structure and actions. Pages may supply
   documented data, copy, and callbacks only. For these cases,不得使用 `ModelCard`
   重新选择业务变体，也不得使用 `ConfirmationSummary`、
   `ConfirmationSummaryGroup` 或基础组件重新拼装完整业务卡片。
   When the request matches the confirmed guidance, overview, selection, or
   service-detail business modules, use the complete `BusinessGuide`,
   `TaskOverview`, `BasicChoiceCards`, `IconChoiceCards`, `ObjectSelector`, or
   `ServiceDetailHeader`. Do not rebuild these modules from `Steps`,
   `MetricCard`, `TaskCard`, `ChoiceCardGroup`, `DetailHeader`, `Drawer`,
   `Table`, or `Tabs` in page code.
4. Read [references/localization-contract.md](references/localization-contract.md) and [references/responsive-layout-contract.md](references/responsive-layout-contract.md), then generate both locale dictionaries and connect them to the shared QIZHI locale runtime and responsive document-flow architecture.
5. Generate the page with QIZHI imports and token-based page CSS.
6. Run `scripts/validate_react_output.py <output-dir>` before typecheck, build, and browser verification, then exercise both locales at 1440, 1024, 375, and every page breakpoint edge including 1199/1200 for the platform shell. Prove real vertical scrolling and inspect localized direct-child geometry.
7. Report sources actually used, components grouped by 平台框架组件／业务组件／基础组件, locale coverage, gaps, mock-only behavior, commands, and results. Automated completion is at most `candidate_pass`; keep `independent_verification: pending`.

Read [references/source-boundary.md](references/source-boundary.md) when deciding whether a file or UI element is permitted. Before generating page code, read both [references/localization-contract.md](references/localization-contract.md) and [references/responsive-layout-contract.md](references/responsive-layout-contract.md).
