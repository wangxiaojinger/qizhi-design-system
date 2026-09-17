# QIZHI 业务组件封装验收记录

日期：2026-08-31  
执行状态：`candidate_pass`  
独立最终验收：`pending`

## 审计结论

用户确认范围内共 17 个业务组件，当前全部具备正式 React 实现、公开类型、
`@wangxiaojinger/qizhi-react` 根导出、API 表和整块 Demo 调用。完整库存见
`docs/specs/qizhi-business-component-inventory-v1.md`。

本轮补齐：

- `BusinessGuide`
- `TaskOverview`
- `BasicChoiceCards`
- `IconChoiceCards`
- `ServiceDetailHeader`

其余 12 个组件在本轮开始前已完成，本轮复核其公开导出和 API 状态。

## 边界结果

- Demo 只保留示例数据并直接调用完整业务组件。
- `BusinessGuide`、`TaskOverview`、`ServiceDetailHeader` 的结构、状态、交互、
  响应式和组件私有样式已迁入 `@wangxiaojinger/qizhi-react`。
- Demo CSS 中旧业务私有选择器已移除；文档外壳布局仍保留在 Docs。
- Page Builder Skill 已要求优先使用上述整块业务组件，禁止以基础组件重制。
- 维护者头像颜色使用公开 `primary-6`、`blue-6`、`cyan-6`。旧 Demo 中两个
  硬编码色并非公开 token，因此没有进入公共组件。

## 实际检查

- Component API manifest：current，共 97 组。
- TypeScript：根工程、组件源码、组件声明构建均通过。
- Tokens：335 项校验及构建通过。
- Docs Vite 生产构建：通过；仅保留既有大 chunk 警告。
- `@wangxiaojinger/qizhi-react` Vite 构建及声明产物：通过。
- React smoke 构建与 bundle boundary：通过。
- Page Builder Skill：11 项测试通过。
- Playwright：4 个业务页面 × 1440/1024/375，共 12 项通过；覆盖真实交互、
  键盘、焦点恢复、浮层关闭、尺寸、overflow 和 console error。
- 已人工查看四组业务组件的桌面与手机截图，未发现裁切、横向溢出或结构错位。

## 未完成的基础设施检查

Vitest 在当前工作区启动后停留在 `RUN`，未进入任何用例；默认线程池和
单 worker forks 均复现。该项不能记为通过，也没有使用 `CI=true` 清理依赖。
新增的单元/契约测试代码已经提交到工作区，但独立执行结果保持 `pending`。

根 `pnpm build` 同样没有进入构建逻辑：pnpm 依赖预检访问镜像失败后，因
非 TTY 拒绝重建 `node_modules`。为避免破坏用户依赖，本轮改用已安装的直接
构建入口完成各包构建验证。
