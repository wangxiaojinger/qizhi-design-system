import type { ConfigProviderProps } from "antd";

export const qizhiComponentConfig = {
  form: { styles: { label: { fontWeight: "var(--font-weight-strong)" } } },
  table: { styles: { header: { cell: { minWidth: "max-content", whiteSpace: "nowrap" } } } },
  modal: { styles: { mask: { backdropFilter: "none", zIndex: "var(--z-modal)" }, wrapper: { zIndex: "var(--z-modal)" } } },
  drawer: {
    styles: {
      wrapper: { width: "min(calc(var(--spacing-32) * 30), 100vw)" },
      body: { background: "var(--component-drawer-body-background)", padding: "var(--spacing-24)", overflowX: "hidden" },
      footer: { padding: "var(--spacing-16) var(--spacing-24)", background: "var(--component-drawer-body-background)" },
    },
  },
} satisfies Pick<ConfigProviderProps, "form" | "table" | "modal" | "drawer">;
