import { Fragment, useState } from "react";
import { Button } from "../button/Button";
import { Divider } from "../divider/Divider";
import { Dropdown } from "../dropdown/Dropdown";
import {
  AgentCustomDeploymentIcon,
  AgentDebugIcon,
  AiImageIcon,
  ArchiveIcon,
  ComputeQuotaManagementIcon,
  ComputeTypeGroupManagementIcon,
  DatasetIcon,
  DistributedTrainingIcon,
  EvaluationReportIcon,
  EvaluationTaskManagementIcon,
  ExpandIcon,
  FileIcon,
  FolderClosedIcon,
  HomeIcon,
  HpcTaskIcon,
  ImageIcon,
  InteractiveModelingIcon,
  McpIcon,
  ModelIcon,
  RuntimeIcon,
  SandboxIcon,
  SchedulingConfigurationIcon,
  SkillIcon,
} from "../icon";
import { Menu } from "../menu/Menu";
import type {
  SideNavigationGroup,
  SideNavigationProps,
  SideNavigationVariant,
} from "./SideNavigation.types";

const defaultWorkspaces = [
  "AI4S_DEV_public_workspace",
  "上海人工智能实验室-模型研发空间",
  "启智公共云长名称测试空间",
] as const;

const customModelGroups: readonly SideNavigationGroup[] = [
  { title: "模型开发与训练", items: [
    { key: "interactive", label: "交互式建模", icon: <InteractiveModelingIcon /> },
    { key: "distributed", label: "分布式训练", icon: <DistributedTrainingIcon /> },
    { key: "high-performance", label: "高性能计算", icon: <HpcTaskIcon /> },
    { key: "visual-modeling", label: "可视化建模", icon: <ModelIcon />, disabled: true },
  ] },
  { title: "模型评测", items: [
    { key: "evaluation-task", label: "评测任务", icon: <EvaluationTaskManagementIcon />, disabled: true },
    { key: "evaluation-report", label: "评测报告", icon: <EvaluationReportIcon />, disabled: true },
  ] },
  { title: "AI资产管理", items: [
    { key: "datasets", label: "数据集", icon: <DatasetIcon />, disabled: true },
    { key: "files", label: "文件", icon: <FolderClosedIcon /> },
    { key: "images", label: "镜像管理", icon: <ImageIcon /> },
    { key: "model-repository", label: "模型仓库", icon: <ArchiveIcon /> },
    { key: "evaluation-task-alt", label: "评测task", icon: <EvaluationTaskManagementIcon />, disabled: true },
  ] },
  { title: "空间管理", items: [] },
];

const serviceGroups: readonly SideNavigationGroup[] = [
  { title: "推理部署", items: [
    { key: "model-deployment", label: "模型部署", icon: <ModelIcon /> },
    { key: "online-inference", label: "在线推理", icon: <HpcTaskIcon /> },
  ] },
  { title: "AI资产管理", items: [
    { key: "service-files", label: "文件", icon: <FolderClosedIcon /> },
    { key: "service-images", label: "镜像管理", icon: <ImageIcon /> },
    { key: "service-models", label: "模型仓库", icon: <ArchiveIcon /> },
  ] },
  { title: "空间管理", items: [
    { key: "quota", label: "计算配额管理", icon: <DatasetIcon /> },
    { key: "compute-groups", label: "计算类型组", icon: <HpcTaskIcon /> },
    { key: "schedule", label: "调度配置", icon: <DistributedTrainingIcon /> },
  ] },
];

const agentGroups: readonly SideNavigationGroup[] = [
  { title: "Agent 资产库", items: [
    { key: "skills", label: "Skills 工坊", icon: <SkillIcon /> },
    { key: "mcp", label: "MCP 托管", icon: <McpIcon /> },
    { key: "agent-item", label: "Agent", icon: <AgentDebugIcon /> },
  ] },
  { title: "构建", items: [
    { key: "agent-runtime", label: "Agent 运行实例", icon: <RuntimeIcon /> },
    { key: "agent-deployment", label: "Agent 自定义部署", icon: <AgentCustomDeploymentIcon /> },
  ] },
  { title: "运行&治理", items: [
    { key: "sandbox", label: "Sandbox", icon: <SandboxIcon /> },
  ] },
  { title: "AI资产管理", items: [
    { key: "agent-files", label: "文件", icon: <FileIcon /> },
    { key: "agent-images", label: "镜像管理", icon: <AiImageIcon /> },
  ] },
  { title: "空间管理", items: [
    { key: "agent-quota", label: "计算配额管理", icon: <ComputeQuotaManagementIcon /> },
    { key: "agent-compute-groups", label: "计算类型组", icon: <ComputeTypeGroupManagementIcon /> },
    { key: "agent-schedule", label: "调度配置", icon: <SchedulingConfigurationIcon /> },
  ] },
];

