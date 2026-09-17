# PageHeader React Island 验收记录

## 范围

- 公共组件：`PageHeader`
- 文档 Demo：`基础用法`
- API 表、展示代码和复制代码同源

## 契约

- 原始标题、说明、顺序、文案、布局、尺寸、初始状态和交互见
  `docs/specs/qizhi-page-header-contract-v1.md`。
- 欢迎语为
  `Good day，欢迎使用 启智 开启新的一天 😃`。
- PageHeader 与欢迎语容器高度均为 54px；文字为
  18px / 22px / 600。

## TDD 门禁

生产代码修改前，5 个目标文件组按预期失败：

- PageHeader 模块不存在；
- 公共包没有 PageHeader 导出；
- 文档 Island 不存在；
- 公共样式所有权未建立。

实现后的定向结果：

- 5 个测试文件、14 项测试通过；
- TypeScript 类型检查通过；
- 1440、1024、375 三档 Playwright 共 3 项通过。
- 全量 Vitest：325 个测试文件、1498 项测试通过；
- 文档站、`@wangxiaojinger/qizhi-react` 和消费端 smoke 三段生产构建通过；
- `node --check script.js` 与 `git diff --check` 通过。

浏览器首轮先纠正了测试对路由类名的错误假设：
实际公共协议是 `is-visible`。第二轮发现公共组件字号被文档壳层
`.doc-section p` 覆盖为 15px；最终在公共组件内部使用最小必要作用域，
恢复实际 18px，并在三档重新验证通过。

## 三档浏览器证据

- Demo 内边距：四边 48px；
- PageHeader 实际高度：54px；
- 欢迎语实际高度 / 最小高度：54px；
- 字体：18px / 22px / 600；
- 375px 下欢迎语换成两行，仍完整位于 54px 容器内；
- 公共操作区间距与右内边距符合基线；
- 展示源码与剪贴板内容逐字一致；
- Demo 与页面均无横向溢出；
- 控制台无新增错误。

已查看三档共 3 张目标截图。未发现文字、边框、操作区或代码区裁切。

## 验收状态

- 自动验证：`candidate_pass`
- 独立最终验收：`pending`
