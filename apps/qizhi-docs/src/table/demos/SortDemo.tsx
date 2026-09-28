import { Table } from "@wangxiaojinger/qizhi-react";
import type { TableColumn, TableSortDirection } from "@wangxiaojinger/qizhi-react";
import { columns, people } from "./shared";

export default function SortDemo() {
  const sortable: TableColumn<(typeof people)[number]>[] = columns.map(
    (column) => ({
      ...column,
      sorter: (first, second) => {
        if (column.dataIndex === "salary") {
          return first.salary - second.salary;
        }

        return String(first[column.dataIndex!]).localeCompare(
          String(second[column.dataIndex!]),
          "zh-CN",
        );
      },
      ...(column.key === "name" ? {
        sortDirections: ["descend"] as TableSortDirection[],
        showSorterTooltip: { target: "full-header" as const },
      } : null),
    }),
  );

  return (
    <Table
      aria-label="可排序人员表格"
      rowKey="key"
      columns={sortable}
      dataSource={people}
      showSorterTooltip={{ target: "sorter-icon" }}
      onSortChange={(order, column) => {
        console.log("sort", order, column.key);
      }}
    />
  );
}
