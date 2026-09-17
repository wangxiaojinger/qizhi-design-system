# QIZHI Skeleton v1 契约

## 旧站证据

- 保留“基础用法”“文本行数和宽度”“动画”三个 Demo 的标题、说明和顺序。
- 默认文本骨架为三行，末行宽度为 `60%`。
- 图文骨架使用 `48px` 方形图像占位，三行宽度分别为 `100%`、`600px`、`400px`。
- 动画示例默认开启，使用 `48px` 圆形图像占位，末行宽度为 `90%`。

## 公共 API

- `animation` 控制流光动画。
- `image` 控制图像占位，并允许配置 `shape` 和 `size`。
- `text` 控制文本占位，并允许配置 `rows` 和 `widths`。
- 根元素透传标准 `HTMLDivElement` 属性、`className`、`style` 和 `ref`。

## 公共边界

- Demo 只使用 `Skeleton` 与 `Switch` 公共组件，不自制交互控件。
- Skeleton 的图像、文本行、动画和加载语义由组件内部负责。
- Statistic 加载态复用公共 Skeleton，不保留第二套骨架实现。
- 动画必须兼容 `prefers-reduced-motion: reduce`。
