import type { HTMLAttributes, ReactNode } from "react";

export type DetailHeaderStatusTone = "online" | "offline";

export interface DetailHeaderStatus {
  label: ReactNode;
  tone: DetailHeaderStatusTone;
}

export interface DetailHeaderProperty {
  label: ReactNode;
  value: ReactNode;
  plain?: boolean;
}

export interface DetailHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  icon?: ReactNode;
  title: ReactNode;
  status?: DetailHeaderStatus;
  action?: ReactNode;
  properties?: readonly DetailHeaderProperty[];
  audit?: ReactNode;
  tabs?: ReactNode;
}
