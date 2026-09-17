# Checkbox React Island 验证记录

日期：2026-08-21  
工作区：`.worktrees/button-react-island`

## 范围

- `@wangxiaojinger/qizhi-react` 正式 `Checkbox` 与 `Checkbox.Group`。
- 基础用法、受控、复选框组、全选、布局共 5 个同源 TSX Demo。
- Checkbox 与 Checkbox.Group 两张结构化 API 表。
- 鼠标、键盘、禁用、半选、受控、横纵组和移动端响应式布局。

## 自动验证

- `node --check script.js`：退出码 0。
- `pnpm typecheck`：根项目与 `@wangxiaojinger/qizhi-react` 类型检查退出码 0。
- 目标单元/文档测试：3 个文件、13 项通过。
- `pnpm verify`：类型检查通过；Vitest 160 个文件、792 项通过；规范站、`@wangxiaojinger/qizhi-react` 和 smoke consumer 构建通过。
- 构建保留现有大 chunk 警告；本次没有新增构建失败。
- `pnpm exec playwright test tests/e2e/checkbox-react-island.spec.ts`：3 个视口、6 项通过。

## 浏览器与截图

- 1440：5 个 Demo、三列布局、两张 API 表及交互路径通过；页面和 Demo 无横向溢出。
- 1024：5 个 Demo、三列布局及交互路径通过；页面和 Demo 无横向溢出。
- 375：普通组按可用宽度换行，“布局”Demo 改为两列；页面和 Demo 无横向溢出。
- 实测鼠标选中后的 `box-shadow` 为 `none`；使用 Tab 返回 Checkbox 后存在可见键盘聚焦轮廓。
- 初始态与交互态共 6 张目标组件截图已逐张人工查看；未发现勾形、半选横线、禁用态、边界或按钮被裁切。

## 结论与边界

- 当前执行结果：`candidate_pass`。
- 独立最终验证：`pending`。
- Table、Tree、Select、Modal 等既有消费者未在本次重构为正式 Checkbox；全量测试用于确认本次没有破坏其现有行为。
