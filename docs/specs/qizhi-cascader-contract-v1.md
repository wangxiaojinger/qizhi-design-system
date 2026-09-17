# QIZHI Cascader API 契约 v1

状态：待用户审定  
负责人：林猫猫  
证据日期：2026-08-19

## 1. 目标与边界

- 将旧规范站 Cascader 的全部现有能力迁移为可构建、可测试、可从 `@wangxiaojinger/qizhi-react` 导入的正式组件。
- 官网保留旧站全部能力与顺序，但 Demo 必须直接调用正式组件，预览、源码和复制内容使用同一 TSX。
- v1 解决多级路径单选、多选、搜索、异步展开、定制展示和受控状态。
- v1 不提供旧站无证据的远程搜索、虚拟列表、分页、自定义弹层容器、整组件 loading、组件级 disabled、半选态和移动端专用形态。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 旧站 Cascader 页面 | `index.html#component-cascader` | 15 个章节、28 个实例及其文案、组合与顺序 | `data-*` 不能自动成为 React Props |
| 旧站交互 | `script.js` 的 `initCascaderDemos` | 路径展开、搜索、清除、多选标签、拖拽、异步与键盘开关 | 未完整实现方向键导航和生产级异步错误协议 |
| 旧站样式 | `styles.css` 的 `.cascader-demo*` | 28/32/36px、输入盒、标签、菜单、状态、图标和响应式基线 | Demo 布局与祖先 `overflow` 不能成为公共组件依赖 |
| 输入公共协议复盘 | 2026-08-11 执行证据 | 28 个实例、唯一 popup ID、真实 combobox、Escape、焦点恢复和三视口曾通过 | 不等于 React 版本已经实现或独立验证 |
| 裁切事故复盘 | `AGENTS.md` 第 14 节 | 必须检查完整祖先裁切链，不能只测坐标与页面溢出 | 不指定公共 API |
| React 迁移方法 | `docs/methodology/react-component-migration.md` | 契约先行、正式包唯一来源、同源文档和分层验收 | 不替代 Cascader 产品决策 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 逐级路径选择 | 保留并正式化 | `options` + 路径 value | 基础用法 |
| 点击/悬停展开 | 保留 | `expandTrigger="click" | "hover"` | 基础用法 |
| 清除 | 修改 | `allowClear` 显式开启，默认 `false` | 文档是显式能力；旧脚本全局强制开启属于实现漂移 |
| 前置标签 | 保留 | `addBefore?: ReactNode` | 前置标签 Demo |
| 格式化显示 | 保留 | `renderFormat(labels, selectedOptions)` | 格式化 Demo |
| 自定义触发器 | 修改 | `trigger` render prop，组件提供完整触发属性 | 直接覆盖 children 容易丢失 ARIA/ref/事件 |
| 尺寸 | 保留 | `mini | small | default | large` = 24/28/32/36px | 尺寸 Demo |
| 状态 | 保留 | `default | error | warning` | 基础 Demo 有视觉证据 |
| 自定义字段 | 保留 | `fieldNames` 映射五个字段 | 自定义字段名 Demo |
| 多选 | 保留 | `mode="multiple"` 使用路径数组集合 | 多选 Demo |
| 拖拽排序 | 保留并约束 | `dragToSort` 仅多选可用 | 拖拽 Demo |
| 选择中间级 | 保留 | `changeOnSelect` | 选择即改变 Demo |
| 回显策略 | 收敛 | v1 支持 `all | parent` | 旧站只证明默认与 parent |
| 搜索 | 保留 | `showSearch` 开启本地路径搜索 | 搜索 Demo |
| 自定义搜索 | 保留 | `filterOption(input, optionPath)` | 自定义搜索 Demo |
| 动态加载 | 修改 | `loadMore(option, path)` 返回 Promise，调用方更新 options | 旧站 loadMore 证明异步能力但未定义所有权 |
| 禁用选项 | 保留 | `option.disabled` | 禁用项 Demo |
| 受控模式 | 保留并正式化 | value/open 均支持受控和非受控 | 受控模式 Demo |
| Portal 定位 | 修改内部实现 | 默认 portal 到 body，不提供自定义容器 | 避免已知祖先裁切问题 |
| 远程搜索、虚拟化等 | 待定且不导出 | v1 不提供 | 旧站无证据 |

## 4. 公共类型与 API

