# InputTag React Island 验证记录

状态：`candidate_pass`。独立最终验证仍为 `pending`。

## 交付范围

- 公共 `InputTag`、类型导出和组件样式。
- `Tag.closeAriaLabel` 最小公共 API 扩展及同步 API 文档。
- 6 个旧站 Demo、InputTag API、TSX/CSS 同源查看及 TSX 同源复制。
- 固定与真实宽度响应式标签折叠。

## 自动验证

- `pnpm test -- --run`：229 个测试文件、1122 项测试全部通过。
- `pnpm typecheck`：通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react` 和消费端 smoke build 均通过；
  保留既有的文档站大于 500 kB chunk 警告。
- `node --check script.js`：通过。
- `git diff --check`：通过。

## 浏览器验证

- `tests/e2e/input-tag-react-island.spec.ts`：3 档测试全部通过（1440、1024、
  375）。
- 覆盖尺寸、Enter/逗号/Backspace、删除、清空、焦点恢复、labelInValue、
  校验错误、格式化、失焦保存、固定/响应式摘要、代码同源和横向溢出。
- 截图人工复核发现并修正桌面双列宽度收缩和 error 聚焦态蓝色覆盖问题。

## 限制

- Select、TreeSelect、Cascader 内部标签保持现状。
- 本记录属于实现者自验，只能声明 `candidate_pass`。
