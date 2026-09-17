# QIZHI Steps React v1 契约

## 页面

- 标题：`步骤条 Steps`
- 说明：`明示任务流程和当前完成程度，引导用户按照步骤完成任务。`

## Demo 顺序与原始说明

1. `基础用法`：`这是步骤条组件的基础用法。`
2. `小型步骤条`：`小型步骤条适合信息密度较高或空间有限的场景。`
3. `展示描述信息`：`步骤内容需要补充说明时，可在标题下展示描述信息。`
4. `步骤错误`：`通过错误状态标识当前未能完成的步骤。`
5. `步骤切换`：`通过改变当前步骤，可以在任务流程中前进或后退。`

## Demo 原始契约

- 三步标题依次为 `成功`、`进行中`、`待办`。
- 描述 Demo 与错误 Demo 的每步说明均为 `这是一段描述`。
- 基础用法当前为第 2 步，内容为 `步骤 2 内容`。
- 小型步骤条使用 small 尺寸。
- 步骤错误当前为第 2 步，并显示 error 状态。
- 步骤切换初始为第 1 步，内容为 `步骤 1 内容`，后退按钮禁用；可依次前进到第 3 步再退回第 1 步，边界按钮随状态禁用，内容区为 live region。
- 默认图标 32px，标题 14px / 22px / 500，描述 12px / 20px，最大宽度 780px。
- small 图标 24px，标题 13px。
- 600px 及以下改为纵向：默认步骤最小高度 64px，small 为 52px。
- 基础内容面板桌面最小高度 140px，移动端 96px。
- 切换面板桌面最小高度 200px，移动端 168px。

## v1 公共 API

- `items: readonly StepsItem[]`
- `current?: number`：从 1 开始，默认 1，超出范围时限制在有效区间。
- `size?: "default" | "small"`
- `status?: "process" | "error"`
- 根 `ol` 的原生属性、`className`、`style`
- `ref?: Ref<HTMLOListElement>`

Steps 根据当前位置统一派生 finish、process、wait 和 error 状态，并在当前步骤输出 `aria-current="step"`。旧 Demo 没有方向切换或点击步骤能力，v1 不增加对应 API。

步骤切换的下一步按钮要求图标位于文案之后，因此 Button 新增正式 `iconPosition?: "before" | "after"` API；默认值保持 `before`。

## 公共边界与同源

- Demo 只使用公共 `Steps`、`Button` 和公共方向图标，不自制交互控件或 SVG。
- Modal 的“带有步骤条对话框”复用公共 small Steps，不保留私有步骤实现。
- 实际 Demo TSX 是预览、展示代码和复制代码的唯一来源。
- 操作区完整复用公共 Demo 基线。

## 验收状态

- 自动验证最多为 `candidate_pass`。
- 独立最终验收保持 `pending`。
