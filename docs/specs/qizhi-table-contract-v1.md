# QIZHI Table v1 组件契约

## 范围

Table v1 提供 12 个当前业务需要的 Demo：基础用法、多行与省略、排序、固定列、开启选择、展开行、嵌套子表格、树形数据展示、表格属性、单元格合并、拖拽排序、列宽与自适应。表头吸顶和表头分组不纳入当前公共能力。

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

`TableProps<RecordType>` 实现：`columns`、`dataSource`、`rowKey`、`size`、`border`、`borderCell`、`hover`、`stripe`、`showHeader`、`loading`、`scrollX`、`tableLayout`、`layoutMode`、`rowSelection`、`expandable`、`childrenColumnName`、`pagination`、`empty`、`draggable`、`onSortChange`、`onRowOrderChange`、`className`、`style`、`aria-label`。

默认值：`size="default"`、`border=false`、`borderCell=false`、`hover=true`、`stripe=false`、`showHeader=true`、`loading=false`、`tableLayout="fixed"`、`layoutMode="fill"`、`pagination=false`、`childrenColumnName="children"`、`draggable=false`。数据单元格默认自然换行，行高随内容撑开。`size="default"` 使用 16px 上下内边距，`size="middle"` 使用 12px，`size="small"` 使用 8px，不将表头或内容行锁定为固定高度。

`TableColumn<RecordType>` 实现：`key`、`title`、`dataIndex`、`width`、`minWidth`、`maxWidth`、`grow`、`align`、`fixed`、`ellipsis`、`render`、`sorter`、`defaultSortOrder`、`onCell`。`align` 默认为左对齐，排序表头与数据单元格同步对齐。`ellipsis` 默认为 `false`；设为 `true` 或 `{ showTitle }` 时该列单行省略，`showTitle` 默认为 `true`，仅在单元格内容是字符串或数字时输出原生 `title`。排序按未排序、升序、降序、未排序循环，并通过 `onSortChange` 回传。

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
- 默认左对齐，不从字段名推断语义。金额、日期格式和操作收纳策略由业务决定；对齐、列宽和布局模式不改变业务操作的显示、隐藏或折叠规则。分组、合并、树形、嵌套保留各自布局，不自动套用普通列表策略。

能力边界与兼容性要求见 [Table 列宽能力审查与补充方案](./qizhi-table-column-layout-audit-2026-10-14.md)，实际检查见 [验证记录](../verification/table-column-layout-2026-10-14.md)。新增能力须同步类型、实现、API、同源 Demo/复制代码及测试；不得仅更新文档后声称已实现。

## 当前能力排除范围

服务端数据协议、筛选菜单、列配置/列宽调整、可编辑单元格、虚拟列表、汇总、导出、响应式隐藏、宽泛的 `onRow`/`onHeaderRow`，以及独立 Checkbox、Radio、Switch、Spin 组件。

## 一致性与验收

React 类型、API 表、12 个 Demo 与复制源码必须使用同一组正式 API。组件测试覆盖默认换行、列级省略、排序、选择、展开、树形、合并、拖拽、分页和列宽分配；文档测试覆盖标题顺序、复用关系、API 与复制源码。完成前运行类型检查、测试、构建，并在 1440/1024/375 三档视口逐项操作和截图验收。
