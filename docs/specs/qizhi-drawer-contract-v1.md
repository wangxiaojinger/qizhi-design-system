# QIZHI Drawer React Contract v1

## Scope

- Preserve the two legacy Drawer demos in exact title, description, order, copy,
  initial data, disabled state, dimensions, layout, and evidenced interactions.
- Add a public `Drawer`; reuse public `Button`, `Form`, `Input`, `Select`, `Switch`,
  `Radio`, and QIZHI icons.
- Demo rendering, formatted TSX, highlighted TSX, copied TSX, types, and API docs
  share one source of truth.
- Keep the unrelated detail-page version drawer on its current legacy runtime and
  verify it as a consumer regression.

## Legacy demo contracts

1. `基础用法` — `基础抽屉，点击触发按钮抽屉从右侧滑出，点击遮罩区关闭。`
   Closed initially; width 760px; title `基础信息`; two identical body paragraphs;
   footer `取消` and `确定`.
2. `抽屉表单` — `在抽屉中承载创建表单，适合不中断主流程的复杂配置。`
   Closed initially; width 960px; title `新建交互式建模`; three exact form
   sections; footer `取 消` and `新 建`.

At widths up to 640px both drawers use 100vw. Mask, close button, footer close,
and Escape close the drawer and restore focus. Opening focuses the close button and
locks document scrolling.

## Public contract

- `DrawerProps`: controlled `open`, `title`, `children`, optional `footer`, `width`,
  `closable`, `maskClosable`, `escToClose`, `onClose`, `className`, and `style`.
- `width` defaults to 760. The v1 placement is right only.
- Drawer owns Portal rendering, mask, transition state, body scroll locking, focus
  containment, and focus restoration.
- Do not add placement variants, async submit, nested drawers, or other APIs without
  legacy evidence.

## Mandatory prevention gates

1. Reuse the complete codebox, action layout, spacing, and responsive contract.
2. Assert real transform, coordinates, and visual state rather than state alone.
3. Measure Drawer, mask, viewport, body, form sections, adjacent controls, and overflow.
4. Demos must not recreate Drawer, form controls, icons, or code actions.
5. Exercise mask, close, footer, Escape, focus, Select Portal, disabled controls,
   Radio, Switch, and scroll paths.
6. Runtime UI, formatted source, highlighted source, and clipboard text stay identical.
7. Search and regress every Drawer consumer, including the detail version drawer.
8. Completion requires 1440/1024/375 computed styles, actual coordinates, console
   checks, and inspected screenshots.
