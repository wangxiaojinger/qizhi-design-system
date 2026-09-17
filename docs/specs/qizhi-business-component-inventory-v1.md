# QIZHI 业务组件最终库存 v1

状态：用户范围已确认，代码完成状态以本文件更新记录为准。  
日期：2026-08-31

## 判定标准

只有同时具备正式实现、类型、根导出、API、整块 Demo 调用、Page Builder
规则和测试，才能标记为 `complete`。基础组件存在或 Demo 视觉正确不等于完整
业务组件已经封装。

## 当前库存

| 类目 | 业务组件 | 正式名称 | 审计状态 |
|---|---|---|---|
| 引导与流程 | 基础用法完整 Demo | `BusinessGuide` | complete |
| 概览与指标 | 指标卡 | `MetricCard` | complete |
| 概览与指标 | 资源用量卡两种状态 | `ResourceUsageCard` | complete |
| 概览与指标 | 指标项 | `MetricItem` | complete |
| 概览与指标 | 对象指标组 | `ObjectMetrics` | complete |
| 概览与指标 | 组合应用 | `TaskOverview` | complete |
| 对象展示 | 任务卡 | `TaskCard` | complete |
| 对象展示 | 模型卡片 | `MarketplaceModelCard` | complete |
| 对象展示 | 金融启智模型卡片 | `FinancialModelCard` | complete |
| 对象展示 | Skill 服务卡 | `SkillServiceCard` | complete |
| 对象展示 | 项目卡 | `ProjectCard` | complete |
| 对象展示 | 资源规格确认卡片 | `ResourceSpecificationCard` | complete |
| 对象展示 | 计费规则费用预算卡片 | `BillingBudgetCard` | complete |
| 对象选择 | 基础选项卡完整组 | `BasicChoiceCards` | complete |
| 对象选择 | 带图标选项卡完整组 | `IconChoiceCards` | complete |
| 对象选择 | 业务对象选择器 | `ObjectSelector` | complete |
| 详情头部 | 基础用法完整 Demo | `ServiceDetailHeader` | complete |

审计结论：用户确认范围内 17 个业务组件均已具备正式实现、公开类型、根导出、
API 文档和整块 Demo 调用。`ServiceDetailHeader` 已同时拥有状态切换、页签、
版本抽屉、版本表格和回滚行为；底层 `DetailHeader` 继续作为兼容基础组件保留。

## 固定边界

- 页面只传已公开的数据、文案、图像和回调。
- 完整业务组件拥有当前 Demo 的结构、操作顺序、默认状态、响应式和可访问性。
- Demo 只提供 Mock 数据和调用，不再拼装内部 QIZHI 基础组件。
- 已有低层组件继续兼容，但 Page Builder 命中业务场景时必须优先整块组件。
