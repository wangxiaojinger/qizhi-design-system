import { Button, Notification, Space } from "@wangxiaojinger/qizhi-react";

export default function ActionDemo() {
  const open = () => Notification.info({ title: "任务通知",
    content: "你的导出任务已经完成，可以前往查看详情。", duration: 0,
    btn: <Space size="small"><Button size="small">取消</Button>
      <Button size="small" type="primary">好的</Button></Space> });
  return <Button type="primary" data-testid="notification-trigger"
    onClick={open}>打开通知</Button>;
}
