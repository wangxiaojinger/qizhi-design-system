import { createRoot } from "react-dom/client";
import "@wangxiaojinger/qizhi-react/style.css";
import { Button, PageHeader, QizhiProvider } from "@wangxiaojinger/qizhi-react";

createRoot(document.getElementById("root")!).render(
  <QizhiProvider componentSize="small">
    <PageHeader title="Packed consumer" actions={<Button type="primary">保存</Button>} />
  </QizhiProvider>,
);
