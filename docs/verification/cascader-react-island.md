# QIZHI Cascader React Island 验证记录

日期：2026-08-19  
执行者状态：`candidate_pass`  
独立最终验证：`pending`

## 交付范围

- `@wangxiaojinger/qizhi-react` Cascader 类型、纯数据模型、单选/多选、搜索、异步加载、拖拽标签、Portal、键盘与样式。
- ChevronDown、ChevronRight、Close 三个 QIZHI `currentColor` 图标。
- 旧站 15 组能力对应的 React 同源 Demo、结构化 API 和 `cascader-API` 锚点。
- 1440、1024、375 三视口的交互、页面宽度、Portal 几何和截图验收。

## 自动化结果

### 语法、类型、测试和构建

- `node --check script.js`：PASS。
- `./node_modules/.bin/vitest run`：54 个测试文件、290 个测试全部 PASS。
- `./node_modules/.bin/tsc -p tsconfig.json --noEmit`：PASS。
- `./node_modules/.bin/tsc -p packages/qizhi-react/tsconfig.json --noEmit`：PASS。
- 根目录 `./node_modules/.bin/vite build`：PASS，202 个模块；存在既有的单 chunk 大于 500kB 警告。
- `packages/qizhi-react` 中 `../../node_modules/.bin/vite build`：PASS，35 个模块；CSS 20.38kB，JS 35.88kB。

直接使用现有本地二进制是为了绕过当前 fallback pnpm 自动安装触发的 `ERR_PNPM_META_FETCH_FAIL` 与 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`；未修改 lockfile、store 或依赖版本。

### Cascader 浏览器验收

命令：

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5175 ./node_modules/.bin/playwright test tests/e2e/cascader-react-island.spec.ts
```

结果：9/9 PASS。

| 视口 | 文档/宽度 | 路径选择/焦点 | 搜索 Portal |
|---|---|---|---|
| 1440×1000 | PASS | PASS | PASS |
| 1024×900 | PASS | PASS | PASS |
| 375×812 | PASS | PASS | PASS |

验证内容：

- 15 组 Demo + API 共 16 个 codebox，`cascader-API` 唯一。
- 页面 `scrollWidth - clientWidth <= 1px`，控制台无 error。
- 点击完整选择“上海 / 上海市 / 黄浦”。
- Enter 打开、Escape 关闭并恢复输入焦点。
- 搜索结果显示完整路径。
- Portal 的直接父元素是 `BODY`，弹层四边均在视口内。

### 全站 E2E 回归

命令：

```bash
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5175 ./node_modules/.bin/playwright test
```

结果：21 PASS、3 FAIL。

- Cascader 9/9 PASS。
- Button、Link、Divider、Typography 合计 12/12 PASS。
- Input 3 个视口失败：并行开发中的 `#四种尺寸 .qizhi-input--size-mini` 不存在。Input 文件在 Cascader 任务执行期间出现且尚未纳入本任务，未修改、未提交，也不将其失败归因于 Cascader。

## 几何与裁切链

- 弹层由 `createPortal` 挂到 `document.body`，不在 `.demo`、`.codebox-wrapper`、正文或侧栏裁切链内。
- 打开态测试记录弹层 `position: fixed`，父元素 `BODY`。
- 三视口均验证 `left/top >= 0`、`right <= innerWidth`、`bottom <= innerHeight`。
- 首轮测试直接填充尚未滚入视口的页面下方输入，产生 4000px 以上坐标；修正为真实用户路径的 `scrollIntoViewIfNeeded → fill` 后三视口通过。这是测试前置条件修正，没有用放宽边界断言掩盖坐标问题。

## 截图人工检查

已查看三类真实截图：

- 1440 基础页面：标题、四态边框、网格、清除按钮、操作区和右侧目录正常。
- 1440 搜索打开态：搜索文本、完整路径结果、阴影、圆角与触发器对齐完整，没有祖先裁切。
- 375 搜索打开态：弹层完整位于手机视口，未造成页面横向滚动；结果文字、阴影和边缘完整。

截图位于 Playwright `test-results/` 临时产物目录，不提交仓库。

## 已知边界

- `index.html` 中 Cascader module 入口已通过 Git 索引补丁单独提交；同一工作区块中的 Typography、Link、Divider、Input 并行入口仍保持未提交，没有被纳入 Cascader 提交。
- 根站生产包仍有既有的大 chunk 警告；本轮不扩展到代码分包架构。
- 本记录是执行者验证，最高为 `candidate_pass`；独立最终验证仍为 `pending`。
