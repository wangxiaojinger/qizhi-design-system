# @wangxiaojinger/qizhi-react

QIZHI 企业后台 React 包：提供受控的 Ant Design 导出、语义主题桥接和后台页面组合组件。

```tsx
import "@wangxiaojinger/qizhi-react/style.css";
import { Button, PageHeader, QizhiProvider } from "@wangxiaojinger/qizhi-react";

export function App() {
  return (
    <QizhiProvider>
      <PageHeader title="成员管理" actions={<Button type="primary">新建成员</Button>} />
    </QizhiProvider>
  );
}
```

当前已验证基线是 React 19.3.0、React DOM 19.3.0 与 antd 6.6.6。包的 peer dependency 允许范围内的其他版本尚未由本次版本验证。`QizhiProvider` 保持 v1.1.0 的 `theme="light" | "dark"` 语义，并让 Ant Design 组件与 QIZHI Token 保持同步。

每个 React 根节点只能挂载一个 `QizhiProvider`。它是唯一的 antd ThemeConfig 所有者；不要再嵌套另一个 `QizhiProvider`，也不要通过其他 `ConfigProvider` 传入 `theme`。Provider 可转发 `locale`、`direction`、`componentSize`、`componentDisabled`、`prefixCls`、`iconPrefixCls`、容器回调、CSP 及 Form 的行为配置。QIZHI 保留 Form、Table、Modal、Drawer 的视觉 styles 和 class names 所有权。
