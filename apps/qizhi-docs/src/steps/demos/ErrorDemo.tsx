import { Steps } from "@wangxiaojinger/qizhi-react";

const items = [
  { title: "成功", description: "这是一段描述" },
  { title: "进行中", description: "这是一段描述" },
  { title: "待办", description: "这是一段描述" },
];

export default function ErrorDemo() {
  return (
    <Steps
      items={items}
      current={2}
      status="error"
      aria-label="带错误状态的步骤条"
    />
  );
}
