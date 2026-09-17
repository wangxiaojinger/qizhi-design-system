# QIZHI Menu React v1 契约

## 范围与证据

Menu React v1 迁移旧站两个真实 Demo：`顶部导航菜单`和`左侧菜单`。
标题、说明、顺序、菜单文案、初始选中项和真实交互路径保持不变。

旧站左侧菜单虽然在说明中提到 `defaultOpenKeys`，实际页面没有可展开的
子菜单结构或行为。因此 v1 不提供 `SubMenu` 和 `defaultOpenKeys`；这不是
遗漏，而是按可验证旧站行为限定公共 API。后续新增折叠菜单必须单独立项，
并同步实现、类型、API 文档、测试和键盘语义。

## 公共 API

- `Menu`：`mode`、`selectedKey`、`defaultSelectedKey`、`onSelect`、
  `children`、`className`、`style`、`ref`。
- `Menu.Item`：`itemKey`、`icon`、`disabled`、原生按钮属性。
- `Menu.Group`：`title`、`children`、原生容器属性。
- `mode="horizontal"` 输出 `menubar`；默认垂直模式输出 `menu`。
- 选中项使用 `aria-current="page"`，禁用项使用按钮禁用语义和
  `aria-disabled="true"`。

## 组件边界与复用

- Menu 只负责站内导航项、选中状态、分组与方向感知键盘导航。
- 机房、语言、工作空间和窄屏溢出选择继续复用 `Dropdown`。
- 导航分隔复用 `Divider`；图形复用正式 QIZHI Icon；操作使用 `Button`。
- Demo 不使用原生交互标签、自写 SVG、内联布局样式，也不选择任何公共
  组件的 `__*` 私有后代类。
- Dropdown 浮层菜单、Cascader listbox 和文档站全局路由菜单不属于本次
  Menu 迁移范围。

## 旧站结构保真

- 顶部区域顺序固定为品牌、机房、主菜单、溢出菜单、操作区。
- 机房入口保留定位图标和短名称；资源入口保留“资源/帮助”文案。
- 溢出菜单包含全部六个导航项，并对当前隐藏选中项提供可见反馈。
- 左侧菜单各业务项使用对应 QIZHI 图标，不以同一个占位图标替代。
- “模型服务”属于“AI资产管理”分组；各业务分组之间保留分隔线。
- 工作空间入口保留返回图标、竖向分隔线、空间名和展开图标。

## 键盘与状态

- 水平模式使用 Left/Right，垂直模式使用 Up/Down。
- Home/End 聚焦首个或末个可用项；方向键循环并跳过禁用项。
- roving focus 只移动焦点，不改变选中项；Enter/Space 由按钮点击语义选择。
- 未设置选中项时，首个可见可用项是键盘入口；选中项因响应式隐藏时，
  菜单仍保留且只保留一个可见的 `tabIndex=0` 入口。
- 受控模式由调用方持有选中项；非受控模式点击后更新内部选中项。

## 几何与响应式

- 左侧菜单 Demo 外框为 `210px × 800px`。
- 外框内边距为上 `54px`、右 `20px`、下 `24px`、左 `24px`。
- 内容有效宽度为 `166px`，菜单项内边距为 `8px 12px`。
- 1440、1024、375 三档均需检查直接子项尺寸、实际坐标、横向溢出、
  Dropdown 打开与关闭路径、键盘焦点和控制台新增错误。

## 验收状态

自动化单测、类型检查、构建与三档 E2E 通过后最多标记
`candidate_pass`。Menu 是新增公共 API，独立最终验收保持 `pending`，
直到用户或独立验证过程明确确认。
