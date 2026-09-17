# Input React Island 验证记录

状态：`candidate_pass`。独立最终验证仍为 `pending`。

## 交付范围

- `Input`、`Input.Search`、`Input.Password`、`Input.TextArea`、`Input.Group`
- mini、small、default、large 四种尺寸
- 状态、清空、前后缀、前后标签、搜索与 Loading、字数统计、自动高度、格式化、宽度自适应
- 14 个文档 Demo；展示结构、初始内容和说明以旧规范站为基线，TSX 与共享 Demo CSS 均可查看、复制
- API 表与独立 `@wangxiaojinger/qizhi-react` 消费页

## 自动验证

- Input 定向测试：3 个文件、24 项测试通过。
- 仓库 `pnpm test`：225 个测试文件、1099 项测试通过。
- `pnpm typecheck`：通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react`、独立 smoke app 构建通过；保留仓库既有的大 chunk 警告。
- `node --check script.js`：通过。
- `git diff --check`：通过。
- Input 影响范围搜索：没有新增 `arco` 或 `ac` 命名空间。

## 浏览器验证

- `tests/e2e/input-react-island.spec.ts` 在 1440、1024、375 三个视口共 3 项通过。
- 实测清空与焦点恢复、密码显隐与焦点恢复、Enter 格式化、errorOnly 字数统计、Search Loading、尺寸与自定义高度、公共 Radio/Button 复用、14 个 Demo、API 锚点、TSX/CSS 展开和页面横向溢出。
- 三个视口截图均已生成；人工查看了桌面三组目标 Demo、移动端全页及三组目标 Demo。移动端首次发现 addon 文案换行，修复后重跑 3 项通过并复核截图。
- 独立消费页无源码 alias，只导入 `@wangxiaojinger/qizhi-react` 与 `@wangxiaojinger/qizhi-react/style.css`；计算样式为 1px solid 边框、32px 默认高度，无页面横向溢出。

## 旧站 Demo 一致性纠偏

- 代码操作统一为“查看代码 / 复制代码 / 复制样式”；展开区的 TSX 与共享 Demo CSS 和实际预览同源。
- 恢复基础示例的 350px 宽度与 `Enter something` 占位符。
- 恢复尺寸 Demo 的分段尺寸选择、自定义高度滑杆，以及前缀、后缀、前置标签、后置标签四类组合。
- 恢复单位选择标签、城市选择组合、日期与搜索组合、两种电话组合。
- 字数统计恢复为五种示例，其中包含输入框与文本域的 `errorOnly`。
- 恢复旧站说明文案及格式化输入示例的英文标签。
- 单元测试与 E2E 已增加上述结构断言，后续组件 API 调整不得先行改写 Demo。
- 尺寸选择复用公共 `Radio.Group`；addon Dropdown 触发器复用公共 `Button`，不再引用 Dropdown 内部箭头类。
- TextArea disabled/readOnly 状态与组合输入自定义高度下沉到公共 Input 组件；Demo CSS 全部限制在 `#component-input`。

## 过程发现与修正

- 字数统计输入与 Loading 搜索框最初仍显示清空入口；先补失败测试，再修正组件语义，回归通过。
- 独立消费页最初因宿主未定义文档 token 而丢失边框；Input CSS 改为“宿主 token 优先、QIZHI 基线 fallback”，不覆盖宿主主题。
- 首次最终 E2E 重跑因沙箱内 Chrome 启动被系统拒绝；在获准环境重跑后 3 项通过。
- 本轮第一次三档重跑暴露 E2E 多元素 strict-mode 断言问题，第二次因新增截图超过原 30 秒时限；两处均修正测试基础设施后，最终 3 项在 15.4 秒内通过。

## 限制

- 当前验证属于实现者自验，只能声明 `candidate_pass`；独立人工/独立代理最终验证仍待执行。
- 文档站构建保留现有大 chunk 警告，本次未扩大范围处理。
