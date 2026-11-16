import { Flex, Typography } from "antd";
import type { CSSProperties, ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  titleId?: string;
  description?: ReactNode;
  actions?: ReactNode;
  style?: CSSProperties;
  actionsStyle?: CSSProperties;
}

/** Page-level heading and primary actions for enterprise-admin views. */
export function PageHeader({ title, titleId, description, actions, style, actionsStyle }: PageHeaderProps) {
  return (
    <Flex component="header" justify="space-between" align="flex-start" wrap gap="var(--spacing-16)" style={{ marginBottom: "var(--spacing-24)", ...style }}>
      <Flex vertical gap="var(--spacing-6)" style={{ minWidth: "var(--spacing-0)" }}>
        <Typography.Title level={1} id={titleId} style={{ margin: "var(--spacing-0)", color: "var(--text-text-default)", fontSize: "var(--font-size-2xl)", lineHeight: "var(--line-height-2xl)", fontWeight: "var(--font-weight-bold)" }}>
          {title}
        </Typography.Title>
        {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
      </Flex>
      {actions ? <Flex align="center" wrap gap="var(--spacing-12)" style={actionsStyle}>{actions}</Flex> : null}
    </Flex>
  );
}
