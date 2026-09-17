# QIZHI Upload React Contract v1

## Scope

- Preserve all eight legacy Upload demos in their exact title, description, order,
  initial data, copy, layout intent, state, and interaction.
- Add a public `Upload` and the minimal public `Modal` required by confirmation and
  crop demos. Reuse public `Button`, `Slider`, and QIZHI icons.
- Demo rendering, displayed TSX, copied TSX, types, and API documentation share one
  source of truth.
- Do not implement network transport defaults, image preview, Message, server response
  parsing, or APIs without legacy evidence.

## Mandatory prevention gates

1. Reuse the complete React Demo contract, including container classes, 12px preview
   spacing, action layout, and responsive behavior.
2. Assert visual effects with computed styles and coordinates, not state/classes alone.
3. Measure parent and adjacent boxes, margin, padding, width, height, and overflow.
4. Demos must not recreate public controls, icons, Upload lists, progress, or Modal.
5. Exercise selection, drag, rejection, confirm/cancel, removal, retry, limit recovery,
   crop, Escape, hover, and focus restoration.
6. Runtime UI, formatted source, highlighted source, and clipboard text remain identical.
7. Search every Upload consumer and compound scenario before completion.
8. Completion requires 1440/1024/375 screenshots inspected together with computed style,
   coordinates, console output, clipping ancestors, and overflow.

## Public contracts

- `UploadFile`: `uid`, `name`, `status`, optional `percent`, `url`, `originFile`, and
  `relativePath`.
- `Upload`: controlled/uncontrolled lists, `beforeUpload`, `onRemove`, `onReupload`,
  `accept`, `multiple`, `disabled`, `limit`, `directory`, `drag`, `listType`,
  `showUploadList`, `customRequest`, `children`, standard styling/ARIA, and ref methods.
- The default `drag` trigger renders the public linear interaction `UploadIcon` at
  `48px`; custom `children` still replace the complete trigger content.
- `Modal`: open state, title/content, cancel/confirm actions, width, mask/Escape close,
  focus containment, and focus restoration.
