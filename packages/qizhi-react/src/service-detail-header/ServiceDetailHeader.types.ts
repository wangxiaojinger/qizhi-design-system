import type { ReactNode } from "react";
import type { DetailHeaderProps } from "../detail-header/DetailHeader.types";

export interface ServiceDetailHeaderMember {
  name: string;
  initial: string;
  tone?: "primary" | "cyan" | "blue";
}

export interface ServiceDetailHeaderVersion {
  key: string;
  name: string;
  time: string;
  operator: string;
  initial: string;
  action: string;
  disabled?: boolean;
}

export interface ServiceDetailHeaderTab {
  key: string;
  title: ReactNode;
}

export interface ServiceDetailHeaderProps {
  icon?: ReactNode;
  title: ReactNode;
  serviceId?: ReactNode;
  framework?: ReactNode;
  creator: ReactNode;
  maintainers?: readonly ServiceDetailHeaderMember[];
  createdAt: ReactNode;
  updatedAt: ReactNode;
  versions: readonly ServiceDetailHeaderVersion[];
  tabs: readonly ServiceDetailHeaderTab[];
  defaultOnline?: boolean;
  defaultTab?: string;
  defaultVersion?: string;
  /** 业务头部布局、状态、操作及页签；审计信息和版本抽屉仍由组件负责。 */
  headerProps?: Pick<DetailHeaderProps, "className" | "status" | "action" | "tabs">;
  /** 受控部署版本。 */
  version?: string;
  /** 版本入口名称，例如 Skill 使用当前版本。 */
  versionLabel?: string;
  /** 仅查看版本，不提供回滚行为。 */
  versionReadOnly?: boolean;
  onStatusChange?: (online: boolean) => void;
  onVersionChange?: (version: string) => void;
  onTabChange?: (key: string) => void;
}
