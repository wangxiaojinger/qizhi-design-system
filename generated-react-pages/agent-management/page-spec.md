# Agent 管理 React 页面 Page Spec

status: candidate_pass
implementation: implemented
independent_verification: pending

## 事实源与优先级

1. 主要事实源：`/Users/maomao/Documents/Codex/2026-08-27/zhe/outputs/PRD-Agent管理功能.md`。
2. 结构与完整性交叉源：`/Users/maomao/Documents/Codex/2026-08-27/zhe/outputs/Agent管理功能产品需求文档.docx`。
3. 当前用户请求对 Mock Demo 范围、可操作状态、验证方式和安全边界的明确要求，优先于产品文档中同主题的“建议”。该优先级只确立前端 Demo 行为，不把建议升格为真实后端规则。

交叉结论：DOCX 含 403 个正文段落和 3 个表格，其章节、字段、文案、建议与待确认项与 Markdown 对应；未发现产品语义冲突。DOCX 提供封面、标题层级和表格化结构，Markdown 继续作为内容与文案的主事实源。

## 实现方案

### 方案 A：单个 React 应用内部视图状态（推荐）

- 一个独立 Vite/React 页面，使用 `list` / `detail` 内部视图状态。
- 新建、复制、编辑、新增版本共用受控表单与 QIZHI `Drawer`。
- Skill/MCP 选择、放弃未保存内容、删除确认使用 QIZHI `Modal`。
- 所有数据只存在当前 React 内存，刷新浏览器即还原。
- 优点：能完整验证交互，不伪造路由、权限或数据持久化。

### 方案 B：Hash 路由列表/详情

- 可产生可复制的详情 URL，但需要补定路由协议和刷新恢复行为。
- 产品文档未确认 URL 和路由规则，当前 Demo 不采用。

### 方案 C：列表、详情分成多个独立应用

- 可降低单文件复杂度，但会引入跨页 Mock 数据同步和持久化假象。
- 与“当前页面中产生可见 Mock 状态变化”的要求不匹配，不采用。

待审定实现方案：方案 A。

## 已确认事实

### 产物与范围

- 产物是一个独立可运行的 QIZHI React Agent 管理页面候选。
- 根据用户在 2026-08-27 的后续明确要求，页面包含截图所示的顶部导航、左侧 Agent 平台菜单和 Agent 主内容区；仍不实现真实认证、权限中心或部署系统。
- 顶部、左侧和主内容壳层整体使用公开 `PlatformShell`；候选页不再跨目录导入文档 Demo，也不直接组合 `Layout`、`TopNavigation`、`SideNavigation` 或基础 `Menu` 重组已有平台框架。
- 按用户后续明确要求，界面不展示“Mock Demo”说明和“Mock 状态”验收控件；未接入真实 API、认证、权限、持久化、文件上传、部署或删除服务的边界仅在 Page Spec 与生成报告中记录。
- 页面使用 Mock 数据和本地 React 状态展示交互。
- 复制、新建、编辑、删除、新增版本必须产生可见的本地 Mock 状态变化。
- 删除和关闭含未保存内容的表单必须二次确认。
- 不使用浏览器原生 `alert`、`confirm` 或 `prompt`。

### Agent 管理列表

- 页面标题：“Agent 管理列表”。
- 范围切换：“我创建的”、“全部”；默认选中“我创建的”。
- 搜索框占位文案：“输入关键字搜索”。
- 项目筛选触发器只展示选中值：默认为“全部”，不重复“所属项目：”。
- “我创建的 / 全部”复用 QIZHI 公共线框型 `Radio.Group type="button"`，不自制切换控件。
- 列表不出现横向滚动条；操作列使用 `Table` 公共右侧固定能力，“删除”默认色为 `color-text-3`。
- 刷新图标按钮位于“+ 新建 Agent”左侧。
- 主按钮：“+ 新建 Agent”。
- 表头顺序：“Agent 名称”、“版本号”、“所属项目”、“标签”、“描述”、“创建人”、“更新时间”、“操作”。
- 无标签时显示“-”；描述过长时单行截断。
- 列表使用公共 `Table` 的默认密度，表头与内容行均为 `56px`，与旧规范默认表格一致。
- 创建人使用头像/首字母圆形标识和用户名。
- 更新时间显示到秒，并提供升序/降序切换。
- 行操作顺序：“复制”、“详情”、“编辑”、“删除”。
- 列表支持范围、关键字和所属项目组合筛选，支持刷新和更新时间排序。
- 分页需要统计文案、页码、上一页/下一页、每页条数和跳页。样例文案：“第 1-10 条/共 31 条”、“10 条/页”、“跳至”、“页”。
- 需要可见演示加载、无数据、筛选无结果和失败状态。
- 筛选无结果文案：“未找到符合条件的 Agent”。
- 失败文案：“加载失败，请重试”。

