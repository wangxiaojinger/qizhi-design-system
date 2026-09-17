import { Button, CloudOffFilledIcon, HappyFilledIcon, MedalFilledIcon, Notification,
  RocketFilledIcon, ShieldFlashFilledIcon, Space } from "@wangxiaojinger/qizhi-react";

const items = [
  ["info", "升级", "版本升级", "新版本已经可以使用。", <RocketFilledIcon />],
  ["success", "成功", "升级成功", "系统升级已经完成。", <MedalFilledIcon />],
  ["warning", "警告", "版本风险", "当前版本存在潜在风险。", <ShieldFlashFilledIcon />],
  ["error", "错误", "升级失败", "系统升级失败，请重试。", <CloudOffFilledIcon />],
  ["normal", "微笑", "温馨提示", "祝你今天工作顺利。", <HappyFilledIcon />],
] as const;

export default function IconDemo() {
  return <Space size="medium" className="qizhi-notification-demo-actions">{items.map(([
    type, label, title, content, icon,
  ]) => (
    <Button key={type} type={type === "info" ? "primary" : "secondary"}
      status={type === "error" ? "danger" : type === "warning" || type === "success"
        ? type : undefined}
      data-testid="notification-trigger"
      onClick={() => Notification[type]({ title, content, icon })}>{label}</Button>
  ))}</Space>;
}
