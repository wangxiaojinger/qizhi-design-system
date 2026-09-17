# Menu React Island 验证记录

## 2026-08-31 PlatformShell 公共组件集成验收

执行状态：`candidate_pass`  
独立最终验收：`pending`

- 当前代码预览地址为文档站 `http://127.0.0.1:5201/#component-layout`、
  AI 工作台 `http://127.0.0.1:5202/`、Agent 管理页
  `http://127.0.0.1:5203/`。
- Chrome/Playwright 对三者完成 1440、1024、375 三档候选验收；每页均只有
  一个公开 `.qizhi-platform-shell`，Header 均为 56px，Header 与 Body 直接
  子节点间距为 0；Body 与 Main 或 Sider/Main 的直接子节点几何也逐档记录且
  连续。无旧壳层根节点，无页面横向溢出，控制台、page error 和 request
  failure 均为 0。
- Framework Demo 默认工作台无 Sider、主区左内边距 24px；定制模型在桌面
  为 210 × 800px Sider，窄屏/手机按公共响应式规则等宽堆叠。模型服务、
  Agent、探索、运营中心分别真实映射到模型部署、Skills 工坊、模型广场、
  资源概览。
- 三档均真实打开空间 Dropdown，浮层水平边界完整且顶层命中；Escape 关闭后
  焦点返回空间触发器。AI 工作台验证“申请项目”更新 Mock 提示；Agent 管理页
  验证 Agent/Agent 双选中、`HW-H800-Public` 空间和刷新 Message。
- Framework 的默认、侧栏、空间浮层三类 × 1440/1024/375 共 9 张截图均已
  逐张人工查看。重拍时仅在截图期间隐藏文档固定 `.topbar`，1024 三张目标态
  已无遮挡；三档的导航、问候、内容偏移、选中块和浮层边缘清晰。两个生成页
  三档全页截图也已查看。
- 生产级联修复后，375px Agent 页 `.agent-page-side-navigation` 的计算高度已
  从失败证据中的 800px 变为目标 560px；最终 JSON 记录
  `expected=560px / actual=560px / pass=true`，完整脚本退出 0。执行者本轮复验
  只编辑证据与文档；脏工作树没有独立 Git 基线，因此不把该范围记录升级为
  “其他生产文件未变化”的独立证明。
- 证据 JSON：
  `.superpowers/sdd/2026-08-31-qizhi-platform-shell-public-component/browser-evidence/platform-shell-browser-results.json`；
  生成页同份结果同步保存在各自 `screenshots/`。
- API manifest、根 TypeScript/构建、组件包 TypeScript/构建/声明、两个页面
  TypeScript/构建、两个 Page Builder validator、公共边界脚本和
  `git diff --check` 均退出 0。Agent 页面与组件包首次并行构建因组件包重写
  `dist` 短暂缺少 CSS；组件包完成后顺序重跑为 1043 modules、退出 0，属于
  验证调度竞态而非产品失败。
- 聚焦 Vitest 仍停留在 worker 启动，约 110 秒没有进入任何测试用例后人工
  中止（exit 130）；不记录为测试通过或产品失败。
- 三个服务在本次复验前已重启；最终交接时需再次确认 5201/5202/5203 的
  HTTP 200。验收执行时三者在线；2026-08-31 13:01:58 CST 又在完成前重新
  启动并实测三者均为 HTTP 200，对应会话为文档 `8634`、工作台 `76958`、
  Agent `28130`。该记录只证明交接时在线，不保证未来进程持续存在。

## 2026-08-31 TopNavigation 公共化增量验证

执行状态：`candidate_pass`  
独立最终验收：`pending`

- `TopNavigationPreview` 已沉淀为 `@wangxiaojinger/qizhi-react` 公共业务组件
  `TopNavigation`，Demo 与 Layout 框架预览均改为调用公共组件。
- 完整顶部导航样式从 `menuDocs.css` 迁入组件专属
  `topNavigation.css`；文档 CSS 不再拥有或覆盖公共组件样式。
- Logo、探索、帮助、语言、区域和运营中心六个资产均进入组件目录，并用
  `cmp` 确认与原 Demo 资产逐字节一致。
- 新增 `TopNavigationProps`、`TopNavigationItem`、
  `TopNavigationOption`，并从 `@wangxiaojinger/qizhi-react` 根入口导出。
- `component-api.json` 已生成 `topNavigationApi`，共 20 个公开属性；
  Menu 文档页展示独立 `TopNavigation API` 表。
- 根 TypeScript、组件包 TypeScript、组件包 Vite 构建、生成工作台
  TypeScript、生成工作台 Vite 构建和 Page Builder 输出边界检查通过。