### 新建 Agent

- “+ 新建 Agent”从右侧打开宽抽屉，标题为“新建 Agent”。
- 抽屉显示遮罩，内容可纵向滚动，底部操作区固定显示“取消”、“新建”。
- 表单分区：“基本信息”、“Agent 指令”、“能力设置”。
- 版本号：必填，新建默认显示“V1”且可编辑；编辑已有 Agent 时不可编辑。
- Agent 名称：必填；占位文案“请输入 Agent 名称”；字数计数格式“0 / 64”。
- Agent 名称完整格式规则：1–64 字符；首字符必须为字母；其余仅允许字母、数字、下划线 `_`、短横线 `-` 和点 `.`。
- Agent 名称帮助文案：“支持字母，数字，下划线，短横线和点，且只能以字母开头”。
- 格式错误文案：“名称只能包含字母、数字、下划线、短横线和点，且必须以字母开头”。
- 超长文案：“Agent 名称不能超过 64 个字符”。
- 所属项目：必填，占位文案“请选择”。
- 标签：选填；使用公共 `InputTag`，输入后按 Enter、中英文逗号或离开输入框时转为可移除标签；文案“请输入标签，如：金融分析，风控，单个标签字数最多不超过8个字符；”；单个标签最多 8 个字符。新建成功后，列表使用公共 `Tag` 展示已提交标签。
- 描述：选填，多行，占位文案“请输入 Agent 的功能描述”。
- 录入方式：必填，“手动录入”与“文件上传”互斥，默认为“手动录入”。
- 手动录入字段：“Agent 指令内容”，占位文案“请输入 Agent 指令内容”，必填；使用公共 `Input.TextArea`，自动高度范围为 3–6 行。
- 文件上传只演示前端选择、文件名显示、替换、移除和基础格式反馈；不读取或上传真实敏感内容。
- Skill 表头：“Skill 名称”、“版本号”、“所属项目”、“创建人”、“简介”、“操作”。
- Skill 空状态文案：“暂无数据”；添加入口：“+ 选择Skill”。
- MCP 表头：“MCP 名称”、“版本号”、“服务状态”、“Tools”、“所属项目”、“创建人”、“操作”。
- MCP 空状态文案：“暂无数据”；添加入口：“+ 选择MCP”。
- Skill/MCP 选择器必须支持打开、选择、取消、确认；已选列表必须支持移除。
- 取消、关闭、校验失败、提交中、新建成功和新建失败均需要可见状态。

### Agent 详情

- 面包屑文案：“Agent 管理列表 / Agent 详情”。
- 头部显示 Agent 图标、Agent 名称、描述、创建人、“更新时间：YYYY-MM-DD HH:mm:ss”、“删除”和“编辑”。
- 当前页签：“基本信息”。
- 版本区标题：“版本列表”；操作：“+ 新增版本”。
- 版本项显示版本号；当前版本显示绿色圆点和“当前版本”；点击版本切换右侧详情。
- 基本信息显示“所属项目”和“标签”；无标签显示“-”。
- 指令区标题：“Agent 指令”。
- 文件路径/名称样例：“sdk-memory-store-agent-81bdb5d9 / README.md”。
- 指令查看模式：“预览”、“Markdown”；默认为“预览”。
- 指令支持复制和下载等已确认操作，操作需有成功/失败反馈。
- 详情 Skill 表头：“Skill 名称”、“版本号”、“所属项目”、“创建人”、“简介”。
- 详情 MCP 表头：“MCP 名称”、“版本号”、“服务状态”、“Tools”、“所属项目”、“创建人”、“更新时间”。
- 详情页提供“编辑”、“删除”入口。

