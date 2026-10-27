import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Table } from "../../../packages/qizhi-react/src/table/Table";
import { Modal } from "../../../packages/qizhi-react/src/modal/Modal";
import { Drawer } from "../../../packages/qizhi-react/src/drawer/Drawer";
import type { TableColumn } from "../../../packages/qizhi-react/src/table/Table.types";
import type { TableColumnLayoutState } from "../../../packages/qizhi-react/src/table/TableColumnLayout.types";
import "../../../packages/qizhi-tokens/dist/style.css";
type Row = { id: number; a: string; b: string; c: string; d: string; e: string; f: string };
const rows: Row[] = [{ id: 1, a: "甲", b: "乙", c: "内容", d: "锁定", e: "其他", f: "操作" }];
const initial: TableColumnLayoutState = { schemaVersion: 1, columnOrder: ["a", "b", "c", "d", "e", "f"], columnWidths: {}, columnVisibility: {} };
function App() {
  const mode = new URLSearchParams(location.search).get("mode");
  const [narrow, setNarrow] = useState(false);
  const [longText, setLongText] = useState(false);
  const [longLabel, setLongLabel] = useState(false);
  const [layout, setLayout] = useState<TableColumnLayoutState>(initial);
  const [, rerender] = useState(0);
  const [events, setEvents] = useState<{ state: TableColumnLayoutState; reason: string }[]>([]);
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const columns: TableColumn<Row>[] = [
    { key: "a", title: "甲", dataIndex: "a", width: 100, minWidth: 80, maxWidth: 200, fixed: "left",
      settingsLabel: longLabel ? "模型调用统计与工作空间名称" : undefined },
    { key: "b", title: "乙", dataIndex: "b", width: 120, fixed: "left" },
    { key: "c", title: "内容", dataIndex: "c", width: 140 },
    { key: "d", title: "锁定", dataIndex: "d", width: 130, movable: false },
    { key: "e", title: "其他", dataIndex: "e", width: 140 },
    { key: "f", title: "操作", dataIndex: "f", width: 100, minWidth: 80, maxWidth: 220, fixed: "right", layoutRole: "action" },
  ];
  const automatic = mode === "auto" ? columns.slice(0, 3).map((col, index) => ({ ...col, fixed: undefined, minWidth: undefined, maxWidth: undefined, width: index === 0 ? "25%" : undefined })) : columns;
  const data = longText ? rows.map((row) => ({ ...row, b: "UnbrokenModelIdentifier".repeat(8) })) : rows;
  const table = (label: string) => <Table aria-label={label} rowKey="id" columns={automatic} dataSource={data}
    layoutMode={mode === "auto" ? "fill" : "compact"} tableLayout={mode === "auto" ? "auto" : "fixed"}
    columnCustomization={{ resize: true, reorder: true, visibility: true, settings: true }}
    columnLayout={mode === "reject" ? initial : layout}
    onColumnLayoutChange={(state, meta) => {
      if (mode !== "reject") setLayout(state);
      setEvents((previous) => [...previous, { state, reason: meta.reason }]);
    }} />;
  return <>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
      <button onClick={() => rerender((n) => n + 1)}>父重绘</button>
      <button onClick={() => setNarrow(!narrow)}>切换容器</button>
      <button onClick={() => setLongText(!longText)}>改变文本</button>
      <button onClick={() => setLongLabel(!longLabel)}>切换列名</button>
      <button onClick={() => setLayout({ ...initial, columnOrder: automatic.map((col) => col.key) })}>恢复默认布局</button>
      <button onClick={() => setModal(true)}>打开弹窗</button>
      <button onClick={() => setDrawer(true)}>打开抽屉</button>
    </div>
    <section id="main" style={{ width: narrow ? 330 : 900, maxWidth: "100%" }}>{table("定制表格")}</section>
    <output data-testid="events" style={{ display: "block", overflowWrap: "anywhere" }}>{JSON.stringify(events)}</output>
    <Modal open={modal} title="弹窗列表" onCancel={() => setModal(false)} footer={null} width="min(950px, calc(100vw - 32px))">{table("弹窗表格")}</Modal>
    <Drawer open={drawer} title="抽屉列表" onClose={() => setDrawer(false)} width="min(950px, 100vw)">{table("抽屉表格")}</Drawer>
  </>;
}
createRoot(document.getElementById("root")!).render(<App />);
