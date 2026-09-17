# QIZHI Message React v1 契约

## 证据范围

- 旧站来源：`index.html` 的 `#component-message`、`styles.css` 的 `.qizhi-message*`、`script.js` 的 `initMessageDemos`。
- Demo 共 7 个，标题、说明、顺序、按钮文案、消息文案、时序与挂载位置保持原样。
- 旧 API 表与运行行为冲突时按已确认的真实运行行为执行：`closable` 默认值为 `false`。

## 公共能力

- `Message.info / success / warning / error / normal / loading` 接受字符串或配置并返回关闭函数。
- `Message.clear()` 清空全局提示；`Message.config()` 支持 `maxCount`、`getContainer`、`duration`。
- 配置支持 `content`、`closable`、`showIcon`、`duration`、`id`、`position`、`closeIcon`、`icon`、`className`、`style`、`onClose`。
- 相同 `id` 更新同一条消息；错误消息使用 `alert`，其余使用 `status`。
- `useMessage()` 返回局部 API 与 `contextHolder`，局部提示不使用全局 `getContainer`。

## 视觉与交互

- 全局层 top 为 72px，宽度 `min(520px, 100vw - 32px)`，间距 12px。
- 消息最小高度 40px、内边距 `9px 16px`、内容间距 8px、图标 18px、关闭按钮 22px。
- 进入和退出状态、自动关闭、手动关闭、重复点击、更新、键盘关闭及 reduced-motion 必须真实验证。
- Demo 触发器复用公共 Button；Demo 不重写 Message、图标或按钮能力。

## 同源与验收

- 每个格式化 Demo TSX 同时驱动运行、展示和复制代码。
- 测试锁定 7 个 Demo 的旧站契约、公共 API、全部消费者搜索和 1440/1024/375 三档截图/计算样式。
- 执行者最多声明 `candidate_pass`，独立最终验收保持 `pending`。
