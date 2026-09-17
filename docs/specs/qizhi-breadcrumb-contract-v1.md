# QIZHI Breadcrumb React Contract v1

## Source boundary

- Source page: `index.html#component-breadcrumb`.
- Preserve the two legacy demos in their original order.
- Preserve every title, description, label, item, link, size, layout, initial
  state, and interaction. Do not add a separator-icon demo: the legacy prose
  mentions icon separators, but both rendered demos use `/`.
- `HomeIcon` uses the official Remix Icon v4.7.0 `home-4-line.svg` path.

## Public API

```ts
export type BreadcrumbSize = "default" | "small";

export interface BreadcrumbProps
  extends ComponentPropsWithoutRef<"nav"> {
  size?: BreadcrumbSize;
  separator?: ReactNode;
  children?: ReactNode;
}

export interface BreadcrumbItemProps
  extends Omit<ComponentPropsWithoutRef<"li">, "children"> {
  href?: string;
  current?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}
```

`Breadcrumb` also exposes `Breadcrumb.Item`. The root forwards a
`HTMLDivElement`-independent `HTMLElement` nav ref. `Breadcrumb.Item` forwards
an `HTMLLIElement` ref. Native nav and list-item attributes remain available.

## Runtime semantics

- Root element: semantic `nav` containing one `ol`.
- Default `size`: `default`; default `separator`: `/`.
- Separators are inserted between direct `Breadcrumb.Item` children and are
  always `aria-hidden="true"`.
- `href` renders the existing public QIZHI `Link`.
- `current` sets `aria-current="page"` on the item and does not imply a link.
- `icon` is decorative inside an item; accessible naming belongs to the item.
- Default: `14px/22px`; small: `12px/20px`; separator inline margins: `8px`.
- The list wraps when the available width is insufficient.

## Legacy demos

1. `基础用法`
   - Description: `适用于广泛基本用法。分隔方式分为图标分隔及斜线分隔两种方式，可根据不同场景使用。`
   - Label: `基础面包屑`.
   - Items: plain `首页`, linked `频道` to `#components-navigation`, current
     `消息`; slash separators.
2. `自定义图标`
   - Description: `可以在内容中使用自定义图标。`
   - Two breadcrumbs in one wrapping row with `40px` horizontal and `24px`
     vertical gap.
   - Labels: `带图标的面包屑`, `小尺寸带图标的面包屑`.
   - Items: decorative public `HomeIcon` named by item `首页`, plain `频道`,
     current `消息`; slash separators.

## Documentation and acceptance

- Demo TSX is the only preview/display/copy source.
- Use the shared `qizhi-react-demo-codebox` shell and QIZHI action controls.
- Demo TSX contains no native interactive element, self-authored SVG, inline
  layout style, or selector targeting another component's private `__*` node.
- Lock 1440, 1024, and 375 geometry, hover/focus/link navigation, wrapping,
  displayed/copied source equality, overflow, and console state.
- Automated acceptance is at most `candidate_pass`; independent acceptance
  remains `pending`.
