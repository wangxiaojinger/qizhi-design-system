import { useEffect, useRef, useState } from "react";
import type { ChartFocusProps, FocusedItem } from "./Chart.types";
import { resolveFocus, sameFocus } from "./chartFocus";

export function useChartFocus({ focusable = false, focusedItem, defaultFocusedItem = null, onFocusChange }: ChartFocusProps, items: readonly FocusedItem[]) {
  const [internal, setInternal] = useState<FocusedItem | null>(() => resolveFocus(defaultFocusedItem, items));
  const controlled = focusedItem !== undefined;
  const selected = controlled ? focusedItem : internal;
  const resolved = resolveFocus(selected, items);
  const callback = useRef(onFocusChange); callback.current = onFocusChange;
  useEffect(() => {
    if (!controlled && internal && !resolved) { setInternal(null); if (focusable) callback.current?.(null); }
  }, [controlled, internal, resolved, focusable]);
  const change = (next: FocusedItem | null) => {
    if (!focusable || sameFocus(resolved, next)) return;
    if (!controlled) setInternal(next);
    callback.current?.(next);
  };
  return {
    focusedItem: focusable ? resolved : null,
    handleItemClick: (item: FocusedItem) => { const target = resolveFocus(item, items); if (target) change(sameFocus(resolved, target) ? null : target); },
    clearFocus: () => change(null),
    isFocused: (item: FocusedItem) => focusable && sameFocus(resolved, item),
  };
}
