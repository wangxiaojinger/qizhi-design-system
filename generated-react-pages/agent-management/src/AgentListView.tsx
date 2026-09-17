import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Empty,
  Input,
  Pagination,
  Radio,
  RefreshIcon,
  Select,
  Table,
  Tag,
  Typography,
} from "@wangxiaojinger/qizhi-react";
import type { RadioValue, SelectRawValue, TableColumn, TableSortOrder } from "@wangxiaojinger/qizhi-react";
import type { AgentFilters, AgentRecord, PaginatedAgents } from "./types";

interface AgentListViewProps {
  filters: AgentFilters;
  page: PaginatedAgents;
  current: number;
  pageSize: number;
  onFiltersChange: (next: Partial<AgentFilters>) => void;
  onCurrentChange: (current: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRefresh: () => void;
  onCreate: () => void;
  onCopy: (agent: AgentRecord) => void;
  onDetail: (agent: AgentRecord) => void;
  onEdit: (agent: AgentRecord) => void;
  onDelete: (agent: AgentRecord) => void;
}

const PROJECT_OPTIONS = [
  { label: "全部", value: "" },
  { label: "基础-启智", value: "基础-启智" },
  { label: "模型服务", value: "模型服务" },
  { label: "智算平台", value: "智算平台" },
];

export function AgentListView(props: AgentListViewProps) {
  const {
    filters, page, current, pageSize, onFiltersChange,
    onCurrentChange, onPageSizeChange, onRefresh,
    onCreate, onCopy, onDetail, onEdit, onDelete,
  } = props;
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const columns: TableColumn<AgentRecord>[] = [
    {
      key: "name", title: "Agent 名称", dataIndex: "name", width: 190,
      render: (_, agent) => (
        <div className="agent-page-name-cell">
          <span className="agent-page-agent-mark" aria-hidden="true">A</span>
          <span className="agent-page-agent-name">{agent.name}</span>
        </div>
      ),
    },
    { key: "version", title: "版本号", width: 76, render: (_, agent) => agent.currentVersion },
    { key: "project", title: "所属项目", dataIndex: "project", width: 112 },
    {
      key: "tags", title: "标签", dataIndex: "tags", width: 96,
      render: (_, agent) => agent.tags.length ? (
        <div className="agent-page-tag-list">
          {agent.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
        </div>
      ) : "-",
    },
    {
      key: "description", title: "描述", dataIndex: "description", width: 180,
      render: (_, agent) => (
        <span className="agent-page-description" title={agent.description}>{agent.description}</span>
      ),
    },
    {
      key: "creator", title: "创建人", dataIndex: "creator", width: 122,
      render: (_, agent) => (
        <div className="agent-page-creator">
          <Avatar
            size="mini"
            className={`agent-page-avatar agent-page-avatar--${agent.creator === "inspire-admin" ? "primary" : "secondary"}`}
          >
            {agent.creator.slice(0, 1).toUpperCase()}
          </Avatar>
          <span>{agent.creator}</span>
        </div>
      ),
    },
    {
      key: "updatedAt", title: "更新时间", dataIndex: "updatedAt", width: 156,
      sorter: (left, right) => new Date(left.updatedAt.replace(" ", "T")).getTime()
        - new Date(right.updatedAt.replace(" ", "T")).getTime(),
      defaultSortOrder: "descend",
    },
    {
      key: "actions", title: "操作", fixed: "right", width: 220,
      render: (_, agent) => (
        <div className="agent-page-row-actions">
          <Button className="agent-page-row-action-button" type="text" size="mini" onClick={() => onCopy(agent)}>复制</Button>
          <Button className="agent-page-row-action-button" type="text" size="mini" onClick={() => onDetail(agent)}>详情</Button>
          <Button className="agent-page-row-action-button" type="text" size="mini" onClick={() => onEdit(agent)}>编辑</Button>
          <Button className="agent-page-row-action-button agent-page-row-action-button--delete" type="text" size="mini" onClick={() => onDelete(agent)}>删除</Button>
        </div>
      ),
    },
  ];
  const isMobile = viewportWidth <= 600;
  const isCompact = viewportWidth <= 1280;
  const visibleColumns = isMobile
    ? columns
      .filter((column) => column.key === "name" || column.key === "actions")
      .map((column) => column.key === "name"
        ? { ...column, width: 155 }
        : { ...column, width: 164 })
    : isCompact
      ? columns
        .filter((column) => ["name", "version", "project", "updatedAt", "actions"].includes(column.key))
        .map((column) => column.key === "actions" ? { ...column, width: 220 } : column)
      : columns;

  const handleSortChange = (order: TableSortOrder) => {
    onFiltersChange({ sortDirection: order === "ascend" ? "ascend" : "descend" });
  };

  return (
    <section className="agent-page-list" aria-labelledby="agent-list-title">
      <div className="agent-page-list-header">
        <Typography.Title id="agent-list-title" heading={5}>Agent 管理列表</Typography.Title>
      </div>

      <div className="agent-page-toolbar">
        <div className="agent-page-toolbar-group">
          <Radio.Group
            aria-label="Agent 范围"
            type="button"
            value={filters.scope}
            options={[{ label: "我创建的", value: "mine" }, { label: "全部", value: "all" }]}
            onChange={(value: RadioValue) => onFiltersChange({ scope: value as AgentFilters["scope"] })}
          />
          <Input
            className="agent-page-search"
            allowClear
            placeholder="输入关键字搜索"
            value={filters.keyword}
            onChange={(event) => onFiltersChange({ keyword: event.target.value })}
            aria-label="搜索 Agent 名称"
          />
          <Select
            className="agent-page-project-filter"
            aria-label="所属项目筛选"
            value={filters.project}
            options={PROJECT_OPTIONS}
            onChange={(value: SelectRawValue | undefined) => onFiltersChange({ project: String(value ?? "") })}
          />
        </div>
        <div className="agent-page-toolbar-actions">
          <Button iconOnly icon={<RefreshIcon size={16} />} aria-label="刷新" onClick={onRefresh} />
          <Button type="primary" onClick={onCreate}>+ 新建 Agent</Button>
        </div>
      </div>

      <Table
        className="agent-page-table"
        aria-label="Agent 管理列表"
        rowKey="id"
        columns={visibleColumns}
        dataSource={page.items}
        pagination={false}
        empty={<Empty description="未找到符合条件的 Agent" />}
        onSortChange={handleSortChange}
      />
      <Pagination
        className="agent-page-pagination"
        total={page.total}
        current={current}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        showTotal={(_, range) => `第 ${range[0]}-${range[1]} 条/共 ${page.total} 条`}
        showPageSize
        showJumper
        onChange={(nextCurrent) => onCurrentChange(nextCurrent)}
        onPageSizeChange={(nextPageSize) => onPageSizeChange(nextPageSize)}
        aria-label="Agent 列表分页"
      />
    </section>
  );
}
