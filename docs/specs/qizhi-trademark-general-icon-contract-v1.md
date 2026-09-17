# QIZHI 商标类与通用类图标 API 契约 v1

状态：已确认实施范围  
负责人：林猫猫  
证据日期：2026-08-20

## 1. 范围

- 商标类保留旧站 28 枚：线性 13、面性 15。
- 通用类保留旧站 185 枚；校正旧站冲突后为线性 124、面性 61。
- `时间-面性` 的旧分类误写为 `outline`，`时间` 的旧分类误写为 `fill`；按名称、原始 `fill=on/off` 和配对图形分别校正为面性与线性。
- `博客-面性` 的旧分类误写为 `outline`；按名称、原始 `fill=fill` 和图形校正为面性。
- 两类均采用 `currentColor`。旧源中的 `#818181` 与 `#8C8C8C` 在生成时规范化，不新增固定颜色 API。

## 2. 公共 API

两类图标与已迁移图标共用 `QizhiIconProps`：

```ts
export interface QizhiIconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  title?: string;
}
```

- `size` 默认 `1em`，同时控制宽高；显式 `width`/`height` 分别优先。
- 透传 SVG 属性和 `ref`；无可访问名称时作为装饰图标，提供 `title` 或 ARIA 名称时使用 `role="img"`。
- 从 `@wangxiaojinger/qizhi-react` 与 `@wangxiaojinger/qizhi-react/icon` 导出同一实现。

## 3. 命名与 AI Manifest

- 商标类使用稳定产品语义命名，例如 `RobotType1Icon`、`GoLanguageIcon`、`McpIcon`。
- 通用类使用业务对象与状态组合命名，例如 `CloudDownloadIcon`、`TaskCompletedIcon`、`ClusterManagementIcon`。
- 为避免破坏既有公共组件，旧站日历使用 `CalendarGeneralIcon`，旧站设置使用 `SettingsGeneralIcon`；不覆盖 DatePicker 等组件已经依赖的 `CalendarIcon`。
- 每项包含唯一 `id`、`componentName`、`displayName`、`legacyName`、`aliases`、`semantic`、`family`、`style`、`colorMode`、`sourceNodeId`、`sourceFile` 与 `importPath`。
- `semantic` 为 `trademark` 或 `general`；自然语言命中多个候选时返回候选，不擅自选择第一项。

## 4. 文档与验收

- 图标页总数为 415：方向 38、提示建议 42、交互按钮 69、编辑 53、商标 28、通用 185。
- 筛选数量为线性 257、面性 149、多色 9。
- 六类图标共用搜索、筛选、点击/键盘复制、44.8px hover 放大和 QIZHI 全局 Message。
- 必须通过生成器、manifest、React、文档、类型与构建测试，并完成 1440/1024/375 的网格、复制、搜索、溢出、控制台与截图验收。
