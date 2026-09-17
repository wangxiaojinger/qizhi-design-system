import { Button, Space, useMessage } from "@wangxiaojinger/qizhi-react";

export default function HooksDemo() {
  const [message, contextHolder] = useMessage();
  const open = (
    type: "info" | "success" | "warning" | "error" | "normal",
  ) => {
    message[type]("Current user: PJY");
  };
  return (
    <div className="qizhi-message-context-demo">
      <div className="qizhi-message-context-holder">
        {contextHolder}
        <span className="qizhi-message-context-placeholder">
          contextHolder 挂载区域
        </span>
      </div>
      <Space size="large">
        <Button type="primary" onClick={() => open("info")}>Info</Button>
        <Button
          type="primary"
          status="success"
          onClick={() => open("success")}
        >
          Success
        </Button>
        <Button
          type="primary"
          status="warning"
          onClick={() => open("warning")}
        >
          Warning
        </Button>
        <Button
          type="primary"
          status="danger"
          onClick={() => open("error")}
        >
          Error
        </Button>
        <Button type="secondary" onClick={() => open("normal")}>Normal</Button>
      </Space>
    </div>
  );
}
