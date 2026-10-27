# QIZHI Table v1 组件契约

## 范围

Table v1 提供 13 个当前业务需要的 Demo：基础用法、多行与省略、排序、固定列、开启选择、展开行、嵌套子表格、树形数据展示、表格属性、单元格合并、拖拽排序、列宽与自适应、用户列定制。表头吸顶和表头分组不纳入当前公共能力。

正式实现复用 `Pagination`、`Empty`、`Button`、`Link` 与 QIZHI 图标。选择控件和加载态属于 Table 内部结构，不对外新增 Checkbox、Radio 或 Spin 组件。

## 公共类型

列表／表格数据单元格内的文字按钮（Button type="text"）与 Link，左右内边距统一为 0，以保持与普通文本的对齐。上下内边距、颜色、禁用和点击行为不变；普通按钮、表格外控件不受此规则影响。

```ts
type TableSize = "default" | "middle" | "small";
type TableRowKey = string | number;
type TableSortOrder = "ascend" | "descend" | null;
type TableFixed = "left" | "right";
type TablePaginationPosition = "bottomLeft" | "bottomCenter" | "bottomRight";
type TableLayout = "fixed" | "auto";
type TableLayoutMode = "fill" | "compact";
type TableColumnAlign = "left" | "center" | "right";
```

`TableProps<RecordType>` 实现：`columns`、`dataSource`、`rowKey`、`size`、`border`、`borderCell`、`hover`、`stripe`、`showHeader`、`loading`、`fixedBreakpoint`、`scrollX`、`tableLayout`、`layoutMode`、`columnCustomization`、`columnLayout`、`defaultColumnLayout`、`onColumnLayoutChange`、`treeColumnKey`、`rowSelection`、`expandable`、`childrenColumnName`、`pagination`、`empty`、`emptyPadding`、`emptyCell`、`draggable`、`showSorterTooltip`、`onSortChange`、`onRowOrderChange`、`className`、`style`、`aria-label`。

默认值：`size="default"`、`border=false`、`borderCell=false`、`hover=true`、`stripe=false`、`showHeader=true`、`loading=false`、`tableLayout="fixed"`、`layoutMode="fill"`、`pagination=false`、`childrenColumnName="children"`、`draggable=false`。数据单元格默认自然换行，行高随内容撑开。`size="default"` 使用 16px 上下内边距，`size="middle"` 使用 12px，`size="small"` 使用 8px，不将表头或内容行锁定为固定高度。

`TableColumn<RecordType>` 实现：`key`、`title`、`dataIndex`、`width`、`minWidth`、`maxWidth`、`grow`、`shrink`、`growPriority`、`shrinkPriority`、`align`、`fixed`、`movable`、`resizable`、`hideable`、`defaultVisible`、`settingsLabel`、`layoutRole`、`ellipsis`、`render`、`sorter`、`sortDirections`、`defaultSortOrder`、`showSorterTooltip`、`onCell`。`align` 默认为左对齐，排序表头与数据单元格同步对齐。`ellipsis` 默认为 `false`；设为 `true` 或 `{ showTitle }` 时该列单行省略，`showTitle` 默认为 `true`，仅在单元格内容是字符串或数字时输出原生 `title`。排序按未排序、升序、降序、未排序循环，并通过 `onSortChange` 回传。

`TableRowSelection<RecordType>` 实现：`type`、`selectedRowKeys`、`defaultSelectedRowKeys`、`checkStrictly`、`getCheckboxProps`、`onChange`。复选框模式支持全选、半选、禁用项和树形父子联动；单选模式只保留一个值。

`TableExpandable<RecordType>` 实现：`expandedRowRender`、`rowExpandable`、`expandedRowKeys`、`defaultExpandedRowKeys`、`onExpandedChange`。数据的子节点字段由 `childrenColumnName` 指定。

`TablePaginationConfig` 复用 `PaginationProps`（排除必填 `total`），补充可选 `total` 与 `position`。

拖拽排序只实现 HTML5 指针拖拽。`onRowOrderChange` 回传重排后的数据，以及 `active`、`target`、`fromIndex`、`toIndex`。按用户确认，不补充键盘移动，不在 API、文档或测试中声明键盘拖拽能力。

## 普通列表列宽与自适应规则

Table 是自研原生 HTML table，不依赖 AntD/rc-table。它提供显式列宽策略，不扫描当前分页数据或 ReactNode 测量出“自动合理”的列宽。

