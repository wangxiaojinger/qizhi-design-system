# Typography React Island 验证记录

- 日期：2026-08-18
- 范围：仅【排版 Typography】；其他尚未迁移分类继续使用原静态实现。
- 正式契约：`docs/specs/qizhi-typography-contract-v1.md`，已由用户确认。
- 组件来源：`packages/qizhi-react/src/typography`，由 `@wangxiaojinger/qizhi-react` 统一导出。
- 文档来源：`apps/qizhi-docs/src/typography`；五组文档 Demo 均直接导入正式组件，展示源码与实际渲染使用同一份 Demo 文件。
- v1 能力：`Typography`、`Typography.Title`、`Typography.Text`、`Typography.Paragraph`、`Typography.Ellipsis`；复制和编辑等高级能力延期。

## 自动验证

- TDD 红灯：组件占位实现首次运行 16 项行为测试全部失败；文档占位实现首次运行 3 项文档测试失败。
- `pnpm verify`：通过；18 个测试文件、101 项测试通过，类型检查、规范站构建与 `@wangxiaojinger/qizhi-react` 构建通过。
- `node --check script.js`：通过。
- `Typography.Ellipsis` 定向测试：组件行为与类型测试 21 项通过；文档注册、Demo 与 API 测试 5 项通过。
- Playwright 三视口检查：1440、1024、375 均无控制台或页面错误，无页面横向溢出；省略示例在三种视口均可展开、收起，受控状态同步，禁用态不渲染操作按钮。
- 标题计算字号：桌面端依次为 40/30/24/20/16/14px；375px 下依次为 32/26/22/20/16/14px。
- API 锚点回归：Button 与 Typography 分别使用 `#button-API`、`#typography-API`；浏览器点击 Typography 右侧 API 后仍停留在 Typography 面板，返回可回到 `#components-typography`，运行时重复 ID 为 0。

## 人工截图检查

- 1440：组合示例、标题层级、文本语义、段落、超出省略与五组 API 表完整显示；代码操作区与 Demo 右边界对齐。
- 1024：文档壳层和示例内容未出现新增错位或裁切。
- 375：内容正常换行且页面无横向溢出；API 表按既有规范保留表格内部横向阅读能力。

## 结论与边界

- Typography 状态：`candidate_pass`。
- 独立最终验证：`pending`。
- 本轮未提交 Git；按用户要求，待全部组件迁移完成后统一提交。
- `copyable`、`editable` 不在 v1；`showTooltip`、`ellipsisStr`、`suffix`、`expandNodes`、`expandRender` 暂缓，后续必须重新审定契约后加入。
