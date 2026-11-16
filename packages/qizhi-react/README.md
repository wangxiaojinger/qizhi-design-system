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

项目需安装 `react`、`react-dom`、`antd` 与 `@ant-design/icons`。`QizhiProvider` 支持 `theme="light" | "dark"`，并让 Ant Design 组件与 QIZHI Token 保持同步。
