import { Steps } from "@wangxiaojinger/qizhi-react";

const items = [
  { title: "成功" },
  { title: "进行中" },
  { title: "待办" },
];

export default function BasicDemo() {
  return (
    <>
      <Steps items={items} current={2} aria-label="基础步骤条" />
      <div className="steps-demo-panel">步骤 2 内容</div>
    </>
  );
}
