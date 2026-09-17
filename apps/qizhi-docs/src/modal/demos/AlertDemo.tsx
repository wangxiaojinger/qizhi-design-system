import { Button, InfoIcon, Modal, Table } from "@wangxiaojinger/qizhi-react";
import { useState } from "react";

const rows = [{ key: "tool", name: "教学工具", version: "12.18.1", author: "狄更斯" }];
const columns = [
  { key: "name", title: "名称", dataIndex: "name" as const },
  { key: "version", title: "版本", dataIndex: "version" as const },
  { key: "author", title: "作者", dataIndex: "author" as const },
];

export default function AlertDemo() {
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
      <div className="qizhi-modal-alert"><InfoIcon /><span>此提示仅显示一次。</span></div>
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
