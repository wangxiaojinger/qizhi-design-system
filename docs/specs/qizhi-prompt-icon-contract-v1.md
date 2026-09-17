# QIZHI Prompt Icon API 契约 v1

状态：已确认实施范围  
负责人：林猫猫  
证据日期：2026-08-20

## 1. 目标与边界

- 保留旧规范站“提示建议类图标”的 42 个 SVG，并纳入用户确认新增的
  `SkillServiceIcon` 多色图标，共 43 个 React 图标。
- 分类数量固定为：线性 20、面性 13、多色 9。
- 公共 Props、导入路径、ARIA 规则与方向类图标保持一致。
- v1 不提供 IconFont、运行时字符串组件、全局线宽配置或调用方覆盖多色图标固定色板的 API。

## 2. 公共 API

```ts
export interface QizhiIconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  title?: string;
}
```

- `size` 默认为 `1em`，同时设置宽高；显式 `width`/`height` 分别覆盖对应轴。
- 透传根 `<svg>` 的原生属性和 `ref`，不允许传入 `children` 替换图形。
- 未提供可访问名称时默认 `aria-hidden="true"`；提供 `title` 或 ARIA 名称时使用 `role="img"`。
- 每个图标均可从 `@wangxiaojinger/qizhi-react` 和 `@wangxiaojinger/qizhi-react/icon` 导入，两条路径指向同一实现。

## 3. 颜色契约

| 类型 | `style` | `colorMode` | 规则 |
|---|---|---|---|
| 线性 | `outline` | `currentColor` | 单色主体继承上下文颜色 |
| 面性 | `fill` | `currentColor` | 单色主体继承上下文颜色 |
| 多色 | `color` | `fixedPalette` | 保留 QIZHI 已确认固定色板，不被 `color` 覆盖 |

- `fixedColors` 是生成器允许的色值白名单，不是运行时 API。
- `状态-加载-白色` 保持固定白色，文档站不为它增加额外深色底板。

## 4. SVG 与生成契约

- 生成器允许受控的 `path`/`circle`/`rect`/`g`/`defs`/`linearGradient`/`stop`/`clipPath`/`mask`。
- 拒绝 `script`、`foreignObject`、内联事件、外部资源、未批准色值和无效 ID 引用。
- 渐变、裁切和遮罩 ID 必须按组件实例隔离，重复渲染不得发生 ID 冲突。
- `选择模型` 和 `状态-加载-白色` 不直接转换旧站 `foreignObject`/CSS 锥形渐变，使用受控 SVG 渐变源重构；发布前必须单独做视觉对照。
- 生成组件不手改；变更必须来自源 SVG、manifest 或生成器。

## 5. Manifest 与 AI 调用

- 每项包含稳定 `id`、`componentName`、中文 `displayName`、`legacyName`、`aliases`、`semantic`、`family`、`style`、`colorMode`、`state`、`sourceNodeId`、`sourceFile`和 `importPath`。
- `semantic` 固定为 `prompt`；`family` 和 `state` 用于机器筛选，不从中文名称临时推断。
- AI 先通过 manifest 检索唯一候选，再生成静态导入和 JSX；候选不唯一时返回候选列表，不猜测。

## 6. 文档与复制

- 图标页由方向与提示建议两份 manifest 同源生成，总数为 80。
- 筛选后数量为：线性 43、面性 28、多色 9。
- 点击卡片或键盘激活后复制完整导入与 JSX，使用 QIZHI 全局 Message 样式反馈，不在卡片内展开用法面板。
- hover 只将 32px 图标缩放至 44.8px，不改变图标颜色。

## 7. 发布门槛

- [ ] 42 个旧站节点及 1 个用户提供图标与 manifest、React 组件、导出和
  文档卡片一一对应。
- [ ] 生成器、组件、manifest、文档和复制代码测试通过。
- [ ] 类型检查、全量测试和构建通过。
- [ ] 1440/1024/375 的搜索、筛选、复制、键盘、hover、溢出与截图验收完成。
- [ ] `选择模型` 与 `状态-加载-白色` 已与旧站做单独视觉对照。
- [ ] 最终最多标记 `candidate_pass`；独立验证与人工确认保持各自真实状态。
