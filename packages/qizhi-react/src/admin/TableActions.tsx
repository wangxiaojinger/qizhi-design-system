import { Button, ConfigProvider, Space } from "antd";
import type { ButtonProps, ConfigProviderProps, SpaceProps } from "antd";
import { cssNumberToken } from "../theme/antd-theme";

const actionButtonConfig: NonNullable<ConfigProviderProps["button"]> = {
  styles: ({ props }) => props.type === "link" ? { root: { paddingInline: "var(--spacing-0)", fontWeight: "inherit", color: props.danger || props.disabled ? undefined : "var(--admin-info)" } } : {},
};

export function TableActionButton(props: ButtonProps) {
  return <ConfigProvider button={actionButtonConfig}><Button {...props} /></ConfigProvider>;
}

export function TableActions(props: SpaceProps) {
  return <ConfigProvider button={actionButtonConfig}><Space {...props} size={cssNumberToken("--spacing-16") ?? 16} /></ConfigProvider>;
}
