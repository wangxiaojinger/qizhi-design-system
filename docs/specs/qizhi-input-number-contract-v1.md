# QIZHI InputNumber API 契约 v1

状态：`candidate_pass`，独立最终验证 `pending`  
负责人：QIZHI 组件迁移  
证据日期：2026-08-24

## 1. 目标与边界

InputNumber v1 迁移旧站 `#component-input-number` 的 7 个 Demo，提供正式
`@wangxiaojinger/qizhi-react` 数字输入组件、TypeScript 类型、结构化 API 元数据和同源 Demo。

不随本次迁移 Watermark 或 Pagination，不增加旧站没有的清空、状态色、
滚轮开关和自定义步进图标能力。Slider 组合场景通过公共
`controls` 属性选择悬浮显示、始终显示或不渲染内嵌步进器。

## 2. 公共行为

- 受控和非受控数值，空值回调为 undefined。
- `embed` 内嵌上下步进与 `button` 左右按钮模式。
- `controls` 在 `embed` 模式下支持 `hover`、`always`、`hidden`。
- small/default/large 高度为 28/32/36px。
- 显式 min/max 边界、step 和 precision；未提供边界时保持无界。
- prefix、suffix、formatter、parser 和 userTyping 输入状态。
- strictMode 使用十进制字符串计算并返回字符串，不经过 Number。
- disabled 禁止输入与步进；readOnly 可聚焦但不可修改。
- 输入框使用 spinbutton 语义、方向键步进，并转发 ref。

## 3. 已确认偏差

旧脚本把缺失 min/max 错误解析为 0，并且没有在直接输入失焦时执行格式化。
React 实现按 Demo 原始说明修复这两项，不复制缺陷；回归测试锁定货币、高精度和
无界按钮模式不会归零。

## 4. Demo 与代码

7 个 Demo 的标题、说明、顺序、初始数据和布局以
`qizhi-input-number-migration-map-v1.md` 为准。每个预览和复制代码来自同一 TSX
模块。操作区只显示查看/收起代码和复制代码，不显示文件名、语言徽标、额外 Tab
或复制样式。

## 5. 验收

- 单元测试覆盖边界、步进、控制器显隐、精度、格式化、高精度、
  键盘和禁用/只读。
- 文档测试覆盖原始契约、公共导入、API 元数据和可见元素白名单。
- Playwright 覆盖 1440、1024、375 三档、160/162/480px 宽度、28/32/36px
  高度、hover、真实交互、控制台与横向溢出。
