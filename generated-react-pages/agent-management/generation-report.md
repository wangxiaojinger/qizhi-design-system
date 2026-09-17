# Agent 管理页面生成报告

status: candidate_pass
independent_verification: pending

## 2026-08-31 PlatformShell 迁移后浏览器验收

- 验收时预览：`http://127.0.0.1:5203/`；2026-08-31 13:01:58 CST 在完成前
  重新启动并返回 HTTP 200，对应会话 `28130`。该记录不保证未来持续在线。
- 1440、1024、375 三档候选 Chrome 证据已完整执行：每档恰有一个公开
  `PlatformShell`，顶部 Agent 与侧栏 Agent 均为当前项，空间为
  `HW-H800-Public`，Header/Body/Sider/Main 直接子节点几何连续；1440/1024
  Sider 宽度为 210px 并随主体内容增长，375 按公共规则等宽堆叠；公共
  Framework Demo 的短内容 Sider 基线仍精确为 800px。
- 三档均真实点击刷新并看到“列表已刷新”Message；Shell、主内容与页面均
  `scrollWidth <= clientWidth`，无旧 Header/body/Sider/greeting 壳层根节点，
  三档全页均只有一个 `main` landmark；内容底边均被 Main、Body、Shell 包含，
  Main 浅蓝背景覆盖完整内容。控制台、page error、request failure 和 HTTP
  4xx/5xx response 均为 0。
- 三张全页截图已人工查看：顶部导航、侧栏选中块、问候区、列表内容偏移和移动
  端纵向堆叠完整，无新增覆盖或横向溢出。
- 证据：`screenshots/platform-shell-browser-results.json` 及
  `screenshots/platform-shell-agent-{1440,1024,375}.png`。
- 本轮 Page Builder validator、TypeScript 均退出 0。Agent build 与组件包
  build 首次并行时遇到组件包重写 `dist` 的瞬时 CSS 缺失；组件包完成后顺序
  重跑为 1043 modules、退出 0。该次失败属于验证调度竞态，不是产品缺陷。
- 聚焦 Vitest 仍阻塞于 worker 启动，未执行用例，不记为通过。
- 生产级联修复后，375px `.agent-page-side-navigation` 的计算高度为目标
  560px，补强后的最终浏览器脚本退出 0；JSON 记录
  `expected=560px / actual=560px / pass=true`。

## 交付范围

- 可在当前 QIZHI 仓库内独立启动的 Vite + React + TypeScript 页面，包含顶部导航、左侧 Agent 平台菜单、Agent 列表、新建/复制/编辑/新增版本 Drawer、详情和删除确认。
- 所有业务数据和交互结果均为本地演示数据；按用户后续要求，界面不展示内部“Mock Demo”或“Mock 状态”验收控件，该边界仅在本报告与 Page Spec 中保留。
- 未接入真实 API、认证、权限、持久化、文件上传、部署或删除服务。
- 截图只作为布局和视觉层级参考；字段、文案、状态和安全边界仍以 Page Spec 与产品文档为准。

## QIZHI 公共组件及证据

- 完整证据：`PlatformShell`、`Menu`、`Dropdown`、`Button`、`Input`、`Select`、`InputTag`、`Form`、`Table`、`Pagination`、`Drawer`、`Modal`、`Upload`、`Checkbox`、`Radio.Group`、`DetailHeader`、`Empty`、`Avatar`、`Breadcrumb`、`Tag`、`Message`。
- 部分证据：`Segmented`、`Tooltip` 及所用图标；均有公开导出、类型/实现或测试证据，但部分缺完整 API/Demo Registry。
- 框架证据：直接使用 `@wangxiaojinger/qizhi-react` 公开导出的 `PlatformShell`，对应 `FrameworkPreviewDemo.tsx`；通过 `selectedKey="agent"` 和 `sideNavigationProps` 转发 Agent 选中项、工作空间及根类名，页面没有再用 `Layout`、`TopNavigation`、`SideNavigation`、`Menu`、`Button` 或私有 Demo CSS 重组平台框架。
- 除上述导航源外，组件仅从 `@wangxiaojinger/qizhi-react` 或 `@wangxiaojinger/qizhi-react/icon` 导入，基础样式仅从 `@wangxiaojinger/qizhi-react/style.css` 导入。
- 页面 CSS 只使用 `agent-page-*` 自有类；未选择 `.qizhi-xxx__*` 私有后代，未使用 JSX 行内布局样式，未使用原生交互控件或手绘 SVG 图标。

## Mock 数据和可逆假设

