const applicable = (reason, checks) => ({
  applicability: "applicable",
  reason,
  checks,
});

const notApplicable = (reason) => ({
  applicability: "not-applicable",
  reason,
  checks: [],
});

export const THEME_RUNTIME_MATRIX = {
  button: {
    portal: false,
    brand: applicable(
      "Primary Button default consumes the primary brand alias while hover remains an independently addressable palette step.",
      ["brand-default", "brand-hover-independent"],
    ),
    localTheme: applicable(
      "Button remains in the themed DOM subtree, so a component-token override should stay locally scoped.",
      ["local-component-token", "sibling-isolation"],
    ),
    density: applicable(
      "Button height is a density-sensitive component token; a local Map-token override is also checked for non-propagation.",
      ["component-density", "map-density-non-propagation"],
    ),
  },
  input: {
    portal: false,
    brand: applicable(
      "Input focus border consumes the primary brand alias.",
      ["brand-focus"],
    ),
    localTheme: applicable(
      "Input remains in the themed DOM subtree and supports a local component-token border override.",
      ["local-component-token", "sibling-isolation"],
    ),
    density: applicable(
      "Input control height is density-sensitive and must be overridden through its component token.",
      ["component-density", "map-density-non-propagation"],
    ),
  },
  select: {
    portal: true,
    brand: applicable(
      "Select focus border consumes the primary brand alias.",
      ["brand-focus"],
    ),
    localTheme: applicable(
      "The Select control stays local, while its popup crosses a Portal boundary and requires a root or portal-host override.",
      ["local-control-token", "portal-local-boundary", "portal-root-token"],
    ),
    density: applicable(
      "Select control and popup option geometry are density-sensitive component tokens on opposite sides of the Portal boundary.",
      ["component-density", "map-density-non-propagation", "portal-density"],
    ),
  },
  modal: {
    portal: true,
    brand: notApplicable(
      "Modal has no direct brand-color component token; branded footer actions belong to the Button contract.",
    ),
    localTheme: applicable(
      "Modal content is rendered through a Portal, so trigger-subtree variables do not reach the dialog without a root or portal-host bridge.",
      ["portal-local-boundary", "portal-root-token"],
    ),
    density: applicable(
      "Modal body padding is density-sensitive, and Portal placement determines where the override must live.",
      ["portal-density"],
    ),
  },
  table: {
    portal: false,
    brand: notApplicable(
      "Table has no direct primary-brand anchor in its current component-token namespace.",
    ),
    localTheme: applicable(
      "Table remains in the themed DOM subtree and exposes local surface component tokens.",
      ["local-component-token"],
    ),
    density: applicable(
      "Table cell padding is density-sensitive and can be scoped through component tokens.",
      ["component-density"],
    ),
  },
  tooltip: {
    portal: true,
    brand: notApplicable(
      "Tooltip uses neutral explanatory surfaces and has no direct primary-brand token.",
    ),
    localTheme: applicable(
      "Tooltip popup crosses a Portal boundary; trigger-local variables do not reach it, while root or portal-host variables do.",
      ["portal-local-boundary", "portal-root-token"],
    ),
    density: applicable(
      "Tooltip inline padding is density-sensitive and must be applied where the Portal popup inherits it.",
      ["portal-density"],
    ),
  },
  popover: {
    portal: true,
    brand: notApplicable(
      "Popover uses neutral content surfaces and has no direct primary-brand token.",
    ),
    localTheme: applicable(
      "Popover popup crosses a Portal boundary; trigger-local variables do not reach it, while root or portal-host variables do.",
      ["portal-local-boundary", "portal-root-token"],
    ),
    density: applicable(
      "Popover padding is density-sensitive and must be applied where the Portal popup inherits it.",
      ["portal-density"],
    ),
  },
  dropdown: {
    portal: false,
    brand: applicable(
      "Dropdown Button loading state consumes the primary brand token.",
      ["brand-loading"],
    ),
    localTheme: applicable(
      "Dropdown popup remains inside its component subtree, so component-token overrides can remain locally scoped.",
      ["local-component-token"],
    ),
    density: applicable(
      "Dropdown item minimum height is a density-sensitive component token.",
      ["component-density"],
    ),
  },
};
