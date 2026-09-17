# QIZHI InputNumber 迁移盘点与复用映射 v1

状态：待林猫猫确认，未开始实现  
证据日期：2026-08-24

## 1. 证据边界

- 旧站页面：`index.html#component-input-number`。
- 旧站视觉：`styles.css` 中 `.input-number-*` 及公共 Input token。
- 旧站交互：`script.js` 中 `initInputNumberDemos`、步进、精度、格式化和
  尺寸切换逻辑。
- 当前公共包：已有 `Input`、`Radio.Group`、`Button`、`AddIcon`、
  `MinusIcon` 和生成的方向图标；没有公共 `InputNumber`。
- 消费者搜索：InputNumber 结构还出现在 Slider Demo、Watermark 配置器；
  Pagination 的原生数字输入不使用 InputNumber 步进协议。

## 2. 旧站 Demo 原始契约

页面说明原文：`仅允许输入数字格式的输入框。`

| 顺序 | 标题 | 原始说明 | 初始内容与布局 | 尺寸与交互 |
|---:|---|---|---|---|
| 1 | 基础用法 | 通过鼠标或者键盘输入范围内的标准数值。 | 横排两个：空值、占位 `Please enter`、范围 0–15；禁用值 500 | 默认 160×32；内嵌上下步进，空值增加为 1，边界限制到 0–15 |
| 2 | 按钮模式 | 指定 `mode` 为 `button` 来使用带按钮的数字输入框。 | 横排两个，值均为 500；第二个禁用 | 默认 162×32；左右减/加按钮 |
| 3 | 三种尺寸 | 设置 `size` 可以使用三种尺寸（`small`、`default`、`large`）的数字输入框，高度分别对应 `28px`、`32px`、`36px`。 | 尺寸控制器初始 `default`；内嵌模式和按钮模式各一个，值均为 2，最大值 20 | 尺寸控制器在上、两个输入框在下；切换后两种模式同步为 28/32/36px |
| 4 | 精度和步长 | 通过 `precision` 设置数字精度。当 `precision` 小于 `step` 的小数位时，精度取 `step` 的小数个数。 | 横排两个：3.5、step 0.1、precision 1；1.11、step 0.01、precision 2；范围均为 0–40 | 点击步进后分别得到 3.6、1.10；保留对应小数位 |
| 5 | 格式化展示值 | 通过 `formatter`、`parser` 配合使用可以定义输入框展示值。<br><br>通过 `formatter` 中的 `userTyping` 参数，判断是否正在输入，可以延迟显示 `formatter` 后的值。 | 横排两个，均显示前缀 `¥` 和值 `12,000` | 文案要求格式化/解析和输入中状态；旧脚本仅步进路径格式化，键入后失焦不格式化 |
| 6 | 前缀及后缀 | 可以添加前缀和后缀。 | 横排三个：50 + `%`；`¥` + 500、step 100；按钮模式 `¥` + 500、step 100 | 前两项内嵌步进，第三项左右按钮 |
| 7 | 高精度 | 通过 `strictMode` 开启严格模式以支持更高精度，`onChange` 此时将会返回字符串。 | 单个按钮模式，值 `100000000000000000000` | 480×32；字符串精度，不允许转为 JavaScript Number 后再计算 |

以上 7 个说明均非空；迁移时不翻译、不简化、不补写，顺序不变。

## 3. 已验证的旧实现缺陷

`getInputNumberBound` 对缺失属性执行 `Number(null)`，结果为 0。当前旧站因此有：

- 按钮模式 500、货币 12,000、高精度大整数在点击步进时会被错误压成 0；
- 格式化 Demo 直接输入 `12345` 后失焦仍显示 `12345`，没有执行说明中的格式化；
- 这些结果与 Demo 原始说明直接冲突。

建议：React 迁移锁定标题、说明、初始数据、布局与预期交互，不复制上述缺陷；
测试另外记录旧站缺陷，防止把“修复偏差”误写成原站一致。

## 4. 旧站可见元素到 React 可见元素

| 旧站可见元素 | React 决策 | 依据 |
|---|---|---|
| 页面标题、页面说明 | 原样保留 | 旧站证据 |
| 7 个 Demo 标题、说明、顺序 | 原样保留 | 用户迁移要求 |
| Demo 的输入框、步进按钮、前后缀、禁用态 | 由公共 `InputNumber` 渲染 | 禁止文档层仿写组件 |
| 三种尺寸控制器 | 复用公共 `Radio.Group` | 已有正式组件；仅承担 Demo 控制 |
| 查看/收起代码、复制代码 | 复用公共文档操作区 | 公共展示规范 |
| TSX 代码 | 展示与复制同源 | 公共展示规范 |
| API 表 | 结构化元数据生成 | 公共展示规范 |
| `Demo.tsx`、源码徽标、额外 Tab、复制样式 | 禁止新增 | 旧站和公共展示规范均无依据 |

