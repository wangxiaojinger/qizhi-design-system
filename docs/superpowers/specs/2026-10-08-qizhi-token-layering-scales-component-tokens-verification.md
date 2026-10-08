# QIZHI Token 第一阶段验收报告

## 结论

- candidate status: `candidate_pass`
- independent verification: `pending`
- verified branch: `codex/token-architecture-phase1`
- verified local preview: `http://127.0.0.1:5174`

## 兼容契约

- 362 个旧公开 Token 的名称、CSS 变量、原始值和值类型由 `src/legacy-contract.json` 固定。
- 当前 523 个 Token 全部具有合法的 `tier` 与 `status`。
- 迁移映射分类为：保留 271、兼容别名 91、新增 161、弃用 0。
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
- Input：四档 24/28/32/36px、error、warning、disabled、hover 与组合输入布局；error/warning 边框和既有状态焦点环均由 Component Token 驱动，并验证可独立覆盖。
- Select：四档 24/28/32/36px、error、warning、disabled、focus ring、弹层与移动端边界；error/warning 边框由 Component Token 驱动，并验证可独立覆盖。
- Modal：默认打开、异步关闭、自定义页脚、确认框、更新移除、Alert、Steps 与三个视口边界。

## 迁移前后视觉基线

- 基线来源：迁移前提交 `c42a916`，由独立本地预览生成 Playwright snapshot。
- 当前分支使用同一套用例、浏览器通道与 1440/1024/375 视口逐像素比较。
- 覆盖 Button 基础/尺寸、Input 状态/尺寸、Select 状态/弹层、Modal 基础打开态；三个视口合计 12 个测试用例、21 张 macOS Chrome 基准截图。
- 命令：`QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test tests/e2e/token-phase1-visual-baseline.spec.ts --workers=1`。
- 结果：12 passed；未发现 Token 重构造成的像素差异。

人工查看了 Button、Input、Select、Modal 的桌面与移动端截图；未发现横向溢出。Modal 自定义页脚移动端换行是单独批准的缺陷修复，不属于视觉保持基线区域。

## 收口修复

- `对话框-自定义页脚` 示例的按钮容器在 375px 下采用换行，并约束到示例宽度，消除了既有的文章内部横向溢出。
- Playwright 必须显式指向当前分支专用预览；默认 `127.0.0.1:5173` 可能属于其他工作树，不能作为本分支验收证据。

## 最终自动化验证

- `pnpm verify`：通过。
- Token 契约测试：20/20；Token 校验：523 项。
- Workspace 测试：464 个文件、2415 项测试全部通过。
- API 清单、TypeScript、文档构建、React 包构建与 bundle boundary smoke check：通过。
- 构建仅保留既有的大 chunk 警告，不构成本阶段失败。

## 范围边界

- Table 仅发布候选组件 Token，没有修改 `table.css`。
- 未修改 Popover 或 Tooltip。
- 未发布包、部署文档或升级外部消费项目。
- 本报告不是独立第三方验收，最终独立验证仍为 `pending`。
