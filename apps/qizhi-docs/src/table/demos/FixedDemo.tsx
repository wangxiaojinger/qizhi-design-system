import { Link, Table } from "@wangxiaojinger/qizhi-react";
import type { TableColumn } from "@wangxiaojinger/qizhi-react";
import { people } from "./shared";

export default function FixedDemo() {
  const columns: TableColumn<(typeof people)[number]>[] = [
    { key: "name", title: "姓名", dataIndex: "name", width: 150, fixed: "left" },
    { key: "salary", title: "薪水", dataIndex: "salary", width: 120 },
    {
      key: "department",
      title: "部门",
      dataIndex: "department",
      width: 160,
    },
    { key: "role", title: "职位", dataIndex: "role", width: 140 },
    { key: "address", title: "地址", dataIndex: "address", width: 220 },
    { key: "email", title: "电子邮件", dataIndex: "email", width: 240 },
    { key: "date", title: "入职日期", dataIndex: "date", width: 140 },
    {
      key: "action",
      title: "操作",
      width: 90,
      fixed: "right",
      render: () => <Link hoverable={false}>查看</Link>,
    },
  ];

  return (
    <Table
      aria-label="固定列人员表格"
      rowKey="key"
      columns={columns}
      dataSource={people.slice(0, 4)}
      hover={false}
      scrollX={1260}
    />
  );
}
