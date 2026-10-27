import { useCallback, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  defaultColumnLayout,
  normalizeColumnLayout,
  type TableColumn,
  type TableColumnLayoutMeta,
  type TableColumnLayoutState,
} from "@wangxiaojinger/qizhi-react";

export const MODEL_CATALOG_TABLE_ID = "model-catalog";
export const MODEL_CATALOG_BUSINESS_VERSION = "v1";

export interface ModelCatalogScope {
  app: string;
  user: string;
  space: string;
}

export interface ModelCatalogStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

interface ModelCatalogRow {
  key: string;
  name: string;
  modelId: string;
  provider: string;
  capabilities: string[];
  context: string;
  inputPrice: string;
  outputPrice: string;
  status: "可用" | "维护中" | "内测";
  updatedAt: string;
}

const modelRows: ModelCatalogRow[] = [
  {
    key: "chat-pro-32k",
    name: "Qways Chat Pro 32K",
    modelId: "qways/chat-pro-32k",
    provider: "Qways",
    capabilities: ["对话", "工具调用", "JSON"],
    context: "32K tokens",
    inputPrice: "¥0.12 / 1K tokens",
    outputPrice: "¥0.48 / 1K tokens",
    status: "可用",
    updatedAt: "2026-10-27 10:30",
  },
  {
    key: "reasoning-mini",
    name: "Qways Reasoning Mini",
    modelId: "qways/reasoning-mini",
    provider: "Qways",
    capabilities: ["推理", "结构化输出"],
    context: "16K tokens",
    inputPrice: "¥0.08 / 1K tokens",
    outputPrice: "¥0.32 / 1K tokens",
    status: "内测",
    updatedAt: "2026-10-26 18:20",
  },
  {
    key: "vision-flow",
    name: "Vision Flow 8K",
    modelId: "vision/flow-8k",
    provider: "Qways Vision",
    capabilities: ["图像理解", "对话"],
    context: "8K tokens",
    inputPrice: "¥0.20 / 1K tokens",
    outputPrice: "¥0.68 / 1K tokens",
    status: "可用",
    updatedAt: "2026-10-25 09:45",
  },
  {
    key: "embed-base",
    name: "Embed Base 中文版",
    modelId: "qways/embed-base-zh",
    provider: "Qways",
    capabilities: ["向量化", "检索"],
    context: "8K tokens",
    inputPrice: "¥0.03 / 1K tokens",
    outputPrice: "—",
    status: "可用",
    updatedAt: "2026-10-24 15:00",
  },
  {
    key: "translate-pro",
    name: "Translate Pro 12K",
    modelId: "qways/translate-pro-12k",
    provider: "Qways Language",
    capabilities: ["翻译", "术语保留"],
    context: "12K tokens",
    inputPrice: "¥0.06 / 1K tokens",
    outputPrice: "¥0.22 / 1K tokens",
    status: "维护中",
    updatedAt: "2026-10-22 11:10",
  },
  {
    key: "code-assist",
    name: "Code Assist 24K",
    modelId: "qways/code-assist-24k",
    provider: "Qways Code",
    capabilities: ["代码生成", "代码解释"],
    context: "24K tokens",
    inputPrice: "¥0.16 / 1K tokens",
    outputPrice: "¥0.56 / 1K tokens",
    status: "内测",
    updatedAt: "2026-10-21 16:40",
  },
];

const statusOptions = ["可用", "维护中", "内测"] as const;

