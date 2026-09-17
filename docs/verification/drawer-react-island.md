# Drawer React Island 验收记录

- 日期：2026-08-25
- 状态：`candidate_pass`
- 独立最终验收：`pending`

## 原始契约

- 锁定旧站 2 个 Demo 的标题、说明、顺序、文案、数据、宽度、初始状态与交互。
- 基础用法宽度为 760px；抽屉表单宽度为 960px；不大于 640px 时均为 100vw。
- React Demo、格式化 TSX、展示代码和剪贴板复制文本由同一注册表提供。

## 八项防错复核

1. Demo 复用公共 Drawer、Button、Form、Input、Select、Switch、Radio 与图标，并沿用公共代码操作区结构。
2. 用计算样式和实际坐标验证抽屉位移、宽度及 Select 浮层层级，不以状态类替代视觉结论。
3. 同时检查面板、页头、正文、页脚、遮罩、文档宽度和视口边界。
4. Demo 源码没有自制输入、选择、文本域、按钮、开关、单选或图标结构。
5. 实测遮罩、关闭按钮、Escape、页脚按钮、焦点恢复、禁用态、切换和 Select 完整路径。
6. 注册表测试和剪贴板测试锁定运行 UI、展示源码及复制代码同源。
7. 搜索并回归旧版详情页版本抽屉，React 初始化不会接管该消费位置。
8. 在 1440、1024、375 三档检查计算样式、坐标、控制台、横向溢出并人工查看打开态截图。

## 自动化结果

- `node --check script.js`：通过。
- `pnpm typecheck`：通过。
- `pnpm test`：264 个测试文件、1287 条测试全部通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react` 与 smoke consumer 全部构建通过。
- `pnpm playwright test tests/e2e/drawer-react-island.spec.ts tests/e2e/demo-code-actions.spec.ts`：27 条用例全部通过。
- `git diff --check`：通过。

## 已知限制

- 文档站构建仍报告既有的 500kB 以上 chunk 警告，本次 Drawer 迁移未扩展到代码分包。
- 当前结论是执行者候选通过；仍需独立人员完成最终验收。

## 受控表单规范对齐复验

- 2026-08-25：计算类型组刷新图标改用 `text-3 / #86909C`，hover 改用 `text-2`。
- 计算资源规格继续保持禁用初始状态，但“图标 + 按钮”改为内容自适应宽度。
- 单元/文档测试 7 条通过；Drawer 1440、1024、375 三档浏览器用例 3 条通过。
- 公共 Switch 关闭态调整后，Drawer、Form 与 Switch 类目三档消费矩阵 9 条通过：可用关闭态为 `#E5E6EB`，禁用关闭态为 `#F2F3F5`。
- 八项防错复核整改：两个刷新按钮恢复点击旋转和动画结束清理；新增表单取消焦点恢复，以及 body、shell、section、footer 的 padding、margin、gap 三档计算样式断言。
