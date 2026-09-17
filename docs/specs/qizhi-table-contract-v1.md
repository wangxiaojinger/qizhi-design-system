# QIZHI Table v1 组件契约

## 范围

Table v1 保留 10 个当前业务需要的 Demo：基础用法、排序、固定列、开启选择、展开行、嵌套子表格、树形数据展示、表格属性、单元格合并、拖拽排序。表头吸顶和表头分组不纳入当前公共能力。

正式实现复用 `Pagination`、`Empty`、`Button`、`Link` 与 QIZHI 图标。选择控件和加载态属于 Table 内部结构，不对外新增 Checkbox、Radio 或 Spin 组件。

## 公共类型

列表／表格数据单元格内的文字按钮（Button type="text"）与 Link，左右内边距统一为 0，以保持与普通文本的对齐。上下内边距、颜色、禁用和点击行为不变；普通按钮、表格外控件不受此规则影响。

```ts
type TableSize = "default" | "middle" | "small";
type TableRowKey = string | number;
type TableSortOrder = "ascend" | "descend" | null;
type TableFixed = "left" | "right";
type TablePaginationPosition = "bottomLeft" | "bottomCenter" | "bottomRight";
```

`TableProps<RecordType>` 实现：`columns`、`dataSource`、`rowKey`、`size`、`border`、`borderCell`、`hover`、`stripe`、`showHeader`、`loading`、`scrollX`、`rowSelection`、`expandable`、`childrenColumnName`、`pagination`、`empty`、`draggable`、`onSortChange`、`onRowOrderChange`、`className`、`style`、`aria-label`。

默认值：`size="default"`（表头与内容行均为 56px）、`border=false`、`borderCell=false`、`hover=true`、`stripe=false`、`showHeader=true`、`loading=false`、`pagination=false`、`childrenColumnName="children"`、`draggable=false`。`size="middle"` 时表头与内容行均为 48px，`size="small"` 时均为 40px。

`TableColumn<RecordType>` 实现：`key`、`title`、`dataIndex`、`width`、`fixed`、`render`、`sorter`、`defaultSortOrder`、`onCell`。排序按未排序、升序、降序、未排序循环，并通过 `onSortChange` 回传。

`TableRowSelection<RecordType>` 实现：`type`、`selectedRowKeys`、`defaultSelectedRowKeys`、`checkStrictly`、`getCheckboxProps`、`onChange`。复选框模式支持全选、半选、禁用项和树形父子联动；单选模式只保留一个值。

`TableExpandable<RecordType>` 实现：`expandedRowRender`、`rowExpandable`、`expandedRowKeys`、`defaultExpandedRowKeys`、`onExpandedChange`。数据的子节点字段由 `childrenColumnName` 指定。

`TablePaginationConfig` 复用 `PaginationProps`（排除必填 `total`），补充可选 `total` 与 `position`。

拖拽排序只实现 HTML5 指针拖拽。`onRowOrderChange` 回传重排后的数据，以及 `active`、`target`、`fromIndex`、`toIndex`。按用户确认，不补充键盘移动，不在 API、文档或测试中声明键盘拖拽能力。

## 明确不包含

服务端数据协议、筛选菜单、列配置/列宽调整、可编辑单元格、虚拟列表、汇总、导出、响应式隐藏、宽泛的 `onRow`/`onHeaderRow`，以及独立 Checkbox、Radio、Switch、Spin 组件。

## 一致性与验收

React 类型、API 表、10 个 Demo 与复制源码必须使用同一组正式 API。组件测试覆盖排序、选择、展开、树形、合并、拖拽和分页；文档测试覆盖标题顺序、复用关系、API 与复制源码。完成前运行类型检查、测试、构建，并在 1440/1024/375 三档视口逐项操作和截图验收。