### 编辑、复制、新增版本与删除

- 列表和详情的“编辑”打开同一表单结构，并回填当前 Mock 配置。
- 编辑底部操作为“取消”、“保存”；校验规则与新建一致。
- 保存成功后，当前页面的列表和详情 Mock 数据同步更新。
- 编辑的真实版本策略不得被声称为已接入后端行为。
- “复制”需产生可见 Mock 状态变化。
- “+ 新增版本”需在版本列表产生可见 Mock 版本变化。
- “删除”需二次确认，包含“取消”和“删除”。
- 必须演示删除成功、删除失败和存在引用时的界面状态。
- 删除仅操作当前内存中的 Mock 记录，不执行级联、恢复、依赖校验或持久化。

### 可访问性与响应式

- 键盘可完成列表筛选、主要操作、Drawer 表单、选择器和确认流程。
- Drawer/Modal 关闭后焦点返回触发元素。
- 1440、1024、375 三档不得有非预期页面横向溢出。
- 在窄屏中，宽表格可以在页面自有表格区域内水平滚动，但不能推宽页面。
- Drawer、Dropdown、Tooltip、Modal 等打开状态需检查遮挡、裁切、焦点和视口边界。

## 精确文案清单

以下文案必须保持原文，不擅自翻译、简化或改写：

- Agent 管理列表
- 我创建的
- 全部
- 输入关键字搜索
- 全部（所属项目筛选默认值）
- + 新建 Agent
- Agent 名称
- 版本号
- 所属项目
- 标签
- 描述
- 创建人
- 更新时间
- 操作
- 复制
- 详情
- 编辑
- 删除
- 10 条/页
- 跳至
- 页
- 新建 Agent
- 基本信息
- 请输入 Agent 名称
- 0 / 64
- 支持字母，数字，下划线，短横线和点，且只能以字母开头
- 请选择
- 请输入标签，如：金融分析，风控，单个标签字数最多不超过8个字符；
- 请输入 Agent 的功能描述
- Agent 指令
- 录入方式
- 手动录入
- 文件上传
- Agent 指令内容
- 请输入 Agent 指令内容
- 能力设置
- Skill
- Skill 名称
- 简介
- 暂无数据
- + 选择Skill
- MCP
- MCP 名称
- 服务状态
- Tools
- + 选择MCP
- 取消
- 新建
- Agent 管理列表 / Agent 详情
- 当前版本
- 版本列表
- + 新增版本
- 预览
- Markdown

以下状态文案来自产品文档的建议区，但当前请求明确要求可见 Mock 反馈；因此仅作为 Demo 文案，不声称为真实产品/后端协议：

- 请输入 Agent 名称
- 名称只能包含字母、数字、下划线、短横线和点，且必须以字母开头
- Agent 名称不能超过 64 个字符
- 请选择所属项目
- 单个标签不能超过 8 个字符
- 请输入 Agent 指令内容
- 请上传 Agent 指令文件
- 文件格式不支持，请重新上传
- Agent 新建成功
- Agent 新建失败，请重试
- Agent 保存成功
- Agent 删除成功
- 该 Agent 正被运行实例或部署使用，解除引用后才能删除
- 加载失败，请重试
- 未找到符合条件的 Agent

## 可逆假设

