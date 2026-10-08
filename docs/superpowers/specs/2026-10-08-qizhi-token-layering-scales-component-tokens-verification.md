# QIZHI Token 第一阶段验收报告

## 结论

- candidate status: `candidate_pass`
- independent verification: `pending`
- verified branch: `codex/token-architecture-phase1`
- verified local preview: `http://127.0.0.1:5174`

## 兼容契约

- 362 个旧公开 Token 的名称、CSS 变量、原始值和值类型由 `src/legacy-contract.json` 固定。
- 当前 517 个 Token 全部具有合法的 `tier` 与 `status`。
- 迁移映射分类为：保留 271、兼容别名 91、新增 155、弃用 0。
- 每项映射包含推荐 Token；完整表见 `packages/qizhi-tokens/MIGRATION.md`。
- Button 浏览器回归在禁用脚本的静态文档页注入 `--primary-6: 80, 120, 255`，计算背景色变为 `rgb(80, 120, 255)`，确认旧变量覆盖可沿新组件 Token 链传播。

## 组件与视口验收

以下 Playwright 用例在当前分支专用 Vite 预览上执行：

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/button-react-island.spec.ts \
  tests/e2e/input-react-island.spec.ts \
  tests/e2e/select-react-island.spec.ts \
  tests/e2e/modal-react-island.spec.ts
```

结果：24 passed，覆盖 1440、1024、375 三个视口。

- Button：默认、hover、active、键盘 focus-visible、disabled、四档 24/28/32/36px 及旧变量覆盖。
- Input：四档 24/28/32/36px、error、warning、disabled、hover 与组合输入布局。
- Select：四档 24/28/32/36px、error、warning、disabled、focus ring、弹层与移动端边界。
- Modal：默认打开、异步关闭、自定义页脚、确认框、更新移除、Alert、Steps 与三个视口边界。

人工查看了 Button、Input、Select、Modal 的桌面与移动端截图；未发现本次 Token 重构引入的视觉偏差或横向溢出。

## 收口修复

- `对话框-自定义页脚` 示例的按钮容器在 375px 下采用换行，并约束到示例宽度，消除了既有的文章内部横向溢出。
- Playwright 必须显式指向当前分支专用预览；默认 `127.0.0.1:5173` 可能属于其他工作树，不能作为本分支验收证据。

## 范围边界

- Table 仅发布候选组件 Token，没有修改 `table.css`。
- 未修改 Popover 或 Tooltip。
- 未发布包、部署文档或升级外部消费项目。
- 本报告不是独立第三方验收，最终独立验证仍为 `pending`。
