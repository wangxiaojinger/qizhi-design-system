# 概览与指标 React Island 验证

- 状态：`candidate_pass`
- 独立最终验证：`pending`
- 旧规范范围：指标卡、资源用量卡、指标项、对象指标组、组合应用。

## 已执行

- 上一轮全量 Vitest：338 个文件、1545 个测试通过。
- API 补齐后专项 Vitest：2 个文件、7 个测试通过。
- TypeScript：根项目与 `@wangxiaojinger/qizhi-react` 通过。
- 构建：文档站、`@wangxiaojinger/qizhi-react` 与 smoke 包通过。
- Playwright：1440、1024、375 三档通过，无新增控制台错误。
- API：MetricCard、ResourceUsageCard、MetricItem、ObjectMetrics 四张表与公共 Props 对齐。
- 右侧目录：桌面端展示指标卡、资源用量卡、指标项、对象指标组、组合应用和 API 六个锚点，点击定位已实测。
- Tooltip：对象指标组与组合应用共用 React `InfoIcon` 触发器；hover 前后均为 `color-text-3`，鼠标为 pointer，不再显示 help 问号。
- 交互：类型切换、禁用卡、Tooltip、展开与收起。
- 几何：指标卡实际高度不小于 84px，三档无横向溢出。
- 截图：三档均生成并人工查看。

## 边界

本次执行者只声明 `candidate_pass`；用户或独立审查者的最终视觉确认仍为 `pending`。
