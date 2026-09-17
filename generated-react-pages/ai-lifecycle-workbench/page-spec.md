# 启智 AI 全生命周期管理平台工作台 Page Spec

## 页面范围

登录后的工作台首页，聚合 AI 征程引导、任务概览、项目、用户摘要、审批单、最近访问和宣传入口。本页面不实现下游业务流程，也不证明真实 API、鉴权、持久化或运营配置已经存在。

## 已确认的产品需求

- 全局导航包含工作台、定制模型、模型服务、Agent、探索、运营中心、组织/区域、语言和账户入口；工作台为当前项。
- 欢迎区展示平台欢迎语。
- AI 征程包含申请/加入项目、模型训练与资产沉淀、模型服务化部署三步，并可关闭。
- 任务概览支持空间筛选，展示七类任务的总数与活动数。
- 项目区包含管理、参与、结项三个页签，支持搜索、申请项目、项目摘要和分页。
- 右栏包含用户摘要、三类审批数量、六个最近访问入口和 InspireCode 宣传入口。
- 页面需考虑加载、正常、空、局部错误、全局错误、无权限和数据过期状态；本交付只用 Mock 演示正常态与搜索空态。
- 服务端权限过滤、敏感数据保护和权限矩阵是正式产品要求，但不属于前端 Mock 可证明的能力。

## 需求到组件映射

| 页面需求 | QIZHI 公共组件 | 参考 Demo |
|---|---|---|
| 平台框架与顶部导航 | `PlatformShell` | `layout/demos/FrameworkPreviewDemo.tsx` |
| 业务操作 | `Button` | `button/demos/BasicDemo.tsx`、`IconDemo.tsx`、`DisabledDemo.tsx` |
| 组织/区域与空间筛选 | `Select` | `select/demos/BasicDemo.tsx`、`OptionsDemo.tsx` |
| 三步引导 | `Steps` | `steps/demos/BasicDemo.tsx`、`DescriptionDemo.tsx` |
| 任务统计 | `MetricCard` | `business-overview/demos/MetricCardDemo.tsx`、`CombinationDemo.tsx` |
| 项目分组 | `Tabs` | `tabs/demos/ControlledDemo.tsx` |
| 项目搜索 | `Input` | `input/demos/SearchDemo.tsx`、`BasicDemo.tsx` |
| 项目展示与操作 | `ProjectCard` | `business-object-display/demos/ProjectCardDemo.tsx` |
| 分页 | `Pagination` | `pagination/demos/CompleteDemo.tsx`、`ControlledTotalDemo.tsx` |
| 用户头像 | `Avatar` | `avatar/demos/BasicDemo.tsx`、`SizeShapeDemo.tsx` |
| 状态与结果数 | `Tag` | `tag/demos/BasicDemo.tsx`、`BorderedDemo.tsx` |
| 统计口径提示 | `Tooltip` | `tooltip/demos/BasicDemo.tsx` |
| 空项目集合 | `Empty` | `empty/demos/BasicDemo.tsx` |
| Mock 边界提示 | `Alert` | `alert/demos/ClosableDemo.tsx` |

个人信息、我的审批单、最近访问、功能上新当前没有明确的一一对应公共组件，使用页面自有语义容器承载静态信息；其中头像、提示和所有操作分别使用 `Avatar`、`Tooltip`、`Button`。右侧信息列是正文中的语义 `aside`，不是框架导航，因此不使用 `Layout.Sider`。普通 `header/aside/section/div/span/h1/h2/p` 只承担布局、语义和静态文案，不承担交互。

## 使用的组件 API

