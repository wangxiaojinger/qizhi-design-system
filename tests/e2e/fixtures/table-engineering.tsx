import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Table } from "../../../packages/qizhi-react/src/table/Table";
import { Modal } from "../../../packages/qizhi-react/src/modal/Modal";
import { Drawer } from "../../../packages/qizhi-react/src/drawer/Drawer";
import { Empty } from "../../../packages/qizhi-react/src/empty/Empty";
import { Button } from "../../../packages/qizhi-react/src/button/Button";
import type { TableColumn } from "../../../packages/qizhi-react/src/table/Table.types";
import "../../../packages/qizhi-tokens/dist/style.css";

type Row = { id: number; name: string; description: string; status: string; count: number | null };
const rows: Row[] = [
  { id: 1, name: "gjpqy_ 中文名称及多语言完整字形 ".repeat(8),
    description: "LongUnbrokenIdentifier_gjpqy_".repeat(12), status: "Ready", count: 0 },
  { id: 2, name: "Short", description: "短说明 gjpqy_", status: "就绪", count: null },
];
const makeColumns = (english: boolean): TableColumn<Row>[] => [
  { key: "id", title: english ? "ID" : "编号", dataIndex: "id", width: 64, fixed: "left" },
  { key: "name", title: english ? "Name" : "名称", dataIndex: "name",
    width: 240, minWidth: 180, maxWidth: 260, grow: 1, fixed: "left",
    shrinkPriority: 1, ellipsis: { rows: 2, tooltip: true } },
  { key: "description", title: english ? "Description" : "说明", dataIndex: "description",
    width: 280, minWidth: 160, maxWidth: 320, grow: 1,
    shrinkPriority: 0, ellipsis: { rows: 2, tooltip: true } },
  { key: "status", title: english ? "Status" : "状态", dataIndex: "status",
    width: 96, minWidth: 96, grow: 1, growPriority: 1, shrink: 0 },
  { key: "count", title: english ? "Count" : "数量", dataIndex: "count",
    width: 96, minWidth: 96, grow: 1, growPriority: 1, shrink: 0 },
  { key: "action", title: english ? "Action" : "操作", width: 88, fixed: "right",
    render: () => <Button type="text">Open</Button> },
];
function App() {
  const [width, setWidth] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [english, setEnglish] = useState(false);
  const [header, setHeader] = useState(true);
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [short, setShort] = useState(false);
  const [wideText, setWideText] = useState(false);
  const columns = makeColumns(english);
  const records = empty ? [] : short ? rows.map((row) => ({ ...row, name: "Short" })) : rows;
  const table = (label: string, custom = false) => <Table columnCustomization={{ resize: true }} aria-label={label} rowKey="id"
    columns={columns} dataSource={records} fixedBreakpoint={640} emptyPadding={36}
    emptyCell="-" showHeader={header}
    loading={{ spinning: loading, scope: "body", tip: "数据加载中" }}
    empty={custom ? <Empty description="自定义空态" /> : undefined} />;
  return <>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      <Button onClick={() => setWidth(width === undefined ? 640 : width === 640 ? 641 : undefined)}>切换容器</Button>
      <Button onClick={() => setLoading(!loading)}>切换加载</Button>
      <Button onClick={() => setEmpty(!empty)}>切换空态</Button>
      <Button onClick={() => setEnglish(!english)}>切换语言</Button>
      <Button onClick={() => setHeader(!header)}>切换表头</Button>
      <Button onClick={() => setShort(!short)}>切换文本</Button>
      <Button onClick={() => setModal(true)}>打开弹窗</Button>
      <Button onClick={() => setDrawer(true)}>打开抽屉</Button>
      <Button onClick={() => setWideText(!wideText)}>切换文本容器</Button>
    </div>
    <section id="main" style={{ width: width ?? "100%", maxWidth: "100%" }}>{table("标准列表")}</section>
    <section id="custom" style={{ marginTop: 24 }}>{table("自定义列表", true)}</section>
    <section style={{ width: wideText ? 900 : 120, maxWidth: "100%", marginTop: 24 }}>
      <Table aria-label="动态文本测量" rowKey="id" columns={[
        { key: "name", title: "文本", dataIndex: "name", minWidth: 100, grow: 1,
          ellipsis: { rows: 2, tooltip: true } },
      ]} dataSource={[{ id: 1, name: "gjpqy_ 中文名称需要在容器变化后重新测量" }]} />
    </section>
    <Modal open={modal} title="弹窗列表" onCancel={() => setModal(false)} footer={null}
      width="min(900px, calc(100vw - 32px))">{table("弹窗表格")}</Modal>
    <Drawer open={drawer} title="抽屉列表" onClose={() => setDrawer(false)}
      width="min(900px, 100vw)">{table("抽屉表格", true)}</Drawer>
  </>;
}
createRoot(document.getElementById("root")!).render(<App />);
