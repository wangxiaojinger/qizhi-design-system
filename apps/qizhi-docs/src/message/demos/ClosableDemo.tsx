import { Button, Message } from "@wangxiaojinger/qizhi-react";

export default function ClosableDemo() {
  return (
    <Button
      type="primary"
      onClick={() => Message.info({
        content: "This is a message!",
        closable: true,
        duration: 10000,
      })}
    >
      Open Message
    </Button>
  );
}
