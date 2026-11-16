# QIZHI 完整后台 Token 与首个消费者接入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Inspire 后台完整的中性灰 Token 与 Ant Design 主题配置发布为 QIZHI 1.1.0，并让 Inspire 后台从该正式包消费唯一规范源。

**Architecture:** QIZHI `tokens.json` 变为完整结构化规范，由其构建 CSS。`qizhi-react` 吸收 Inspire 已验证的 AntD ThemeConfig 和 ConfigProvider 组件配置。Inspire 仅以已发布的 QIZHI 包替换 CSS/Provider 来源，保留路由、业务状态、直接 AntD 导入和本地业务组合，以把视觉来源迁移与页面行为解耦。

**Tech Stack:** pnpm workspaces、Node 24、React 19、Ant Design 6、Vite 8、Vitest 4、npm/GitHub Packages。

---

## 交付约束

- 默认主操作、选中、焦点、链接和控件强调必须是中性灰 Token；禁止在这些角色使用 `#1677ff`、`#4096ff` 或 `#3366ff`。
- `admin.info` 与离散图表数据色可以保留蓝色，但不具有品牌/主操作含义。
- 发布版本为 `1.1.0`；两个 QIZHI 正式包的版本必须相同。
- Inspire 不提交 GitHub Packages Token；registry 配置通过环境变量 `NODE_AUTH_TOKEN` 读取凭据。

## Task 1: 建立完整 Token 覆盖与中性主调契约

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Create: `packages/qizhi-tokens/tests/full-admin-contract.node.mjs`

- [ ] **Step 1: 先写覆盖和中性色失败测试。**

```js
const required = [
  "font.family.mono", "font.size.3xl", "line.height.ratio.base", "spacing.10",
  "radius.full", "control.height.xl", "layout.sider.width", "transition.fast",
  "admin.card.foreground", "admin.sidebar.selected", "admin.shadow.drawer",
  "chart.cost.series.1", "bg.base.tertiary", "text.disabled",
  "status.primary.surface.l1", "focus.ring.shadow", "component.modal.mask",
];
for (const name of required) assert.ok(tokens[name], `missing ${name}`);
assert.equal(tokens["admin.primary"].value, "#171717");
assert.notEqual(tokens["control.accent"].value, "#1677ff");
assert.notEqual(tokens["control.accent.hover"].value, "#4096ff");
assert.equal(tokens["admin.brand.identity"], undefined);
```

- [ ] **Step 2: 运行测试并确认旧的 76 Token manifest 不足。**

