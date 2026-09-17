import { Button, Space, useNotification } from "@wangxiaojinger/qizhi-react";

const types = ["info", "success", "warning", "error", "normal"] as const;
const labels = ["信息", "成功", "警告", "错误", "普通"];

export default function HookDemo() {
  const [notification, holder] = useNotification();
  return (
    <>
      {holder}
      <Space size="medium" className="qizhi-notification-demo-actions">
        {types.map((type, index) => (
          <Button
            key={type}
            type={type === "info" ? "primary" : "secondary"}
            status={type === "error" ? "danger"
              : type === "warning" || type === "success" ? type : undefined}
            data-testid="notification-trigger"
            onClick={() => notification[type]({
              title: "个人资料",
              content: "当前用户：启智用户",
            })}
          >
            {labels[index]}
          </Button>
        ))}
      </Space>
    </>
  );
}