```ts
export type CascaderRawValue = string | number;
export type CascaderPathValue = CascaderRawValue[];
export type CascaderStatus = "default" | "error" | "warning";
export type CascaderSize = "mini" | "small" | "default" | "large";
export type CascaderExpandTrigger = "click" | "hover";
export type CascaderCheckedStrategy = "all" | "parent";

export interface CascaderOption {
  label?: ReactNode;
  value?: CascaderRawValue;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
  [field: string]: unknown;
}

export interface CascaderFieldNames {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
  isLeaf?: string;
}

export interface CascaderTriggerProps {
  ref: Ref<HTMLElement>;
  role: "combobox";
  tabIndex: number;
  "aria-haspopup": "listbox";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: MouseEventHandler<HTMLElement>;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
}

interface CascaderCommonProps {
  options: CascaderOption[];
  fieldNames?: CascaderFieldNames;
  placeholder?: string;
  size?: CascaderSize;
  status?: CascaderStatus;
  expandTrigger?: CascaderExpandTrigger;
  allowClear?: boolean;
  addBefore?: ReactNode;
  showSearch?: boolean;
  filterOption?: (input: string, optionPath: CascaderOption[]) => boolean;
  changeOnSelect?: boolean;
  loadMore?: (option: CascaderOption, optionPath: CascaderOption[]) => Promise<void>;
  renderFormat?: (labels: ReactNode[], selectedOptions: CascaderOption[]) => ReactNode;
  trigger?: (props: CascaderTriggerProps) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface CascaderSingleProps extends CascaderCommonProps {
  mode?: "single";
  value?: CascaderPathValue;
  defaultValue?: CascaderPathValue;
  onChange?: (value: CascaderPathValue | undefined, selectedOptions: CascaderOption[]) => void;
  checkedStrategy?: never;
  dragToSort?: never;
}

export interface CascaderMultipleProps extends CascaderCommonProps {
  mode: "multiple";
  value?: CascaderPathValue[];
  defaultValue?: CascaderPathValue[];
  onChange?: (value: CascaderPathValue[], selectedOptions: CascaderOption[][]) => void;
  checkedStrategy?: CascaderCheckedStrategy;
  dragToSort?: boolean;
}

export type CascaderProps = CascaderSingleProps | CascaderMultipleProps;
export type CascaderHandle = HTMLInputElement | HTMLElement;
```

### 默认值

| 属性 | 默认值 |
|---|---|
| `mode` | `"single"` |
| `placeholder` | `"请选择"` |
| `size` | `"default"` |
| `status` | `"default"` |
| `expandTrigger` | `"click"` |
| `allowClear` | `false` |
| `showSearch` | `false` |
| `changeOnSelect` | `false` |
| `checkedStrategy` | `"all"` |
| `dragToSort` | `false` |
| `defaultOpen` | `false` |

### 组合与受控规则

- `mode="single"` 的 value 是一条路径；`mode="multiple"` 的 value 是路径集合，类型不可混用。
- `dragToSort` 与 `checkedStrategy` 只属于多选分支；类型测试必须证明单选不可传入。
- 提供 `value` 时由调用方负责更新；提供 `open` 时由调用方负责更新。组件不得在受控模式静默回退为内部状态。
- 同一状态不得同时依赖 `value` 与 `defaultValue`，或 `open` 与 `defaultOpen`；开发环境给出警告。
- `filterOption` 仅在 `showSearch=true` 时生效；否则不创建隐藏搜索逻辑。
- `loadMore` 与 `isLeaf=false` 配合。Promise 完成后读取调用方提供的新 options；组件不直接写入 option.children。
- 根 ref 默认指向输入；使用自定义触发器时指向 render prop 绑定的实际触发元素。

## 5. DOM 和样式契约

- 公共命名只使用 `qizhi-cascader*`，禁止 `arco-*` 或 `ac-*`。
- 默认根容器使用内部统一结构标记 `qizhi-control-container`，由根容器统一承担尺寸、边框、圆角、背景和状态；内部真实 input 只承担值、焦点、搜索和 combobox 语义。
- 统一结构不新增公共 Props；自定义 `trigger` 仍按既有契约由调用方负责视觉，不强加默认输入盒。
- 默认结构为根容器、输入区域、可选前置标签、多选标签、清除槽、箭头槽；弹层通过 Portal 渲染到 body。
- 级联列与选项复用正式 `Dropdown.Menu` / `Dropdown.Item` 的容器和菜单项基线，并分别使用 `listbox` / `option` 语义；不在 Cascader 内仿写第二套下拉菜单。
- 默认触发输入为真实 `<input role="combobox">`；非搜索态 `readOnly`，搜索态可编辑。
- 尺寸高度分别为 28/32/36px；默认宽度由调用方/容器决定，组件使用 `width:100%` 与合理 `min-width`，不把 Demo 的 300px 暴露为组件 API。
- 圆角 2px；箭头和清除图标槽均为 16px；所有下拉触发器使用 QIZHI `icon-箭头-向下-面性`；颜色、边框、背景、阴影和状态全部消费现有 QIZHI Token。
- 开启 `allowClear` 且已有值时，默认仍显示下拉箭头；鼠标悬停或键盘聚焦时，清除按钮在同一图标槽中替换箭头，不得同时显示。
- 多选标签不压缩到不可读；超出输入宽度时在组件内部裁剪，拖拽不改变组件总宽。
- 使用 `trigger` 时不渲染默认输入框的宽度、边框、背景和焦点环；触发元素外观由调用方负责，组件只提供交互与 ARIA 契约。
- 菜单项高度 32px；列间用 `color-border-1` 分隔；hover/active 使用 `color-fill-1`。
- 弹层在视口中夹紧/翻转，不依赖消费容器设置 `overflow:visible`；不增加第三方定位依赖。
- Demo 网格、尺寸控制器和文档容器不属于公共 API。

