# QIZHI Admin Design System

QIZHI 是一套面向企业后台的中性设计系统。它以语义 Token 为唯一视觉来源，以 Ant Design 为基础组件，并提供少量后台页面组合件。

## 包

- `@wangxiaojinger/qizhi-tokens`：浅色、深色语义 Token 与 CSS 变量。
- `@wangxiaojinger/qizhi-react`：Ant Design 的审阅导出、`QizhiProvider` 与后台组合组件。

## 在其他项目中使用

从 npm 公共仓库安装。已有项目若将 `@wangxiaojinger` 指向 GitHub Packages，请先更新对应的 `.npmrc` 配置，再安装 npm 上已发布的版本并提交更新后的锁文件。

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

首次发布由拥有 npm 命名空间权限的维护者完成。后续自动发布使用 npm Trusted Publishing，在两个包的 npm 设置中分别授权本仓库的 GitHub Actions 工作流 `publish-packages.yml`。两个包使用同一版本，创建 GitHub Release 后，工作流先完成验证，再依次发布 Tokens 和 React 包。

`pnpm verify` 会以 React 19.3.0、React DOM 19.3.0 与 antd 6.6.6 构建正式包，并使用 `pnpm pack` 产物在独立临时消费者中安装、构建。该验证不发布任何包。这是当前已验证基线；包的 peer dependency 允许范围内的其他版本尚未由本次版本验证。
