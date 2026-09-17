import { useState, type ReactNode } from "react";
import {
  Breadcrumb,
  Button,
  CopyIcon,
  DetailHeader,
  Message,
  Segmented,
  Table,
  Tag,
  TimeIcon,
  Typography,
  UserIcon,
} from "@wangxiaojinger/qizhi-react";
import { AgentDebugIcon } from "@wangxiaojinger/qizhi-react/icon";
import type { McpRecord, SkillRecord, AgentRecord } from "./types";
import type { SegmentedValue, TableColumn } from "@wangxiaojinger/qizhi-react";
import { getVersion } from "./agentModel";

interface AgentDetailViewProps {
  agent: AgentRecord;
  selectedVersion: string;
  onVersionChange: (version: string) => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddVersion: () => void;
}

const copyText = async (text: string) => {
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
  await navigator.clipboard.writeText(text);
};

const renderPreview = (content: string): ReactNode => content.split("\n").map((line, index) => {
  if (line.startsWith("# ")) {
    return <Typography.Title key={`${index}-${line}`} heading={5}>{line.slice(2)}</Typography.Title>;
  }
  if (line.startsWith("- ")) return <p key={`${index}-${line}`}>• {line.slice(2)}</p>;
  return line ? <p key={`${index}-${line}`}>{line}</p> : <span key={`blank-${index}`} className="agent-page-preview-space" />;
});

