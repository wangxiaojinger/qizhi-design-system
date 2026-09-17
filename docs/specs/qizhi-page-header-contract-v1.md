# QIZHI PageHeader React v1 契约

## 页面

- 标题：`页头 PageHeader`
- 说明：`页头位于页容器顶部，用于概括当前内容并引导页级操作，通常由面包屑、标题、说明和操作区组成。`

## Demo 1：基础用法

- 顺序：1
- 说明：`基础页头用于展示当前工作区的欢迎语，高度固定为 54px。`
- 文案：`Good day，欢迎使用 启智 开启新的一天 😃`
- 数据：无
- 初始状态：静态展示
- 交互：无
- Demo 内边距：48px
- PageHeader：宽度 100%，高度 54px，垂直居中
- 文案：18px / 22px / 600，`--color-text-1`
- 响应式：文案可换行；1440、1024、375 下 PageHeader 与文案容器均保持 54px，无横向溢出

## v1 公共 API

- `children?: ReactNode`
- 根 `header` 的原生属性、`className`、`style`
- `ref?: Ref<HTMLElement>`

旧 Demo 没有面包屑、说明、操作区、返回按钮、尺寸或高度切换，v1 不增加这些 API。

## 同源与外壳

- 实际 `BasicDemo.tsx` 是预览、展示代码和复制代码的唯一来源。
- Demo 操作区完整复用公共 Demo 基线。
- PageHeader 语义、54px 高度和欢迎语排版由公共组件承担，Demo 不重写内部结构或样式。

## 验收状态

- 自动验证最多为 `candidate_pass`。
- 独立最终验收保持 `pending`。
