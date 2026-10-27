# QIZHI Table 用户列定制契约 v1

## 目标与非目标

本契约定义 QIZHI `Table` 的可选列移动、独立调宽、列显隐及设置面板。它保持既有 `Table` 默认布局：未传入列定制相关属性时，不改变列顺序、列宽、可见性、业务回调或持久化行为。

列定制只管理当前 `columns` 的展示布局；不管理服务端字段、筛选、授权、导出、响应式隐藏、虚拟化、列分组或任何存储介质。业务不能把“列在界面隐藏”当作数据或权限控制。

## 类型与启用方式

```ts
interface TableColumnLayoutState {
  schemaVersion: 1;
  columnOrder: string[];
  columnWidths: Record<string, number>;
  columnVisibility: Record<string, boolean>;
}

interface TableColumnLayoutMeta {
  reason: "order" | "width" | "visibility" | "reset";
  columnKey?: string;
}

interface TableColumnCustomization {
  reorder?: boolean;
  resize?: boolean;
  visibility?: boolean;
  settings?: boolean;
  renderSettings?: (trigger: ReactElement) => ReactNode;
  locale?: Partial<TableColumnCustomizationLocale>;
}
```

- `columnCustomization` 内四种交互均默认关闭，按需独立开启。`settings` 只提供显隐入口与面板，不重复提供移动／调宽操作；`visibility` 决定复选框是否可编辑。`renderSettings` 可通过 Portal 将完整入口放入已有工具栏。
- 传入 `columnLayout`、`defaultColumnLayout` 或 `columnCustomization` 中任一项才启用布局状态层。仅传状态时可以只读恢复布局，不会默认开启移动、调宽或显隐。
- 所有源列 `key` 必须是唯一非空字符串；否则 Table 不启用列定制，按源列定义渲染。不得按下标生成或保存补充键。

## 受控、初始值与回调

- `columnLayout` 是受控状态。操作成功时组件通过 `onColumnLayoutChange(next, meta)` 请求外部更新；外部未回传新值时，受控界面不先显示为已提交。
- `defaultColumnLayout` 只在非受控首轮读取；实例存续期间更新它不会重置用户选择。两者并存时 `columnLayout` 优先。
- `onColumnLayoutChange` 只在一个有效用户动作产生真实变化时调用一次，传入独立的完整快照。组件操作的 reason 是 order／width／visibility；reset 类型保留兼容，业务可以在自己的恢复入口复用布局处理函数，外部受控值恢复不触发组件用户提交事件。
- 受控使用方须先同步更新本地状态，再异步保存；不要等网络完成才回传。异步恢复通过受控值完成，须丢弃旧账号或旧工作空间的迟到响应，并避免覆盖恢复期间用户已完成的操作。
- 取消调宽、等价动作、非法操作、外部受控值替换、默认值初始化与内部清理都不回调。恢复默认总是从**当前**列定义生成，不从首次 `defaultColumnLayout` 复用旧快照。

## 规范化与列定义变化

- 只接受 `schemaVersion: 1`；无效版本或损坏根结构回退到当前默认。`columnOrder`、`columnWidths`、`columnVisibility` 都以当前唯一非空键为白名单，删除未知、失效和已移除键。结果中的顺序与显隐映射是完整快照，宽度映射只保留用户显式宽度。
- 已保存顺序只在当前连续段内生效：普通、`fixed: "left"`、`fixed: "right"` 互为边界；`movable: false` 是独立屏障。缺失的新列按当前源定义顺序追加到所属段，不能跨过固定区或锁列。
- `columnOrder` 始终保留隐藏列，所以重新显示后回到其保存位置。`hideable: false` 与受保护的树入口始终可见；`layoutRole` 默认 `data`，`action` 不计入“至少保留一列可见数据列”。没有 data 列的防御场景仍保留一列可见。
- `resizable: false` 不读取或保存用户宽度。有效宽度必须是有限正数，并按当前 `minWidth`／`maxWidth` 钳制；无显式最小值时为 64px，冲突边界以最小值优先。布局在源列、边界或业务列集合变化后重新规范化，但这不是用户写入。

## 渲染与交互边界