export function AgentDetailView({
  agent,
  selectedVersion,
  onVersionChange,
  onBack,
  onEdit,
  onDelete,
  onAddVersion,
}: AgentDetailViewProps) {
  const version = getVersion(agent, selectedVersion);
  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview");
  const path = `sdk-${agent.name} / README.md`;

  const skillColumns: TableColumn<SkillRecord>[] = [
    { key: "name", title: "Skill 名称", dataIndex: "name", width: 150 },
    { key: "version", title: "版本号", dataIndex: "version", width: 90 },
    { key: "project", title: "所属项目", dataIndex: "project", width: 120 },
    { key: "creator", title: "创建人", dataIndex: "creator", width: 120 },
    { key: "summary", title: "简介", dataIndex: "summary", width: 260 },
  ];
  const mcpColumns: TableColumn<McpRecord>[] = [
    { key: "name", title: "MCP 名称", dataIndex: "name", width: 150 },
    { key: "version", title: "版本号", dataIndex: "version", width: 90 },
    { key: "status", title: "服务状态", dataIndex: "status", width: 100 },
    { key: "tools", title: "Tools", dataIndex: "tools", width: 80 },
    { key: "project", title: "所属项目", dataIndex: "project", width: 120 },
    { key: "creator", title: "创建人", dataIndex: "creator", width: 120 },
    { key: "updatedAt", title: "更新时间", dataIndex: "updatedAt", width: 180 },
  ];

  const handleCopy = async (value: string, success: string) => {
    try {
      await copyText(value);
      Message.success(success);
    } catch {
      Message.error("复制失败，请检查浏览器权限");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([version.instructionContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${agent.name}-${version.version}.md`;
      link.click();
      URL.revokeObjectURL(url);
      Message.success("指令文件已下载");
    } catch {
      Message.error("下载失败，请重试");
    }
  };

  return (
    <section className="agent-page-detail" aria-label="Agent 详情">
      <Breadcrumb className="agent-page-breadcrumb" aria-label="详情面包屑">
        <Breadcrumb.Item>
          <Button type="text" size="small" aria-label="返回 Agent 管理列表" onClick={onBack}>Agent 管理列表</Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item current>Agent 详情</Breadcrumb.Item>
      </Breadcrumb>

      <DetailHeader
        className="agent-page-detail-header-card"
        icon={<span className="agent-page-detail-mark"><AgentDebugIcon size={24} /></span>}
        title={agent.name}
        action={(
          <div className="agent-page-detail-actions">
            <Button status="danger" onClick={onDelete}>删除</Button>
            <Button onClick={onEdit}>编辑</Button>
          </div>
        )}
        audit={(
          <div className="agent-page-detail-audit">
            <Typography.Paragraph type="secondary">{agent.description || "-"}</Typography.Paragraph>
            <div className="agent-page-detail-meta">
              <span><UserIcon size={16} />{agent.creator}</span>
              <span><TimeIcon size={16} />更新时间：{agent.updatedAt}</span>
            </div>
          </div>
        )}
        tabs={<div className="agent-page-detail-tab" role="tab" aria-selected="true">基本信息</div>}
      />

      <div className="agent-page-detail-layout">
        <aside className="agent-page-version-panel" aria-label="版本列表">
          <div className="agent-page-section-heading">
            <Typography.Title heading={5}>版本列表</Typography.Title>
            <Button type="text" size="small" onClick={onAddVersion}>+ 新增版本</Button>
          </div>
          <div className="agent-page-version-list">
            {agent.versions.map((item) => (
              <Button
                key={item.version}
                className={`agent-page-version-button ${selectedVersion === item.version ? "is-selected" : ""}`}
                type="text"
                onClick={() => onVersionChange(item.version)}
              >
                <span>{item.version}</span>
                {agent.currentVersion === item.version ? (
                  <span className="agent-page-current-version"><i aria-hidden="true" />当前版本</span>
                ) : null}
              </Button>
            ))}
          </div>
        </aside>

        <div className="agent-page-detail-content">
          <section className="agent-page-detail-section" aria-labelledby="detail-basic-title">
            <Typography.Title id="detail-basic-title" heading={5}>基本信息</Typography.Title>
            <dl className="agent-page-description-list">
              <div><dt>所属项目</dt><dd>{agent.project}</dd></div>
              <div><dt>标签</dt><dd>{agent.tags.length ? agent.tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : "-"}</dd></div>
            </dl>
          </section>

          <section className="agent-page-detail-section" aria-labelledby="detail-instruction-title">
            <div className="agent-page-section-heading">
              <Typography.Title id="detail-instruction-title" heading={5}>Agent 指令</Typography.Title>
              <Segmented
                aria-label="指令查看模式"
                value={viewMode}
                options={[{ label: "预览", value: "preview" }, { label: "Markdown", value: "markdown" }]}
                onChange={(value: SegmentedValue) => setViewMode(value as "preview" | "markdown")}
              />
            </div>
            <div className="agent-page-instruction-path">
              <code>{path}</code>
              <Button
                type="text"
                iconOnly
                icon={<CopyIcon size={16} />}
                aria-label="复制指令路径"
                onClick={() => void handleCopy(path, "指令路径已复制")}
              />
            </div>
            <div className="agent-page-instruction-actions">
              <Button onClick={() => void handleCopy(version.instructionContent, "Agent 指令已复制")}>复制</Button>
              <Button onClick={handleDownload}>下载</Button>
            </div>
            {viewMode === "preview" ? (
              <div className="agent-page-instruction-preview">{renderPreview(version.instructionContent)}</div>
            ) : (
              <pre className="agent-page-instruction-markdown"><code>{version.instructionContent}</code></pre>
            )}
          </section>

          <section className="agent-page-detail-section agent-page-detail-capabilities" aria-labelledby="detail-skill-title">
            <Typography.Title heading={5}>能力设置</Typography.Title>
            <Typography.Text id="detail-skill-title" bold>Skill</Typography.Text>
            <Table aria-label="Skill 配置列表" rowKey="id" columns={skillColumns} dataSource={version.skills} scrollX={740} pagination={false} />
            <Typography.Text id="detail-mcp-title" className="agent-page-detail-mcp-title" bold>MCP</Typography.Text>
            <Table aria-label="MCP 配置列表" rowKey="id" columns={mcpColumns} dataSource={version.mcps} scrollX={940} pagination={false} />
          </section>
        </div>
      </div>
    </section>
  );
}
