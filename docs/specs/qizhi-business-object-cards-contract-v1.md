# QIZHI 对象展示业务卡片 API 契约 v1

状态：已审定  
负责人：林猫猫  
证据日期：2026-08-31

## 1. 目标与边界

- 用户任务：将“对象展示”中已经定型的真实业务卡片作为完整 React 组件公开。
- 业务场景：页面只传业务数据、文案和跳转/事件，不重新拼装卡片结构。
- v1 组件边界依次为：`TaskCard`、`MarketplaceModelCard`、
  `FinancialModelCard`、`SkillServiceCard`、`ProjectCard`、
  `ResourceSpecificationCard`、`BillingBudgetCard`。
- v1 不提供任意布局、任意内部区块、任意操作数量或 Demo 私有标题插槽。

## 2. 证据与可见元素对照

| 原 Demo 可见区域 | React 正式组件 | 决策 |
|---|---|---|
| 任务名称、空间、资源、时长、状态、图标 | `TaskCard` | 保留现有完整组件 |
| 模型广场两张模型卡及三项固定操作 | `MarketplaceModelCard` | 从 `ModelCard` 通用变体收口为独立业务入口 |
| 金融启智模型卡及“查看详情/去使用” | `FinancialModelCard` | 从 `ModelCard` 通用变体收口为独立业务入口 |
| Skill 服务身份、版本、更新时间、项目、摘要浮层 | `SkillServiceCard` | 保留现有完整组件 |
| 项目身份、状态、信息、成员、操作、风险 | `ProjectCard` | 保留现有完整组件 |
| 资源型号与 CPU/内存/GPU 指标 | `ResourceSpecificationCard` | 固定结构，数据可变 |
| 计费规则与费用预算两个连续区块 | `BillingBudgetCard` | 作为一个完整组件公开 |
| “AI 资产与能力”“模型卡”上层标题与说明 | 无 | 删除，不进入组件或 Demo |
| “资源对象卡”上层标题与说明 | 无 | 删除，不进入组件或 Demo |

## 3. 公共 API 决策

### MarketplaceModelCard

- 数据：`name`、`description`、`tags`、`preset`。
- 事件：`onViewDetails`、`onQuickExperience`、`onOnlineInference`。
- 固定：卡片结构、标签区、描述 Tooltip、三项操作名称、顺序和图标。

### FinancialModelCard

- 数据：`name`、`meta`、`description`、`tags`。
- 事件：`onViewDetails`、`onUse`。
- 固定：卡片结构、默认标签区、聚焦/悬浮操作区、两个操作名称和顺序。

### ResourceSpecificationCard

- 数据：`resourceModel`、`cpu`、`memory`、`gpu`；指标值使用
  `{ value, total? }`。
- “资源规格确认”仅为组件名称，卡片内不展示标题；固定资源型号行、指标说明与三项指标顺序。

### BillingBudgetCard

- 数据：`model`、`instanceCount`、`settlementMethod`、
  `settlementCycle`、`price`、`priceUnit`、`formula`、`budget`。
- 固定：计费规则确认在前，费用与预算确认在后；两个区块共同组成一张卡。

### 既有组件

- `TaskCard`、`SkillServiceCard`、`ProjectCard` 保持现有公开数据与事件 API。
- `SkillServiceCard` 未传入 `icon` 时默认使用 QIZHI `SkillServiceIcon`。
- `ModelCard`、`ConfirmationSummary`、`ConfirmationSummaryGroup` 暂保留兼容导出，
  但对象展示 Demo 和 Page Builder 不再把它们作为上述完整业务卡片的入口。

## 4. DOM、交互与样式

- 新业务入口复用当前已经验收的真实卡片实现，不重新设计 DOM 或视觉。
- Demo 只负责示例数据和状态反馈，不选择公共组件私有 `__*` 后代类。
- 所有操作使用 QIZHI `Button` 和公开图标；不得新增原生交互标签或手写 SVG。
- 模型描述 Tooltip、金融卡聚焦态、Skill 服务 Popover、项目操作与确认卡布局保持现状。
- 1440、1024、375 三档保持无页面横向溢出；Skill 服务浮层检查完整祖先裁切链。

## 5. 文档结构

对象展示只保留七个平级 Demo，顺序固定为：

1. 任务卡
2. 模型广场模型卡片
3. 金融启智模型卡片
4. Skill 服务卡
5. 项目卡
6. 资源规格确认
7. 计费规则费用预算卡片

每个 Demo 独立 TSX，预览、展示代码和复制内容同源。API 表使用上述七个业务组件名。

## 6. 测试矩阵与发布边界

- 单元：固定操作顺序、事件回调、固定标题与指标顺序、两个计费区块不可拆。
- 文档：七个 Demo 的标题、顺序、独立来源、公共导入和删除文案。
- E2E：三视口、模型 Tooltip、金融操作、Skill 服务浮层、项目状态切换、确认卡尺寸。
- 自动化通过最多为 `candidate_pass`；独立最终验收保持 `pending`。