- 当前 Mock 用户为 `inspire-admin`；“我创建的”仅按本地 `creator` 字段过滤。
- 搜索仅匹配 Agent 名称；项目筛选、更新时间排序和分页均只操作内存数据。
- 列表范围切换复用公共线框型 `Radio.Group type="button"`；项目筛选只展示选中值，不在值前重复“所属项目：”。
- Agent 指令的“录入方式”同样复用公共线框型 `Radio.Group type="button"`；指令内容使用公共 `Input.TextArea`。
- 标签使用公共 `InputTag`，支持 Enter、中英文逗号与失焦提交；新建后的列表和详情使用公共 `Tag` 展示。Agent 指令文本域限定为 3–6 行，Drawer 三个表单模块间距为 16px。
- Agent 列表继续使用公共 `Table` 默认密度；修复公共 Table 的 size 高度归属后，默认表头与内容行均为 56px，中等均为 48px，小型均为 40px，未在页面层覆盖私有选择器。
- 新建时版本号默认为 V1 且可编辑；编辑已有 Agent 时版本号禁用。
- 新建、复制、编辑、新增版本和删除仅更新当前页面 React 状态，刷新后还原。
- `fail-agent` 演示提交失败；预置引用记录和失败记录分别演示删除阻断与删除失败。
- 文件上传只保留文件名、大小和 MIME 元数据，不读取或上传文件内容。
- 预览模式只实现安全的受限文本排版，不声称完整 Markdown 兼容。

## 能力缺口

- 没有公共 Agent、Skill/MCP 选择器或 Markdown 渲染业务组件。
- 没有公开的真实权限、引用检查、版本并发、审计、持久化和服务端上传协议。
- `Form` 公共 v1 只承担布局，页面使用受控 React 状态完成校验。
- 当前候选通过 workspace 链接消费已公开的 `PlatformShell`；脱离仓库分发前需要发布含该组件的组件库版本。

## 验证结果

- 本轮 `PlatformShell` 消费迁移：两个 Page Builder 输出边界检查均退出 0；Agent 页 TypeScript 检查退出 0；Agent 页 Vite 构建退出 0，1043 modules transformed；确定性源契约确认页面只保留一个 `PlatformShell` 消费点且没有私有 `.qizhi-platform-shell__*` CSS 选择器。
- 根契约 Vitest 和工作台页面级 Vitest 均在 `vitest-pool` 启动 forks worker 时等待 60 秒超时，未执行到测试；这是测试运行器环境阻塞，不记为产品测试失败或通过。
- `pnpm test`：2 个测试文件、14 个测试通过；包含新建版本号可编辑、编辑版本号禁用、录入方式线框型单选组、公共 `Input.TextArea` 结构、标签失焦提交和新建后列表 `Tag` 展示门禁。
- `pnpm typecheck`：通过。
- `pnpm build`：通过，Vite 成功生成 `dist/`。
- `python3 /private/tmp/qizhi-rollback-2026-08-27-1645/skills/qizhi-react-page-builder/scripts/validate_react_output.py . --source-root ../.. --format markdown`：通过，无违规输出；原 Skill 与页面一起位于回滚备份中，因此使用只读备份脚本复核。
- `node scripts/verify-browser.mjs`：通过 1440、1024、375 三档与新建、编辑、详情、删除、取消和失败恢复路径；验证 Drawer body 的 `color-fill-1`、`16px 24px`、表单 section 与 Drawer 内容宽度相等、空间下拉实际顶层命中、线框型 `Radio.Group`和公共 `DetailHeader`。
- Agent 浏览器回归额外验证默认 Table 表头与内容行均为 `56px`；公共 Table 独立三档 E2E 在 1440、1024、375 均通过，覆盖 default 56px、middle 48px、small 40px 的表头/内容行同高。
- 浏览器结果：11 张关键状态截图（含空间下拉打开态与新建后列表 Tag）；控制台错误 0，页面异常 0，失败资源 0。
- 1440、1024、375 三档列表滚动容器均满足 `scrollWidth <= clientWidth`；操作列计算样式为 `position: sticky`、右边界与表格对齐，“删除”按钮未被裁切，计算色值与 `color-text-3` 一致。
- 375px：`html`、`body`、`.agent-page-main`、`.agent-page-list` 均无横向溢出；表格两个直接子列实测宽度 319px，边界在内容区内；侧栏限制为 420px 并裁切外溢，内部菜单保持无滚动条滚动，主内容位于首屏范围。
- 人工截图检查：列表壳层、右侧 Drawer、详情上下卡片、移动端壳层和关键浮层均已查看；顶部工具文字无重叠，移动端侧栏未压住主内容，未发现非预期横向溢出。

## 验收边界

公共 Table 的完整旧交互 E2E 仍会在既有 Radio 原生 input 点击路径上被遮罩
拦截并超时；该记录与本轮 PlatformShell 验收分开。本轮框架迁移后的
1440/1024/375 候选证据已完成，375px 侧导航根高度修复后断言通过，因此当前
为 `status: candidate_pass`。独立验证保持 `pending`。
