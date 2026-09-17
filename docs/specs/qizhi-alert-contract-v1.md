# QIZHI Alert React 契约 v1

## 证据范围

旧站 `#component-alert` 的 9 个 Demo 是 v1 唯一产品证据：

| 顺序 | 标题 | 说明 | 可见状态 |
| --- | --- | --- | --- |
| 1 | 基本用法 | 警告提示，展现需要关注的信息，适用于简短的警告提示。 | info |
| 2 | 不同尺寸 | 使用 `size` 设置警告提示尺寸，支持 `small`（28px）、`default`（32px）和 `large`（40px）。 | 3 个尺寸 |
| 3 | 不同类型 | 警告提示的类型有 `info`、`success`、`warning`、`error` 四种。 | 4 种语义 |
| 4 | 紧凑型 Inline Alert（行内警告提示） | 用于在卡片或内容区域内展示轻量级风险提醒，并根据指标阈值区分风险等级：低风险使用 `neutral（中性）`，中风险使用 `warning（警告）`，高风险使用 `error（错误）`；指标处于正常范围时不展示。颜色仅表示风险程度，不代表信息类型。 | neutral / warning / error |
| 5 | 可关闭 | 指定 `closable = true`，可开启关闭按钮。 | 4 种类型，有标题/无标题 |
| 6 | 自定义关闭元素 | 指定 `closeElement`，自定义关闭元素。`closeElement` 可以接收 `onClick`，并且自带 `close` 参数，调用 `close()` 可以关闭。 | 图标与文字关闭 |
| 7 | 含有标题 | 通过设置 `title` 可以给添加标题，将 `content` 变为辅助性介绍文字。 | 4 种类型 |
| 8 | 不含图标 | 通过指定 `showIcon=false` 来不显示图标。 | 4 种类型 |
| 9 | 顶部公告 | 设置 `banner = true`，可以当作顶部公告使用。 | 内容、关闭、标题组合 |

## 公共 API

```ts
type AlertType = "info" | "success" | "warning" | "error" | "neutral";
type AlertSize = "small" | "default" | "large";
type AlertCloseElement = ReactNode | ((close: () => void) => ReactNode);

interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "content"> {
  content: ReactNode;
  title?: ReactNode;
  type?: AlertType;
  size?: AlertSize;
  inline?: boolean;
  banner?: boolean;
  closable?: boolean;
  showIcon?: boolean;
  icon?: ReactNode;
  closeElement?: AlertCloseElement;
  onClose?: () => void;
}
```

- 默认值：`type="info"`、`size="default"`、`inline=false`、`banner=false`、`closable=false`、`showIcon=true`。
- `closeElement` 存在时开启关闭能力，优先于默认关闭图标。
- 关闭后 Alert 从 DOM 移除，并调用一次 `onClose`。
- 根节点使用 `role="alert"`；装饰图标 `aria-hidden="true"`；默认关闭按钮名称为“关闭提示”。
- `className`、`id`、`aria-*`、`data-*` 等原生属性透传到根节点。

## 实现边界

- Demo 只使用 `@wangxiaojinger/qizhi-react` 的 Alert、Button 和 QIZHI Icon，不写原生交互标签、自写 SVG 或内联布局。
- Alert 的状态、尺寸、图标、关闭与 banner 样式由公共组件 CSS 负责；Demo CSS 只负责排列和浏览器示意外壳。
- v1 不增加旧站无证据的 action、自动关闭、受控 visible 或动画 API。
- 自定义关闭元素的交互必须使用 QIZHI `Button`；函数形式接收 `close`。

## 验收状态

自动化与执行者视觉验收最多声明 `candidate_pass`；独立最终验收保持 `pending`。