- 页面默认当前 Mock 用户为 `inspire-admin`；“我创建的”只根据 Mock `creator` 字段筛选，“全部”仅展示全部 Mock 记录，不表示真实可见权限。
- 关键字在候选中只匹配 Agent 名称；描述、标签和创建人的搜索范围保持未决。
- 默认按更新时间降序；点击排序只在升序/降序间切换。
- 刷新保留当前筛选条件，使用短暂 Mock loading 后恢复数据。
- 切换范围、关键字、项目或每页条数时回到第 1 页。
- 空数据、失败、删除失败和存在引用通过预置 Mock 情景与页面操作触发，不映射真实服务状态。
- 新建版本号默认为 `V1` 且可编辑；编辑已有 Agent 时版本号禁用。新增版本的真实服务端编号策略仍未确认。
- 文件上传 Demo 只接受单个 `.md` 或 `.txt` 文件，只保存文件名与基础元数据，不读取文件内容；格式和数量是可逆 Demo 限制。
- 切换已有指令的录入方式时，保留两种模式的本地草稿，不丢失内容。
- Skill/MCP 允许在 Mock 数据中多选、移除；不强制至少选择一项，不验证跨项目引用权限。
- MCP 选择器会可见标记不可用服务；候选实现不允许选中不可用 MCP，但该策略仅是安全的 Mock 默认。
- 复制会打开“新建 Agent”抽屉，回填项目、标签、描述、指令、Skill 和 MCP，但清空 Agent 名称；不生成未经确认的默认名称。
- 编辑只更新当前页面内存中的选中版本数据和时间；不宣称是原地编辑或自动新建版本的真实策略。
- “+ 新增版本”会复制当前 Mock 版本为下一个可见版本并选中查看；不改变原“当前版本”标记，避免自行决定版本生效策略。
- 删除成功只从当前内存列表移除选中的 Mock Agent 记录。预置一条“存在引用”记录和一条“删除失败”记录；它们不会被移除。
- 指令下载使用浏览器在本地从 Mock 文本生成 `README.md`；复制使用 Clipboard API；两者都不记录或上传内容。
- “预览”只做受限的安全文本排版，不宣称完整 Markdown 解析兼容性。

## 未决问题

1. Agent 名称的唯一性范围是全局、项目还是创建人范围？是否区分大小写？
2. “全部”包含哪些项目、创建人和权限范围？
3. 新增版本如何生成和校验版本号，是否自动成为当前版本？新建可编辑、编辑不可编辑已确认。
4. 编辑是修改原版本还是自动生成新版本？
5. 删除作用于当前版本还是整个 Agent 及其全部版本？是否可恢复？
6. 已被运行实例、自定义部署或其他资产引用时，编辑和删除的真实策略是什么？
7. 文件上传的正式格式、文件大小、数量、编码、解析和安全扫描规则是什么？
8. 标签最多几个？是否允许重复、新建标签或特殊字符？
9. Skill/MCP 是否可跨项目选择？同一 Skill 是否可选多个版本？不可用 MCP 是否允许保存？
10. 详情页路径旁和指令内容区的图标分别复制什么、下载什么，是否需要全屏？
11. 复制后的默认名称、项目、版本、Skill/MCP 引用和跨项目校验如何处理？
12. 创建人、项目管理员、平台管理员的查看、创建、编辑、删除、复制和下载权限是什么？
13. 描述和 Agent 指令的正式最大长度是什么？
14. 分页跳页的非数字、小于 1 和大于总页数的正式错误文案是什么？
15. 关键字除 Agent 名称外，是否搜索描述、标签和创建人？

未发现 Markdown 与 DOCX 之间需要二选一的冲突。上述问题来自两份文档共同标注的未验证或待确认规则。

## 组件映射

