import { Avatar } from "../avatar/Avatar";
import { InfoIcon } from "../icon/InfoIcon";
import { Alert } from "../alert/Alert";
import { Button } from "../button/Button";
import { WarningFilledIcon } from "../icon/generated/prompt/WarningFilledIcon";
import { EyeVisibleIcon } from "../icon/EyeVisibleIcon";
import { OnlineInferenceIcon } from "../icon/generated/catalog/OnlineInferenceIcon";
import { QuickExperienceIcon } from "../icon/generated/catalog/QuickExperienceIcon";
import { TeamIcon } from "../icon/generated/catalog/TeamIcon";
import { SkillServiceIcon } from "../icon/generated/prompt/SkillServiceIcon";
import { Popover } from "../popover/Popover";
import { Tag } from "../tag/Tag";
import { Tooltip } from "../tooltip/Tooltip";
import { useLocale } from "../locale/LocaleProvider";
import type { KeyboardEvent, ReactNode } from "react";
import type {
  ConfirmationSummaryProps,
  ConfirmationSummaryGroupProps,
  BillingBudgetCardProps,
  FinancialModelCardProps,
  SkillServiceCardProps,
  MarketplaceModelCardProps,
  ModelCardProps,
  ProjectCardProps,
  ProjectStorage,
  ResourceSpecificationCardProps,
  TaskCardProps,
} from "./BusinessObjects.types";
import "./businessObjects.css";

const names = (...values: Array<string | false | undefined>) => (
  values.filter(Boolean).join(" ")
);

const isStorageList = (
  value: ReactNode | readonly ProjectStorage[],
): value is readonly ProjectStorage[] => Array.isArray(value);

export function TaskCard({
  name, space, resource, duration, status, icon, className, ...rest
}: TaskCardProps) {
  const { t } = useLocale();
  return (
    <article {...rest} className={names("qizhi-task-item", className)}>
      {icon === undefined ? null : (
        <span className="qizhi-task-item__icon" aria-hidden="true">{icon}</span>
      )}
      <div className="qizhi-task-item__content">
        <strong className="qizhi-task-item__name">{name}</strong>
        <div className="qizhi-task-item__meta">
          <span className="qizhi-task-item__space">{space}</span>
          <span>{t("taskCard.resource")}{resource}</span>
          <span>{t("taskCard.duration")}{duration}</span>
        </div>
      </div>
      <span className="qizhi-task-item__status">{status}</span>
    </article>
  );
}

export function ModelCard({
  variant = "marketplace",
  name,
  description,
  tags = [],
  preset,
  meta,
  actions: suppliedActions,
  secondaryAction,
  primaryAction,
  className,
  ...rest
}: ModelCardProps) {
  const actions = suppliedActions
    ?? [secondaryAction, primaryAction].filter(Boolean);
  if (variant === "financial") {
    return (
      <article
        {...rest}
        tabIndex={0}
        className={names(
          "qizhi-model-card qizhi-model-card--financial",
          className,
        )}
      >
        <div className="qizhi-model-card__header">
          <h5>{name}</h5>
          {meta === undefined ? null : (
            <div className="qizhi-model-card__meta">{meta}</div>
          )}
        </div>
        <p className="qizhi-model-card__description">{description}</p>
        <div className="qizhi-model-card__financial-footer">
          <div className="qizhi-model-card__tags" aria-label="模型能力">
            {tags.map((tag, index) => (
              <Tag key={index} size="small" className="qizhi-model-card__tag">
                {tag}
              </Tag>
            ))}
          </div>
          <div className="qizhi-model-card__financial-actions">
            {actions.map((action, index) => (
              <Button
                key={index}
                type={index === actions.length - 1 ? "primary" : "secondary"}
                size="small"
                onClick={action?.onClick}
              >
                {action?.label}
              </Button>
            ))}
          </div>
        </div>
      </article>
    );
  }
  return (
    <article
      {...rest}
      tabIndex={0}
      className={names(
        "qizhi-model-card qizhi-model-card--marketplace",
        className,
      )}
    >
      {preset === undefined ? null : (
        <span className="qizhi-model-card__preset">{preset}</span>
      )}
      <div className="qizhi-model-card__body">
        <div className="qizhi-model-card__header"><h5>{name}</h5></div>
        <div className="qizhi-model-card__tags" aria-label="模型属性">
          {tags.map((tag, index) => (
            <Tag
              key={index}
              size="small"
              className={names(
                "qizhi-model-card__tag",
                index < 2 && "qizhi-model-card__tag--primary",
                index === tags.length - 1 && "qizhi-model-card__tag--source",
              )}
            >
              {tag}
            </Tag>
          ))}
        </div>
        <div className="qizhi-model-card__description-wrap">
          <Tooltip content={description}>
            <p className="qizhi-model-card__description" tabIndex={0}>
              {description}
            </p>
          </Tooltip>
        </div>
      </div>
      <div className={names(
        "qizhi-model-card__actions",
        actions.length === 3 && "qizhi-model-card__actions--three",
      )}>
        {actions.map((action, index) => (
          <Button
            key={index}
            type="text"
            icon={action?.icon}
            onClick={action?.onClick}
          >
            {action?.label}
          </Button>
        ))}
      </div>
    </article>
  );
}