- 默认 `layoutMode="fill"`、`tableLayout="fixed"`，表格占满容器。稳定的状态、日期、数值和操作列使用数字 `width`；主名称、标题或描述列使用 `minWidth` 与正数 `grow` 承接余量。不要将短内容列统一等分。
- 固定布局中，仅当所有 `width` 为数字或未设置，且至少一列配置 `minWidth`、`maxWidth` 或 `grow` 时，启用确定性数字分配。数字 `width` 是初始基准；缺省时取 `minWidth`，再缺省取 120px。`grow` 按正数权重分配余量，`maxWidth` 是上限；全部到达上限时保留右侧留白。
- 容器不足时，参与 `grow` 的列先缩至 `minWidth` 或 120px；仍不足时使用内部横向滚动，不能撑宽页面、缩小字体或减少正常 Padding。数字 `scrollX` 参与这一预算并作为增长目标；在该模式下不能使用 string `scrollX`，也不能混用 string `width`。
- `tableLayout="auto"` 下，`minWidth` 由浏览器原生表格布局处理，`maxWidth` 和 `grow` 不参与数字分配，不能组合使用。`layoutMode="compact"` 未显式 `tableLayout` 时采用 auto 并按内容收缩；显式 `tableLayout="fixed"` 且存在约束时，按数字预算收缩且不分配多余空间。
- 每张表都输出 `colgroup`，因此 `showHeader=false` 仍保留列宽。固定列按实际 `<col>` 宽度计算同侧累计偏移，支持同侧多个业务列。选择、展开辅助列占用 48px 并纳入列索引，但自身不固定，随内容滚动；左右固定业务列加前置辅助列的实际合计宽度应小于最小容器宽度。必须验证未滚动、滚动中、滚动末端，不能只验证辅助列已经滚走后的布局。
- 宽度预算包含表头、排序图标、合法内容格式、控件、间距和正常单元格内边距。操作列按全部业务状态与支持语言的最宽合法组合配置，不在分页、筛选、排序或异步更新时重算。默认自然换行；省略只由显式 `ellipsis` 决定，复杂 render 的完整内容提示由业务组合实现。
- 默认左对齐，不从字段名推断语义。日期／时间列（包括更新时间）的表头与内容必须左对齐，不允许右对齐；由列配置遵守该使用规范，组件不按字段名强制覆盖 `align`。金额、日期格式和操作收纳策略由业务决定；对齐、列宽和布局模式不改变业务操作的显示、隐藏或折叠规则。分组、合并、树形、嵌套保留各自布局，不自动套用普通列表策略。

能力边界与兼容性要求见 [Table 列宽能力审查与补充方案](./qizhi-table-column-layout-audit-2026-10-14.md)，实际检查见 [验证记录](../verification/table-column-layout-2026-10-14.md)。新增能力须同步类型、实现、API、同源 Demo/复制代码及测试；不得仅更新文档后声称已实现。

## 2026-10-27 兼容能力补充

- `shrink` 独立控制压缩权重，未配置沿用 grow；`shrinkPriority`、`growPriority` 越小越先处理，同级按权重分配。0 权重不参与。数字 width 是期望基准而非全部场景的硬最小宽度；显式 minWidth 是下限。未配置新参数沿用历史分配规则。
- 名称、说明设置上限；达到上限后通过后级 growPriority 的普通数据列承接余量。所有列封顶后的严格上限与铺满不可同时保证，组件不突破上限；业务必须配置未封顶承接列。操作与辅助列不参与余量分配，不靠浏览器原生重新拉宽。compact 是通用特例能力，不作为 Qways 标准页面列表布局。
- `ellipsis={ rows: 1 | 2, tooltip: true }` 仅省略纯字符串或数字叶子。实际截断时才提供 hover/focus/click 全文 Tooltip，Esc 关闭；内容、容器、字体变化后重测。旧 true/showTitle 保持单行原生 title，复杂 render 中的控件不被新模式限高或裁切。
- `loading={{ spinning, scope: "body", tip }}` 仅覆盖数据区，保留表头和传入记录；首次无数据时提供加载占位，不把空态冒充加载结果。boolean 仍沿用历史遮罩。不实现 API 请求、缓存、失败重试或授权范围策略。
- `fixedBreakpoint={640}` 按表格容器宽度（含等号）取消固定列，变宽后恢复，未配置保持原行为。
- `emptyPadding={36}` 为默认与自定义 empty 增加一层垂直留白并清零空态单元格 padding。自定义内容内部自带 margin/padding 须由调用方消除；组件不篡改任意 ReactNode 内部样式。未配置保留历史布局。
- `emptyCell="-"` 仅替换未定义 render 的 null/undefined/空字符串。0、false、显式业务状态与 render 不变；缺失值占位不启用全文 Tooltip。默认不自动代填。
- Qways 的每页 8 条、260/320px、游标、专用模型卡片、ID 复制及 secret 掩码不是组件默认值；业务接入按实际安装包能力核验。日期／时间列仍由业务显式左对齐。

