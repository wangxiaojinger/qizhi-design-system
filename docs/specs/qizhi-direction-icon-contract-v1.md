# QIZHI Direction Icon API 契约 v1

状态：已审定  
负责人：林猫猫  
证据日期：2026-08-20

## 1. 目标与边界

- 将旧规范站“方向指示类图标”的 38 个 SVG 迁移为可独立导入、可测试、可检索的 QIZHI React 图标。
- 为开发者提供稳定的 `XxxIcon` 导出，为 AI 提供稳定 ID、中文别名和结构化筛选字段。
- v1 只覆盖方向指示类，不迁移其他图标分类。
- v1 不提供运行时字符串组件 `<Icon name="..." />`、IconFont、全局线宽/端点配置、`spin` 或 `rotate`。
- 旧站 SVG 是只读视觉证据；React 运行时不得依赖旧站 DOM 或静态资源。

## 2. 证据清单

| 证据 | 位置 | 可证明什么 | 不能证明什么 |
|---|---|---|---|
| 旧规范站方向图标区 | 根项目 `index.html` 的“方向指示类图标”区块 | 38 个图形、旧名称、顺序、线性/填充与状态 | React API、组件命名和包结构 |
| 旧站 SVG DOM | 同一区块内的 38 个内联 `<svg>` | `viewBox`、路径、颜色、裁切和内部 ID 引用 | 可直接机械替换全部颜色 |
| QIZHI 现有 React 图标 | `packages/qizhi-react/src/icon/` | `XxxIcon` 命名、`currentColor` 与公共导出习惯 | 统一 Props、生成器和 manifest 已经存在 |
| Arco Icon 工程 | Arco 官方 Icon 包、生成脚本及 React Icon 基类 | SVG 生成、分类、独立导出和 `currentColor` 的工程方法 | QIZHI 命名、中文语义和 v1 能力范围 |

## 3. 能力决策

| 能力 | 决策 | 契约结论 | 依据 |
|---|---|---|---|
| 38 个方向图标 | 保留 | 全部进入 v1，不增不减 | 旧站已确认范围 |
| `XxxIcon` 命名 | 保留 | 延续 QIZHI 现有命名，不使用 Arco 的 `IconXxx` | 现有公共导出 |
| 线性/填充 | 修改 | 线性无后缀，填充使用 `FilledIcon` | 开发者可读性与 AI 筛选一致 |
| 第二视觉样式 | 修改 | 使用 `AltIcon`，不伪造业务语义 | 旧站存在第二样式但语义证据不足 |
| 选中态 | 保留 | 使用 `SelectedIcon` 并写入 `state` | 旧站明确存在状态变体 |
| 尺寸 | 修改 | 默认 `1em`，`size` 同时控制宽高，显式宽高优先 | React 组合与文字对齐 |
| 颜色 | 修改 | 本期单色图标使用 `currentColor` | 支持组件和业务主题继承 |
| 原生 SVG 属性/ref | 保留 | 透传原生 SVG 属性并 `forwardRef` | React 公共组件基础能力 |
| 图标自身点击语义 | 删除 | 不封装按钮行为 | 应由 QIZHI Button 等交互组件承担 |
| 运行时字符串图标 | 删除 | v1 不提供 | 保持类型安全和按需打包 |
| Arco 全局配置 | 删除 | 不提供线宽、拐角、端点等全局设置 | QIZHI 无现有业务证据 |

## 4. 公共 API

```ts
export interface QizhiIconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  title?: string;
}
```

| 属性 | 类型 | 默认值 | 描述 | 组合/优先级 |
|---|---|---|---|---|
| `size` | `number \| string` | `"1em"` | 同时设置图标宽高 | 显式 `width`/`height` 分别覆盖对应轴 |
| `title` | `string` | `-` | 为独立表达含义的图标提供可访问标题 | 提供后不默认隐藏，并建立唯一标题关联 |
| 原生 SVG 属性 | `SVGProps<SVGSVGElement>` | `-` | 支持 `className`、`style`、事件及 ARIA | 不允许调用方传入 `children` 覆盖图形 |
| `ref` | `Ref<SVGSVGElement>` | `-` | 指向根 `<svg>` | 通过 `forwardRef` 暴露 |

- 没有受控/非受控状态。
- 不定义图标专属点击事件；原生事件仅作为 SVG 属性透传。
- 每个图标可从 `@wangxiaojinger/qizhi-react` 与 `@wangxiaojinger/qizhi-react/icon` 导入；两条路径导出同一实现。

## 5. DOM、样式与生成契约

- 根元素固定为 `<svg>`，默认 `width="1em"`、`height="1em"`、`focusable="false"`。
- 保留旧站 `viewBox`、路径、裁切关系和图形比例；删除源 SVG 固定宽高。
- 单色主体的 `fill`/`stroke` 转换为 `currentColor`；移除路径上的 `fill-opacity` / `stroke-opacity`，`none` 及用于镂空的颜色仍按图形语义保留。
- 删除未引用的内部 ID；仍被 `clipPath`、`mask`、渐变或 `href` 使用的 ID 必须在每次渲染时唯一。
- 生成组件位于方向图标专属生成目录，并标注“由脚本生成，禁止手改”。人工调整只能修改 manifest、源映射或转换器。
- 生成器必须拒绝脚本、外部资源、缺失 `viewBox`、失效 ID 引用、未知固定颜色和未映射源节点。
- 现有手写图标不得被生成器覆盖；名称冲突必须在生成前失败。

## 6. 命名契约