| 需求元素 | 公开导入 | 证据 | 候选使用方式 | 结论 |
|---|---|---|---|---|
| 页面操作、文字/图标按钮 | `Button` | `complete_evidence`；公开导出、类型、实现、API/Demo/契约齐全 | 新建、刷新、操作列、抽屉、弹窗和详情操作 | 复用 |
| 平台壳层与导航 | `PlatformShell` | `complete_evidence`；`FrameworkPreviewDemo.tsx`、公开类型、实现、API 和测试存在 | `selectedKey="agent"`；`sideNavigationProps` 选中 `agent-item` 并提供 `HW-H800-Public` | 直接从 `@wangxiaojinger/qizhi-react` 公共入口整块调用 |
| 空间/区域菜单 | `Dropdown` | `complete_evidence`；公开触发器、菜单项和键盘/关闭行为 | 工作空间与区域切换的本地 Mock 交互 | 复用 |
| 列表范围切换 | `Radio.Group` | `complete_evidence`；公开导出、类型、实现、线框型 Demo 和测试齐全 | `type="button"`，受控 `value` + `onChange` | 复用 |
| 录入方式切换 | `Radio.Group` | `complete_evidence`；公开导出、类型、实现、线框型 Demo 和测试齐全 | `type="button"`，受控 `value` + `onChange` | 复用 |
| 详情查看模式切换 | `Segmented` | `partial_evidence`；公开导出、`Segmented.types.ts`、实现与测试存在，缺完整 API/Demo Registry | 受控 `value` + `onChange` | 复用，报告部分证据 |
| 关键字搜索 | `Input.Search` | `complete_evidence` | 受控搜索值、清空和 `onSearch` | 复用 |
| 项目筛选与表单项目 | `Select` | `complete_evidence` | 受控单选 | 复用 |
| 列表与 Skill/MCP 配置表 | `Table` | `complete_evidence`；`Table.types.ts` 含 sorter、loading、scrollX、empty | 列定义、排序、加载、空状态和局部水平滚动 | 复用 |
| 分页/每页条数/跳页/统计 | `Pagination` | `complete_evidence`；`Pagination.types.ts` 和 Complete/Total/PageSize/Jumper Demo | `showTotal`、`showPageSize`、`showJumper` 与受控页码 | 完整复用 |
| 加载、无数据、筛选无结果、失败 | `Skeleton` / `Spin` / `Empty` / `Alert` | 均为 `complete_evidence` | 按列表状态切换 | 复用 |
| 创建/编辑/复制/新增版本 | `Drawer` | `complete_evidence`；受控 open、footer、maskClosable、escToClose、onClose | 共用受控表单抽屉 | 复用 |
| 表单结构 | `Form` / `Form.Item` | `complete_evidence`；公开 v1 只负责布局与字段结构 | 受控值、校验和提交由页面管理 | 复用，不伪造 Form 注册/验证 API |
| Agent 名称、版本号、描述、指令 | `Input` / `Input.TextArea` | `complete_evidence` | `maxLength`、`showWordLimit`、`status`、受控 onChange | 复用 |
| 标签输入 | `InputTag` | `complete_evidence`；含受控数组、`validate`、`maxTagCount` | 校验单个标签长度不超过 8 | 复用 |
| 文件选择/列表/移除 | `Upload` | `complete_evidence`；公开类型和 Upload API/Demo 支持 fileList、beforeUpload、onRemove、accept、limit | 受控单文件列表，禁止真实请求 | 复用 |
| Skill/MCP 选择、放弃未保存内容、删除确认 | `Modal` | `complete_evidence`；受控 open、footer/ok/cancel、loading、mask/esc | 选择器和页面内安全确认 | 复用 |
| 选择器多选 | `Checkbox` | `complete_evidence` | 在 QIZHI `Table` 内作为显式多选控件 | 复用 |
| 成功/失败/复制/下载反馈 | `Message` | `complete_evidence`；含 success/error/loading 静态 API | 局部 Mock 操作反馈 | 复用 |
| 创建人 | `Avatar` | `complete_evidence` | 首字母头像 + 用户名 | 复用 |
| 详情头部卡片 | `DetailHeader` | `complete_evidence`；公开导出、类型、实现、Demo 和测试齐全 | 复用 icon、title、action、audit 和 tabs 槽位 | 复用 |
| 详情返回线索 | `Breadcrumb` | `complete_evidence` | 页面内从详情回到列表 | 复用 |
| 详情基本信息页签 | `Tabs` | `complete_evidence` | 只展示文档已确认的“基本信息” | 复用 |
| 标签与 MCP 服务状态 | `Tag` | `complete_evidence` | 只做信息展示 | 复用 |
| 所属项目提示与操作帮助 | `Tooltip` | `partial_evidence`；公开导出、类型、实现与测试存在，缺完整证据 | 仅用于已确认的信息提示 | 复用，报告部分证据 |
| 页面与导航图标 | `RefreshIcon`、`CopyIcon`、`UploadFileIcon`、`AgentDebugIcon`、`SkillIcon`、`McpIcon`、`RuntimeIcon`、`AgentCustomDeploymentIcon`、`SandboxIcon`、`FileIcon`、`AiImageIcon`、`ComputeQuotaManagementIcon`、`ComputeTypeGroupManagementIcon`、`SchedulingConfigurationIcon` | `partial_evidence`；图标库 manifest、公开导出与实现存在，缺独立 API | 仅通过 `@wangxiaojinger/qizhi-react` 或 `@wangxiaojinger/qizhi-react/icon` 公开入口使用 | 按业务语义复用，不自绘 SVG |

