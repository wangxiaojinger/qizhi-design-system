# QIZHI Dropdown API 契约 v1

状态：已审定  
负责人：Iris / Codex  
证据日期：2026-08-19

## 1. 目标与边界

- 用户任务：按 QIZHI React 迁移规范迁移下拉菜单 Dropdown。
- 业务场景：将次级命令收纳到触发器关联的浮层菜单中。
- v1 解决的问题：旧规范站 7 组 Demo、6 种方向、hover/click、菜单项回调、组合按钮、多级与图标菜单。
- v1 明确不解决的问题：右键触发、自定义浮层渲染、虚拟滚动、选择型 Menu、跨窗口定位以及旧站没有证据的 Arco API。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 原规范站 7 组 Demo | `index.html#component-dropdown` | 顺序、文案、位置、触发方式、按钮、多级、图标 | 参考库完整 API |
| 原规范站样式 | `styles.css` 的 `.qizhi-dropdown*` | DOM 类名、尺寸、间距、圆角、阴影与六向定位 | Portal 或复杂碰撞策略 |
| 原规范站交互 | `script.js#initDropdownDemos` | hover/click、外部关闭、Escape、ArrowDown、焦点恢复、子菜单 | 全方向键菜单导航 |
| Link 组合占位 | `apps/qizhi-docs/src/link/demos/DropdownDemo.tsx` | Link 可作为按钮触发器 | 独立的 Link 下拉实现 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 7 组 Demo | 保留 | 顺序、文案、初始状态不变 | 旧站事实 |
| 六向位置 | 保留 | `top/tl/tr/bottom/bl/br`，默认 `bl` | 旧站事实 |
| hover/click | 保留 | 默认 `hover` | 旧站事实 |
| 受控/非受控可见性 | 修改 | React 状态接口；不改变旧站默认行为 | 正式组件可组合性 |
| 菜单项回调 | 保留 | Menu 以稳定 key 回调 | 旧站事件 Demo |
| Dropdown.Button | 保留 | secondary、disabled、primary、loading 四种旧站状态 | 旧站事实 |
| 多级菜单 | 保留 | `Dropdown.SubMenu`，hover/focus 展开 | 旧站事实 |
| 图标菜单 | 保留 | `Dropdown.Item icon` | 旧站事实 |
| Portal/自动碰撞 | 待定 | v1 不提供 | 无旧站证据 |

## 4. 公共 API

### Dropdown

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| children | `ReactElement` | — | 单个语义触发器 |
| droplist | `ReactNode` | — | `Dropdown.Menu` 内容 |
| position | `"top" | "tl" | "tr" | "bottom" | "bl" | "br"` | `"bl"` | 浮层方向 |
| trigger | `"hover" | "click"` | `"hover"` | 触发方式 |
| popupVisible | `boolean` | — | 受控可见性 |
| defaultPopupVisible | `boolean` | `false` | 非受控初始值 |
| onVisibleChange | `(visible: boolean) => void` | — | 可见性变化 |

### Menu / Item / SubMenu

- `Dropdown.Menu`：`onClickMenuItem(key, event)`。
- `Dropdown.Item`：`itemKey`、`icon` 与原生按钮属性。
- `Dropdown.SubMenu`：`itemKey`、`title`、`children`。

### Dropdown.Button

- `children` 为主操作文案；`droplist` 为菜单。
- `type` 仅为 `"primary" | "secondary"`，默认 `"secondary"`。
- 支持 `disabled`、`loading`、`onClick`、`position`、`aria-label`。

## 5. DOM 和样式契约

- `Dropdown.Menu` 和 `Dropdown.Item` 默认使用 `menu` / `menuitem` 语义，也保留原生 `role` 与 `aria-*` 透传，供 Cascader 等复合组件在复用视觉和交互基线时改用 `listbox` / `option` 语义。

- 根类名沿用 `.qizhi-dropdown`；状态类 `.is-open`；方向类 `.qizhi-dropdown--<position>`。
- Popup 沿用 `.qizhi-dropdown__popup`，`role="menu"`，最小宽度 112px、4px 内边距、旧站边框/圆角/阴影。
- Item 沿用 `.qizhi-dropdown__item`，最小高度 32px。
- Button、SubMenu 与图标类名沿用旧站；Demo 排列类不进入公共 API。
- v1 不使用 Portal；官网 Dropdown Demo 容器局部 `overflow: visible`，不得放开全局容器。

## 6. 交互和状态

- hover：mouseenter/focusin 打开，mouseleave/focusout 在焦点离开组件后关闭。
- click：点击触发器切换；文档外部点击关闭。
- ArrowDown：打开并聚焦第一个菜单项。
- Escape：关闭并恢复触发器焦点。
- 普通菜单项点击：先执行 Item 与 Menu 回调，再关闭并恢复焦点。
- SubMenu 触发项不关闭主菜单；hover/focus 展开子菜单。
- Button disabled/loading 不打开菜单；loading 保留旧站加载视觉。

## 7. Demo 与测试

- Demo 顺序严格为：基础用法、弹出方向、触发方式、触发事件、按钮下拉框、多级菜单、带图标的菜单。
- 文档仅展示与复制同源 TSX，不展示 Demo CSS。
- E2E 必测三视口、hover/click、ArrowDown、Escape、外部关闭、菜单项关闭、SubMenu、Button 状态、六向几何和完整祖先裁切链。

## 8. 发布门槛

- [ ] 组件、类型、CSS 与公共导出完成。
- [ ] 7 组旧站 Demo 与 API 元数据同源。
- [ ] Link 组合占位接入正式 Dropdown。
- [ ] 类型、单元、构建、独立消费与三视口通过。
- [ ] 目标打开态截图已人工检查。
- [ ] 实现者只声明 `candidate_pass`；独立验证保持 `pending`。
