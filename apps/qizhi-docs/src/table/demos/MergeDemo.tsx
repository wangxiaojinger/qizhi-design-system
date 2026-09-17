import { Table } from "@wangxiaojinger/qizhi-react";
import type { TableColumn } from "@wangxiaojinger/qizhi-react";
import { people } from "./shared";

export default function MergeDemo() {
  const columns: TableColumn<(typeof people)[number]>[] = [
    {
      key: "name",
      title: "姓名",
      dataIndex: "name",
      onCell: (_, index) => index === 0 ? { rowSpan: 2 } : index === 1 ? { rowSpan: 0 } : {},
    },
    { key: "salary", title: "薪水", dataIndex: "salary" },
    {
      key: "address",
      title: "地址",
      dataIndex: "address",
      onCell: (_, index) => index === 2 ? { colSpan: 2 } : {},
    },
    {
      key: "email",
      title: "电子邮件",
      dataIndex: "email",
      onCell: (_, index) => index === 2 ? { colSpan: 0 } : {},
    },
  ];

  return (
    <Table
      aria-label="合并单元格"
      rowKey="key"
      columns={columns}
      dataSource={people.slice(0, 4)}
      border
      borderCell
    />
  );
}
