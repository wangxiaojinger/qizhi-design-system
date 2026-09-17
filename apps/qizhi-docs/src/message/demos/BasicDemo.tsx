import { Button, Message } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <Button type="primary" onClick={() => Message.info("This is an info message!")}>
      Open Message
    </Button>
  );
}
