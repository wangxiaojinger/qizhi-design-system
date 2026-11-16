# QIZHI 完整后台 Token 与首个消费者接入设计

## 目标

将当前 Inspire 后台已验证的完整 Token、深色模式和 Ant Design 主题映射纳入 QIZHI，使 QIZHI 成为唯一可发布的后台规范源；随后让 Inspire 后台通过已发布的 QIZHI 包消费该规范，而不再维护重复的本地 Token 和主题桥接实现。

本次范围不改变后台的业务功能、路由、数据或页面信息架构，也不强制把所有本地页面组合组件替换为 QIZHI 组合组件。

## 已确认的视觉原则

QIZHI 的全局交互主调必须是中性灰，不使用 Ant Design 默认蓝作为主色：

- `--admin-primary` 保持 `#171717`（深色模式为 `#e5e5e5`）；hover/active 使用同一灰阶。
- `--control-accent` 与 `--control-accent-hover` 指向中性主操作 Token，不继承当前实现的 `#1677ff` / `#4096ff`。
- 旧 `--admin-brand-identity: #3366ff` 不进入 QIZHI v1 公共契约；现有消费者改用 `--admin-primary`。
- 蓝色仅允许作为 `--admin-info` 的语义反馈色或图表的离散数据色，不能用于默认按钮、选中态、焦点、链接主调或布局装饰。

## 方案选择

选择“完整抽取 + 最小接入”：

1. QIZHI Token 包扩展为当前后台实际需要的完整规范面，包括字体、间距、圆角、控件/布局尺度、层级、运动、后台/侧栏/浮层语义色、状态色、图表数据色、阴影与组件语义 Token。
2. QIZHI React 包承接当前后台完整的 Ant Design `ThemeConfig` 与 `ConfigProvider` 组件配置；主色映射固定读取 QIZHI 中性 Token。
3. Inspire 后台仅替换全局样式来源和顶层 Provider；业务页面继续直接从 `antd` 导入原件，本地共享组合组件保持不变，确保行为与布局不发生大规模回归。
4. 发布 QIZHI `1.1.0` 后，Inspire 后台改为精确消费 `1.1.0`；本地重复的 `design-tokens/tokens.css`、`design-tokens/antd-theme.ts` 和后台重复组件配置删除。

不选择“只引入局部组件”方案，因为它会永久保留两套 Token 真源；不选择“同步替换全部页面组合组件”，因为该方式把规范接入和页面重构耦合，回归范围不可控。

## 架构与数据流

```text
packages/qizhi-tokens/src/tokens.json
  └─ build → @wangxiaojinger/qizhi-tokens/style.css
                 ↓
packages/qizhi-react
  ├─ createQizhiTheme() → Ant Design ThemeConfig
  └─ QizhiProvider → ConfigProvider + AntApp
                 ↓
Inspire admin entry
  ├─ import @wangxiaojinger/qizhi-react/style.css
  └─ AdminAppProviders → QizhiProvider(locale, theme)
                 ↓
Existing routes, Ant Design primitives and local business components
```

`tokens.json` 是唯一源文件；不从 Inspire 的 CSS 运行时反向读取 Token，也不保留同名本地 Token 副本。每个需要深色模式的 Token 在结构化 manifest 中以 `themes.dark` 明确声明，CSS 由 QIZHI 构建脚本生成。

## Token 契约

扩展后的 QIZHI 契约覆盖当前后台的所有有效变量。Token 按以下层次保存：

- `seed`：字体、行高、字重、间距、圆角、控件高度、层级、动效与布局尺度。
- `map`：`admin.*`、侧栏、图表数据、状态、遮罩与阴影等主题值。
- `alias`：页面背景、背景层、文本、边框、状态、阴影、焦点和控件强调等消费语义。
- `component`：Ant Design ThemeConfig 中表格、表单、输入、选择、抽屉、弹窗、布局、浮层、Tabs、Pagination 等所需的稳定组件角色。

构建和测试将禁止默认主色、控件强调、链接或焦点 Token 指向 `#1677ff` 或 `#4096ff`，并断言 `admin.primary` 仍是中性灰。

## Provider 与兼容边界

`QizhiProvider` 保持现有 `locale` 与受控 `theme` API，并扩展其内部 ThemeConfig/组件配置，吸收当前后台的 Layout、Popover、Dropdown、Card、Table、Form、Input、Select、Drawer、Modal、Tabs 等映射。深色模式仍由 `body[data-theme="dark"]` 统一控制，并在切换后重新计算 Ant Design ThemeConfig。

Inspire 的错误边界、语言选择、路由与 Demo 状态 Provider 不移动；`AdminAppProviders` 仅把原 `EnterpriseThemeProvider` 替换为 `QizhiProvider`。这是一次规范来源替换，不是状态管理重构。

## 发布与接入顺序

1. 在 QIZHI 仓库实现并验证完整 Token/Provider 变化，发布 `1.1.0` GitHub Release，触发 GitHub Packages 发布。
2. 在 Inspire 仓库添加 GitHub Packages registry 配置（不提交 Token），安装精确版本 `1.1.0`。
3. 将全局 CSS 和主题 Provider 改为 QIZHI 包，删除重复本地实现。
4. 运行当前后台的类型、单元和生产构建检查；在桌面、窄屏、手机下验证主操作、焦点、抽屉、弹窗、表格与深色模式均保持中性灰主调。

若 QIZHI 发布失败或当前后台校验失败，Inspire 仍保留发布前的已提交本地规范，不会部分删除 Token；回退只需恢复依赖版本与 Provider 入口。

## 验证

- QIZHI：Token manifest/样式/版本测试、ThemeConfig 单测、React typecheck、docs 与 smoke build、完整 `pnpm verify`。
- Inspire：依赖锁文件安装、`apps/admin-web` typecheck/test/build，以及 Token 使用扫描确保不再引用本地设计 Token 源。
- 视觉：浅/深色下确认默认按钮、链接、focus ring、选中态不出现 Ant Design 默认蓝；信息反馈和图表色仍保持语义/数据区分。
