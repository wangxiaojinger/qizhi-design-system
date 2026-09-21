import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../button/Button";
import { Divider } from "../divider/Divider";
import { Dropdown } from "../dropdown/Dropdown";
import { ChevronDownIcon } from "../icon/ChevronDownIcon";
import { MoreIcon } from "../icon/generated/catalog/MoreIcon";
import { ProfileFilledIcon } from "../icon/generated/catalog/ProfileFilledIcon";
import { Menu } from "../menu/Menu";
import { useLocale } from "../locale/LocaleProvider";
import type { QizhiLocale } from "../locale/LocaleProvider.types";
import exploreIcon from "./assets/explore.svg";
import helpIcon from "./assets/help.svg";
import "./topNavigation.css";
import internetIcon from "./assets/internet.svg";
import locationIcon from "./assets/location.svg";
import operationsIcon from "./assets/operations-center.svg";
import qizhiLogo from "./assets/qizhi-logo.svg";
import type {
  TopNavigationItem,
  TopNavigationOption,
  TopNavigationProps,
} from "./TopNavigation.types";

const getDefaultItems = (t: (key: string) => string): readonly TopNavigationItem[] => [
  { key: "workbench", label: t("navigation.workbench"), group: "primary" },
  { key: "custom-model", label: t("navigation.customModel"), group: "primary" },
  { key: "model-service", label: t("navigation.modelService"), group: "primary" },
  { key: "agent", label: "Agent", group: "primary" },
  {
    key: "explore",
    label: t("navigation.explore"),
    group: "secondary",
    icon: <img className="qizhi-top-navigation__asset-icon" src={exploreIcon} alt="" />,
  },
  {
    key: "operations",
    label: t("navigation.operations"),
    group: "secondary",
    icon: <img className="qizhi-top-navigation__asset-icon" src={operationsIcon} alt="" />,
  },
];

const getDefaultRegions = (t: (key: string) => string): readonly TopNavigationOption[] => [
  { key: "qibao", label: t("navigation.region.qibao"), shortLabel: t("navigation.region.qibaoShort") },
  { key: "songjiang", label: t("navigation.region.songjiang"), shortLabel: t("navigation.region.songjiangShort") },
  {
    key: "zhangjiang",
    label: t("navigation.region.zhangjiang"),
    shortLabel: t("navigation.region.zhangjiangShort"),
  },
  { key: "disabled", label: t("navigation.region.disabled"), disabled: true },
];

const defaultLanguages: readonly TopNavigationOption[] = [
  { key: "zh-CN", label: "中文" },
  { key: "en-US", label: "English" },
];

const optionLabel = (
  options: readonly TopNavigationOption[],
  key: string,
  short = false,
) => {
  const option = options.find((item) => item.key === key);
  return short && option?.shortLabel ? option.shortLabel : option?.label;
};

