# Alert React Island 验收记录

- 日期：2026-08-26
- 范围：`#component-alert`、`@wangxiaojinger/qizhi-react/Alert`
- 执行状态：`partial`（Vitest worker 未成功启动）
- 独立最终验收：`pending`

## 自动化结果

- `pnpm typecheck`：通过。
- `pnpm build`：通过；站点、`@wangxiaojinger/qizhi-react` 与 smoke 包均完成构建，包产物包含 `dist/alert/Alert2.js`。
- `node --check script.js`：通过。
- HTML 结构检查：重复 ID 0，缺失 hash 目标 0，缺失 `aria-controls` 目标 0。
- Demo 源码静态门禁：无原生 `button/input/select/textarea/svg`，无内联布局，单行不超过 100 字符，Demo CSS 无其他公共组件的 `__*` 私有选择器。
- `pnpm exec playwright test tests/e2e/alert-react-island.spec.ts --workers=1`：1440 / 1024 / 375 共 3/3 通过。
- `pnpm exec playwright test tests/e2e/demo-code-actions.spec.ts --grep component-alert --workers=1`：3/3 通过。

## 真实交互与几何

- 保留 9 个 Demo，API 表可见。
- 尺寸计算高度为 28 / 32 / 40px；Inline Alert 为 22px。
- 默认关闭按钮可聚焦且点击后移除当前 Alert。
- 图标与文字两种自定义关闭元素均实际关闭。
- `showIcon=false` 的 4 个实例不渲染图标；Banner 实例数为 4。
- 9 个 Demo 展示代码与剪贴板内容逐项一致。
- 三个视口的 section 与页面均没有水平溢出，控制台无新错误。
- Demo 操作区到预览的间距为 12px，右内边距为 0px。

## 截图人工审查

已查看 1440 / 1024 / 375 的 `alert-banner.png`。四个 Banner 的图标、文字、关闭按钮、标题/内容层级、背景、圆角与浏览器外壳边界均完整；375px 下未发现文字、阴影、图标或关闭按钮裁切。

## 限制

- Vitest 定向命令在当前桌面环境中多次卡在 worker 启动；一次明确回执为 `Timeout waiting for worker to respond`，其余运行在无测试输出后人工终止。因此不宣称 Alert Vitest 已通过。
- 本记录是执行者验收，未代替独立人工最终验收。
