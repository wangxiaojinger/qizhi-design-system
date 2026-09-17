# QIZHI Notification Contract v1

## Legacy evidence

- Preserve 7 demos and 19 triggers in this order: 基础用法、不同类型的通知、更新通知内容、更新延迟、自定义操作按钮、自定义图标、Hooks 用法。
- Preserve every legacy title, description, label, message, delay and initial state verbatim.
- Default placement is top right. The layer is 360px wide, 80px from the top and 24px from the right; at 375px it is viewport minus 32px, 72px from the top and 16px from the right.
- Default duration is 4500ms. `duration: 0` does not close automatically. Updating the same `id` keeps the same node and restarts its timer.
- Notification cards use 16px padding, 24px icon and close columns, 12px column gap and 16px stack gap.

## Public API

- Export `Notification`, `useNotification` and their public TypeScript types from `@wangxiaojinger/qizhi-react`.
- Support `info`, `success`, `warning`, `error` and `normal` methods plus `remove`, `clear` and `config`.
- `NotificationConfig` supports `title`, `content`, `duration`, `position`, `closable`, `showIcon`, `id`, `btn`, `icon`, `closeIcon`, `className`, `style` and `onClose`.
- `NotificationGlobalConfig` supports `maxCount`, `duration` and `getContainer`.
- Positions are `topLeft`, `topRight`, `bottomLeft` and `bottomRight`; demos preserve the legacy top-right placement.
- Static and hook APIs use the same renderer, timer, id-update and close behavior.

## Reuse and ownership

- Reuse public QIZHI Button, Space and Icon components. Demo TSX must not render raw button/input/select/table controls or `ri-*` icons.
- Reuse the proven Message controller lifecycle where practical without changing Message's public contract.
- Notification owns its DOM, classes, timers, positioning and ARIA contract. Demo CSS may only own demo layout.
- The formatted Demo TSX files are the single source for preview, displayed source and copied source.

## Verification

- Unit tests lock id update, timer reset, action buttons, hook holder, remove, clear, maxCount, onClose and all five types.
- Docs tests lock 7 demos, 19 triggers, exact titles/descriptions and public-component-only source.
- Browser tests cover 1440, 1024 and 375 with real interaction, computed box model, coordinates, hover/focus, screenshots, clipboard equality and no overflow.
- Execution status can reach `candidate_pass`; independent final acceptance remains `pending`.
