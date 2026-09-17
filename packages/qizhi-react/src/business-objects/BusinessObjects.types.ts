import type { HTMLAttributes, ReactNode } from "react";

export interface TaskCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "resource"> {
  name: ReactNode;
  space: ReactNode;
  resource: ReactNode;
  duration: ReactNode;
  status: ReactNode;
  icon?: ReactNode;
}

export interface CardAction {
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface ModelCardProps extends HTMLAttributes<HTMLElement> {
  variant?: "marketplace" | "financial";
  name: ReactNode;
  description: ReactNode;
  tags?: readonly ReactNode[];
  preset?: ReactNode;
  meta?: ReactNode;
  actions?: readonly CardAction[];
  secondaryAction?: CardAction;
  primaryAction?: CardAction;
}

export interface MarketplaceModelCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  name: ReactNode;
  description: ReactNode;
  tags?: readonly ReactNode[];
  preset?: ReactNode;
  onViewDetails?: () => void;
  onQuickExperience?: () => void;
  onOnlineInference?: () => void;
}

export interface FinancialModelCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  name: ReactNode;
  meta?: ReactNode;
  description: ReactNode;
  tags?: readonly ReactNode[];
  onViewDetails?: () => void;
  onUse?: () => void;
}

export interface SkillServiceCardProps extends HTMLAttributes<HTMLElement> {
  name: ReactNode;
  version: ReactNode;
  updatedAt: ReactNode;
  project: ReactNode;
  summary: ReactNode;
  icon?: ReactNode;
}

export interface ProjectStorage {
  name: string;
  applied: string;
  remaining: string;
  updatedAt: string;
  warning?: ReactNode;
}

export type ProjectRow = readonly [
  ReactNode,
  ReactNode | readonly ProjectStorage[],
];

export interface ProjectMember {
  label: ReactNode;
  name: string;
  tone?: "primary" | "cyan" | "purple" | "orange";
}

export interface ProjectCardProps extends HTMLAttributes<HTMLElement> {
  name: string;
  englishName: string;
  status: ReactNode;
  tone?: "primary" | "success" | "danger" | "warning";
  rows: readonly ProjectRow[];
  members?: readonly (string | ProjectMember)[];
  action?: CardAction;
  risk?: ReactNode;
  riskLevel?: "warning" | "danger";
  onOpen?: () => void;
  onManageMembers?: () => void;
}

export interface ConfirmationMetric {
  label: ReactNode;
  value: ReactNode;
  total?: ReactNode;
}

export interface ConfirmationSummaryProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  rows?: readonly (readonly [ReactNode, ReactNode])[];
  caption?: ReactNode;
  metrics?: readonly ConfirmationMetric[];
  price?: ReactNode;
  priceUnit?: ReactNode;
  formula?: ReactNode;
  budget?: ReactNode;
  variant?: "default" | "resource" | "cost";
}

export interface ConfirmationSummaryGroupProps
  extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  label?: string;
}

export interface ResourceSpecificationMetric {
  value: ReactNode;
  total?: ReactNode;
}

export interface ResourceSpecificationCardProps
  extends HTMLAttributes<HTMLElement> {
  resourceModel: ReactNode;
  vendor?: ReactNode;
  architecture?: ReactNode;
  cpu: ResourceSpecificationMetric;
  memory: ResourceSpecificationMetric;
  gpu: ResourceSpecificationMetric;
}

export interface BillingBudgetCardProps
  extends HTMLAttributes<HTMLElement> {
  model: ReactNode;
  instanceCount: ReactNode;
  settlementMethod: ReactNode;
  settlementCycle: ReactNode;
  price: ReactNode;
  priceUnit: ReactNode;
  formula: ReactNode;
  budget: ReactNode;
}

/** @deprecated Use BillingBudgetCardProps. */
export type BillingBudgetConfirmationCardProps = BillingBudgetCardProps;
