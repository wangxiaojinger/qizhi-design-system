# QIZHI Spin React Contract v1

状态：已审定  
负责人：Iris  
证据日期：2026-08-25

## 1. 目标与边界

- 将旧规范站「加载中 Spin」迁移为 `@wangxiaojinger/qizhi-react` 正式组件。
- 保留 5 个 Demo 的标题、说明、顺序、数据、文案、布局、尺寸、
  初始状态和交互。
- v1 提供独立指示符、容器加载、自定义描述、自定义图标、数字尺寸和
  块级布局。
- v1 不提供延迟显示、百分比进度、全屏加载、点状加载、自定义遮罩
  颜色、字符串尺寸和全局静态调用。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 旧站 5 个 Demo | `index.html#component-spin` | 文案、数据、DOM 语义、初始状态 | 未出现的 API |
| Spin 样式 | `styles.css` | 20/30/40px、360px、144px、遮罩和动画 | 业务请求管理 |
| Spin 交互 | `script.js#initSpinDemos` | `loading` 切换、`aria-busy`、`inert` | 延迟、Promise API |
| 现有图标 | `LoadingIcon` | 默认加载图形可复用 | Spin 容器能力 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 |
|---|---|---|
| 独立指示符 | 保留 | 无 `children` 时显示独立 Spin |
| 容器加载 | 保留 | 有 `children` 时显示遮罩并禁用内容交互 |
| `loading` | 保留 | 默认 `true`；切换视觉、ARIA 和 `inert` |
| `size` | 保留 | 仅 `20 | 30 | 40`，默认 `20` |
| `tip` | 保留 | 加载时在指示符下方显示 |
| `icon` | 保留 | 替换 `LoadingIcon`，仍继承尺寸、颜色和旋转 |
| `block` | 保留 | 容器模式下宽度 100% |
| 延迟、点状、全屏、进度 | 删除 | 无 QIZHI 证据，v1 不导出 |

## 4. 公共 API

| 属性 | 类型 | 默认值 | 描述 | 组合规则 |
|---|---|---|---|---|
| `loading` | `boolean` | `true` | 是否显示加载状态 | 独立模式为 false 时不显示 |
| `size` | `20 \| 30 \| 40` | `20` | 指示符尺寸 | 作用于默认和自定义图标 |
| `tip` | `ReactNode` | `—` | 加载描述 | 仅加载时显示 |
| `icon` | `ReactNode` | `<LoadingIcon />` | 自定义指示符 | 由 Spin 承担旋转 |
| `block` | `boolean` | `false` | 是否撑满父级 | 仅容器布局有意义 |
| `children` | `ReactNode` | `—` | 被遮罩的内容 | 存在时进入容器模式 |
| `className` | `string` | `—` | 根节点类名 | 不得覆盖内部状态 |
| `style` | `CSSProperties` | `—` | 根节点样式 | 保留通用 React 能力 |
| `ref` | `Ref<HTMLDivElement>` | `—` | 根节点引用 | 始终指向 `div` |

根节点继承 `HTMLAttributes<HTMLDivElement>`，允许传入 `aria-label`。

## 5. DOM 和样式契约

- 根节点统一为 `div.qizhi-spin`；独立模式保持 `inline-flex` 视觉。
- 默认指示符使用 QIZHI `LoadingIcon`，颜色为 `primary-6`。
- 指示符尺寸为 20/30/40px；动画为 `0.8s linear infinite`。
- 容器默认 `inline-block`、宽度 `min(100%, 360px)`；`block` 为 100%。
- 加载时子内容透明度 `0.38`，禁止指针与选择；遮罩为
  `rgba(255, 255, 255, 0.62)`。
- Demo 的卡片、两列格局、360px 与 144px 属于文档布局，不是 Spin API。

## 6. 交互、状态与无障碍

- 独立加载根节点使用 `role="status"`，默认可访问名称为「正在加载」。
- 容器根节点使用 `aria-busy="true|false"`；遮罩在加载时使用 `role="status"`。
- 加载时子内容容器具有 `inert`；结束加载后移除。
- 加载状态本身不获取焦点；Demo 控制器使用 `Button`。
- `prefers-reduced-motion: reduce` 下取消旋转，保留图标与状态语义。

## 7. Demo 契约

1. `基础用法` — `一个简单的加载中状态。`
2. `在容器中` — `可以给任意元素添加加载状态。容器默认采用行内块布局，需要撑满父级时可设置为块级布局。`
3. `自定义描述文案` — `通过 tip 字段自定义加载时的文案。`
4. `自定义指示符` — `通过指定 icon 可以使用自定义图标作为加载指示符。`
5. `不同尺寸` — `设置 size 可以得到不同尺寸的加载图标。`

## 8. 测试与发布门槛

- 类型锁定 20/30/40、ref 和原生属性。
- 单元测试锁定默认图标、自定义图标、tip、block、loading 双向切换、
  `aria-busy` 和 `inert`。
- 文档测试锁定 5 个 Demo 的顺序、原文、数据、公共组件边界和同源代码。
- E2E 在 1440/1024/375 操作切换、检查计算尺寸、布局、动画、溢出、
  控制台、展示/复制同源并人工检查截图。
- 自动化通过后最多声明 `candidate_pass`，独立最终验收保持 `pending`。