export function TopNavigation({
  logo = <img src={qizhiLogo} alt="" />,
  productName,
  tenantName,
  items: providedItems,
  selectedKey: controlledSelectedKey,
  defaultSelectedKey = "model-service",
  onSelect,
  regions: providedRegions,
  region: controlledRegion,
  defaultRegion = "qibao",
  onRegionChange,
  languages = defaultLanguages,
  language: controlledLanguage,
  defaultLanguage,
  onLanguageChange,
  helpLabel,
  onHelp,
  onUserMenu,
  className,
  "aria-label": ariaLabel,
}: TopNavigationProps) {
  const { locale, setLocale, t } = useLocale();
  const items = providedItems ?? getDefaultItems(t);
  const regions = providedRegions ?? getDefaultRegions(t);
  const [internalSelectedKey, setInternalSelectedKey] = useState(
    defaultSelectedKey,
  );
  const [internalRegion, setInternalRegion] = useState(defaultRegion);
  const [internalLanguage, setInternalLanguage] = useState(defaultLanguage ?? locale);
  const selectedKey = controlledSelectedKey ?? internalSelectedKey;
  const region = controlledRegion ?? internalRegion;
  const language = controlledLanguage ?? internalLanguage;
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const scrollShellRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);
  const syncFrameRef = useRef(0);
  const primaryItems = items.filter((item) => item.group !== "secondary");
  const secondaryItems = items.filter((item) => item.group === "secondary");
  const selectedLabel = items.find((item) => item.key === selectedKey)?.label;
  const overflowSelected = hiddenKeys.includes(selectedKey);

  useEffect(() => {
    if (controlledLanguage === undefined && defaultLanguage === undefined) {
      setInternalLanguage(locale);
    }
  }, [controlledLanguage, defaultLanguage, locale]);

  const selectKey = (key: string) => {
    if (controlledSelectedKey === undefined) setInternalSelectedKey(key);
    onSelect?.(key);
  };

  const selectRegion = (key: string) => {
    if (controlledRegion === undefined) setInternalRegion(key);
    onRegionChange?.(key);
  };

  const selectLanguage = (key: string) => {
    if (controlledLanguage === undefined) setInternalLanguage(key);
    if (controlledLanguage === undefined && defaultLanguage === undefined
      && (key === "zh-CN" || key === "en-US")) setLocale(key as QizhiLocale);
    onLanguageChange?.(key);
  };

  const syncOverflow = useCallback(() => {
    const area = scrollAreaRef.current;
    const shell = scrollShellRef.current;
    if (!area || !shell) return;
    const overflowWidth = overflowRef.current?.hidden
      ? 0
      : overflowRef.current?.getBoundingClientRect().width ?? 0;
    const allItemsFit = area.scrollWidth <= area.clientWidth + overflowWidth + 4;
    const areaRect = area.getBoundingClientRect();
    const menuItems = Array.from(area.querySelectorAll<HTMLElement>(
      ".qizhi-top-navigation__item",
    ));
    const nextHiddenKeys = allItemsFit ? [] : menuItems.flatMap((item) => {
      const rect = item.getBoundingClientRect();
      const key = item.dataset.menuItemKey;
      const hidden = rect.left < areaRect.left + 1
        || rect.right > areaRect.right - 1;
      return hidden && key ? [key] : [];
    });
    setHiddenKeys((current) => (
      current.join("|") === nextHiddenKeys.join("|")
        ? current
        : nextHiddenKeys
    ));
    if (allItemsFit && area.scrollLeft !== 0) area.scrollLeft = 0;
    const maxScrollLeft = Math.max(0, area.scrollWidth - area.clientWidth);
    shell.classList.toggle("can-scroll-left", area.scrollLeft > 1);
    shell.classList.toggle(
      "can-scroll-right",
      area.scrollLeft < maxScrollLeft - 1,
    );
  }, []);

  const scheduleOverflowSync = useCallback(() => {
    window.cancelAnimationFrame(syncFrameRef.current);
    syncFrameRef.current = window.requestAnimationFrame(syncOverflow);
  }, [syncOverflow]);

  useEffect(() => {
    const area = scrollAreaRef.current;
    if (!area) return undefined;
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleOverflowSync);
    observer?.observe(area);
    const menu = area.querySelector(".qizhi-top-navigation__primary");
    if (menu) observer?.observe(menu);
    window.addEventListener("resize", scheduleOverflowSync);
    area.addEventListener("scroll", syncOverflow, { passive: true });
    document.fonts?.ready.then(scheduleOverflowSync);
    scheduleOverflowSync();
    return () => {
      window.cancelAnimationFrame(syncFrameRef.current);
      observer?.disconnect();
      window.removeEventListener("resize", scheduleOverflowSync);
      area.removeEventListener("scroll", syncOverflow);
    };
  }, [scheduleOverflowSync, syncOverflow]);

  const regionMenu = (
    <Dropdown.Menu onClickMenuItem={selectRegion}>
      {regions.map((option) => (
        <Dropdown.Item
          key={option.key}
          itemKey={option.key}
          role="menuitemradio"
          aria-checked={region === option.key}
          disabled={option.disabled}
          className={option.shortLabel && String(option.label).length > 12
            ? "qizhi-top-navigation__region-option"
            : undefined}
        >
          {option.label}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );

  const languageMenu = (
    <Dropdown.Menu onClickMenuItem={selectLanguage}>
      {languages.map((option) => (
        <Dropdown.Item
          key={option.key}
          itemKey={option.key}
          role="menuitemradio"
          aria-checked={language === option.key}
          disabled={option.disabled}
        >
          {option.label}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );

  const overflowMenu = (
    <Dropdown.Menu
      aria-label="更多导航菜单"
      onClickMenuItem={(key) => {
        selectKey(key);
        window.requestAnimationFrame(() => {
          scrollAreaRef.current?.querySelector<HTMLElement>(
            `[data-menu-item-key="${key}"]`,
          )?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        });
      }}
    >
      {items.filter((item) => hiddenKeys.includes(item.key)).map((item) => (
        <Dropdown.Item
          key={item.key}
          itemKey={item.key}
          disabled={item.disabled}
          aria-current={selectedKey === item.key ? "page" : undefined}
        >
          {item.label}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  );

  const renderItem = (item: TopNavigationItem) => (
    <Menu.Item
      key={item.key}
      itemKey={item.key}
      icon={item.icon}
      disabled={item.disabled}
      className={[
        "qizhi-top-navigation__item",
        item.icon ? "qizhi-top-navigation__item--icon" : "",
        `qizhi-top-navigation__item--${item.key}`,
      ].filter(Boolean).join(" ")}
    >
      {item.label}
    </Menu.Item>
  );

  return (
    <div
      className={["qizhi-top-navigation", className]
        .filter(Boolean).join(" ")}
      aria-label={ariaLabel ?? t("navigation.ariaLabel")}
    >
      <div className="qizhi-top-navigation__brand">
        <span className="qizhi-top-navigation__product">
          <span className="qizhi-top-navigation__logo">{logo}</span>
          <strong>{productName ?? t("navigation.productName")}</strong>
        </span>
        <span className="qizhi-top-navigation__tenant">{tenantName ?? t("navigation.tenantName")}</span>
      </div>
      <div className="qizhi-top-navigation__region-wrap">
        <Dropdown trigger="click" position="br" droplist={regionMenu}>
          <Button
            type="secondary"
            className="qizhi-top-navigation__region"
            icon={(
              <img
                className="qizhi-top-navigation__asset-icon"
                src={locationIcon}
                alt=""
              />
            )}
          >
            <span className="qizhi-top-navigation__region-label">
              {optionLabel(regions, region, true)}
            </span>
            <ChevronDownIcon />
          </Button>
        </Dropdown>
      </div>
      <div ref={scrollShellRef} className="qizhi-top-navigation__scroll-shell">
        <div
          ref={scrollAreaRef}
          className="qizhi-top-navigation__scroll-area"
          tabIndex={0}
          aria-label="可横向滚动的租户导航"
          onWheel={(event) => {
            const area = event.currentTarget;
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            if (area.scrollWidth <= area.clientWidth) return;
            event.preventDefault();
            area.scrollLeft += event.deltaY;
          }}
        >
          <Menu
            mode="horizontal"
            selectedKey={selectedKey}
            onSelect={selectKey}
            aria-label="顶部导航"
            className="qizhi-top-navigation__primary"
          >
            {primaryItems.map(renderItem)}
            <Divider
              type="vertical"
              className="qizhi-top-navigation__divider"
            />
            {secondaryItems.map((item, index) => (
              <Fragment key={item.key}>
                {index > 0 ? (
                  <Divider
                    type="vertical"
                    className="qizhi-top-navigation__divider"
                  />
                ) : null}
                {renderItem(item)}
              </Fragment>
            ))}
            <Divider
              type="vertical"
              className="qizhi-top-navigation__divider"
            />
          </Menu>
        </div>
      </div>
      <div
        ref={overflowRef}
        className="qizhi-top-navigation__overflow"
        hidden={!hiddenKeys.length}
      >
        <Dropdown trigger="click" position="br" droplist={overflowMenu}>
          <Button
            type="secondary"
            iconOnly
            icon={<MoreIcon />}
            aria-label={`更多导航，当前：${selectedLabel ?? ""}`}
            aria-current={overflowSelected ? "page" : undefined}
            className={overflowSelected
              ? "qizhi-top-navigation__overflow-trigger is-selected"
              : "qizhi-top-navigation__overflow-trigger"}
          />
        </Dropdown>
      </div>
      <div className="qizhi-top-navigation__actions">
        <Button
          type="secondary"
          className="qizhi-top-navigation__utility qizhi-top-navigation__help"
          icon={(
            <img
              className="qizhi-top-navigation__asset-icon"
              src={helpIcon}
              alt=""
            />
          )}
          onClick={onHelp}
        >
          <span className="qizhi-top-navigation__utility-label">
            {helpLabel ?? t("navigation.help")}
          </span>
        </Button>
        <Dropdown trigger="click" position="br" droplist={languageMenu}>
          <Button
            type="secondary"
            className="qizhi-top-navigation__utility qizhi-top-navigation__language"
            icon={(
              <img
                className="qizhi-top-navigation__asset-icon"
                src={internetIcon}
                alt=""
              />
            )}
          >
            <span className="qizhi-top-navigation__utility-label">
              {optionLabel(languages, language)}
            </span>
            <ChevronDownIcon />
          </Button>
        </Dropdown>
        <Button
          type="secondary"
          iconOnly
          icon={<ProfileFilledIcon />}
          className="qizhi-top-navigation__avatar"
          aria-label="打开用户菜单"
          onClick={onUserMenu}
        />
      </div>
    </div>
  );
}
