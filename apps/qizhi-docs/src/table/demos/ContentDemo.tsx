import { Table } from "@wangxiaojinger/qizhi-react";
import type { TableColumn } from "@wangxiaojinger/qizhi-react";

interface Project {
  key: number;
  name: string;
  description: string;
  note: string;
}

const data: Project[] = [
  {
    key: 1,
    name: "模型服务",
    description: "提供模型推理、版本管理、运行监控和异常告警能力，内容会根据列宽自然换行。",
    note: "QIZHI 表格的 ellipsis 列保持单行并在溢出时显示省略号。",
  },
  {
    key: 2,
    name: "数据服务",
    description: "自然换行时，行高由内容撑开，不再固定为单行高度。",
    note: "需要完整内容时，可通过默认 title 查看原文。",
  },
];

const columns: TableColumn<Project>[] = [
  { key: "name", title: "服务", dataIndex: "name", width: 140 },
  { key: "description", title: "自然换行", dataIndex: "description", width: 260 },
  { key: "note", title: "单行省略", dataIndex: "note", width: 260, ellipsis: true },
];

export default function ContentDemo() {
  return (
    <Table
      aria-label="多行与省略表格"
      rowKey="key"
      columns={columns}
      dataSource={data}
    />
  );
}