`PlatformShell` 实际使用 API：`className="agent-page-product-shell"`、`selectedKey="agent"`、`children`；`sideNavigationProps` 转发 `selectedKey="agent-item"`、`workspaces=["HW-H800-Public"]`、`defaultWorkspace="HW-H800-Public"`、`className="agent-page-side-navigation"`。页面不接触组件私有后代类，375px 仅通过公开根 `className` 限制侧导航高度。

## 能力缺口

1. 仓库没有公开的 Agent 管理、Agent 表单、Skill 选择器或 MCP 选择器业务组件。候选页只能用 QIZHI 公开基础组件组合，不把组合结构声称为新的公共组件。
2. QIZHI React 没有公开 Markdown 渲染组件。候选页的“预览”只做安全的受限文本排版；“Markdown”显示原文。不支持完整 CommonMark/GFM，不使用 `dangerouslySetInnerHTML`。
3. 图标目录内存在 `DownloadIcon` 源文件，但它没有从 `packages/qizhi-react/src/index.ts` 或 `packages/qizhi-react/src/icon/index.ts` 公开导出，因此不可使用。候选页使用 QIZHI 文字按钮“下载”，并在报告中保留该图标缺口。
4. `Form` v1 只负责布局和字段结构，没有公开表单注册、值容器、校验器或提交 API。候选页使用 React 受控状态和明示错误文案，不伪造 Form API。
5. 文档没有提供 Skill/MCP 选择器的截图、精确布局和全部文案。候选页只实现完成最低交互要求的 QIZHI `Modal + Input.Search + Table + Checkbox`，视觉不宣称 1:1 还原未提供的设计。
6. 真实文件解析、敏感内容检测、文件上传进度和服务端上传不在候选页范围内。
7. 真实权限、引用关系、并发版本冲突、审计和软删除均缺少公开数据协议，只能演示明确标注的 Mock 结果。
8. `PlatformShell` 已从 `@wangxiaojinger/qizhi-react` 公共入口导出；候选页仍使用本地 workspace 链接，脱离仓库分发时需要发布含该组件的组件库版本。

## 外部系统要求

以下是未接入的外部系统与真实产品能力，候选页不得宣称已实现：

- Agent 列表、详情、新建、编辑、复制、版本和删除 API。
- 登录、身份、当前用户和角色权限。
- 项目可见性、创建权限、跨项目资产引用权限。
- Agent 名称唯一性校验。
- Skill/MCP 实时目录、版本、服务状态和 Tools 授权。
- Agent 指令文件解析、存储、上传、下载、病毒/凭据/敏感内容扫描。
- 运行实例、自定义部署和其他资产引用查询。
- 删除范围、级联策略、软删除、恢复和保留期。
- 版本生成、当前版本生效、回滚、运行/部署绑定与并发编辑冲突。
- 真实持久化、幂等保护、操作审计和产品埋点。

## Mock 状态模型

### 列表状态

- `ready`：显示筛选、表格和分页。
- `loading`：作为产品状态规格保留；候选页不提供面向用户的手动 Mock 状态切换器。
- `empty`：Mock 数据集为空，显示“暂无 Agent”。
- `filtered-empty`：有 Mock 数据但组合筛选无结果，显示“未找到符合条件的 Agent”。
- `error`：显示“加载失败，请重试”和重试入口，重试后恢复 `ready`。

### 表单状态

- `create`：空表单，版本号默认为 V1 且可编辑。
- `copy`：复用 create 界面，清空名称，回填其他可复制 Mock 配置。
- `edit`：回填选中 Agent/版本。
- `version`：回填选中版本，预览下一个 Mock 版本号。
- `qizhi-drawer-body` 的上下 padding 为 `16px`，桌面端左右 padding 为 `24px`；抽屉内 `agent-page-form` 的 padding 为 `0`，三个 `agent-page-form-section` 之间的 gap 为 `16px`，每个分区跟随 Drawer 内容宽度；桌面端 Input、Select、InputTag 和 TextArea 的统一最大宽度为 `558px`，窄屏不得超出可用宽度。
- 提交被必填校验阻断时，焦点移到第一个错误字段，避免表现为“点击无反应”。
- `dirty`：任意字段、指令模式、文件、Skill 或 MCP 变化后为真；取消、关闭、遮罩或 Esc 请求需要放弃确认。
- `submitting`：提交按钮 loading/禁用，防止重复提交。
- `invalid`：字段与页面级错误可见，保留用户输入。