Run: `CI=true corepack pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL，提示 `missing font.family.mono`、`missing layout.sider.width` 或等价缺失项。

- [ ] **Step 3: 将 Inspire 的有效 Token 映射为结构化 QIZHI 条目。**

以 `design-tokens/tokens.css` 为值参考，不复制该 CSS 文件。添加 seed、map、alias、component 条目：

```json
"control.accent": {
  "name": "control.accent",
  "value": "var(--admin-primary)",
  "cssVariable": "--control-accent",
  "category": "控件语义",
  "description": "中性主控件强调色",
  "tier": "alias",
  "status": "stable"
},
"admin.sidebar.selected": {
  "name": "admin.sidebar.selected",
  "value": "#e5e5e5",
  "themes": { "dark": "#404040" },
  "cssVariable": "--admin-sidebar-selected",
  "category": "后台语义色",
  "description": "侧栏选中背景",
  "tier": "map",
  "status": "stable"
}
```

不添加 `admin.brand.identity`；现有业务该变量改为 `admin.primary`。补充完整字体/行高、尺度、侧栏、阴影、状态、图表、焦点及背景/文本 alias。所有 dark 值写入 `themes.dark`。

- [ ] **Step 4: 让新测试通过并检查生成 CSS。**

Run: `CI=true corepack pnpm --filter @wangxiaojinger/qizhi-tokens test && CI=true corepack pnpm --filter @wangxiaojinger/qizhi-tokens build`

Expected: PASS；`dist/style.css` 的 root 与 dark 区块包含新增 Token，`--control-accent` 指向中性主操作色。

- [ ] **Step 5: 提交 Token 契约。**

```bash
git add packages/qizhi-tokens
git commit -m "feat(tokens): complete neutral admin contract"
```

## Task 2: 将完整 Ant Design 映射移入 QIZHI Provider

**Files:**
- Modify: `packages/qizhi-react/src/theme/antd-theme.ts`
- Modify: `packages/qizhi-react/src/theme/component-config.ts`
- Create: `packages/qizhi-react/src/theme/index.ts`
- Modify: `packages/qizhi-react/package.json`
- Modify: `packages/qizhi-react/vite.config.ts`
- Modify: `packages/qizhi-react/src/theme/antd-theme.test.ts`
- Modify: `packages/qizhi-react/src/provider/QizhiProvider.test.tsx`

- [ ] **Step 1: 添加中性色和完整组件映射的失败测试。**

```ts
it("keeps Ant Design primary controls neutral", () => {
  document.body.style.setProperty("--admin-primary", "#171717");
  document.body.style.setProperty("--control-accent", "#171717");
  const theme = createQizhiTheme();
  expect(theme.token?.colorPrimary).toBe("#171717");
  expect(theme.components?.Switch?.colorPrimary).toBe("#171717");
  expect(theme.components?.Table?.rowSelectedBg).toBeDefined();
  expect(theme.components?.Layout?.siderBg).toBeDefined();
});
```

- [ ] **Step 2: 运行定向测试并确认当前映射缺少 Layout/Switch 等规则。**

Run: `CI=true corepack pnpm exec vitest run packages/qizhi-react/src/theme/antd-theme.test.ts`

Expected: FAIL，提示 `Switch.colorPrimary` 或 `Layout.siderBg` 未定义。

- [ ] **Step 3: 移植当前后台的纯 ThemeConfig 计算。**

将 `sumCssNumberTokens`、`divideCssNumberToken`、`ratioCssNumberTokens`、`centeredBlockPadding`、`centeredBoxPadding`、`pixelPair` 和 `blockEndMargin` 放入 `antd-theme.ts`，并将 Layout、Popover、Dropdown、Card、Modal、Drawer、Form、Tooltip、Table、Tabs、Input、InputNumber、Select、Segmented、Checkbox、Radio、Button、Switch、Pagination 映射至 QIZHI Token。

关键映射必须保持：

```ts
colorPrimary: cssToken("--admin-primary"),
colorLink: cssToken("--admin-primary"),
Switch: {
  colorPrimary: cssToken("--control-accent"),
  colorPrimaryHover: cssToken("--control-accent-hover"),
},
Pagination: { itemActiveBg: cssToken("--admin-primary") },
```

- [ ] **Step 4: 扩展 ConfigProvider 组件配置。**

将当前后台的 `form`、`table`、`modal`、`drawer` styles 合并到 `qizhiComponentConfig`，保留公开 `ConfigProvider` styles API，不添加 `.ant-*` CSS 选择器。

- [ ] **Step 5: 导出只读 Token helper 子路径。**

创建 `src/theme/index.ts`：

```ts
export { cssNumberToken, cssToken } from "./antd-theme";
```

在 package exports 中增加 `./theme`，并在 Vite library entries 中增加 `theme`。该子路径只暴露读取 CSS Token 的 helper，不暴露私有 ConfigProvider 配置。

- [ ] **Step 6: 运行主题和 Provider 测试、类型检查。**

Run: `CI=true corepack pnpm exec vitest run packages/qizhi-react/src/theme/antd-theme.test.ts packages/qizhi-react/src/provider/QizhiProvider.test.tsx && CI=true corepack pnpm --filter @wangxiaojinger/qizhi-react typecheck`

Expected: PASS；切换 light/dark 后 ThemeConfig 重新读取 Token。

- [ ] **Step 7: 提交 Provider 扩展。**

```bash
git add packages/qizhi-react/src/theme packages/qizhi-react/src/provider
git commit -m "feat(react): complete neutral admin theme bridge"
```

## Task 3: 发布 QIZHI 1.1.0

**Files:**
- Modify: `packages/qizhi-tokens/package.json`
- Modify: `packages/qizhi-react/package.json`
- Modify: `README.md`
- Create: `docs/releases/v1.1.0-full-token-contract.md`

- [ ] **Step 1: 添加版本失败测试。**

```js
for (const path of ["../package.json", "../../qizhi-react/package.json"]) {
  const manifest = JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  assert.equal(manifest.version, "1.1.0");
}
```

- [ ] **Step 2: 将两个正式包升至 `1.1.0`，更新 release note。**

发布说明必须写明完整后台 Token、新的中性灰控件主调、Inspire 为首个消费者，以及 `1.0.0` 仍可由旧项目锁定使用。

- [ ] **Step 3: 运行 QIZHI 全量校验。**

Run: `CI=true corepack pnpm verify && CI=true corepack pnpm --filter @wangxiaojinger/qizhi-tokens validate`

Expected: PASS；docs 与 smoke consumer 仍构建成功。

- [ ] **Step 4: 提交、推送、创建 PR，合并后创建 v1.1.0 Release。**

```bash
git add README.md docs/releases packages
git commit -m "chore: release qizhi full token contract v1.1.0"
git push origin codex/qizhi-full-token-adoption
gh pr create --base main --head codex/qizhi-full-token-adoption --title "Complete QIZHI neutral admin token contract"
```

Release 仅在 PR 合并、CI 成功且 GitHub Packages 版本检查通过后创建。

## Task 4: 在 Inspire 安装正式 QIZHI 包

**Files:**
- Create: `apps/admin-web/.npmrc`
- Modify: `apps/admin-web/package.json`
- Modify: `apps/admin-web/package-lock.json`
- Modify: `apps/admin-web/src/styles/global.css`

- [ ] **Step 1: 添加无凭据的私有 registry 配置。**

```ini
@wangxiaojinger:registry=https://npm.pkg.github.com
always-auth=true
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

