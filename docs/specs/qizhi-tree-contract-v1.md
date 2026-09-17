# QIZHI Tree API 契约 v1

状态：已审定  
负责人：Iris / Codex  
证据日期：2026-08-24

## 1. 目标与边界

- 将旧规范站 13 个 Tree Demo 迁移为 `@wangxiaojinger/qizhi-react` 正式组件。
- v1 支持数据驱动渲染、展开、单选、多选、复选、受控模式、异步加载、拖拽、回填策略、尺寸、节点图标、搜索和字段映射。
- v1 提供旧站“节点占一行”Demo 已验证的 `blockNode` 能力；不提供填充型分段组件，也不照搬无 QIZHI 证据的参考库能力。
- 节点可通过 `selectable: false` 禁止选择，同时保留分支展开能力。
- 拖拽按 Demo 明确意图修复为可用行为，不把旧站未成功排序的现状当作目标行为。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 旧规范站结构 | `index.html#component-tree` | 13 个 Demo 的标题、说明、数据、顺序和初始状态 | React API 形状 |
| 旧规范站视觉 | `styles.css` Tree 规则 | 360/480/520px 布局、24/28/32/36px 尺寸、选中与 hover | 未展示能力 |
| 旧规范站交互 | `script.js#initTreeDemos` | 展开、选择、复选、异步、搜索、尺寸和拖拽意图 | 拖拽已正确工作 |
| 正式公共组件 | `packages/qizhi-react/src/index.ts` | Checkbox、Button、Radio、Input 和 Icon 可复用 | Tree 已存在 |

## 3. 公共 API

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `treeData` | `readonly TreeNodeData[]` | `—` | 树节点数据，节点 key 必须全局唯一。 |
| `fieldNames` | `TreeFieldNames` | 标准字段名 | 映射 key、title、children、disabled、selectable、disableCheckbox 和 icon。 |
| `selectedKeys` | `readonly TreeKey[]` | `—` | 受控选中节点。 |
| `defaultSelectedKeys` | `readonly TreeKey[]` | `[]` | 非受控初始选中节点。 |
| `multiple` | `boolean` | `false` | 允许选择多个节点。 |
| `blockNode` | `boolean` | `false` | 节点标题占据整行剩余宽度。 |
| `onSelect` | `(keys, info) => void` | `—` | 节点选择变化回调。 |
| `expandedKeys` | `readonly TreeKey[]` | `—` | 受控展开节点。 |
| `defaultExpandedKeys` | `readonly TreeKey[]` | `[]` | 非受控初始展开节点。 |
| `onExpand` | `(keys, info) => void` | `—` | 节点展开变化回调。 |
| `checkable` | `boolean` | `false` | 显示节点复选框。 |
| `checkedKeys` | `readonly TreeKey[]` | `—` | 受控勾选节点。 |
| `defaultCheckedKeys` | `readonly TreeKey[]` | `[]` | 非受控初始勾选节点。 |
| `checkStrictly` | `boolean` | `false` | 父子节点勾选不联动。 |
| `checkedStrategy` | `"all" | "parent" | "child"` | `"all"` | `onCheck` 返回全部、父节点或叶子节点 key。 |
| `onCheck` | `(keys, info) => void` | `—` | 勾选变化回调。 |
| `loadData` | `(node) => Promise<readonly TreeNodeData[] | void>` | `—` | 展开未加载分支时异步加载子节点。 |
| `draggable` | `boolean` | `false` | 启用指针拖拽排序。 |
| `onDrop` | `(info) => void` | `—` | 排序完成后返回新 treeData 与源/目标信息。 |
| `size` | `"mini" | "small" | "default" | "large"` | `"default"` | 节点尺寸。 |
| `renderTitle` | `(node) => ReactNode` | `—` | 自定义节点标题渲染。 |
| `className` | `string` | `—` | 根节点类名。 |
| `style` | `CSSProperties` | `—` | 根节点样式。 |

根元素为 `div[role="tree"]`，ref 指向该元素。原生 div 属性除与组件契约冲突的属性外透传。

## 4. DOM、视觉与交互契约

- 使用 `qizhi-tree`、`qizhi-tree__node`、`qizhi-tree__switcher`、`qizhi-tree__title` 等正式公共类，不继承 Demo 类作为 API。
- 默认节点高 32px、标题高 28px、字号 14px；mini/small/default/large 节点高为 24/28/32/36px。
- 标题 hover 背景包裹内容；选中只改变标题文字为主色，不增加选中背景。
- 展开使用 `ChevronRightIcon`，加载使用 `LoadingIcon`，复选使用正式 `Checkbox`，节点图标使用传入 ReactNode。
- ArrowUp/ArrowDown 在可见节点间移动焦点；ArrowRight 展开或进入首个子节点；ArrowLeft 收起或返回父节点；Home/End 跳到首尾；Enter 选择；Space 在 checkable 时勾选，否则选择。
- 受控属性不得被内部状态覆盖；回调必须返回下一状态和触发节点。
- 拖拽不得把节点放入自身后代；成功排序后触发 `onDrop`。

## 5. Demo 与验收

- Demo 顺序固定为：基础用法、节点占一行、由 treeData 直接生成、多选、带复选框的树、受控模式、动态加载、拖拽、设置回填方式、不同尺寸、定制节点图标、搜索树、自定义 TreeData 的字段名称。
- “设置回填方式”和“不同尺寸”使用线框型 `Radio.Group type="button"`，不恢复填充型分段控件。
- Demo 预览、查看代码和复制代码使用同一 TSX 源文件。
- 验收覆盖类型、单元、文档、构建，以及 1440/1024/375 的真实交互、截图和控制台。
