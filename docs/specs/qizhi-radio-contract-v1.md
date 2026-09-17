# QIZHI Radio API 契约 v1

状态：已审定  
负责人：Iris / QIZHI  
证据日期：2026-08-21

## 1. 目标与边界

- 将旧规范站 Radio 中经业务审定的基础、单选框组和线框按钮 3 组能力迁移为 `@wangxiaojinger/qizhi-react` 正式组件。
- v1 支持单个 Radio、Radio.Group、`children` 与 `options` 两种组织方式、线框按钮型、三种按钮尺寸、禁用、受控和非受控选中。
- 填充型单选按钮没有 QIZHI 业务使用场景，不进入公开 API、文档、复制代码或 AI 可调用能力。
- v1 不提供 Arco 中旧站无证据的 `direction`、自定义图标、复杂字段映射或单独 Segmented 组件。
- Table 行单选、Choice Card、Form 布局控制与其他业务化单选本次不重构。Drawer 中普通 Radio 是后续消费者统一验收对象。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 旧站 Demo 盘点 | 迁移记录与本契约 | 原站曾有 4 组 Demo；填充型经后续业务审定删除 | React API 与事件签名 |
| 旧站样式 | `styles.css` 的 `.qizhi-radio*` | 14px 标记、28/32/36px 线框按钮尺寸、间距与状态颜色 | 公共 Props |
| 旧站交互 | `script.js#initRadioDemos` 及关联函数 | 组内互斥、禁用、数量/尺寸联动和隐藏选中项回退 | 受控模式 |
| 浏览器实测 | 1440/1024/375，2026-08-21 | 尺寸、无页面级横向溢出和数量 2 联动 | React 岛完整控制台状态 |
| 展示规范 | `docs/standards/react-component-docs.md` | 文档操作、代码同源、API 表和锚点 | Radio 特有 API |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 单个 Radio | 保留 | `Radio` | 基础 Demo |
| Radio Group | 保留 | `Radio.Group` | 单选框组 Demo |
| children 写法 | 保留 | Group 子 Radio 由 context 关联 | 第 1 行组 Demo |
| options 字符串/对象数组 | 保留 | `options` 支持原始值与 `{ label, value, disabled }` | 第 2、3 行组 Demo |
| 线框按钮 | 保留 | `type="button"` | 线框 Demo与业务审定 |
| 填充按钮 | 删除 | 不公开 `mode`，业务与 AI 均不可调用 | 当前无业务场景 |
| 尺寸 | 保留 | `small/default/large` = 28/32/36px，仅按钮型 | 线框按钮 Demo |
| 数量控制 | 保留为 Demo 状态 | 不是 Radio API，通过改变 options 实现 | 旧站控制器 |
| 文档分段控制器 | 文档内部保留 | 使用 `DemoSegmentedControl`，不从 `@wangxiaojinger/qizhi-react` 导出 | 数量与尺寸控制不属于业务 Radio |

## 4. 公共 API

### Radio

| 属性 | 类型 | 默认值 | 描述 | 组合规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `undefined` | 单选项标签 | 无 |
| `value` | `RadioValue` | `undefined` | 当前单选项值 | Group 中用于匹配 |
| `checked` | `boolean` | `undefined` | 受控选中 | 与 `defaultChecked` 二选一 |
| `defaultChecked` | `boolean` | `false` | 非受控初始选中 | Group 中由 Group 值接管 |
| `disabled` | `boolean` | `false` | 禁用当前选项 | Group 禁用时同时禁用 |
| `type` | `"radio" \| "button"` | `"radio"` | 标准圆形或按钮形态 | Group `type` 优先 |
| `size` | `"small" \| "default" \| "large"` | `"default"` | 按钮型尺寸 | 仅 `type="button"` 生效；Group 值优先 |
| `onChange` | `(checked, value, event) => void` | `undefined` | 当前项变为选中时触发 | 禁用时不触发 |

