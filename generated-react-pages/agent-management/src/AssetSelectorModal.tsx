import { useEffect, useMemo, useState } from "react";
import { Input, Modal, Table, Tag } from "@wangxiaojinger/qizhi-react";
import type { TableColumn, TableRowKey } from "@wangxiaojinger/qizhi-react";
import { MOCK_MCPS, MOCK_SKILLS } from "./mockData";
import type { McpRecord, SkillRecord } from "./types";

type AssetRecord = SkillRecord | McpRecord;

interface AssetSelectorModalProps {
  kind: "skill" | "mcp";
  open: boolean;
  selectedIds: string[];
  onCancel: () => void;
  onConfirm: (records: AssetRecord[]) => void;
}

const isMcp = (record: AssetRecord): record is McpRecord => "status" in record;

export function AssetSelectorModal({
  kind,
  open,
  selectedIds,
  onCancel,
  onConfirm,
}: AssetSelectorModalProps) {
  const [keyword, setKeyword] = useState("");
  const [temporaryIds, setTemporaryIds] = useState<TableRowKey[]>(selectedIds);
  const source: AssetRecord[] = kind === "skill" ? MOCK_SKILLS : MOCK_MCPS;

  useEffect(() => {
    if (!open) return;
    setKeyword("");
    setTemporaryIds(selectedIds);
  }, [open, selectedIds]);

  const data = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return source.filter((record) => !normalized || record.name.toLowerCase().includes(normalized));
  }, [keyword, source]);

  const columns: TableColumn<AssetRecord>[] = [
    { key: "name", title: kind === "skill" ? "Skill 名称" : "MCP 名称", dataIndex: "name", width: 150 },
    { key: "version", title: "版本号", dataIndex: "version", width: 90 },
    ...(kind === "mcp" ? [
      {
        key: "status",
        title: "服务状态",
        width: 100,
        render: (_: unknown, record: AssetRecord) => isMcp(record) ? (
          <Tag color={record.status === "运行中" ? "green" : "red"}>{record.status}</Tag>
        ) : null,
      } as TableColumn<AssetRecord>,
      {
        key: "tools",
        title: "Tools",
        width: 80,
        render: (_: unknown, record: AssetRecord) => isMcp(record) ? record.tools : "-",
      } as TableColumn<AssetRecord>,
    ] : []),
    { key: "project", title: "所属项目", dataIndex: "project", width: 120 },
    { key: "creator", title: "创建人", dataIndex: "creator", width: 120 },
    ...(kind === "skill" ? [{
      key: "summary", title: "简介", width: 220,
      render: (_: unknown, record: AssetRecord) => "summary" in record ? record.summary : "-",
    } as TableColumn<AssetRecord>] : []),
  ];

  return (
    <Modal
      open={open}
      title={kind === "skill" ? "选择 Skill" : "选择 MCP"}
      width={820}
      okText="确认"
      cancelText="取消"
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => onConfirm(source.filter((record) => temporaryIds.includes(record.id)))}
    >
      <div className="agent-page-selector">
        <Input
          allowClear
          placeholder={kind === "skill" ? "搜索 Skill 名称" : "搜索 MCP 名称"}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        {kind === "mcp" ? (
          <span className="agent-page-selector-tip">异常 MCP 不可选择，仅用于演示禁用状态。</span>
        ) : null}
        <Table
          aria-label={kind === "skill" ? "Skill 选择列表" : "MCP 选择列表"}
          rowKey="id"
          columns={columns}
          dataSource={data}
          scrollX={kind === "mcp" ? 760 : 680}
          pagination={false}
          rowSelection={{
            selectedRowKeys: temporaryIds,
            onChange: setTemporaryIds,
            getCheckboxProps: (record) => ({ disabled: isMcp(record) && !record.selectable }),
          }}
        />
      </div>
    </Modal>
  );
}

