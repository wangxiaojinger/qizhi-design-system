import { useCallback, useMemo, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import {
  Button, Empty, Modal, Space, Switch, Table, Tag, defaultColumnLayout,
  type TableColumn, type TableColumnLayoutState,
  type TableSize,
} from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";

interface Model {
  key: string;
  name: string;
  description: string;
  status: string;
  calls: number | null;
  enabled: boolean;
  updatedAt: string;
}

const names = [
  "Qways-R1-Enterprise", "Qways Chat Pro", "Qways Vision", "Qways Embedding",
  "Qways Code", "Qways Translate",
];
const models: Model[] = names.map((name, index) => ({
  key: `catalog-${index + 1}`,
  name,
  description: index === 0
    ? "面向企业知识问答、复杂任务推理和工具调用的模型。支持多语言上下文及结构化输出，"
      + "适合需要完整保留业务指令、长文本分析与可靠响应的工作流。"
      + "实际接入时请结合业务权限、模型能力及服务可用性选择，不将演示数据作为线上配置。"
    : "面向业务工作流的模型服务，支持按场景选择与接入。",
  status: index === 2 ? "维护中" : "可用",
  calls: index === 0 ? 0 : index === 1 ? null : 1200 * index,
  enabled: index % 2 === 1,
  updatedAt: `2026-10-${27 - index} 10:30`,
}));

const switches = [
  ["border", "边框"], ["borderCell", "单元格边框"], ["hover", "悬浮高亮"],
  ["checkbox", "复选框"], ["loading", "加载中"], ["showHeader", "表头"],
  ["reorder", "列移动"], ["resize", "列调宽"], ["visibility", "列显隐"],
  ["twoLines", "两行省略"], ["tooltip", "全文提示"],
  ["breakpoint", "容器固定列断点"], ["customEmpty", "自定义空态"], ["empty", "无数据"],
] as const;

export default function PropsDemo() {
  const [props, setProps] = useState({
    border: false, borderCell: false, hover: true, checkbox: false, loading: false,
    showHeader: true, reorder: false, resize: false, visibility: false,
    twoLines: true, tooltip: true, breakpoint: true, customEmpty: false, empty: false,
  });
  const [size, setSize] = useState<TableSize>("default");
  const [toolbarSlot, setToolbarSlot] = useState<HTMLSpanElement | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [lastEvent, setLastEvent] = useState("尚无交互回调");
  const columns = useMemo<TableColumn<Model>[]>(() => [
    {
      key: "name", title: "模型名称", dataIndex: "name", fixed: "left",
      width: 220, minWidth: 180, maxWidth: 260, grow: 1, shrink: 1,
      shrinkPriority: 1, movable: false, hideable: false,
    },
    {
      key: "description", title: "说明", dataIndex: "description",
      width: 240, minWidth: 180, maxWidth: 320, grow: 1, shrink: 1,
      growPriority: 0, shrinkPriority: 0,
      ellipsis: props.twoLines ? { rows: 2, tooltip: props.tooltip } : false,
    },
    {
      key: "status", title: "状态", dataIndex: "status", width: 128, minWidth: 128,
      grow: 1, growPriority: 1, shrink: 0,
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (_value, model) => <Tag>{model.status}</Tag>,
    },
    {
      key: "calls", title: "调用量", dataIndex: "calls", width: 112, minWidth: 112,
      grow: 1, growPriority: 1, shrink: 0,
    },
    {
      key: "enabled", title: "接入状态", dataIndex: "enabled", width: 128, minWidth: 128,
      grow: 1, growPriority: 1, shrink: 0,
      render: (_value, model) => model.enabled ? "已开通" : "未开通",
    },
    {
      key: "updatedAt", title: "更新时间", dataIndex: "updatedAt", align: "left",
      width: 152, minWidth: 152, grow: 1, growPriority: 1, shrink: 0,
    },
    {
      key: "action", title: "操作", width: 80, minWidth: 80, maxWidth: 80, fixed: "right",
      layoutRole: "action", movable: false, hideable: false, resizable: false,
      render: (_value, model) => (
        <Button type="text" onClick={() => setSelectedModel(model)}>详情</Button>
      ),
    },
  ], [props.twoLines, props.tooltip]);
  const [layout, setLayout] = useState<TableColumnLayoutState>(() => defaultColumnLayout(columns));
  const renderSettings = useCallback((trigger: ReactElement) => (
    toolbarSlot ? createPortal(trigger, toolbarSlot) : null
  ), [toolbarSlot]);
  const toggle = (key: keyof typeof props) => {
    setProps((value) => ({ ...value, [key]: !value[key] }));
  };

  return (
    <div className="table-props-demo">
      <fieldset className="table-demo-config">
        <legend>示例属性配置（不属于业务工具栏）</legend>
        <div className="table-props-demo__controls">
          {switches.map(([key, label]) => (
            <label key={key}>
              {label}
              <Switch size="small" checked={props[key]} aria-label={label}
                onChange={() => toggle(key)} />
            </label>
          ))}
        </div>
      </fieldset>
      <DemoSegmentedControl
        aria-label="表格尺寸"
        value={size}
        options={[
          { label: "默认", value: "default" },
          { label: "中等", value: "middle" },
          { label: "小", value: "small" },
        ]}
        onChange={setSize}
      />
      <p style={{ margin: 0, color: "var(--color-text-3)" }}>
        单元格上下内边距：默认 16px、中等 12px、小 8px；行高随内容撑开。
      </p>
      <div style={{ minWidth: 0 }}>
        <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }}>
          <strong>模型目录</strong>
          <span ref={setToolbarSlot} />
        </Space>
        <p style={{ marginTop: 0, color: "var(--color-text-3)" }}>演示数据，不代表真实服务</p>
        <Table
          aria-label="属性预览表格"
          rowKey="key"
          columns={columns}
          dataSource={props.empty ? [] : models}
          size={size}
          border={props.border}
          borderCell={props.borderCell}
          hover={props.hover}
          loading={{ spinning: props.loading, scope: "body", tip: "模型加载中" }}
          ellipsis={props.twoLines ? { rows: 2, tooltip: props.tooltip } : false}
          showHeader={props.showHeader}
          empty={props.customEmpty ? <Empty description="暂无匹配的模型" /> : undefined}
          fixedBreakpoint={props.breakpoint ? 640 : false}
          columnCustomization={{
            reorder: props.reorder, resize: props.resize,
            visibility: props.visibility, renderSettings,
          }}
          columnLayout={layout}
          onColumnLayoutChange={(next, meta) => {
            setLayout(next);
            setLastEvent(`布局变更：${meta.reason}`);
          }}
          onSortChange={(order) => setLastEvent(`排序：${order ?? "取消"}`)}
          rowSelection={props.checkbox ? {
            onChange: (keys) => setLastEvent(`选择：${keys.length} 个模型`),
          } : undefined}
          pagination={{
            pageSize: 3,
            onChange: (page) => setLastEvent(`分页：第 ${page} 页`),
          }}
        />
      </div>
      <details>
        <summary>前后端接入说明（开发示例）</summary>
        <Button size="small" onClick={() => {
          setLayout(defaultColumnLayout(columns));
          setLastEvent("布局恢复默认");
        }}>恢复默认布局</Button>
        <p>本例使用本地数据。搜索、接口请求、服务端排序和权限校验由业务实现。</p>
        <p>
          onSortChange、rowSelection.onChange、pagination.onChange 提供交互回调；
          onColumnLayoutChange 先更新本地布局，再由业务异步保存，不等待网络完成再更新界面。
        </p>
        <p>本例的 sorter 和分页为客户端处理，不表示已实现服务端数据协议。</p>
        <output aria-live="polite">{lastEvent}</output>
      </details>
      <Modal open={selectedModel !== null} title="模型详情"
        onCancel={() => setSelectedModel(null)} onOk={() => setSelectedModel(null)}
        okText="关闭" destroyOnHidden>
        {selectedModel ? <>
          <p>{selectedModel.name}</p>
          <p>{selectedModel.description}</p>
          <p>接入状态：{selectedModel.enabled ? "已开通" : "未开通"}</p>
        </> : null}
      </Modal>
    </div>
  );
}
