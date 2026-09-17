import { Button, Notification } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return <Button type="primary" data-testid="notification-trigger" onClick={() => {
    Notification.info({ title: "通知提醒", content: "这是一条通知提醒。",
      closable: false });
  }}>打开通知</Button>;
}
