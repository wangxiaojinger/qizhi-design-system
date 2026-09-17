import { Button, Message, Space } from "@wangxiaojinger/qizhi-react";

export default function TypesDemo() {
  return (
    <Space size="large">
      <Button
        type="primary"
        onClick={() => Message.info("This is an info message!")}
      >
        Info
      </Button>
      <Button
        type="primary"
        status="success"
        onClick={() => Message.success("This is a success message!")}
      >
        Success
      </Button>
      <Button
        type="primary"
        status="warning"
        onClick={() => Message.warning("This is a warning message!")}
      >
        Warning
      </Button>
      <Button
        type="primary"
        status="danger"
        onClick={() => Message.error("This is an error message!")}
      >
        Error
      </Button>
      <Button
        type="secondary"
        onClick={() => Message.normal("This is a message!")}
      >
        Normal
      </Button>
    </Space>
  );
}
