# Slider React Island 验证记录

状态：`candidate_pass`。独立最终验证保持 `pending`。

## 实现范围

- `@wangxiaojinger/qizhi-react` 新增正式 Slider、类型、样式和 `VolumeUpIcon` 导出。
- 迁移旧站 9 个 Demo；标题、说明、顺序、初值、尺寸、布局和交互保持一致。
- “控制 tooltip 的展示”继续保持空说明。
- “显示输入框”复用公共 InputNumber，不增加 `showInput`。
- React Input 的自定义高度控制器从原生 range 改为公共 Slider。
- Watermark 与 Upload 仍使用静态 Slider runtime，本次未扩大为 React 页面迁移。
- API v1.1 使用单值、范围、多点判别联合类型；范围只接受二元组，多点只接受
  三个及以上数值，并新增 `onChangeComplete`、`tooltipPosition` 和
  `getPopupContainer`。
- `tooltipVisible` 明确为三态：`undefined` 跟随交互、`true` 持续显示、
  `false` 持续隐藏。

## TDD 记录

- 公共 Slider 测试先因 `./Slider` 不存在失败，再实现为 6/6 通过。
- Slider 文档测试先因 registry/API/Island 不存在失败，再实现为 4/4 通过。
- Input 文档测试先因仍存在原生 range 失败，替换后通过。
- Tooltip 路由恢复测试先因隐藏挂载后不重定位失败，公共 Tooltip 增加
  `qizhi:route-rendered` 重定位后通过。
- API v1.1 类型测试先因旧类型仍接受非法模式组合失败；行为测试先因缺少完成回调、
  Tooltip 位置和容器透传失败；实现后定向 4 个文件 23 项测试全部通过。

## 自动验证

- 全量 Vitest：240 个测试文件、1199 项测试全部通过。
- Slider、Tooltip、Slider 文档和 Input 文档定向测试均通过。
- `pnpm typecheck`：通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react` 和消费端 smoke build 通过；
  保留既有的大于 500 kB chunk 警告。
- `node --check script.js`：通过。
- `git diff --check`：通过。

## 浏览器验证

- Slider E2E：1440、1024、375 三档 3/3 通过。
- Input 消费回归：1440、1024、375 三档 3/3 通过。
- 覆盖单值、禁用、范围、多点、InputNumber 双向同步、竖直刻度、Tooltip、
  formatterTooltip、范围整体拖拽、同源代码和无横向溢出。
- 多点 Demo 的展示代码已锁定显式 `<Slider multiple`，避免仅凭数组值隐式切换模式。
- 三档截图已人工查看；竖直轨道、刻度、音量图标、范围条和移动端换行无裁切。
- 浏览器控制台无新增错误。
- “显示输入框”复核后移除误用的左右按钮模式：四组均使用内嵌 InputNumber，
  前两组不占用步进区，后两组持续显示右侧上下步进按钮；6 个初始值完整显示。
- 类目审查后移除 Slider Demo 对 `qizhi-input-number__steps` 私有结构的
  CSS 覆盖；改为公共 `controls="hidden | always"` API，并锁定 Demo 不存在
  内联布局样式。
- 操作区的查看与复制按钮均使用 `qizhi-code-action`，三档共 18 个。
- 持续 Tooltip 与显示输入框三档截图已逐张人工检查。
- 文档壳层在 1024px 下会压缩 2×2 网格，已将该 Demo 的单列断点提升到
  1200px；1440px 保持原始 2×2，1024px 和 375px 保持输入框原始宽度。

## 限制

- Watermark 与 Upload 的静态 Slider 消费没有改成 React；其原有 HTML/CSS/JS
  仍保持不变。后续迁移对应页面时再替换为公共 Slider。
- 独立最终验收尚未执行。
