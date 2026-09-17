import {
  FileIcon,
  SettingsGeneralIcon,
  StarIcon,
  Tabs,
} from "@wangxiaojinger/qizhi-react";

export default function IconDemo() {
  return (
    <Tabs items={[
      {
        key: "home",
        title: <><StarIcon />首页</>,
        content: "首页内容区。",
      },
      {
        key: "docs",
        title: <><FileIcon />文档</>,
        content: "文档内容区。",
      },
      {
        key: "settings",
        title: <><SettingsGeneralIcon />设置</>,
        content: "设置内容区。",
      },
    ]} />
  );
}

