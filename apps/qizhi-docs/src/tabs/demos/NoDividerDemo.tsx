import { Tabs } from "@wangxiaojinger/qizhi-react";

const items = [
  { key: "managed", title: "我管理的项目", content: "我管理的项目内容" },
  { key: "joined", title: "我参与的项目", content: "我参与的项目内容" },
  { key: "finished", title: "已结项的项目", content: "已结项的项目内容" },
];

export default function NoDividerDemo() {
  return <Tabs items={items} showDivider={false} />;
}