## 6. 交互和状态

| 状态 | 触发条件 | 视觉 | 事件 | 焦点 | ARIA |
|---|---|---|---|---|---|
| default | 默认关闭 | 标准边框和占位符 | 无 | 输入可聚焦 | `aria-expanded=false` |
| hover | 指针进入 | 主色边框 | hover 模式可展开子级 | 不抢焦点 | 状态不伪报 |
| active/open | 弹层打开 | 主色边框、焦点环、箭头翻转 | `onOpenChange(true)` | 保留在输入/活动选项模型 | `aria-expanded=true` |
| focus-visible | 键盘聚焦 | 可见主色焦点环 | 无 | 输入 | active descendant 可用 |
| error | `status="error"` | danger 边框 | 行为不变 | 行为不变 | 调用方用文本描述错误 |
| warning | `status="warning"` | warning 边框 | 行为不变 | 行为不变 | 调用方用文本描述警告 |
| option disabled | option 字段为真 | `color-text-4` | 不选择、不加载 | 导航可跳过 | `aria-disabled=true` |
| option loading | loadMore pending | 局部 loading 图标 | 防重复请求 | 活动路径保留 | `aria-busy=true` |
| empty | options/搜索结果为空 | 中文空状态 | 不触发 change | 输入保留焦点 | `role=status` |

- 单选叶子选择后默认关闭弹层；`changeOnSelect` 选择中间级也触发 change 并关闭。
- 多选选择后保持弹层打开；清除触发空集合并保留输入焦点。
- 外部点击关闭；弹层内部 DOM 重绘不得被误判为外部点击。
- `loadMore` rejected 后解除 loading、保持弹层和焦点，并允许重试；不调用 `onChange`。
- 拖拽排序完成后调用同一个 `onChange`，其 value 与 selectedOptions 顺序一致。

## 7. 键盘与无障碍

- 默认输入：`role="combobox"`、`aria-haspopup="listbox"`、唯一 `aria-controls`、`aria-expanded`。
- 搜索态增加 `aria-autocomplete="list"`；活动选项通过 `aria-activedescendant` 关联唯一 ID。
- 每列使用 `role="listbox"`，选项使用 `role="option"`、`aria-selected`、必要时 `aria-disabled`；多选列设置 `aria-multiselectable="true"`。
- Enter 或 Space 打开；ArrowDown/ArrowUp 在当前列移动；ArrowRight 展开有子级节点；ArrowLeft 返回父级；Enter 选择；Escape 关闭；Tab 关闭并继续正常焦点顺序。
- `expandTrigger="hover"` 只改变鼠标路径；键盘不依赖 hover。
- 清除和关闭后触发器焦点可预测；Portal 不形成焦点陷阱。
- 自定义触发 render prop 必须把全部 props 和 ref 绑定到一个可聚焦元素；开发环境检查缺失绑定并警告。
- 动效兼容 `prefers-reduced-motion: reduce`。

## 8. Demo 与 API 元数据

Demo 顺序：基础用法、允许清除、前置标签、格式化展示、自定义选择框、不同尺寸、自定义字段名、拖拽排序、选择即改变、支持多选、允许搜索、自定义搜索、动态加载、选项禁用、受控模式、API。

- 基础 Demo 同时展示 click、hover、error、warning。
- 所有 Demo 从 `@wangxiaojinger/qizhi-react` 导入 Cascader；预览、展开和复制来自同一 TSX。
- API 元数据字段为 `name/description/type/defaultValue`，并表达单选/多选联合类型和能力限制。
- AI 规则明确：地区、组织、类目等层级路径使用 Cascader；平铺选项使用 Select；异步加载由调用方更新 options；不通过 DOM 或 CSS 读取业务 value。
- React Island 挂载后派发 `qizhi:react-island-ready`，API 锚点固定为 `cascader-API`。

## 9. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 类型 | 单选/多选 value、事件、非法 drag/strategy 组合、render prop、loadMore、ref |
| 模型 | 字段映射、路径查找、展平搜索、默认/自定义过滤、策略、去重、无效路径 |
| 单元 | 默认值、受控状态、选择/清除、搜索、异步成功/失败/重试、拖拽、禁用、ARIA、焦点 |
| 文档 | 15 组 Demo 顺序、正式导入、源码同源、API 一致、唯一锚点与目录重建事件 |
| E2E | 点击/hover/键盘全路径、重绘后的外部点击、Portal 裁切链、翻转/夹紧、三视口、控制台、截图 |

## 10. 发布门槛

- [ ] 契约经用户审定，不以实现替代产品决策。
- [ ] 所有新增行为均有先失败后通过的测试证据。
- [ ] 类型检查、单元测试和构建通过。
- [ ] 正式组件和类型可从 `@wangxiaojinger/qizhi-react` 导入，CSS 入口有效。
- [ ] 官网全部 Demo 消费正式包，源码与 API 同源。
- [ ] 鼠标、键盘、异步失败、Portal、1440/1024/375 和局部截图完成验收。
- [ ] 执行者状态仅为 `candidate_pass`，独立最终验证保持 `pending`。
