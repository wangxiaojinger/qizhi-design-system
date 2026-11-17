# QIZHI Admin Design System

QIZHI 是一套面向企业后台的中性设计系统。它以语义 Token 为唯一视觉来源，以 Ant Design 为基础组件，并提供少量后台页面组合件。

## 包

- `@wangxiaojinger/qizhi-tokens`：浅色、深色语义 Token 与 CSS 变量。
- `@wangxiaojinger/qizhi-react`：Ant Design 的审阅导出、`QizhiProvider` 与后台组合组件。

## 在其他项目中使用

先让项目能够读取 GitHub Packages：

```ini
# .npmrc
@wangxiaojinger:registry=https://npm.pkg.github.com
always-auth=true
```

在开发者机器或 CI 的私有配置中提供拥有 `read:packages` 权限的 GitHub Token：

```ini
//npm.pkg.github.com/:_authToken=你的令牌
```

安装 React、Ant Design 与 QIZHI 包：

```bash
pnpm add antd @ant-design/icons @wangxiaojinger/qizhi-tokens @wangxiaojinger/qizhi-react
```

在应用入口引入样式，并用 Provider 包住应用：

```tsx
import "@wangxiaojinger/qizhi-react/style.css";
import { Button, QizhiProvider } from "@wangxiaojinger/qizhi-react";

export function App() {
  return <QizhiProvider><Button type="primary">保存</Button></QizhiProvider>;
}
```

`QizhiProvider` 是应用 React 根节点中唯一的 Ant Design `ThemeConfig` 所有者：在应用入口只挂载一次，不要再以带有 `theme` 的 `ConfigProvider` 包裹或嵌套它。深色模式只需传入 `theme="dark"`。业务页面可直接使用审阅过的 Ant Design 导出，或组合 `PageHeader`、`ListPageCard`、`SectionCard`、`AdminSearchInput`、`AdminFilterSelect` 和 `TableActions`。

项目可通过 `QizhiProvider` 传入 `locale`、`direction`、`componentSize`、`componentDisabled`、`prefixCls`、`iconPrefixCls`、容器回调、CSP 和 Form 的行为配置。QIZHI 保留 ThemeConfig 以及 Form、Table、Modal、Drawer 的视觉 styles 所有权；不要传入第二套主题或以局部 styles 覆盖这些规范。

## 开发与发布

```bash
corepack pnpm install
corepack pnpm verify
```

发布前同时提升两个正式包到相同的未发布版本，完成验证后在 GitHub 创建对应 Release。`Publish GitHub Packages` 工作流会发布 Tokens 与 React 包；使用方升级版本并重新构建后才会获得新的规范。

`pnpm verify` 会以 React 19.3.0、React DOM 19.3.0 与 antd 6.6.6 构建正式包，并使用 `pnpm pack` 产物在独立临时消费者中安装、构建。该验证不发布任何包。这是当前已验证基线；包的 peer dependency 允许范围内的其他版本尚未由本次版本验证。
