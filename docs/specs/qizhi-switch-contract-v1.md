# QIZHI Switch v1 组件契约

## 能力边界

- 支持受控与非受控状态。
- 支持 `default` 和 `small` 两种尺寸。
- 支持禁用和加载状态。
- 支持 `checkedText` 与 `uncheckedText`。
- 加载图标复用 QIZHI `LoadingIcon`。
- 不提供颜色、形状、自定义图标插槽等旧站未实现能力。

## 尺寸与状态

| size | 宽×高 | 滑块 |
| --- | --- | --- |
| default | 44×24px | 20×20px |
| small | 32×16px | 12×12px |

加载状态保留当前选中外观，不响应点击与键盘切换，并从 Tab 顺序中移除。
