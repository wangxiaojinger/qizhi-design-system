# QIZHI Statistic API 契约 v1

状态：已审定  
负责人：Iris（林猫猫）  
证据日期：2026-08-24

## 1. 目标与边界

- 用户任务：将旧规范站的数值显示 Statistic 迁移为 `@wangxiaojinger/qizhi-react` 正式组件。
- 业务场景：突出展示某个或某组数字、带描述的统计类数据。
- v1 保留：标题、数值、精度、时间格式、前后缀、下方说明、数值样式和加载状态。
- v1 不提供：倒计时、数值动画、自定义千分位符、任意 formatter、趋势枚举、指标卡、组合面板或公共 Skeleton。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 旧站 4 个 Demo | `index.html#component-statistic` | 标题、说明、顺序、显示值、布局和初始状态 | 时间戳原值和旧复制源码 |
| 旧站样式 | `styles.css` 的 Statistic 规则 | 字号、行高、间距、颜色和响应式 | React 公共 API |
| 旧站交互 | `script.js:initStatisticDemos` | `loading` 与 Switch、Skeleton、数值的联动 | 其他交互状态 |
| React 文档规范 | `docs/standards/react-component-docs.md` | Demo 同源、操作区和 API 表规则 | Statistic 特有能力 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 基础数值 | 保留 | `value: number | string` | 4 组 Demo |
| 小数精度 | 保留 | `precision?: number` | `40,509.00` |
| 时间格式 | 保留 | `format?: "YYYY/MM/DD HH:mm:ss"` | 时间格式 Demo |
| 前缀、后缀、下方说明 | 保留 | `ReactNode` 插槽 | 基础与自定义 Demo |
| 数值颜色 | 保留 | `valueStyle?: CSSProperties` | 红色增长率 |
| 加载中 | 保留 | `loading?: boolean` | 加载 Demo |
| 公共 Skeleton | 删除 | 仅为 Statistic 内部呈现 | React 包尚无公共 Skeleton |

## 4. 公共 API

| 属性 | 类型 | 默认值 | 描述 | 组合/互斥规则 |
|---|---|---|---|---|
| `value` | `number | string` | 必填 | 需要展示的数值或文本 | number 自动使用千分位 |
| `title` | `ReactNode` | `—` | 数值上方的标题 | 无 |
| `prefix` | `ReactNode` | `—` | 数值前缀 | 无 |
| `suffix` | `ReactNode` | `—` | 数值后缀 | 无 |
| `extra` | `ReactNode` | `—` | 数值下方的说明 | 无 |
| `precision` | `number` | `—` | 数字值的小数位数 | 仅影响 number |
| `format` | `"YYYY/MM/DD HH:mm:ss"` | `—` | 按本地时区格式化时间值 | 仅影响 number 或可解析的字符串 |
| `valueStyle` | `CSSProperties` | `—` | 数值容器样式 | 无 |
| `loading` | `boolean` | `false` | 显示内部加载占位并隐藏数值 | 无 |
| `className` | `string` | `—` | 根元素类名 | 无 |
| `style` | `CSSProperties` | `—` | 根元素样式 | 无 |
| `ref` | `Ref<HTMLDivElement>` | `—` | 指向根元素 | 无 |

- 原生属性：继承 `HTMLAttributes<HTMLDivElement>`，排除 `children` 和内部定义重名属性。
- 事件：Statistic 无自有交互事件。
- 受控模式：由消费者控制 `value` 和 `loading`。

## 5. DOM 和样式契约

- 默认根元素：`div.qizhi-statistic`。
- 标题：`.qizhi-statistic__title`，`14px/22px`，下边距 `8px`。
- 数值：`.qizhi-statistic__value`，`28px/36px`，字重 `500`。
- 小数部分：`.qizhi-statistic__decimal`，`18px/26px`。
- 前后缀：`18px/26px`；图标由 QIZHI 图标库提供。
- 下方说明：`.qizhi-statistic__extra`，上边距 `2px`，`14px/22px`。
- 时间格式：数值使用 `<time>`，桌面 `24px/32px`，375 视口 `20px/28px`。
- 加载：内部占位宽 `132px`，行高 `20px`，兼容 `prefers-reduced-motion`。
- Demo 布局类不属于公共 API。

## 6. 交互和状态

| 状态 | 触发条件 | 视觉 | 事件 | 焦点 | ARIA |
|---|---|---|---|---|---|
| default | `loading=false` | 显示数值 | 无 | 无 | 无额外 role |
| loading | `loading=true` | 显示 Skeleton，数值不可见 | 无 | 无 | `role="status"` + `aria-label="数值加载中"` |

## 7. 键盘与无障碍

- Statistic 本身不可交互，不进入 Tab 序列。
- 加载 Demo 的控制使用正式 `Switch`，保留原生按钮的 Space/Enter 路径。
- 装饰图标不提供独立可访问名称。

## 8. Demo 与 API 元数据

Demo 顺序固定为：

1. 基础用法
2. 前缀后缀/自定义样式
3. 时间格式
4. 加载中

- 每个 Demo 为独立 TSX。
- 预览直接渲染 TSX，展示与复制从同一 `.tsx?raw` 读取。
- API 元数据使用 `name/description/type/defaultValue`，并由 `keyof StatisticProps` 约束。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | 数值/字符串值、精度、时间格式、ReactNode 插槽、ref |
| 单元 | 千分位、小数拆分、时间 `<time>`、加载占位、样式和 ref |
| 文档 | 4 个 Demo 顺序、逐字说明、数据、初始状态、正式导入、源码同源和 API 一致 |
| E2E | Switch 点击/键盘、几何、颜色、时间字号、溢出、控制台、1440/1024/375 |

## 10. 发布门槛

- [ ] 契约测试、类型检查和构建通过。
- [ ] 官网真实消费 `@wangxiaojinger/qizhi-react`。
- [ ] Demo 展示与复制代码同源。
- [ ] 1440/1024/375 和局部截图已验收。
- [ ] 执行者最高声明 `candidate_pass`，独立最终验证保持 `pending`。
