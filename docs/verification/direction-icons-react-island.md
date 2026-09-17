# QIZHI 方向指示类图标 React Island 验证记录

状态：`candidate_pass`  
日期：2026-08-20  
独立最终验证：`pending`  
人工产品确认：`pending`

## 范围

- 旧规范站方向指示类 38 个 SVG。
- 23 个线性图标、15 个填充图标。
- `QizhiIconProps`、38 个 React 组件、短名称与旧名称兼容导出、manifest、AI 查询、根入口与 `@wangxiaojinger/qizhi-react/icon` 子路径。
- React 图标文档的搜索、筛选、卡片直接复制和三档响应式布局。
- `@wangxiaojinger/qizhi-react` 根入口、`@wangxiaojinger/qizhi-react/icon` 子路径、无图标与单图标消费边界，以及图标文档按路由懒加载。

## 自动验证

### 基线

- 实施前执行 `pnpm test`：69 个测试文件、394 项通过、0 失败。

### TDD 与目标测试

- 源证据测试先以 `expected 38, received 0` 失败，提取 38 个 SVG 后通过。
- manifest/查询测试先因模块不存在失败，实现后通过。
- 生成器测试先因模块不存在失败，实现后覆盖危险输入、固定颜色、几何/透明度转换和确定性输出。
- 公共导出测试先因 38 个组件未接入失败，接入后通过。
- 文档测试先因文档岛不存在失败，实现后通过。
- `direction-icons-visual-source.test.ts` 逐项确认 38 个生成 TSX 与批准转换结果字节一致。
- 包体边界检查先因单图标 smoke 产物意外包含 `RobotType1Icon` 失败；保留 ESM 模块并声明 CSS 副作用后转绿。
- 路由懒加载 E2E 先记录普通 Tag 页面提前请求 6 个图标文档模块；改为动态导入后，普通页面请求为 0，进入图标页后再加载。

### 全量命令

```text
node --check script.js
pnpm verify
```

结果：

- TypeScript 类型检查通过。
- 113 个测试文件、572 项测试通过、0 失败。
- 根文档站、`@wangxiaojinger/qizhi-react` 与 smoke app 构建通过。
- `dist/index.js`、`dist/icon/index.js`、对应类型声明和既有 `dist/qizhi-react.css` 实际生成。
- smoke 边界构建中，单个 `ArrowDownIcon` 页面仅产生 0.92 kB（gzip 0.59 kB）的页面入口和共享 React 运行时；产物不再包含 `RobotType1Icon` 等未使用目录图标。
- 文档站主启动脚本由改造前约 1.27 MB 降为 460.03 kB（gzip 108.77 kB）；完整图标文档被拆为按路由加载的 610.56 kB（gzip 148.02 kB）异步 chunk。
- Vite 仍对完整图标文档的 610.56 kB 异步 chunk 给出超过 500 kB 的警告。该警告不影响普通组件页首屏，但进入图标页仍会下载完整 415 图标目录；本次没有通过提高告警阈值掩盖它。

### 浏览器

服务：`http://127.0.0.1:5174/`  
命令：

```text
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test tests/e2e/icon-lazy-loading.spec.ts tests/e2e/direction-icons-react-island.spec.ts
```

结果：desktop-1440、narrow-1024、mobile-375 共 15 项通过、0 失败。

实际覆盖：

- 初始 38 项、线性 23 项、填充 15 项。
- 普通 Tag 页面不请求图标文档模块；直接进入 `#components-icon` 后才触发异步加载。
- 10 个既有基础图标已复用统一图标工厂，补齐 `size`、`title`、ref 和自动 ARIA 契约；`LoadingIcon` 保留 Input.Search 依赖的 `data-icon="icon-加载中"` DOM 协议。根入口的 `MoreIcon`、`SearchIcon` 直接复用目录实现，不再公开第二份同名组件。
- Icon Props 表明确 `fixedPalette` 多色图标保留固定色板；另设“图标目录与检索 API”表，记录 `findIcons` 与六类 manifest，不混入组件属性。
- 中文别名、英文组件名、旧长名称兼容检索、无结果与恢复；旧长名称命中后复制推荐短名称 JSX。
- 键盘聚焦与 Enter/Space 直接复制 JSX 组件代码。
- JSX 与 manifest 同源、Clipboard API 拒绝后的选区降级，以及浏览器实际剪贴板内容读取。
- 6/4/2 响应式列数、每个卡片宽高差不超过 1px、首格与网格左边界差不超过 1px。
- 图标默认颜色的计算值与 QIZHI `--color-text-1` 一致；文档预览将旧站路径的 `fill-opacity: 0.45` 覆盖为 `1`，避免变量颜色被透明度冲淡，React 图标组件源码保持不变。
- hover 后图标由 32px 以 1.4 倍缩放到 44.8px，计算颜色保持 `--color-text-1`；`prefers-reduced-motion` 下取消过渡但保留最终尺寸。
- hover 前后卡片文字颜色保持 `--color-text-2`，不切换为品牌蓝色。
- 点击卡片后通过挂载到 `document.body` 的全局 QIZHI Message Toast 提示复制结果；卡片内部不插入复制状态。
- 网格与页面横向溢出、控制台错误。
- 16、24、32px 尺寸契约；文档网格以 32px 进行视觉检查。

## 截图人工检查

实际查看了 Playwright 最终生成的 1440、1024、375 三张图标页局部截图。

- 1440：6 列网格；名称、图形和边框排列清晰，复制后不再插入额外详情区。
- 1024：4 列网格；搜索栏和筛选器未越界，复制交互不引发布局跳动。
- 375：2 列网格；中文名称无异常断词，标题计数无孤字，页面无横向滚动。
- 线性/填充、方向、展开/收起、默认/选中与第二样式均按旧站顺序呈现。
- 复制成功反馈为页面顶部居中的全局 Toast，包含 QIZHI 成功图标、“复制成功!”和 `<ArrowRightAltIcon />` 代码片段；卡片内无复制按钮或状态文字。
- Clipboard API 与选区降级均失败时显示全局错误 Toast；降级选区复制完成后恢复原按钮焦点。
- 点击后同步显示全局“正在复制”状态；选区复制与 Clipboard API 在同一次用户激活中并行执行，避免 Clipboard Promise 挂起时页面无反馈。
- 实际查看了 1440、1024、375 三档复制 Toast 局部截图；Toast 完整、居中、未被文档容器裁切，成功色来自 QIZHI Message 语义变量。
- 修复了全局 `.doc-section ul` 缩进覆盖图标网格所造成的左侧缺口；最终三档截图中网格均从标题左边界开始。

## 未完成与边界

- 当前文档还包含已迁移的提示建议、交互按钮、编辑、商标和通用分类；本记录仍聚焦方向类的命名与交互契约。
- 没有提供 `<Icon name="..." />`、IconFont、旋转、动画或 Arco 全局线型配置。
- 生成器对本期已证实的单 path 方向 SVG 使用严格白名单；未来复杂图标需另行扩展并重新审定，当前会明确失败。
- `candidate_pass` 仅表示本次执行证据满足已审定门槛，不等于林猫猫人工产品确认或独立最终验证。