## 5. 公共组件复用与最小新增

| 能力 | 复用/新增 | 决策 |
|---|---|---|
| 输入容器、尺寸、禁用/只读、前后缀 token | 复用 Input 基线 | 复用 `controlContainerClassName` 和现有 Input token，不嵌套公共 `Input` 形成第二层容器 |
| Demo 尺寸选择 | 复用 `Radio.Group` | 不手写分段标签 |
| 按钮模式减/加图标 | 复用 `MinusIcon`、`AddIcon` | 图标使用 `currentColor` |
| 内嵌上下步进图标 | 最小补充公共导出 | 复用已有生成的 `ArrowUpIcon`、`ArrowDownIcon`，只增加根导出，不新画图标 |
| 数值解析、边界、步进、精度、严格模式 | 新增公共 `InputNumber` | 属于组件核心行为，不能放在 Demo 中 |
| 文档操作 | 复用 Button、CodeIcon、CopyIcon | 只保留查看代码和复制代码 |

## 6. 建议审定的 v1 API

| API | 建议类型/默认值 | 证据与规则 |
|---|---|---|
| `value` | `number \| string` | 受控值；严格模式使用 string |
| `defaultValue` | `number \| string` | 支持旧站各初始值和非受控交互 |
| `onChange` | `(value: number \| string \| undefined) => void` | 空值为 undefined；strictMode 返回 string |
| `min` / `max` | `number \| string` | 只在显式提供时限制；缺失必须为无界 |
| `step` | `number \| string`，默认 1 | 小数与高精度步进 |
| `precision` | `number` | 不低于 step 的小数位数 |
| `mode` | `"embed" \| "button"`，默认 `embed` | 对应内嵌上下按钮与左右按钮 |
| `size` | `"small" \| "default" \| "large"`，默认 `default` | 高度 28/32/36px |
| `disabled` / `readOnly` | `boolean`，默认 false | Input 基线与旧站禁用证据 |
| `placeholder` | `string` | 基础 Demo 原值 `Please enter` |
| `prefix` / `suffix` | `ReactNode` | `¥`、`%` |
| `formatter` | `(value, info: { userTyping; input }) => string` | 保留原说明中的 userTyping |
| `parser` | `(displayValue: string) => number \| string` | 与 formatter 配套 |
| `strictMode` | `boolean`，默认 false | 高精度字符串运算与回调 |
| `className` / `style` / `ref` | React 标准类型 | 文档与业务消费必需，不改变行为 |

组合规则：

- `strictMode=true` 时内部计算和 `onChange` 均使用十进制字符串，禁止经 Number
  转换。
- 最终精度为 `max(precision, step 的小数位数)`。
- `formatter` 只负责展示，`parser` 负责将展示文本还原为可计算值；聚焦输入时向
  formatter 提供 `userTyping=true`。
- `disabled` 禁止输入和步进；`readOnly` 可聚焦、不可修改。
- `min/max` 未提供时必须保持无界，不能复刻旧站的 0 边界缺陷。

## 7. v1 不纳入

- 无旧站证据的清空按钮、状态色、隐藏步进器开关、鼠标滚轮开关和自定义步进图标。
- Slider、Watermark、Pagination 的 React 迁移不随本次扩展；但 InputNumber
  实现后应记录这些消费者，后续迁移时复用公共组件。
- 不修改全局 token、导航信息架构或 Input 公共 API。

## 8. 拟定验收锁定

- 文档测试锁定 7 个标题、原始说明、顺序、初始数据和可见元素白名单。
- 组件测试锁定受控/非受控、空值、边界、键盘、按钮步进、精度、formatter/
  parser、strictMode、disabled/readOnly、ref 和 ARIA spinbutton。
- E2E 锁定 160/162/480px 宽度、28/32/36px 高度、初始状态、hover 步进显示、
  三档视口、控制台和页面横向溢出。
- 回归测试明确证明缺失 min/max 不会被当成 0，并证明货币和高精度步进不归零。

## 9. 待确认结论

1. 接受 7 个 Demo 按上述原始顺序和文案迁移。
2. 接受修复已验证的旧站步进归零与格式化失效，不把缺陷复制进 React。
3. 接受上述最小 v1 API；不补入无 QIZHI 证据的参考库能力。
4. 操作区只提供查看代码、复制代码，不提供“复制样式”或其他附加入口。
