import { Button, Notification, Space } from "@wangxiaojinger/qizhi-react";

const items = [
  ["info", "信息", "信息通知", "这里是一条信息通知。"],
  ["success", "成功", "操作成功", "你的操作已经成功完成。"],
  ["warning", "警告", "风险提示", "请检查当前配置后再继续。"],
  ["error", "错误", "操作失败", "操作未完成，请稍后重试。"],
  ["normal", "普通", "普通通知", "这里是一条普通通知。"],
] as const;

export default function TypesDemo() {
  return <Space size="medium" className="qizhi-notification-demo-actions">{items.map(([
    type, label, title, content,
  ]) => (
    <Button key={type} type={type === "info" ? "primary" : "secondary"}
      status={type === "error" ? "danger" : type === "warning" || type === "success"
        ? type : undefined}
      data-testid="notification-trigger"
      onClick={() => Notification[type]({ title, content })}>{label}</Button>
  ))}</Space>;
}
