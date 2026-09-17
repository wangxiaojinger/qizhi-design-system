# QIZHI Tabs API 契约 v1

状态：已审定  
证据日期：2026-08-24

## 1. 目标与边界

- 用于平级内容切换、详情页分区和多视角数据面板。
- v1 支持受控/非受控、位置、类型、尺寸、禁用、附加内容、动态增减、
  嵌套和溢出滚动。
- 吸顶和拖拽排序只是组合 Demo，不是 Tabs 公共 API。
- 不引入 `react-sticky`、`react-dnd` 或 Arco 命名/API。

## 2. 公共 API

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| items | `readonly TabsItem[]` | — | 页签数据 |
| activeKey | `TabsKey` | — | 受控激活项 |
| defaultActiveKey | `TabsKey` | 首个可用项 | 非受控初始项 |
| onChange | `(key: TabsKey) => void` | — | 激活项变化 |
| type | `TabsType` | `"line"` | 页签类型 |
| position | `TabsPosition` | `"top"` | 页签位置 |
| size | `TabsSize` | `"default"` | 页签尺寸 |
| scrollPosition | `TabsScrollPosition` | `"auto"` | 激活项的滚动对齐位置 |
| className | `string` | — | 根节点类名 |
| style | `CSSProperties` | — | 根节点样式 |

`TabsItem` 只包含 `key/title/content/disabled`。标题为 `ReactNode`，
因此图标页签不需要额外 API。

## 3. DOM、交互与无障碍

- 根节点使用 `.qizhi-tabs`，页签栏使用 `role="tablist"`。
- 页签使用 `button[role="tab"]`，内容使用 `role="tabpanel"`，并互相关联。
- 点击、Enter 和 Space 激活页签。
- 水平栏用左/右键，垂直栏用上/下键；Home/End 移到首/末可用项。
- 禁用项不可聚焦、不可激活。
- 删除激活项后选择后一项，无后项时选择前一项。
- 动效遵循 `prefers-reduced-motion`。

## 4. Demo

按旧站顺序保留 13 组：基础、图标、位置、类型、附加、动态增减、
受控、嵌套、尺寸、自定义头部、拖拽、滚动、滚动偏移。
