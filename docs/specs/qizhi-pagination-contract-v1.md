# QIZHI Pagination API 契约 v1

状态：已审定  
负责人：QIZHI Design System  
证据日期：2026-08-21

## 1. 目标与边界

- 原序迁移旧站 9 个 Demo：基础用法、更多页码、改变每页展示条目、跳转、尺寸、简洁、展示总数、受控的数据总数、全部展示。
- v1 仅提供 QIZHI 已展示的页码、尺寸、总数、每页条数、快速跳转、简洁模式、受控状态与禁用能力。
- 数据请求与继续加载属于消费方；不提供 `loadMore` 等业务 API。

## 2. 公共 API

| 属性 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `total` | `number` | — | 数据总数 |
| `current` / `defaultCurrent` | `number` | — / `1` | 当前页受控值 / 初始值 |
| `pageSize` / `defaultPageSize` | `number` | — / `10` | 每页条数受控值 / 初始值 |
| `pageSizeOptions` | `number[]` | `[10, 20, 50]` | 每页条数选项 |
| `onChange` | `(current, pageSize) => void` | — | 页码变化请求 |
| `onPageSizeChange` | `(pageSize, current) => void` | — | 每页条数变化请求；新页码为 1 |
| `size` | `"mini" | "small" | "default" | "large"` | `"default"` | 尺寸 |
| `simple` | `boolean` | `false` | 简洁模式 |
| `showTotal` | `boolean | ((total, range) => ReactNode)` | `false` | 展示总数或自定义区间文案 |
| `showPageSize` | `boolean` | `false` | 展示每页条数选择器 |
| `showJumper` | `boolean` | `false` | 展示快速跳转 |
| `disabled` | `boolean` | `false` | 禁用全部交互 |

组件同时接受 `nav` 元素的 `className`、`style` 与 `aria-label` 等原生属性；`onChange` 使用组件语义，不透传原生表单事件。

## 3. 行为与无障碍

- 总页数不超过 7 时完整展示；更多页码按旧站规则折叠，省略号按钮一次前后跳转 5 页。
- 页码、快速跳转和简洁输入均限制在有效范围；Enter 后输入保留焦点，普通跳转输入清空。
- 切换每页条数后回到第 1 页，同时触发 `onPageSizeChange` 与 `onChange`。
- 使用 `nav`、中文 `aria-label`、`aria-current="page"`、原生禁用状态与可见焦点。
- 每页条数复用正式 `Select`，跳转输入复用正式 `Input`，方向与省略号复用 QIZHI Icon。

## 4. 发布门槛

- React 实现、TypeScript 类型、API 表、Demo 与复制源码同源。
- 组件测试、文档测试、类型检查、构建和 1440/1024/375 浏览器交互与截图验收全部有真实结果后，执行者最多声明 `candidate_pass`。
