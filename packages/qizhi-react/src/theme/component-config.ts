import type { ConfigProviderProps } from "antd";

/** Public ConfigProvider styles keep QIZHI presentation out of .ant-* overrides. */
export const qizhiComponentConfig = {
  form: { styles: { label: { fontWeight: "var(--font-weight-strong)" } } },
  table: { styles: { header: { cell: { minWidth: "max-content", whiteSpace: "nowrap" } } } },
  modal: { styles: { mask: { backdropFilter: "none", zIndex: "var(--z-modal)" }, wrapper: { zIndex: "var(--z-modal)" } } },
  drawer: {
    mask: { closable: true },
    styles: ({ props }) => props.placement === "left" ? {} : {
      wrapper: { width: "min(calc(var(--spacing-32) * 30), 100vw)" },
      section: { minHeight: "var(--spacing-0)", overflow: "hidden", background: "var(--bg-bg-base-secondary)" },
      header: { background: "var(--bg-bg-base-default)" },
      body: {
        minHeight: "var(--spacing-0)", margin: "var(--spacing-16)", padding: "var(--spacing-24)", overflowX: "hidden", overflowY: "auto",
        overscrollBehavior: "contain", borderRadius: "calc(var(--radius-8) + var(--radius-4))", background: "var(--bg-bg-base-default)",
      },
      footer: { display: "flex", justifyContent: "flex-end", background: "var(--bg-bg-base-default)", padding: "var(--spacing-16) var(--spacing-24)" },
    },
  },
} satisfies Pick<ConfigProviderProps, "form" | "table" | "modal" | "drawer">;
