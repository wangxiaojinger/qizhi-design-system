import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import type {
  MenuComponent,
  MenuGroupProps,
  MenuItemProps,
  MenuMode,
  MenuProps,
} from "./Menu.types";
import "./menu.css";

interface MenuContextValue {
  mode: MenuMode;
  selectedKey?: string;
  tabStopKey?: string;
  select: (key: string) => void;
  moveFocus: (
    event: KeyboardEvent<HTMLButtonElement>,
    destination: "first" | "last" | "next" | "previous",
  ) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

const joinClassNames = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

const MenuRoot = forwardRef<HTMLDivElement, MenuProps>(function MenuRoot(
  {
    mode = "vertical",
    selectedKey,
    defaultSelectedKey,
    onSelect,
    className,
    children,
    ...rootProps
  },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const controlled = selectedKey !== undefined;
  const [internalSelectedKey, setInternalSelectedKey] = useState(
    defaultSelectedKey,
  );
  const currentSelectedKey = controlled ? selectedKey : internalSelectedKey;
  const [tabStopKey, setTabStopKey] = useState(currentSelectedKey);

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const getEnabledItems = () => {
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(
      root.querySelectorAll<HTMLButtonElement>(".qizhi-menu__item:not(:disabled)"),
    ).filter((item) => {
      if (item.closest(".qizhi-menu") !== root) return false;
      const style = window.getComputedStyle(item);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  };

  const moveFocus: MenuContextValue["moveFocus"] = (event, destination) => {
    const items = getEnabledItems();
    if (!items.length) return;
    const currentIndex = items.indexOf(event.currentTarget);
    let nextIndex = currentIndex;
    if (destination === "first") nextIndex = 0;
    if (destination === "last") nextIndex = items.length - 1;
    if (destination === "next") {
      nextIndex = (Math.max(0, currentIndex) + 1) % items.length;
    }
    if (destination === "previous") {
      nextIndex = (Math.max(0, currentIndex) - 1 + items.length) % items.length;
    }
    event.preventDefault();
    setTabStopKey(items[nextIndex]?.dataset.menuItemKey);
    items[nextIndex]?.focus();
  };

  const select = (key: string) => {
    setTabStopKey(key);
    if (!controlled) setInternalSelectedKey(key);
    onSelect?.(key);
  };

  useLayoutEffect(() => {
    const items = getEnabledItems();
    if (!items.length) return;
    const selectedItem = items.find((item) => (
      item.dataset.menuItemKey === currentSelectedKey
    ));
    const currentItem = items.find((item) => (
      item.dataset.menuItemKey === tabStopKey
    ));
    const nextKey = currentItem?.dataset.menuItemKey
      ?? selectedItem?.dataset.menuItemKey
      ?? items[0]?.dataset.menuItemKey;
    if (nextKey !== tabStopKey) setTabStopKey(nextKey);
  });

  useEffect(() => {
    const reconcileVisibleTabStop = () => {
      const items = getEnabledItems();
      if (!items.length) return;
      const currentVisible = items.some((item) => (
        item.dataset.menuItemKey === tabStopKey
      ));
      if (!currentVisible) setTabStopKey(items[0]?.dataset.menuItemKey);
    };
    window.addEventListener("resize", reconcileVisibleTabStop);
    return () => window.removeEventListener("resize", reconcileVisibleTabStop);
  }, [tabStopKey]);

  return (
    <MenuContext.Provider
      value={{
        mode,
        selectedKey: currentSelectedKey,
        tabStopKey,
        select,
        moveFocus,
      }}
    >
      <div
        {...rootProps}
        ref={setRootRef}
        role={mode === "horizontal" ? "menubar" : "menu"}
        aria-orientation={mode}
        className={joinClassNames(
          "qizhi-menu",
          `qizhi-menu--${mode}`,
          className,
        )}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
});

function MenuItem({
  itemKey,
  icon,
  disabled = false,
  className,
  children,
  onClick,
  onKeyDown,
  ...buttonProps
}: MenuItemProps) {
  const menu = useContext(MenuContext);
  if (!menu) throw new Error("Menu.Item must be rendered inside Menu");
  const selected = menu.selectedKey === itemKey;

  const handleKeyDown: MenuItemProps["onKeyDown"] = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Home") menu.moveFocus(event, "first");
    if (event.key === "End") menu.moveFocus(event, "last");
    if (
      (menu.mode === "horizontal" && event.key === "ArrowRight")
      || (menu.mode === "vertical" && event.key === "ArrowDown")
    ) {
      menu.moveFocus(event, "next");
    }
    if (
      (menu.mode === "horizontal" && event.key === "ArrowLeft")
      || (menu.mode === "vertical" && event.key === "ArrowUp")
    ) {
      menu.moveFocus(event, "previous");
    }
  };

  return (
    <button
      {...buttonProps}
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-current={selected ? "page" : undefined}
      data-menu-item-key={itemKey}
      tabIndex={menu.tabStopKey === itemKey ? 0 : -1}
      className={joinClassNames(
        "qizhi-menu__item",
        selected && "is-selected",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) menu.select(itemKey);
      }}
      onKeyDown={handleKeyDown}
    >
      {icon != null && (
        <span className="qizhi-menu__item-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="qizhi-menu__item-label">{children}</span>
    </button>
  );
}

function MenuGroup({ title, className, children, ...groupProps }: MenuGroupProps) {
  const titleId = `qizhi-menu-group-${useId().replace(/:/g, "")}`;
  return (
    <div
      {...groupProps}
      role="group"
      aria-labelledby={titleId}
      className={joinClassNames("qizhi-menu__group", className)}
    >
      <div id={titleId} className="qizhi-menu__group-title">
        {title}
      </div>
      {children}
    </div>
  );
}

export const Menu = Object.assign(MenuRoot, {
  Item: MenuItem,
  Group: MenuGroup,
}) as MenuComponent;
