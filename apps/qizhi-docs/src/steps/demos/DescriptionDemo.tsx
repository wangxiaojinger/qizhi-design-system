import { Steps } from "@wangxiaojinger/qizhi-react";

const items = [
  { title: "成功", description: "这是一段描述" },
  { title: "进行中", description: "这是一段描述" },
  { title: "待办", description: "这是一段描述" },
];

export default function DescriptionDemo() {
  return (
    <Steps
      items={items}
      current={2}
      aria-label="带描述的步骤条"
    />
  );
}
