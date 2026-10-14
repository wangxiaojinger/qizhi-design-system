import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Table } from "../../../packages/qizhi-react/src/table/Table";
import type { TableColumn } from "../../../packages/qizhi-react/src/table/Table.types";
import "../../../packages/qizhi-tokens/dist/style.css";

type Row = { id: number; name: string; status: string; amount: number };
const rows: Row[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1, name: index < 6 ? "项目 Alpha" : "VeryLongUnbrokenProjectIdentifierABCDEFGHIJKLMNOPQRSTUVWXYZ",
  status: "启用", amount: index * 12.5,
}));
const columns: TableColumn<Row>[] = [
  { key: "name", title: "名称", dataIndex: "name", minWidth: 160, maxWidth: 500, grow: 1, ellipsis: true },
  { key: "status", title: "状态", dataIndex: "status", width: 96, align: "center" },
  { key: "amount", title: "金额", dataIndex: "amount", width: 120, align: "right", sorter: (a, b) => a.amount - b.amount },
];
function App() {
  const [records, setRecords] = useState(rows);
  const [narrow, setNarrow] = useState(false);
  const [header, setHeader] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const fixed: TableColumn<Row>[] = [
    { key: "id", title: "编号", dataIndex: "id", width: 52, fixed: "left" },
    { key: "name", title: "名称", dataIndex: "name", width: 70, fixed: "left", ellipsis: true },
    { key: "description", title: "详情", dataIndex: "name", width: 420 },
    { key: "status", title: "状态", dataIndex: "status", width: 58, fixed: "right" },
    { key: "amount", title: "金额", dataIndex: "amount", width: 64, fixed: "right", align: "right" },
  ];
  return <>
    <button onClick={() => setNarrow(!narrow)}>改变容器</button>
    <button onClick={() => setHeader(!header)}>切换表头</button>
    <button onClick={() => setEmpty(!empty)}>切换空态</button>
    <button onClick={() => setLoading(!loading)}>切换加载</button>
    <button onClick={() => setTimeout(() => setRecords(rows.map((row) => ({ ...row, name: `Async ${row.name}` }))), 20)}>异步更新数据</button>
    <section id="constrained" style={{ width: narrow ? 300 : "100%", maxWidth: "100%" }}>
      <Table rowKey="id" columns={columns} dataSource={empty ? [] : records} showHeader={header}
        loading={loading} pagination={{ pageSize: 6 }} />
    </section>
    <section id="compact"><Table rowKey="id" columns={columns} dataSource={rows.slice(0, 2)}
      layoutMode="compact" tableLayout="fixed" /></section>
    <section id="auto"><Table rowKey="id" tableLayout="auto" columns={[
      { key: "id", title: "编号", dataIndex: "id", minWidth: 80 },
      { key: "name", title: "名称", dataIndex: "name", minWidth: 200 },
    ]} dataSource={rows.slice(0, 2)} /></section>
    <section id="fixed"><Table rowKey="id" columns={fixed} dataSource={rows.slice(0, 2)}
      rowSelection={{}} expandable={{ expandedRowRender: () => "展开内容" }} showHeader={header} /></section>
    <section id="legacy"><Table rowKey="id" columns={[
      { key: "name", title: "名称", dataIndex: "name", width: 180 },
      { key: "amount", title: "金额", dataIndex: "amount", width: 120 },
    ]} dataSource={rows.slice(0, 2)} showHeader={header} /></section>
    <section id="cell-override" style={{ width: 220, maxWidth: "100%" }}><Table rowKey="id" columns={[
      { key: "amount", title: "金额", dataIndex: "amount", width: 100, align: "right", onCell: () => ({ style: { textAlign: "center" } }) },
      { key: "name", title: "名称", dataIndex: "name", minWidth: 100, grow: 1 },
    ]} dataSource={rows.slice(0, 1)} /></section>
    {[5, 10].map((count) => <section key={count} id={`many-${count}`}><Table rowKey="id"
      columns={Array.from({ length: count }, (_, index) => ({
        key: String(index), title: `字段${index + 1}`, dataIndex: "name" as const,
        ...(index === 0 ? { minWidth: 160, grow: 1 } : { width: 96 }), ellipsis: true,
      }))} dataSource={rows.slice(0, 2)} /></section>)}
  </>;
}
createRoot(document.getElementById("root")!).render(<App />);
