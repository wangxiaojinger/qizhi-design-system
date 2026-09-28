# QIZHI 方向指示类图标 React 迁移设计

状态：已由林猫猫确认  
日期：2026-08-20  
对应契约：`docs/specs/qizhi-direction-icon-contract-v1.md`

## 1. 目标

将旧规范站“方向指示类图标”的 38 个 SVG 迁移为 `@wangxiaojinger/qizhi-react` 正式组件，并建立适合开发者直接导入、适合 AI 结构化检索、适合后续分类持续扩展的生成链路。

本期只完成方向指示类纵向切片。旧站继续作为只读视觉证据，React 包、文档和 AI 元数据不依赖旧站运行时。

## 2. 已确认架构

```text
旧站方向 SVG 只读副本
  → direction-icons.manifest.ts
  → validateDirectionIcons
  → build-icons.mjs
  → generated/*.tsx + generated/index.ts + iconManifest.ts
  → @wangxiaojinger/qizhi-react/icon + @wangxiaojinger/qizhi-react
  → React 图标文档、搜索、复制代码和 AI 调用
```

- manifest 是名称、分类、搜索、生成、文档和 AI 调用的唯一数据源。
- 生成 TSX 禁止手改；修订必须回到源映射或转换规则。
- 生成器只能处理 manifest 明确列出的 38 个方向图标，不能扫描并顺带迁移其他分类。
- 现有手写 Icon 继续保留；生成前进行名称与导出冲突检查。

## 3. 与 Arco 的取舍

采用 Arco 已验证的工程思想：源 SVG 分类、生成组件、独立导出、`currentColor` 和可配置原生 SVG 属性。

不复制 Arco 的公共命名和完整能力：

- QIZHI 使用现有的 `XxxIcon`，不改成 `IconXxx`。
- QIZHI 增加稳定 ID、中文展示名、旧站溯源、别名及结构化语义字段，使 AI 不依赖组件名猜测。
- v1 不提供 IconFont、全局线宽/拐角/端点配置、运行时字符串图标、旋转和加载动画。
- API 只包含 QIZHI 当前图标自身需要的能力，不将参考库能力自动并入。

## 4. 命名与机器检索

- 线性图标不带 `Outlined`；填充图标使用 `FilledIcon`。
- 第二视觉样式使用 `AltIcon`；明确选中态使用 `SelectedIcon`。
- 展开/收起方向族按方向与状态组合；动作“收缩”使用 `Contract`，状态“折叠”使用 `Collapse`。
- 公开名服务于开发者，例如 `ArrowDownFilledIcon`。
- 稳定 ID 服务于 AI 和注册表，例如 `direction.arrow.down.fill`。
- `displayName + aliases + legacyName` 支持中英文自然语言检索；结构化字段负责消歧。

已确认的 38 个命名族：

- 右斜向、垂直、水平、左斜向展开/收起，各含线性与填充，共 16 个。
- 上、下、左、右箭头，各含线性与填充，共 8 个。
- 通用展开与收缩，各含线性与填充，共 4 个。
- 折叠默认/选中、全屏默认/选中，各 2 个，共 4 个。
- 端点线性/填充，共 2 个。
- 全屏第二样式默认/选中，共 2 个。
- 切换 1 个，向右箭头第二样式 1 个。

## 5. 组件 API 与无障碍

所有生成组件共享 `QizhiIconProps`：`size`、`title`、原生 SVG 属性和 `ref`。

- 默认尺寸 `1em`；`size` 同时控制宽高；显式 `width`/`height` 分别优先。
- 单色方向图标统一使用 `currentColor`。
- 无可访问名称时默认作为装饰图标隐藏。
- 提供 `title`、`aria-label` 或 `aria-labelledby` 后使用图片语义。
- `focusable="false"`；交互、焦点和按钮名称由消费组件负责。
- 组件重复渲染时，标题及保留的 SVG 内部引用 ID 必须唯一。

## 6. SVG 转换与失败策略

- 保留 `viewBox`、路径、裁切和比例，移除固定宽高。
- 单色主体转换为 `currentColor`；移除路径上的 `fill-opacity` / `stroke-opacity`，不机械替换 `none` 或镂空色。
- 删除未使用 ID；仍被引用的 ID 使用运行时唯一前缀。
- 缺少 `viewBox`、包含脚本/外部资源、未知固定颜色、引用失效、数量不为 38、分类或名称重复时构建失败。
- 旧站视觉对照失败时修改转换规则或 manifest，不直接修补生成 TSX。

## 7. 文档与 AI 使用

- React 图标页本期只展示方向类 38 项。
- 页面分类、名称、搜索、预览和复制全部来自 manifest。
- 支持中文名、英文组件名、旧站名、别名、方向、线性/填充和状态检索。
- 点击图标卡片只复制 JSX 组件代码（例如 `<ArrowDownIcon />`），通过全局 QIZHI Message 反馈结果；统一导入路径由 API 文档说明，不在卡片内展开额外详情区，也不显示源码文件标题。
- AI 查询唯一 manifest 项后生成静态组件导入；存在多个候选时返回候选而不是猜测。

## 8. 验收

- TDD 覆盖生成器、公开类型、组件行为、文档同源和浏览器交互。
- 旧站 SVG 与 React 组件建立同序对照板，检查 16、24、32px。
- 1440、1024、375 三档验证搜索、筛选、复制、键盘、无结果、布局和控制台。
- 每档截图必须实际查看，重点核对轮廓、比例、留白、方向、颜色和页面溢出。
- 完成状态最高为 `candidate_pass`，不能代替林猫猫的人工确认或独立最终验证。

## 9. 已知边界

- 旧站分类修正确认发生在静态规范站；React 工作树中的 `index.html` 可能保留旧快照，实施时必须从已确认的旧站证据提取只读副本，不能以工作树陈旧分类覆盖它。
- 当前工作树存在其他组件及手写图标的并行修改，实施必须限制文件范围并拒绝覆盖冲突。
- 旧站全站图标总数文案不属于本期方向图标迁移范围。
