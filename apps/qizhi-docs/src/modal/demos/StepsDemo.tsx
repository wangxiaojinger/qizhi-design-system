import { Button, Modal, Steps, Table } from "@wangxiaojinger/qizhi-react";
import { useState } from "react";

const rows = [
  { key: "teach", name: "教学工具", version: "12.18.1", author: "狄更斯" },
  { key: "terminal", name: "终端支持", version: "12.19.2", author: "亚里士多德" },
  { key: "git", name: "Git 工具箱", version: "12.20.3", author: "海明威" },
];
const columns = [
  { key: "name", title: "名称", dataIndex: "name" as const },
  { key: "version", title: "版本", dataIndex: "version" as const },
  { key: "author", title: "作者", dataIndex: "author" as const },
];
const steps = [
  { title: "已完成" },
  { title: "进行中" },
  { title: "待处理" },
];

export default function StepsDemo() {
  const [open, setOpen] = useState(false);
  return <>
    <Button type="primary" data-testid="modal-trigger" onClick={() => setOpen(true)}>
      打开模态框
    </Button>
    <Modal
      open={open}
      title="管理插件"
      onCancel={() => setOpen(false)}
      onOk={() => setOpen(false)}
    >
      <Steps
        items={steps}
        current={2}
        size="small"
        aria-label="流程进度"
      />
      <p>
        你可以为当前项目选择多个插件，系统将检查这些插件是否已安装并启用。
      </p>
      <p><strong>插件列表</strong></p>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="key"
        rowSelection={{}}
        pagination={false}
      />
    </Modal>
  </>;
}