- 列设置面板只管理显隐：展示单行列名、复选框、全选及必需列说明，不提供列宽输入、前移／后移或整表恢复默认。不产生横向滚动；列数超出可用高度时仅纵向滚动。关闭 visibility 时复选框只读，不影响表头按 reorder／resize 启用移动和调宽。
- 面板使用内容固有宽度，按最长列名、复选框与必要间距自然撑开，不设置固定宽度或继承通用气泡标题的最小宽度。视口减去安全间距仅作为最大边界，不作为正常面板宽度。
- 恢复整个布局由业务显式入口调用 defaultColumnLayout(columns) 并回传受控值；示例将入口放在开发配置区。切换显隐不能顺便重置列顺序或手动宽度。

- 用户手动宽度优先于自动预算。未手动的百分比、字符串或自动列，在首次调宽前以实际 `<col>` 像素作为该次布局基准，不把它们自动写入 `columnWidths`。手动总宽小于容器允许表格在满宽滚动容器内留白；超过容器只在该容器内滚动。
- 有效 `columnWidths[key]` 优先于 `columns.width`，但仍受当前 min/max 约束。按容器重建 columns 的业务封装无需删除；它只提供未手动列的预算。普通重渲染、新 columns 数组、数据刷新和容器变化都不是重置指令；恢复默认才清除手动宽度。
- `treeColumnKey` 给树形缩进／展开指定稳定键，列物理位置变化不改变树入口，且该列不可隐藏。未传入时树形数据使用当前第一列作为入口。
- 数据中出现 `onCell().colSpan` 合并时，移动和显隐暂时关闭，渲染回到当前源列的完整顺序和可见性；调宽保留。只使用 `rowSpan` 不会触发这项限制。
- 表头移动入口支持拖拽，也可在焦点位用左右方向键逐列移动。调宽手柄是可聚焦的垂直分隔符：左右方向键调整 8px，`Shift` 加方向键调整 1px，`Home` 到最小值，有限最大值时 `End` 到最大值；指针拖动中可用 `Esc` 取消。显隐面板不再提供重复的移动或调宽操作。

## 持久化边界

组件核心不读写 `localStorage`、URL、接口或权限。业务如需保存，只能在 `onColumnLayoutChange` 接收布局后自行序列化，并按用户、租户/权限范围、列表版本和列集合隔离键。

读取存储必须捕获 JSON 损坏和不可用错误，再交给当前列定义规范化；不保存访问令牌、密钥、接口响应、原始列定义或含敏感信息的业务数据。恢复、定义变化或权限收缩导致的无回调规范化，不应被误写回为用户最近一次操作。

`schemaVersion` 只表示组件布局格式。业务列含义变化须迁移或升级独立业务版本；不能复用旧 key 表示不同含义。

## 最小接入与完整示例

```tsx
const [layout, setLayout] = useState(() => defaultColumnLayout(columns));

<Table
  columns={columns}
  dataSource={rows}
  rowKey="id"
  columnCustomization={{ reorder: true, resize: true, visibility: true, settings: true }}
  columnLayout={layout}
  onColumnLayoutChange={(next) => setLayout(next)}
/>
```

无需受控时省略 `columnLayout`，可传 `defaultColumnLayout`。只需调宽时使用 `{ resize: true }`，不会自动出现设置入口。

完整、可复制的持久化示例是 [CustomizationDemo.tsx](../../apps/qizhi-docs/src/table/demos/CustomizationDemo.tsx)。它将 app、user、space、稳定 tableId 与业务版本逐项编码进存储键；以作用域 key 重挂载受控示例，不在初始化时写入；只在提交回调保存，reset 删除缓存，失败不撤销界面。模块初始化不访问 window，读取与写入均处理异常。演示只使用本地数据，不涉及异步请求。

Qways 示例中的模型字段、价格、筛选、账号切换、固定操作列、禁用试用入口均属于业务组合；没有成为 Table 默认行为。旧接入无需修改，采用新能力才需补稳定 key 和按需配置。

## 验收边界

验证至少覆盖：受控未回传、非受控首轮与 reset、损坏/旧版状态、增删列、固定区与锁列、隐藏列恢复排序、必显与最少数据列、树入口、百分比/自动列首次调宽、调宽取消与键盘路径、`colSpan` 与仅 `rowSpan`、满宽默认布局与手动留白/内部滚动。实现测试通过只表示候选结果；发布包与业务接入须另行核验。
