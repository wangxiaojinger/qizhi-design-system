# Responsive layout contract

Generated pages must preserve document flow, remain vertically scrollable, and let Chinese and English content determine component height.

## Root scrolling architecture

- The document is the vertical scroll container. Use content-driven height and `min-height` for the platform shell; do not give `html`, `body`, `#root`, the page shell, or the main content a fixed viewport height combined with hidden vertical overflow.
- Do not apply `overflow-x: hidden` to `html`, `body`, or `#root`. In browsers this can change root overflow-axis computation and leave `scrollHeight > clientHeight` while wheel scrolling does not change `scrollY`.
- Fix horizontal overflow at the element that causes it. When a final defensive boundary is necessary, scope `overflow-x: clip` to the narrowest non-scrolling page wrapper and verify that overlays are not clipped.
- Hiding the scrollbar must not disable scrolling. Verify wheel, trackpad-equivalent, keyboard, and programmatic scroll paths; a visually absent scrollbar is not proof that scrolling works.

## Content-driven sizing

- Treat English as the minimum-content stress case. Brand names, navigation labels, buttons, filters, cards, status text, and action copy must not inherit widths or heights tuned only for Chinese.
- Prefer `width: auto`, `min-width`, `minmax(0, 1fr)`, `min-width: 0`, flex wrapping, and `min-height`. Do not use a fixed height on containers whose localized text can wrap.
- Allow business sentences to wrap through normal line flow. For unbroken identifiers or long words use `overflow-wrap: anywhere` on the content owner. Do not use clipping, ellipsis, or hidden overflow to conceal untranslated or oversized copy unless the public component API explicitly defines truncation.
- A responsive card passes only when its own `clientWidth >= scrollWidth` and `clientHeight >= scrollHeight` in both locales. Check direct children too; a fitting outer container does not prove its content fits.

## Public component boundary

- Page CSS owns page layout only. It must not select `.qizhi-*__*` internals to remove dividers, force widths, or repair localized text.
- Use a documented public component prop for a component-owned visual behavior. Example: use `Tabs showDivider={false}` to remove the navigation divider while retaining the line-type active indicator.
- If the required public prop is absent, report `capability_gap` or extend the QIZHI component with implementation, types, exports, API data, Demo source, tests, and build synchronization before consuming it. A page-local private selector is not an acceptable shortcut.

## Required browser matrix

Verify Chinese and English at 1440, 1024, and 375 pixels. Also check both sides of layout breakpoints used by the page; for the QIZHI platform shell this includes 1199 and 1200 pixels.

For every viewport and locale record:

- `document.documentElement.scrollWidth <= clientWidth`;
- when content exceeds the viewport, `scrollHeight > clientHeight` and a real wheel action increases `scrollY`;
- localized brand and key content containers satisfy `scrollWidth <= clientWidth` and `scrollHeight <= clientHeight`;
- fixed/sticky navigation remains visible after scrolling;
- no card overlap, clipped text, inaccessible language control, or new console error.

Capture and inspect the initial viewport plus one scrolled state. Automated geometry is `candidate_pass`; independent visual verification remains `pending`.