- `PlatformShell`: `className`, `aria-label`, `selectedKey`, `onSelect`, `greeting`, `topNavigationProps`, `children`
- `PlatformShell.topNavigationProps`: `productName`, `tenantName`, `regions`, `region`, `onRegionChange`, `languages`, `language`, `onLanguageChange`, `onHelp`, `onUserMenu`
- `Button`: `type`, `disabled`, `icon`, `long`, `onClick`, `aria-label`
- `Divider`: `type`
- `Select`: `value`, `options`, `addBefore`, `onChange`, `aria-label`
- `Steps`: `items`, `current`, `aria-label`
- `MetricCard`: `title`, `info`, `total`, `label`, `value`, `onClick`
- `Tabs`: `items`, `activeKey`, `onChange`, `renderContent`
- `Input`: `prefix`, `value`, `placeholder`, `allowClear`, `onChange`
- `ProjectCard`: `name`, `englishName`, `status`, `tone`, `rows`, `members`, `action`, `onOpen`, `onManageMembers`
- `Pagination`: `current`, `total`, `pageSize`, `showTotal`, `showPageSize`, `onChange`, `aria-label`
- `Avatar`: `size`, `children`
- `Tag`: `bordered`, `children`
- `Tooltip`: `content`, `children`
- `Empty`: `description`
- `Alert`: `content`, `type`, `closable`, `onClose`

## 使用的公开图标

从 `@wangxiaojinger/qizhi-react/icon` 导入：`AddIcon`、`CloseIcon`、`InfoIcon`、`SearchIcon`。顶部导航内部图标由公共 `TopNavigation` 自身提供，页面不再分别导入或拼装。

## 使用的设计变量

页面 CSS 仅使用 `tokens.json` 公开变量：`--font-sans`、`--text-1`、`--fill-2`、`--color-bg-1`、`--line`、`--radius-large`、`--shadow`、`--font-weight-700`。未写入 raw hex/rgb/hsl、命名色、渐变或自定义阴影。

## 可逆假设

- 使用本地 Mock 用户“林猫猫”、脱敏手机号及示例项目/任务/审批数据；这些不是正式数据规则。
- 组织/区域默认使用“华为乌兰察布”，空间筛选提供“全部”和公共空间两个 Mock 选项。
- 探索、运营中心按“权限未确认”使用禁用态；正式隐藏/禁用策略待权限规范确认。
- 关闭引导仅对当前 React 会话生效，不持久化。
- 所有入口只更新页面内 Mock 提示，不执行真实路由、提交或删除。
- 桌面采用主内容与右栏，中屏把右栏移到正文下方，小屏单列；这是基于 PRD 响应式建议的可逆布局实现。

## capability_gap

- PRD 所述宣传位图片缺少“QIZHI 公共组件 + 对应 React Demo”的设计证据，因此未生成图片或自制占位插画。
- PRD 欢迎语中的情绪符号没有合规的公共图标/Demo 映射，且项目规范禁止用 emoji 替代正式图标，因此保留文字但不呈现该符号。
- 真实权限隐藏、区域/空间联动、国际化、路由、服务端筛选、刷新时效、局部重试和持久化均依赖外部系统，不由当前组件层提供。
- PRD 没有随本次任务提供原始截图文件；可验证功能/组件合规，不能声明与截图 1:1 视觉一致。

## Mock 与未接入后端行为

- 导航、任务卡、申请项目、资源变更、审批、最近访问、个人中心和宣传按钮只写入本地状态提示。
- 搜索、页签、分页、空间选择和关闭引导为本地 React 状态。
- 项目、预算、配额、审批、手机号和日期均为演示数据，不代表真实账户或业务口径。
- 未接入认证、授权、聚合 API、数据刷新、埋点、运营配置、跨设备同步或持久化。

## 验收状态

- automated_status: `candidate_pass`
- independent_verification: `pending`
- 本轮 `PlatformShell` 消费迁移后的 1440/1024/375 候选浏览器证据已完成：
  每档一个公开 Shell、工作台选中、无 Sider、Header/Body/Main 直接子节点
  几何连续、全页仅一个 `main` landmark、无横向溢出，交互与控制台检查通过。
  Main 实测高度分别为 1373/2053/3617px；页面内容底边均位于 Main、Body 和
  Shell 底边内，Main 浅蓝背景覆盖完整长内容。独立验证仍为 `pending`。
