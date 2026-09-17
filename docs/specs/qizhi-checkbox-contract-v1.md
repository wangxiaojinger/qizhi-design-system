# QIZHI Checkbox API 契约 v1

状态：已审定  
负责人：Iris / QIZHI  
证据日期：2026-08-21

## 1. 目标与边界

- 将旧规范站 Checkbox 的基础用法、受控、复选框组、全选和布局 5 组 Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式组件。
- v1 支持单个 Checkbox、`Checkbox.Group`、受控与非受控状态、禁用、半选、横纵方向、`children` 与 `options` 两种组装方式。
- v1 只有旧站已有的 16px 视觉尺寸，不增加尺寸、按钮型、自定义图标、字段映射等无 QIZHI 证据的 API。
- Table、Tree、Select、Modal 等现有消费者纳入回归检查，但不在本次迁移中扩大重构。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 旧站 Demo | 根目录 `index.html#component-checkbox` | 5 组标题、说明、数量、布局和初始状态 | React 事件签名 |
| 旧站样式 | 根目录 `styles.css` 的 `.qizhi-checkbox*` | 16px 标记、2px 圆角、8px图文间距及状态颜色 | 公共 Props |
| 旧站交互 | 根目录 `script.js#initCheckboxDemo` | 点击、键盘、受控按钮、全选与半选联动 | React 受控模式 |
| 浏览器实测 | 1440/1024/375，2026-08-21 | 旧站初始 UI、交互及移动端布局溢出 | React 岛验收结果 |
| 展示规范 | `docs/standards/react-component-docs.md` | 文档操作、代码同源、API 表和锚点 | Checkbox 特有 API |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 单个 Checkbox | 保留 | `Checkbox` | 基础、受控 Demo |
| Checkbox Group | 保留 | `Checkbox.Group` | 复选框组 Demo |
| 受控/非受控 | 保留 | `checked/defaultChecked`、`value/defaultValue` | 基础与受控 Demo |
| 半选 | 保留 | `indeterminate` 同步原生 input 属性和视觉 | 全选 Demo |
| 禁用 | 保留 | 单项与整组禁用 | 基础、组、布局 Demo |
| 横纵方向 | 保留 | Group `direction` | 复选框组 Demo |
| options | 保留 | 支持原始值和 `{ label, value, disabled }` | 组 Demo 的批量表达 |
| 布局 Grid | 修改 | Demo 层 CSS Grid，不导出不存在的 Grid | 当前包无正式 Grid |
| 尺寸/按钮型/图标槽 | 删除 | 不进入 v1 | 旧站无证据 |

## 4. 公共 API

### Checkbox

| 属性 | 类型 | 默认值 | 描述 | 组合规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `undefined` | 复选项标签内容 | 无 |
| `value` | `CheckboxValue` | `undefined` | 当前项值 | Group 中用于匹配 |
| `checked` | `boolean` | `undefined` | 受控选中状态 | 与 `defaultChecked` 二选一 |
| `defaultChecked` | `boolean` | `false` | 非受控初始选中状态 | Group 中由 Group 值接管 |
| `indeterminate` | `boolean` | `false` | 半选状态 | 同步到原生 input 的 `indeterminate` 属性 |
| `disabled` | `boolean` | `false` | 禁用当前项 | Group 禁用时同时禁用 |
| `onChange` | `(checked, event) => void` | `undefined` | 选中状态变化时触发 | 禁用时不触发 |
| `className` | `string` | `undefined` | 根 label 类名 | 无 |
| `style` | `CSSProperties` | `undefined` | 根 label 样式 | 无 |
| `ref` | `Ref<HTMLInputElement>` | `undefined` | 指向原生 checkbox input | 无 |

- 继承 `InputHTMLAttributes<HTMLInputElement>` 的通用属性，但覆盖冲突字段。
- `ref` 指向真实 `<input type="checkbox">`。

### Checkbox.Group

| 属性 | 类型 | 默认值 | 描述 | 组合规则 |
|---|---|---|---|---|
| `children` | `ReactNode` | `undefined` | Checkbox 子项 | 与 `options` 同时传入时优先 |
| `options` | `readonly (CheckboxValue \| CheckboxOption)[]` | `undefined` | 批量选项 | 原始值同时作为 label/value |
| `value` | `readonly CheckboxValue[]` | `undefined` | 受控组值 | 与 `defaultValue` 二选一 |
| `defaultValue` | `readonly CheckboxValue[]` | `[]` | 非受控初始值 | 无 |
| `disabled` | `boolean` | `false` | 禁用整组 | 子项不可覆盖为可用 |
| `direction` | `"horizontal" \| "vertical"` | `horizontal` | 组排列方向 | 只负责基础排列，不承担业务网格 |
| `onChange` | `(values, event) => void` | `undefined` | 组值变化时返回下一值 | 禁用项不触发 |

- Group 根节点为 `<div role="group">`，继承 `HTMLAttributes<HTMLDivElement>`。

### 类型定义

```ts
type CheckboxValue = string | number;

interface CheckboxOption {
  label: ReactNode;
  value: CheckboxValue;
  disabled?: boolean;
}
```

- `CheckboxOption` 不包含 `icon`。v1 不提供 `error`、`icon` 或 `useCheckbox`。

## 5. DOM、视觉与无障碍

- Checkbox 渲染真实 `<input type="checkbox">`，点击标签和 Space 使用原生语义。
- 标记外层 16×16px、方框 14×14px、圆角 2px，文字 14px/22px，图文间距 8px。
- 选中状态不得显示常驻外轮廓；仅 `input:focus-visible` 时显示 2px 聚焦轮廓。
- 禁用项不可聚焦和触发变更；半选状态同步原生 DOM 属性。
- Group 横向使用可换行 Flex，纵向使用 Grid；移动端布局 Demo 改为两列，不复制旧站 384px 内部溢出。
- 勾形和半选横线是组件内部状态图形，不暴露图标 API，也不误用 `CheckCircleIcon`。

## 6. Demo 与 API 元数据

- Demo 顺序固定为：基础用法、受控、复选框组、全选、布局。
- 初始实例数量依次为 4、2、10、4、5。
- 受控 Demo 的操作复用正式 `Button`；查看/复制复用 `Button`、`CodeIcon`、`CopyIcon`。
- 每个 Demo 独立 TSX，预览、展示与复制同源，不显示文件名或语言徽标。
- 布局 Demo 使用文档层 CSS Grid，说明与复制代码不得声称使用尚不存在的 QIZHI Grid。
- API 元数据只展示本契约实际实现能力，不照搬 Arco。

## 7. 测试矩阵与发布门槛

- 类型：单项和 Group 受控/非受控、options、ref、事件参数及未审定 API 拒绝。
- 单元：默认 DOM、点击/Space、禁用、半选、Group 增删、children/options、横纵方向、受控与 ref。
- 文档：5 组顺序、实例数、正式包导入、源码同源、API 一致、公共 Button/Icon 复用。
- E2E：鼠标、键盘、禁用、受控按钮、全选/半选、几何、focus-visible、溢出、控制台和三视口截图。
- 完整执行 `node --check script.js`、`pnpm verify` 和 Checkbox Playwright。
- 执行者最多声明 `candidate_pass`；独立验证保持 `pending`。