export function MarketplaceModelCard({
  name,
  description,
  tags,
  preset,
  onViewDetails,
  onQuickExperience,
  onOnlineInference,
  ...rest
}: MarketplaceModelCardProps) {
  return (
    <ModelCard
      {...rest}
      variant="marketplace"
      name={name}
      description={description}
      tags={tags}
      preset={preset}
      actions={[
        {
          label: "查看详情",
          icon: <EyeVisibleIcon />,
          onClick: onViewDetails,
        },
        {
          label: "快速体验",
          icon: <QuickExperienceIcon size={14} />,
          onClick: onQuickExperience,
        },
        {
          label: "在线推理",
          icon: <OnlineInferenceIcon size={14} />,
          onClick: onOnlineInference,
        },
      ]}
    />
  );
}

export function FinancialModelCard({
  name,
  meta,
  description,
  tags,
  onViewDetails,
  onUse,
  ...rest
}: FinancialModelCardProps) {
  return (
    <ModelCard
      {...rest}
      variant="financial"
      name={name}
      meta={meta}
      description={description}
      tags={tags}
      secondaryAction={{ label: "查看详情", onClick: onViewDetails }}
      primaryAction={{ label: "去使用", onClick: onUse }}
    />
  );
}

export function SkillServiceCard({
  name, version, updatedAt, project, summary, icon, className, ...rest
}: SkillServiceCardProps) {
  const summaryLines = typeof summary === "string"
    ? summary.replace(/\r\n?/g, "\n").split("\n")
    : null;
  const previewLines = summaryLines?.slice(0, 3) ?? null;
  const summaryOverflow = Boolean(summaryLines && summaryLines.length > 3);
  const popoverContent = typeof summary === "string"
    ? <pre className="qizhi-skill-service-card__full-summary">{summary}</pre>
    : summary;

  return (
    <article
      {...rest}
      tabIndex={0}
      className={names("qizhi-skill-service-card", className)}
    >
      <header className="qizhi-skill-service-card__header">
        <span className="qizhi-skill-service-card__icon">
          {icon ?? <SkillServiceIcon />}
        </span>
        <div className="qizhi-skill-service-card__identity">
          <div className="qizhi-skill-service-card__title-row">
            <h4>{name}</h4><span>{version}</span>
          </div>
          <p><span>更新时间：{updatedAt}</span><span>|</span><span>{project}</span></p>
        </div>
      </header>
      <Popover content={popoverContent} position="top" trigger="hover" role="tooltip">
        <div className="qizhi-skill-service-card__summary" tabIndex={0}>
          <ol aria-hidden="true">
            {(previewLines ?? [summary]).map((_, index) => (
              <li key={index}>{String(index + 1).padStart(2, "0")}</li>
            ))}
          </ol>
          <p>
            {previewLines
              ? previewLines.map((line, index) => (
                  <span key={index}>
                    {line}{summaryOverflow && index === previewLines.length - 1 ? "…" : ""}
                  </span>
                ))
              : <span>{summary}</span>}
          </p>
        </div>
      </Popover>
    </article>
  );
}

