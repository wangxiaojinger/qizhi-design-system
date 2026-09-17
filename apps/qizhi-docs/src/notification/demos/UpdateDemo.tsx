import { Button, Notification } from "@wangxiaojinger/qizhi-react";

export default function UpdateDemo() {
  const update = () => {
    const id = "notification-update-content";
    Notification.info({ id, title: "准备更新", content: "通知将在 2 秒后更新。",
      duration: 0 });
    window.setTimeout(() => Notification.success({ id, title: "更新成功",
      content: "通知内容已经更新。" }), 2000);
  };
  return <Button type="primary" data-testid="notification-trigger"
    onClick={update}>更新通知</Button>;
}