### 删除状态

- `confirm`：显示删除对象名称和 Mock 说明，提供“取消”、“删除”。
- `success`：仅移除当前 Mock 记录，显示“Agent 删除成功”。
- `failure`：保留记录，显示 Mock 失败原因和重试/取消。
- `blocked-by-reference`：保留记录，显示“该 Agent 正被运行实例或部署使用，解除引用后才能删除”，不提供解除引用的假入口。

## 危险行为边界

- 页面不执行真实删除、文件上传、权限变更、部署、运行实例解绑或跨资产引用变更。
- 删除范围未确认；不使用“删除整个 Agent 及全部版本”或“仅删除当前版本”作为真实产品文案。
- 编辑版本策略未确认；不展示“已更新线上实例”或类似的真实生效反馈。
- 文件只保留文件名和 `File` 元数据用于当前 UI；不读取内容，不传输到网络，不保存到本地持久化存储。
- 所有 Mock 数据在浏览器刷新后恢复，避免形成“已保存”的长期假象。

## 验收设计

### 确定性门禁

- `validate_react_output.py` 无 finding。
- TypeScript 类型检查退出码 0。
- Vite 生产构建退出码 0。
- 基础组件仅从 `@wangxiaojinger/qizhi-react`、`@wangxiaojinger/qizhi-react/icon`、`@wangxiaojinger/qizhi-react/style.css` 使用；平台框架整块使用公开 `PlatformShell`，不在页面内重组。
- 不含 `.qizhi-xxx__*` 私有选择器、行内布局样式、自绘 SVG 或可由 QIZHI 组件替代的原生交互控件。

### 必测交互

- 列表：范围、搜索、项目、组合筛选、排序、刷新、分页、每页条数、跳页。
- 状态：loading、空数据、筛选无结果、失败、重试。
- 新建：打开、关闭、取消、未保存确认、名称空/格式/长度错误、项目错误、指令错误、重复提交、成功、失败。
- 录入方式：手动/文件切换、文件格式错误、文件名显示、替换、移除。
- Skill/MCP：选择器打开、选择、取消不污染已选列表、确认、移除、重复打开。
- 详情：进入/返回、版本切换、预览/Markdown、路径复制、指令复制、下载反馈。
- 复制：正确回填、名称为空、提交后列表新增 Mock Agent。
- 编辑：列表/详情入口、回填、取消、未保存确认、校验、保存后列表/详情同步。
- 新增版本：产生可见 Mock 版本，不改变未确认的当前版本策略。
- 删除：列表/详情入口、取消、成功、失败、引用阻断、重复触发。
- 键盘：Tab 顺序、Enter/Space 主要操作、Esc 请求关闭、关闭后焦点返回触发器。

### 三档视觉和盒模型

- 1440、1024、375 三档记录 `documentElement.scrollWidth/clientWidth`。
- 375px 记录主内容、工具条、列表滚动区、Drawer 主体、表单列和直接子项的计算宽度。
- 打开 Drawer、Select/Dropdown、Tooltip 和 Modal，检查浮层、触发器、最近容器和视口边界。
- 对所有打开浮层自节点向上检查 `overflow`、`overflow-x`、`overflow-y`、`clip-path` 和 `contain`。
- 截图并人工检查：列表、新建 Drawer、详情、编辑 Drawer、删除确认、移动端关键状态。
- 检查控制台错误、pageerror、4xx/5xx 资源响应。

## 实现与验收状态

方案 A 已实现为当前 Vite + React + TypeScript 候选页面，并已迁移为公开
`PlatformShell` 消费方。本轮 1440/1024/375 候选浏览器证据已完整执行：
Shell 数量、导航选中、Header/Body/Sider/Main 直接子节点几何、交互、溢出和
控制台检查均已记录；三档全页都只有一个 `main` landmark，内容底边均位于
Main、Body 和 Shell 内，浅蓝 Main 背景覆盖完整内容。生产级联修复后，375px 的
`.agent-page-side-navigation` 计算高度为目标 560px，最终集成脚本退出 0，
因此自动状态为 `candidate_pass`。
独立验证仍为 `pending`，不据此推断用户已完成最终确认。
