# Table React Island 验收记录

- 日期：2026-08-21
- 页面：`/#component-table`
- 本地服务：`http://127.0.0.1:5175`

## 自动化

- Table 组件与文档目标测试：9 项通过。
- TypeScript：根工作区与 `@wangxiaojinger/qizhi-react` 通过。
- 构建：文档站、`@wangxiaojinger/qizhi-react`、smoke consumer 通过；仅保留既有大 chunk 警告。
- Table Playwright：1440、1024、375 三个项目通过；覆盖 12 个 Demo、排序、单选、展开/收起、树形属性切换、空状态、吸顶、分组表头、合并单元格、指针拖拽、页面与逐 Demo 横向溢出、控制台错误。

## 截图人工检查

- 1440：12 个 Demo 顺序正确，表格行高、选中态、展开区、控制面板、API 表可见。
- 1024：表格超宽内容由 Table 内部滚动承载，文档章节与 Demo 容器不横向溢出。
- 375：表格保持列宽并内部滚动，姓名不再逐字竖排；文档固定头在超长元素截图拼接中会叠加显示，但不属于 Table 内容。

## 全量测试限制

单独执行 `pnpm test` 的仓库全量结果为 707 通过、10 失败：9 项为 5 秒并发超时，另 1 项为既有 Popover hover 测试失败。Table 目标测试不在失败项中，因此不声明仓库全量测试通过。