- Vitest 在当前环境仍停留于 worker 启动，未产生测试用例结果；不记录为
  测试通过。使用等价 Node 门禁确认公开导出、样式归属、Demo 单一实现和
  生成 API 全部通过。
- Chrome/Playwright 实测文档 Demo、Layout 框架和生成工作台的 1440、
  1024、375 三档：公共根元素均为 56px，高度与原 Demo 一致；背景均为
  `rgb(220, 232, 255)`；三档无横向溢出、无控制台或 page error。
- 1440 下真实打开区域 Dropdown；1024 和 375 下区域入口按原容器查询
  断点隐藏。Layout 框架从工作台切换至定制模型后三档均正常出现侧栏。
- 已人工查看文档与生成工作台共六张截图；品牌、导航选中、溢出入口、
  工具区、头像及响应式隐藏结果符合当前 Demo。结果与截图位于
  `generated-react-pages/ai-lifecycle-workbench/screenshots/`。

验证日期：2026-08-25  
执行状态：`candidate_pass`  
独立最终验收：`pending`

## 范围

- 公共 `Menu`、`Menu.Item`、`Menu.Group` API。
- 旧站 `顶部导航菜单`、`左侧菜单`两个 Demo。
- React Island、API 表、展示代码和复制代码同源。
- 1440、1024、375 三档真实浏览器行为与视觉。

## 自动门禁

执行命令：

```bash
pnpm test
pnpm typecheck
pnpm build
node --check script.js
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5186 \
  pnpm exec playwright test tests/e2e/menu-react-island.spec.ts
curl -sS -o /dev/null -w '%{http_code}\n' \
  'http://127.0.0.1:5187/#component-menu'
```

结果：

- Vitest：333 个测试文件、1530 项测试通过，0 failure。
- 根类型检查与 `@wangxiaojinger/qizhi-react` 类型检查通过。
- 文档站、`@wangxiaojinger/qizhi-react`、`@wangxiaojinger/qizhi-react-smoke` 构建通过。
- `node --check script.js` 通过。
- Playwright：desktop-1440、narrow-1024、mobile-375 共 3 项通过。
- 最终预览地址 `http://127.0.0.1:5187/#component-menu` 返回 HTTP 200。
- 构建仅出现仓库已有的 500 kB 大 chunk 提示，无 Menu 新增错误。

## 计算样式与盒模型

- 1440/1024 左侧外框：宽 210px、高 800px。
- 左侧内容：宽 166px；相对外框左偏移 24px、上偏移 54px。
- 外框右/下内边距分别为 20px、24px；菜单项公共内边距为
  8px 12px。
- 375 下父 `.demo` 内容宽 205px，左侧外框收缩为 205px；内容按
  `min(166px, 205px - 44px)` 收缩为 161px，没有横向溢出。
- 顶部直接子项顺序为品牌、机房、横向滚动壳层、溢出入口、操作区；完整
  菜单保留在滚动区中，按实际坐标将被裁切项同步到溢出入口。
- 顶部恢复旧站 56px 浅蓝通栏、24px 水平内边距、32px 品牌/机房/菜单项、
  8px 圆角选中态、16px 分隔线和 32px 黄色圆形头像。
- 每个 Demo 均满足 `scrollWidth <= clientWidth`，页面根节点无横向溢出。
- Demo 到操作区间距为 12px，操作区右内边距为 0px。
- 左侧严格按旧站“框架结构预览 → 启智结构预览”的
  `custom-model` 运行态还原：工作空间后以 12px 间距直接进入
  “空间概览”，不额外插入分隔线；四个分组标题前各有一条
  166 × 1px 分隔线。
- 根据最新确认，工作空间入口已去掉左箭头和竖分隔线，右侧仅保留
  公共 `ExpandIcon` 线性上下箭头。
- 菜单内容与旧站一致：“模型开发与训练”、“模型评测”、
  “AI资产管理”、“空间管理”；初始选中“交互式建模”，
  禁用“可视化建模”、“评测任务”、“评测报告”、“数据集”、
  “评测task”。

## 交互路径

- 顶部初始选中“模型服务”；点击“工作台”后 `aria-current`、颜色和受控
  状态同步。
- Left/Right、Up/Down、Home、End 只移动焦点，不自动改变选中项；隐藏项
  不进入 roving focus 集合。无默认选中项及选中项隐藏时，仍各有且仅有
  一个可见 `tabIndex=0` 键盘入口。
- 真实验证未选中菜单项的 hover、active、键盘 `focus-visible`，以及选中项
  的颜色与背景反馈。
- 左侧可用项 hover 与顶部导航统一为
  `rgba(51, 102, 255, 0.04)` 背景和 `rgb(51, 102, 255)` 文字/
  图标；禁用项保持透明背景，不产生 hover 反馈。
