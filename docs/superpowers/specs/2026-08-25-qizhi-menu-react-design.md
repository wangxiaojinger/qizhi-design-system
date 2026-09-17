# QIZHI Menu React 迁移设计

## 目标

将旧站“菜单 Menu”迁移为 `@wangxiaojinger/qizhi-react` 的正式公共组件和 React Island 文档，保留旧站两个 Demo 的标题、说明、顺序、数据、布局、尺寸、初始状态与已证实交互。

本次只实现已有证据支持的水平菜单、垂直菜单、分组、菜单项、选中、禁用和键盘导航。旧站“左侧菜单”说明提到 `defaultOpenKeys`，但真实 Demo 没有可折叠 SubMenu，因此 v1 不发布 SubMenu 或 `defaultOpenKeys`。

## 旧站证据

### 顶部导航栏

- 标题：顶部导航栏。
- 说明：设置 `mode` 为 `horizontal` 时，使用水平菜单。
- 初始选中项：模型服务。
- 主菜单数据：工作台、定制模型、模型服务、Agent、探索、运营中心。
- 支持点击选中，以及 Left、Right、Home、End 水平键盘导航。
- 机房、溢出项和语言选择继续复用公共 Dropdown。
- 顶部导航壳层、Logo、租户、帮助入口和头像属于 Demo 组合布局，不进入 Menu API。

### 左侧菜单

- 标题：左侧菜单。
- 说明保留旧站原文。
- 初始选中项：空间概览。
- 结构为固定展开分组，不包含可折叠 SubMenu。
- 工作空间选择继续复用公共 Dropdown。
- 菜单外框为 `210px × 800px`，内边距为 `54px 20px 24px 24px`，菜单内部宽度为 `166px`，菜单项内边距为 `8px 12px`。
- 长空间名称及菜单文本单行省略，通过 hover 和键盘 focus 提供完整名称。

## 方案选择

采用统一复合组件：

- `Menu` 负责方向、选中状态和键盘导航。
- `Menu.Item` 负责单个菜单项、图标、禁用和选中语义。
- `Menu.Group` 负责垂直菜单分组标题。

不拆分 `HorizontalMenu` 和 `SideMenu`，避免复制选择与键盘状态逻辑；不以纯 `items` 配置作为唯一入口，避免为顶部导航图标、分割和组合内容增加特殊字段。

## 公共 API

### Menu

- `mode?: "horizontal" | "vertical"`，默认 `vertical`。
- `selectedKey?: string`，受控选中项。
- `defaultSelectedKey?: string`，非受控初始选中项。
- `onSelect?: (key: string) => void`。
- `children?: ReactNode`。
- 标准 `HTMLDivElement` 属性、`className`、`style`、`ref` 和无障碍名称。

`selectedKey` 存在时为受控模式；不存在时由组件维护内部状态。禁用项不能成为新的选中项。

### Menu.Item

- `itemKey: string`，在同一 Menu 内唯一。
- `icon?: ReactNode`。
- `disabled?: boolean`。
- `children?: ReactNode`。
- 标准按钮属性中与组件状态不冲突的部分。

### Menu.Group

- `title: ReactNode`。
- `children?: ReactNode`，只承载 Menu.Item。
- `className?: string`。

## 结构与语义

- Menu 根元素使用 `role="menubar"`（horizontal）或 `role="menu"`（vertical）。
- Menu.Item 使用公共组件内部生成的 `button[role="menuitem"]`，Demo 不自行编写交互标签。
- 当前选中项带 `aria-current="page"` 和选中样式。
- disabled 项同时使用原生 `disabled` 与 `aria-disabled="true"`。
- Menu.Group 标题使用稳定 ID 与 `aria-labelledby` 关联分组。
- 图标由调用方传入正式 QIZHI Icon；装饰图标在组件内保持 `aria-hidden`。

## 状态与键盘

- 使用 roving tabindex。选中且可用的 Item 为 `tabIndex=0`；没有可用选中项时，第一个可用 Item 为 `tabIndex=0`；其他 Item 为 `-1`。
- horizontal：Left/Right 循环移动焦点，Home/End 移至首尾可用项。
- vertical：Up/Down 循环移动焦点，Home/End 移至首尾可用项。
- 键盘焦点移动本身不改变选中项；Enter、Space 或点击才触发 `onSelect`。
- 导航跳过 disabled 项。
- 受控模式只调用 `onSelect`，是否改变选中项由调用方决定。

## Demo 组件边界

- 顶部导航壳层和左侧 210px 视口仅使用 Menu 的公共 API，不选择 Menu 的 `__*` 私有节点。
- Dropdown 继续负责机房、语言、工作空间和窄屏溢出列表；Divider 负责分隔线。
- Demo 不使用原生 `button`、`input`、`select`、`textarea` 或自写 SVG；需要的交互全部复用 Menu、Dropdown、Button 与正式 Icon。
- Demo 不使用内联布局样式。
- Demo TSX 是预览、展示和复制代码的唯一来源。

## 响应式与布局

- Menu 公共组件只负责自身排列、菜单项尺寸和状态，不拥有文档页宽度或顶部导航框架。
- 顶部导航 Demo 外层负责可用宽度、横向滚动遮罩和 Dropdown 溢出菜单。
- 左侧 Demo 保持 210px 设计宽度；在可用宽度不足时最大宽度收缩到容器，不产生页面横向溢出，内部仍保持 166px 上限和文本省略。
- 1440、1024、375 三档都必须验证组件直接子项的实际宽高、最终 Flex 方向、滚动范围和操作区盒模型。

## 测试与验收

开发前先建立并观察以下失败门禁：

1. Menu 受控与非受控选择、禁用项、roving tabindex 和完整键盘路径。
2. 两个旧站 Demo 的标题、说明、顺序、数据和初始状态。
3. Demo 不含可由公共组件承担的原生交互标签、自写 SVG、内联布局样式或 Menu 私有后代选择器。
4. Dropdown、Divider、Button/Icon 复用边界。
5. API 表、公共类型、运行实现、Demo TSX、展示代码和复制代码一致。
6. Button Demo 操作区基线：预览到操作区 `12px`，操作区右内边距 `0px`。

浏览器验收覆盖：

- 1440、1024、375 三档的真实点击与键盘路径。
- 水平和垂直选中项的实际坐标、尺寸与 `tabIndex`。
- disabled 跳过、受控状态、Dropdown 打开/选择/关闭/Escape/焦点恢复。
- 顶部导航溢出与左侧菜单 210px/166px 几何。
- 长名称省略及 hover/focus 完整名称提示。
- 每个 Demo 的 `scrollWidth <= clientWidth`、页面溢出和控制台错误。
- 展示代码与剪贴板文本逐字一致。
- 关键打开态、选中态和手机布局截图人工查看。

## 验收状态

Menu 属于新增公共 API。自动测试和本地视觉检查通过后最多标记为 `candidate_pass`；独立最终验收保持 `pending`，直到用户或独立验证过程明确确认。
