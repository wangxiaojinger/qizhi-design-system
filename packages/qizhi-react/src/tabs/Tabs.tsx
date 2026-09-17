import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import { Button } from "../button/Button";
import { ArrowDownIcon } from "../icon/generated/ArrowDownIcon";
import { ArrowLeftIcon } from "../icon/generated/ArrowLeftIcon";
import { ArrowRightIcon } from "../icon/generated/ArrowRightIcon";
import { ArrowUpIcon } from "../icon/generated/ArrowUpIcon";
import type { TabsKey, TabsProps } from "./Tabs.types";

const joinClassNames = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

const firstEnabledKey = (items: TabsProps["items"]) =>
  items.find((item) => !item.disabled)?.key;

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    activeKey,
    defaultActiveKey,
    onChange,
    type = "line",
    position = "top",
    size = "default",
    scrollPosition = "auto",
    renderContent = true,
    showDivider = true,
    className,
    ...rootProps
  },
  ref,
) {
  const generatedId = useId().replace(/:/g, "");
  const isControlled = activeKey !== undefined;
  const [internalKey, setInternalKey] = useState<TabsKey | undefined>(
    defaultActiveKey ?? firstEnabledKey(items),
  );
  const currentKey = isControlled ? activeKey : internalKey;
  const tabsRef = useRef(new Map<TabsKey, HTMLButtonElement>());
  const trackRef = useRef<HTMLDivElement>(null);
  const vertical = position !== "top";
  const activeItem = items.find((item) => item.key === currentKey)
    ?? items.find((item) => !item.disabled);

  useEffect(() => {
    if (isControlled || items.some((item) => item.key === internalKey)) return;
    setInternalKey(firstEnabledKey(items));
  }, [internalKey, isControlled, items]);

  const enabledItems = useMemo(
    () => items.filter((item) => !item.disabled),
    [items],
  );

  const select = (key: TabsKey) => {
    const item = items.find((candidate) => candidate.key === key);
    if (!item || item.disabled) return;
    if (!isControlled) setInternalKey(key);
    onChange?.(key);
  };

  const scrollActiveIntoView = (key: TabsKey) => {
    const tab = tabsRef.current.get(key);
    if (!tab) return;
    const block = vertical ? scrollPosition : "nearest";
    const inline = vertical ? "nearest" : scrollPosition;
    if (typeof tab.scrollIntoView !== "function") return;
    tab.scrollIntoView({
      behavior: "smooth",
      block: block === "auto" ? "nearest" : block,
      inline: inline === "auto" ? "nearest" : inline,
    });
  };

  const move = (event: KeyboardEvent<HTMLButtonElement>, direction: number) => {
    if (!enabledItems.length) return;
    const index = enabledItems.findIndex((item) => item.key === currentKey);
    const next = enabledItems[
      (Math.max(0, index) + direction + enabledItems.length)
      % enabledItems.length
    ];
    if (!next) return;
    event.preventDefault();
    select(next.key);
    tabsRef.current.get(next.key)?.focus();
    scrollActiveIntoView(next.key);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    key: TabsKey,
  ) => {
    if ((!vertical && event.key === "ArrowRight")
      || (vertical && event.key === "ArrowDown")) move(event, 1);
    if ((!vertical && event.key === "ArrowLeft")
      || (vertical && event.key === "ArrowUp")) move(event, -1);
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home"
        ? enabledItems[0]
        : enabledItems[enabledItems.length - 1];
      if (next) {
        select(next.key);
        tabsRef.current.get(next.key)?.focus();
      }
    }
    if ((event.key === "Enter" || event.key === " ") && key !== currentKey) {
      event.preventDefault();
      select(key);
    }
  };

  const scrollByStep = (direction: number) => {
    trackRef.current?.scrollBy(vertical
      ? { top: direction * 72, behavior: "smooth" }
      : { left: direction * 72, behavior: "smooth" });
  };

  return (
    <div
      {...rootProps}
      ref={ref}
      className={joinClassNames(
        "qizhi-tabs",
        `qizhi-tabs--${type}`,
        `qizhi-tabs--${position}`,
        `qizhi-tabs--${size}`,
        vertical && "qizhi-tabs--vertical",
        !showDivider && "qizhi-tabs--no-divider",
        className,
      )}
    >
      <div className="qizhi-tabs__nav-wrap">
        <Button
          type="text"
          size="small"
          iconOnly
          icon={vertical ? <ArrowUpIcon /> : <ArrowLeftIcon />}
          className="qizhi-tabs__scroll-button"
          aria-label={vertical ? "向上滚动页签" : "向左滚动页签"}
          onClick={() => scrollByStep(-1)}
        />
        <div
          ref={trackRef}
          className="qizhi-tabs__nav-scroll"
          role="tablist"
          aria-orientation={vertical ? "vertical" : "horizontal"}
        >
          {items.map((item) => {
            const selected = item.key === activeItem?.key;
            const tabId = `qizhi-tabs-${generatedId}-tab-${item.key}`;
            const panelId = item.panelId
              ?? `qizhi-tabs-${generatedId}-panel-${item.key}`;
            return (
              <div
                className={joinClassNames(
                  "qizhi-tabs__tab-wrap",
                  selected && "is-active",
                )}
                key={item.key}
              >
                <button
                  ref={(node) => {
                    if (node) tabsRef.current.set(item.key, node);
                    else tabsRef.current.delete(item.key);
                  }}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={renderContent || item.panelId ? panelId : undefined}
                  disabled={item.disabled}
                  tabIndex={selected ? 0 : -1}
                  className={joinClassNames(
                    "qizhi-tabs__tab",
                    selected && "is-active",
                  )}
                  onClick={() => {
                    select(item.key);
                    scrollActiveIntoView(item.key);
                  }}
                  onKeyDown={(event) => handleKeyDown(event, item.key)}
                >
                  <span className="qizhi-tabs__tab-label">{item.title}</span>
                </button>
              </div>
            );
          })}
        </div>
        <Button
          type="text"
          size="small"
          iconOnly
          icon={vertical ? <ArrowDownIcon /> : <ArrowRightIcon />}
          className="qizhi-tabs__scroll-button"
          aria-label={vertical ? "向下滚动页签" : "向右滚动页签"}
          onClick={() => scrollByStep(1)}
        />
      </div>
      {renderContent ? items.map((item) => {
        const selected = item.key === activeItem?.key;
        return (
          <div
            key={item.key}
            id={item.panelId ?? `qizhi-tabs-${generatedId}-panel-${item.key}`}
            className="qizhi-tabs__content"
            role="tabpanel"
            aria-labelledby={`qizhi-tabs-${generatedId}-tab-${item.key}`}
            tabIndex={selected ? 0 : -1}
            hidden={!selected}
          >
            {item.content}
          </div>
        );
      }) : null}
    </div>
  );
});
