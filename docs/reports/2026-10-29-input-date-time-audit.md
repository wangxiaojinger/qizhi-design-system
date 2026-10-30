# 输入框、日期、时间选择器统一验收

日期：2026-10-29。范围：现有 Input、DatePicker、TimePicker 及其共享面板与直接消费者。未新增文档分类，未提交、合并或发布。

## 验收矩阵

| 维度 | 已验证场景 | 证据 | 状态 |
| --- | --- | --- | --- |
| Input 值与事件 | 受控/非受控、拒绝清空保留值、清空事件方法、格式化、只读/禁用 | Input.test.tsx、InputVariants.test.tsx | 通过 |
| Input 组合 | Search 图标/按钮/Enter、输入法组合确认、取消搜索、loading、Password 显隐、计数与清空 | 同上、inputDocs.test.tsx | 通过 |
| Input 视觉 | error/warning 在 hover/focus 保持语义色，尺寸、计数、前后缀 | input-react-island.spec.ts | 通过 |
| DatePicker 周期 | 日期/周/月/季/年、周期部分可选、禁用反馈、季度定位、闰年/非法日期 | DatePicker.test.tsx、Picker.audit.test.tsx | 通过 |
| DatePicker 状态 | 起止独立时间、结束字段键盘打开、单独编辑结束日期、外部更新、动态禁用、禁止凭时间生成日期 | 同上 | 通过 |
| DatePicker 提交 | 禁用日期/时间、起止顺序、完整值回显、确认前不提交 | 同上 | 通过 |
| DatePicker 键盘 | 方向键跨月/跳过禁用日、Escape 回原字段、离开关闭 | Picker.audit.test.tsx | 通过 |
| TimePicker 状态 | 独立起止、即时提交/确认草稿、取消不提交、受控更新、清空、动态禁用 | TimePicker.test.tsx、Picker.audit.test.tsx | 通过 |
| TimePicker 限制 | 默认排序/跨午夜不排序、排序后按起止角色再校验、禁用/隐藏时间、步长、跳过禁用项 | TimePicker.test.tsx、TimePanel.test.tsx、Picker.audit.test.tsx | 通过 |
| 共享视觉 | 时间标题与星期对齐、表头横线对齐、竖线到底、灰色禁用项、三视口 | date-picker-react-island.spec.ts、time-picker-react-island.spec.ts | 通过 |
| 消费者 | Form、AutoComplete、Modal、Drawer 文档及相关组件 | 29 文件/250 用例定向测试 | 通过 |
| 工程 | 全量去重测试、两层 TypeScript、文档构建、组件库构建/声明/导出 | 下列命令 | 通过 |

## 本轮复现与修复

新增边界测试初次运行 9 项中 7 项失败：月/季/年按首日误禁用，Escape 恢复错误字段，日期/时间焦点离开后浮层不关闭，方向键不移动日期。修复后 9 项通过。之后补充外部更新、动态禁用、排序后角色校验与闰年边界，随全量测试通过。

单日期时间使用同一日期时间对象传递禁用规则，避免显示时间与回调参数不一致。失焦关闭同时保留组件内禁用按钮点击的焦点，已有“未完成范围点击禁用确认不关闭”测试通过。

真实浏览器复现 Input 错误状态 hover 被普通边框覆盖，修复状态选择器优先级，保留语义 token 驱动的浏览器断言。

## 执行记录

- `vitest run --maxWorkers=2 --exclude '**/node_modules/**' --reporter=dot`：228 文件、1258 用例通过。排除重复收集，未修改仓库全局测试配置。
- 定向组件/文档/消费者：29 文件、250 用例通过（补充的 5 项边界另由后续全量覆盖）。
- `tsc -p tsconfig.json --noEmit`、`tsc -p packages/qizhi-react/tsconfig.json --noEmit`：通过。
- `node --check script.js`：通过。
- 文档 `vite build`、组件库 `vite build`、`tsc -p tsconfig.build.json`、`exports-contract.mjs`：通过。
- 前一轮三组件 Chrome 三视口：9 项通过；日期新增几何断言：3 项通过。
- 最终包括 Input 状态颜色的 12 项 Chrome 三视口：12/12 通过。最终 CSS 后文档构建、组件库构建/声明/导出以及包消费者 smoke 构建均通过。

## 边界与未验证项

- 不是所有输入值的穷尽证明；这是上表明确场景的自测结果（candidate_pass），独立第三方验收仍 pending。
- 原生中文输入法/移动设备软键盘、Safari/Firefox、屏幕阅读器、跨时区与夏令时切换未实机验证；IME 当前使用组合事件模拟。
- 本轮不是 AntD 全 API 兼容改造。日历目前验证方向键；未承诺完整 Home/End/PageUp/PageDown 键位规范。
- 全量测试仍有已有的 React act/flushSync 警告，构建仍有大 chunk 提示；均未作为“零告警”处理。
- 私有源安装、发布流水线与线上文档部署不属于本轮通过项；此前独立安装尚未验收，不据本轮测试声称可发布。

## 2026-10-30 修复与独立安装复核

- 表格所有 Demo 保留最后一行 1px 底部分割线，包含选择列、展开行、嵌套表格与空态；浏览器实测 20 个表格实例无缺失，三档视口回归通过。
- 构建时将声明文件的相对引用补为显式 `.js` / `/index.js`，去除声明中的 CSS 副作用导入；导出契约检查新增声明引用和目标存在性校验。
- 在仓库外的临时项目安装打包后的 React、Tokens 压缩包，严格 Bundler、NodeNext 类型检查均通过；主入口、四个子入口和 SSR 通过，独立消费者三档交互无页面错误。此结果验证本地包安装，不代表私有源认证通过。
- 文档、组件包、消费示例构建与类型检查通过；API 清单已重新生成。Input、DatePicker、TimePicker、FilterSelect、Table 的 Chrome 三档 E2E 共 33/33 通过。
- Vitest 排除规则覆盖所有层级的 `node_modules`，避免重复收集工作区依赖中的测试；默认收集 228 个测试文件。
- 全量单测首轮 1257/1258 通过，图标文档复制用例在并发浏览器审计期间超过 5 秒；没有修改该用例或提高超时，单独复测图标文档 12/12 通过。不能将首轮结果写成全量一次通过。
- 主题静态与运行时审计已重新生成并通过时效校验；运行时无失败项、矩阵缺失、页面错误或页面横向溢出。主题审计 Node 测试 11/11 通过。
- 初次检查时 `gh auth status` 未登录、标准认证环境变量不存在，未认证私有源请求返回 401。发布准备时通过 Git 的系统钥匙串凭据确认源码读写权限；但包版本 API 返回 403，明确缺少 `read:packages`。因此源码推送可执行，私有源独立下载仍需具备包读取权限的认证后重试。
- 以上仍为 `candidate_pass`，独立最终验收为 `pending`，前述平台与辅助技术实机限制继续适用。