function StorageList({ items }: { items: readonly ProjectStorage[] }) {
  return (
    <div className="qizhi-project-card__storage-list">
      {items.map((storage) => (
        <div key={storage.name} className="qizhi-project-card__storage-item">
          <div className="qizhi-project-card__storage-summary">
            <span className="qizhi-project-card__storage-name">{storage.name}</span>
            <span className="qizhi-project-card__storage-label">已申请</span>
            <span>{storage.applied}</span>
            <span className="qizhi-project-card__storage-label">剩余</span>
            <span>{storage.remaining}</span>
            {storage.warning === undefined ? null : (
              <Tooltip content={storage.warning}>
                <span tabIndex={0} aria-label="查看存储配额异常说明">
                  <WarningFilledIcon />
                </span>
              </Tooltip>
            )}
          </div>
          <div className="qizhi-project-card__storage-updated">
            <span className="qizhi-project-card__storage-label">数据更新时间</span>
            <span>{storage.updatedAt}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectCard({
  name,
  englishName,
  status,
  tone = "primary",
  rows,
  members = [],
  action,
  risk,
  riskLevel = "warning",
  onOpen,
  onManageMembers,
  className,
  ...rest
}: ProjectCardProps) {
  const { t } = useLocale();
  const openOnKey = (event: KeyboardEvent) => {
    if (event.key === "Enter") onOpen?.();
  };
  return (
    <article
      {...rest}
      data-tone={tone}
      className={names("qizhi-project-card", className)}
    >
      <div
        className="qizhi-project-card__main"
        role="link"
        tabIndex={0}
        aria-label={`进入项目 ${name} 详情`}
        onClick={onOpen}
        onKeyDown={openOnKey}
      >
        <div className="qizhi-project-card__header">
          <Button
            type="text"
            className="qizhi-project-card__name"
            onClick={(event) => {
              event.stopPropagation();
              onOpen?.();
            }}
          >
            {name}
          </Button>
          <span className="qizhi-project-card__status">{status}</span>
        </div>
        <div className="qizhi-project-card__body">
          {[[t("projectCard.englishName"), englishName] as const, ...rows].map(
            ([label, value], index) => (
              <div
                key={index}
                className={names(
                  "qizhi-project-card__row",
                  isStorageList(value) && "qizhi-project-card__row--storage",
                )}
              >
                <span className="qizhi-project-card__label">{label}：</span>
                <div className="qizhi-project-card__value">
                  {isStorageList(value)
                    ? <StorageList items={value} />
                    : value}
                </div>
              </div>
            ),
          )}
        </div>
        {risk === undefined ? null : (
          <Alert
            className="qizhi-project-card__risk"
            content={risk}
            type={riskLevel === "danger" ? "error" : "warning"}
            size="small"
            inline
          />
        )}
      </div>
      <footer className="qizhi-project-card__footer">
        <Avatar.Group size="mini">
          {members.map((member, index) => (
            <Tooltip
              key={index}
              content={typeof member === "string" ? member : member.name}
            >
              <Avatar
                tabIndex={0}
                className={names(
                  "qizhi-project-card__member",
                  `qizhi-project-card__member--${
                    typeof member === "string"
                      ? ["primary", "cyan", "purple"][index % 3]
                      : member.tone
                        ?? ["primary", "cyan", "purple"][index % 3]
                  }`,
                )}
                aria-label={
                  typeof member === "string" ? member : member.name
                }
              >
                {typeof member === "string" ? member : member.label}
              </Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
        <div className="qizhi-project-card__actions">
          {action === undefined ? null : (
            <Button
              type="text"
              className="qizhi-project-card__action"
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          <Tooltip content={t("projectCard.members")}>
            <Button
              type="text"
              className="qizhi-project-card__action qizhi-project-card__action--members"
              icon={<TeamIcon data-icon-component="TeamIcon" />}
              aria-label={t("projectCard.manageMembers")}
              onClick={onManageMembers}
            />
          </Tooltip>
        </div>
      </footer>
    </article>
  );
}

export function ConfirmationSummary({
  title,
  children,
  rows = [],
  caption,
  metrics = [],
  price,
  priceUnit,
  formula,
  budget,
  variant = price === undefined ? "default" : "cost",
  className,
  ...rest
}: ConfirmationSummaryProps) {
  return (
    <section
      {...rest}
      className={names(
        "qizhi-confirmation-summary",
        variant !== "default" && `qizhi-confirmation-summary--${variant}`,
        className,
      )}
    >
      {title != null && <h3>{title}</h3>}
      {price === undefined ? (
        <div className="qizhi-confirmation-summary__body">
          <dl className="qizhi-confirmation-summary__list">
            {rows.map(([label, value], index) => (
              <div key={index}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          {caption === undefined ? null : (
            <p className="qizhi-confirmation-summary__caption">{caption}</p>
          )}
          <div className="qizhi-confirmation-summary__metrics">
            {metrics.map((metric, index) => (
              <div key={index}>
                <span>{metric.label}</span>
                <strong>{metric.value}{metric.total === undefined ? null : (
                  <small> / {metric.total}</small>
                )}</strong>
              </div>
            ))}
          </div>
          {children}
        </div>
      ) : (
        <div className="qizhi-confirmation-summary__cost-body">
          <div className="qizhi-confirmation-summary__price">
            <strong>{price}</strong><span>{priceUnit}</span>
          </div>
          <p className="qizhi-confirmation-summary__formula">{formula}</p>
          <div className="qizhi-confirmation-summary__budget">
            <span>剩余预算</span><strong>{budget}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

export function ConfirmationSummaryGroup({
  children,
  label = "关联确认信息",
  className,
  ...rest
}: ConfirmationSummaryGroupProps) {
  return (
    <article
      {...rest}
      aria-label={label}
      className={names("qizhi-confirmation-summary-group", className)}
    >
      {children}
    </article>
  );
}

export function ResourceSpecificationCard({
  resourceModel,
  vendor,
  architecture,
  cpu,
  memory,
  gpu,
  className,
  ...rest
}: ResourceSpecificationCardProps) {
  return (
    <ConfirmationSummary
      {...rest}
      className={className}
      title={null}
      variant="resource"
      rows={[
        ["资源型号", resourceModel],
        ...(vendor === undefined ? [] : [["算力厂商", vendor] as [ReactNode, ReactNode]]),
        ...(architecture === undefined ? [] : [["CPU 架构", architecture] as [ReactNode, ReactNode]]),
      ]}
      caption="资源概览（可用量/可用总量）"
      metrics={[
        { label: "CPU（核数）", ...cpu },
        { label: "内存（GB）", ...memory },
        { label: "GPU（卡数）", ...gpu },
      ]}
    >
      {vendor === undefined ? null : <p className="qizhi-resource-specification-note"><InfoIcon aria-hidden="true" />如需执行 GPU 任务，请选择对应算力厂商的镜像</p>}
    </ConfirmationSummary>
  );
}

export function BillingBudgetCard({
  model,
  instanceCount,
  settlementMethod,
  settlementCycle,
  price,
  priceUnit,
  formula,
  budget,
  className,
  ...rest
}: BillingBudgetCardProps) {
  return (
    <ConfirmationSummaryGroup
      {...rest}
      className={className}
      label="计费规则与费用预算确认"
    >
      <ConfirmationSummary
        title="计费规则确认"
        rows={[
          ["接入模型", model],
          ["实例数", instanceCount],
          ["结算方式", settlementMethod],
          ["结算周期", settlementCycle],
        ]}
      />
      <ConfirmationSummary
        title="费用与预算确认"
        variant="cost"
        price={price}
        priceUnit={priceUnit}
        formula={formula}
        budget={budget}
      />
    </ConfirmationSummaryGroup>
  );
}

/** @deprecated Use BillingBudgetCard. */
export const BillingBudgetConfirmationCard = BillingBudgetCard;