const renderCapabilities = (capabilities: readonly string[]) => {
  const visible = capabilities.slice(0, 2);
  const hidden = capabilities.slice(2);
  return (
    <Space size={4}>
      {visible.map((capability) => (
        <Tooltip key={capability} content={capability} trigger={["hover", "focus"]}>
          <Tag
            size="small"
            tabIndex={0}
            style={{
              flexShrink: 0,
              maxWidth: 84,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {capability}
          </Tag>
        </Tooltip>
      ))}
      {hidden.length > 0 ? (
        <Tooltip content={hidden.join("、")} trigger={["hover", "focus"]}>
          <Tag size="small" tabIndex={0} style={{ flexShrink: 0 }}>+{hidden.length}</Tag>
        </Tooltip>
      ) : null}
    </Space>
  );
};

export const modelCatalogColumns: TableColumn<ModelCatalogRow>[] = [
  {
    key: "name",
    title: "模型名称",
    dataIndex: "name",
    settingsLabel: "模型名称",
    fixed: "left",
    width: 220,
    minWidth: 180,
    maxWidth: 260,
    grow: 1,
    shrinkPriority: 1,
    hideable: false,
  },
  {
    key: "modelId",
    title: "公开模型 ID",
    dataIndex: "modelId",
    width: 190,
    minWidth: 164,
    maxWidth: 228,
    grow: 1,
    shrinkPriority: 0,
  },
  {
    key: "provider",
    title: "供应商",
    dataIndex: "provider",
    width: 128,
    minWidth: 108,
    maxWidth: 152,
    grow: 1,
    shrinkPriority: 2,
  },
  {
    key: "capabilities",
    title: "能力",
    dataIndex: "capabilities",
    width: 204,
    minWidth: 188,
    maxWidth: 224,
    grow: 1,
    shrinkPriority: 0,
    render: (_value, model) => renderCapabilities(model.capabilities),
  },
  {
    key: "context",
    title: "上下文",
    dataIndex: "context",
    width: 132,
    minWidth: 112,
    maxWidth: 152,
    grow: 1,
    shrinkPriority: 2,
  },
  {
    key: "inputPrice",
    title: "模拟输入价格",
    dataIndex: "inputPrice",
    width: 164,
    minWidth: 148,
    maxWidth: 184,
    grow: 1,
    shrinkPriority: 1,
  },
  {
    key: "outputPrice",
    title: "模拟输出价格",
    dataIndex: "outputPrice",
    width: 164,
    minWidth: 148,
    maxWidth: 184,
    grow: 1,
    shrinkPriority: 1,
  },
  {
    key: "status",
    title: "状态",
    dataIndex: "status",
    width: 96,
    minWidth: 88,
    maxWidth: 112,
    grow: 1,
    shrink: 0,
    align: "center",
    render: (_value, model) => <Tag>{model.status}</Tag>,
  },
  {
    key: "updatedAt",
    title: "更新时间",
    dataIndex: "updatedAt",
    width: 152,
    minWidth: 140,
    maxWidth: 168,
    grow: 1,
    shrink: 0,
    align: "left",
  },
  {
    key: "action",
    title: "操作",
    settingsLabel: "操作",
    fixed: "right",
    width: 80,
    minWidth: 80,
    maxWidth: 80,
    movable: false,
    hideable: false,
    resizable: false,
    layoutRole: "action",
  },
];

export function createModelCatalogStorageKey(
  scope: ModelCatalogScope,
  tableId = MODEL_CATALOG_TABLE_ID,
  businessVersion = MODEL_CATALOG_BUSINESS_VERSION,
): string {
  return [
    "qizhi-table-layout",
    `app=${encodeURIComponent(scope.app)}`,
    `user=${encodeURIComponent(scope.user)}`,
    `space=${encodeURIComponent(scope.space)}`,
    `table=${encodeURIComponent(tableId)}`,
    `business=${encodeURIComponent(businessVersion)}`,
  ].join(":");
}

export function defaultModelCatalogLayout(): TableColumnLayoutState {
  return defaultColumnLayout(modelCatalogColumns);
}

export function readModelCatalogLayout(
  columns: readonly TableColumn<ModelCatalogRow>[],
  storage: ModelCatalogStorage | undefined,
  key: string,
): TableColumnLayoutState {
  const fallback = defaultColumnLayout(columns);
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw == null ? fallback : normalizeColumnLayout(columns, JSON.parse(raw));
  } catch {
    return fallback;
  }
}

export function saveModelCatalogLayout(
  storage: ModelCatalogStorage | undefined,
  key: string,
  layout: TableColumnLayoutState,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(layout));
    return true;
  } catch {
    return false;
  }
}

export function clearModelCatalogLayout(
  storage: ModelCatalogStorage | undefined,
  key: string,
): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const getBrowserStorage = (): ModelCatalogStorage | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const scopes = {
  "user-a": {
    label: "用户 A（个人）",
    scope: { app: "qways-model-console", user: "user-a", space: "personal-a" },
  },
  "user-b": {
    label: "用户 B（个人）",
    scope: { app: "qways-model-console", user: "user-b", space: "personal-b" },
  },
  workspace: {
    label: "工作区（协作）",
    scope: { app: "qways-model-console", user: "workspace", space: "design-collab" },
  },
} as const;

type ScopeId = keyof typeof scopes;

const scopeOptions = Object.entries(scopes).map(([value, definition]) => ({
  label: definition.label,
  value,
}));

const createModelCatalogColumns = (
  onDetails: (model: ModelCatalogRow) => void,
): TableColumn<ModelCatalogRow>[] => modelCatalogColumns.map((column) => {
  if (column.key !== "action") return column;
  return {
    ...column,
    render: (_value, model) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => onDetails(model)}>详情</Button>
      </Space>
    ),
  };
});

