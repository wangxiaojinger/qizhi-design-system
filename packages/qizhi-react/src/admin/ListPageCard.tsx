import { Flex, Typography } from "antd";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

const compactQuery = "(max-width: 960px)";
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(compactQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getSnapshot = () => window.matchMedia(compactQuery).matches;
const getServerSnapshot = () => false;

export interface ListPageCardProps {
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: ReactNode;
}

/** Responsive layout shell for an admin list's toolbar, table and pagination. */
export function ListPageCard({ toolbar, children, className, title }: ListPageCardProps) {
  const compact = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <Flex vertical gap="var(--spacing-16)" className={className} style={{ minWidth: "var(--spacing-0)", width: "100%", maxWidth: "100%", contain: "inline-size" }}>
      {title ? <Typography.Text strong style={{ fontSize: "var(--font-size-lg)" }}>{title}</Typography.Text> : null}
      {toolbar ? <Flex vertical={compact} align={compact ? "stretch" : "center"} justify="space-between" wrap={!compact} gap="var(--spacing-16)">{toolbar}</Flex> : null}
      {children}
    </Flex>
  );
}