const operationsGroups: readonly SideNavigationGroup[] = [
  { title: "资源管理", items: [
    { key: "resource-overview", label: "资源概览", icon: <HomeIcon /> },
    { key: "space-management", label: "空间管理", icon: <DatasetIcon /> },
    { key: "resource-group", label: "资源组管理", icon: <ArchiveIcon /> },
    { key: "node-management", label: "节点管理", icon: <HpcTaskIcon /> },
  ] },
  { title: "管理中心", items: [
    { key: "member-management", label: "成员管理", icon: <InteractiveModelingIcon /> },
    { key: "operation-audit", label: "操作审计", icon: <EvaluationReportIcon /> },
    { key: "billing", label: "计费管理", icon: <DistributedTrainingIcon /> },
    { key: "project-bill", label: "项目账单", icon: <FolderClosedIcon /> },
    { key: "resource-price", label: "资源价格配置", icon: <ModelIcon /> },
    { key: "approval", label: "审批中心", icon: <EvaluationTaskManagementIcon /> },
    { key: "project-list", label: "项目列表", icon: <DatasetIcon /> },
  ] },
];

const groupsByVariant: Record<SideNavigationVariant, readonly SideNavigationGroup[]> = {
  "custom-model": customModelGroups,
  "model-service": serviceGroups,
  agent: agentGroups,
  explore: [{ title: "", items: [
    { key: "model-square", label: "模型广场", icon: <ModelIcon /> },
  ] }],
  operations: operationsGroups,
};

const selectedKeyByVariant: Record<SideNavigationVariant, string> = {
  "custom-model": "interactive",
  "model-service": "model-deployment",
  agent: "skills",
  explore: "model-square",
  operations: "resource-overview",
};

const joinClassNames = (...names: Array<string | undefined>) =>
  names.filter(Boolean).join(" ");

export function SideNavigation({
  variant = "custom-model",
  groups,
  selectedKey,
  defaultSelectedKey,
  onSelect,
  workspaces = defaultWorkspaces,
  workspace,
  defaultWorkspace,
  onWorkspaceChange,
  className,
  "aria-label": ariaLabel = "空间导航",
}: SideNavigationProps) {
  const controlledWorkspace = workspace !== undefined;
  const initialWorkspace = defaultWorkspace
    ?? (variant === "custom-model" ? workspaces[0] : "测试空间-1")
    ?? "";
  const [internalWorkspace, setInternalWorkspace] = useState(initialWorkspace);
  const currentWorkspace = controlledWorkspace ? workspace : internalWorkspace;
  const currentGroups = groups ?? groupsByVariant[variant];
  const showOverview = groups === undefined
    && variant !== "operations"
    && variant !== "explore";
  const workspaceMenu = (
    <Dropdown.Menu
      className="qizhi-side-navigation__workspace-menu"
      onClickMenuItem={(key) => {
        if (!controlledWorkspace) setInternalWorkspace(key);
        onWorkspaceChange?.(key);
      }}
    >
      {workspaces.map((option) => (
        <Dropdown.Item
          key={option}
          itemKey={option}
          className="qizhi-side-navigation__workspace-option"
          role="menuitemradio"
          aria-checked={currentWorkspace === option}
        >
          {option}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );

  return (
    <nav
      className={joinClassNames("qizhi-side-navigation", className)}
      aria-label={ariaLabel}
    >
      <div className="qizhi-side-navigation__content">
        <Dropdown
          className="qizhi-side-navigation__workspace-dropdown"
          trigger="click"
          position="bl"
          droplist={workspaceMenu}
        >
          <Button
            type="text"
            className="qizhi-side-navigation__workspace"
            data-tooltip={currentWorkspace}
            aria-label={`切换空间，当前${currentWorkspace}`}
          >
            <span className="qizhi-side-navigation__workspace-content">
              <strong className="qizhi-side-navigation__workspace-label">
                {currentWorkspace}
              </strong>
              <ExpandIcon className="qizhi-side-navigation__workspace-icon" />
            </span>
          </Button>
        </Dropdown>
        <Menu
          key={variant}
          selectedKey={selectedKey}
          defaultSelectedKey={defaultSelectedKey ?? selectedKeyByVariant[variant]}
          onSelect={onSelect}
          aria-label={ariaLabel}
          className="qizhi-side-navigation__menu"
        >
          {showOverview ? (
            <Menu.Item
              itemKey="overview"
              icon={<HomeIcon className="qizhi-side-navigation__icon" />}
              className="qizhi-side-navigation__item"
            >
              空间概览
            </Menu.Item>
          ) : null}
          {currentGroups.map((group, groupIndex) => (
            <Fragment key={`${String(group.title)}-${groupIndex}`}>
              {group.title || variant !== "explore" ? (
                <Divider className="qizhi-side-navigation__group-divider" />
              ) : null}
              <Menu.Group title={group.title} className="qizhi-side-navigation__group">
                {group.items.map((item) => (
                  <Menu.Item
                    key={item.key}
                    itemKey={item.key}
                    icon={item.icon == null ? undefined : (
                      <span className="qizhi-side-navigation__icon">{item.icon}</span>
                    )}
                    disabled={item.disabled}
                    className="qizhi-side-navigation__item"
                  >
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu.Group>
            </Fragment>
          ))}
        </Menu>
      </div>
    </nav>
  );
}
