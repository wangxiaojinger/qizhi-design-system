# QIZHI Admin Design System

QIZHI 是 React 19 + Ant Design 6 的企业后台设计系统。`@wangxiaojinger/qizhi-tokens` 是唯一 Token 真源；`@wangxiaojinger/qizhi-react` 只导出审阅后的 Ant Design 原件、`QizhiProvider` 和后台组合组件。

## 架构边界

- 不得恢复旧的蓝色自研组件、图标子路径、静态文档壳层或兼容别名。
- 业务页必须从 `@wangxiaojinger/qizhi-react` 导入已审阅组件；未导出的 Ant Design 能力直接从 `antd` 导入。
- 在应用入口只引入一次 `@wangxiaojinger/qizhi-react/style.css`，并以 `QizhiProvider` 包裹应用。
- 全局 Token 在 `packages/qizhi-tokens/src/tokens.json` 定义。组件和文档只使用语义 CSS 变量，禁止硬编码色彩、字号、间距、圆角和阴影。
- 主题模式由 `QizhiProvider theme="light" | "dark"` 控制；不要在业务组件内自行改写 `data-theme`。
- 后台列表优先组合 `PageHeader`、`ListPageCard`、`SectionCard`、`AdminSearchInput`、`AdminFilterSelect` 和 `TableActions`，不要复制 Ant Design 内部 DOM 或写 `.ant-*` 覆盖。

## 验证

完成涉及组件、Token、文档或构建的改动后，至少运行：

```bash
pnpm typecheck
pnpm test
pnpm build
```

准备发布时运行 `pnpm verify`。发布两个包前必须使用相同且未发布的语义化版本。
