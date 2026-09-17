# QIZHI TreeSelect v1 Contract

## Evidence boundary

- Legacy source: `index.html`, `styles.css`, and `initTreeSelectDemos` in
  `script.js`.
- Confirmed Demo count: 10.
- Default width: 300px.
- Confirmed sizes: default 32px, large 36px, huge 40px.
- Popup semantics: `tree/treeitem`, not `menu/menuitem` or
  `listbox/option`.

## Reuse boundary

- Visual boundary: internal `qizhi-control-container`.
- Multiple selection: public `Checkbox` and `Tag`.
- Icons: `CloseIcon`, `ChevronDownIcon`, `ChevronRightIcon`, `SearchIcon`,
  and `LoadingIcon`.
- Size Demo: docs-only `DemoSegmentedControl`.
- `Dropdown.Menu` is not used because its menu semantics are incorrect for a
  tree popup.

## Implemented API scope

- Data: `treeData`, `TreeSelectOption`, `defaultExpandedKeys`.
- Value: single/multiple `value`, `defaultValue`, `onChange`,
  `labelInValue`.
- Display: `placeholder`, `renderFormat`, `addBefore`, `size`, `status`.
- Interaction: `allowClear`, `showSearch`, `filterTreeNode`, `onSearch`,
  `loadMore`, controlled/uncontrolled `open`, and keyboard close/open.
- Native integration: `id`, `name`, `className`, `style`, `aria-label`, and
  `aria-labelledby`.

No unimplemented Arco TreeSelect API is documented or exported.
