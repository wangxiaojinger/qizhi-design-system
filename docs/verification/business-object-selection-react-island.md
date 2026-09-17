# 对象选择 React Island 验证记录

## 旧规范证据

- 来源：静态规范站 `index.html`、`styles.css`、`script.js` 中的 `business-object-selection` 区块。
- 保留 4 个 Demo 的标题、说明、顺序、默认数据、尺寸与交互：基础选项卡、不同尺寸、带图标选项卡、业务对象选择器。
- 业务对象选择器保留 920px 桌面宽度、模型搜索、所属项目筛选、对象与版本两级选择、已选回显及确认/取消语义；所属项目筛选补为真实过滤。

## 公共能力映射

- 平铺互斥选择：`ChoiceCard`、`ChoiceCardGroup`。
- 复合对象选择：`ObjectSelector`，内部复用 QIZHI `Button`、`Modal`、`Input`、`Select`、`Radio` 与图标库。
- `Modal.bodyClassName` 作为正式公共 API，类型、实现、API 表和行为测试同步。
- 4 个 Demo 的运行、展示代码与复制代码均来自对应 Demo TSX；操作区复用 Button Demo 公共基线。

## 自动验证

- 定向 Vitest：4 个测试文件、21 项测试通过。
- TypeScript：根项目与 `@wangxiaojinger/qizhi-react` 类型检查通过。
- 全量 Vitest：352 个测试文件、1610 项测试通过。
- 生产构建：文档站、`@wangxiaojinger/qizhi-react` 与 React smoke 包均通过；bundle boundary 检查通过。文档站仅保留既有的大 chunk 警告。
- Playwright：1440、1024、375 三档共 3 项通过。
- 浏览器路径覆盖：初始/禁用、点击、方向键、搜索、真实项目筛选、对象切换后的版本重置、确认、取消、关闭按钮、Escape、遮罩关闭、焦点恢复、源码展开、右侧目录和横向溢出。
- 计算样式与盒模型：桌面基础组 558px、卡片 275px、Small 组 408px、图标组 704px、弹窗 920px；弹窗坐标位于视口内，祖先裁切链未发生实际裁切。

## 截图人工检查

- 已查看 1440、1024、375 三档页面截图与对象选择器打开态截图。
- 弹窗动效完成后背景不透底；标题、关闭按钮、搜索与筛选、两列/单列内容、版本卡、页脚、阴影和边缘完整，无明显裁切或横向溢出。
- 反馈修复后再次确认：对象列表使用指定资产 `qz-icon-select-model-color.svg` 对应的图标库组件 `SelectModelColorIcon`，SVG 显示尺寸 14×14px；外层为 18×18px、1px、`#818BFF → #A17BFF` 渐变线框，圆角 4px且背景透明；外框与文字实际边界间距 8px。已选对象的 `qizhi-selected-object__icon` 同步使用 1px `#818BFF → #A17BFF` 渐变描边；“切换”按钮文字在左、图标在右且颜色一致。已选数量为 14px/22px；Demo 预览区到操作区为 12px。

## 状态

- 执行者结论：`candidate_pass`。
- 独立最终验证：`pending`。
