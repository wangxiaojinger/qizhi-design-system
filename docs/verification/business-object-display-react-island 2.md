# 对象展示 React Island 验证记录

- 状态：`candidate_pass`
- 独立最终验收：`pending`
- 验证日期：2026-08-26

## 迁移范围

- 任务卡；
- AI 资产与能力：模型广场、金融智能、MCP 服务卡；
- 项目卡：基础与审批、空间类型、资源申请与变更、资源风险；
- 资源对象卡：资源规格、计费规则、费用与预算；
- `TaskCard`、`ModelCard`、`McpServiceCard`、`ProjectCard`、
  `ConfirmationSummary`、`Segmented` 公共 API；
- 概览与指标组合应用中的任务条目改为复用 `TaskCard`。

## 自动验证

- `node --check script.js`：通过；
- `pnpm typecheck`：通过；
- `pnpm test`：345 个测试文件、1574 项测试全部通过；
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react` 与 smoke 工程全部通过；
- `business-object-display-react-island.spec.ts`：1440、1024、375 三档通过；
- `business-overview-react-island.spec.ts`：1440、1024、375 三档回归通过。

## 浏览器与视觉验证

- 四个 Demo、六张 API 表与右侧五项锚点导航均可见；
- 模型描述 Tooltip、金融模型操作、MCP Popover、项目分组切换、项目进入反馈
  均走过实际交互路径；
- 两张模型广场卡均按“查看详情、快速体验、在线推理”顺序展示三个操作；
  `QuickExperienceIcon` 与替换后的 `OnlineInferenceIcon` 均来自用户提供的 SVG，
  并通过公共图标库导出；
- 三档视口均满足目标章节 `scrollWidth <= clientWidth`，无新增控制台错误；
- 已人工查看桌面项目风险态、手机资源确认态及三档完整章节截图；
- 手机资源指标使用单列信息块，项目卡底部操作与成员入口保持旧规范尺寸。
- 模型卡“快速体验”左右分割线为 14px、垂直居中，并使用加深一级的
  `color-border-2`；
- 项目成员入口复用公共 `TeamIcon` 且使用 `color-text-3`，成员头像按
  primary、cyan、purple 三种语义色区分；
- 计费规则确认与费用预算确认复用 `ConfirmationSummaryGroup`，按照 Figma
  `19910:262229` 的单容器、24px 内边距、24px 区块间距纵向组合；
  资源规格、计费规则和费用预算三类卡片均纵向排列；资源规格卡与
  选择器同宽为 558px，关联外卡宽 360px，其中两个确认项实际宽度均为
  312px；资源规格主体高 152px，padding 和纵向 gap 均为 12px，圆角
  8px，背景为 `rgba(0, 0, 0, 0.02)`。

本记录只声明当前实现达到候选通过；公共 API 与视觉变更仍需独立最终确认。
