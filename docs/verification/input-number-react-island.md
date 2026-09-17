# InputNumber React Island 验证记录

状态：`candidate_pass`。原 v1 曾于 2026-08-24 由用户确认；本次新增
`controls` 公共 API 后，该新增能力的独立最终验收恢复为 `pending`。

## 自动验证

- `pnpm test -- --run`：233 个测试文件、1150 项测试全部通过。
- InputNumber 定向测试：2 个测试文件、12 项测试全部通过。
- `pnpm typecheck`：通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react` 和消费端 smoke build 均通过；
  保留既有的文档站大于 500 kB chunk 警告。
- `node --check script.js`：通过。
- `git diff --check`：通过。

## 浏览器验证

- `tests/e2e/input-number-react-island.spec.ts`：1440、1024、375 三档
  3/3 通过。
- 覆盖 7 个 Demo、160/162/480px 宽度、28/32/36px 高度、hover 步进、
  min/max、精度、formatter/parser、userTyping、前后缀、高精度和代码操作。
- 三档截图已人工复核；目标 Demo 与页面均无横向溢出，控制台无新增错误。
- 旧站步进归零与格式化失效已按确认结论修复，并由单元测试和 E2E 锁定。
- 按钮模式复核发现公共容器级联将左右按钮压成 14px 高，并覆盖禁用背景；
  已修正为 30px 内容高度、32px 按钮宽度、96px 输入区和 162×32px 外框，
  同时恢复激活图标对比度。三档 E2E 增加直接子按钮高度、背景和禁用态断言。
- React Demo 类目复核后恢复旧站说明中的 20 个行内 `code` 语义标记，删除未经
  授权的 API 补充说明；交互控件继续统一来自公共 `InputNumber` 或
  `Radio.Group`，未发现 Demo 自写原生交互标签。
- Demo 外壳复用共享 `demoCodebox.css`、公共代码区样式和公共 API 表格样式；
  移除 InputNumber 文档内的重复代码操作区、API 区及桌面 Demo 行布局样式。
- E2E 已锁定 20 个原始行内代码标记和额外 API 文案不得出现。
- Slider 组合场景新增 `controls="hover | always | hidden"`；单测锁定
  `hidden` 不渲染步进按钮、`always` 持续显示公共步进器。

## 限制

- Slider、Watermark、Pagination 的迁移不在本次范围。
