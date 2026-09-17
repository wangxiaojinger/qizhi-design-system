# QIZHI Message React 迁移验收记录

- 日期：2026-08-25
- 执行状态：`candidate_pass`
- 独立最终验收：`pending`

## 原始契约

- 7 个旧站 Demo 的标题、原始说明、顺序、按钮文案、消息文案、初始状态和交互已锁定在
  `qizhi-message-contract-v1.md` 与文档注册表测试中。
- 空说明规则未被补写；现有 7 个 Demo 均保留旧站原始说明。
- `closable` 默认值采用旧站运行时事实 `false`，不沿用旧 API 表中与运行时冲突的 `true`。

## 八项防错复验

1. 公共组件与完整规范：Demo 使用 QIZHI `Button`、`Space`、Message 和正式图标；操作区复用 Button 基线，手机端补齐公共 Grid、盒模型和换行规则。
2. 状态与视觉联动：相同 `id` 更新时复用原消息节点；关闭和自动关闭均检查真实可见状态。
3. 完整盒模型：检查 Message layer、消息、Demo 卡片及其父级 Grid 的计算尺寸与视口坐标。
4. 无自制基础控件：Demo 源码不存在原生 `button/input/select/textarea`、Remix Icon 或内联样式。
5. 完整交互路径：覆盖五类提示、自定义图标、更新、手动关闭、键盘关闭、Hooks 容器和自动关闭。
6. 同源交付：格式化 Demo TSX 同时作为运行实现、展示代码与复制代码；剪贴板内容已与展示源码逐字比较。
7. 完整修复范围：公共 Message、7 个文档 Demo、静态站旧消息触发器及 Dropdown 消费回归均在测试范围内。
8. 延后结论：完成计算样式、实际坐标、三档截图和人工查看后才记录 `candidate_pass`。

## 自动化与浏览器证据

- `node --check script.js`：通过。
- `pnpm typecheck`：通过。
- `pnpm test`：268 个文件、1303 项测试通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react`、smoke consumer 均构建通过；保留既有大 chunk 警告。
- `pnpm playwright test tests/e2e/message-react-island.spec.ts`：1440、1024、375 三档共 3 项通过。
- `pnpm playwright test tests/e2e/message-react-island.spec.ts tests/e2e/demo-code-actions.spec.ts`：Message 首轮手机宽度问题修复前为 29/30；修复后 Message 三档与 Message 操作区三档分别复验通过。
- `git diff --check`：通过。

## 人工截图检查

- 桌面：五类提示堆叠方向、宽高、图标、阴影和间距正确。
- 窄屏：更新后的同节点消息完整显示，未被正文或侧栏裁切。
- 手机：基础提示位于顶部且保留左右安全距离；Hooks 容器内消息与按钮换行正常；所有 Demo 卡片无横向溢出。

## 限制

- Vite 仍报告既有的 500 kB chunk 体积警告，本次不扩展到站点拆包。
- `candidate_pass` 仅代表本次执行者验证通过，不等同于独立或人工最终验收。
