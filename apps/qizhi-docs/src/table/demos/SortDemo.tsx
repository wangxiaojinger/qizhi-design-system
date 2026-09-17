import { Table } from "@wangxiaojinger/qizhi-react";
import { columns, people } from "./shared";

export default function SortDemo() {
  const sortable = columns.map((column) => ({
    ...column,
    sorter: (
      first: (typeof people)[number],
      second: (typeof people)[number],
    ) => {
      if (column.dataIndex === "salary") {
        return first.salary - second.salary;
      }

      return String(first[column.dataIndex!]).localeCompare(
        String(second[column.dataIndex!]),
        "zh-CN",
      );
    },
  }));

  return (
    <Table
      aria-label="可排序人员表格"
      rowKey="key"
      columns={sortable}
      dataSource={people}
    />
  );
}
