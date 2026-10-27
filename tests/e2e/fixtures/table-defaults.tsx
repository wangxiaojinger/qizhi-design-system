import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Table } from "../../../packages/qizhi-react/src/table/Table";
import type { TableColumn } from "../../../packages/qizhi-react/src/table/Table.types";
import { Modal } from "../../../packages/qizhi-react/src/modal/Modal";
import { Drawer } from "../../../packages/qizhi-react/src/drawer/Drawer";
import { Button } from "../../../packages/qizhi-react/src/button/Button";
import "../../../packages/qizhi-tokens/dist/style.css";

type Row = { id: number; name: string; description: string | null; updatedAt: string };
const rows: Row[] = [
  { id: 0, name: "模型名称_".repeat(16), description: "模型说明包含完整业务上下文和使用边界，".repeat(16), updatedAt: "2026-10-27 10:30" },
  { id: 1, name: "短名称", description: null, updatedAt: "2026-10-26 10:30" },
];
const columns: TableColumn<Row>[] = [
  { key: "id", title: "编号", dataIndex: "id", width: 80, fixed: "left" },
  { key: "name", title: "模型名称", dataIndex: "name", width: 180, minWidth: 140, maxWidth: 240, grow: 1, fixed: "left", hideable: false },
  { key: "description", title: "模型说明", dataIndex: "description", width: 220, minWidth: 180, maxWidth: 320, grow: 2 },
  { key: "updatedAt", title: "更新时间", dataIndex: "updatedAt", width: 168, minWidth: 168, maxWidth: 168, align: "left", shrink: 0 },
  { key: "action", title: "操作", width: 88, minWidth: 88, maxWidth: 88, fixed: "right", resizable: false,
    layoutRole: "action", hideable: false, movable: false, render: () => <Button type="text">详情</Button> },
];

function App() {
  const [narrow, setNarrow] = useState(false);
  const [extra, setExtra] = useState(false);
  const [resize, setResize] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  return <>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
      <Button onClick={() => setNarrow(!narrow)}>改变容器</Button>
      <Button onClick={() => setExtra(!extra)}>开启移动显隐</Button>
      <Button onClick={() => setResize(!resize)}>切换调宽</Button>
      <Button onClick={() => setLoading(!loading)}>切换加载</Button>
      <Button onClick={() => setEmpty(!empty)}>切换空态</Button>
      <Button onClick={() => setModal(true)}>打开弹窗</Button>
      <Button onClick={() => setDrawer(true)}>打开抽屉</Button>
    </div>
    <div id="plain" style={{ width: narrow ? 480 : undefined, maxWidth: "100%", minWidth: 0 }}>
      <Table rowKey="id" aria-label="最小默认表格" columns={columns} dataSource={empty ? [] : rows}
        loading={loading}
        columnCustomization={extra ? { resize, reorder: true, visibility: true } : resize ? { resize: true } : undefined}
        onColumnLayoutChange={(layout, meta) => setEvents((previous) => [...previous, JSON.stringify({ layout, meta })])} />
    </div>
    <output data-testid="events" style={{ display: "block", overflowWrap: "anywhere" }}>{JSON.stringify(events)}</output>
    <div id="budget" style={{ width: 240, maxWidth: "100%" }}>
      <Table border columnCustomization={{ resize: true }} rowKey="id" aria-label="边框预算表格" dataSource={rows}
        columns={[{ key: "name", title: "名称", dataIndex: "name", width: 120, minWidth: 120, grow: 1 }]} />
    </div>
    <h2>业务显式覆盖</h2>
    <div id="override" style={{ maxWidth: "100%", minWidth: 0 }}>
      <Table rowKey="id" aria-label="显式覆盖表格" columns={columns} dataSource={rows}
        border={false} hover={false} ellipsis={false} fixedBreakpoint={false}
        columnCustomization={{ resize: false }} />
    </div>
    <Modal open={modal} title="默认表格弹窗" width={800} onCancel={() => setModal(false)} onOk={() => setModal(false)}>
      <Table rowKey="id" aria-label="弹窗最小默认表格" columns={columns} dataSource={rows} />
    </Modal>
    <Drawer open={drawer} title="默认表格抽屉" width={520} onClose={() => setDrawer(false)}>
      <Table rowKey="id" aria-label="抽屉最小默认表格" columns={columns} dataSource={rows} />
    </Drawer>
  </>;
}
createRoot(document.getElementById("root")!).render(<App />);
