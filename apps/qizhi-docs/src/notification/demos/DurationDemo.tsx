import { Button, Notification } from "@wangxiaojinger/qizhi-react";

export default function DurationDemo() {
  const update = () => {
    const id = "notification-update-duration";
    Notification.info({ id, title: "准备更新", content: "通知将在 2 秒后更新。",
      duration: 0 });
    window.setTimeout(() => Notification.success({ id, title: "更新成功",
      content: "通知将在 3 秒后自动关闭。", duration: 3000 }), 2000);
  };
  return <Button type="primary" data-testid="notification-trigger"
    onClick={update}>更新延迟</Button>;
}
