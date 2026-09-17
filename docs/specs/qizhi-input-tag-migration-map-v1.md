# QIZHI InputTag v1 迁移盘点与复用映射

状态：等待确认，未开始 React 组件实现。

## 证据范围

- 静态站入口：`#component-input-tag`
- 结构来源：`index.html`
- 样式来源：`styles.css` 的 `.input-tag-*`、`.qizhi-input-tag-*`
- 交互来源：`script.js` 的 `initInputTagDemo`、`syncMaxTagCount`
- 当前浏览器复核：1440px 视口，6 个 Demo，控制台无错误

旧站页面介绍原文为“标签输入。”。本次只迁移 6 个独立 InputTag Demo；
Select、TreeSelect 等组件内部的多标签结构不在本轮替换范围内。

## Demo 原始契约

| 顺序 | ID | 标题 | 原始说明 | 初始数据与状态 | 布局和尺寸 | 交互 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 标签输入框不同尺寸 | 不同尺寸 | 通过设置 `size` 来指定大小，标签输入框提供 `small`、`default`、`large` 三种尺寸，高度分别为 28px、32px、36px。 | `北京`、`上海`；默认 `default`；存在标签时占位文案为空 | 单控件，最大宽 350px；初始 350×32px | 尺寸切换；删除单个标签；清空；输入后按 Enter 或逗号新增；空输入按 Backspace 删除最后一项 |
| 2 | 获取选项的文本 | 获取选项的文本 | 可以通过设置 `labelInValue=true` 获取选项的文本值。 | 初始标签 `{ label: "选项一", value: "1" }`；结果原文为 `[{"label":"选项一","value":"1"}]` | 控件与结果纵向排列，8px 间距；控件 350×32px | 新增、删除、清空后同步对象数组结果 |
| 3 | 校验与格式化输入 | 校验与格式化输入 | 通过 `validate` 校验输入，也可以返回非布尔类型来将用户输入的字符串格式化为特定值。 | 左侧空值，提示“输入长度需大于 3 后按回车。”；右侧空值，结果 `[]` | 两组横向排列并允许换行，列间 16px、行间 12px；每项 350×32px | 左侧长度小于等于 3 时进入错误态并显示“长度必须大于 3”；大于 3 时新增。右侧将输入映射为 `{ word: value }` 并同步结果 |
| 4 | 失焦时保存 | 失焦时保存 | 设置 `saveOnBlur` 在失焦时自动将正在输入的文本保存为标签。 | 无标签；占位文案“输入后失焦保存” | 单控件，最大宽 350px，初始 350×32px | 输入框失焦时保存非空文本；仍支持 Enter、逗号、Backspace、删除和清空 |
| 5 | 最大标签数 | 最大标签数 | 通过 `maxTagCount` 设置最多展示的标签数，`maxTagCount.render` 自定义 `+x` 部分的节点内容。 | 第一项 `1–5`，显示 `1、2、3、+2`；第二项 `11–55`，显示 `11、22、33、2 个更多` | 两项横向排列并允许换行；每项 350×32px | 删除或新增后重新计算隐藏数量；固定计数时输入槽收缩到 2px，不能挤压已显示标签 |
| 6 | 响应式显示Tag | 响应式显示标签 | 通过 `maxTagCount=responsive` 设置根据容器尺寸动态显示标签数。标签数较多时不建议使用，可能存在性能问题。 | 两项均为“标签 1–5”；300px 下第一项显示 3 个标签和 `+2`，第二项显示 2 个标签和 `+3 个更多` | 两项横向排列并允许换行；每项 300×32px | 使用真实标签和摘要宽度计算可见数量；容器尺寸改变后由 `ResizeObserver` 重算；标签和摘要不得参与 flex 压缩 |

所有说明均非空；迁移时保持上述中文、英文参数名、顺序和标点，不翻译、
不简化、不补写。

## 公共组件复用映射

| 需求 | 复用来源 | 处理 |
| --- | --- | --- |
| 标签主体 | 公共 `Tag` | InputTag 内部直接渲染 `Tag`，不复制标签 DOM/CSS |
| 标签删除图标 | 公共 `Tag` + `CloseIcon` | 为 `Tag` 最小扩展可配置删除按钮无障碍文案，保持旧站“删除 {label}” |
| 输入边界、状态盒模型 | `controlContainerClassName` 与 Input token | 复用公共输入容器协议；不复用旧站 `.input-tag-demo` 作为组件 API |
| 全部清空 | 公共 `Button` 语义与 `CloseIcon` | 组件内部使用原生 button 语义和公共图标；不使用 Remix Icon |
| 尺寸切换 Demo | 公共 `Radio.Group type="button"` | 不迁移旧站手写 segmented/radio DOM |
| 文档操作区 | Input/Button 文档基线 | 复用“查看代码 / 复制代码 / 复制样式”，TSX、CSS、预览同源 |
| API 表 | 公共 API 表组件 | TypeScript 类型直接生成/维护同一份 API 数据，不手写另一套契约 |
| 响应式标签折叠 | InputTag 内部测量逻辑 | 使用真实标签宽度和 `ResizeObserver`；不能复用 Select 当前按 88px 估算的算法 |

## v1 API 映射

| 旧站能力 | React API | 类型或约束 |
| --- | --- | --- |
| 标签数组 | `value` / `defaultValue` | `InputTagValue[]`，支持受控和非受控 |
| 结果变化 | `onChange` | `(value: InputTagValue[]) => void` |
| 获取文本和值 | `labelInValue` | `false` 时为 `string[]`；`true` 时为 `{ label, value }[]` |
| 尺寸 | `size` | `"small" | "default" | "large"`；28/32/36px |
| 占位文案 | `placeholder` | 原生字符串 |
| 清空 | `allowClear` / `onClear` | v1 默认允许清空；无值时不展示 |
| 输入校验/格式化 | `validate` | 返回 `false` 拒绝；返回非布尔值时作为最终标签值 |
| 失焦保存 | `saveOnBlur` | `boolean`，默认 `false` |
| 提交分隔符 | `tokenSeparators` | Enter 固定提交；默认分隔符包含逗号，保持旧站行为 |
| 最大标签数 | `maxTagCount` | `number | "responsive"` |
| 摘要文案 | `renderMore` | `(hiddenCount: number) => ReactNode`，承接旧站 `maxTagCount.render` |
| DOM 扩展 | `className` / `style` | 作用于 InputTag 根节点 |
| 输入引用 | `ref` | 指向内部 `HTMLInputElement` |

## 明确不纳入 v1

- 不增加旧站 6 个 Demo 未覆盖的主题色、前后缀、拖拽排序或弹层能力。
- 不顺带重构 Select、TreeSelect、Cascader 的内部标签实现。
- 不把文档容器类、结果展示 `<pre>` 或错误提示布局暴露为组件 API。
- 不把 Select 当前响应式标签的固定宽度估算当作 InputTag 原始契约。

## 测试锁定

- 单元测试：受控/非受控、Enter/逗号提交、空输入 Backspace、删除、清空、
  `labelInValue`、校验拒绝、格式化返回值、失焦保存、固定与响应式折叠。
- 文档契约：6 个 Demo 的标题、原始说明、顺序、数据、占位文案、尺寸、
  TSX/CSS 同源和公共组件复用。
- 浏览器：1440、1024、375 三档；真实标签宽度、摘要宽度、输入剩余宽度、
  键盘路径、焦点恢复、无横向溢出、控制台和目标截图人工复核。