- 继承 `InputHTMLAttributes<HTMLInputElement>` 的通用属性，但覆盖 `type`、`size`、`value`、`checked`、`defaultChecked`、`onChange`、`children`。
- `className` 和 `style` 作用于根 `<label>`；`ref` 指向 `<input type="radio">`。

### Radio.Group

| 属性 | 类型 | 默认值 | 描述 | 组合规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `undefined` | Radio 子项 | 与 `options` 二选一；同时传入时优先 children |
| `options` | `readonly (RadioValue \| RadioOption)[]` | `undefined` | 批量选项 | 字符串/数字直接同时作为 label/value |
| `value` | `RadioValue` | `undefined` | 受控组值 | 与 `defaultValue` 二选一 |
| `defaultValue` | `RadioValue` | `undefined` | 非受控初始值 | 无 |
| `disabled` | `boolean` | `false` | 禁用整组 | 子项不可覆盖为可用 |
| `type` | `"radio" \| "button"` | `"radio"` | 组内外观 | 覆盖子项 |
| `size` | `"small" \| "default" \| "large"` | `"default"` | 按钮型尺寸 | 仅 `type="button"` 生效 |
| `name` | `string` | 组件自动生成 | 原生 radio name | 所有子项共享 |
| `onChange` | `(value, event) => void` | `undefined` | 组值改变时触发 | 禁用项不触发 |

- Group 根节点为 `<div role="radiogroup">`，继承 `HTMLAttributes<HTMLDivElement>` 的通用属性。

## 5. DOM、交互与无障碍

- 标准 Radio 渲染 `<label><input type="radio"><span aria-hidden>...</span><span>...</span></label>`。
- 按钮型仍保留真实 radio input，组根提供 `radiogroup`，不用普通 Button 代替表单语义。
- 点击标签或用 Space 激活原生 radio；选择新项后同组互斥，受控模式不自行修改值。
- 禁用 input 不可聚焦、不发出变更事件，根节点同步禁用样式。
- 标准标记 14×14px，外层 16×16px，文字 14px/22px，间距 8px。
- 线框按钮 small/default/large 高 28/32/36px，按内容自适应宽度，左右 padding 16px，组首尾外圆角 2px。
- `RadioProps` 与 `RadioGroupProps` 均不提供 `mode`；业务代码出现 `mode="fill"` 必须在 TypeScript 检查中失败。

## 6. Demo 与 API 元数据

- Demo 顺序固定为：基础用法、单选框组、线框型单选按钮组。
- 第 2 组保留三行可见 UI：children、字符串 options、对象 options；保留旧站已确认说明，不自行改写。
- 线框按钮组保留“数量 / 尺寸 / 组件”布局，默认 3 项、default 32px、北京选中；数量和尺寸使用文档内部 `DemoSegmentedControl`。
- Demo 操作复用正式 `Button`、`CodeIcon`、`CopyIcon`；无 Dropdown，不新增图标。
- 每个 Demo 独立 TSX，预览、展开与复制同源，不显示 `Demo.tsx`、文件路径或语言徽标。
- API 元数据字段为 `name/description/type/defaultValue`，必须分别展示 Radio 和 Radio.Group。
- AI 只能生成标准圆形 Radio 或 `type="button"` 线框 Radio；禁止生成 `mode`、`mode="fill"` 或把文档内部 `DemoSegmentedControl` 导入业务代码。

## 7. 测试矩阵与发布门槛

- 类型：Radio/Group 受控与非受控、options 值型、ref 和事件参数。
- 单元：默认 DOM、组内互斥、disabled、children/options、三尺寸、线框按钮、受控/非受控和 ref。
- 文档：3 组 Demo 顺序、实例数、正式包导入、源码同源、API 一致、公共 Button/Icon 复用，以及文档分段控制器行为。
- E2E：鼠标、键盘、禁用、数量/尺寸、回退、几何、溢出、控制台和 1440/1024/375 局部截图。
- 完整执行 `node --check script.js`、`pnpm verify` 和 Radio 三档 Playwright。
- 执行者最多声明 `candidate_pass`；独立验证保持 `pending`。
