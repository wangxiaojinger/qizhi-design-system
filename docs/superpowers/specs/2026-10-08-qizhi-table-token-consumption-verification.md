# QIZHI Token 第二阶段 A：Table 消费验收报告

## 结论

- candidate status: `candidate_pass`
- independent verification: `pending`
- verified branch: `codex/token-architecture-phase1`
- verified local preview: `http://127.0.0.1:5174`
- migration-before visual baseline: `524346e`

## 实施结果

- Table 的 12 个既有候选 Component Token 已转为稳定 Token，并补充 `component.table.cell.padding.inline.compact`；当前公开 Token 总数为 524。
- Table 字体、行高、表头背景、三档纵向内边距、桌面与移动端横向内边距、边框、hover、selected 和固定列层级已由 Component Token 消费。
- 所有迁移采用 `Component Token → 旧变量 → 字面量` 回退链；旧变量仍可覆盖既有职责，未改名或删除旧公开变量。
- 展开行外层内边距选择器收敛为 `.qizhi-table__expanded > td`，避免把 64px 外层缩进传播到嵌套 Table 单元格。
- Form 与 Tabs 浏览器断言已同步当前同源 Demo 契约：Tabs 为 12 组 Demo；Form 提交和批量编辑以当前可见成功状态为准，不再断言已移除的原始 JSON 状态。

## 提交记录

- `d1dc4ae` `test(docs): align form and tabs browser contracts`
- `4c22e5f` `feat(tokens): promote table component tokens`
- `c5d94de` `feat(table): consume component design tokens`
- `088e146` `test(table): verify token compatibility and visuals`

## 兼容与浏览器证据

新增的渲染测试先在迁移前提交 `524346e` 上执行，1440、1024、375 三档均按预期失败：旧 CSS 不响应 `--component-table-*` 直接覆盖。当前实现随后验证：

- 表头背景、默认单元格纵向内边距、桌面与移动端横向内边距均可独立覆盖；
- hover 与 selected 背景 Token 分别生效；
- 固定列表头使用配置后的层级；
- 嵌套 Table 保持自身正常内边距，不继承外层展开行的 64px 缩进；
- 将 Component Token 置为 `initial` 后，旧 `--space-16` 覆盖仍能改变默认 Table 内边距；
- 页面无控制台错误、失败请求或非预期横向溢出。

最终联合浏览器命令：

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test \
  tests/e2e/form-react-island.spec.ts \
  tests/e2e/tabs-react-island.spec.ts \
  tests/e2e/table-react-island.spec.ts \
  tests/e2e/token-phase2-table-visual-baseline.spec.ts --workers=1
```

结果：33 passed，覆盖 1440、1024、375 三个视口。

## 视觉基线

- 基线由迁移前提交 `524346e` 的独立本地预览生成。
- 覆盖基础 Table、密度控制、固定列、多行换行与 ellipsis 四类稳定区域。
- 三个视口共 12 张 macOS Chrome 基准截图；当前分支 12/12 逐像素比较通过。
- 嵌套 Table 未纳入像素保持区域，因为直接子级选择器修正是本阶段批准的预期变化；其几何由功能断言单独覆盖。

## 完整自动化验证

- `pnpm verify`：通过。
- Token 校验：524 项；Token 契约测试：20/20。
- Workspace 测试：464 个文件、2416 项测试全部通过。
- API 清单、TypeScript、文档构建、React 包构建与 bundle-boundary smoke check：通过。
- 构建产物包含 Table Component Token 消费链。
- 构建仅保留既有的大 chunk 警告，不构成本阶段失败。

## 范围审计与限制

- `git diff --check`：通过。
- 相对 `524346e`，Tooltip、Popover、Dropdown 无改动。
- Table Token 描述及迁移文档中不再残留 `candidate`、`deferred`、`候选` 或 `延后` 文案。
- 未发布包、未部署文档站、未升级外部消费项目。
- 视觉快照以 macOS Chrome 为当前验收平台；其他操作系统的字体栅格化差异不在本次证据范围内。
- 本报告由实施者生成，只能声明 `candidate_pass`；独立最终验证保持 `pending`。
