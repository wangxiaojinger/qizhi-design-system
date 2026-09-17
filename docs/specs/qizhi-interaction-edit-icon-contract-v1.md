# QIZHI 交互按钮与编辑类图标 API 契约 v1

状态：已确认实施范围  
负责人：林猫猫  
证据日期：2026-08-20

## 1. 范围

- 交互按钮类保留旧站 69 枚，不增不减。按图形语义校正后为线性 48、面性 21。
- 编辑类保留旧站 53 枚：线性 29、面性 24。
- `发送-面性` 旧页的 `data-icon-category` 误写为 `outline`，以图形、旧名和配对变体为证据校正为 `fill`。
- 所有图标均为单色 `currentColor`，不导出固定颜色 API。`CommandManagementIcon` 旧源的 `#8C8C8C` 在生成时规范化为 `currentColor`。

## 2. 公共 API

两类图标与方向、提示建议类共用：

```ts
export interface QizhiIconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  title?: string;
}
```

- `size` 默认 `1em`，同时控制宽高，显式 `width`/`height` 分别优先。
- 根元素为 `<svg>`，透传原生 SVG 属性和 `ref`，不接受 `children` 覆盖图形。
- 未提供可访问名称时默认装饰性隐藏；提供 `title` 或 ARIA 名称时使用 `role="img"`。
- 可从 `@wangxiaojinger/qizhi-react` 和 `@wangxiaojinger/qizhi-react/icon` 导入同一实现。

## 3. 复用契约

- 旧站路径与现有 QIZHI 公共图标完全相同的 `AddIcon`、`CodeIcon`、`CopyIcon`、`DeleteIcon`、`EditIcon`、`EyeHiddenIcon`、`EyeVisibleIcon`、`LinkIcon`、`MultiplyIcon` 保留原公开名称，不再生成第二份实现。
- 上述已有图标同步升级到 `QizhiIconProps`，并保留原 `data-icon` DOM 协议，避免 Input、Link、Button 等消费者回归。
- 现有 `SearchIcon` 和 `MoreIcon` 与旧站图形不完全一致，本次以旧站证据生成正式实现，保留原公开名称。

## 4. Manifest 与 AI

- 每项包含唯一 `id`、`componentName`、`displayName`、`legacyName`、`aliases`、`semantic`、`family`、`style`、`colorMode`、`sourceNodeId`、`sourceFile`与 `importPath`。
- `semantic` 分别为 `interaction` 和 `edit`；`family` 是 AI 筛选字段，不从显示名临时猜测。
- 自然语言命中多个候选时返回候选，不自动选择第一项。

## 5. 文档与验收

- 图标页总数更新为 202：方向 38、提示建议 42、交互按钮 69、编辑 53。
- 筛选数量为线性 120、面性 73、多色 9。
- 四类图标共用搜索、筛选、点击/键盘复制和 QIZHI 全局 Message 反馈。
- 必须通过生成器、manifest、React、文档、类型和构建测试，并完成 1440/1024/375 的网格、hover、复制、溢出、控制台与截图验收。