- [ ] **Step 2: 用临时环境 Token 安装精确发布版本。**

```bash
NODE_AUTH_TOKEN="$(gh auth token)" npm --prefix apps/admin-web install \
  @wangxiaojinger/qizhi-tokens@1.1.0 @wangxiaojinger/qizhi-react@1.1.0
```

Expected: `apps/admin-web/package.json` 和 `apps/admin-web/package-lock.json` 均锁定 `1.1.0`，Token 不写入文件或终端输出。

- [ ] **Step 3: 添加失败的包来源契约测试。**

更新 `apps/admin-web/src/theme/token-source.test.ts`，断言：

```ts
expect(read('../styles/global.css')).toContain("@wangxiaojinger/qizhi-react/style.css");
expect(read('../app/providers.tsx')).toContain("from '@wangxiaojinger/qizhi-react'");
expect(existsSync(new URL('../../../../design-tokens/tokens.css', import.meta.url))).toBe(false);
```

- [ ] **Step 4: 运行测试确认当前本地来源未满足新契约。**

Run: `npm --prefix apps/admin-web test -- token-source.test.ts`

Expected: FAIL，仍发现本地 `design-tokens` import。

## Task 5: 让 Inspire 顶层 Provider 消费 QIZHI

**Files:**
- Modify: `apps/admin-web/src/app/providers.tsx`
- Modify: `apps/admin-web/src/styles/global.css`
- Delete: `design-tokens/tokens.css`
- Delete: `design-tokens/antd-theme.ts`
- Delete: `apps/admin-web/src/theme/component-config.ts`
- Modify: `apps/admin-web/src/theme/enterprise-theme.test.ts`
- Modify: `apps/admin-web/src/theme/token-source.test.ts`

- [ ] **Step 1: 替换样式与 Provider 来源。**

```tsx
import { App as AntApp, ConfigProvider } from "antd";
import { QizhiProvider } from "@wangxiaojinger/qizhi-react";

export function EnterpriseThemeProvider({ children }: { children: ReactNode }) {
  return <QizhiProvider locale={isEnglish ? enUS : zhCN}>{children}</QizhiProvider>;
}
```

`global.css` 只保留：

```css
@import "@wangxiaojinger/qizhi-react/style.css";
```

移除不再需要的 `AntApp`、`ConfigProvider`、`createEnterpriseTheme`、`adminComponentConfig` import；保留错误边界、语言选择和 `AdminDemoProvider`。

- [ ] **Step 2: 删除重复本地规范，修复显式 Token helper imports。**

将所有 `../../../../design-tokens/antd-theme` 的 `cssToken`/`cssNumberToken` import 改为 `@wangxiaojinger/qizhi-react/theme` 的正式子路径；若该子路径尚未导出，先在 QIZHI 定义并测试显式 `./theme` export，再在 Inspire 使用它。

- [ ] **Step 3: 更新来源与视觉契约测试。**

增加以下断言：

```ts
expect(source).toContain("QizhiProvider");
expect(source).not.toContain("createEnterpriseTheme");
expect(read('../styles/global.css')).not.toContain("../../../../design-tokens/tokens.css");
```

同时将旧主题单测调整为读取 QIZHI Provider/Theme bridge 的公开消费行为，而非已删除的本地文件。

- [ ] **Step 4: 运行后台定向与全量验证。**

Run: `npm --prefix apps/admin-web test -- token-source.test.ts enterprise-theme.test.ts jsx-token-contract.test.ts && npm --prefix apps/admin-web typecheck && npm --prefix apps/admin-web build`

Expected: PASS；无本地 Token 源引用，所有后台构建产物使用 QIZHI CSS。

- [ ] **Step 5: 视觉回归并提交 Inspire 接入。**

在 `http://localhost:3000/` 检查浅/深色：默认 Button、Tabs 选中线、Input focus、Switch、Pagination、Drawer、Modal、Table 均不显示 Ant Design 默认蓝。信息反馈与图表数据色可保持语义色。

```bash
git add apps/admin-web/.npmrc apps/admin-web/package-lock.json apps/admin-web design-tokens
git commit -m "feat(admin): consume qizhi neutral token packages"
```

## Plan self-review

- Token 统一、主题桥接、1.1.0 发布和 Inspire 接入均有单独任务。
- 中性灰主调在 Token 测试、ThemeConfig 测试和视觉验收中重复约束。
- 不删除本地 Token，直到 QIZHI 1.1.0 已发布且 Inspire 包安装、测试、构建均成功，避免跨仓库的不可恢复中间状态。