- 公开组件格式为 `[语义/方向][状态][Filled][Alt][Icon]`，实际顺序以 manifest 的唯一 `componentName` 为准。
- 线性图标不增加 `Outlined`；填充图标增加 `Filled`；第二视觉样式增加 `Alt`；明确选中态增加 `Selected`。
- “收缩动作”使用 `Contract`，与“折叠状态”的 `Collapse` 区分。
- 稳定机器 ID 使用点分格式，例如 `direction.arrow.down.fill`。ID 发布后不得因展示名称变化而改变。
- 38 个组件名称和旧站节点必须一对一；不得以别名导出第二份实现。

## 7. Manifest 契约

```ts
export interface IconManifestItem {
  id: string;
  componentName: string;
  displayName: string;
  legacyName: string;
  aliases: readonly string[];
  semantic: "direction";
  family: string;
  style: "outline" | "fill";
  colorMode: "currentColor";
  direction?:
    | "up"
    | "right"
    | "down"
    | "left"
    | "horizontal"
    | "vertical"
    | "leftDiagonal"
    | "rightDiagonal";
  state?: "default" | "expanded" | "collapsed" | "selected";
  sourceNodeId: string;
  sourceFile: string;
  importPath: "@wangxiaojinger/qizhi-react/icon";
}
```

- `id` 用于 AI、文档和注册表稳定引用。
- `componentName` 是 TypeScript 导出名。
- `compatibilityNames` 保存已发布的旧长名称；旧名称仅作为指向同一实现的兼容导出，不再作为推荐调用名。
- `displayName` 与 `aliases` 负责中英文自然语言检索。
- `legacyName`、`sourceNodeId`、`sourceFile` 只负责旧站溯源。
- `semantic/family/style/direction/state/colorMode` 是机器筛选的权威字段。
- 查询结果不唯一时返回候选，不由 AI 猜测。

## 8. 无障碍契约

- 未提供 `title`、`aria-label` 或 `aria-labelledby` 时默认 `aria-hidden="true"`。
- 提供任一可访问名称后使用 `role="img"`，且不设置默认隐藏。
- `title` 生成唯一 `<title>` ID，并通过 `aria-labelledby` 关联。
- SVG 自身不进入键盘焦点序列；仅图标按钮必须由 Button 提供中文可访问名称。
- 重复渲染同一图标时，所有保留的内部 ID 和标题 ID 都必须唯一。

## 9. 文档与 AI 消费

- React 图标页同时展示 38 个方向图标与已迁移的其他分类，方向类仍由本 manifest 独立管理。
- 分类、搜索、预览、组件名、导入语句和复制代码全部消费同一 manifest。
- 搜索覆盖中文展示名、英文组件名、旧站名称、别名、方向、样式和状态。
- 点击图标卡片或在其聚焦时按 Enter/Space，只复制 JSX 组件代码（例如 `<ArrowDownIcon />`），并使用 QIZHI 全局 Message 样式反馈；不在卡片内展开额外用法面板。
- 文档页另行明确统一导入路径 `@wangxiaojinger/qizhi-react/icon`；卡片复制内容不得混入 import、源文件标题、路径或语言徽标。
- 方向类复合图标公开名称采用“动作 + 方向 + 样式”的短名称；manifest 同时保留语义字段、别名和兼容名称，供 AI 按结构化语义检索，而不是依赖名称长度猜测。
- AI 先通过 manifest 解析唯一图标，再生成静态组件导入；不生成运行时字符串调用。

### 9.1 发布包与加载边界

- 完整图标目录统一从 `@wangxiaojinger/qizhi-react/icon` 导入；`@wangxiaojinger/qizhi-react` 根入口只保留基础组件及既有常用基础图标兼容导出，不聚合 415 个目录图标和 manifest。
- 发布包以保留 ESM 模块的形式输出，并将 JavaScript 标记为无副作用、CSS 标记为有副作用，确保消费者构建工具可以删除未使用图标且不会误删样式。
- 无图标消费产物不得包含目录图标；仅导入一个图标时不得包含其他目录图标。该边界由正式 smoke 构建检查，不以源码字符串检查代替。
- 文档站在普通组件路由不加载图标目录；进入 `#components-icon` 后才动态加载图标文档岛。图标页仍一次展示完整目录，不机械拆成 415 个网络请求。

## 10. 测试矩阵

| 层级 | 必测内容 |
|---|---|
| 生成器 | 38 个映射、唯一性、分类、拒绝未知颜色/外部资源/脚本/失效引用、稳定输出 |
| 类型 | `size`、原生属性、ref、禁止 children、根入口和子路径导入 |
| 单元 | 默认尺寸、宽高优先级、`currentColor`、ref、ARIA、标题和重复 ID |
| 文档 | 38 项顺序、manifest 同源、搜索筛选、复制代码、正式包导入 |
| 视觉 | 旧站与 React 同序对照，16/24/32px 的轮廓、比例、留白、方向和颜色 |
| E2E | 1440/1024/375、搜索、筛选、复制、键盘、无结果、溢出、控制台和截图 |

## 11. 发布门槛

- [ ] 38 个源图标、manifest、组件、导出和文档条目一一对应。
- [ ] 类型检查、组件测试、文档测试和构建通过。
- [ ] 根入口和 `@wangxiaojinger/qizhi-react/icon` 子路径构建产物可导入。
- [ ] 16/24/32px 视觉对照完成，没有以渲染成功代替图形一致。
- [ ] 1440/1024/375 的浏览器交互与截图已实际验收。
- [ ] 最终最多标记 `candidate_pass`；独立验证与人工确认保持各自真实状态。
