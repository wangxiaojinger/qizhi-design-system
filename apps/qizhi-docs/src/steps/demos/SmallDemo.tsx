import { Steps } from "@wangxiaojinger/qizhi-react";

const items = [
  { title: "成功" },
  { title: "进行中" },
  { title: "待办" },
];

export default function SmallDemo() {
  return (
    <Steps
      items={items}
      current={2}
      size="small"
      aria-label="小型步骤条"
    />
  );
}
