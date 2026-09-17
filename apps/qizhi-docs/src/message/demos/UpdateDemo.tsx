import { Button, Message } from "@wangxiaojinger/qizhi-react";

export default function UpdateDemo() {
  const update = () => {
    Message.loading({
      id: "need-update",
      content: "Will update after 2 seconds...",
      duration: 0,
    });
    window.setTimeout(() => {
      Message.success({ id: "need-update", content: "Update success!" });
    }, 2000);
  };
  return <Button type="primary" onClick={update}>Update message</Button>;
}
