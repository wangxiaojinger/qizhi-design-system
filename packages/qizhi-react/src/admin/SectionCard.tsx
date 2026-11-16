import { Card, Flex, Grid } from "antd";
import type { CardProps } from "antd";

export interface SectionCardProps extends CardProps {
  stackActionsOnSmallScreens?: boolean;
}

/** Card section with a responsive, public-API-only title/action layout. */
export function SectionCard({ title, extra, stackActionsOnSmallScreens = false, ...props }: SectionCardProps) {
  const screens = Grid.useBreakpoint();
  const stack = stackActionsOnSmallScreens && screens.sm === false;
  return (
    <Card
      {...props}
      title={title || extra ? (
        <Flex align={stack ? "stretch" : "center"} vertical={stack} justify="space-between" wrap gap="var(--spacing-8)">
          {title ? <Flex style={{ flex: "1 1 auto", minWidth: "var(--spacing-0)" }}>{title}</Flex> : null}
          {extra ? <Flex style={{ fontWeight: "var(--font-weight-regular)" }}>{extra}</Flex> : null}
        </Flex>
      ) : undefined}
    />
  );
}
