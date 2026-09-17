import { Button, Message } from "@wangxiaojinger/qizhi-react";

export default function ManualCloseDemo() {
  const open = () => {
    const close = Message.info({
      content: "Close after 2 seconds...",
      duration: 0,
    });
    window.setTimeout(close, 2000);
  };
  return <Button type="primary" onClick={open}>Close after 2 seconds</Button>;
}