## 用户列定制

完整可序列化状态为 `TableColumnLayoutState`：`{ schemaVersion: 1, columnOrder, columnWidths, columnVisibility }`。`columnOrder` 始终包含隐藏列；`columnWidths` 只保存用户显式提交的 CSS px；`columnVisibility` 是当前有效列的完整布尔映射。状态及回调元信息的类型和可访问文案配置见 [用户列定制契约](./qizhi-table-column-customization-v1.md)。

- `columnCustomization` 的 `reorder`、`resize`、`visibility`、`settings` 分别开启交互，全部默认 `false`；状态本身可独立传入并以只读方式恢复。`renderSettings` 接收完整设置入口，可由业务放入已有工具栏，`locale` 可部分覆盖设置、恢复、全选、移动、调宽及必选提示文案。
- `columnLayout` 为受控值：每次渲染按当前列定义规范化，组件不先假装提交成功。`defaultColumnLayout` 只作为非受控首轮初值；两者并存时受控值优先。合法用户操作才通过 `onColumnLayoutChange` 回传一次完整独立快照，`reason` 为 `order`、`width`、`visibility` 或 `reset`，可带 `columnKey`；取消、无变化、外部状态更新及内部规范化不回调。
- 只接受 `schemaVersion: 1`。无效版本或损坏结构回退当前默认；过期、未知、重复或空键不持久化。列定义改变或权限导致列集合变化时，当前有效键以定义为准，删除旧键、把新键按其当前段定义顺序追加；核心不读写存储、网络或权限数据。
- 顺序按当前源列连续段约束：`fixed` 从普通、`left`、`right` 任一变化即断段，`movable: false` 是单列屏障，移动不可跨越。`hideable: false`、树入口保护列强制可见；其余列的 `defaultVisible` 默认 `true`。`layoutRole` 默认为 `data`，`action` 不计入至少保留一列可见数据列的限制；纯 action 防御场景仍保留一列可见。
- `resizable: false` 忽略保存值和新调宽。有效手动宽度必须为有限正数，并按当前 `minWidth`／`maxWidth` 钳制；没有明确下限时最小值为 64px，冲突时 `minWidth` 优先。用户手动宽度优先于自动预算；当手动总宽小于容器时允许在满宽卡片内出现表格内部留白，超过容器时仅表格内部横向滚动。百分比、字符串或自动宽度的未手动列在首次调宽前读取实际渲染像素作为本次基准，不把该基准写进保存状态。
- 树形数据的 `treeColumnKey` 是稳定入口，布局移动不改变缩进或展开绑定，且该列不能隐藏。若当前可见数据中存在 `onCell().colSpan` 合并，移动和显隐临时关闭并回到源列完整顺序；仅 `rowSpan` 不触发此限制，调宽仍可用。
- 键盘路径：表头移动按钮可用左右方向键逐列移动；调宽手柄可聚焦，左右方向键每次 8px、`Shift` 加方向键每次 1px、`Home` 到最小值、有限最大值时 `End` 到最大值，进行中的指针调宽可用 `Esc` 取消。设置面板复用可聚焦复选框、按钮和数字输入，数字宽度在 Enter 或失焦时提交。
- 业务可将回调状态序列化到自己的作用域存储，但必须以用户、权限/租户、列表版本及列集合隔离，JSON 读取失败按默认处理；不得保存原始列定义、接口数据、凭据或其他敏感内容。恢复和当前定义规范化只是展示准备，不是用户修改。

## 当前能力排除范围

服务端数据协议、筛选菜单、可编辑单元格、虚拟列表、汇总、导出、响应式隐藏、宽泛的 `onRow`/`onHeaderRow`，以及独立 Checkbox、Radio、Switch、Spin 组件。用户列移动、调宽、显隐与设置面板仅以本契约的可选能力提供，不扩大为服务端保存、权限判断或通用响应式隐藏方案。

## 一致性与验收

React 类型、API 表、12 个 Demo 与复制源码必须使用同一组正式 API。组件测试覆盖默认换行、列级省略、排序、选择、展开、树形、合并、拖拽、分页和列宽分配；文档测试覆盖标题顺序、复用关系、API 与复制源码。完成前运行类型检查、测试、构建，并在 1440/1024/375 三档视口逐项操作和截图验收。