function ModelCatalogScopeDemo({ scope }: { scope: ModelCatalogScope }) {
  const storageKey = createModelCatalogStorageKey(scope);
  const [layout, setLayout] = useState(() => (
    readModelCatalogLayout(modelCatalogColumns, getBrowserStorage(), storageKey)
  ));
  const [toolbarSlot, setToolbarSlot] = useState<HTMLSpanElement | null>(null);
  const [provider, setProvider] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelCatalogRow | null>(null);
  const [storageMessage, setStorageMessage] = useState("");

  const handleLayoutChange = useCallback(
    (next: TableColumnLayoutState, meta: TableColumnLayoutMeta) => {
      setLayout(next);
      const storage = getBrowserStorage();
      const completed = meta.reason === "reset"
        ? clearModelCatalogLayout(storage, storageKey)
        : saveModelCatalogLayout(storage, storageKey, next);
      setStorageMessage(completed
        ? meta.reason === "reset"
          ? "已恢复默认布局并清除演示缓存。"
          : "已保存演示布局（仅当前浏览器）。"
        : meta.reason === "reset"
          ? "无法清除演示缓存；当前布局仍已恢复默认。"
          : "无法保存演示缓存；当前布局仍已更新。");
    },
    [storageKey],
  );

  const columns = useMemo(() => createModelCatalogColumns(setSelectedModel), []);
  const renderSettings = useCallback((trigger: ReactElement) => (
    toolbarSlot ? createPortal(trigger, toolbarSlot) : null
  ), [toolbarSlot]);
  const filteredRows = useMemo(() => modelRows.filter((model) => {
    const text = `${model.name} ${model.modelId}`.toLowerCase();
    return (provider === "all" || model.provider === provider)
      && (status === "all" || model.status === status)
      && text.includes(query.trim().toLowerCase());
  }), [provider, query, status]);

  return (
    <Space direction="vertical" size="medium" style={{ width: "100%", minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          padding: 12,
          border: "1px solid var(--color-border-1)",
          background: "var(--color-fill-1)",
        }}
      >
        <Input
          value={query}
          allowClear
          placeholder="搜索模型名称或公开 ID"
          aria-label="搜索模型"
          onChange={(event) => setQuery(event.target.value)}
          style={{ width: 220 }}
        />
        <Select
          aria-label="供应商筛选"
          value={provider}
          options={[
            { label: "全部供应商", value: "all" },
            ...Array.from(new Set(modelRows.map((model) => model.provider))).map((value) => ({
              label: value,
              value,
            })),
          ]}
          onChange={(value) => setProvider(String(value ?? "all"))}
          style={{ minWidth: 136 }}
        />
        <Select
          aria-label="状态筛选"
          value={status}
          options={[
            { label: "全部状态", value: "all" },
            ...statusOptions.map((value) => ({ label: value, value })),
          ]}
          onChange={(value) => setStatus(String(value ?? "all"))}
          style={{ minWidth: 116 }}
        />
        <span ref={setToolbarSlot} />
      </div>
      <p style={{ margin: 0, color: "var(--color-text-3)" }}>
        模型数据与价格均为演示，非真实报价。
      </p>
      {storageMessage ? <span role="status">{storageMessage}</span> : null}
      <Table
        aria-label="Qways 模型目录"
        rowKey="key"
        columns={columns}
        dataSource={filteredRows}
        columnCustomization={{
          reorder: true,
          resize: true,
          visibility: true,
          renderSettings,
        }}
        columnLayout={layout}
        onColumnLayoutChange={handleLayoutChange}
        fixedBreakpoint={640}
        emptyPadding={36}
        pagination={{ pageSize: 5 }}
      />
      <details>
        <summary>当前布局状态（演示）</summary>
        <Button size="small" onClick={() => handleLayoutChange(
          defaultModelCatalogLayout(), { reason: "reset" },
        )}>恢复默认布局</Button>
        <pre style={{ marginBottom: 0, color: "var(--color-text-2)" }}>
          {JSON.stringify(layout, null, 2)}
        </pre>
      </details>
      <Modal
        open={selectedModel !== null}
        title={selectedModel ? `${selectedModel.name} 详情` : "模型详情"}
        okText="关闭"
        onCancel={() => setSelectedModel(null)}
        onOk={() => setSelectedModel(null)}
        destroyOnHidden
      >
        {selectedModel ? (
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <span>公开模型 ID：{selectedModel.modelId}</span>
            <span>供应商：{selectedModel.provider}</span>
            <span>上下文：{selectedModel.context}</span>
            <span>模拟价格：{selectedModel.inputPrice} / {selectedModel.outputPrice}</span>
            <span style={{ color: "var(--color-text-3)" }}>
              这是本地演示数据，不代表任何线上模型可用性或实际报价。
            </span>
          </Space>
        ) : null}
      </Modal>
    </Space>
  );
}

export default function CustomizationDemo() {
  const [scopeId, setScopeId] = useState<ScopeId>("user-a");
  const currentScope = scopes[scopeId];
  const scopeKey = createModelCatalogStorageKey(currentScope.scope);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%", minWidth: 0 }}>
      <div>
        <h4 style={{ marginBlock: 0 }}>Qways 模型目录</h4>
        <p style={{ marginBottom: 0, color: "var(--color-text-3)" }}>
          列布局按作用域隔离；切换作用域只读取对应缓存，不会自动写入。
        </p>
      </div>
      <fieldset className="table-demo-config">
        <legend>保存恢复演示配置</legend>
        <label>
          布局作用域
          <Select
            aria-label="布局作用域"
            value={scopeId}
            options={scopeOptions}
            onChange={(value) => setScopeId(value as ScopeId)}
            style={{ minWidth: 176, marginInlineStart: 8 }}
          />
        </label>
        <p style={{ marginBottom: 0, color: "var(--color-text-3)" }}>
          当前作用域：{currentScope.label}。本示例仅在浏览器本地筛选和分页，
          不发起服务端请求。
        </p>
      </fieldset>
      <ModelCatalogScopeDemo key={scopeKey} scope={currentScope.scope} />
    </Space>
  );
}
