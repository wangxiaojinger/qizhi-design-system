# QIZHI 组件映射

此文件只提供检索入口，不是静态真相。每次任务先运行 `inventory_qizhi.py`，再读取当前 HTML/CSS/JS 对应区块和文件后部覆盖规则。

## 选择顺序

1. 业务组件：现成业务语义匹配时直接复用。
2. 基础组件组合：没有业务组件时，用现有基础组件构成页面。
3. 能力缺口：两者都不覆盖时停止发明组件，记录缺口。

## 业务组件入口

| 需求 | 章节 | 典型检索词 |
|---|---|---|
| 引导与流程 | `#business-guidance-flow` | `qizhi-business-guide` |
| 概览与指标 | `#business-overview-metrics` | `qizhi-metric-card`、`qizhi-resource-card`、`qizhi-task-overview` |
| 对象展示 | `#business-object-display` | 对象摘要、资源与状态展示 |
| 对象选择 | `#business-object-selection` | 选择项、选中和禁用状态 |
| 详情头部 | `#business-detail-header` | 详情摘要、状态与主要操作 |

业务分类采用：引导与流程、概览与指标、对象摘要、选择项、信息汇总与决策确认。大型组合优先作为业务模式，不因单页需要直接升级为公共组件。

## 基础组件入口

| 页面需求 | 文档章节 | 重点合同 |
|---|---|---|
| 主要/次要/危险操作 | Button 页面与 `.qizhi-btn` | 尺寸、状态、`type="button"`、仅图标名称 |
| 搜索与文本输入 | `#component-input` | `input-demo`、清空排除、只读/禁用 |
| 枚举筛选 | `#component-select` | `data-select-demo`、`aria-controls`、键盘路径 |
| 数据结果 | `#component-table` | `.qizhi-table`、加载、无数据、选择和分页 |
| 分页 | `#component-pagination` | `data-pagination`、总数、翻页和每页条数 |
| 表单 | `#component-form` | 标签、校验、布局与提交状态 |
| 空结果 | `#component-empty` | `.qizhi-empty`、原因与下一步动作 |
| 状态标签 | `#component-tag` | 不只用颜色传达状态 |
| 开关 | `#component-switch` | `role="switch"`、`aria-checked`、禁用/loading |
| 确认 | `#component-popconfirm` 或 `#component-modal` | 危险操作、取消、焦点恢复 |
| 抽屉编辑 | `#component-drawer` | 公共输入协议、关闭和未保存状态 |
| 反馈 | `#component-message`、`#component-alert`、`#component-notification` | 即时/持续反馈、错误恢复 |
| 页头与层级 | `#component-page-header`、`#component-breadcrumb` | 标题、返回、主操作和上下文 |

## 复用证据格式

在 `generation-report.md` 中逐项记录，例如：

```text
- Table：`index.html#component-table` / `styles.css:<line>` / `.qizhi-table` / `data-table-body` / `initTablePropsDemo`
```

同时说明哪些类只属于 Demo 容器，不能成为生成页面的公共 API。

## 页面专属代码

页面布局、受控模拟数据和业务事件定位使用 `<slug>-page__*` 专属命名，不使用 `qizhi-*` / `qz-*` 冒充公共组件。不得重新定义公共组件的填充、圆角、颜色、字重或状态协议；复制公共样式时保持声明并记录 `styles.css` 原始行号。任何新公共能力必须先报告缺口并获得授权。
