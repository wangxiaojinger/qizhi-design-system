# QIZHI Form v3 复杂字段验收记录

日期：2026-09-24

## 验收范围

- 数组字段路径与真实嵌套对象、数组值
- 条件字段 `preserve` 保留策略
- `dependencies` 依赖校验与 `Form.useWatch` 精确监听
- `Form.List` 新增、删除、移动、稳定 key 与字段错误迁移
- “复杂表单联动”同源 Demo、API 表和结构化 API 清单

## 自动化结果

- `node --check script.js`：通过。
- `pnpm typecheck`：通过。
- `pnpm test`：通过；Vitest 449 个测试文件、2164 项测试全部通过，设计变量包另有 8 项 Node 测试通过。
- `pnpm build`：通过；文档站、React 组件包和冒烟包均完成构建。
- `pnpm api:validate`：通过；110 组组件 API 清单为最新状态。
- `git diff --check`：通过。

## 浏览器验收

在当前仓库的 `http://127.0.0.1:5173/#component-form` 上运行 `tests/e2e/form-react-island.spec.ts`：

- 1440×1000：通过。
- 1024×900：通过。
- 375×812：通过。
- 三个视口均完成动态成员新增、删除、移动，数组路径后端错误回填与清理，密码依赖校验，条件字段卸载清理及有效提交。
- 页面和全部 Form Demo 均满足 `scrollWidth === clientWidth`，未发现横向溢出。
- 操作按钮可聚焦，错误提示与字段保持关联，控制台与页面运行时无新增错误。

## 已知信息与结论边界

- Vite 构建仍报告既有的单包体积超过 500 kB 警告；本次没有新增构建错误，该警告不属于 Form v3 范围。
- 当前结果为 `candidate_pass`（候选通过）；`independent final verification`（独立最终验证）保持 `pending`（待验证）。
