import { Descriptions } from "@wangxiaojinger/qizhi-react";

export default function LabelAlignDemo() {
  return (
    <div className="descriptions-demo-stack">
      <Descriptions title="右对齐标签" labelAlign="right">
        <Descriptions.Item label="项目名称">QIZHI Design System</Descriptions.Item>
        <Descriptions.Item label="当前版本">1.0.0</Descriptions.Item>
        <Descriptions.Item label="负责人">Design Team</Descriptions.Item>
      </Descriptions>
      <Descriptions title="垂直排列" layout="vertical">
        <Descriptions.Item label="项目名称">QIZHI Design System</Descriptions.Item>
        <Descriptions.Item label="当前版本">1.0.0</Descriptions.Item>
        <Descriptions.Item label="负责人">Design Team</Descriptions.Item>
      </Descriptions>
    </div>
  );
}
