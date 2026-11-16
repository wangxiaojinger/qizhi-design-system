# QIZHI 后台设计系统 v1.0：Ant Design 清理式迁移设计

## 决策

QIZHI Design System 的正式定位调整为中性、紧凑的企业后台设计系统。`v1.0.0` 以当前 Inspire ITA 后台的 Token 语义和 Ant Design 交互基线为唯一来源；原有启智蓝色板、自研基础组件实现、兼容 Token 和旧文档不进入 `main`。

旧版本仍通过 Git 历史及 `v0.7.1` 及此前的 tag 可复现，但 `main` 不保留运行时兼容层、双主题或双组件实现。

## 目标

- 发布 `@wangxiaojinger/qizhi-tokens@1.0.0`：提供后台 Primitive、Semantic 和组件级 Token，并支持浅色及 `body[data-theme="dark"]` 暗色模式。
- 发布 `@wangxiaojinger/qizhi-react@1.0.0`：以 React 19 + Ant Design 6 为 peer dependency，提供 `QizhiProvider`、稳定的 Ant Design 封装与后台组合组件。
- 由 `QizhiProvider` 集中提供 `ConfigProvider` Theme、Form/Table/Drawer/Modal 的语义默认配置和 AntD `App` 容器。
- 文档站只展示 v1 中性后台样式、公共组件、状态和安装方式。
- GitHub Release 继续作为发布入口；工作流发布两个新版本并拒绝覆盖已发布版本。

## 非目标

- 不保留旧 `@wangxiaojinger/qizhi-react` 的自研组件 API、旧样式类名、蓝色 Token 或迁移 alias。
- 不同时支持旧自研组件和 Ant Design 两套运行时。
- 不迁移 Inspire ITA 的业务数据、路由、Demo Store 或具体页面；仅迁移通用 Token、主题桥接和共享后台组件。
- 不将 Solo、用户端绿色主题或用户端工作台规范引入本仓库。

## 目标架构

```text
packages/qizhi-tokens/
  src/tokens.json              Token 清单及元数据
  dist/style.css               浏览器消费的 CSS 自定义属性
  dist/tokens.json             工具与审计消费的结构化清单

packages/qizhi-react/
  src/provider/QizhiProvider.tsx
  src/theme/antd-theme.ts      CSS Token → Ant Design ThemeConfig 映射
  src/theme/component-config.ts
  src/components/              Ant Design 语义封装
  src/admin/                   PageHeader、ListPageCard、搜索、筛选、表格操作
  src/index.ts                 唯一公开入口

apps/qizhi-docs/
  展示 v1 Token、Provider、基础组件、后台组合组件和状态矩阵
```

## Token 契约

Token 采用三层结构，业务代码只消费 CSS 变量，不写直接颜色或尺寸：

1. Primitive：字体族、字号、行高、字重、`spacing`、`radius`、控件高度、过渡、阴影、层级和布局上限。
2. Semantic：`bg`、`text`、`border`、`status`、`admin`、`page` 与焦点语义；浅色默认、暗色以 `body[data-theme="dark"]` 覆盖。
3. Component：以 Ant Design 的可映射组件为单位，覆盖 Button、Input、Select、Table、Tabs、Pagination、Card、Drawer、Modal、Tooltip 与 Switch。

主操作是中性深色，不再以品牌蓝或绿色作为全局 primary。蓝、绿、黄、红仅作为信息或状态色使用。Token 源码必须具有版本、变更记录、定义校验和无业务源码裸色/裸尺寸的契约测试。

## React 与 Ant Design 契约

`QizhiProvider` 是所有 React 消费者的唯一应用根接入点：

```tsx
import "@wangxiaojinger/qizhi-react/style.css";
import { QizhiProvider } from "@wangxiaojinger/qizhi-react";

root.render(<QizhiProvider><App /></QizhiProvider>);
```

- `antd`、`react` 和 `react-dom` 为 peer dependency；发布包不复制这些依赖。
- ThemeConfig 运行时读取已加载的 CSS Token，避免 AntD 成为 Token 真源。
- 主题切换由受控 `theme` prop 或 Provider 状态触发重新计算 ThemeConfig，保证 AntD 派生色与 `data-theme` 同步。
- 基础封装不扩大 AntD API，只补充 QIZHI 的可访问性、Token 默认值和必要的语义约束。

## 公共组件范围

v1 首批公开组件：

- 基础：Button、Input、InputNumber、Select、Checkbox、Radio、Switch、Form、Table、Tabs、Pagination、Card、Drawer、Modal、Tooltip、Dropdown、Alert、Empty、Tag、Typography。
- 后台组合：PageHeader、SectionCard、ListPageCard、AdminSearchInput、AdminFilterSelect、TableActionButton、TableActions、HintFormItem。
- 图标：继续使用 `@ant-design/icons`；业务专属图形未来按独立资产评审，不迁移旧图标全量目录。

每个公开组件必须有类型、使用示例、状态矩阵及无障碍说明。业务页面不直接依赖 Demo Store、项目 i18n 或内部目录结构。

## 清理范围

在 v1 实现完成并通过验证后，从 `main` 移除：

- 旧蓝色 Token 清单、`legacy-contract.json`、兼容迁移表和相关构建/测试逻辑。
- 旧自研 React 组件、其 CSS、旧图标生成物和旧公共入口导出。
- 展示旧视觉、旧 API 或旧组件源码的文档页面、Demo、静态壳层章节与 E2E 用例。
- 只服务旧版的发布检查、依赖和说明。

清理以重建后的 v1 包及文档可构建、可安装、可验证为前提；不会先合并一个不可发布的删除提交。

## 发布与迁移

- 两个包同步发布 `1.0.0`，并在根 README 中标记为破坏性升级。
- 新项目只能使用 v1 API；旧项目锁定 `^0.x` 或精确旧版本。
- README 提供 GitHub Packages `.npmrc`、私有包读取权限、安装、Provider 接入和暗色主题示例。
- 发布工作流在 CI 通过后执行，依次发布 Tokens 与 React 包；包版本已存在时失败。

## 验收

- Token：结构、依赖层级、浅暗主题、CSS 导出、所有引用定义以及版本/变更记录校验。
- Theme：ThemeConfig 映射、暗色切换、各受控组件 Token 映射与 Provider 可访问性测试。
- Components：每个公开组件的类型、DOM、键盘、焦点、disabled/loading/error/empty 状态测试。
- Docs：安装样例使用已构建包；每个 Demo 调用正式组件而不是平行实现。
- Consumer smoke：在工作区外安装两个打包产物，执行 TypeScript、Vite 构建及浅/暗主题渲染检查。
- Release：`pnpm verify`、目标 E2E、`pnpm build` 与 GitHub Packages 发布前版本检查通过。

## 实施分期

1. 建立 v1 Token 清单、构建、校验与版本契约。
2. 建立 Ant Design ThemeConfig、`QizhiProvider` 和基础封装；先完成 smoke consumer。
3. 迁入后台组合组件并补齐其测试。
4. 重建文档站和安装文档，删除所有旧视觉章节与旧 Demo。
5. 删除旧实现、全量验证、创建 `v1.0.0` Release。
