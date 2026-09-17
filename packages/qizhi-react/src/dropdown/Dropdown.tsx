import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent, ReactElement } from "react";
import { Button } from "../button/Button";
import { ChevronDownIcon, ChevronRightIcon, LoadingIcon } from "../icon";
import type { DropdownButtonProps, DropdownComponent, DropdownItemProps, DropdownMenuProps, DropdownProps, DropdownSubMenuProps } from "./Dropdown.types";

const joinClassName = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const DropdownContext = createContext<{ close: (restore?: boolean) => void } | null>(null);
const MenuContext = createContext<DropdownMenuProps["onClickMenuItem"]>(undefined);

function DropdownRoot({ children, droplist, position = "bl", trigger = "hover", popupVisible, defaultPopupVisible = false, onVisibleChange, className }: DropdownProps) {
  const controlled = popupVisible !== undefined;
  const [innerVisible, setInnerVisible] = useState(defaultPopupVisible);
  const visible = controlled ? popupVisible : innerVisible;
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const focusFirstItemRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const popupId = `qizhi-dropdown-${useId().replace(/:/g, "")}`;
  const setVisible = (next: boolean) => {
    if (next === visible) return;
    if (!controlled) setInnerVisible(next);
    onVisibleChange?.(next);
  };
  const close = (restore = false) => {
    setVisible(false);
    if (restore) window.setTimeout(() => triggerRef.current?.focus(), 0);
  };
  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      close(false);
    }, 100);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener("mousedown", handlePointerDown as EventListener);
    return () => document.removeEventListener("mousedown", handlePointerDown as EventListener);
  });

  useEffect(() => {
    if (!visible || !focusFirstItemRef.current) return;
    focusFirstItemRef.current = false;
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [visible]);

  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child)) throw new Error("Dropdown requires one valid trigger element");
  const originalClick = child.props.onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalKeyDown = child.props.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined;
  const triggerUnavailable = child.props.disabled === true || child.props["aria-disabled"] === true;
  const triggerNode = cloneElement(child, {
    className: joinClassName(child.props.className as string | undefined, "qizhi-dropdown__trigger"),
    ref: (node: HTMLElement | null) => { triggerRef.current = node; const ref = (child as ReactElement & { ref?: unknown }).ref; if (typeof ref === "function") ref(node); else if (ref && typeof ref === "object" && "current" in ref) (ref as { current: HTMLElement | null }).current = node; },
    "aria-haspopup": "menu",
    "aria-expanded": visible,
    "aria-controls": popupId,
    onClick: (event: MouseEvent<HTMLElement>) => { originalClick?.(event); if (!triggerUnavailable && trigger === "click") setVisible(!visible); },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      originalKeyDown?.(event);
      if (!triggerUnavailable && event.key === "ArrowDown") { event.preventDefault(); focusFirstItemRef.current = true; setVisible(true); }
    },
  });

  const handleFocusOut = (event: FocusEvent<HTMLSpanElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) close(false); };
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => { if (event.key === "Escape") { event.preventDefault(); close(true); } };
  return <span ref={rootRef} className={joinClassName("qizhi-dropdown", `qizhi-dropdown--${position}`, visible && "is-open", className)} onMouseEnter={() => { if (trigger === "hover") { clearCloseTimer(); setVisible(true); } }} onMouseLeave={() => { if (trigger === "hover" && !rootRef.current?.contains(document.activeElement)) scheduleClose(); }} onFocus={() => { if (trigger === "hover") { clearCloseTimer(); setVisible(true); } }} onBlur={handleFocusOut} onKeyDown={handleKeyDown}>{triggerNode}<DropdownContext.Provider value={{ close }}><div id={popupId} className="qizhi-dropdown__popup" hidden={!visible}>{droplist}</div></DropdownContext.Provider></span>;
}

function DropdownMenu({ children, className, onClickMenuItem, role = "menu", ...rest }: DropdownMenuProps) {
  return <MenuContext.Provider value={onClickMenuItem}><div {...rest} className={joinClassName("qizhi-dropdown__menu", className)} role={role}>{children}</div></MenuContext.Provider>;
}

function DropdownItem({ itemKey, icon, className, children, onClick, role = "menuitem", ...rest }: DropdownItemProps) {
  const dropdown = useContext(DropdownContext);
  const onClickMenuItem = useContext(MenuContext);
  return <button {...rest} className={joinClassName("qizhi-dropdown__item", icon != null && "qizhi-dropdown__item--icon", className)} type="button" role={role} onClick={(event) => { onClick?.(event); onClickMenuItem?.(itemKey, event); dropdown?.close(true); }}>{icon}{children}</button>;
}

function DropdownSubMenu({ itemKey, title, children, className }: DropdownSubMenuProps) {
  const [expanded, setExpanded] = useState(false);
  const id = `qizhi-submenu-${useId().replace(/:/g, "")}`;
  return <div className={joinClassName("qizhi-dropdown__submenu", className)} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)} onFocus={() => setExpanded(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}><button className="qizhi-dropdown__item qizhi-dropdown__submenu-trigger" type="button" role="menuitem" data-item-key={itemKey} aria-haspopup="menu" aria-expanded={expanded} aria-controls={id}><span>{title}</span><ChevronRightIcon /></button><div id={id} className="qizhi-dropdown__popup qizhi-dropdown__submenu-popup" role="menu">{children}</div></div>;
}

function DropdownButton({ children, droplist, type = "secondary", position = "br", disabled = false, loading = false, onClick, toggleIcon, "aria-label": ariaLabel }: DropdownButtonProps) {
  return <span className={joinClassName("qizhi-dropdown-button", disabled && "qizhi-dropdown-button--disabled", loading && "qizhi-dropdown-button--loading")}><Button type={type} disabled={disabled} className="qizhi-dropdown-button__action" onClick={onClick}>{children}</Button><Dropdown trigger="click" position={position} droplist={droplist}><Button type={type} disabled={disabled} className={joinClassName("qizhi-dropdown__trigger", "qizhi-dropdown-button__toggle", loading && "qizhi-dropdown-button__loading-toggle")} aria-label={loading ? "正在加载" : disabled ? "发布菜单已禁用" : (ariaLabel ?? "打开发布菜单")} aria-disabled={loading || undefined} icon={loading ? <LoadingIcon className="qizhi-dropdown-button__loading-icon" /> : (toggleIcon ?? <ChevronDownIcon />)} /></Dropdown></span>;
}

export const Dropdown = Object.assign(DropdownRoot, { Menu: DropdownMenu, Item: DropdownItem, SubMenu: DropdownSubMenu, Button: DropdownButton }) as DropdownComponent;
