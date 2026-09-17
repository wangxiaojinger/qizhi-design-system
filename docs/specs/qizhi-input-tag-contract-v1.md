# QIZHI InputTag v1 契约

## 范围

InputTag v1 迁移自静态规范站 `#component-input-tag` 的 6 个 Demo。组件负责
多值标签输入，不提供 Select、TreeSelect、Cascader 的选项弹层或数据选择能力。

## 公共能力

- 受控与非受控标签数组、`onChange` 和原生 input ref。
- `small`、`default`、`large` 三种尺寸，高度为 28、32、36px。
- Enter 或逗号提交；空输入按 Backspace 删除最后一个标签。
- 单项删除、全部清空与操作后的输入焦点恢复。
- `labelInValue`、校验拒绝、格式化返回值、失焦保存。
- 固定最大标签数、自定义摘要和基于真实宽度的响应式摘要。

## 结构与复用

- 根节点复用公共输入容器协议 `qizhi-control-container`。
- 标签主体复用公共 `Tag`，关闭图标复用 `CloseIcon`。
- `Tag.closeAriaLabel` 为 InputTag 提供“删除 {label}”的准确无障碍名称。
- 响应式测量使用标签实际宽度和 `ResizeObserver`；标签与摘要均禁止 flex 压缩。
- InputTag 不复用 Select 当前按固定宽度估算的响应式算法。

## 状态优先级

- 校验返回 `false` 时不新增标签，根节点进入 error 状态，输入同步
  `aria-invalid=true`；error 高于普通 focus 状态。
- 失焦保存只提交非空文本。
- 清空按钮只在存在标签或待输入文本时出现；清空后恢复输入焦点。
- 固定或响应式折叠只影响展示数量，不改变完整值数组。

## 文档契约

6 个 Demo 的运行组件、展示 TSX 和复制 TSX 来自同一模块；Demo CSS 来自
同一共享文件并可查看、复制。标题、原始说明、顺序、数据、占位文案和初始
状态以 `qizhi-input-tag-migration-map-v1.md` 为准。

## v1 不支持

- 不提供主题色、前后缀、拖拽排序或弹层。
- 不替换 Select、TreeSelect、Cascader 内部标签实现。
- 不把 Demo 的消息、结果 `<pre>` 或布局类暴露为组件 API。

