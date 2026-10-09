export const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export const isTabbable = (element: HTMLElement) => {
  if (element.hidden || element.closest("[hidden], [inert]")) return false;
  if (element instanceof HTMLInputElement && element.type === "hidden") return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
};

export const getTabbableElements = (container: HTMLElement) => (
  [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(isTabbable)
);