- 工作空间入口计算内边距为 `8px 12px`；左侧菜单默认图标
  为 `color-text-2` (`rgb(78, 89, 105)`)，选中图标为
  `color-text-1` (`rgb(29, 33, 41)`)。
- 不仅检查 SVG 根节点 `color`，还检查内部 `path` 的计算
  `fill-opacity`；默认与选中图标均为 `1`，避免图标库资产原有
  45% 透明度导致 token 颜色视觉偏色。
- 机房 Dropdown 验证长名称、禁用项、选择更新、Escape 关闭和焦点恢复。
- 语言 Dropdown 完成 Escape 取消、中文 → English → 中文完整往返及外部
  点击关闭。
- 三档的溢出菜单只包含当前被实际坐标裁切的菜单项；真实选择“探索”后，
  菜单会滚动到对应项，并重新同步溢出名单、`aria-current` 和键盘入口。
- 左侧初始选中“交互式建模”；Down 跳过禁用项，End 到
  “模型仓库”，Home 到“空间概览”，焦点移动不会误改选中态。
- 工作空间完成 Escape 取消，以及
  `AI4S_DEV_public_workspace` → `启智公共云长名称测试空间`，
  `menuitemradio/aria-checked`、关闭和焦点恢复通过。
- 两个 Demo 的展示代码全文均与各自剪贴板全文逐字符一致。

## 浮层祖先裁切链

初次截图发现公共 `.demo { overflow: hidden }` 和移动端 `.qz-content` 会
裁切向下展开的 Dropdown。已仅在 Menu 页面打开对应祖先的 overflow，未
放开全局 Demo。最终 E2E 从每个打开浮层逐级遍历到 `body`，结合各祖先计算的
`overflow/overflow-x/overflow-y` 与实际坐标判断裁切；三档均无裁切祖先。

## 截图人工结论

截图位于各 Playwright project 的 `test-results/.../`：

- `menu-top-default-<project>.png`
- `menu-top-dropdown-open-<project>.png`
- `menu-side-default-<project>.png`
- `menu-side-workspace-open-<project>.png`
- `menu-mobile-375-mobile-375.png`

人工检查结论：顶部品牌、短机房名、资源文案、溢出入口、选中背景和
Dropdown 完整边缘符合预期；左侧返回入口、分组分隔、独立图标、210/166
几何、54/20/24/24 内边距和菜单项 8/12 内边距符合预期；375 下溢出入口、
操作按钮和左侧菜单均可操作，无组件文字自身裁切。

顶部旧规范另完成真实页面运行态 QA：在 828px 导航宽度下逐项对照计算
样式、直接子项尺寸、菜单项实际坐标和动态溢出名单。详见根目录
`design-qa.md`；最终结果为 `passed`。

`menu-mobile-375.png` 的长区域截图中出现文档站固定顶部壳层覆盖，这是
Playwright 对长 section 截图时固定元素的拼接结果；各 Menu 局部截图没有
该覆盖，不属于 Menu Demo 裁切。

## 验收边界

Menu 是新增公共 API。当前结论只能标记 `candidate_pass`；用户或独立验证者
对新 API 和视觉完成确认前，`independent acceptance` 保持 `pending`。

## 2026-08-31 SideNavigation 公共组件迁移

- 原 `SideNavigationPreview` 的五种业务变体、默认数据、空间切换、选中态、
  禁用态、键盘路径和 210 × 800 几何已迁入公开 `SideNavigation`。
- Menu Demo 与 Layout 框架预览只从 `@wangxiaojinger/qizhi-react` 调用公共组件；
  `menuDocs.css` 不再拥有侧边导航样式，也不选择公共组件私有后代节点。
- Agent 管理页已删除基础 `Menu` 重组的导航壳，改用公开
  `TopNavigation` 与 `SideNavigation`。
- `component-api.json` 已生成 `sideNavigationApi`，Page Builder 已要求优先
  使用完整公共侧边导航，不得用基础组件重组。
- 根项目类型检查和构建、组件包类型检查／构建／声明生成、Agent 页面输出
  边界检查和构建均通过。根构建仅保留既有的大分块体积警告。
- 1440、1024、375 三档真实验证空间选择、Escape 焦点恢复、键盘 Down、
  禁用项、选中态、内部滚动、页面溢出和控制台；结果文件为
  `generated-react-pages/ai-lifecycle-workbench/screenshots/side-navigation-browser-results.json`
  与 `generated-react-pages/agent-management/screenshots/agent-public-navigation-results.json`。
- Vitest 在当前环境仍停在 worker 启动阶段，因此没有把组件单测记为通过；
  公共边界使用等价静态门禁验证通过，浏览器行为验证通过。
- 当前状态为 `candidate_pass`，独立最终验收保持 `pending`。
