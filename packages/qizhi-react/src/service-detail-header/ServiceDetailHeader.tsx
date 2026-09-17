import { useId, useMemo, useState } from "react";
import { Avatar } from "../avatar/Avatar";
import { Button } from "../button/Button";
import { DetailHeader } from "../detail-header/DetailHeader";
import { Drawer } from "../drawer/Drawer";
import { TagIcon } from "../icon/generated/catalog/TagIcon";
import { TeamIcon } from "../icon/generated/catalog/TeamIcon";
import { TimeIcon } from "../icon/generated/catalog/TimeIcon";
import { UserPersonIcon } from "../icon/generated/catalog/UserPersonIcon";
import { Link } from "../link/Link";
import { Table } from "../table/Table";
import type { TableColumn } from "../table/Table.types";
import { Tabs } from "../tabs/Tabs";
import { Tag } from "../tag/Tag";
import { Tooltip } from "../tooltip/Tooltip";
import type {
  ServiceDetailHeaderProps,
  ServiceDetailHeaderVersion,
} from "./ServiceDetailHeader.types";
import "./serviceDetailHeader.css";

function AuditIcon({ label, children }: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip content={label} position="top" trigger={["hover", "focus"]}>
      <span className="qizhi-service-detail-header__audit-icon" aria-label={label} tabIndex={0}>
        {children}
      </span>
    </Tooltip>
  );
}

export function ServiceDetailHeader({
  icon,
  title,
  serviceId,
  framework,
  creator,
  maintainers = [],
  createdAt,
  updatedAt,
  versions,
  tabs,
  defaultOnline = true,
  defaultTab,
  defaultVersion = "V1",
  headerProps,
  version,
  versionLabel = "部署版本",
  versionReadOnly = false,
  onStatusChange,
  onVersionChange,
  onTabChange,
}: ServiceDetailHeaderProps) {
  const [online, setOnline] = useState(defaultOnline);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key);
  const [deployedVersion, setDeployedVersion] = useState(defaultVersion);
  const versionTitleId = useId();
  const currentVersion = version ?? deployedVersion;
  const versionButton = <Button type="text" size="mini" icon={<TagIcon />}
    aria-label={`查看${versionLabel} ${currentVersion}`}
    onClick={() => setDrawerOpen(true)}>{currentVersion}</Button>;
  const columns = useMemo<TableColumn<ServiceDetailHeaderVersion>[]>(() => [
    { key: "name", title: "版本名称", width: "18%", render: (_, row) => (
      <span className="qizhi-service-detail-header__version-name">{row.name}
        {row.name === currentVersion && <Tag color="blue">当前版本</Tag>}
      </span>
    ) },
    { key: "time", title: "版本构建时间", dataIndex: "time", width: "34%" },
    {
      key: "operator",
      title: "操作人",
      width: "20%",
      render: (_, row) => (
        <span className="qizhi-service-detail-header__version-person">
          <Avatar size="mini">{row.initial}</Avatar>{row.operator}
        </span>
      ),
    },
    {
      key: "action",
      title: "操作",
      width: "28%",
      render: (_, row) => versionReadOnly || row.name === currentVersion ? <span>—</span> : (
        <Link disabled={row.disabled} onClick={() => {
          setDeployedVersion(row.name);
          setDrawerOpen(false);
          onVersionChange?.(row.name);
        }}>
          {row.action}
        </Link>
      ),
    },
  ], [onVersionChange, versionReadOnly, currentVersion]);
  const audit = (
    <>
      <span><AuditIcon label="创建人"><UserPersonIcon /></AuditIcon>{creator}</span>
      {maintainers.length > 0 && <span className="qizhi-service-detail-header__maintainers">
        <AuditIcon label="服务维护者"><TeamIcon /></AuditIcon>
        <Avatar.Group size="mini" aria-label={`服务维护者：${
          maintainers.map((member) => member.name).join("、")
        }`}>
          {maintainers.map((member) => (
            <Tooltip key={member.name} content={member.name}
              trigger={["hover", "focus"]}>
              <Avatar className={`qizhi-service-detail-header__avatar--${
                member.tone ?? "primary"
              }`}>{member.initial}</Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
      </span>}
      <span><AuditIcon label="创建时间"><TimeIcon /></AuditIcon>{createdAt}</span>
      <span className="qizhi-service-detail-header__audit-divider"
        aria-hidden="true" />
      <span><span><span className="qizhi-service-detail-header__audit-label">
        更新时间：
      </span>{updatedAt}</span></span>
      {serviceId == null && framework == null && <span>{versionLabel}：{versionButton}</span>}
    </>
  );
  return (
    <>
      <DetailHeader
        icon={icon}
        title={title}
        status={{
          label: online ? "服务中" : "已下线",
          tone: online ? "online" : "offline",
        }}
        action={<Button type="secondary" onClick={() => {
          setOnline((current) => {
            onStatusChange?.(!current);
            return !current;
          });
        }}>{online ? "下线" : "上线"}</Button>}
        properties={[
          ...(serviceId != null ? [{ label: "ID", value: serviceId }] : []),
          ...(framework != null ? [{ label: "部署框架｜服务方式", value: framework }] : []),
          ...(serviceId != null || framework != null ? [{
            label: versionLabel,
            value: versionButton,
            plain: true,
          }] : []),
        ]}
        audit={audit}
        tabs={<Tabs className="qizhi-service-detail-header__tabs"
          activeKey={activeTab} renderContent={false}
          onChange={(key) => {
            setActiveTab(String(key));
            onTabChange?.(String(key));
          }}
          items={tabs.map((tab) => ({ ...tab, content: null }))} />}
        {...headerProps}
      />
      <Drawer open={drawerOpen} title="版本列表" width={960}
        onClose={() => setDrawerOpen(false)}>
        <section className="qizhi-service-detail-header__version-section"
          aria-labelledby={versionTitleId}>
          <h3 id={versionTitleId}>版本信息</h3>
          <Table columns={columns} dataSource={[...versions]} rowKey="key"
            size="middle" border hover aria-label="版本信息" />
        </section>
      </Drawer>
    </>
  );
}
