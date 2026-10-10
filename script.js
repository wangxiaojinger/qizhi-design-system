const docContent = document.querySelector(".doc-content");
const sidebarLinks = [...document.querySelectorAll(".nav-link")];
const toc = document.querySelector(".toc");
const tocInner = document.querySelector(".toc-inner");
const tocCollapseButton = document.querySelector(".toc-collapse");
const page = document.querySelector(".qz-page");
const menuCollapseButton = document.querySelector(".qz-menu-collapse-btn");
const menuInner = document.querySelector("#menu-inner.qz-menu-inner");
const navGroups = document.querySelectorAll(".nav-group");
const panes = [...document.querySelectorAll(".doc-content > [id]")];
let currentPane = null;
let isProgrammaticScroll = false;
let programmaticScrollTimer = null;
let lockedTocActiveHash = null;
let scrollSpyFrame = null;
let tocVisibilityFrame = null;
let isTocAutoCollapsed = false;
let sidebarScrollFrame = null;
let hasRestoredSidebarScroll = false;
const SECONDARY_TOC_MIN_WIDTH = 1200;
const PROGRAMMATIC_SCROLL_MAX_LOCK_MS = 2200;
const SIDEBAR_SCROLL_STORAGE_KEY = "qizhi-sidebar-scroll-state";

// Reading state belongs to the documentation shell, not individual components.
const READING_POSITION_KEY = "qizhi-docs-reading-position";
let initialRoute = true;
let pendingRouteHash = null;
let pendingRouteTimer = null;
let expiredRouteHash = null;
let readingRestoreCleanup = null;
let isRestoringReadingPosition = false;

const readReadingPosition = () => {
  try {
    const value = JSON.parse(sessionStorage.getItem(READING_POSITION_KEY));
    return value && typeof value.hash === "string" && typeof value.paneId === "string"
      && Number.isFinite(value.scrollY) && Number.isFinite(value.offset) ? value : null;
  } catch {
    return null;
  }
};

const saveReadingPosition = () => {
  if (!currentPane || pendingRouteHash || isRestoringReadingPosition) return;
  const targets = getTocTargets(currentPane);
  const anchor = targets.filter(({ node }) => node.getBoundingClientRect().top <= 120).at(-1)?.node ?? currentPane;
  try {
    sessionStorage.setItem(READING_POSITION_KEY, JSON.stringify({
      hash: getDecodedHash().hash, paneId: currentPane.id, anchorId: anchor.id,
      offset: anchor.getBoundingClientRect().top, scrollY: window.scrollY,
    }));
  } catch {
    // Storage is optional; explicit URL routing must still work.
  }
};

const stopReadingRestore = () => {
  readingRestoreCleanup?.();
  readingRestoreCleanup = null;
  isRestoringReadingPosition = false;
};

const restoreReadingPosition = (saved, pane) => {
  stopReadingRestore();
  isRestoringReadingPosition = true;
  const root = document.documentElement;
  const previousOverflowAnchor = root.style.overflowAnchor;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.overflowAnchor = "none";
  root.style.scrollBehavior = "auto";
  const apply = () => {
    const anchor = document.getElementById(saved.anchorId);
    const top = anchor && pane.contains(anchor)
      ? window.scrollY + anchor.getBoundingClientRect().top - saved.offset : saved.scrollY;
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  };
  const observer = new ResizeObserver(apply);
  observer.observe(pane);
  const mutations = new MutationObserver(apply);
  mutations.observe(pane, { childList: true, subtree: true });
  // React islands can finish a layout pass after the initial frame without
  // changing the pane's measured size. Re-apply once after that pass so the
  // stored viewport offset remains stable; user input still cancels this work.
  const settleTimer = window.setTimeout(apply, 160);
  const timer = window.setTimeout(() => { stopReadingRestore(); saveReadingPosition(); }, 2500);
  const frame = requestAnimationFrame(apply);
  readingRestoreCleanup = () => {
    observer.disconnect(); mutations.disconnect();
    root.style.overflowAnchor = previousOverflowAnchor;
    root.style.scrollBehavior = previousScrollBehavior;
    clearTimeout(settleTimer); clearTimeout(timer); cancelAnimationFrame(frame);
  };
  apply();
};

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const setMenuCollapsed = (collapsed) => {
  if (!page || !menuCollapseButton) return;

  page.classList.toggle("qz-menu-wrapper-collapsed", collapsed);
  menuCollapseButton.setAttribute("aria-expanded", String(!collapsed));
  menuCollapseButton.setAttribute(
    "aria-label",
    collapsed ? "menu expand button" : "menu collapse button",
  );
  const icon = menuCollapseButton.querySelector("i");
  if (icon) {
    icon.className = collapsed ? "ri-arrow-right-s-line" : "ri-arrow-left-s-line";
  }
};

menuCollapseButton?.addEventListener("click", () => {
  setMenuCollapsed(!page?.classList.contains("qz-menu-wrapper-collapsed"));
});

const linkTextByHash = new Map();

[...document.querySelectorAll("a[href^='#']")].forEach((link) => {
  const hash = link.getAttribute("href");
  if (!hash || linkTextByHash.has(hash)) return;
  linkTextByHash.set(hash, link.textContent.trim());
});

panes.forEach((pane) => pane.classList.add("doc-pane"));

const getLabelForHash = (hash, fallback) => linkTextByHash.get(hash) || fallback;

const getTocLabelForNode = (node) => {
  if (!node || node.hasAttribute("data-toc-exclude")) return null;

  const explicit = node.getAttribute("data-toc-label");
  if (explicit) return explicit;

  const heading = node.querySelector("h1, h2, h3, h4, h5, .component-intro-meta");
  const label = heading?.textContent.trim();
  return label || null;
};

const getDecodedHash = (hash = window.location.hash || "#overview") => {
  const rawId = hash.startsWith("#") ? hash.slice(1) : hash;
  let decodedId;
  try { decodedId = decodeURIComponent(rawId || "overview"); } catch { decodedId = rawId; }
  return {
    id: decodedId,
    hash: `#${decodedId}`,
  };
};

const openGroupForHash = (hash) => {
  const directLink = document.querySelector(`.nav-link[href="${hash}"]`);
  if (!directLink) return;

  const group = directLink.closest(".nav-group");
  if (!group) return;

  group.classList.add("is-open");
  const trigger = group.querySelector(".nav-group-trigger");
  if (trigger) trigger.setAttribute("aria-expanded", "true");
};

const resolveRoute = () => {
  const { hash, id } = getDecodedHash();
  const exactPane = panes.find((pane) => pane.id === id);

  if (exactPane) {
    return { hash, pane: exactPane, target: exactPane };
  }

  const target = document.getElementById(id);
  if (target) {
    const pane = panes.find((candidate) => candidate.contains(target));
    if (pane) {
      return { hash, pane, target };
    }
  }

  if (hash !== "#overview" && expiredRouteHash !== hash) return null;
  return { hash: "#overview", pane: panes[0], target: panes[0] };
};

const buildToc = (pane, activeHash) => {
  if (!tocInner) return;

  const list = tocInner.querySelector(".qizhi-anchor__list");
  if (!list) return;

  const items = [];
  const nestedTargets = [...pane.querySelectorAll("[id]")].filter(
    (node) => node.id !== pane.id && !!getTocLabelForNode(node),
  );
  nestedTargets.forEach((node) => {
    const hash = `#${node.id}`;
    const headingLabel = getTocLabelForNode(node);
    const label = getLabelForHash(hash, headingLabel) || headingLabel || node.id;
    items.push(
      `<div class="qizhi-anchor__item"><a class="qizhi-anchor__link toc-link${activeHash === hash ? " is-active" : ""}" href="${hash}" title="${label}" data-href="${hash}">${label}</a></div>`,
    );
  });

  list.innerHTML = items.join("");
  toc?.classList.toggle("is-empty", items.length === 0);
};

const getTocTargets = (pane) => {
  const paneHash = `#${pane.id}`;
  const nestedTargets = [...pane.querySelectorAll("[id]")]
    .filter((node) => node.id !== pane.id && !!getTocLabelForNode(node))
    .map((node) => ({ hash: `#${node.id}`, node }));

  return [{ hash: paneHash, node: pane }, ...nestedTargets];
};

const setTocActive = (activeHash) => {
  if (!tocInner) return;

  const links = tocInner.querySelectorAll(".toc-link");
  links.forEach((link) => {
    const isActive = link.getAttribute("href") === activeHash;
    link.classList.toggle("is-active", isActive);
  });
};

const getMatchingTocHash = (hash) => {
  if (!tocInner) return null;

  const links = tocInner.querySelectorAll(".toc-link");
  return [...links].some((link) => link.getAttribute("href") === hash) ? hash : null;
};

const clearLockedTocActive = () => {
  lockedTocActiveHash = null;
};

const updateSecondaryTocVisibility = () => {
  if (!toc || !docContent || !currentPane) return;

  const hasItems = !!tocInner?.querySelector(".qizhi-anchor__item");
  const shouldShow = window.innerWidth >= SECONDARY_TOC_MIN_WIDTH && hasItems;

  document.body.classList.toggle("has-secondary-toc", shouldShow);
};

const syncTocCollapsedByViewport = () => {
  if (!toc || !tocCollapseButton) return;

  if (window.innerWidth < SECONDARY_TOC_MIN_WIDTH) {
    if (!toc.classList.contains("is-collapsed")) {
      setTocCollapsed(true);
    }
    isTocAutoCollapsed = true;
    return;
  }

  if (isTocAutoCollapsed) {
    setTocCollapsed(false);
    isTocAutoCollapsed = false;
  }
};

const getPaneSidebarHash = (pane) => {
  const paneHash = `#${pane.id}`;
  if (document.querySelector(`.nav-link[href="${paneHash}"]`)) {
    return paneHash;
  }

  const firstMappedChild = [...pane.querySelectorAll("[id]")].find((node) =>
    document.querySelector(`.nav-link[href="#${node.id}"]`),
  );

  return firstMappedChild ? `#${firstMappedChild.id}` : paneHash;
};

const getSavedSidebarScroll = () => {
  try {
    const savedState = JSON.parse(sessionStorage.getItem(SIDEBAR_SCROLL_STORAGE_KEY));
    if (!savedState || typeof savedState.scrollTop !== "number") return null;
    return savedState;
  } catch (error) {
    return null;
  }
};

const saveSidebarScroll = () => {
  if (!menuInner || menuInner.clientHeight === 0) return;

  const activeHash = document.querySelector(".nav-link.is-active")?.getAttribute("href");
  if (!activeHash) return;

  try {
    sessionStorage.setItem(
      SIDEBAR_SCROLL_STORAGE_KEY,
      JSON.stringify({ activeHash, scrollTop: menuInner.scrollTop }),
    );
  } catch (error) {
    // sessionStorage may be unavailable in restricted browser contexts.
  }
};

const revealSidebarLink = (link) => {
  if (!menuInner || !link) return;

  const containerRect = menuInner.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const isAboveViewport = linkRect.top < containerRect.top;
  const isBelowViewport = linkRect.bottom > containerRect.bottom;
  if (!isAboveViewport && !isBelowViewport) return;

  menuInner.scrollTop +=
    linkRect.top - containerRect.top - (menuInner.clientHeight - linkRect.height) / 2;
};

const syncSidebarScroll = (activeHash) => {
  if (!menuInner) return;

  const activeLink = document.querySelector(`.nav-link[href="${activeHash}"]`);
  requestAnimationFrame(() => {
    if (!hasRestoredSidebarScroll) {
      const savedState = getSavedSidebarScroll();
      if (savedState?.activeHash === activeHash) {
        menuInner.scrollTop = savedState.scrollTop;
        revealSidebarLink(activeLink);
      } else {
        revealSidebarLink(activeLink);
      }
      hasRestoredSidebarScroll = true;
      return;
    }

    revealSidebarLink(activeLink);
  });
};

const syncSidebarActive = (hash, pane) => {
  const activeHash = document.querySelector(`.nav-link[href="${hash}"]`)
    ? hash
    : getPaneSidebarHash(pane);

  document.querySelectorAll(".qz-menu-item.qz-menu-selected").forEach((item) => {
    item.classList.remove("qz-menu-selected");
  });
  document.querySelectorAll(".qz-menu-inline.qz-menu-inline-selected").forEach((group) => {
    group.classList.remove("qz-menu-inline-selected");
  });

  sidebarLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === activeHash;
    link.classList.toggle("is-active", isActive);
    link.closest(".qz-menu-item")?.classList.toggle("qz-menu-selected", isActive);
  });

  document
    .querySelector(`.nav-link[href="${activeHash}"]`)
    ?.closest(".qz-menu-inline")
    ?.classList.add("qz-menu-inline-selected");

  openGroupForHash(activeHash);
  return activeHash;
};

const releaseProgrammaticScrollWhenSettled = (targetHash, onRelease) => {
  const startedAt = Date.now();
  let lastY = window.scrollY;
  let stableTicks = 0;

  const check = () => {
    const currentY = window.scrollY;
    const isStable = Math.abs(currentY - lastY) < 1;
    stableTicks = isStable ? stableTicks + 1 : 0;
    lastY = currentY;

    if (stableTicks >= 3 || Date.now() - startedAt >= PROGRAMMATIC_SCROLL_MAX_LOCK_MS) {
      isProgrammaticScroll = false;
      programmaticScrollTimer = null;
      setTocActive(targetHash);
      onRelease?.();
      return;
    }

    programmaticScrollTimer = window.setTimeout(check, 80);
  };

  programmaticScrollTimer = window.setTimeout(check, 80);
};

const scrollToTarget = (target, pane) => {
  isProgrammaticScroll = true;
  if (programmaticScrollTimer) {
    window.clearTimeout(programmaticScrollTimer);
  }

  const targetHash = `#${target.id}`;
  const matchingTocHash = getMatchingTocHash(targetHash);
  if (matchingTocHash) {
    lockedTocActiveHash = matchingTocHash;
  }
  setTocActive(targetHash);

  if (target.id === pane.id) {
    window.scrollTo({ top: 0, behavior: "auto" });
    releaseProgrammaticScrollWhenSettled(targetHash, syncTocByScroll);
    return;
  }

  target.scrollIntoView({ block: "start", behavior: "auto" });
  releaseProgrammaticScrollWhenSettled(targetHash);
};

const syncTocByScroll = () => {
  if (!currentPane || isProgrammaticScroll || pendingRouteHash || isRestoringReadingPosition) return;
  if (document.documentElement.classList.contains("is-tree-transitioning")) return;

  if (lockedTocActiveHash) {
    setTocActive(lockedTocActiveHash);
    return;
  }

  const targets = getTocTargets(currentPane);
  const probeY = 120;
  let active = targets[0];

  targets.forEach((entry) => {
    const rect = entry.node.getBoundingClientRect();
    if (rect.top <= probeY) {
      active = entry;
    }
  });

  const activeHash = active.hash;
  setTocActive(activeHash);

  if (getDecodedHash().hash !== activeHash) {
    history.replaceState(null, "", activeHash);
  }

  syncSidebarActive(activeHash, currentPane);
};

const renderRoute = () => {
  const route = resolveRoute();
  if (!route) {
    const hash = getDecodedHash().hash;
    if (pendingRouteHash !== hash) {
      clearTimeout(pendingRouteTimer);
      pendingRouteHash = hash;
      pendingRouteTimer = window.setTimeout(() => {
        expiredRouteHash = hash;
        renderRoute();
      }, 10000);
    }
    return;
  }
  clearTimeout(pendingRouteTimer);
  pendingRouteHash = null;
  stopReadingRestore();
  const { hash, pane, target } = route;
  const saved = initialRoute && performance.getEntriesByType("navigation")[0]?.type === "reload"
    ? readReadingPosition() : null;
  initialRoute = false;
  currentPane = pane;
  isProgrammaticScroll = true;
  if (programmaticScrollTimer) clearTimeout(programmaticScrollTimer);

  if (getDecodedHash().hash !== hash) {
    history.replaceState(null, "", hash);
  }

  panes.forEach((candidate) => {
    const isVisible = candidate === pane;
    candidate.classList.toggle("is-visible", isVisible);
    candidate.setAttribute("aria-hidden", String(!isVisible));
  });

  document.documentElement.classList.remove("route-pending");

  document.dispatchEvent(new CustomEvent("qizhi:route-rendered", { detail: { pane } }));

  const activeSidebarHash = syncSidebarActive(hash, pane);
  syncSidebarScroll(activeSidebarHash);
  buildToc(pane, hash);
  updateSecondaryTocVisibility();
  syncTocCollapsedByViewport();

  requestAnimationFrame(() => {
    if (saved?.hash === hash && saved.paneId === pane.id) {
      isProgrammaticScroll = false;
      restoreReadingPosition(saved, pane);
      setTocActive(getMatchingTocHash(hash) || hash);
    } else {
      scrollToTarget(target, pane);
    }
  });
};

// React islands can create a chapter after DOMContentLoaded. Keep its URL until it exists.
const pendingRouteObserver = new MutationObserver(() => {
  if (pendingRouteHash && document.getElementById(getDecodedHash().id)) renderRoute();
});
if (docContent) pendingRouteObserver.observe(docContent, { childList: true, subtree: true });

window.addEventListener("qizhi:react-island-ready", () => {
  if (pendingRouteHash) { renderRoute(); return; }
  if (!currentPane?.querySelector(".qizhi-components-wrapper")) return;
  buildToc(currentPane, getDecodedHash().hash);
  updateSecondaryTocVisibility();
  syncTocByScroll();
});

navGroups.forEach((group) => {
  const trigger = group.querySelector(".nav-group-trigger");
  if (!trigger) return;

  trigger.addEventListener("click", () => {
    const isOpen = group.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });
});

const handleHashLinkClick = (link, event) => {
  const targetHash = link.getAttribute("href");
  if (!targetHash) return;

  if (link.matches("[data-link-demo]")) {
    event.preventDefault();
    return;
  }

  if (link.closest("[data-anchor-demo]")) {
    event.preventDefault();
    return;
  }

  // Use explicit route switching for local file pages so content swaps
  // immediately instead of relying on inconsistent file:// hash behavior.
  event.preventDefault();

  if (link.classList.contains("toc-link")) {
    lockedTocActiveHash = targetHash;
    setTocActive(targetHash);
  } else {
    clearLockedTocActive();
  }

  if (window.location.hash === targetHash) {
    renderRoute();
    return;
  }

  history.pushState(null, "", targetHash);
  renderRoute();
};

const hashLinks = [...document.querySelectorAll('a[href^="#"]')];

hashLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    handleHashLinkClick(link, event);
  });
});

tocInner?.addEventListener("click", (event) => {
  const link = event.target.closest?.('a[href^="#"]');
  if (!link || !tocInner.contains(link)) return;

  handleHashLinkClick(link, event);
});

window.addEventListener("popstate", renderRoute);
window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", renderRoute);
menuInner?.addEventListener("scroll", () => {
  if (sidebarScrollFrame) return;

  sidebarScrollFrame = requestAnimationFrame(() => {
    sidebarScrollFrame = null;
    saveSidebarScroll();
  });
}, { passive: true });
window.addEventListener("pagehide", saveSidebarScroll);
window.addEventListener("pagehide", saveReadingPosition);
window.addEventListener("scroll", () => {
  if (scrollSpyFrame) return;

  scrollSpyFrame = requestAnimationFrame(() => {
    scrollSpyFrame = null;
    syncTocByScroll();
    saveReadingPosition();
  });
});

window.addEventListener("wheel", stopReadingRestore, { passive: true });
window.addEventListener("touchstart", stopReadingRestore, { passive: true });
window.addEventListener("pointerdown", stopReadingRestore);
window.addEventListener("keydown", stopReadingRestore);
window.addEventListener("wheel", clearLockedTocActive, { passive: true });
window.addEventListener("touchstart", clearLockedTocActive, { passive: true });
window.addEventListener("mousedown", clearLockedTocActive);
window.addEventListener("keydown", (event) => {
  const scrollKeys = new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]);
  if (scrollKeys.has(event.key)) {
    clearLockedTocActive();
  }
});

window.addEventListener("resize", () => {
  if (tocVisibilityFrame) return;

  tocVisibilityFrame = requestAnimationFrame(() => {
    tocVisibilityFrame = null;
    updateSecondaryTocVisibility();
    syncTocCollapsedByViewport();
  });
});

const setTocCollapsed = (collapsed) => {
  if (!toc || !tocCollapseButton) return;

  toc.classList.toggle("is-collapsed", collapsed);
  tocCollapseButton.setAttribute("aria-expanded", String(!collapsed));
  tocCollapseButton.setAttribute("aria-label", collapsed ? "展开页面目录" : "收起页面目录");
};

const initTocCollapse = () => {
  if (!toc || !tocCollapseButton) return;

  tocCollapseButton.addEventListener("click", () => {
    const collapsed = !toc.classList.contains("is-collapsed");
    setTocCollapsed(collapsed);
    isTocAutoCollapsed = false;
  });

  setTocCollapsed(window.innerWidth < SECONDARY_TOC_MIN_WIDTH);
  isTocAutoCollapsed = window.innerWidth < SECONDARY_TOC_MIN_WIDTH;
};

window.addEventListener("DOMContentLoaded", initTocCollapse);

const initCodeExamples = () => {
  const toggleButtons = [...document.querySelectorAll("[data-code-toggle]")];
  const copyButtons = [...document.querySelectorAll("[data-code-copy]")];

  toggleButtons.forEach((button) => {
    const targetId = button.getAttribute("aria-controls");
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.setAttribute("title", expanded ? "展开代码" : "收起代码");
      target.hidden = expanded;
    });
  });

  copyButtons.forEach((button) => {
    const targetId = button.getAttribute("data-copy-target");
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(target.textContent || "");
        button.setAttribute("title", "已复制");
        window.setTimeout(() => {
          button.setAttribute("title", "复制代码");
        }, 1200);
      } catch (error) {
        button.setAttribute("title", "复制失败");
        window.setTimeout(() => {
          button.setAttribute("title", "复制代码");
        }, 1200);
      }
    });
  });
};

window.addEventListener("DOMContentLoaded", initCodeExamples);

const initCheckableTags = () => {
  const checkableTags = [...document.querySelectorAll(".qizhi-tag-checkable")];

  checkableTags.forEach((tag) => {
    const syncCheckedState = () => {
      tag.setAttribute("aria-checked", String(tag.classList.contains("qizhi-tag-checked")));
    };
    const toggleCheckedState = () => {
      tag.classList.toggle("qizhi-tag-checked");
      syncCheckedState();
    };

    tag.setAttribute("role", "checkbox");
    tag.setAttribute("tabindex", "0");
    syncCheckedState();

    tag.addEventListener("click", toggleCheckedState);
    tag.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      toggleCheckedState();
    });
  });
};

window.addEventListener("DOMContentLoaded", initCheckableTags);

const initTimelineReverseDemo = () => {
  const demos = [...document.querySelectorAll("[data-timeline-reverse-demo]")];

  demos.forEach((demo) => {
    const toggle = demo.querySelector("[data-timeline-reverse-toggle]");
    const timeline = demo.querySelector(".qizhi-timeline");
    if (!toggle || !timeline) return;
    const originalItems = [
      ...timeline.querySelectorAll(".qizhi-timeline-item"),
    ];

    const setReversed = (reversed) => {
      const orderedItems = reversed ? [...originalItems].reverse() : originalItems;

      toggle.classList.toggle("qizhi-switch-checked", reversed);
      toggle.setAttribute("aria-checked", String(reversed));
      timeline.classList.remove("timeline-demo--reversed");

      originalItems.forEach((item) => {
        item.classList.remove("qizhi-timeline-item-last");
      });

      orderedItems.forEach((item) => {
        timeline.appendChild(item);
      });

      const lastItem = orderedItems[orderedItems.length - 1];
      if (!lastItem) return;

      lastItem.classList.add(
        lastItem.classList.contains("qizhi-timeline-item")
          ? "qizhi-timeline-item-last"
          : "qizhi-timeline-item-last"
      );
    };

    toggle.addEventListener("click", () => {
      setReversed(toggle.getAttribute("aria-checked") !== "true");
    });

    setReversed(false);
  });
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initTimelineReverseDemo);
} else {
  initTimelineReverseDemo();
}

const paletteFormatSwitch = document.querySelector(".palette-format-switch");
const paletteFormatButtons = paletteFormatSwitch
  ? [...paletteFormatSwitch.querySelectorAll("[data-format]")]
  : [];
const paletteThemeSwitch = document.querySelector(".palette-theme-switch");
const paletteThemeButtons = paletteThemeSwitch
  ? [...paletteThemeSwitch.querySelectorAll("[data-palette-theme]")]
  : [];
const colorsSection = document.querySelector("#colors");
const paletteValueNodes = [
  ...document.querySelectorAll("#colors .color-palette-item span:last-child"),
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeHex = (value) => {
  if (!value) return null;
  const raw = value.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw)) return null;

  const hex = raw.length === 3
    ? raw
        .split("")
        .map((char) => char + char)
        .join("")
    : raw;

  return `#${hex.toUpperCase()}`;
};

const hexToRgb = (hex) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  const raw = normalized.slice(1);
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
};

const rgbToHsl = ({ r, g, b }) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  const lightness = (max + min) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
  }

  const normalizedHue = Math.round((((hue * 60) + 360) % 360));
  const normalizedSaturation = Math.round(clamp(saturation * 100, 0, 100));
  const normalizedLightness = Math.round(clamp(lightness * 100, 0, 100));

  return {
    h: normalizedHue,
    s: normalizedSaturation,
    l: normalizedLightness,
  };
};

const formatColorValue = (hex, format) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  if (format === "rgb") {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  if (format === "hsl") {
    const hsl = rgbToHsl(rgb);
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  return normalizeHex(hex);
};

const updatePaletteValues = (format) => {
  paletteValueNodes.forEach((node) => {
    const sourceHex =
      node.dataset.hex ||
      normalizeHex(node.textContent) ||
      normalizeHex(node.closest(".color-palette-item")?.style.background);

    if (!sourceHex) return;

    node.dataset.hex = sourceHex;
    node.textContent = formatColorValue(sourceHex, format);
  });
};

const setPaletteFormat = (format) => {
  paletteFormatButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.format === format);
  });

  updatePaletteValues(format);
};

const initPaletteFormatSwitch = () => {
  if (!paletteFormatButtons.length || !paletteValueNodes.length) return;

  paletteFormatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPaletteFormat(button.dataset.format || "hex");
    });
  });

  setPaletteFormat("hex");
};

window.addEventListener("DOMContentLoaded", initPaletteFormatSwitch);

const setPaletteTheme = (theme) => {
  if (!colorsSection) return;

  colorsSection.dataset.paletteTheme = theme;
  paletteThemeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.paletteTheme === theme);
  });
};

const initPaletteThemeSwitch = () => {
  if (!paletteThemeButtons.length || !colorsSection) return;

  paletteThemeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPaletteTheme(button.dataset.paletteTheme || "light");
    });
  });

  setPaletteTheme("light");
};

window.addEventListener("DOMContentLoaded", initPaletteThemeSwitch);

const setExampleCodeExpanded = (example, expanded) => {
  const codePanel = example.querySelector(".component-example-code");
  const toggleButtons = example.querySelectorAll("[data-toggle-code]");
  if (!codePanel) return;

  codePanel.hidden = !expanded;
  toggleButtons.forEach((button) => {
    button.setAttribute("aria-expanded", String(expanded));
    const label = button.querySelector("span:last-child");
    if (label) {
      label.textContent = expanded ? "收起代码" : "展开代码";
    }
  });
};

const initComponentExamples = () => {
  const examples = document.querySelectorAll(".component-example, .codebox-wrapper");
  if (!examples.length) return;

  examples.forEach((example) => setExampleCodeExpanded(example, false));

  document.addEventListener("click", async (event) => {
    const toggleButton = event.target.closest("[data-toggle-code]");
    if (toggleButton) {
      const example = toggleButton.closest(".component-example, .codebox-wrapper");
      if (!example) return;

      const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
      setExampleCodeExpanded(example, !isExpanded);
      return;
    }

    const copyButton = event.target.closest("[data-copy-code]");
    if (copyButton) {
      const example = copyButton.closest(".component-example, .codebox-wrapper");
      const codeNode = example?.querySelector(".component-example-code code");
      if (!codeNode) return;

      try {
        await navigator.clipboard.writeText(codeNode.textContent);
        const label = copyButton.querySelector("span:last-child");
        const previousText = label?.textContent;
        if (label) label.textContent = "已复制";
        window.setTimeout(() => {
          if (label && previousText) label.textContent = previousText;
        }, 1200);
      } catch (error) {
        console.error("Copy failed", error);
      }
    }
  });
};

const upgradeLegacyExamples = () => {
  const getDirectChildByClass = (node, className) =>
    [...node.children].find((child) => child.classList.contains(className));

  document.querySelectorAll(".component-example").forEach((example) => {
    example.classList.add("codebox-wrapper");

    const heading = getDirectChildByClass(example, "component-example-heading");
    if (heading) {
      heading.classList.add("qz-description");

      const content = getDirectChildByClass(heading, "qz-description-children") || heading.firstElementChild;
      if (content) {
        content.classList.add("qz-description-children");
      }

      const title = heading.querySelector("h4");
      if (title) {
        title.classList.add("qz-demo-title");

        if (!title.querySelector("a")) {
          const label = title.textContent.trim();
          const anchor = document.createElement("a");
          anchor.tabIndex = -1;
          anchor.href = `#${example.id}`;
          anchor.textContent = label;
          title.textContent = "";
          title.append(anchor);
        }
      }
    }

    const card = getDirectChildByClass(example, "component-example-card");
    if (card) {
      card.classList.add("demo");
    }
  });
};

upgradeLegacyExamples();

window.addEventListener("DOMContentLoaded", initComponentExamples);

const initTooltipDemos = () => {
  const tooltipDemos = [...document.querySelectorAll("[data-tooltip-demo]")];
  const controls = [...document.querySelectorAll("[data-tooltip-control]")];
  if (!tooltipDemos.length && !controls.length) return;

  const closePinnedTooltips = (except) => {
    tooltipDemos.forEach((tooltip) => {
      if (tooltip === except) return;
      tooltip.classList.remove("is-pinned");
      tooltip.setAttribute("aria-expanded", "false");
    });
  };

  tooltipDemos.forEach((tooltip) => {
    tooltip.setAttribute("aria-expanded", "false");

    tooltip.addEventListener("click", (event) => {
      const trigger = event.target.closest(".tooltip-demo__trigger, .qizhi-model-card__description, .qizhi-btn");
      if (!trigger || !tooltip.contains(trigger)) return;

      const shouldPin = !tooltip.classList.contains("is-pinned");
      closePinnedTooltips(tooltip);
      tooltip.classList.toggle("is-pinned", shouldPin);
      tooltip.setAttribute("aria-expanded", String(shouldPin));
    });

    tooltip.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      tooltip.classList.remove("is-pinned");
      tooltip.setAttribute("aria-expanded", "false");
    });
  });

  controls.forEach((control) => {
    const target = document.getElementById(control.dataset.tooltipControl);
    if (!target) return;

    const setVisible = (visible) => {
      target.classList.toggle("is-open", visible);
      control.classList.toggle("qizhi-switch-checked", visible);
      control.setAttribute("aria-checked", String(visible));
      target.setAttribute("aria-expanded", String(visible));
    };

    setVisible(control.getAttribute("aria-checked") === "true");

    control.addEventListener("click", () => {
      setVisible(control.getAttribute("aria-checked") !== "true");
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-tooltip-demo], [data-tooltip-control]")) return;
    closePinnedTooltips();
  });
};

window.addEventListener("DOMContentLoaded", initTooltipDemos);

const initPopconfirmDemos = () => {
  const demos = [...document.querySelectorAll("[data-popconfirm-demo]")];
  if (!demos.length) return;

  const closeDemo = (demo, restoreFocus = false) => {
    if (!demo || demo.dataset.loading === "true") return;
    demo.classList.remove("is-open");
    const trigger = demo.querySelector(".tooltip-demo__trigger");
    const popup = demo.querySelector(".qizhi-popconfirm");
    trigger?.setAttribute("aria-expanded", "false");
    if (popup) popup.hidden = true;
    if (restoreFocus) trigger?.focus();
  };

  const closeOtherDemos = (current) => {
    demos.forEach((demo) => {
      if (demo !== current) closeDemo(demo);
    });
  };

  demos.forEach((demo, index) => {
    const trigger = demo.querySelector(".tooltip-demo__trigger");
    if (!trigger) return;

    const popupId = `qizhi-popconfirm-${index + 1}`;
    const titleId = `${popupId}-title`;
    const contentId = `${popupId}-content`;
    const popup = document.createElement("span");
    const main = document.createElement("span");
    const copy = document.createElement("span");
    const title = document.createElement("span");
    const content = document.createElement("span");
    const actions = document.createElement("span");
    const cancelButton = document.createElement("button");
    const confirmButton = document.createElement("button");
    const cancelLabel = document.createElement("span");
    const confirmLabel = document.createElement("span");
    const iconName = demo.dataset.popconfirmIcon || "ri-error-warning-fill";

    popup.className = "tooltip-demo__bubble qizhi-popconfirm";
    popup.id = popupId;
    popup.hidden = true;
    popup.setAttribute("role", "alertdialog");
    popup.setAttribute("aria-labelledby", titleId);
    popup.setAttribute("aria-describedby", contentId);

    main.className = `qizhi-popconfirm__main${iconName === "none" ? " qizhi-popconfirm__main--no-icon" : ""}`;
    copy.className = "qizhi-popconfirm__copy";
    title.className = "qizhi-popconfirm__title";
    title.id = titleId;
    title.textContent = demo.dataset.popconfirmTitle || "确认删除";
    content.className = "qizhi-popconfirm__content";
    content.id = contentId;
    content.textContent = demo.dataset.popconfirmContent || "确定要删除这条内容吗？";
    copy.append(title, content);

    if (iconName !== "none") {
      const icon = document.createElement("i");
      icon.className = `${iconName} qizhi-popconfirm__icon`;
      icon.setAttribute("aria-hidden", "true");
      main.append(icon, copy);
    } else {
      main.append(copy);
    }

    actions.className = "qizhi-popconfirm__actions";
    cancelButton.className = "qz-btn qz-btn-secondary qz-btn-size-default qz-btn-shape-square";
    cancelButton.type = "button";
    cancelLabel.textContent = demo.dataset.popconfirmCancelText || "取消";
    cancelButton.append(cancelLabel);
    confirmButton.className = "qz-btn qz-btn-primary qz-btn-size-default qz-btn-shape-square";
    confirmButton.type = "button";
    confirmLabel.textContent = demo.dataset.popconfirmOkText || "确定";
    confirmButton.append(confirmLabel);
    actions.append(cancelButton, confirmButton);
    popup.append(main, actions);
    demo.append(popup);

    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", popupId);
    trigger.setAttribute("aria-expanded", "false");

    trigger.addEventListener("click", () => {
      const shouldOpen = !demo.classList.contains("is-open");
      closeOtherDemos(demo);
      popup.hidden = !shouldOpen;
      demo.classList.toggle("is-open", shouldOpen);
      trigger.setAttribute("aria-expanded", String(shouldOpen));
      if (shouldOpen) window.requestAnimationFrame(() => cancelButton.focus());
    });

    cancelButton.addEventListener("click", () => closeDemo(demo, true));

    confirmButton.addEventListener("click", () => {
      if (!demo.hasAttribute("data-popconfirm-async")) {
        closeDemo(demo, true);
        return;
      }

      demo.dataset.loading = "true";
      confirmButton.classList.add("is-loading");
      confirmButton.disabled = true;
      cancelButton.disabled = true;
      confirmLabel.textContent = "处理中";
      const loadingIcon = document.createElement("i");
      loadingIcon.className = "ri-loader-4-line";
      loadingIcon.setAttribute("aria-hidden", "true");
      confirmButton.prepend(loadingIcon);

      window.setTimeout(() => {
        delete demo.dataset.loading;
        confirmButton.classList.remove("is-loading");
        confirmButton.disabled = false;
        cancelButton.disabled = false;
        loadingIcon.remove();
        confirmLabel.textContent = demo.dataset.popconfirmOkText || "确定";
        closeDemo(demo, true);
      }, 2000);
    });

    demo.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeDemo(demo, true);
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-popconfirm-demo]")) return;
    demos.forEach((demo) => closeDemo(demo));
  });
};

window.addEventListener("DOMContentLoaded", initPopconfirmDemos);

const initProgressDemos = () => {
  document.querySelectorAll("[data-progress-size-demo]").forEach((demo) => {
    const options = [...demo.querySelectorAll("[data-progress-size]")];
    const target = demo.querySelector("[data-progress-size-target]");
    if (!options.length || !target) return;

    const setSize = (size, focus = false) => {
      options.forEach((option) => {
        const isActive = option.dataset.progressSize === size;
        const input = option.querySelector('input[type="radio"]');
        option.classList.toggle("is-active", isActive);
        option.setAttribute("aria-checked", String(isActive));
        option.tabIndex = isActive ? 0 : -1;
        if (input) input.checked = isActive;
        if (isActive && focus) option.focus();
      });

      target.classList.remove(
        "qizhi-progress-size-small",
        "qizhi-progress-size-default",
        "qizhi-progress-size-large",
      );
      target.classList.add(`qizhi-progress-size-${size}`);
    };

    options.forEach((option, index) => {
      option.addEventListener("click", () => setSize(option.dataset.progressSize));
      option.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + options.length) % options.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % options.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = options.length - 1;
        setSize(options[nextIndex].dataset.progressSize, true);
      });
    });

    setSize(options.find((option) => option.getAttribute("aria-checked") === "true")?.dataset.progressSize || "default");
  });
};

window.addEventListener("DOMContentLoaded", initProgressDemos);

const initSkeletonDemos = () => {
  document.querySelectorAll("[data-skeleton-animation-demo]").forEach((demo) => {
    const toggle = demo.querySelector("[data-skeleton-animation-toggle]");
    const target = demo.querySelector("[data-skeleton-animation-target]");
    if (!toggle || !target) return;

    const setAnimated = (animated) => {
      setSwitchDemoChecked(toggle, animated);
      target.classList.toggle("qizhi-skeleton--animated", animated);
      target.setAttribute("aria-label", `内容加载中，动画已${animated ? "开启" : "关闭"}`);
    };

    toggle.addEventListener("click", () => {
      setAnimated(toggle.getAttribute("aria-checked") !== "true");
    });

    setAnimated(toggle.getAttribute("aria-checked") === "true");
  });
};

window.addEventListener("DOMContentLoaded", initSkeletonDemos);

const initWatermarkDemos = () => {
  document.querySelectorAll("[data-watermark-config]").forEach((demo) => {
    if (demo.dataset.watermarkReady) return;
    demo.dataset.watermarkReady = "true";

    const preview = demo.querySelector("[data-watermark-preview]");
    const form = demo.querySelector("form");
    const controls = [...demo.querySelectorAll("[data-watermark-control]")];
    const tiles = [...demo.querySelectorAll("[data-watermark-tile]")];
    if (!preview || !form || !controls.length || !tiles.length) return;

    const getControl = (name) => controls.find((control) => control.dataset.watermarkControl === name);
    const getValue = (name, fallback = "") => {
      const control = getControl(name);
      if (!control) return fallback;
      if (control.matches("[data-slider-demo]")) {
        return String(parseSliderValues(control)[0] ?? fallback);
      }
      if (control.hasAttribute("data-select-demo")) {
        return control.dataset.watermarkValue || fallback;
      }
      return String(control.value ?? fallback);
    };
    const getNumber = (name, fallback) => {
      const control = getControl(name);
      const value = Number(getValue(name, fallback));
      if (!Number.isFinite(value)) return fallback;
      const min = Number(control?.min ?? control?.dataset.sliderMin);
      const max = Number(control?.max ?? control?.dataset.sliderMax);
      return Math.min(Number.isFinite(max) ? max : value, Math.max(Number.isFinite(min) ? min : value, value));
    };
    const setOutput = (name, value) => {
      const output = demo.querySelector(`[data-watermark-output="${name}"]`);
      if (output) output.textContent = value;
    };

    const sync = () => {
      const content = getValue("content").trim() || "QIZHI Design System";
      const fontWeight = getValue("fontWeight", "500");
      const fontFamily = getValue("fontFamily", "sans-serif");
      const color = getValue("color", "#86909c");
      const fontSize = getNumber("fontSize", 16);
      const rotate = getNumber("rotate", -22);
      const zIndex = getNumber("zIndex", 1);
      const gapX = getNumber("gapX", 32);
      const gapY = getNumber("gapY", 24);
      const offsetX = getNumber("offsetX", 0);
      const offsetY = getNumber("offsetY", 0);

      tiles.forEach((tile) => {
        tile.textContent = content;
      });
      preview.style.setProperty("--watermark-color", color);
      preview.style.setProperty("--watermark-font-size", `${fontSize}px`);
      preview.style.setProperty("--watermark-font-weight", fontWeight);
      preview.style.setProperty("--watermark-font-family", fontFamily);
      preview.style.setProperty("--watermark-rotate", `${rotate}deg`);
      preview.style.setProperty("--watermark-z-index", String(zIndex));
      preview.style.setProperty("--watermark-gap-x", `${gapX}px`);
      preview.style.setProperty("--watermark-gap-y", `${gapY}px`);
      preview.style.setProperty("--watermark-offset-x", `${offsetX}px`);
      preview.style.setProperty("--watermark-offset-y", `${offsetY}px`);
      preview.setAttribute("aria-label", `${content} 水印预览`);

      setOutput("color", color.toUpperCase());
      setOutput("fontSize", `${fontSize}px`);
      setOutput("rotate", `${rotate}°`);
      setOutput("zIndex", String(zIndex));
    };

    controls.forEach((control) => {
      control.addEventListener("input", sync);
      control.addEventListener("change", sync);
      control.addEventListener("slider:change", sync);
      control.addEventListener("select-demo-change", (event) => {
        control.dataset.watermarkValue = event.detail.option?.dataset.watermarkValue || event.detail.value;
        sync();
      });
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    sync();
  });
};

window.addEventListener("DOMContentLoaded", initWatermarkDemos);

const initPopoverDemos = () => {
  const popoverDemos = [...document.querySelectorAll("[data-popover-demo]")];
  if (!popoverDemos.length) return;

  const closePinnedPopovers = (except) => {
    popoverDemos.forEach((popover) => {
      if (popover === except) return;
      popover.classList.remove("is-pinned", "is-open");
      popover.setAttribute("aria-expanded", "false");
    });
  };

  const setOpen = (popover, open) => {
    if (open) {
      closePinnedPopovers(popover);
    }

    popover.classList.toggle("is-open", open);
    popover.classList.toggle("is-pinned", open);
    popover.setAttribute("aria-expanded", String(open));
  };

  popoverDemos.forEach((popover) => {
    popover.setAttribute("aria-expanded", "false");

    popover.addEventListener("click", (event) => {
      const closeButton = event.target.closest("[data-popover-close]");
      if (closeButton && popover.contains(closeButton)) {
        event.stopPropagation();
        setOpen(popover, false);
        return;
      }

      const trigger = event.target.closest(".popover-demo__trigger, .qizhi-btn");
      if (!trigger || !popover.contains(trigger)) return;

      const triggerType = popover.dataset.popoverTrigger || "toggle";
      if (["hover", "focus", "contextmenu"].includes(triggerType)) return;

      event.stopPropagation();
      setOpen(popover, !popover.classList.contains("is-pinned"));
    });

    popover.addEventListener("contextmenu", (event) => {
      if (popover.dataset.popoverTrigger !== "contextmenu") return;

      const trigger = event.target.closest(".popover-demo__trigger, .qizhi-btn");
      if (!trigger || !popover.contains(trigger)) return;

      event.preventDefault();
      setOpen(popover, !popover.classList.contains("is-pinned"));
    });

    popover.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setOpen(popover, false);
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-popover-demo]")) return;
    closePinnedPopovers();
  });
};

window.addEventListener("DOMContentLoaded", initPopoverDemos);

const initDropdownDemos = () => {
  const dropdowns = [...document.querySelectorAll("[data-dropdown]")];
  if (!dropdowns.length) return;

  const setOpen = (dropdown, open, restoreFocus = false) => {
    const trigger = dropdown.querySelector(".qizhi-dropdown__trigger");
    const popup = dropdown.querySelector(".qizhi-dropdown__popup");
    if (!trigger || !popup) return;

    if (restoreFocus) trigger.focus({ preventScroll: true });

    dropdown.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    popup.hidden = !open;

    if (open && dropdown.closest("[data-top-navigation-demo]")) {
      const triggerRect = trigger.getBoundingClientRect();
      const popupWidth = popup.getBoundingClientRect().width;
      const alignRight = dropdown.classList.contains("qizhi-dropdown--br");
      const popupLeft = alignRight ? triggerRect.right - popupWidth : triggerRect.left;
      popup.style.setProperty("--qizhi-dropdown-popup-top", `${triggerRect.bottom + 8}px`);
      popup.style.setProperty("--qizhi-dropdown-popup-left", `${popupLeft}px`);
    }
  };

  const closeOthers = (except) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown !== except) setOpen(dropdown, false);
    });
  };

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".qizhi-dropdown__trigger");
    const popup = dropdown.querySelector(".qizhi-dropdown__popup");
    if (!trigger || !popup) return;
    const triggerMode = dropdown.dataset.dropdownTrigger || "hover";

    dropdown.addEventListener("mouseenter", () => {
      if (triggerMode !== "hover") return;
      closeOthers(dropdown);
      setOpen(dropdown, true);
    });

    dropdown.addEventListener("mouseleave", () => {
      if (triggerMode !== "hover") return;
      if (!dropdown.contains(document.activeElement)) setOpen(dropdown, false);
    });

    dropdown.addEventListener("focusin", () => {
      if (triggerMode !== "hover") return;
      closeOthers(dropdown);
      setOpen(dropdown, true);
    });

    dropdown.addEventListener("focusout", (event) => {
      if (!dropdown.contains(event.relatedTarget)) setOpen(dropdown, false);
    });

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldOpen = triggerMode === "click" ? !dropdown.classList.contains("is-open") : true;
      closeOthers(dropdown);
      setOpen(dropdown, shouldOpen);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      closeOthers(dropdown);
      setOpen(dropdown, true);
      popup.querySelector('[role^="menuitem"]')?.focus();
    });

    dropdown.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(dropdown, false, true);
    });

    popup.addEventListener("click", (event) => {
      const menuItem = event.target.closest('[role^="menuitem"]');
      if (!menuItem || menuItem.hasAttribute("aria-haspopup")) return;
      setOpen(dropdown, false, true);
    });

    dropdown.querySelectorAll(".qizhi-dropdown__submenu").forEach((submenu) => {
      const submenuTrigger = submenu.querySelector(".qizhi-dropdown__submenu-trigger");
      if (!submenuTrigger) return;

      submenu.addEventListener("mouseenter", () => submenuTrigger.setAttribute("aria-expanded", "true"));
      submenu.addEventListener("mouseleave", () => submenuTrigger.setAttribute("aria-expanded", "false"));
      submenu.addEventListener("focusin", () => submenuTrigger.setAttribute("aria-expanded", "true"));
      submenu.addEventListener("focusout", (event) => {
        if (!submenu.contains(event.relatedTarget)) submenuTrigger.setAttribute("aria-expanded", "false");
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-dropdown]")) return;
    closeOthers();
  });
};

window.addEventListener("DOMContentLoaded", initDropdownDemos);

const initTopNavigationMenuDemos = () => {
  const demos = [...document.querySelectorAll("[data-top-navigation-demo]")];
  if (!demos.length) return;

  demos.forEach((demo) => {
    const menuItems = [...demo.querySelectorAll("[data-top-navigation-item]")];
    const regionItems = [...demo.querySelectorAll(".qizhi-top-navigation__region [role='menuitemradio']")];
    const languageItems = [...demo.querySelectorAll("[data-language]")];
    const languageLabel = demo.querySelector("[data-language-label]");
    const regionLabel = demo.querySelector(".qizhi-top-navigation__region-trigger span");
    const regionTrigger = demo.querySelector(".qizhi-top-navigation__region-trigger");
    const scrollShell = demo.querySelector("[data-top-navigation-scroll-shell]");
    const scrollArea = demo.querySelector("[data-top-navigation-scroll-area]");
    const overflow = demo.querySelector("[data-top-navigation-overflow]");
    const overflowItems = [...demo.querySelectorAll("[data-top-navigation-overflow-item]")];

    const syncScrollMasks = () => {
      if (!scrollShell || !scrollArea) return;
      if (overflow) overflow.hidden = true;

      const allMenuItemsFit = scrollArea.scrollWidth <= scrollArea.clientWidth + 1;
      if (overflow) overflow.hidden = allMenuItemsFit;

      const maxScrollLeft = Math.max(0, scrollArea.scrollWidth - scrollArea.clientWidth);
      scrollShell.classList.toggle("can-scroll-left", scrollArea.scrollLeft > 1);
      scrollShell.classList.toggle(
        "can-scroll-right",
        scrollArea.scrollLeft < maxScrollLeft - 1,
      );

      const areaRect = scrollArea.getBoundingClientRect();
      menuItems.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const isHidden = !allMenuItemsFit
          && (itemRect.left < areaRect.left + 1 || itemRect.right > areaRect.right - 1);
        const overflowItem = overflowItems.find(
          (candidate) => Number(candidate.dataset.topNavigationOverflowItem) === index,
        );
        if (overflowItem) {
          overflowItem.hidden = !isHidden;
          overflowItem.classList.toggle("is-selected", item.classList.contains("is-active"));
        }
      });
    };

    scrollArea?.addEventListener("scroll", syncScrollMasks, { passive: true });
    scrollArea?.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (scrollArea.scrollWidth <= scrollArea.clientWidth) return;
      event.preventDefault();
      scrollArea.scrollLeft += event.deltaY;
    }, { passive: false });
    window.addEventListener("resize", syncScrollMasks);
    window.requestAnimationFrame(syncScrollMasks);

    const syncRegionTooltipPosition = () => {
      if (!regionTrigger) return;
      const triggerRect = regionTrigger.getBoundingClientRect();
      regionTrigger.style.setProperty(
        "--qizhi-region-tooltip-top",
        `${triggerRect.bottom + 8}px`,
      );
      regionTrigger.style.setProperty(
        "--qizhi-region-tooltip-left",
        `${triggerRect.left + triggerRect.width / 2}px`,
      );
    };

    regionTrigger?.addEventListener("mouseenter", syncRegionTooltipPosition);
    regionTrigger?.addEventListener("focus", () => {
      window.requestAnimationFrame(syncRegionTooltipPosition);
    });
    window.addEventListener("scroll", syncRegionTooltipPosition, { passive: true });
    window.addEventListener("resize", syncRegionTooltipPosition);

    const selectMenuItem = (selected) => {
      menuItems.forEach((item) => {
        const isSelected = item === selected;
        item.classList.toggle("is-active", isSelected);
        item.tabIndex = isSelected ? 0 : -1;
        if (isSelected) {
          item.setAttribute("aria-current", "page");
        } else {
          item.removeAttribute("aria-current");
        }
      });
      syncScrollMasks();
    };

    menuItems.forEach((item, index) => {
      item.addEventListener("click", () => selectMenuItem(item));
      item.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();

        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + menuItems.length) % menuItems.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % menuItems.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = menuItems.length - 1;
        menuItems[nextIndex].focus();
      });
    });

    overflowItems.forEach((item) => {
      item.addEventListener("click", () => {
        const index = Number(item.dataset.topNavigationOverflowItem);
        const selected = menuItems[index];
        if (!selected) return;
        selectMenuItem(selected);
        selected.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      });
    });

    regionItems.forEach((item) => {
      if (item.disabled) return;
      item.addEventListener("click", () => {
        regionItems.forEach((candidate) => {
          const isSelected = candidate === item;
          candidate.classList.toggle("is-selected", isSelected);
          candidate.setAttribute("aria-checked", String(isSelected));
        });
        if (regionLabel) {
          regionLabel.textContent = item.textContent.replace(/机房$/, "");
        }
      });
    });

    languageItems.forEach((item) => {
      item.addEventListener("click", () => {
        languageItems.forEach((candidate) => {
          const isSelected = candidate === item;
          candidate.classList.toggle("is-selected", isSelected);
          candidate.setAttribute("aria-checked", String(isSelected));
        });
        if (languageLabel) languageLabel.textContent = item.dataset.language || item.textContent;
      });
    });
  });
};

window.addEventListener("DOMContentLoaded", initTopNavigationMenuDemos);

const initEmbeddedMenuDemos = () => {
  const demos = [...document.querySelectorAll("[data-embedded-menu-demo]")];
  if (!demos.length) return;

  demos.forEach((demo) => {
    const items = [...demo.querySelectorAll("[role='menuitem']")];
    const spaceItems = [...demo.querySelectorAll("[data-embedded-space]")];
    const spaceLabel = demo.querySelector("[data-embedded-space-label]");
    const spaceTrigger = demo.querySelector(".qizhi-embedded-menu__workspace");
    if (!items.length) return;

    const selectItem = (selected) => {
      items.forEach((item) => {
        const isSelected = item === selected;
        item.classList.toggle("is-selected", isSelected);
        item.tabIndex = isSelected ? 0 : -1;
        if (isSelected) {
          item.setAttribute("aria-current", "page");
        } else {
          item.removeAttribute("aria-current");
        }
      });
    };

    items.forEach((item, index) => {
      item.addEventListener("click", () => selectItem(item));
      item.addEventListener("keydown", (event) => {
        if (["Enter", " "].includes(event.key)) {
          event.preventDefault();
          selectItem(item);
          return;
        }

        if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        event.preventDefault();

        let nextIndex = index;
        if (event.key === "ArrowUp") nextIndex = (index - 1 + items.length) % items.length;
        if (event.key === "ArrowDown") nextIndex = (index + 1) % items.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = items.length - 1;
        items[nextIndex].focus();
      });
    });

    spaceItems.forEach((item) => {
      item.addEventListener("click", () => {
        const spaceName = item.dataset.embeddedSpace || item.textContent.trim();
        spaceItems.forEach((candidate) => {
          const isSelected = candidate === item;
          candidate.classList.toggle("is-selected", isSelected);
          candidate.setAttribute("aria-checked", String(isSelected));
        });
        if (spaceLabel) spaceLabel.textContent = spaceName;
        if (spaceTrigger) {
          spaceTrigger.setAttribute("aria-label", `切换工作空间，当前${spaceName}`);
          spaceTrigger.dataset.tooltip = spaceName;
        }
      });
    });

    const syncSpaceTooltipPosition = () => {
      if (!spaceTrigger) return;
      const triggerRect = spaceTrigger.getBoundingClientRect();
      spaceTrigger.style.setProperty("--qizhi-space-tooltip-top", `${triggerRect.bottom + 8}px`);
      spaceTrigger.style.setProperty(
        "--qizhi-space-tooltip-left",
        `${triggerRect.left + triggerRect.width / 2}px`,
      );
    };

    spaceTrigger?.addEventListener("mouseenter", syncSpaceTooltipPosition);
    spaceTrigger?.addEventListener("focus", syncSpaceTooltipPosition);
  });
};

window.addEventListener("DOMContentLoaded", initEmbeddedMenuDemos);

const initTreeDemos = () => {
  const treeData = [
    {
      key: "tree-data-0-0",
      title: "Trunk 0-0",
      children: [
        {
          key: "tree-data-0-0-2",
          title: "Branch 0-0-2",
          disabled: true,
          children: [
            {
              key: "tree-data-0-0-2-1",
              title: "Leaf",
              children: [
                {
                  key: "tree-data-0-0-2-1-0",
                  title: "Leafsss 0-0-2",
                  children: [{ key: "tree-data-0-0-2-1-0-0", title: "Leaf" }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: "tree-data-0-1",
      title: "Trunk 0-1",
      children: [
        { key: "tree-data-0-1-1", title: "Leaf 0-1-1" },
        { key: "tree-data-0-1-2", title: "Leaf 0-1-2" },
      ],
    },
  ];

  const createTreeDataElement = (tagName, className) => {
    const element = document.createElement(tagName);
    element.className = className;
    return element;
  };

  const renderTreeDataGroup = (item, level, ancestorIsTail, isTail) => {
    const group = createTreeDataElement("div", "tree-demo__node-group");
    group.setAttribute("data-tree-node-group", "");

    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const nodeClasses = ["qizhi-tree-node"];
    if (hasChildren) nodeClasses.push("qizhi-tree-node-expanded");
    else nodeClasses.push("qizhi-tree-node-is-leaf");
    if (item.disabled) nodeClasses.push("qizhi-tree-node-disabled-selectable");
    if (isTail) nodeClasses.push("qizhi-tree-node-is-tail");

    const node = createTreeDataElement("div", nodeClasses.join(" "));
    node.setAttribute("role", "treeitem");
    node.setAttribute("aria-level", String(level));
    node.setAttribute("data-tree-node", "");
    node.setAttribute("data-tree-key", item.key);
    if (hasChildren) node.setAttribute("aria-expanded", "true");
    if (item.disabled) node.setAttribute("aria-disabled", "true");

    const indent = createTreeDataElement("span", "qizhi-tree-node-indent");
    indent.setAttribute("aria-hidden", "true");
    ancestorIsTail.forEach((tail) => {
      const block = createTreeDataElement(
        "span",
        `qizhi-tree-node-indent-block${tail ? " qizhi-tree-node-indent-block-lineless" : ""}`,
      );
      indent.append(block);
    });

    const switcher = createTreeDataElement(hasChildren ? "button" : "span", "qizhi-tree-node-switcher");
    if (hasChildren) {
      switcher.type = "button";
      switcher.classList.add("qizhi-tree-node-switcher-expanded");
      switcher.setAttribute("aria-label", "收起节点");
      switcher.setAttribute("data-tree-toggle", "");
    }

    const title = createTreeDataElement("button", "qizhi-tree-node-title qizhi-tree-node-title-block");
    title.type = "button";
    title.disabled = !!item.disabled;
    title.setAttribute("data-tree-select", "");
    const titleText = createTreeDataElement("span", "qizhi-tree-node-title-text");
    titleText.textContent = item.title;
    title.append(titleText);
    node.append(indent, switcher, title);
    group.append(node);

    if (hasChildren) {
      const children = createTreeDataElement("div", "tree-demo__children");
      children.setAttribute("data-tree-children", "");
      item.children.forEach((child, index) => {
        children.append(
          renderTreeDataGroup(
            child,
            level + 1,
            [...ancestorIsTail, isTail],
            index === item.children.length - 1,
          ),
        );
      });
      group.append(children);
    }

    return group;
  };

  document.querySelectorAll("[data-tree-data-demo]").forEach((demo) => {
    const treeRoot = demo.querySelector(".qizhi-tree");
    if (!treeRoot) return;
    treeRoot.replaceChildren(
      ...treeData.map((item, index) =>
        renderTreeDataGroup(item, 1, [], index === treeData.length - 1),
      ),
    );
  });

  const trees = [...document.querySelectorAll("[data-tree-demo]")];
  if (!trees.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const treeTransitionCleanups = new WeakMap();
  let activeTreeTransitions = 0;

  const beginTreeTransition = () => {
    activeTreeTransitions += 1;
    document.documentElement.classList.add("is-tree-transitioning");
  };

  const endTreeTransition = () => {
    activeTreeTransitions = Math.max(0, activeTreeTransitions - 1);
    if (activeTreeTransitions === 0) {
      document.documentElement.classList.remove("is-tree-transitioning");
    }
  };

  const keepNodeInPlace = (node, topBefore) => {
    const topAfter = node.getBoundingClientRect().top;
    const delta = topAfter - topBefore;
    if (Math.abs(delta) > 0.5) {
      window.scrollBy(0, delta);
    }
  };

  const lockNodePositionDuringTransition = (node, topBefore) => {
    const startedAt = performance.now();
    const lock = () => {
      keepNodeInPlace(node, topBefore);
      if (performance.now() - startedAt < 420) {
        requestAnimationFrame(lock);
      }
    };
    requestAnimationFrame(lock);
  };

  const setTreeChildrenExpanded = (children, expanded, anchorNode) => {
    const topBefore = anchorNode.getBoundingClientRect().top;
    treeTransitionCleanups.get(children)?.();
    beginTreeTransition();

    if (reduceMotion) {
      children.hidden = !expanded;
      keepNodeInPlace(anchorNode, topBefore);
      endTreeTransition();
      return;
    }

    children.classList.remove("is-tree-expanding", "is-tree-collapsing");
    children.style.height = "";
    children.style.opacity = "";

    if (expanded) {
      children.hidden = false;
      children.classList.add("is-tree-expanding");
      children.style.height = "0px";
      children.style.opacity = "0";

      requestAnimationFrame(() => {
        children.style.height = `${children.scrollHeight}px`;
        children.style.opacity = "1";
      });
    } else {
      children.classList.add("is-tree-collapsing");
      children.style.height = `${children.getBoundingClientRect().height}px`;
      children.style.opacity = "1";

      requestAnimationFrame(() => {
        children.style.height = "0px";
        children.style.opacity = "0";
      });
    }

    lockNodePositionDuringTransition(anchorNode, topBefore);

    let fallbackTimer = null;
    const handleTransitionEnd = (event) => {
      if (event.target !== children || event.propertyName !== "height") return;
      finishTransition();
    };

    const finishTransition = () => {
      children.removeEventListener("transitionend", handleTransitionEnd);
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
      treeTransitionCleanups.delete(children);
      children.classList.remove("is-tree-expanding", "is-tree-collapsing");
      children.style.height = "";
      children.style.opacity = "";
      children.hidden = !expanded;
      keepNodeInPlace(anchorNode, topBefore);
      window.setTimeout(() => {
        keepNodeInPlace(anchorNode, topBefore);
        endTreeTransition();
      }, 80);
    };

    children.addEventListener("transitionend", handleTransitionEnd);
    fallbackTimer = window.setTimeout(finishTransition, 280);
    treeTransitionCleanups.set(children, finishTransition);
  };

  const getSelectedTreeKeys = (tree) =>
    [...tree.querySelectorAll(".qizhi-tree-node-selected")]
      .map((node) => node.getAttribute("data-tree-key"))
      .filter(Boolean);

  const updateMultipleTreeCurrent = (tree) => {
    const demo = tree.closest(".tree-multiple-demo");
    const current = demo?.querySelector("[data-tree-current]");
    if (!current) return;

    current.textContent = getSelectedTreeKeys(tree).join(" , ");
  };

  const setCheckboxState = (label, checked, indeterminate = false) => {
    const input = label?.querySelector("[data-tree-check], [data-tree-check-strict-toggle], [data-tree-multiple-toggle]");
    if (!label || !input || input.disabled) return;

    input.checked = checked;
    input.indeterminate = indeterminate;
    label.classList.toggle("qizhi-checkbox-checked", checked);
    label.classList.toggle("qizhi-checkbox-indeterminate", indeterminate);
  };

  const getNodeCheckbox = (node) => node?.querySelector(":scope > .tree-node-checkbox");

  const getNodeCheckboxInput = (node) => getNodeCheckbox(node)?.querySelector("[data-tree-check]");

  const getDirectChildNodes = (group) =>
    [...(group?.querySelector(":scope > [data-tree-children]")?.children || [])]
      .map((child) =>
        child.matches?.("[data-tree-node]")
          ? child
          : child.querySelector?.(":scope > [data-tree-node]"),
      )
      .filter(Boolean);

  const getDescendantNodes = (group) =>
    [...(group?.querySelectorAll(":scope > [data-tree-children] [data-tree-node]") || [])];

  const updateCheckableAncestors = (node) => {
    let group = node.closest("[data-tree-node-group]")?.parentElement?.closest("[data-tree-node-group]");

    while (group) {
      const parentNode = group.querySelector(":scope > [data-tree-node]");
      const parentLabel = getNodeCheckbox(parentNode);
      const parentInput = getNodeCheckboxInput(parentNode);
      if (parentLabel && parentInput && !parentInput.disabled) {
        const childInputs = getDirectChildNodes(group)
          .map(getNodeCheckboxInput)
          .filter((input) => input && !input.disabled);
        const checkedCount = childInputs.filter((input) => input.checked).length;
        const indeterminateCount = childInputs.filter((input) => input.indeterminate).length;
        const checked = childInputs.length > 0 && checkedCount === childInputs.length && indeterminateCount === 0;
        const indeterminate =
          childInputs.length > 0 &&
          !checked &&
          (checkedCount > 0 || indeterminateCount > 0);
        setCheckboxState(parentLabel, checked, indeterminate);
      }

      group = group.parentElement?.closest("[data-tree-node-group]");
    }
  };

  const setCheckableNode = (tree, node, checked) => {
    const label = getNodeCheckbox(node);
    const input = getNodeCheckboxInput(node);
    if (!label || !input || input.disabled) return;

    const strict = tree.getAttribute("data-tree-check-strict") === "true";
    setCheckboxState(label, checked, false);

    if (!strict) {
      const group = node.closest("[data-tree-node-group]");
      getDescendantNodes(group).forEach((descendantNode) => {
        const descendantLabel = getNodeCheckbox(descendantNode);
        const descendantInput = getNodeCheckboxInput(descendantNode);
        if (!descendantLabel || !descendantInput || descendantInput.disabled) return;
        setCheckboxState(descendantLabel, checked, false);
      });
      updateCheckableAncestors(node);
    }
  };

  const syncCheckableTree = (tree) => {
    tree.querySelectorAll("[data-tree-check]").forEach((input) => {
      const label = input.closest(".qizhi-checkbox");
      label?.classList.toggle("qizhi-checkbox-disabled", input.disabled);
      label?.setAttribute("aria-disabled", String(input.disabled));
      if (!input.disabled) {
        setCheckboxState(label, input.checked, input.indeterminate);
      }
    });
  };

  const getCheckableInputs = (tree) =>
    [...tree.querySelectorAll("[data-tree-check]")].filter((input) => !input.disabled);

  const getExpandableNodes = (tree) =>
    [...tree.querySelectorAll("[data-tree-node][aria-expanded]")].filter((node) => {
      const group = node.closest("[data-tree-node-group]");
      return !!group?.querySelector(":scope > [data-tree-children]");
    });

  const updateControlledTreeActions = (tree) => {
    const demo = tree.closest(".tree-controlled-demo");
    if (!demo) return;

    const checkButton = demo.querySelector("[data-tree-control-check] span");
    const foldButton = demo.querySelector("[data-tree-control-fold] span");
    const checkableInputs = getCheckableInputs(tree);
    const expandableNodes = getExpandableNodes(tree);
    const allChecked =
      checkableInputs.length > 0 && checkableInputs.every((input) => input.checked);
    const allExpanded =
      expandableNodes.length > 0 &&
      expandableNodes.every((node) => node.getAttribute("aria-expanded") === "true");

    if (checkButton) checkButton.textContent = allChecked ? "deselect all" : "select all";
    if (foldButton) foldButton.textContent = allExpanded ? "fold" : "unfold";
  };

  const setControlledExpanded = (tree, expanded) => {
    getExpandableNodes(tree).forEach((node) => {
      const group = node.closest("[data-tree-node-group]");
      const children = group?.querySelector(":scope > [data-tree-children]");
      const toggle = node.querySelector(":scope > [data-tree-toggle]");
      if (!children || !toggle) return;

      node.setAttribute("aria-expanded", String(expanded));
      node.classList.toggle("qizhi-tree-node-expanded", expanded);
      toggle.classList.toggle("qizhi-tree-node-switcher-expanded", expanded);
      toggle.setAttribute("aria-label", expanded ? "收起节点" : "展开节点");
      children.hidden = !expanded;
      children.classList.remove("is-tree-expanding", "is-tree-collapsing");
      children.style.height = "";
      children.style.opacity = "";
    });

    updateControlledTreeActions(tree);
  };

  const setRadioGroupValue = (group, value) => {
    group.querySelectorAll(".qizhi-segmented-item").forEach((label) => {
      const input = label.querySelector("input");
      const checked = input?.value === value;
      if (input) input.checked = checked;
      label.classList.toggle("is-active", checked);
    });
  };

  const getTreeNodeDepth = (node) =>
    Number(node.getAttribute("aria-level") || 1);

  const getCheckedTreeKeys = (tree) =>
    [...tree.querySelectorAll("[data-tree-check]")]
      .filter((input) => input.checked)
      .map((input) => input.closest("[data-tree-node]")?.getAttribute("data-tree-key"))
      .filter(Boolean);

  const getLeafCheckedTreeKeys = (tree) =>
    [...tree.querySelectorAll("[data-tree-check]")]
      .filter((input) => {
        const node = input.closest("[data-tree-node]");
        return input.checked && node?.classList.contains("qizhi-tree-node-is-leaf");
      })
      .map((input) => input.closest("[data-tree-node]")?.getAttribute("data-tree-key"))
      .filter(Boolean);

  const getParentCheckedTreeKeys = (tree) => {
    const checkedNodes = [...tree.querySelectorAll("[data-tree-check]")]
      .filter((input) => input.checked)
      .map((input) => input.closest("[data-tree-node]"))
      .filter(Boolean);

    return checkedNodes
      .filter((node) => {
        const depth = getTreeNodeDepth(node);
        return !checkedNodes.some((otherNode) => {
          if (otherNode === node || getTreeNodeDepth(otherNode) >= depth) return false;
          return otherNode.closest("[data-tree-node-group]")?.contains(node);
        });
      })
      .map((node) => node.getAttribute("data-tree-key"))
      .filter(Boolean);
  };

  const updateTreeStrategyCurrent = (tree) => {
    const demo = tree.closest(".tree-strategy-demo");
    const current = demo?.querySelector("[data-tree-strategy-current]");
    if (!current) return;

    const strategy = tree.getAttribute("data-tree-checked-strategy") || "all";
    const keys =
      strategy === "parent"
        ? getParentCheckedTreeKeys(tree)
        : strategy === "child"
          ? getLeafCheckedTreeKeys(tree)
          : getCheckedTreeKeys(tree);

    current.textContent = keys.join(" , ");
  };

  const appendLoadedTreeState = (node, toggle, children) => {
    node.setAttribute("data-tree-loaded", "true");
    node.setAttribute("aria-expanded", "true");
    node.classList.add("qizhi-tree-node-expanded");
    toggle.classList.remove("is-loading");
    toggle.classList.add("qizhi-tree-node-switcher-expanded");
    toggle.setAttribute("aria-label", "收起节点");
    children.hidden = false;
  };

  const renderTreeSearchTitle = (node, query) => {
    const text = node.getAttribute("data-tree-search-title") || "";
    const title = node.querySelector(".qizhi-tree-node-title-text");
    if (!title) return;

    if (!query) {
      title.textContent = text;
      return;
    }

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index < 0) {
      title.textContent = text;
      return;
    }

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);
    title.replaceChildren(
      document.createTextNode(before),
      Object.assign(document.createElement("mark"), { textContent: match }),
      document.createTextNode(after),
    );
  };

  const filterSearchTreeGroup = (group, query) => {
    const node = group.querySelector(":scope > [data-tree-node]");
    const children = group.querySelector(":scope > [data-tree-children]");
    const title = node?.getAttribute("data-tree-search-title") || "";
    const selfMatched = !query || title.toLowerCase().includes(query.toLowerCase());
    let childMatched = false;

    children?.querySelectorAll(":scope > [data-tree-node], :scope > [data-tree-node-group]").forEach((child) => {
      if (child.matches("[data-tree-node-group]")) {
        childMatched = filterSearchTreeGroup(child, query) || childMatched;
        return;
      }

      const childTitle = child.getAttribute("data-tree-search-title") || "";
      const matched = !query || childTitle.toLowerCase().includes(query.toLowerCase());
      renderTreeSearchTitle(child, query);
      child.hidden = !matched;
      childMatched = matched || childMatched;
    });

    const visible = selfMatched || childMatched;
    renderTreeSearchTitle(node, query);
    if (node) {
      node.hidden = !visible;
      if (query && children && visible) {
        node.setAttribute("aria-expanded", "true");
        node.classList.add("qizhi-tree-node-expanded");
        node.querySelector(":scope > [data-tree-toggle]")?.classList.add("qizhi-tree-node-switcher-expanded");
      }
    }
    if (children) {
      children.hidden = !visible;
    }
    group.hidden = !visible;
    return visible;
  };

  const setTreeSelected = (tree, node) => {
    const isMultipleDemo = tree.hasAttribute("data-tree-multiple-demo");
    const isMultiple =
      tree.getAttribute("aria-multiselectable") === "true" ||
      tree.querySelector('[role="tree"]')?.getAttribute("aria-multiselectable") === "true";

    if (isMultipleDemo && isMultiple) {
      const selected = node.classList.toggle("qizhi-tree-node-selected");
      node.setAttribute("aria-selected", String(selected));
      updateMultipleTreeCurrent(tree);
      return;
    }

    tree.querySelectorAll(".qizhi-tree-node-selected").forEach((selectedNode) => {
      selectedNode.classList.remove("qizhi-tree-node-selected");
      selectedNode.removeAttribute("aria-selected");
    });
    node.classList.add("qizhi-tree-node-selected");
    node.setAttribute("aria-selected", "true");
    updateMultipleTreeCurrent(tree);
  };

  trees.forEach((tree) => {
    updateMultipleTreeCurrent(tree);
    syncCheckableTree(tree);

    tree.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-tree-toggle]");

      if (toggle && tree.contains(toggle)) {
        const node = toggle.closest("[data-tree-node]");
        const group = node?.closest("[data-tree-node-group]");
        const children = group?.querySelector(":scope > [data-tree-children]");
        if (!node || !children) return;

        if (
          toggle.hasAttribute("data-tree-load-more") &&
          node.getAttribute("data-tree-loaded") !== "true"
        ) {
          toggle.classList.add("is-loading");
          toggle.setAttribute("aria-label", "加载中");
          window.setTimeout(() => {
            appendLoadedTreeState(node, toggle, children);
          }, 700);
          return;
        }

        const expanded = node.getAttribute("aria-expanded") === "true";
        node.setAttribute("aria-expanded", String(!expanded));
        node.classList.toggle("qizhi-tree-node-expanded", !expanded);
        toggle.classList.toggle("qizhi-tree-node-switcher-expanded", !expanded);
        toggle.setAttribute("aria-label", expanded ? "展开节点" : "收起节点");
        setTreeChildrenExpanded(children, !expanded, node);
        return;
      }

      const check = event.target.closest("[data-tree-check]");
      if (check && tree.contains(check)) {
        const node = check.closest("[data-tree-node]");
        if (!node) return;
        setCheckableNode(tree, node, check.checked);
        updateControlledTreeActions(tree);
        updateTreeStrategyCurrent(tree);
        return;
      }

      const title = event.target.closest("[data-tree-select]");
      if (!title || !tree.contains(title) || title.disabled) return;

      const node = title.closest("[data-tree-node]");
      if (!node || node.classList.contains("qizhi-tree-node-disabled")) return;

      setTreeSelected(tree, node);
    });
  });

  document.querySelectorAll("[data-tree-controlled-demo]").forEach((tree) => {
    const demo = tree.closest(".tree-controlled-demo");

    updateControlledTreeActions(tree);

    demo?.querySelector("[data-tree-control-check]")?.addEventListener("click", () => {
      const inputs = getCheckableInputs(tree);
      const shouldCheck = !inputs.every((input) => input.checked);

      inputs.forEach((input) => {
        setCheckboxState(input.closest(".qizhi-checkbox"), shouldCheck, false);
      });
      updateControlledTreeActions(tree);
    });

    demo?.querySelector("[data-tree-control-fold]")?.addEventListener("click", () => {
      const expandableNodes = getExpandableNodes(tree);
      const shouldExpand = !expandableNodes.every(
        (node) => node.getAttribute("aria-expanded") === "true",
      );

      setControlledExpanded(tree, shouldExpand);
    });
  });

  document.querySelectorAll("[data-tree-strategy-demo]").forEach((tree) => {
    updateTreeStrategyCurrent(tree);

    tree.closest(".tree-strategy-demo")?.querySelectorAll("[data-tree-strategy-radio] input").forEach((input) => {
      input.addEventListener("change", () => {
        const group = input.closest("[data-tree-strategy-radio]");
        setRadioGroupValue(group, input.value);
        tree.setAttribute("data-tree-checked-strategy", input.value);
        tree.querySelectorAll("[data-tree-check]").forEach((checkbox) => {
          setCheckboxState(checkbox.closest(".qizhi-checkbox"), false, false);
        });
        updateTreeStrategyCurrent(tree);
      });
    });
  });

  document.querySelectorAll("[data-tree-size-demo]").forEach((tree) => {
    const treeRoot = tree.querySelector(".qizhi-tree");

    tree.closest(".tree-size-demo")?.querySelectorAll("[data-tree-size-radio] input").forEach((input) => {
      input.addEventListener("change", () => {
        const group = input.closest("[data-tree-size-radio]");
        setRadioGroupValue(group, input.value);
        treeRoot?.classList.remove(
          "qizhi-tree-size-mini",
          "qizhi-tree-size-small",
          "qizhi-tree-size-default",
          "qizhi-tree-size-large",
        );
        treeRoot?.classList.add(`qizhi-tree-size-${input.value}`);
      });
    });
  });

  document.querySelectorAll("[data-tree-drag-check-toggle]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const demo = toggle.closest(".tree-drag-demo");
      const tree = demo?.querySelector("[data-tree-drag-demo]");
      if (!tree) return;

      const checked = toggle.checked;
      setCheckboxState(toggle.closest(".qizhi-checkbox"), checked, false);
      tree.querySelector(".qizhi-tree")?.classList.toggle("qizhi-tree-checkable", checked);
      tree.querySelectorAll(".tree-node-checkbox").forEach((label) => {
        label.hidden = !checked;
      });
      syncCheckableTree(tree);
    });
  });

  document.querySelectorAll("[data-tree-drag-demo]").forEach((tree) => {
    let draggedGroup = null;

    tree.querySelectorAll("[data-tree-drag-handle]").forEach((handle) => {
      handle.addEventListener("dragstart", (event) => {
        draggedGroup = handle.closest("[data-tree-node-group]") || handle.closest("[data-tree-node]");
        event.dataTransfer?.setData("text/plain", handle.closest("[data-tree-node]")?.getAttribute("data-tree-key") || "");
        handle.setAttribute("aria-grabbed", "true");
      });

      handle.addEventListener("dragend", () => {
        handle.setAttribute("aria-grabbed", "false");
        draggedGroup = null;
      });
    });

    tree.addEventListener("dragover", (event) => {
      if (event.target.closest("[data-tree-drag-handle]")) {
        event.preventDefault();
      }
    });

    tree.addEventListener("drop", (event) => {
      const targetNode = event.target.closest("[data-tree-node]");
      const targetGroup = targetNode?.closest("[data-tree-node-group]") || targetNode;
      if (!draggedGroup || !targetNode || !targetGroup || draggedGroup === targetGroup) return;
      if (draggedGroup.contains(targetGroup)) return;

      event.preventDefault();
      targetGroup.before(draggedGroup);
      const draggedNode = draggedGroup.matches("[data-tree-node]")
        ? draggedGroup
        : draggedGroup.querySelector(":scope > [data-tree-node]");
      draggedNode?.classList.add("tree-node-dropover");
      window.setTimeout(() => {
        draggedNode?.classList.remove("tree-node-dropover");
      }, 900);
    });
  });

  document.querySelectorAll("[data-tree-search-demo]").forEach((tree) => {
    const demo = tree.closest(".tree-search-demo");
    const input = demo?.querySelector("[data-tree-search-input]");
    if (!input) return;

    const updateSearch = () => {
      const query = input.value.trim();
      tree.querySelectorAll(":scope > .qizhi-tree > [data-tree-node-group]").forEach((group) => {
        filterSearchTreeGroup(group, query);
      });
    };

    input.addEventListener("input", updateSearch);
    updateSearch();
  });

  document.querySelectorAll("[data-tree-multiple-toggle]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const demo = toggle.closest(".tree-multiple-demo");
      const tree = demo?.querySelector("[data-tree-multiple-demo]");
      if (!tree) return;

      const checked = toggle.checked;
      toggle.closest(".qizhi-checkbox")?.classList.toggle("qizhi-checkbox-checked", checked);
      tree.querySelector(".qizhi-tree")?.setAttribute("aria-multiselectable", String(checked));
      tree.setAttribute("aria-multiselectable", String(checked));
      tree.querySelectorAll(".qizhi-tree-node-selected").forEach((selectedNode) => {
        selectedNode.classList.remove("qizhi-tree-node-selected");
        selectedNode.removeAttribute("aria-selected");
      });
      updateMultipleTreeCurrent(tree);
    });
  });

  document.querySelectorAll("[data-tree-check-strict-toggle]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const demo = toggle.closest(".tree-checkable-demo");
      const tree = demo?.querySelector("[data-tree-checkable-demo]");
      if (!tree) return;

      const checked = toggle.checked;
      setCheckboxState(toggle.closest(".qizhi-checkbox"), checked, false);
      tree.setAttribute("data-tree-check-strict", String(checked));
      tree.querySelectorAll("[data-tree-check]").forEach((input) => {
        if (input.disabled) return;
        input.checked = false;
        input.indeterminate = false;
        const label = input.closest(".qizhi-checkbox");
        label?.classList.remove("qizhi-checkbox-checked", "qizhi-checkbox-indeterminate");
      });
    });
  });
};

window.addEventListener("DOMContentLoaded", initTreeDemos);

const getDirectChildByClassName = (node, className) =>
  [...node.children].find((child) => child.classList.contains(className));

const TABS_TAB_SELECTOR = ":is(.qizhi-tabs-tab, .qizhi-tabs-header-title)";
const TABS_HEADER_SELECTOR = ":is(.qizhi-tabs-header)";
const TABS_CONTENT_SELECTOR = ":is(.qizhi-tabs-content)";
const TABS_SCROLL_TRACK_SELECTOR = ":is(.tabs-demo__scroll-list, .qizhi-tabs-header-wrapper)";

const getTabsDemoContent = (tabsDemo) =>
  getDirectChildByClassName(tabsDemo, "qizhi-tabs-content") ||
  tabsDemo.querySelector(`:scope > .tabs-demo__scroll-body > ${TABS_CONTENT_SELECTOR}`);

const getTabLabel = (tab) =>
  tab.textContent
    .replace(/\s+/g, " ")
    .replace(/[×xX]$/, "")
    .trim();

const TAB_CN_NUMBERS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

const getTabContentLabel = (label) => {
  const match = label.match(/^Tab\s*(\d+)$/i);
  if (!match) return label;

  const index = Number(match[1]);
  return `标签${TAB_CN_NUMBERS[index] || index}`;
};

const normalizeQIZHITabText = (tab) => {
  if (!tab?.classList.contains("qizhi-tabs-tab") || tab.querySelector(":scope > .qizhi-tabs-tab-text")) return;

  const label = document.createElement("span");
  label.className = "qizhi-tabs-tab-text";
  [...tab.childNodes].forEach((node) => {
    label.append(node);
  });

  tab.prepend(label);
};

const getTabsInkTrack = (tab, header) =>
  tab.closest(TABS_SCROLL_TRACK_SELECTOR) || header;

const shouldUseTabsInkBar = (tabsDemo) =>
  !tabsDemo.classList.contains("tabs-demo--card") &&
  !tabsDemo.classList.contains("tabs-demo--capsule") &&
  tabsDemo.dataset.tabType !== "card" &&
  tabsDemo.dataset.tabType !== "card-gutter" &&
  tabsDemo.dataset.tabType !== "text" &&
  tabsDemo.dataset.tabType !== "capsule";

const syncPositionTabsClasses = (tabsDemo, position) => {
  if (!tabsDemo) return;

  const isTop = position === "top";
  tabsDemo.classList.toggle("qizhi-tabs-horizontal", isTop);
  tabsDemo.classList.toggle("qizhi-tabs-vertical", !isTop);
  tabsDemo.classList.toggle("qizhi-tabs-top", isTop);
  tabsDemo.classList.toggle("qizhi-tabs-left", position === "left");
  tabsDemo.classList.toggle("qizhi-tabs-right", position === "right");

  const nav = tabsDemo.querySelector(".qizhi-tabs-header-nav");
  nav?.classList.toggle("qizhi-tabs-header-nav-horizontal", isTop);
  nav?.classList.toggle("qizhi-tabs-header-nav-vertical", !isTop);
  nav?.classList.toggle("qizhi-tabs-header-nav-top", isTop);
  nav?.classList.toggle("qizhi-tabs-header-nav-left", position === "left");
  nav?.classList.toggle("qizhi-tabs-header-nav-right", position === "right");
};

const updateTabsInkBar = (tabsDemo, activeTab) => {
  if (!tabsDemo || !activeTab) return;

  const header = activeTab.closest(TABS_HEADER_SELECTOR);
  const track = header ? getTabsInkTrack(activeTab, header) : null;
  if (!track) return;

  const directInkBars = [...track.querySelectorAll(":scope > .tabs-demo__ink-bar, :scope > .qizhi-tabs-header-ink")];
  let inkBar = directInkBars[0] || null;
  if (!shouldUseTabsInkBar(tabsDemo)) {
    directInkBars.forEach((bar) => bar.remove());
    return;
  }
  directInkBars.slice(1).forEach((bar) => bar.remove());

  if (!inkBar) {
    inkBar = document.createElement(track.classList.contains("qizhi-tabs-header-wrapper") ? "div" : "span");
    inkBar.className = track.classList.contains("qizhi-tabs-header-wrapper")
      ? "qizhi-tabs-header-ink tabs-demo__ink-bar"
      : "tabs-demo__ink-bar";
    inkBar.setAttribute("aria-hidden", "true");
    track.append(inkBar);
  }

  tabsDemo.classList.add("is-animated-tabs");

  const tabRect = activeTab.getBoundingClientRect();
  const trackRect = track.getBoundingClientRect();
  const label = activeTab.querySelector(":scope > .qizhi-tabs-tab-text, :scope > .qizhi-tabs-header-title-text");
  const labelRect = label?.getBoundingClientRect();
  const labelStyle = label ? window.getComputedStyle(label) : null;
  const labelPaddingTop = Number.parseFloat(labelStyle?.paddingTop || "0");
  const labelPaddingRight = Number.parseFloat(labelStyle?.paddingRight || "0");
  const labelPaddingBottom = Number.parseFloat(labelStyle?.paddingBottom || "0");
  const labelPaddingLeft = Number.parseFloat(labelStyle?.paddingLeft || "0");
  const isVertical =
    tabsDemo.classList.contains("tabs-demo--left") ||
    tabsDemo.classList.contains("tabs-demo--right") ||
    tabsDemo.classList.contains("tabs-demo--nested-outer") ||
    tabsDemo.classList.contains("tabs-demo--scroll-vertical") ||
    ["left", "right"].includes(tabsDemo.closest(".tabs-position-demo")?.dataset.tabPosition);

  if (isVertical) {
    const isPositionTabs = ["left", "right"].includes(tabsDemo.closest(".tabs-position-demo")?.dataset.tabPosition);
    const isScrollVertical = tabsDemo.classList.contains("tabs-demo--scroll-vertical");
    const labelContentHeight = labelRect
      ? labelRect.height - labelPaddingTop - labelPaddingBottom
      : tabRect.height;
    const height = isPositionTabs
      ? 24
      : isScrollVertical
      ? Math.max(16, Math.min(24, labelContentHeight))
      : Math.max(16, Math.min(24, tabRect.height - 16));
    const rect = isScrollVertical && labelRect ? labelRect : tabRect;
    const y = rect.top - trackRect.top + (rect.height - height) / 2 + track.scrollTop;
    track.style.removeProperty("--tabs-ink-x");
    track.style.removeProperty("--tabs-ink-width");
    track.style.setProperty("--tabs-ink-y", `${Math.round(y)}px`);
    track.style.setProperty("--tabs-ink-height", `${Math.round(height)}px`);
    track.style.setProperty("--tabs-ink-opacity", "1");
    return;
  }

  const inset = activeTab.closest(".tabs-demo--scroll .tabs-demo__scroll-list, .tabs-demo--scroll .qizhi-tabs-header-wrapper") || labelRect ? 0 : 16;
  const rect = labelRect || tabRect;
  const x = rect.left - trackRect.left + inset + labelPaddingLeft + track.scrollLeft;
  const width = Math.max(16, rect.width - inset * 2 - labelPaddingLeft - labelPaddingRight);
  track.style.removeProperty("--tabs-ink-y");
  track.style.removeProperty("--tabs-ink-height");
  track.style.setProperty("--tabs-ink-x", `${Math.round(x)}px`);
  track.style.setProperty("--tabs-ink-width", `${Math.round(width)}px`);
  track.style.setProperty("--tabs-ink-opacity", "1");
};

const scrollTabIntoView = (activeTab) => {
  const scrollList = activeTab.closest(TABS_SCROLL_TRACK_SELECTOR);
  if (!scrollList) return;

  const tabsDemo = activeTab.closest(".tabs-demo");
  const isVertical = tabsDemo?.classList.contains("tabs-demo--scroll-vertical");
  const position = tabsDemo?.dataset.scrollPosition || "auto";
  const padding = 24;
  const refreshInkBarAfterScroll = () => {
    if (!tabsDemo) return;
    window.requestAnimationFrame(() => updateTabsInkBar(tabsDemo, activeTab));
    window.setTimeout(() => updateTabsInkBar(tabsDemo, activeTab), 360);
  };

  if (isVertical) {
    const tabStart = activeTab.offsetTop;
    const tabEnd = tabStart + activeTab.offsetHeight;
    const visibleStart = scrollList.scrollTop;
    const visibleEnd = visibleStart + scrollList.clientHeight;
    let top = null;

    if (position === "start") {
      top = tabStart;
    } else if (position === "center") {
      top = tabStart - (scrollList.clientHeight - activeTab.offsetHeight) / 2;
    } else if (position === "end") {
      top = tabEnd - scrollList.clientHeight;
    } else if (tabStart < visibleStart + padding) {
      top = Math.max(0, tabStart - padding);
    } else if (tabEnd > visibleEnd - padding) {
      top = tabEnd - scrollList.clientHeight + padding;
    }

    if (top !== null) {
      scrollList.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      refreshInkBarAfterScroll();
    }
    return;
  }

  const tabStart = activeTab.offsetLeft;
  const tabEnd = tabStart + activeTab.offsetWidth;
  const visibleStart = scrollList.scrollLeft;
  const visibleEnd = visibleStart + scrollList.clientWidth;
  let left = null;

  if (position === "start") {
    left = tabStart;
  } else if (position === "center") {
    left = tabStart - (scrollList.clientWidth - activeTab.offsetWidth) / 2;
  } else if (position === "end") {
    left = tabEnd - scrollList.clientWidth;
  } else if (tabStart < visibleStart + padding) {
    left = Math.max(0, tabStart - padding);
  } else if (tabEnd > visibleEnd - padding) {
    left = tabEnd - scrollList.clientWidth + padding;
  }

  if (left !== null) {
    scrollList.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    refreshInkBarAfterScroll();
  }
};

const updateTabsScrollControls = (tabsDemo) => {
  const isVertical = tabsDemo.classList.contains("tabs-demo--scroll-vertical");
  tabsDemo.querySelectorAll("[data-tabs-direction]").forEach((button) => {
    const isActive = button.dataset.tabsDirection === (isVertical ? "vertical" : "horizontal");
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
    button.removeAttribute("aria-pressed");
  });

  const position = tabsDemo.dataset.scrollPosition || "auto";
  tabsDemo.querySelectorAll("[data-scroll-position]").forEach((button) => {
    const isActive = button.dataset.scrollPosition === position;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
    button.removeAttribute("aria-pressed");
  });
};

const resetTabsInkBar = (tabsDemo) => {
  if (!tabsDemo) return;

  tabsDemo.querySelectorAll(".tabs-demo__ink-bar, .qizhi-tabs-header-ink").forEach((inkBar) => {
    inkBar.remove();
  });
};

const setTabsScrollDirection = (tabsDemo, direction) => {
  const isVertical = direction === "vertical";
  resetTabsInkBar(tabsDemo);
  tabsDemo.classList.toggle("tabs-demo--scroll-vertical", isVertical);
  tabsDemo.classList.toggle("qizhi-tabs-horizontal", !isVertical);
  tabsDemo.classList.toggle("qizhi-tabs-vertical", isVertical);
  tabsDemo.classList.toggle("qizhi-tabs-top", !isVertical);
  tabsDemo.classList.toggle("qizhi-tabs-left", isVertical);

  tabsDemo.querySelector(".qizhi-tabs-header-nav")?.classList.toggle("qizhi-tabs-header-nav-horizontal", !isVertical);
  tabsDemo.querySelector(".qizhi-tabs-header-nav")?.classList.toggle("qizhi-tabs-header-nav-vertical", isVertical);
  tabsDemo.querySelector(".qizhi-tabs-header-nav")?.classList.toggle("qizhi-tabs-header-nav-top", !isVertical);
  tabsDemo.querySelector(".qizhi-tabs-header-nav")?.classList.toggle("qizhi-tabs-header-nav-left", isVertical);

  const arrows = tabsDemo.querySelectorAll(".tabs-demo__arrow i");
  arrows[0]?.classList.toggle("ri-arrow-left-s-line", !isVertical);
  arrows[0]?.classList.toggle("ri-arrow-up-s-line", isVertical);
  arrows[1]?.classList.toggle("ri-arrow-right-s-line", !isVertical);
  arrows[1]?.classList.toggle("ri-arrow-down-s-line", isVertical);

  const activeTab = [...tabsDemo.querySelectorAll(`${TABS_TAB_SELECTOR}.is-active`)].find(
    (tab) => tab.closest(".tabs-demo") === tabsDemo,
  );
  if (activeTab) {
    window.requestAnimationFrame(() => {
      updateTabsInkBar(tabsDemo, activeTab);
      scrollTabIntoView(activeTab);
    });
  }

  updateTabsScrollControls(tabsDemo);
};

const getTabsDemoTabs = (tabsDemo, header) =>
  [...header.querySelectorAll(TABS_TAB_SELECTOR)].filter(
    (tab) => tab.closest(".tabs-demo") === tabsDemo,
  );

let tabsDragState = null;
let tabsDragSuppressClickUntil = 0;

const clearTabsDragState = () => {
  if (!tabsDragState) return;

  const { tabsDemo, tab } = tabsDragState;
  tab.classList.remove("is-dragging");
  tab.style.transform = "";
  tab.style.zIndex = "";
  tabsDemo.classList.remove("is-dragging-tabs");

  const activeTab = getTabsDemoTabs(tabsDemo, tabsDragState.header).find((candidate) =>
    candidate.classList.contains("is-active"),
  );
  if (activeTab) updateTabsInkBar(tabsDemo, activeTab);

  tabsDragState = null;
};

const initTabsDragDemo = (tabsDemo) => {
  if (!tabsDemo.classList.contains("tabs-demo--drag")) return;

  const header =
    getDirectChildByClassName(tabsDemo, "qizhi-tabs-header") ||
    tabsDemo.querySelector(":scope .qizhi-tabs-header");
  if (!header) return;

  header.querySelectorAll(TABS_TAB_SELECTOR).forEach((tab) => {
    tab.setAttribute("draggable", "false");
    tab.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;

      const rect = tab.getBoundingClientRect();
      tabsDragState = {
        tabsDemo,
        header,
        tab,
        startX: event.clientX,
        currentX: event.clientX,
        offsetX: event.clientX - rect.left,
        hasMoved: false,
      };

      tab.setPointerCapture?.(event.pointerId);
    });
  });
};

const syncNestedOuterTabs = (tabsDemo, activeTab, tabs) => {
  if (!tabsDemo.classList.contains("tabs-demo--nested-outer")) return false;

  const content = getDirectChildByClassName(tabsDemo, "qizhi-tabs-content");
  const innerTabs = content?.querySelector(":scope > .tabs-demo--nested-inner");
  const panel = content?.querySelector(":scope > .tabs-demo__nested-panel");
  if (!innerTabs || !panel) return true;

  const activeIndex = tabs.indexOf(activeTab);
  const showInnerTabs = activeIndex === 0;
  innerTabs.hidden = !showInnerTabs;
  panel.hidden = showInnerTabs;
  if (!showInnerTabs) {
    panel.textContent = `${getTabContentLabel(`Tab ${activeIndex + 1}`)}内容区。`;
  }
  return true;
};

const setTabsDemoActive = (tabsDemo, activeTab) => {
  const header = activeTab.closest(TABS_HEADER_SELECTOR);
  if (!tabsDemo || !header) return;
  if (activeTab.disabled || activeTab.getAttribute("aria-disabled") === "true") return;

  const tabs = getTabsDemoTabs(tabsDemo, header);
  if (!tabs.length) return;

  const wasActive = activeTab.classList.contains("is-active");

  tabs.forEach((tab) => {
    const isActive = tab === activeTab;
    tab.classList.toggle("is-active", isActive);
    tab.classList.toggle("qizhi-tabs-header-title-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  updateTabsInkBar(tabsDemo, activeTab);
  scrollTabIntoView(activeTab);

  const handledNestedOuter = syncNestedOuterTabs(tabsDemo, activeTab, tabs);
  if (handledNestedOuter) return;

  if (wasActive || tabsDemo.dataset.preserveContent === "true") return;

  const content = getTabsDemoContent(tabsDemo);
  if (!content) return;

  if (!content.dataset.initialHtml) {
    content.dataset.initialHtml = content.innerHTML;
  }

  const activeIndex = tabs.indexOf(activeTab);
  const label = getTabLabel(activeTab) || `Tab ${activeIndex + 1}`;
  const contentLabel = getTabContentLabel(label);
  const initialActiveIndex = Number(content.dataset.initialActiveIndex || 0);
  const usesControlledCopy = content.dataset.controlledCopy === "true";

  if (activeIndex === initialActiveIndex) {
    content.innerHTML = content.dataset.initialHtml;
    return;
  }

  content.textContent = usesControlledCopy
    ? `当前受控激活项：${label}。`
    : tabsDemo.classList.contains("tabs-demo--scroll")
      ? `这里是${contentLabel}内容。`
      : `${contentLabel}内容区。`;
};

const initTabsDemo = () => {
  const tabsDemos = document.querySelectorAll(".tabs-demo");
  if (!tabsDemos.length) return;

  tabsDemos.forEach((tabsDemo) => {
    const content = getTabsDemoContent(tabsDemo);
    if (content && !content.dataset.initialHtml) {
      content.dataset.initialHtml = content.innerHTML;
      content.dataset.controlledCopy = String(content.textContent.includes("当前受控激活项"));
      const header =
        getDirectChildByClassName(tabsDemo, "qizhi-tabs-header") ||
        tabsDemo.querySelector(":scope .qizhi-tabs-header");
      const tabs = header
        ? [...header.querySelectorAll(TABS_TAB_SELECTOR)].filter(
            (tab) => tab.closest(".tabs-demo") === tabsDemo,
          )
        : [];
      content.dataset.initialActiveIndex = String(
        Math.max(0, tabs.findIndex((tab) => tab.classList.contains("is-active"))),
      );
    }

    tabsDemo.querySelectorAll(TABS_TAB_SELECTOR).forEach((tab) => {
      normalizeQIZHITabText(tab);
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(tab.classList.contains("is-active")));
    });

    const activeTabs = [...tabsDemo.querySelectorAll(`${TABS_TAB_SELECTOR}.is-active`)].filter(
      (tab) => tab.closest(".tabs-demo") === tabsDemo,
    );
    const activeTab = activeTabs[0];
    if (activeTab) {
      window.requestAnimationFrame(() => updateTabsInkBar(tabsDemo, activeTab));
    }

    initTabsDragDemo(tabsDemo);
    if (tabsDemo.classList.contains("tabs-demo--scroll")) {
      updateTabsScrollControls(tabsDemo);
    }
  });

  document.querySelectorAll(".tabs-position-demo").forEach((positionDemo) => {
    const tabsDemo = positionDemo.querySelector(".tabs-position-preview");
    const activeTab = tabsDemo?.querySelector(`${TABS_TAB_SELECTOR}.is-active`);
    syncPositionTabsClasses(tabsDemo, positionDemo.dataset.tabPosition || "left");
    if (tabsDemo && activeTab) {
      window.requestAnimationFrame(() => updateTabsInkBar(tabsDemo, activeTab));
    }
  });

  document.addEventListener("click", (event) => {
    if (Date.now() < tabsDragSuppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const typeButton = event.target.closest(".tabs-demo--type [data-tab-type]");
    if (typeButton) {
      const tabsDemo = typeButton.closest(".tabs-demo--type");
      if (!tabsDemo) return;
      const type = typeButton.dataset.tabType || "line";
      tabsDemo.dataset.tabType = type;
      tabsDemo.querySelectorAll(".tabs-type-control").forEach((button) => {
        const isActive = button === typeButton;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-checked", String(isActive));
      });
      const activeTab = tabsDemo.querySelector(`${TABS_TAB_SELECTOR}.is-active`);
      if (activeTab) updateTabsInkBar(tabsDemo, activeTab);
      return;
    }

    const positionButton = event.target.closest(".tabs-position-demo [data-tab-position]");
    if (positionButton) {
      const positionDemo = positionButton.closest(".tabs-position-demo");
      if (!positionDemo) return;
      const position = positionButton.dataset.tabPosition || "left";
      positionDemo.dataset.tabPosition = position;
      positionDemo.querySelectorAll("[data-tab-position]").forEach((button) => {
        const isActive = button === positionButton;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-checked", String(isActive));
        const input = button.querySelector("input");
        if (input) input.checked = isActive;
      });
      const tabsDemo = positionDemo.querySelector(".tabs-position-preview");
      syncPositionTabsClasses(tabsDemo, position);
      const activeTab = tabsDemo?.querySelector(`${TABS_TAB_SELECTOR}.is-active`);
      if (tabsDemo && activeTab) {
        window.requestAnimationFrame(() => updateTabsInkBar(tabsDemo, activeTab));
      }
      return;
    }

    const arrowButton = event.target.closest(".tabs-demo--scroll .tabs-demo__arrow");
    if (arrowButton) {
      const tabsDemo = arrowButton.closest(".tabs-demo");
      const scrollList = arrowButton.parentElement?.querySelector(TABS_SCROLL_TRACK_SELECTOR);
      if (!scrollList) return;

      const isVertical = tabsDemo?.classList.contains("tabs-demo--scroll-vertical");
      const isPrevious = arrowButton.classList.contains("tabs-demo__arrow--prev");
      const amount = isPrevious ? -72 : 72;
      scrollList.scrollBy(
        isVertical ? { top: amount, behavior: "smooth" } : { left: amount, behavior: "smooth" },
      );
      return;
    }

    const directionButton = event.target.closest(".tabs-demo--scroll [data-tabs-direction]");
    if (directionButton) {
      const tabsDemo = directionButton.closest(".tabs-demo");
      if (!tabsDemo) return;
      setTabsScrollDirection(tabsDemo, directionButton.dataset.tabsDirection || "horizontal");
      return;
    }

    const scrollPositionButton = event.target.closest(".tabs-demo--scroll [data-scroll-position]");
    if (scrollPositionButton) {
      const tabsDemo = scrollPositionButton.closest(".tabs-demo");
      if (!tabsDemo) return;
      tabsDemo.dataset.scrollPosition = scrollPositionButton.dataset.scrollPosition || "auto";
      updateTabsScrollControls(tabsDemo);
      const activeTab = [...tabsDemo.querySelectorAll(`${TABS_TAB_SELECTOR}.is-active`)].find(
        (tab) => tab.closest(".tabs-demo") === tabsDemo,
      );
      if (activeTab) scrollTabIntoView(activeTab);
      return;
    }

    const tab = event.target.closest(`.tabs-demo ${TABS_TAB_SELECTOR}`);
    if (!tab) return;

    const tabsDemo = tab.closest(".tabs-demo");
    if (!tabsDemo) return;

    setTabsDemoActive(tabsDemo, tab);
  });

  document.addEventListener("pointermove", (event) => {
    if (!tabsDragState) return;

    const { tabsDemo, header, tab, startX } = tabsDragState;
    const deltaX = event.clientX - startX;
    tabsDragState.currentX = event.clientX;

    if (!tabsDragState.hasMoved && Math.abs(deltaX) < 4) return;

    event.preventDefault();
    tabsDragState.hasMoved = true;
    tabsDragSuppressClickUntil = Date.now() + 300;

    tabsDemo.classList.add("is-dragging-tabs");
    tab.classList.add("is-dragging");
    tab.style.zIndex = "2";
    tab.style.transform = `translate3d(${Math.round(deltaX)}px, 0, 0)`;

    const candidates = getTabsDemoTabs(tabsDemo, header).filter((candidate) => candidate !== tab);
    const target = candidates.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right;
    });

    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const shouldInsertAfter = event.clientX > targetRect.left + targetRect.width / 2;
    const nextNode = shouldInsertAfter ? target.nextSibling : target;
    if (nextNode !== tab && nextNode !== tab.nextSibling) {
      header.insertBefore(tab, nextNode);
      tab.style.transform = "translate3d(0, 0, 0)";
      tabsDragState.startX = event.clientX;
      updateTabsInkBar(tabsDemo, tab.classList.contains("is-active") ? tab : header.querySelector(`${TABS_TAB_SELECTOR}.is-active`));
    }
  });

  document.addEventListener("pointerup", () => {
    if (tabsDragState?.hasMoved) {
      tabsDragSuppressClickUntil = Date.now() + 300;
    }
    clearTabsDragState();
  });

  document.addEventListener("pointercancel", clearTabsDragState);

  document.addEventListener(
    "wheel",
    (event) => {
      const scrollList = event.target.closest(`.tabs-demo--scroll ${TABS_SCROLL_TRACK_SELECTOR}`);
      if (!scrollList) return;

      const tabsDemo = scrollList.closest(".tabs-demo");
      const isVertical = tabsDemo?.classList.contains("tabs-demo--scroll-vertical");
      const rawDelta = isVertical
        ? event.deltaY || event.deltaX
        : event.deltaX || event.deltaY;
      const delta = rawDelta * 0.55;

      if (!delta) return;
      event.preventDefault();
      scrollList.scrollBy(isVertical ? { top: delta } : { left: delta });

      const activeTab = tabsDemo?.querySelector(`${TABS_TAB_SELECTOR}.is-active`);
      if (activeTab) updateTabsInkBar(tabsDemo, activeTab);
    },
    { passive: false },
  );

  window.addEventListener("resize", () => {
    tabsDemos.forEach((tabsDemo) => {
      const activeTab = [...tabsDemo.querySelectorAll(`${TABS_TAB_SELECTOR}.is-active`)].find(
        (tab) => tab.closest(".tabs-demo") === tabsDemo,
      );
      if (activeTab) updateTabsInkBar(tabsDemo, activeTab);
    });
  });

  document.addEventListener("qizhi:route-rendered", (event) => {
    const pane = event.detail?.pane;
    if (!pane?.matches("#component-tabs")) return;

    window.requestAnimationFrame(() => {
      tabsDemos.forEach((tabsDemo) => {
        const activeTab = [...tabsDemo.querySelectorAll(`${TABS_TAB_SELECTOR}.is-active`)].find(
          (tab) => tab.closest(".tabs-demo") === tabsDemo,
        );
        if (activeTab) updateTabsInkBar(tabsDemo, activeTab);
      });
    });
  });
};

window.addEventListener("DOMContentLoaded", initTabsDemo);

const initStatisticDemos = () => {
  document.querySelectorAll("[data-statistic-loading-demo]").forEach((demo) => {
    const toggle = demo.querySelector("[data-statistic-loading-toggle]");
    const skeleton = demo.querySelector("[data-statistic-loading-skeleton]");
    const value = demo.querySelector("[data-statistic-loading-value]");
    if (!toggle || !skeleton || !value) return;

    const setLoading = (loading) => {
      demo.classList.toggle("is-loading", loading);
      toggle.classList.toggle("qizhi-switch-checked", loading);
      toggle.setAttribute("aria-checked", String(loading));
      skeleton.hidden = !loading;
      value.hidden = loading;
    };

    toggle.addEventListener("click", () => {
      setLoading(toggle.getAttribute("aria-checked") !== "true");
    });

    setLoading(toggle.getAttribute("aria-checked") === "true");
  });
};

window.addEventListener("DOMContentLoaded", initStatisticDemos);

const setSwitchDemoChecked = (button, checked) => {
  if (!button) return;
  button.classList.toggle("qizhi-switch-checked", checked);
  button.setAttribute("aria-checked", String(checked));

  const text = button.querySelector(".qizhi-switch-text");
  const holder = button.querySelector(".qizhi-switch-text-holder");
  if (text) {
    const nextText = checked
      ? button.dataset.switchCheckedText || text.textContent
      : button.dataset.switchUncheckedText || text.textContent;
    text.textContent = nextText;
    if (holder) holder.textContent = nextText;
  }
};

const initSwitchDemos = () => {
  document.querySelectorAll("[data-switch-demo]").forEach((button) => {
    const checked = button.getAttribute("aria-checked") === "true" || button.classList.contains("qizhi-switch-checked");
    setSwitchDemoChecked(button, checked);

    button.addEventListener("click", () => {
      if (button.disabled || button.classList.contains("qizhi-switch-loading")) return;
      setSwitchDemoChecked(button, button.getAttribute("aria-checked") !== "true");
    });
  });
};

window.addEventListener("DOMContentLoaded", initSwitchDemos);

const TABLE_DEMO_SIZE_CLASSES = ["table-demo--default", "table-demo--middle", "table-demo--small"];
const TABLE_DEMO_PAGINATION_CLASSES = [
  "table-demo--pagination-br",
  "table-demo--pagination-bl",
  "table-demo--pagination-bottomCenter",
];

const setTableDemoSwitch = (button, checked) => {
  if (!button) return;
  button.classList.toggle("is-checked", checked);
  button.setAttribute("aria-checked", String(checked));
};

const getTableDemoState = (demo) => {
  const state = {};
  demo.querySelectorAll("[data-table-prop]").forEach((button) => {
    state[button.dataset.tableProp] = button.getAttribute("aria-checked") === "true";
  });

  const activeSize = demo.querySelector("[data-table-size].is-active");
  state.size = activeSize?.dataset.tableSize || "default";
  const activePagination = demo.querySelector("[data-table-page-position].is-active");
  state.pagePosition = activePagination?.dataset.tablePagePosition || "br";
  return state;
};

const setTableDemoRowSelected = (row, checked) => {
  const checkbox = row.querySelector(".qizhi-checkbox");
  const input = checkbox?.querySelector("input");
  row.classList.toggle("qizhi-table-row-checked", checked);
  checkbox?.classList.toggle("qizhi-checkbox-checked", checked);
  checkbox?.classList.remove("qizhi-checkbox-indeterminate");
  if (input) input.checked = checked;
};

const setTableDemoHeaderSelected = (preview, checked, indeterminate = false) => {
  const checkbox = preview.querySelector("thead .qizhi-checkbox");
  const input = checkbox?.querySelector("input");
  checkbox?.classList.toggle("qizhi-checkbox-checked", checked);
  checkbox?.classList.toggle("qizhi-checkbox-indeterminate", indeterminate);
  if (input) input.checked = checked;
};

const syncTableDemoHeaderState = (demo) => {
  const preview = demo.querySelector("[data-table-props-preview]");
  if (!preview) return;

  const rows = [...preview.querySelectorAll("[data-table-body] .qizhi-table-tr")];
  const selectedRows = rows.filter((row) => row.classList.contains("qizhi-table-row-checked"));
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < rows.length;
  setTableDemoHeaderSelected(preview, allSelected, someSelected);

  const checkAllButton = demo.querySelector('[data-table-prop="checkAll"]');
  if (checkAllButton) setTableDemoSwitch(checkAllButton, allSelected);
};

const syncTableDemoAllRows = (demo, checked) => {
  const preview = demo.querySelector("[data-table-props-preview]");
  if (!preview) return;

  preview.querySelectorAll("[data-table-body] .qizhi-table-tr").forEach((row) => {
    setTableDemoRowSelected(row, checked);
  });
  setTableDemoHeaderSelected(preview, checked);
};

const syncTableDemoCheckboxVisibility = (preview, visible) => {
  if (visible) return;

  preview.querySelectorAll(".qizhi-checkbox").forEach((checkbox) => {
    const input = checkbox.querySelector("input");
    checkbox.classList.remove("qizhi-checkbox-checked");
    checkbox.classList.remove("qizhi-checkbox-indeterminate");
    if (input) input.checked = false;
  });
  preview.querySelectorAll("[data-table-body] .qizhi-table-tr").forEach((row) => {
    row.classList.remove("qizhi-table-row-checked");
  });
};

const updateTablePropsDemo = (demo, options = {}) => {
  const preview = demo.querySelector("[data-table-props-preview]");
  if (!preview) return;

  const state = getTableDemoState(demo);
  preview.classList.toggle("is-bordered", state.border);
  preview.classList.toggle("is-border-cell", state.borderCell);
  preview.classList.toggle("is-hoverable", state.hover);
  preview.classList.toggle("is-striped", state.stripe);
  preview.classList.toggle("has-checkbox", state.checkbox);
  preview.classList.toggle("has-header", state.showHeader);
  preview.classList.toggle("is-fixed-header", state.fixedHeader);
  preview.classList.remove(...TABLE_DEMO_SIZE_CLASSES);
  preview.classList.add(`table-demo--${state.size}`);
  preview.classList.remove(...TABLE_DEMO_PAGINATION_CLASSES);
  preview.classList.add(`table-demo--pagination-${state.pagePosition}`);

  const loading = demo.querySelector("[data-table-loading]");
  if (loading) loading.hidden = !state.loading;

  const body = demo.querySelector("[data-table-body]");
  const empty = demo.querySelector("[data-table-empty]");
  if (body && empty) {
    body.hidden = state.noData;
    empty.hidden = !state.noData;
  }
  const pagination = demo.querySelector("[data-table-pagination]");
  if (pagination) pagination.hidden = state.noData;

  if (options.syncSelection) {
    syncTableDemoAllRows(demo, !!state.checkAll);
  } else if (!state.checkbox) {
    syncTableDemoCheckboxVisibility(preview, false);
    setTableDemoSwitch(demo.querySelector('[data-table-prop="checkAll"]'), false);
  } else {
    syncTableDemoHeaderState(demo);
  }
};

const initTablePropsDemo = () => {
  document.querySelectorAll(".table-demo-props").forEach((demo) => {
    const propButtons = demo.querySelectorAll("[data-table-prop]");
    const sizeButtons = demo.querySelectorAll("[data-table-size]");
    const pagePositionButtons = demo.querySelectorAll("[data-table-page-position]");

    propButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const checked = button.getAttribute("aria-checked") !== "true";
        setTableDemoSwitch(button, checked);
        if (button.dataset.tableProp === "checkAll" && checked) {
          setTableDemoSwitch(demo.querySelector('[data-table-prop="checkbox"]'), true);
        }
        updateTablePropsDemo(demo, { syncSelection: button.dataset.tableProp === "checkAll" });
      });
    });

    sizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        sizeButtons.forEach((candidate) => {
          const isActive = candidate === button;
          candidate.classList.toggle("is-active", isActive);
          candidate.setAttribute("aria-checked", String(isActive));
        });
        updateTablePropsDemo(demo);
      });
    });

    pagePositionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        pagePositionButtons.forEach((candidate) => {
          const isActive = candidate === button;
          candidate.classList.toggle("is-active", isActive);
          candidate.setAttribute("aria-checked", String(isActive));
        });
        updateTablePropsDemo(demo);
      });
    });

    demo.querySelector("[data-table-props-preview]")?.addEventListener("click", (event) => {
      const checkbox = event.target.closest(".qizhi-checkbox");
      const preview = event.currentTarget;
      if (!checkbox || !preview.classList.contains("has-checkbox")) return;

      event.preventDefault();
      const input = checkbox.querySelector("input");
      const checked = !(input?.checked || checkbox.classList.contains("qizhi-checkbox-checked"));
      const isHeaderCheckbox = !!checkbox.closest("thead");
      if (isHeaderCheckbox) {
        setTableDemoSwitch(demo.querySelector('[data-table-prop="checkAll"]'), checked);
        syncTableDemoAllRows(demo, checked);
        return;
      }

      const row = checkbox.closest(".qizhi-table-tr");
      if (row) setTableDemoRowSelected(row, checked);
      syncTableDemoHeaderState(demo);
    });

    updateTablePropsDemo(demo, { syncSelection: true });
  });
};

window.addEventListener("DOMContentLoaded", initTablePropsDemo);

const initTableSortDemo = () => {
  const wrapper = document.getElementById("表格-排序");
  const table = wrapper?.querySelector(".table-demo--sort");
  const tbody = table?.querySelector("tbody");
  if (!wrapper || !table || !tbody) return;

  const rows = [...tbody.querySelectorAll(".qizhi-table-tr")];
  rows.forEach((row, index) => {
    row.dataset.originalIndex = String(index);
  });

  const buttons = [...table.querySelectorAll(".table-demo-sort-button")];
  const orderCycle = {
    none: "ascend",
    ascend: "descend",
    descend: "none",
  };

  const getOrderLabel = (order) => {
    if (order === "ascend") return "ascending";
    if (order === "descend") return "descending";
    return "none";
  };

  const sortRows = (key, type, order) => {
    const sortedRows = [...rows];
    if (order === "none") {
      sortedRows.sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex));
    } else {
      sortedRows.sort((a, b) => {
        const first = a.dataset[key] || "";
        const second = b.dataset[key] || "";
        const result =
          type === "number"
            ? Number(first) - Number(second)
            : first.localeCompare(second, "zh-Hans-CN", { numeric: true });
        return order === "ascend" ? result : -result;
      });
    }
    tbody.append(...sortedRows);
  };

  buttons.forEach((button) => {
    button.dataset.sortOrder = "none";
    button.setAttribute("aria-label", `${button.textContent.trim()}排序`);

    button.addEventListener("click", () => {
      const nextOrder = orderCycle[button.dataset.sortOrder || "none"];
      buttons.forEach((candidate) => {
        const th = candidate.closest(".qizhi-table-th");
        candidate.dataset.sortOrder = candidate === button ? nextOrder : "none";
        th?.classList.toggle("qizhi-table-col-sorted", candidate === button && nextOrder !== "none");
        th?.setAttribute("aria-sort", candidate === button ? getOrderLabel(nextOrder) : "none");
      });
      sortRows(button.dataset.sortKey, button.dataset.sortType, nextOrder);
    });
  });
};

const initTableDragSortDemo = () => {
  const wrapper = document.getElementById("表格-拖拽排序");
  const tbody = wrapper?.querySelector("[data-table-drag-body]");
  if (!wrapper || !tbody) return;

  let draggingRow = null;

  const clearDragState = () => {
    tbody.querySelectorAll(".is-dragging, .is-drag-over").forEach((row) => {
      row.classList.remove("is-dragging", "is-drag-over");
    });
  };

  tbody.querySelectorAll(".qizhi-table-tr").forEach((row) => {
    row.addEventListener("dragstart", (event) => {
      draggingRow = row;
      row.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", row.innerText.trim());
    });

    row.addEventListener("dragenter", () => {
      if (row !== draggingRow) row.classList.add("is-drag-over");
    });

    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("is-drag-over");
    });

    row.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!draggingRow || draggingRow === row) return;

      const targetRect = row.getBoundingClientRect();
      const placeAfter = event.clientY > targetRect.top + targetRect.height / 2;
      tbody.insertBefore(draggingRow, placeAfter ? row.nextSibling : row);
      clearDragState();
      draggingRow = null;
    });

    row.addEventListener("dragend", () => {
      clearDragState();
      draggingRow = null;
    });
  });
};

const initTableFixedColumnShadows = () => {
  document.querySelectorAll(".table-demo").forEach((table) => {
    if (!table.querySelector(".table-demo-fixed-left, .table-demo-fixed-right")) return;

    const scroller = table.querySelector(".qizhi-table-content-scroll");
    if (!scroller) return;

    const updateShadowState = () => {
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      const scrollLeft = scroller.scrollLeft;
      table.classList.toggle("is-scroll-start", scrollLeft <= 1);
      table.classList.toggle("is-scroll-end", maxScrollLeft <= 1 || scrollLeft >= maxScrollLeft - 1);
    };

    scroller.addEventListener("scroll", updateShadowState, { passive: true });
    window.addEventListener("resize", updateShadowState);
    updateShadowState();
  });
};

const initTableStickyHeaderDemo = () => {
  const table = document.querySelector("#表格-表头吸顶 .table-demo--sticky-header");
  const header = table?.querySelector(".table-demo-sticky-head");
  const scroller = table?.querySelector(".qizhi-table-content-scroll");
  if (!table || !header || !scroller) return;

  const stickyTop = 64;
  const updateStickyHeader = () => {
    const tableRect = table.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const headerHeight = header.offsetHeight;
    const shouldStick = tableRect.top <= stickyTop && tableRect.bottom - headerHeight > stickyTop;

    header.classList.toggle("is-stuck", shouldStick);
    if (shouldStick) {
      header.style.setProperty("--table-sticky-left", `${scrollerRect.left}px`);
      header.style.setProperty("--table-sticky-width", `${scrollerRect.width}px`);
      return;
    }

    header.style.removeProperty("--table-sticky-left");
    header.style.removeProperty("--table-sticky-width");
  };

  window.addEventListener("scroll", updateStickyHeader, { passive: true });
  window.addEventListener("resize", updateStickyHeader);
  updateStickyHeader();
};

const setDemoCheckbox = (checkbox, checked, indeterminate = false, force = false) => {
  if (!checkbox || (!force && checkbox.classList.contains("qizhi-checkbox-disabled"))) return;

  const input = checkbox.querySelector("input");
  checkbox.classList.toggle("qizhi-checkbox-checked", checked);
  checkbox.classList.toggle("qizhi-checkbox-indeterminate", indeterminate);
  if (input) {
    input.checked = checked;
    input.indeterminate = indeterminate;
  }
};

const initCheckboxDemo = () => {
  document.querySelectorAll("#component-checkbox [data-checkbox-demo]").forEach((checkbox) => {
    const input = checkbox.querySelector("input");
    if (!input) return;

    checkbox.classList.toggle("qizhi-checkbox-disabled", input.disabled);
    setDemoCheckbox(checkbox, input.checked, input.indeterminate, true);
    input.addEventListener("change", () => {
      setDemoCheckbox(checkbox, input.checked, input.indeterminate);
    });
  });

  document.querySelectorAll("[data-checkbox-controlled]").forEach((demo) => {
    const button = demo.querySelector("[data-checkbox-controlled-toggle]");
    const items = [...demo.querySelectorAll("[data-checkbox-controlled-item]")];
    if (!button || !items.length) return;

    const syncButton = () => {
      const checked = items.some((item) => item.classList.contains("qizhi-checkbox-checked"));
      button.textContent = checked ? "取消选中" : "选中";
    };

    button.addEventListener("click", () => {
      const nextChecked = !items.some((item) => item.classList.contains("qizhi-checkbox-checked"));
      items.forEach((item) => setDemoCheckbox(item, nextChecked, false, true));
      syncButton();
    });

    syncButton();
  });

  document.querySelectorAll("[data-checkbox-check-all]").forEach((demo) => {
    const trigger = demo.querySelector("[data-checkbox-check-all-trigger]");
    const triggerInput = trigger?.querySelector("input");
    const items = [...demo.querySelectorAll("[data-checkbox-check-all-item]")];
    if (!trigger || !triggerInput || !items.length) return;

    const syncTrigger = () => {
      const enabledItems = items.filter((item) => !item.classList.contains("qizhi-checkbox-disabled"));
      const checkedItems = enabledItems.filter((item) => item.classList.contains("qizhi-checkbox-checked"));
      const allChecked = enabledItems.length > 0 && checkedItems.length === enabledItems.length;
      const indeterminate = checkedItems.length > 0 && checkedItems.length < enabledItems.length;
      setDemoCheckbox(trigger, allChecked, indeterminate, true);
      trigger.querySelector(".qizhi-checkbox-text").textContent = allChecked ? "取消全选" : "全选";
    };

    triggerInput.addEventListener("change", () => {
      const nextChecked = triggerInput.checked;
      items.forEach((item) => setDemoCheckbox(item, nextChecked));
      syncTrigger();
    });

    items.forEach((item) => {
      const input = item.querySelector("input");
      input?.addEventListener("change", syncTrigger);
    });

    syncTrigger();
  });
};

window.addEventListener("DOMContentLoaded", initCheckboxDemo);

const setDemoRowChecked = (row, checked, indeterminate = false, force = false) => {
  const checkbox = row?.querySelector(".qizhi-checkbox");
  if (!checkbox || (!force && checkbox.classList.contains("qizhi-checkbox-disabled"))) return;

  setDemoCheckbox(checkbox, checked, indeterminate, force);
  row.classList.toggle("qizhi-table-row-checked", checked || indeterminate);
};

const getSelectableRows = (table) =>
  [...table.querySelectorAll("tbody .qizhi-table-tr")].filter(
    (row) => !row.classList.contains("table-demo-expanded-row") && !row.hidden,
  );

const syncDemoHeaderCheckbox = (table) => {
  const headerCheckbox = table.querySelector("thead .qizhi-checkbox");
  if (!headerCheckbox || table.classList.contains("table-demo--radio")) return;

  const rows = getSelectableRows(table).filter(
    (row) => !row.querySelector(".qizhi-checkbox")?.classList.contains("qizhi-checkbox-disabled"),
  );
  const checkedRows = rows.filter((row) => row.querySelector(".qizhi-checkbox-checked"));
  setDemoCheckbox(
    headerCheckbox,
    rows.length > 0 && checkedRows.length === rows.length,
    checkedRows.length > 0 && checkedRows.length < rows.length,
  );
};

const initTableSelectionDemo = () => {
  const wrapper = document.getElementById("表格-开启选择");
  const table = wrapper?.querySelector(".table-demo--select");
  if (!wrapper || !table) return;

  const modeButtons = wrapper.querySelectorAll(".table-demo-radio");
  const setMode = (mode) => {
    table.classList.toggle("table-demo--radio", mode === "radio");
    modeButtons.forEach((button) => {
      const isActive = button.textContent.includes(mode === "radio" ? "单选" : "复选");
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", String(isActive));
    });

    const rows = getSelectableRows(table);
    const checkedRows = rows.filter((row) => row.querySelector(".qizhi-checkbox-checked"));
    if (mode === "radio" && checkedRows.length > 1) {
      checkedRows.slice(1).forEach((row) => setDemoRowChecked(row, false, false, true));
    }
    syncDemoHeaderCheckbox(table);
  };

  modeButtons.forEach((button) => {
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(button.classList.contains("is-active")));
    button.addEventListener("click", () => {
      setMode(button.textContent.includes("单选") ? "radio" : "checkbox");
    });
  });

  table.addEventListener("click", (event) => {
    const checkbox = event.target.closest(".qizhi-checkbox");
    if (!checkbox || checkbox.classList.contains("qizhi-checkbox-disabled")) return;

    event.preventDefault();
    const row = checkbox.closest(".qizhi-table-tr");
    const checked = !checkbox.classList.contains("qizhi-checkbox-checked");
    const isHeader = !!checkbox.closest("thead");

    if (table.classList.contains("table-demo--radio")) {
      if (isHeader) return;
      getSelectableRows(table).forEach((candidate) => setDemoRowChecked(candidate, candidate === row, false, true));
      return;
    }

    if (isHeader) {
      getSelectableRows(table).forEach((candidate) => setDemoRowChecked(candidate, checked));
    } else {
      setDemoRowChecked(row, checked);
    }
    syncDemoHeaderCheckbox(table);
  });

  setMode("checkbox");
};

const getRowPrimaryText = (row) =>
  row?.querySelector(".qizhi-table-td:nth-child(2) .qizhi-table-cell-wrap-value")?.textContent.trim() || "当前行";

const getTableRowValues = (row) =>
  [...(row?.querySelectorAll(".qizhi-table-cell-wrap-value") || [])].map((cell) => cell.textContent.trim());

const setExpandButtonState = (button, open) => {
  button.classList.toggle("is-open", open);
  button.setAttribute("aria-label", `${open ? "收起" : "展开"}${button.dataset.rowName || ""}`);
  const icon = button.querySelector("i");
  if (icon) icon.className = open ? "ri-subtract-line" : "ri-add-line";
};

const createExpandedRow = (colspan, content) => {
  const row = document.createElement("tr");
  row.className = "qizhi-table-tr table-demo-expanded-row";
  const cell = document.createElement("td");
  cell.className = "qizhi-table-td";
  cell.colSpan = colspan;
  cell.innerHTML = content;
  row.append(cell);
  return row;
};

const getDescriptionExpandedContent = (name) =>
  `<div class="table-demo-expanded-content">${name} 的补充说明。可在展开区域展示完整描述、备注或更多业务信息。</div>`;

const getNestedExpandedContent = (row) => {
  const [name = "简·多伊", salary = "23000", address = "伦敦公园路32号", email = "jane.doe@example.com"] =
    getTableRowValues(row);

  return `
  <div class="table-demo-nested-wrap">
    <table class="table-demo-nested-table">
      <thead><tr><th>姓名</th><th>薪水</th><th>地址</th><th>电子邮件</th></tr></thead>
      <tbody>
        <tr><td>${name}</td><td>${salary}</td><td>${address}</td><td>${email}</td></tr>
        <tr><td>艾丽莎·罗斯</td><td>25000</td><td>伦敦公园路35号</td><td>alisa.ross@example.com</td></tr>
        <tr><td>凯文·桑德拉</td><td>22000</td><td>伦敦公园路31号</td><td>kevin.sandra@example.com</td></tr>
        <tr><td>艾德·海伦</td><td>17000</td><td>伦敦公园路42号</td><td>ed.hellen@example.com</td></tr>
        <tr><td>威廉·史密斯</td><td>27000</td><td>伦敦公园路62号</td><td>william.smith@example.com</td></tr>
      </tbody>
    </table>
  </div>`;
};

const initExpandableTableDemos = () => {
  document.querySelectorAll(".table-demo--expand").forEach((table) => {
    table.querySelectorAll(".table-demo-expand-button").forEach((button) => {
      const row = button.closest(".qizhi-table-tr");
      const name = getRowPrimaryText(row);
      button.dataset.rowName = name;
      setExpandButtonState(button, button.classList.contains("is-open"));
    });

    table.addEventListener("click", (event) => {
      const button = event.target.closest(".table-demo-expand-button");
      if (!button) return;

      const row = button.closest(".qizhi-table-tr");
      const nextRow = row.nextElementSibling;
      const isOpen = button.classList.contains("is-open");
      if (isOpen) {
        if (nextRow?.classList.contains("table-demo-expanded-row")) nextRow.remove();
        setExpandButtonState(button, false);
        return;
      }

      const name = getRowPrimaryText(row);
      const colspan = row.children.length;
      const content = table.classList.contains("table-demo--nested")
        ? getNestedExpandedContent(row)
        : getDescriptionExpandedContent(name);
      row.after(createExpandedRow(colspan, content));
      setExpandButtonState(button, true);
    });
  });
};

const getTreeChildRows = (parentRow) => {
  const rows = [];
  let row = parentRow.nextElementSibling;
  while (row?.classList.contains("table-demo-tree-child")) {
    rows.push(row);
    row = row.nextElementSibling;
  }
  return rows;
};

const syncTreeParentState = (parentRow) => {
  const children = getTreeChildRows(parentRow);
  if (!children.length) return;

  const checked = children.filter((row) => row.querySelector(".qizhi-checkbox-checked")).length;
  setDemoRowChecked(parentRow, checked === children.length, checked > 0 && checked < children.length);
};

const initTreeTableDemo = () => {
  const wrapper = document.getElementById("表格-树形数据展示");
  const table = wrapper?.querySelector(".table-demo--tree");
  const strictSwitch = wrapper?.querySelector(".table-demo-switch");
  if (!wrapper || !table || !strictSwitch) return;

  const isStrict = () => strictSwitch.getAttribute("aria-checked") === "true";

  strictSwitch.addEventListener("click", () => {
    setTableDemoSwitch(strictSwitch, strictSwitch.getAttribute("aria-checked") !== "true");
  });

  table.addEventListener("click", (event) => {
    const treeButton = event.target.closest(".table-demo-tree-button");
    if (treeButton) {
      const parentRow = treeButton.closest(".qizhi-table-tr");
      const children = getTreeChildRows(parentRow);
      const open = !treeButton.classList.contains("is-open");
      treeButton.classList.toggle("is-open", open);
      treeButton.setAttribute("aria-label", `${open ? "收起" : "展开"}${getRowPrimaryText(parentRow)}`);
      treeButton.querySelector("i").className = open ? "ri-subtract-line" : "ri-add-line";
      children.forEach((row) => {
        row.hidden = !open;
      });
      syncDemoHeaderCheckbox(table);
      return;
    }

    const checkbox = event.target.closest(".qizhi-checkbox");
    if (!checkbox) return;
    event.preventDefault();

    const row = checkbox.closest(".qizhi-table-tr");
    const checked = !checkbox.classList.contains("qizhi-checkbox-checked");
    const isHeader = !!checkbox.closest("thead");
    if (isHeader) {
      getSelectableRows(table).forEach((candidate) => setDemoRowChecked(candidate, checked));
    } else {
      setDemoRowChecked(row, checked);
      if (!isStrict()) {
        getTreeChildRows(row).forEach((child) => setDemoRowChecked(child, checked));
        const parentRow = [...table.querySelectorAll(".table-demo-tree-button")]
          .map((button) => button.closest(".qizhi-table-tr"))
          .find((candidate) => getTreeChildRows(candidate).includes(row));
        if (parentRow) syncTreeParentState(parentRow);
      }
    }
    syncDemoHeaderCheckbox(table);
  });

  syncDemoHeaderCheckbox(table);
};

window.addEventListener("DOMContentLoaded", initTableSortDemo);
window.addEventListener("DOMContentLoaded", initTableDragSortDemo);
window.addEventListener("DOMContentLoaded", initTableFixedColumnShadows);
window.addEventListener("DOMContentLoaded", initTableStickyHeaderDemo);
window.addEventListener("DOMContentLoaded", initTableSelectionDemo);
window.addEventListener("DOMContentLoaded", initExpandableTableDemos);
window.addEventListener("DOMContentLoaded", initTreeTableDemo);

const inputSizeHeights = {
  mini: 24,
  small: 28,
  default: 32,
  large: 36,
};

const initFormDemos = () => {
  document.querySelectorAll("[data-qizhi-form-demo]").forEach((form) => {
    if (form.dataset.formInitialized === "true") return;
    form.dataset.formInitialized = "true";

    form.querySelectorAll("[data-form-name-input]").forEach((input) => {
      const count = input.closest(".qizhi-form-control")?.querySelector("[data-form-name-count]")
        || input.parentElement?.querySelector("[data-form-name-count]");
      const syncCount = () => {
        if (count) count.textContent = `${input.value.length}/32`;
      };

      input.addEventListener("input", syncCount);
      syncCount();
    });
  });

  document.querySelectorAll("[data-form-layout-demo]").forEach((demo) => {
    const target = demo.querySelector("[data-form-layout-target]");
    const radios = [...demo.querySelectorAll('input[name="form-layout"]')];
    if (!target || !radios.length) return;

    const syncLayout = () => {
      const layout = radios.find((radio) => radio.checked)?.value || "vertical";
      target.classList.toggle("qizhi-form-demo--vertical", layout === "vertical");
      target.classList.toggle("qizhi-form-demo--horizontal", layout === "horizontal");
      radios.forEach((radio) => radio.closest(".qizhi-form-layout-option")?.classList.toggle("is-active", radio.checked));
    };

    radios.forEach((radio) => radio.addEventListener("change", syncLayout));
    syncLayout();
  });

  document.querySelectorAll(".qizhi-form-segmented").forEach((group) => {
    const radios = [...group.querySelectorAll('input[type="radio"]')];
    const syncSegments = () => {
      radios.forEach((radio) => radio.closest(".qizhi-form-segment")?.classList.toggle("is-active", radio.checked));
    };

    radios.forEach((radio) => radio.addEventListener("change", syncSegments));
    syncSegments();
  });

  document.querySelectorAll("[data-form-refresh]").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.remove("is-refreshing");
      window.requestAnimationFrame(() => button.classList.add("is-refreshing"));
    });
    button.addEventListener("animationend", () => button.classList.remove("is-refreshing"));
  });
};

window.addEventListener("DOMContentLoaded", initFormDemos);

const initVerificationCodeDemos = () => {
  const sanitizeVerificationValue = (group, value) => {
    const allow = group.dataset.verificationAllow || "alphanumeric";
    const pattern = allow === "digits" ? /[^0-9]/g : allow === "letters" ? /[^a-z]/gi : /[^a-z0-9]/gi;
    const sanitized = value.replace(pattern, "");
    return group.dataset.verificationFormat === "lowercase" ? sanitized.toLowerCase() : sanitized.toUpperCase();
  };

  const getInputs = (group) => [...group.querySelectorAll(".qizhi-verification-code__input:not(:disabled):not([readonly])")];

  const setValuesFrom = (group, startIndex, value) => {
    const inputs = getInputs(group);
    const characters = [...sanitizeVerificationValue(group, value)];
    if (!characters.length) return;

    characters.forEach((character, offset) => {
      if (inputs[startIndex + offset]) inputs[startIndex + offset].value = character;
    });

    const nextIndex = Math.min(startIndex + characters.length, inputs.length - 1);
    inputs[nextIndex]?.focus();
    inputs[nextIndex]?.select();
  };

  document.querySelectorAll("[data-verification-code]").forEach((group) => {
    if (group.dataset.verificationInitialized === "true") return;
    group.dataset.verificationInitialized = "true";
    const inputs = getInputs(group);

    inputs.forEach((input, index) => {
      input.value = sanitizeVerificationValue(group, input.value).slice(-1);
      input.addEventListener("focus", () => input.select());

      input.addEventListener("input", () => {
        const nextValue = sanitizeVerificationValue(group, input.value);
        input.value = nextValue.slice(-1);
        if (input.value && inputs[index + 1]) {
          inputs[index + 1].focus();
          inputs[index + 1].select();
        }
        group.dispatchEvent(new CustomEvent("verificationchange", { bubbles: true }));
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && inputs[index - 1]) {
          event.preventDefault();
          inputs[index - 1].value = "";
          inputs[index - 1].focus();
          group.dispatchEvent(new CustomEvent("verificationchange", { bubbles: true }));
        }
        if (event.key === "ArrowLeft" && inputs[index - 1]) {
          event.preventDefault();
          inputs[index - 1].focus();
        }
        if (event.key === "ArrowRight" && inputs[index + 1]) {
          event.preventDefault();
          inputs[index + 1].focus();
        }
      });

      input.addEventListener("paste", (event) => {
        const pastedValue = event.clipboardData?.getData("text") || "";
        if (!pastedValue) return;
        event.preventDefault();
        setValuesFrom(group, index, pastedValue);
        group.dispatchEvent(new CustomEvent("verificationchange", { bubbles: true }));
      });
    });
  });

  document.querySelectorAll("[data-verification-form]").forEach((form) => {
    if (form.dataset.verificationFormInitialized === "true") return;
    form.dataset.verificationFormInitialized = "true";
    const group = form.querySelector("[data-verification-code]");
    const message = form.querySelector(".qizhi-verification-form__message");
    if (!group || !message) return;

    const setFormState = (state, text) => {
      group.classList.toggle("is-error", state === "error");
      group.setAttribute("aria-invalid", String(state === "error"));
      message.classList.toggle("is-error", state === "error");
      message.classList.toggle("is-success", state === "success");
      message.textContent = text;
    };

    form.addEventListener("verificationchange", () => {
      const complete = getInputs(group).every((input) => input.value);
      if (complete) setFormState("default", "验证码已填写完整，可以提交");
      else if (group.classList.contains("is-error")) setFormState("default", "请输入收到的六位验证码");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const inputs = getInputs(group);
      const firstEmptyInput = inputs.find((input) => !input.value);
      if (firstEmptyInput) {
        setFormState("error", "请完整输入六位验证码");
        firstEmptyInput.focus();
        return;
      }
      setFormState("success", "验证成功");
    });
  });
};

window.addEventListener("DOMContentLoaded", initVerificationCodeDemos);

const initInputSizeDemo = () => {
  document.querySelectorAll("[data-input-size-demo]").forEach((demo) => {
    const slider = demo.querySelector("[data-input-height-slider]");
    const valueLabel = demo.querySelector("[data-input-height-value]");
    const radios = [...demo.querySelectorAll("[data-input-size-controls] input")];

    const setHeight = (height) => {
      demo.style.setProperty("--input-demo-height", `${height}px`);
      if (slider) {
        slider.dataset.sliderValues = String(height);
        slider.dispatchEvent(new CustomEvent("slider:set", { detail: { values: [height] } }));
      }
      if (valueLabel) valueLabel.textContent = `${height}px`;
    };

    const setSize = (size) => {
      demo.dataset.inputSize = size;
      setHeight(inputSizeHeights[size] || inputSizeHeights.default);
      radios.forEach((radio) => {
        const checked = radio.value === size;
        radio.checked = checked;
        const label = radio.closest(".qizhi-segmented-item");
        label?.classList.toggle("is-active", checked);
        label?.setAttribute("aria-checked", String(checked));
      });
    };

    radios.forEach((radio) => {
      const label = radio.closest(".qizhi-segmented-item");
      label?.setAttribute("role", "radio");
      label?.setAttribute("aria-checked", String(radio.checked));
      radio.addEventListener("change", () => setSize(radio.value));
    });

    slider?.addEventListener("slider:change", (event) => {
      const height = Number(event.detail?.values?.[0]) || inputSizeHeights.default;
      if (inputSizeHeights[demo.dataset.inputSize] === height) {
        if (valueLabel) valueLabel.textContent = `${height}px`;
        return;
      }
      demo.dataset.inputSize = "custom";
      demo.style.setProperty("--input-demo-height", `${height}px`);
      if (valueLabel) valueLabel.textContent = `${height}px`;
      radios.forEach((radio) => {
        radio.checked = false;
        const label = radio.closest(".qizhi-segmented-item");
        label?.classList.remove("is-active");
        label?.setAttribute("aria-checked", "false");
      });
    });

    setSize(demo.dataset.inputSize || "default");
  });
};

window.addEventListener("DOMContentLoaded", initInputSizeDemo);

const initInputClearDemos = (root = document) => {
  const scope = root?.querySelectorAll ? root : document;
  scope.querySelectorAll(".input-demo").forEach((wrapper) => {
    if (wrapper.dataset.inputClearInitialized === "true") return;
    wrapper.dataset.inputClearInitialized = "true";
    const input = wrapper.querySelector("input:not([type='range'])");
    const explicitlyExcluded = wrapper.hasAttribute("data-input-no-clear");
    if (!input || input.disabled || input.readOnly || explicitlyExcluded || wrapper.classList.contains("select-demo") || wrapper.classList.contains("input-demo--word-limit") || wrapper.querySelector("[data-password-toggle]") || wrapper.closest("#component-input-number, #component-verification-code, #component-slider")) return;

    const clearButton = document.createElement("button");
    clearButton.className = "input-demo__clear";
    clearButton.type = "button";
    clearButton.setAttribute("aria-label", "清空输入内容");
    clearButton.innerHTML = '<i class="ri-close-line" aria-hidden="true"></i>';

    const sync = () => {
      clearButton.toggleAttribute("hidden", input.value.length === 0);
    };

    const suffix = wrapper.querySelector(".input-demo__suffix");
    if (suffix) {
      wrapper.insertBefore(clearButton, suffix);
    } else {
      wrapper.append(clearButton);
    }
    input.addEventListener("input", sync);
    clearButton.addEventListener("click", () => {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      sync();
      input.focus();
    });

    sync();
  });
};

window.addEventListener("DOMContentLoaded", initInputClearDemos);

const initAutoCompleteDemos = () => {
  const demos = [...document.querySelectorAll("[data-autocomplete-demo]")];
  if (!demos.length) return;

  const closeDemo = (demo) => {
    demo.classList.remove("is-open");
    demo.querySelector(".autocomplete-demo__popup")?.setAttribute("hidden", "");
    demo.querySelector("input, textarea")?.setAttribute("aria-expanded", "false");
  };

  const closeOthers = (activeDemo) => {
    demos.forEach((demo) => {
      if (demo !== activeDemo) closeDemo(demo);
    });
  };

  const createOption = ({ value, label = value, meta = "" }) => {
    const option = document.createElement("li");
    option.className = meta ? "input-demo-select-option autocomplete-demo__option" : "input-demo-select-option";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.tabIndex = -1;
    option.dataset.value = value;

    if (meta) {
      option.innerHTML = `<span class="autocomplete-demo__option-main"></span><span class="autocomplete-demo__option-meta"></span>`;
      option.querySelector(".autocomplete-demo__option-main").textContent = label;
      option.querySelector(".autocomplete-demo__option-meta").textContent = meta;
    } else {
      option.textContent = label;
    }

    return option;
  };

  const createGroup = (label) => {
    const group = document.createElement("li");
    group.className = "autocomplete-demo__group";
    group.setAttribute("role", "presentation");
    group.textContent = label;
    return group;
  };

  const getOptions = (mode, value) => {
    if (!value && mode !== "complex") return [];

    if (mode === "strict") {
      return ["beijing", "beihai", "baoding"]
        .filter((item) => item.includes(value))
        .map((item) => ({ value: item }));
    }

    if (mode === "complex") {
      return [{ value: "Beijing", label: "北京" }];
    }

    if (mode === "query-certain") {
      return ["Group-1", "Group-2", "Group-3"].flatMap((groupName, groupIndex) => [
        { type: "group", label: groupName },
        ...Array.from({ length: 3 }, (_, optionIndex) => {
          const optionValue = `${value}-${groupIndex + 1}-${optionIndex + 1}`;
          return { value: optionValue };
        }),
      ]);
    }

    if (mode === "query-uncertain") {
      return Array.from({ length: 3 }, (_, index) => ({
        value: `${value}-${index + 1}`,
        meta: `${(value.length * 137 + index * 211) % 1000} results`,
      }));
    }

    if (mode === "custom-filter") {
      return Array.from({ length: 5 }, (_, index) => {
        const seed = value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const number = String((seed * 7919 + index * 104729) % 10000000000).padStart(10, "0");
        return { value: number };
      });
    }

    return Array.from({ length: 5 }, (_, index) => ({ value: `${value}_${index}` }));
  };

  demos.forEach((demo) => {
    const input = demo.querySelector("input, textarea");
    const popup = demo.querySelector(".autocomplete-demo__popup");
    if (!input || !popup) return;
    const mode = demo.dataset.autocompleteMode || "basic";

    const setPopupVisible = (open) => {
      popup.toggleAttribute("hidden", !open);
      demo.classList.toggle("is-open", !!open);
      input.setAttribute("aria-expanded", String(!!open));
    };

    const renderOptions = () => {
      const value = input.value.trim();
      popup.innerHTML = "";

      const options = getOptions(mode, value);
      if (!options.length) {
        setPopupVisible(false);
        return;
      }

      options.forEach((item) => {
        if (item.type === "group") {
          popup.append(createGroup(item.label));
          return;
        }

        const option = createOption(item);
        option.addEventListener("mousedown", (event) => {
          event.preventDefault();
          input.value = option.dataset.value || option.textContent.trim();
          input.dispatchEvent(new Event("input", { bubbles: true }));
          closeDemo(demo);
        });
        popup.append(option);
      });

      closeOthers(demo);
      setPopupVisible(true);
    };

    input.addEventListener("input", renderOptions);
    input.addEventListener("focus", renderOptions);
    if (mode === "complex") {
      input.addEventListener("blur", () => {
        window.setTimeout(() => {
          if (input.value !== "Beijing") input.value = "";
        }, 100);
      });
    }
    input.addEventListener("keydown", (event) => {
      const options = [...popup.querySelectorAll(".input-demo-select-option")];
      if (event.key === "Escape") {
        closeDemo(demo);
        return;
      }
      if (event.key === "Enter" && options.length && !popup.hasAttribute("hidden")) {
        event.preventDefault();
        input.value = options[0].dataset.value || options[0].textContent.trim();
        input.dispatchEvent(new Event("input", { bubbles: true }));
        closeDemo(demo);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-autocomplete-demo]")) demos.forEach(closeDemo);
  });
};

window.addEventListener("DOMContentLoaded", initAutoCompleteDemos);

const initCascaderDemos = () => {
  const data = [
    {
      label: "Beijing",
      value: "beijing",
      children: [
        {
          label: "Beijing",
          value: "beijing-city",
          children: [
            { label: "Chaoyang", value: "chaoyang", children: [{ label: "Datunli", value: "datunli" }] },
            {
              label: "Dongcheng",
              value: "dongcheng",
              children: [
                { label: "Chaoyangmen", value: "chaoyangmen" },
                { label: "Jianguomen", value: "jianguomen" },
              ],
            },
            { label: "Xicheng", value: "xicheng" },
            { label: "Haidian", value: "haidian" },
          ],
        },
      ],
    },
    {
      label: "Shanghai",
      value: "shanghai",
      children: [
        {
          label: "Shanghai",
          value: "shanghai-city",
          children: [
            { label: "Huangpu", value: "huangpu" },
            { label: "Pudong", value: "pudong" },
          ],
        },
      ],
    },
  ];

  const lazyData = [
    { label: "Beijing", value: "beijing", isLeaf: false },
    { label: "Shanghai", value: "shanghai", isLeaf: false },
  ];

  const fieldNameData = [
    {
      id: "beijing",
      name: "Beijing",
      child: [
        {
          id: "beijing-city",
          name: "Beijing",
          child: [
            { id: "chaoyang", name: "Chaoyang", child: [{ id: "datunli", name: "Datunli" }] },
            { id: "dongcheng", name: "Dongcheng" },
            { id: "xicheng", name: "Xicheng" },
            { id: "haidian", name: "Haidian" },
          ],
        },
      ],
    },
    {
      id: "shanghai",
      name: "Shanghai",
      child: [
        {
          id: "shanghai-city",
          name: "Shanghai",
          child: [{ id: "huangpu", name: "Huangpu" }],
        },
      ],
    },
  ];

  const demos = [...document.querySelectorAll("[data-cascader-demo]")];
  if (!demos.length) return;

  const closeDemo = (demo) => {
    demo.classList.remove("is-open");
    demo.querySelector(".cascader-demo__popup")?.setAttribute("hidden", "");
    demo.querySelector(".cascader-demo__input")?.setAttribute("aria-expanded", "false");
    demo.querySelector(".cascader-demo__trigger-link")?.setAttribute("aria-expanded", "false");
  };

  const closeOthers = (activeDemo) => {
    demos.forEach((demo) => {
      if (demo !== activeDemo) closeDemo(demo);
    });
  };

  const getPlaceholder = (demo) => demo.dataset.placeholder || "请选择……";

  const getValues = (value) => (value || "").split("|").map((item) => item.trim()).filter(Boolean);

  const mapFieldNameOptions = (items) => items.map((item) => ({
    label: item.name,
    value: item.id,
    disabled: item.disabled,
    isLeaf: item.isLeaf,
    children: item.child ? mapFieldNameOptions(item.child) : undefined,
  }));

  const getSource = (demo) => {
    if (demo.hasAttribute("data-empty-text")) return [];
    if (demo.hasAttribute("data-lazy")) return lazyData;
    if (demo.hasAttribute("data-field-names")) return mapFieldNameOptions(fieldNameData);
    return data;
  };

  const flattenOptions = (items, path = []) => items.flatMap((item) => {
    const nextPath = [...path, item.label];
    if (item.children?.length) return flattenOptions(item.children, nextPath);
    return [{ label: nextPath.join(" / "), value: nextPath.join(" / ") }];
  });

  const setupTagDragSort = (demo, tagsNode) => {
    if (tagsNode.dataset.dragSortReady) return;
    tagsNode.dataset.dragSortReady = "true";
    let draggingTag = null;

    tagsNode.addEventListener("dragstart", (event) => {
      const tag = event.target.closest(".cascader-demo__tag--draggable");
      if (!tag || !tagsNode.contains(tag)) return;
      draggingTag = tag;
      tag.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", tag.dataset.value || tag.textContent.trim());
    });

    tagsNode.addEventListener("dragover", (event) => {
      if (!draggingTag) return;
      const target = event.target.closest(".cascader-demo__tag--draggable");
      if (!target || target === draggingTag || !tagsNode.contains(target)) return;
      event.preventDefault();
      const rect = target.getBoundingClientRect();
      const insertAfter = event.clientX > rect.left + rect.width / 2;
      tagsNode.insertBefore(draggingTag, insertAfter ? target.nextSibling : target);
    });

    tagsNode.addEventListener("drop", (event) => {
      if (draggingTag) event.preventDefault();
    });

    tagsNode.addEventListener("dragend", () => {
      const values = [...tagsNode.querySelectorAll(".cascader-demo__tag--draggable")]
        .map((tag) => tag.dataset.value)
        .filter(Boolean);
      if (values.length) syncValue(demo, values.join("|"));
      draggingTag?.classList.remove("is-dragging");
      draggingTag = null;
    });
  };

  const renderTags = (demo, value) => {
    const values = getValues(value);
    const tagsNode = demo.querySelector(".cascader-demo__tags");
    if (!tagsNode) return;

    if (!values.length) {
      tagsNode.textContent = getPlaceholder(demo);
      return;
    }

    tagsNode.textContent = "";
    values.forEach((item) => {
      const tag = document.createElement("span");
      tag.className = "cascader-demo__tag";
      tag.title = item;

      if (demo.hasAttribute("data-drag-sort")) {
        tag.classList.add("cascader-demo__tag--draggable");
        tag.draggable = true;
        tag.dataset.value = item;
      }

      const content = document.createElement("span");
      content.textContent = item;
      tag.append(content);
      tagsNode.append(tag);
    });

    if (demo.hasAttribute("data-drag-sort")) setupTagDragSort(demo, tagsNode);
  };

  const syncValue = (demo, value) => {
    demo.dataset.value = value || "";
    demo.classList.toggle("has-value", !!value);
    const valueNode = demo.querySelector(".cascader-demo__value");
    const input = demo.querySelector(".cascader-demo__input");
    const tagsNode = demo.querySelector(".cascader-demo__tags");
    if (valueNode) valueNode.textContent = value || getPlaceholder(demo);
    if (input && !demo.hasAttribute("data-multiple")) input.value = value || "";
    if (tagsNode) renderTags(demo, value);
  };

  const createMenu = (demo, items, level, path) => {
    const menu = document.createElement("ul");
    menu.className = "cascader-demo__menu";
    menu.setAttribute("role", "menu");

    items.forEach((item) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      const disabled = item.loading || item.disabled || (demo.hasAttribute("data-disabled-options") && item.value === "dongcheng");
      const hasChildren = !!item.children?.length || item.isLeaf === false;
      button.type = "button";
      button.className = `cascader-demo__option${disabled ? " is-disabled" : ""}${item.loading ? " is-loading" : ""}`;
      button.setAttribute("role", "menuitem");
      if (disabled) button.setAttribute("aria-disabled", "true");
      button.innerHTML = `<span></span>${hasChildren ? '<i class="ri-arrow-right-s-line" aria-hidden="true"></i>' : ""}`;
      button.querySelector("span").textContent = item.label;

      const nextPath = [...path, item.label];
      const activate = () => {
        if (disabled) return;
        const popup = demo.querySelector(".cascader-demo__popup");
        if (!popup) return;
        const menuContainer = popup.querySelector(".cascader-demo__menus") || popup;
        [...menu.querySelectorAll(".cascader-demo__option")].forEach((option) => option.classList.remove("is-active"));
        button.classList.add("is-active");
        [...menuContainer.querySelectorAll(".cascader-demo__menu")].forEach((candidate, index) => {
          if (index > level) candidate.remove();
        });

        const separator = demo.hasAttribute("data-custom-trigger")
          ? ", "
          : demo.dataset.format === "arrow"
            ? " > "
            : " / ";

        if (demo.hasAttribute("data-change-on-select")) {
          syncValue(demo, nextPath.join(separator));
        }

        if (item.isLeaf === false && !item.children?.length) {
          const loading = createMenu(demo, [{ label: "加载中...", value: "loading", loading: true }], level + 1, nextPath);
          menuContainer.append(loading);
          window.setTimeout(() => {
            item.children = Array.from({ length: 3 }, (_, index) => ({
              label: `Option ${index + 1}`,
              value: `${item.value}-${index + 1}`,
              isLeaf: level >= 1,
            }));
            loading.replaceWith(createMenu(demo, item.children, level + 1, nextPath));
          }, 350);
          return;
        }

        if (item.children?.length) {
          menuContainer.append(createMenu(demo, item.children, level + 1, nextPath));
          return;
        }

        const nextValue = nextPath.join(separator);
        if (demo.hasAttribute("data-multiple")) {
          const values = getValues(demo.dataset.value);
          syncValue(demo, values.includes(nextValue) ? values.join("|") : [...values, nextValue].join("|"));
        } else {
          syncValue(demo, nextValue);
        }
        closeDemo(demo);
      };

      button.addEventListener("click", activate);
      if (demo.dataset.trigger === "hover") button.addEventListener("mouseenter", activate);
      li.append(button);
      menu.append(li);
    });

    return menu;
  };

  const openDemo = (demo) => {
    closeOthers(demo);
    const popup = demo.querySelector(".cascader-demo__popup");
    if (!popup) return;
    popup.innerHTML = "";
    const source = getSource(demo);
    if (!source.length && demo.dataset.emptyText) {
      const empty = document.createElement("div");
      empty.className = "qizhi-empty qizhi-config-empty-state";
      empty.setAttribute("role", "status");
      const image = document.createElement("img");
      image.src = "./assets/qizhi-empty.svg";
      image.alt = "";
      const text = document.createElement("span");
      text.textContent = demo.dataset.emptyText;
      empty.append(image, text);
      popup.append(empty);
      popup.hidden = false;
      demo.classList.add("is-open");
      demo.querySelector(".cascader-demo__input")?.setAttribute("aria-expanded", "true");
      return;
    }
    const hasSearch = demo.hasAttribute("data-custom-trigger") || demo.hasAttribute("data-show-search") || demo.hasAttribute("data-custom-search");
    if (hasSearch) {
      const inner = document.createElement("div");
      inner.className = "cascader-demo__popup-inner";
      inner.innerHTML = `
        <div class="cascader-demo__search">
          <span class="qizhi-input-inner-wrapper qizhi-input-inner-wrapper-default input-demo input-demo--with-suffix" data-input-no-clear>
            <input class="qizhi-input qizhi-input-size-default" placeholder="请选择……" autocomplete="off">
            <i class="ri-search-line input-demo__suffix" aria-hidden="true"></i>
          </span>
        </div>
        <div class="qizhi-divider qizhi-divider-horizontal cascader-demo__divider" role="separator"></div>
        <div class="cascader-demo__menus"></div>
      `;
      const menus = inner.querySelector(".cascader-demo__menus");
      const searchInput = inner.querySelector("input");
      const renderRootMenu = () => {
        menus.innerHTML = "";
        menus.append(createMenu(demo, source, 0, []));
      };
      searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        menus.innerHTML = "";
        if (!query) {
          renderRootMenu();
          return;
        }
        const matches = flattenOptions(source)
          .filter((item) => item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query));
        menus.append(createMenu(demo, matches.length ? matches : [{ label: "暂无数据", value: "empty", loading: true }], 0, []));
      });
      renderRootMenu();
      popup.append(inner);
    } else {
      popup.append(createMenu(demo, source, 0, []));
    }
    popup.hidden = false;
    demo.classList.add("is-open");
    demo.querySelector(".cascader-demo__input")?.setAttribute("aria-expanded", "true");
    demo.querySelector(".cascader-demo__trigger-link")?.setAttribute("aria-expanded", "true");
  };

  demos.forEach((demo, demoIndex) => {
    if (!demo.hasAttribute("data-custom-trigger")) demo.setAttribute("data-allow-clear", "");
    const isCustomTrigger = demo.hasAttribute("data-custom-trigger");
    const before = demo.dataset.addBefore ? `<span class="cascader-demo__before">${demo.dataset.addBefore}</span>` : "";
    const multiple = demo.hasAttribute("data-multiple");
    const popupId = `qizhi-cascader-popup-${demoIndex + 1}`;
    const placeholder = getPlaceholder(demo);
    const valueHtml = multiple
      ? `<span class="cascader-demo__tags">${placeholder}</span><input class="cascader-demo__input" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="${popupId}" aria-label="${placeholder}" readonly>`
      : `<input class="cascader-demo__input" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="${popupId}" aria-label="${placeholder}" placeholder="${placeholder}" value="${demo.dataset.value || ""}" readonly>`;

    demo.innerHTML = isCustomTrigger
      ? `
        <span class="cascader-demo__custom-label">城市</span>
        <button class="cascader-demo__trigger-link" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="${popupId}">
          <span class="cascader-demo__value">${demo.dataset.value || getPlaceholder(demo)}</span>
        </button>
        <div class="cascader-demo__popup" id="${popupId}" role="listbox" hidden></div>
      `
      : `
        ${before}
        <span class="cascader-demo__input-wrap">${valueHtml}</span>
        <button class="cascader-demo__clear" type="button" aria-label="清除"><i class="ri-close-line" aria-hidden="true"></i></button>
        <span class="cascader-demo__suffix"><i class="ri-arrow-down-s-line cascader-demo__arrow" aria-hidden="true"></i></span>
        <div class="cascader-demo__popup" id="${popupId}" role="listbox" hidden></div>
      `;

    syncValue(demo, demo.dataset.value || "");

    const input = demo.querySelector(".cascader-demo__input");
    demo.addEventListener("click", (event) => {
      if (event.target.closest(".cascader-demo__popup, .cascader-demo__trigger-link")) return;
      if (event.target.closest(".cascader-demo__clear")) return;
      demo.classList.contains("is-open") ? closeDemo(demo) : openDemo(demo);
    });
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDemo(demo);
      }
      if (event.key === "Escape") closeDemo(demo);
    });
    if (demo.dataset.trigger === "hover") {
      demo.addEventListener("mouseenter", () => openDemo(demo));
    }

    const triggerLink = demo.querySelector(".cascader-demo__trigger-link");
    triggerLink?.addEventListener("click", () => {
      demo.classList.contains("is-open") ? closeDemo(demo) : openDemo(demo);
    });
    triggerLink?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDemo(demo);
      }
      if (event.key === "Escape") closeDemo(demo);
    });

    demo.querySelector(".cascader-demo__clear")?.addEventListener("click", (event) => {
      event.stopPropagation();
      syncValue(demo, "");
      closeDemo(demo);
      input?.focus();
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-cascader-demo]")) demos.forEach(closeDemo);
  });
};

window.addEventListener("DOMContentLoaded", initCascaderDemos);

const initTreeSelectDemos = () => {
  const sections = [...document.querySelectorAll("#component-tree-select, #component-config-provider")];
  if (!sections.length) return;

  const treeData = [
    {
      label: "Trunk",
      value: "node1",
      children: [{ label: "Leaf", value: "node2" }],
    },
    {
      label: "Trunk2",
      value: "node3",
      children: [
        { label: "Leaf", value: "node4" },
        { label: "Leaf", value: "node5" },
      ],
    },
  ];

  const searchData = [
    {
      label: "Trunk 0-0",
      value: "Trunk 0-0",
      children: [
        {
          label: "Branch 0-0-1",
          value: "Branch 0-0-1",
          children: [
            { label: "Leaf 0-0-1-1", value: "Leaf 0-0-1-1" },
            { label: "Leaf 0-0-1-2", value: "Leaf 0-0-1-2" },
          ],
        },
      ],
    },
    {
      label: "Trunk 0-1",
      value: "Trunk 0-1",
      children: [
        {
          label: "Branch 0-1-1",
          value: "Branch 0-1-1",
          children: [{ label: "Leaf 0-1-1-0", value: "Leaf 0-1-1-0" }],
        },
        {
          label: "Branch 0-1-2",
          value: "Branch 0-1-2",
          children: [{ label: "Leaf 0-1-2-0", value: "Leaf 0-1-2-0" }],
        },
      ],
    },
  ];

  const selects = sections.flatMap((section) => [...section.querySelectorAll(".qizhi-tree-select")]);

  const flattenTree = (nodes, depth = 0, parent = []) => nodes.flatMap((node) => {
    const item = { ...node, depth, path: [...parent, node.label] };
    return [item, ...(node.children ? flattenTree(node.children, depth + 1, item.path) : [])];
  });

  const getCodebox = (select) => select.closest(".codebox-wrapper");
  const isMultiple = (select) => select.classList.contains("qizhi-tree-select-multiple");
  const isRichValue = (select) => {
    const id = getCodebox(select)?.id || "";
    return id.includes("设置-value-格式") || id.includes("自定义渲染");
  };
  const isSearchDemo = (select) => select.classList.contains("qizhi-tree-select-show-search")
    || !!select.querySelector(".qizhi-tree-select-view-input:not(.qizhi-tree-select-hidden), .qizhi-input-tag-input");

  const getDataForSelect = (select) => {
    if (select.hasAttribute("data-empty-text")) return [];
    const id = getCodebox(select)?.id || "";
    if (id.includes("搜索") || id.includes("远程搜索")) return searchData;
    if (id.includes("动态加载")) {
      return [
        { label: "node1", value: "node1", children: [{ label: "node2", value: "node2" }] },
        {
          label: "node3",
          value: "node3",
          children: [
            { label: "node4", value: "node4" },
            { label: "node5", value: "node5" },
            { label: "node3-0", value: "node3-0" },
            { label: "node3-1", value: "node3-1" },
          ],
        },
      ];
    }
    return treeData;
  };

  const getDisplayLabel = (select, item) => {
    return item.label;
  };

  const treeSelectPlaceholder = "请选择";

  const createTreeSelectIcon = (className) => {
    const icon = document.createElement("i");
    icon.className = className;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  };

  const getSingleDisplayText = (select) => {
    const nativeInput = select.querySelector(":scope > .qizhi-input");
    if (nativeInput?.value.trim()) return nativeInput.value.trim();

    const valueNode = select.querySelector(".qizhi-tree-select-view-value:not([hidden])");
    const text = valueNode?.textContent.trim() || "";
    if (text && text !== treeSelectPlaceholder) return text;

    const title = select.querySelector(".qizhi-tree-select-view")?.getAttribute("title")?.trim() || "";
    return title && title !== treeSelectPlaceholder ? title : "";
  };

  const getSinglePlaceholder = (select) => {
    const input = select.querySelector(".qizhi-tree-select-view-input, :scope > .qizhi-input");
    return input?.getAttribute("placeholder") || treeSelectPlaceholder;
  };

  const isEditableSingleSearch = (select) => {
    const input = select.querySelector(".qizhi-tree-select-view-input");
    return select.classList.contains("qizhi-tree-select-show-search")
      && input instanceof HTMLInputElement
      && !input.classList.contains("qizhi-tree-select-hidden");
  };

  const normalizeTreeSelectBox = (select) => {
    if (select.dataset.treeSelectBoxReady) return;
    select.dataset.treeSelectBoxReady = "true";

    if (isMultiple(select)) {
      const input = select.querySelector(".qizhi-input-tag-input");
      const mirror = select.querySelector(".qizhi-input-tag-input-mirror");
      const codeboxId = getCodebox(select)?.id || "";
      const remote = codeboxId.includes("远程搜索");
      const placeholder = remote ? treeSelectPlaceholder : input?.getAttribute("placeholder") || treeSelectPlaceholder;
      const search = codeboxId.includes("搜索")
        || input?.classList.contains("tree-select-demo__remote-input");

      select.classList.remove("qizhi-input-inner-wrapper", "qizhi-input-inner-wrapper-default", "input-demo", "input-demo--with-suffix");
      select.classList.add("qizhi-input-tag", "input-tag-demo", "select-demo", "select-demo-multiple");
      if (search) select.setAttribute("data-select-search", "");

      select.innerHTML = "";

      const view = document.createElement("div");
      view.className = "qizhi-input-tag-view";
      const inner = document.createElement("div");
      inner.className = "qizhi-input-tag-inner";

      const nextInput = document.createElement("input");
      nextInput.autocomplete = "off";
      nextInput.placeholder = placeholder;
      nextInput.className = `qizhi-input-tag-input${input?.classList.contains("tree-select-demo__remote-input") ? " tree-select-demo__remote-input" : ""}`;
      nextInput.value = input?.value || "";
      inner.append(nextInput);
      if (mirror && !remote) {
        const nextMirror = document.createElement("span");
        nextMirror.className = "qizhi-input-tag-input-mirror";
        nextMirror.textContent = mirror.textContent;
        inner.append(nextMirror);
      }

      const suffix = document.createElement("div");
      suffix.className = "qizhi-input-tag-suffix";
      const clearButton = document.createElement("button");
      clearButton.className = "qizhi-icon-hover qizhi-input-tag-clear-icon input-demo__clear select-demo__clear qizhi-tree-select-clear-icon";
      clearButton.type = "button";
      clearButton.setAttribute("aria-label", "清空");
      clearButton.setAttribute("data-select-clear", "");
      clearButton.append(createTreeSelectIcon("ri-close-line"));
      suffix.append(clearButton);
      const arrow = createTreeSelectIcon(`ri-arrow-down-s-line select-demo__arrow${search ? " select-demo__dropdown-icon" : ""}`);
      suffix.append(arrow);
      if (search) suffix.append(createTreeSelectIcon("ri-search-line select-demo__arrow select-demo__search-icon"));

      view.append(inner, suffix);
      select.append(view);
      if (remote) {
        select.classList.remove("qizhi-tree-select-open", "qizhi-tree-select-focused", "is-open");
        select.parentElement?.classList.remove("is-open");
        select.setAttribute("aria-expanded", "false");
      }
      return;
    }

    const value = getSingleDisplayText(select);
    const placeholder = getSinglePlaceholder(select);
    const search = isEditableSingleSearch(select);

    select.classList.add("qizhi-input-inner-wrapper", "qizhi-input-inner-wrapper-default", "input-demo", "input-demo--with-suffix", "select-demo");
    if (search) select.setAttribute("data-select-search", "");
    select.innerHTML = "";

    const input = document.createElement("input");
    input.className = "qizhi-input qizhi-input-size-default";
    input.placeholder = placeholder;
    input.value = value;
    input.autocomplete = "off";
    if (!search) input.readOnly = true;
    select.append(input);

    const clearButton = document.createElement("button");
    clearButton.className = "input-demo__clear select-demo__clear qizhi-tree-select-clear-icon";
    clearButton.type = "button";
    clearButton.setAttribute("aria-label", "清除选择");
    clearButton.setAttribute("data-select-clear", "");
    clearButton.append(createTreeSelectIcon("ri-close-line"));
    select.append(clearButton);

    const arrow = createTreeSelectIcon(`ri-arrow-down-s-line input-demo__suffix select-demo__arrow${search ? " select-demo__dropdown-icon" : ""}`);
    select.append(arrow);
    if (search) select.append(createTreeSelectIcon("ri-search-line input-demo__suffix select-demo__search-icon"));
    select.setAttribute("title", value);
  };

  const ensureClearButton = (select) => {
    const existingButton = select.querySelector(".qizhi-tree-select-clear-icon");
    if (existingButton) {
      existingButton.classList.add("input-demo__clear", "select-demo__clear");
      return;
    }

    const tagSuffix = select.querySelector(".qizhi-input-tag-suffix");
    if (tagSuffix) {
      const clearButton = document.createElement("button");
      clearButton.className = "qizhi-icon-hover qizhi-input-tag-clear-icon input-demo__clear select-demo__clear qizhi-tree-select-clear-icon";
      clearButton.type = "button";
      clearButton.setAttribute("aria-label", "清空");
      clearButton.setAttribute("data-select-clear", "");
      clearButton.append(createTreeSelectIcon("ri-close-line"));
      tagSuffix.prepend(clearButton);
      return;
    }

    const arrow = select.querySelector(".input-demo__suffix");
    if (arrow) {
      const clearButton = document.createElement("button");
      clearButton.className = "input-demo__clear select-demo__clear qizhi-tree-select-clear-icon";
      clearButton.type = "button";
      clearButton.setAttribute("aria-label", "清除选择");
      clearButton.setAttribute("data-select-clear", "");
      clearButton.append(createTreeSelectIcon("ri-close-line"));
      arrow.before(clearButton);
    }
  };

  const setSinglePlaceholder = (select) => {
    const nativeInput = select.querySelector(":scope > .qizhi-input");
    if (nativeInput) {
      nativeInput.value = "";
      nativeInput.placeholder = treeSelectPlaceholder;
      select.setAttribute("title", "");
      return;
    }

    const valueNode = select.querySelector(".qizhi-tree-select-view-value");
    const mirror = select.querySelector(".qizhi-tree-select-view-value-mirror");
    const input = select.querySelector(".qizhi-tree-select-view-input");
    const searchableInput = input && !input.classList.contains("qizhi-tree-select-hidden");

    if (valueNode) {
      valueNode.textContent = searchableInput ? "" : treeSelectPlaceholder;
      valueNode.hidden = !!searchableInput;
      valueNode.classList.add("is-placeholder");
    }
    if (mirror) mirror.textContent = searchableInput ? "" : treeSelectPlaceholder;
    if (input && !input.classList.contains("qizhi-tree-select-hidden")) {
      input.value = "";
      input.placeholder = treeSelectPlaceholder;
    }
    select.querySelector(".qizhi-tree-select-view")?.setAttribute("title", "");
  };

  const filterTreeData = (nodes, query) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return nodes;

    return nodes.reduce((matches, node) => {
      const children = node.children ? filterTreeData(node.children, query) : [];
      const matched = node.label.toLowerCase().includes(normalized) || node.value.toLowerCase().includes(normalized);
      if (matched || children.length) {
        matches.push({ ...node, children });
      }
      return matches;
    }, []);
  };

  const syncValueClass = (select, hasValue) => {
    select.classList.toggle("has-value", hasValue);
    select.parentElement?.classList.toggle("has-value", hasValue);
  };

  const ensurePopup = (select) => {
    let popup = select.querySelector(":scope > .tree-select-demo__popup");
    if (!popup) {
      popup = document.createElement("div");
      popup.className = "input-demo-select-popup select-demo-popup tree-select-demo__popup";
      popup.id = select.dataset.treeSelectPopupId;
      popup.hidden = true;
      select.append(popup);
    }
    select.setAttribute("aria-controls", popup.id);
    return popup;
  };

  const closeSelect = (select) => {
    select.classList.remove("qizhi-tree-select-open", "qizhi-tree-select-focused", "is-open");
    select.parentElement?.classList.remove("is-open");
    select.setAttribute("aria-expanded", "false");
    ensurePopup(select).hidden = true;
  };

  const closeOthers = (activeSelect) => {
    selects.forEach((select) => {
      if (select !== activeSelect) closeSelect(select);
    });
  };

  const setSingleValue = (select, label, item) => {
    const nativeInput = select.querySelector(":scope > .qizhi-input");
    const valueNode = select.querySelector(".qizhi-tree-select-view-value");
    const mirror = select.querySelector(".qizhi-tree-select-view-value-mirror");
    const input = select.querySelector(".qizhi-tree-select-view-input");
    const nextLabel = label || item?.label || "";

    if (nativeInput) {
      nativeInput.value = nextLabel;
      nativeInput.placeholder = "";
      select.setAttribute("title", nextLabel);
      syncValueClass(select, !!nextLabel);
      return;
    }

    if (valueNode) {
      valueNode.hidden = false;
      valueNode.classList.remove("is-placeholder");
      if (isRichValue(select)) {
        valueNode.textContent = "";
        const richValue = document.createElement("span");
        richValue.className = "tree-select-demo__rich-value";
        richValue.textContent = nextLabel;
        valueNode.append(richValue);
      } else {
        valueNode.textContent = nextLabel;
      }
    }
    if (mirror) mirror.textContent = "";
    if (input && !input.classList.contains("qizhi-tree-select-hidden")) {
      input.value = "";
      input.placeholder = "";
    }
    select.querySelector(".qizhi-tree-select-view")?.setAttribute("title", nextLabel);
    syncValueClass(select, !!nextLabel);
  };

  const createTag = (label, value = label) => {
    const tag = document.createElement("span");
    tag.className = "qizhi-tag qizhi-tag-checked qizhi-tag-size-default tag-demo-closable";
    tag.setAttribute("data-tree-select-tag", "");
    tag.dataset.value = value;
    tag.title = label;

    const content = document.createElement("span");
    content.className = "qizhi-tag-content";
    content.textContent = label;

    const closeButton = document.createElement("span");
    closeButton.className = "qizhi-icon-hover qizhi-tag-icon-hover qizhi-tag-close-btn";
    closeButton.setAttribute("role", "button");
    closeButton.setAttribute("tabindex", "0");
    closeButton.setAttribute("aria-label", `删除 ${label}`);
    closeButton.innerHTML = '<i class="ri-close-line" aria-hidden="true"></i>';

    tag.append(content, closeButton);
    return tag;
  };

  const getSelectedMultipleValues = (select) => [...select.querySelectorAll("[data-tree-select-tag]")]
    .map((tag) => tag.dataset.value || tag.textContent.trim())
    .filter(Boolean);

  const setMultipleValue = (select, item) => {
    const inner = select.querySelector(".qizhi-input-tag-inner");
    const input = select.querySelector(".qizhi-input-tag-input");
    if (!inner || !input) return;

    const value = typeof item === "string" ? item : item.value;
    const label = typeof item === "string" ? item : item.label;
    const values = getSelectedMultipleValues(select);
    if (values.includes(value)) return;
    inner.insertBefore(createTag(label, value), input);
    input.value = "";
    input.placeholder = "";
    const mirror = select.querySelector(".qizhi-input-tag-input-mirror");
    if (mirror) mirror.textContent = "";
    syncValueClass(select, true);
  };

  const removeMultipleValue = (select, value) => {
    select.querySelectorAll("[data-tree-select-tag]").forEach((tag) => {
      if (tag.dataset.value === value) tag.remove();
    });
    const hasValue = getSelectedMultipleValues(select).length > 0;
    if (!hasValue) {
      const input = select.querySelector(".qizhi-input-tag-input");
      if (input) input.placeholder = treeSelectPlaceholder;
    }
    syncValueClass(select, hasValue);
  };

  const clearValue = (select) => {
    if (isMultiple(select)) {
      select.querySelectorAll("[data-tree-select-tag]").forEach((tag) => tag.remove());
      const input = select.querySelector(".qizhi-input-tag-input");
      if (input) {
        input.value = "";
        input.placeholder = treeSelectPlaceholder;
      }
      syncValueClass(select, false);
      return;
    }
    setSinglePlaceholder(select);
    syncValueClass(select, false);
  };

  const createTreeIndent = (depth) => {
    const indent = document.createElement("span");
    indent.className = "qizhi-tree-node-indent";
    indent.setAttribute("aria-hidden", "true");
    for (let index = 0; index < depth; index += 1) {
      const block = document.createElement("span");
      block.className = "qizhi-tree-node-indent-block";
      if (index === 0) block.classList.add("qizhi-tree-node-indent-block-lineless");
      indent.append(block);
    }
    return indent;
  };

  const getTreeValues = (item) => flattenTree([item]).map((node) => node.value);

  const createTreeNode = (select, item, depth = 0) => {
    const hasChildren = !!item.children?.length;
    const checkable = isMultiple(select);
    const selectedValues = new Set(getSelectedMultipleValues(select));
    const childValues = hasChildren ? item.children.flatMap((child) => getTreeValues(child)) : [];
    const selectedChildCount = childValues.filter((value) => selectedValues.has(value)).length;
    const checked = selectedValues.has(item.value);
    const indeterminate = !checked && selectedChildCount > 0;
    const group = document.createElement("div");
    group.className = "tree-demo__node-group";
    group.setAttribute("data-tree-node-group", "");

    const node = document.createElement("div");
    node.className = `qizhi-tree-node${hasChildren ? " qizhi-tree-node-expanded" : " qizhi-tree-node-is-leaf"}`;
    node.setAttribute("role", "treeitem");
    node.setAttribute("aria-level", String(depth + 1));
    node.setAttribute("data-tree-node", "");
    node.setAttribute("data-tree-key", item.value);
    node.dataset.value = item.value;
    node.dataset.label = item.label;
    if (hasChildren) node.setAttribute("aria-expanded", "true");

    node.append(createTreeIndent(depth));

    if (hasChildren) {
      const switcher = document.createElement("button");
      switcher.className = "qizhi-tree-node-switcher qizhi-tree-node-switcher-expanded";
      switcher.type = "button";
      switcher.setAttribute("aria-label", "收起节点");
      switcher.setAttribute("data-tree-toggle", "");
      node.append(switcher);
    } else {
      const switcher = document.createElement("span");
      switcher.className = "qizhi-tree-node-switcher";
      node.append(switcher);
    }

    if (checkable) {
      const checkbox = document.createElement("label");
      checkbox.className = `qizhi-checkbox tree-node-checkbox${checked ? " qizhi-checkbox-checked" : ""}${indeterminate ? " qizhi-checkbox-indeterminate" : ""}`;
      checkbox.setAttribute("aria-hidden", "true");
      checkbox.innerHTML = '<input type="checkbox" tabindex="-1" data-tree-check><span class="qizhi-checkbox-mask-wrapper" aria-hidden="true"><span class="qizhi-checkbox-mask"><i class="ri-check-line" aria-hidden="true"></i></span></span>';
      const checkboxInput = checkbox.querySelector("input");
      checkboxInput.checked = checked;
      checkboxInput.indeterminate = indeterminate;
      node.append(checkbox);
    }

    const title = document.createElement("button");
    title.className = "qizhi-tree-node-title";
    title.type = "button";
    title.setAttribute("data-tree-select", "");
    const titleText = document.createElement("span");
    titleText.className = "qizhi-tree-node-title-text";
    titleText.textContent = item.label;
    title.append(titleText);
    node.append(title);
    group.append(node);

    if (hasChildren) {
      const children = document.createElement("div");
      children.className = "tree-demo__children";
      children.setAttribute("data-tree-children", "");
      item.children.forEach((child) => children.append(createTreeNode(select, child, depth + 1)));
      group.append(children);
    }

    return group;
  };

  const renderPopup = (select, query = "") => {
    const popup = ensurePopup(select);
    const items = filterTreeData(getDataForSelect(select), query);

    popup.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = select.dataset.emptyText
        ? "qizhi-empty qizhi-config-empty-state"
        : "select-demo-empty-option tree-select-demo__empty";
      if (select.dataset.emptyText) {
        const image = document.createElement("img");
        image.src = "./assets/qizhi-empty.svg";
        image.alt = "";
        const text = document.createElement("span");
        text.textContent = select.dataset.emptyText;
        empty.setAttribute("role", "status");
        empty.append(image, text);
      } else {
        empty.textContent = "暂无数据";
      }
      popup.append(empty);
      return;
    }

    const treeWrap = document.createElement("div");
    treeWrap.className = "tree-demo tree-select-demo__tree";
    treeWrap.setAttribute("data-tree-select-tree", "");
    const tree = document.createElement("div");
    tree.className = `qizhi-tree tree-demo__tree qizhi-tree-size-default${isMultiple(select) ? " qizhi-tree-checkable" : ""}`;
    tree.setAttribute("role", "tree");
    items.forEach((item) => tree.append(createTreeNode(select, item)));
    treeWrap.append(tree);
    popup.append(treeWrap);
  };

  const openSelect = (select) => {
    closeOthers(select);
    const input = select.querySelector(":scope > .qizhi-input:not([readonly]), .qizhi-tree-select-view-input:not(.qizhi-tree-select-hidden), .qizhi-input-tag-input");
    renderPopup(select, input?.value || "");
    const popup = ensurePopup(select);
    popup.hidden = false;
    select.classList.add("qizhi-tree-select-open", "qizhi-tree-select-focused", "is-open");
    select.parentElement?.classList.add("is-open");
    select.setAttribute("aria-expanded", "true");
    if (isSearchDemo(select) && input instanceof HTMLElement) input.focus({ preventScroll: true });
  };

  selects.forEach((select) => {
    if (select.dataset.treeSelectReady) return;
    normalizeTreeSelectBox(select);
    select.dataset.treeSelectReady = "true";
    select.tabIndex = select.tabIndex < 0 ? 0 : select.tabIndex;
    select.setAttribute("data-select-allow-clear", "");
    if (isMultiple(select)) {
      if ((getCodebox(select)?.id || "").includes("远程搜索")) {
        select.classList.add("select-demo-remote");
      }
    }
    const popup = ensurePopup(select);
    ensureClearButton(select);
    syncValueClass(select, isMultiple(select)
      ? getSelectedMultipleValues(select).length > 0
      : !!getSingleDisplayText(select));
    if (!select.classList.contains("has-value")) {
      if (isMultiple(select)) {
        const input = select.querySelector(".qizhi-input-tag-input");
        if (input) input.placeholder = treeSelectPlaceholder;
      } else {
        setSinglePlaceholder(select);
      }
    }

    popup.addEventListener("click", (event) => {
      event.stopPropagation();

      const toggle = event.target.closest("[data-tree-toggle]");
      if (toggle && popup.contains(toggle)) {
        const node = toggle.closest("[data-tree-node]");
        const group = node?.closest("[data-tree-node-group]");
        const children = group?.querySelector(":scope > [data-tree-children]");
        if (!node || !children) return;

        const expanded = node.getAttribute("aria-expanded") === "true";
        node.setAttribute("aria-expanded", String(!expanded));
        node.classList.toggle("qizhi-tree-node-expanded", !expanded);
        toggle.classList.toggle("qizhi-tree-node-switcher-expanded", !expanded);
        toggle.setAttribute("aria-label", expanded ? "展开节点" : "收起节点");
        children.hidden = expanded;
        return;
      }

      const check = event.target.closest("[data-tree-check]");
      const title = event.target.closest("[data-tree-select]");
      if (!title && !check) return;
      if ((title && !popup.contains(title)) || (check && !popup.contains(check))) return;
      const node = (title || check).closest("[data-tree-node]");
      if (!node) return;

      const item = {
        label: node.dataset.label || title?.textContent.trim() || "",
        value: node.dataset.value || node.getAttribute("data-tree-key") || title?.textContent.trim() || "",
      };
      const label = getDisplayLabel(select, item);
      if (isMultiple(select)) {
        if (getSelectedMultipleValues(select).includes(item.value)) {
          removeMultipleValue(select, item.value);
        } else {
          setMultipleValue(select, item);
        }
        const input = select.querySelector(".qizhi-input-tag-input");
        renderPopup(select, input?.value || "");
        ensurePopup(select).hidden = false;
        return;
      }

      popup.querySelectorAll(".qizhi-tree-node-selected").forEach((selectedNode) => {
        selectedNode.classList.remove("qizhi-tree-node-selected");
        selectedNode.removeAttribute("aria-selected");
      });
      node.classList.add("qizhi-tree-node-selected");
      node.setAttribute("aria-selected", "true");
      setSingleValue(select, label, item);
      closeSelect(select);
    });

    select.addEventListener("click", (event) => {
      const closeButton = event.target.closest(".qizhi-tag-close-btn");
      if (closeButton && select.contains(closeButton)) {
        event.stopPropagation();
        closeButton.closest("[data-tree-select-tag]")?.remove();
        const hasValue = getSelectedMultipleValues(select).length > 0;
        if (!hasValue) {
          const input = select.querySelector(".qizhi-input-tag-input");
          if (input) input.placeholder = treeSelectPlaceholder;
        }
        syncValueClass(select, hasValue);
        return;
      }

      const clearButton = event.target.closest(".qizhi-tree-select-clear-icon");
      if (clearButton && select.contains(clearButton)) {
        event.stopPropagation();
        clearValue(select);
        closeSelect(select);
        return;
      }

      select.classList.contains("qizhi-tree-select-open") ? closeSelect(select) : openSelect(select);
    });

    select.addEventListener("mouseenter", () => {
      select.parentElement?.classList.add("is-hover");
    });

    select.addEventListener("mouseleave", () => {
      select.parentElement?.classList.remove("is-hover");
    });

    select.addEventListener("keydown", (event) => {
      const closeButton = event.target.closest(".qizhi-tag-close-btn");
      if (closeButton && select.contains(closeButton)) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        closeButton.click();
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSelect(select);
      }
      if (event.key === "Escape") closeSelect(select);
    });

    select.querySelectorAll(":scope > .qizhi-input:not([readonly]), .qizhi-tree-select-view-input:not(.qizhi-tree-select-hidden), .qizhi-input-tag-input").forEach((input) => {
      input.addEventListener("click", (event) => {
        event.stopPropagation();
        openSelect(select);
      });
      input.addEventListener("focus", () => openSelect(select));
      input.addEventListener("input", () => {
        openSelect(select);
        renderPopup(select, input.value);
      });
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        const firstOption = ensurePopup(select).querySelector("[data-tree-select]");
        if (firstOption instanceof HTMLElement) {
          event.preventDefault();
          firstOption.click();
        }
      });
    });
  });

  sections.forEach((section) => section.querySelectorAll(".tree-select-size-demo").forEach((demo) => {
    const options = [...demo.querySelectorAll(".tree-demo-radio-group input")];
    const select = demo.querySelector(".tree-select-demo-stack .qizhi-tree-select");
    const sizeClasses = ["default", "large", "huge"].map((size) => `qizhi-tree-select-size-${size}`);
    const sync = (value) => {
      options.forEach((input) => {
        const checked = input.value === value;
        input.checked = checked;
        input.closest(".qizhi-segmented-item")?.classList.toggle("is-active", checked);
      });
      select?.classList.remove(...sizeClasses);
      select?.classList.add(`qizhi-tree-select-size-${value}`);
    };
    options.forEach((input) => {
      input.addEventListener("change", () => sync(input.value));
      input.closest(".qizhi-segmented-item")?.addEventListener("click", () => sync(input.value));
    });
    sync(options.find((input) => input.checked)?.value || "default");
  }));

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#component-tree-select .qizhi-tree-select, #component-tree-select .tree-select-demo__popup, #component-config-provider .qizhi-tree-select, #component-config-provider .tree-select-demo__popup")) {
      selects.forEach(closeSelect);
    }
  });
};

window.addEventListener("DOMContentLoaded", initTreeSelectDemos);

const initDatePickerDemos = () => {
  const demos = [...document.querySelectorAll("[data-date-picker-demo]")];
  if (!demos.length) return;

  const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];
  const padDate = (value) => String(value).padStart(2, "0");
  const formatDate = (date) => `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;
  const sameDate = (a, b) =>
    !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const getMode = (demo) => demo.dataset.mode || "date";
  const getWeekValue = (date) => {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
    return `${target.getUTCFullYear()}-W${padDate(week)}`;
  };
  const getTimeValue = (demo, field = "timeValue") => demo.dataset[field] || "00:00:00";
  const parseTimeParts = (value = "") => {
    const matches = value.match(/\d+/g) || [];
    return {
      hour: Math.min(23, Number(matches[0]) || 0),
      minute: Math.min(59, Number(matches[1]) || 0),
      second: Math.min(59, Number(matches[2]) || 0),
    };
  };
  const formatTimeParts = (parts) => `${padDate(parts.hour)}:${padDate(parts.minute)}:${padDate(parts.second)}`;
  const getActiveDateTimeField = (demo) => demo.dataset.activeField === "end" ? "end" : "start";
  const parsePickerDate = (demo, value) => {
    if (!value) return null;
    const mode = getMode(demo);
    if (mode === "year") return new Date(Number(value), 0, 1);
    if (mode === "month") {
      const [year, month] = value.split("-").map(Number);
      return new Date(year, month - 1, 1);
    }
    if (mode === "quarter") {
      const [year, quarter] = value.split("-Q").map(Number);
      return new Date(year, (quarter - 1) * 3, 1);
    }
    if (mode === "week") {
      const [year, week] = value.split("-W").map(Number);
      const date = new Date(year, 0, 4);
      const day = date.getDay() || 7;
      date.setDate(date.getDate() - day + 1 + (week - 1) * 7);
      return date;
    }
    return new Date(`${value.slice(0, 10)}T00:00:00`);
  };
  const isDateDisabled = (demo, date) => {
    const policy = demo.dataset.disabledDatePolicy;
    if (!policy) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (policy === "before-today") return target < today;
    if (policy === "next-seven-days") {
      const lastDate = new Date(today);
      lastDate.setDate(lastDate.getDate() + 7);
      return target < today || target > lastDate;
    }
    return false;
  };
  const isTimeOptionDisabled = (demo, unit, value, field) => {
    const policy = demo.dataset.disabledTimePolicy;
    if (!policy) return false;
    if (policy === "single") {
      if (unit === "hour") return value >= 6;
      return value >= 30;
    }
    if (policy === "range") {
      if (unit === "hour") return field === "start" ? value < 6 : value >= 6;
      if (unit === "minute") return field === "end" ? value < 30 : value >= 31;
      if (unit === "second") return value >= 30;
    }
    return false;
  };
  const formatDatePickerValue = (demo, date, field) => {
    const mode = getMode(demo);
    if (mode === "month") return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}`;
    if (mode === "year") return String(date.getFullYear());
    if (mode === "week") return getWeekValue(date);
    if (mode === "quarter") return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
    return demo.hasAttribute("data-show-time") ? `${formatDate(date)} ${getTimeValue(demo, field)}` : formatDate(date);
  };

  const syncDatePickerInputs = (demo) => {
    const hasValue = demo.hasAttribute("data-range")
      ? !!(demo.dataset.startValue || demo.dataset.endValue)
      : !!demo.dataset.value;
    demo.classList.toggle("has-value", hasValue);
    const clearButton = demo.querySelector(".date-picker-demo__clear");
    if (clearButton) clearButton.hidden = !hasValue;

    if (demo.hasAttribute("data-range")) {
      const startInput = demo.querySelector("[data-date-picker-start]");
      const endInput = demo.querySelector("[data-date-picker-end]");
      if (startInput) startInput.value = demo.dataset.startValue || "";
      if (endInput) endInput.value = demo.dataset.endValue || "";
      demo.querySelectorAll("[data-date-picker-input-wrap]").forEach((wrap) => {
        wrap.classList.toggle("is-active", wrap.dataset.datePickerInputWrap === getActiveDateTimeField(demo));
      });
      return;
    }
    const input = demo.querySelector(".date-picker-demo__input");
    if (input) input.value = demo.dataset.value || "";
  };

  const renderTimePanel = (demo) => {
    const timePanel = demo.querySelector(".date-picker-demo__time-panel");
    if (!timePanel) return;
    const field = demo.hasAttribute("data-range")
      ? `${getActiveDateTimeField(demo)}TimeValue`
      : "timeValue";
    const parts = parseTimeParts(getTimeValue(demo, field));
    const activeField = demo.hasAttribute("data-range") ? getActiveDateTimeField(demo) : "single";
    timePanel.querySelectorAll("[data-date-picker-time-unit]").forEach((button) => {
      const unit = button.dataset.datePickerTimeUnit;
      const value = Number(button.dataset.datePickerTimeValue);
      const disabled = isTimeOptionDisabled(demo, unit, value, activeField);
      button.disabled = disabled;
      button.hidden = disabled && demo.hasAttribute("data-hide-disabled-time-options");
      button.setAttribute("aria-disabled", String(disabled));
      button.classList.toggle("is-selected", !button.hidden && value === parts[unit]);
    });
    timePanel.querySelectorAll(".date-picker-demo__time-option.is-selected").forEach((button) => {
      const column = button.closest(".date-picker-demo__time-column");
      if (column) column.scrollTop = button.offsetTop - column.clientHeight / 2 + button.offsetHeight / 2;
    });
  };

  const closeDemo = (demo) => {
    demo.classList.remove("is-open");
    demo.querySelector(".date-picker-demo__popup")?.setAttribute("hidden", "");
    demo.querySelectorAll(".date-picker-demo__input").forEach((input) => input.setAttribute("aria-expanded", "false"));
    syncDatePickerInputs(demo);
  };

  const closeOthers = (activeDemo) => {
    demos.forEach((demo) => {
      if (demo !== activeDemo) closeDemo(demo);
    });
  };

  const renderCalendar = (demo) => {
    const popup = demo.querySelector(".date-picker-demo__popup");
    const panels = [...demo.querySelectorAll(".date-picker-demo__panel")];
    if (!popup || !panels.length) return;

    const mode = getMode(demo);
    const viewDate = new Date(Number(demo.dataset.viewYear), Number(demo.dataset.viewMonth), 1);
    const selectedValue = demo.dataset.value || "";
    const startValue = demo.dataset.startValue || "";
    const endValue = demo.dataset.endValue || "";
    const selectedDate = parsePickerDate(demo, selectedValue);
    const startDate = parsePickerDate(demo, startValue);
    const endDate = parsePickerDate(demo, endValue);
    const today = new Date();

    panels.forEach((calendarPanel, panelIndex) => {
      const monthLabel = calendarPanel.querySelector(".date-picker-demo__month");
      const daysNode = calendarPanel.querySelector(".date-picker-demo__days");
      if (!monthLabel || !daysNode) return;

      const panelDate = demo.hasAttribute("data-range") && !demo.hasAttribute("data-show-time")
        ? mode === "year"
          ? new Date(viewDate.getFullYear() + panelIndex * 12, 0, 1)
          : mode === "month" || mode === "quarter"
            ? new Date(viewDate.getFullYear() + panelIndex, viewDate.getMonth(), 1)
            : new Date(viewDate.getFullYear(), viewDate.getMonth() + panelIndex, 1)
        : viewDate;
      const year = panelDate.getFullYear();
      const month = panelDate.getMonth();
      const firstDay = (panelDate.getDay() + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      monthLabel.textContent = mode === "year"
        ? `${Math.floor(year / 12) * 12} - ${Math.floor(year / 12) * 12 + 11}`
        : `${year}年 ${month + 1}月`;
      daysNode.textContent = "";

      if (mode === "month" || mode === "year" || mode === "quarter") {
        const optionPanel = document.createElement("div");
        optionPanel.className = `date-picker-demo__panel-grid${mode === "year" ? " date-picker-demo__panel-grid--years" : ""}`;
        const options = mode === "month"
          ? Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1}月`, date: new Date(year, index, 1) }))
          : mode === "quarter"
            ? Array.from({ length: 4 }, (_, index) => ({ label: `Q${index + 1}`, date: new Date(year, index * 3, 1) }))
            : Array.from({ length: 12 }, (_, index) => {
              const startYear = Math.floor(year / 12) * 12;
              return { label: String(startYear + index), date: new Date(startYear + index, 0, 1) };
            });

        monthLabel.textContent = mode === "year" ? monthLabel.textContent : `${year}年`;
        options.forEach((option) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "date-picker-demo__panel-option";
          button.textContent = option.label;
          const value = formatDatePickerValue(demo, option.date);
          const disabled = isDateDisabled(demo, option.date);
          button.disabled = disabled;
          button.setAttribute("aria-disabled", String(disabled));
          button.classList.toggle("is-selected", demo.hasAttribute("data-range")
            ? value === startValue || value === endValue
            : selectedValue === value);
          button.addEventListener("click", (event) => {
            event.stopPropagation();
            if (demo.hasAttribute("data-range")) {
              if (!demo.dataset.startValue || demo.dataset.endValue) {
                demo.dataset.startValue = value;
                demo.dataset.endValue = "";
                syncDatePickerInputs(demo);
                renderCalendar(demo);
                return;
              }
              const startOptionDate = parsePickerDate(demo, demo.dataset.startValue);
              if (startOptionDate && option.date < startOptionDate) {
                demo.dataset.endValue = demo.dataset.startValue;
                demo.dataset.startValue = value;
              } else {
                demo.dataset.endValue = value;
              }
              closeDemo(demo);
              renderCalendar(demo);
              return;
            }
            demo.dataset.value = value;
            demo.querySelector(".date-picker-demo__input").value = value;
            closeDemo(demo);
          });
          optionPanel.append(button);
        });
        daysNode.append(optionPanel);
        return;
      }

      Array.from({ length: firstDay }).forEach(() => {
        const placeholder = document.createElement("span");
        placeholder.className = "date-picker-demo__day-placeholder";
        daysNode.append(placeholder);
      });

      Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const date = new Date(year, month, day);
        const button = document.createElement("button");
        button.type = "button";
        const isRangePicker = demo.hasAttribute("data-range");
        const isDateTimeRange = isRangePicker && demo.hasAttribute("data-show-time");
        const activeDateTimeField = isDateTimeRange ? getActiveDateTimeField(demo) : "";
        const isRangeStart = isRangePicker && sameDate(date, startDate) && (!isDateTimeRange || activeDateTimeField === "start");
        const isRangeEnd = isRangePicker && sameDate(date, endDate) && (!isDateTimeRange || activeDateTimeField === "end");
        const isInRange = isRangePicker && !isDateTimeRange && startDate && endDate && date > startDate && date < endDate;
        button.className = "date-picker-demo__day";
        button.textContent = String(day);
        button.setAttribute("aria-label", `${year}年${month + 1}月${day}日`);
        button.classList.toggle("is-today", sameDate(date, today));
        button.classList.toggle("is-selected", isRangePicker
          ? isRangeStart || isRangeEnd
          : sameDate(date, selectedDate));
        button.classList.toggle("is-range-start", isRangeStart);
        button.classList.toggle("is-range-end", isRangeEnd);
        button.classList.toggle("is-in-range", isInRange);
        const disabled = isDateDisabled(demo, date);
        button.disabled = disabled;
        button.setAttribute("aria-disabled", String(disabled));
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const value = formatDatePickerValue(demo, date);
          if (isRangePicker) {
            const startInput = demo.querySelector("[data-date-picker-start]");
            const endInput = demo.querySelector("[data-date-picker-end]");
            const startTimeField = demo.hasAttribute("data-show-time") ? "startTimeValue" : "timeValue";
            const endTimeField = demo.hasAttribute("data-show-time") ? "endTimeValue" : "timeValue";
            const nextStartValue = formatDatePickerValue(demo, date, startTimeField);
            if (demo.hasAttribute("data-show-time")) {
              const activeField = getActiveDateTimeField(demo);
              const timeField = activeField === "start" ? startTimeField : endTimeField;
              demo.dataset[`${activeField}Value`] = formatDatePickerValue(demo, date, timeField);
              const oppositeField = activeField === "start" ? "end" : "start";
              const oppositeDate = parsePickerDate(demo, demo.dataset[`${oppositeField}Value`] || "");
              if (
                oppositeDate
                && ((activeField === "start" && date > oppositeDate) || (activeField === "end" && date < oppositeDate))
              ) {
                demo.dataset[`${oppositeField}Value`] = "";
              }
              syncDatePickerInputs(demo);
              renderCalendar(demo);
              return;
            }
            if (!demo.dataset.startValue || demo.dataset.endValue) {
              demo.dataset.startValue = nextStartValue;
              demo.dataset.endValue = "";
              if (startInput) startInput.value = nextStartValue;
              if (endInput) endInput.value = "";
            } else {
              const startDateValue = parsePickerDate(demo, demo.dataset.startValue);
              const nextEndValue = formatDatePickerValue(demo, date, endTimeField);
              if (date < startDateValue) {
                demo.dataset.endValue = demo.dataset.startValue;
                demo.dataset.startValue = nextStartValue;
              } else {
                demo.dataset.endValue = nextEndValue;
              }
              if (startInput) startInput.value = demo.dataset.startValue;
              if (endInput) endInput.value = demo.dataset.endValue;
              closeDemo(demo);
            }
            renderCalendar(demo);
          } else if (demo.hasAttribute("data-show-time")) {
            demo.dataset.value = value;
            syncDatePickerInputs(demo);
            renderCalendar(demo);
          } else {
            demo.dataset.value = value;
            demo.querySelector(".date-picker-demo__input").value = value;
            closeDemo(demo);
          }
        });
        daysNode.append(button);
      });

      Array.from({ length: Math.max(0, 42 - firstDay - daysInMonth) }).forEach(() => {
        const placeholder = document.createElement("span");
        placeholder.className = "date-picker-demo__day-placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        daysNode.append(placeholder);
      });
    });
    renderTimePanel(demo);
  };

  const openDemo = (demo) => {
    closeOthers(demo);
    demo.classList.add("is-open");
    const popup = demo.querySelector(".date-picker-demo__popup");
    popup?.removeAttribute("hidden");
    demo.querySelectorAll(".date-picker-demo__input").forEach((input) => input.setAttribute("aria-expanded", "true"));
    renderCalendar(demo);
    syncDatePickerInputs(demo);
    if (!popup || window.matchMedia("(max-width: 640px)").matches) return;
    demo.classList.remove("is-popup-up", "is-popup-right");
    const popupHeight = popup.getBoundingClientRect().height;
    const popupWidth = popup.getBoundingClientRect().width;
    const controlRect = demo.getBoundingClientRect();
    if (!controlRect) return;
    const spaceBelow = window.innerHeight - controlRect.bottom - 8;
    demo.classList.toggle("is-popup-up", popupHeight > spaceBelow && controlRect.top > spaceBelow);
    demo.classList.toggle("is-popup-right", controlRect.left + popupWidth > window.innerWidth - 8);
  };

  demos.forEach((demo, demoIndex) => {
    const today = new Date();
    demo.dataset.viewYear = String(today.getFullYear());
    demo.dataset.viewMonth = String(today.getMonth());
    const placeholder = demo.dataset.placeholder || "请选择日期";
    const isRange = demo.hasAttribute("data-range");
    const popupId = `qizhi-date-picker-popup-${demoIndex + 1}`;
    const prefixHtml = demo.hasAttribute("data-prefix")
      ? '<div class="date-picker-demo__prefix" aria-hidden="true"><i class="ri-information-line"></i></div>'
      : "";
    const controlHtml = isRange
      ? `
        ${prefixHtml}
        <div class="date-picker-demo__input-wrap is-active" data-date-picker-input-wrap="start"><input class="date-picker-demo__input" data-date-picker-start role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="${popupId}" aria-label="${demo.dataset.startPlaceholder || "开始日期"}" placeholder="${demo.dataset.startPlaceholder || "开始日期"}" readonly></div>
        <span class="date-picker-demo__separator" aria-hidden="true">-</span>
        <div class="date-picker-demo__input-wrap" data-date-picker-input-wrap="end"><input class="date-picker-demo__input" data-date-picker-end role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="${popupId}" aria-label="${demo.dataset.endPlaceholder || "结束日期"}" placeholder="${demo.dataset.endPlaceholder || "结束日期"}" readonly></div>
      `
      : `${prefixHtml}<div class="date-picker-demo__input-wrap"><input class="date-picker-demo__input" role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="${popupId}" aria-label="${placeholder}" placeholder="${placeholder}" readonly></div>`;
    const suffixIcon = demo.hasAttribute("data-show-time") ? "ri-calendar-schedule-line" : "ri-calendar-line";
    const mode = getMode(demo);
    const isDatePanel = mode === "date" || mode === "week";
    const showTime = demo.hasAttribute("data-show-time");
    const panelCount = isRange && !showTime ? 2 : 1;
    const createNavButton = (direction, unit, label, icon) => `
      <button class="date-picker-demo__nav" type="button" data-date-picker-nav="${direction}-${unit}" aria-label="${label}">
        <i class="${icon}" aria-hidden="true"></i>
      </button>
    `;
    const panelsHtml = Array.from({ length: panelCount }, (_, panelIndex) => {
      const showPrevious = !isRange || panelIndex === 0;
      const showNext = !isRange || panelIndex === panelCount - 1;
      const previousControls = showPrevious
        ? isDatePanel
          ? `${createNavButton("prev", "year", "上一年", "ri-arrow-left-double-line")}${createNavButton("prev", "month", "上个月", "ri-arrow-left-s-line")}`
          : createNavButton("prev", "period", mode === "year" ? "前十二年" : "上一年", "ri-arrow-left-s-line")
        : '<span class="date-picker-demo__header-spacer" aria-hidden="true"></span>';
      const nextControls = showNext
        ? isDatePanel
          ? `${createNavButton("next", "month", "下个月", "ri-arrow-right-s-line")}${createNavButton("next", "year", "下一年", "ri-arrow-right-double-line")}`
          : createNavButton("next", "period", mode === "year" ? "后十二年" : "下一年", "ri-arrow-right-s-line")
        : '<span class="date-picker-demo__header-spacer" aria-hidden="true"></span>';
      return `
        <div class="date-picker-demo__panel" data-date-picker-panel="${panelIndex}">
          <div class="date-picker-demo__header">
            <span class="date-picker-demo__nav-group">${previousControls}</span>
            <span class="date-picker-demo__month" aria-live="polite"></span>
            <span class="date-picker-demo__nav-group">${nextControls}</span>
          </div>
          <div class="date-picker-demo__weekdays" aria-hidden="true">
            ${weekLabels.map((label) => `<span class="date-picker-demo__weekday">${label}</span>`).join("")}
          </div>
          <div class="date-picker-demo__days"></div>
        </div>
      `;
    }).join("");
    const createTimeOptions = (unit, max) => Array.from({ length: max + 1 }, (_, value) => `
      <button class="date-picker-demo__time-option" type="button" data-date-picker-time-unit="${unit}" data-date-picker-time-value="${value}">
        ${padDate(value)}
      </button>
    `).join("");
    const timePanelHtml = showTime ? `
      <div class="date-picker-demo__time-panel">
        <div class="date-picker-demo__time-title">选择时间</div>
        <div class="date-picker-demo__time-columns">
          <div class="date-picker-demo__time-column" aria-label="小时">${createTimeOptions("hour", 23)}</div>
          <div class="date-picker-demo__time-column" aria-label="分钟">${createTimeOptions("minute", 59)}</div>
          <div class="date-picker-demo__time-column" aria-label="秒">${createTimeOptions("second", 59)}</div>
        </div>
      </div>
    ` : "";
    const footerHtml = showTime
      ? isRange
        ? `
          <div class="date-picker-demo__footer">
            <div class="date-picker-demo__shortcuts">
              <span class="date-picker-demo__shortcut-label">快捷范围</span>
              <button class="date-picker-demo__shortcut" type="button" data-date-picker-shortcut="5">近5分钟</button>
              <button class="date-picker-demo__shortcut" type="button" data-date-picker-shortcut="60">近1小时</button>
              <button class="date-picker-demo__shortcut" type="button" data-date-picker-shortcut="360">近6小时</button>
              <button class="date-picker-demo__shortcut" type="button" data-date-picker-shortcut="1440">近24小时</button>
              <button class="date-picker-demo__shortcut" type="button" data-date-picker-shortcut="10080">近7天</button>
            </div>
            <button class="date-picker-demo__confirm" type="button" data-date-picker-confirm>确认</button>
          </div>
        `
        : `
          <div class="date-picker-demo__footer">
            <button class="date-picker-demo__today" type="button" data-date-picker-now>此刻</button>
            <button class="date-picker-demo__confirm" type="button" data-date-picker-confirm>确认</button>
          </div>
        `
      : isDatePanel
        ? '<div class="date-picker-demo__footer"><button class="date-picker-demo__today" type="button" data-date-picker-today>今天</button></div>'
        : "";

    demo.innerHTML = `
      ${controlHtml}
      <button class="input-demo__clear date-picker-demo__clear" type="button" aria-label="清空日期" hidden><i class="ri-close-line" aria-hidden="true"></i></button>
      <div class="date-picker-demo__suffix" aria-hidden="true"><i class="${suffixIcon}"></i></div>
      <div class="date-picker-demo__popup" id="${popupId}" role="dialog" aria-label="选择日期" hidden>
        <div class="date-picker-demo__main">
          <div class="date-picker-demo__panels">${panelsHtml}</div>
          ${timePanelHtml}
        </div>
        ${footerHtml}
      </div>
    `;

    if (isRange) demo.dataset.activeField = "start";
    demo.addEventListener("click", (event) => {
      if (event.target.closest(".date-picker-demo__popup")) return;
      if (event.target.closest(".date-picker-demo__clear")) return;
      const targetInput = event.target.closest("[data-date-picker-start], [data-date-picker-end]");
      if (targetInput?.hasAttribute("data-date-picker-end")) demo.dataset.activeField = "end";
      if (targetInput?.hasAttribute("data-date-picker-start")) demo.dataset.activeField = "start";
      demo.querySelectorAll("[data-date-picker-input-wrap]").forEach((wrap) => {
        wrap.classList.toggle("is-active", wrap.dataset.datePickerInputWrap === demo.dataset.activeField);
      });
      if (isRange && targetInput) {
        openDemo(demo);
      } else {
        demo.classList.contains("is-open") ? closeDemo(demo) : openDemo(demo);
      }
    });
    demo.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDemo(demo);
      }
      if (event.key === "Escape") closeDemo(demo);
    });

    if (isRange && showTime) {
      [
        ["[data-date-picker-start]", "start"],
        ["[data-date-picker-end]", "end"],
      ].forEach(([selector, field]) => {
        demo.querySelector(selector)?.addEventListener("click", (event) => {
          event.stopPropagation();
          demo.dataset.activeField = field;
          demo.querySelectorAll("[data-date-picker-input-wrap]").forEach((wrap) => {
            wrap.classList.toggle("is-active", wrap.dataset.datePickerInputWrap === field);
          });
          openDemo(demo);
        });
      });
    }

    demo.querySelector(".date-picker-demo__clear")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (isRange) {
        demo.dataset.startValue = "";
        demo.dataset.endValue = "";
        demo.dataset.activeField = "start";
      } else {
        demo.dataset.value = "";
      }
      closeDemo(demo);
      renderCalendar(demo);
      demo.querySelector(`[data-date-picker-${demo.dataset.activeField === "end" ? "end" : "start"}], .date-picker-demo__input`)?.focus();
    });

    demo.querySelectorAll("[data-date-picker-nav]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const [direction, unit] = button.dataset.datePickerNav.split("-");
        const amount = direction === "prev" ? -1 : 1;
        const year = Number(demo.dataset.viewYear);
        const month = Number(demo.dataset.viewMonth);
        const date = unit === "month"
          ? new Date(year, month + amount, 1)
          : unit === "period" && getMode(demo) === "year"
            ? new Date(year + amount * 12, month, 1)
            : new Date(year + amount, month, 1);
        demo.dataset.viewYear = String(date.getFullYear());
        demo.dataset.viewMonth = String(date.getMonth());
        renderCalendar(demo);
      });
    });

    demo.querySelector("[data-date-picker-today]")?.addEventListener("click", (event) => {
      event.stopPropagation();
      const date = new Date();
      demo.dataset.viewYear = String(date.getFullYear());
      demo.dataset.viewMonth = String(date.getMonth());
      if (isRange) {
        const startTimeField = demo.hasAttribute("data-show-time") ? "startTimeValue" : "timeValue";
        const endTimeField = demo.hasAttribute("data-show-time") ? "endTimeValue" : "timeValue";
        demo.dataset.startValue = formatDatePickerValue(demo, date, startTimeField);
        demo.dataset.endValue = formatDatePickerValue(demo, date, endTimeField);
        demo.querySelector("[data-date-picker-start]").value = demo.dataset.startValue;
        demo.querySelector("[data-date-picker-end]").value = demo.dataset.endValue;
      } else {
        demo.dataset.value = formatDatePickerValue(demo, date);
        demo.querySelector(".date-picker-demo__input").value = demo.dataset.value;
      }
      closeDemo(demo);
    });

    demo.querySelectorAll("[data-date-picker-time-unit]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const activeField = isRange ? getActiveDateTimeField(demo) : "";
        const timeField = isRange ? `${activeField}TimeValue` : "timeValue";
        const parts = parseTimeParts(getTimeValue(demo, timeField));
        parts[button.dataset.datePickerTimeUnit] = Number(button.dataset.datePickerTimeValue);
        const timeValue = formatTimeParts(parts);
        demo.dataset[timeField] = timeValue;
        const valueField = isRange ? `${activeField}Value` : "value";
        const currentValue = demo.dataset[valueField] || "";
        if (currentValue) demo.dataset[valueField] = `${currentValue.slice(0, 10)} ${timeValue}`;
        syncDatePickerInputs(demo);
        renderTimePanel(demo);
      });
    });

    demo.querySelectorAll("[data-date-picker-shortcut]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - Number(button.dataset.datePickerShortcut) * 60000);
        demo.dataset.startTimeValue = formatTimeParts({
          hour: startDate.getHours(),
          minute: startDate.getMinutes(),
          second: startDate.getSeconds(),
        });
        demo.dataset.endTimeValue = formatTimeParts({
          hour: endDate.getHours(),
          minute: endDate.getMinutes(),
          second: endDate.getSeconds(),
        });
        demo.dataset.startValue = formatDatePickerValue(demo, startDate, "startTimeValue");
        demo.dataset.endValue = formatDatePickerValue(demo, endDate, "endTimeValue");
        demo.dataset.activeField = "end";
        demo.dataset.viewYear = String(endDate.getFullYear());
        demo.dataset.viewMonth = String(endDate.getMonth());
        syncDatePickerInputs(demo);
        renderCalendar(demo);
      });
    });

    demo.querySelector("[data-date-picker-now]")?.addEventListener("click", (event) => {
      event.stopPropagation();
      const now = new Date();
      demo.dataset.timeValue = formatTimeParts({
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
      });
      demo.dataset.value = formatDatePickerValue(demo, now);
      demo.dataset.viewYear = String(now.getFullYear());
      demo.dataset.viewMonth = String(now.getMonth());
      syncDatePickerInputs(demo);
      renderCalendar(demo);
    });

    demo.querySelector("[data-date-picker-confirm]")?.addEventListener("click", (event) => {
      event.stopPropagation();
      closeDemo(demo);
      demo.querySelector(`[data-date-picker-${demo.dataset.activeField === "end" ? "end" : "start"}], .date-picker-demo__input`)?.focus();
    });

    demo.querySelector(".date-picker-demo__popup")?.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeDemo(demo);
      demo.querySelector(`[data-date-picker-${demo.dataset.activeField === "end" ? "end" : "start"}], .date-picker-demo__input`)?.focus();
    });
  });

  document.querySelectorAll("[data-date-picker-range-mode-demo]").forEach((group) => {
    const buttons = [...group.querySelectorAll("[data-date-picker-range-mode]")];
    const targets = [...group.querySelectorAll("[data-date-picker-range-target]")];
    const setMode = (mode, shouldFocus = false) => {
      buttons.forEach((button) => {
        const active = button.dataset.datePickerRangeMode === mode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-checked", String(active));
        button.tabIndex = active ? 0 : -1;
        if (active && shouldFocus) button.focus();
      });
      targets.forEach((target) => {
        const active = target.dataset.datePickerRangeTarget === mode;
        target.hidden = !active;
        if (!active) closeDemo(target);
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => setMode(button.dataset.datePickerRangeMode));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === "Home"
          ? 0
          : event.key === "End"
            ? buttons.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
        setMode(buttons[nextIndex].dataset.datePickerRangeMode, true);
      });
    });

    setMode(buttons.find((button) => button.getAttribute("aria-checked") === "true")?.dataset.datePickerRangeMode || "date");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-date-picker-demo]")) demos.forEach(closeDemo);
  });
};

window.addEventListener("DOMContentLoaded", initDatePickerDemos);

const initTimePickerDemos = () => {
  const demos = [...document.querySelectorAll("[data-time-picker-demo]")];
  if (!demos.length) return;

  const padTime = (value) => String(value).padStart(2, "0");
  const unitLabels = { hour: "时", minute: "分", second: "秒" };
  const unitMax = { hour: 23, minute: 59, second: 59 };
  const escapeAttr = (value = "") => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const getUnits = (demo) => demo.dataset.format === "HH:mm" ? ["hour", "minute"] : ["hour", "minute", "second"];
  const getStep = (demo, unit) => Math.max(1, Number(demo.dataset[`step${unit[0].toUpperCase()}${unit.slice(1)}`] || 1));
  const getOptions = (demo, unit) => {
    const step = getStep(demo, unit);
    return Array.from({ length: Math.floor(unitMax[unit] / step) + 1 }, (_, index) => index * step).filter((value) => value <= unitMax[unit]);
  };
  const parseTimeValue = (value) => {
    if (!value) return null;
    const [hour = "0", minute = "0", second = "0"] = value.split(":");
    return {
      hour: Number(hour) || 0,
      minute: Number(minute) || 0,
      second: Number(second) || 0,
    };
  };
  const fallbackParts = (demo) => parseTimeValue(demo.dataset.value) || { hour: 0, minute: 0, second: 0 };
  const formatTimeValue = (parts, units) => units.map((unit) => padTime(parts[unit] || 0)).join(":");
  const getActiveField = (demo) => demo.hasAttribute("data-range") && demo.dataset.activeField === "endValue" ? "endValue" : "startValue";

  const syncInputs = (demo) => {
    const isRange = demo.hasAttribute("data-range");

    if (isRange) {
      const startInput = demo.querySelector("[data-time-picker-start]");
      const endInput = demo.querySelector("[data-time-picker-end]");
      if (startInput) startInput.value = demo.dataset.startValue || "";
      if (endInput) endInput.value = demo.dataset.endValue || "";
      return;
    }

    const input = demo.querySelector(".qizhi-time-picker__input");
    if (input) input.value = demo.dataset.value || "";
  };

  const closeDemo = (demo) => {
    demo.classList.remove("is-open");
    demo.querySelector(".qizhi-time-picker__popup")?.setAttribute("hidden", "");
    demo.querySelectorAll(".qizhi-time-picker__input").forEach((input) => input.setAttribute("aria-expanded", "false"));
  };

  const closeOthers = (activeDemo) => {
    demos.forEach((demo) => {
      if (demo !== activeDemo) closeDemo(demo);
    });
  };

  const renderPanel = (demo) => {
    const panel = demo.querySelector(".qizhi-time-picker__panel");
    if (!panel) return;

    const units = getUnits(demo);
    const field = demo.hasAttribute("data-range") ? getActiveField(demo) : "value";
    const selectedValue = demo.dataset[field] || "";
    const selectedParts = parseTimeValue(selectedValue);
    panel.className = `qizhi-time-picker__panel${units.length === 2 ? " qizhi-time-picker__panel--compact" : ""}`;
    panel.textContent = "";

    units.forEach((unit) => {
      const column = document.createElement("div");
      column.className = "qizhi-time-picker__column";

      const title = document.createElement("div");
      title.className = "qizhi-time-picker__column-title";
      title.textContent = unitLabels[unit];
      column.append(title);

      const options = document.createElement("div");
      options.className = "qizhi-time-picker__options";
      getOptions(demo, unit).forEach((value) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "qizhi-time-picker__option";
        button.textContent = padTime(value);
        button.classList.toggle("is-selected", !!selectedParts && selectedParts[unit] === value);
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const nextParts = parseTimeValue(demo.dataset[field]) || fallbackParts(demo);
          nextParts[unit] = value;
          demo.dataset[field] = formatTimeValue(nextParts, units);
          syncInputs(demo);
          renderPanel(demo);
        });
        options.append(button);
      });

      column.append(options);
      panel.append(column);
    });
  };

  const openDemo = (demo) => {
    if (demo.hasAttribute("data-disabled")) return;
    closeOthers(demo);
    renderPanel(demo);
    demo.classList.add("is-open");
    demo.querySelector(".qizhi-time-picker__popup")?.removeAttribute("hidden");
    demo.querySelectorAll(".qizhi-time-picker__input").forEach((input) => input.setAttribute("aria-expanded", "true"));
  };

  demos.forEach((demo, demoIndex) => {
    const isRange = demo.hasAttribute("data-range");
    const isDisabled = demo.hasAttribute("data-disabled");
    const units = getUnits(demo);
    const placeholder = demo.dataset.placeholder || "请选择时间";
    const startPlaceholder = demo.dataset.startPlaceholder || "开始时间";
    const endPlaceholder = demo.dataset.endPlaceholder || "结束时间";
    const value = demo.dataset.value || "";
    const startValue = demo.dataset.startValue || "";
    const endValue = demo.dataset.endValue || "";

    demo.classList.add("qizhi-time-picker");
    demo.classList.toggle("qizhi-time-picker--range", isRange);
    demo.classList.toggle("qizhi-time-picker--mini", demo.dataset.size === "mini");
    demo.classList.toggle("qizhi-time-picker--small", demo.dataset.size === "small");
    demo.classList.toggle("qizhi-time-picker--large", demo.dataset.size === "large");
    demo.dataset.activeField = "startValue";
    demo.removeAttribute("role");
    demo.removeAttribute("aria-haspopup");
    demo.removeAttribute("aria-expanded");
    demo.removeAttribute("aria-disabled");
    demo.removeAttribute("tabindex");
    const popupId = `qizhi-time-picker-popup-${demoIndex + 1}`;

    const inputHtml = isRange
      ? `
        <div class="qizhi-time-picker__input-wrap is-active" data-time-picker-input-wrap="startValue"><input class="qizhi-time-picker__input" data-time-picker-start role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="${popupId}" aria-label="${escapeAttr(startPlaceholder)}" placeholder="${escapeAttr(startPlaceholder)}" value="${escapeAttr(startValue)}"${isDisabled ? " disabled" : ""} readonly></div>
        <span class="qizhi-time-picker__separator" aria-hidden="true">-</span>
        <div class="qizhi-time-picker__input-wrap" data-time-picker-input-wrap="endValue"><input class="qizhi-time-picker__input" data-time-picker-end role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="${popupId}" aria-label="${escapeAttr(endPlaceholder)}" placeholder="${escapeAttr(endPlaceholder)}" value="${escapeAttr(endValue)}"${isDisabled ? " disabled" : ""} readonly></div>
      `
      : `<div class="qizhi-time-picker__input-wrap"><input class="qizhi-time-picker__input" role="combobox" aria-haspopup="dialog" aria-expanded="false" aria-controls="${popupId}" aria-label="${escapeAttr(placeholder)}" placeholder="${escapeAttr(placeholder)}" value="${escapeAttr(value)}"${isDisabled ? " disabled" : ""} readonly></div>`;

    demo.innerHTML = `
      ${inputHtml}
      <div class="qizhi-time-picker__suffix" aria-hidden="true"><i class="ri-time-line"></i></div>
      <div class="qizhi-time-picker__popup" id="${popupId}" role="dialog" aria-label="选择时间" hidden>
        <div class="qizhi-time-picker__panel${units.length === 2 ? " qizhi-time-picker__panel--compact" : ""}"></div>
      </div>
    `;

    demo.addEventListener("click", (event) => {
      if (event.target.closest(".qizhi-time-picker__popup")) return;
      const targetInput = event.target.closest("[data-time-picker-start], [data-time-picker-end]");
      if (targetInput?.hasAttribute("data-time-picker-end")) {
        demo.dataset.activeField = "endValue";
      } else if (targetInput?.hasAttribute("data-time-picker-start")) {
        demo.dataset.activeField = "startValue";
      }
      demo.querySelectorAll("[data-time-picker-input-wrap]").forEach((wrap) => {
        wrap.classList.toggle("is-active", wrap.dataset.timePickerInputWrap === demo.dataset.activeField);
      });
      if (demo.classList.contains("is-open")) {
        if (isRange && targetInput) {
          renderPanel(demo);
        } else {
          closeDemo(demo);
        }
      } else {
        openDemo(demo);
      }
    });
    demo.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDemo(demo);
      }
      if (event.key === "Escape") closeDemo(demo);
    });

    syncInputs(demo);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-time-picker-demo]")) demos.forEach(closeDemo);
  });
};

window.addEventListener("DOMContentLoaded", initTimePickerDemos);

const initTimePickerSizeDemos = () => {
  document.querySelectorAll("[data-time-picker-size-demo]").forEach((demo) => {
    const target = demo.querySelector("[data-time-picker-size-target]");
    const inputs = [...demo.querySelectorAll("[data-time-picker-size-option] input")];
    if (!target || !inputs.length) return;

    const sync = () => {
      const size = inputs.find((input) => input.checked)?.value || "default";
      target.dataset.size = size;
      target.classList.remove("qizhi-time-picker--mini", "qizhi-time-picker--small", "qizhi-time-picker--large");
      if (size !== "default") target.classList.add(`qizhi-time-picker--${size}`);
    };

    inputs.forEach((input) => input.addEventListener("change", sync));
    sync();
  });
};

window.addEventListener("DOMContentLoaded", initTimePickerSizeDemos);

const initInputNumberDemos = () => {
  document.querySelectorAll("[data-input-number]").forEach((wrapper) => {
    const input = wrapper.querySelector("input");
    if (!input) return;

    input.addEventListener("input", () => syncInputNumberAria(wrapper));
    syncInputNumberAria(wrapper);
  });
};

window.addEventListener("DOMContentLoaded", initInputNumberDemos);

const initRadioDemos = () => {
  document.querySelectorAll("[data-radio-demo]").forEach((label) => {
    const input = label.querySelector("input");
    if (!input) return;

    label.classList.toggle("qizhi-radio-checked", input.checked);
    label.classList.toggle("qizhi-radio-disabled", input.disabled);
    label.setAttribute("aria-disabled", String(input.disabled));

    input.addEventListener("change", () => {
      document
        .querySelectorAll(`[data-radio-demo] input[name="${input.name}"]`)
        .forEach((groupInput) => {
          groupInput.closest("[data-radio-demo]")?.classList.toggle("qizhi-radio-checked", groupInput.checked);
        });
    });
  });
};

window.addEventListener("DOMContentLoaded", initRadioDemos);

const initRadioButtonDemos = () => {
  document.querySelectorAll("[data-radio-button-demo]").forEach((label) => {
    const input = label.querySelector("input");
    if (!input) return;

    const syncLabel = (target, checked, disabled) => {
      const isSegmented = target.classList.contains("qizhi-segmented-item");
      target.classList.toggle(isSegmented ? "is-active" : "qizhi-radio-checked", checked);
      target.classList.toggle(isSegmented ? "is-disabled" : "qizhi-radio-disabled", disabled);
      target.setAttribute("aria-checked", String(checked));
    };

    syncLabel(label, input.checked, input.disabled);
    label.setAttribute("aria-disabled", String(input.disabled));

    input.addEventListener("change", () => {
      document
        .querySelectorAll(`[data-radio-button-demo] input[name="${input.name}"]`)
        .forEach((groupInput) => {
          const groupLabel = groupInput.closest("[data-radio-button-demo]");
          if (groupLabel) syncLabel(groupLabel, groupInput.checked, groupInput.disabled);
        });
    });
  });
};

window.addEventListener("DOMContentLoaded", initRadioButtonDemos);

const initRadioButtonCountDemos = () => {
  document.querySelectorAll("[data-radio-button-count-demo]").forEach((demo) => {
    const countInputs = [...demo.querySelectorAll("[data-radio-button-count-input]")];

    const syncGroup = (group, count) => {
      const options = [...group.querySelectorAll("[data-radio-button-option-index]")];
      options.forEach((option) => {
        const index = Number(option.dataset.radioButtonOptionIndex);
        const visible = index <= count;
        option.hidden = !visible;
        option.classList.remove("is-visible-first", "is-visible-last");
        const input = option.querySelector("input");
        if (input && !visible) input.checked = false;
        option.classList.toggle("qizhi-radio-checked", !!input?.checked && visible);
      });

      const visibleOptions = options.filter((option) => !option.hidden);
      visibleOptions[0]?.classList.add("is-visible-first");
      visibleOptions[visibleOptions.length - 1]?.classList.add("is-visible-last");

      const visibleInputs = visibleOptions
        .map((option) => option.querySelector("input"))
        .filter((input) => input && !input.disabled);

      if (!visibleInputs.some((input) => input.checked) && visibleInputs[0]) {
        visibleInputs[0].checked = true;
        visibleInputs[0].closest("[data-radio-button-demo]")?.classList.add("qizhi-radio-checked");
      }
    };

    const sync = () => {
      const count = Number(countInputs.find((input) => input.checked)?.value || 4);
      demo.querySelectorAll("[data-radio-button-count-target]").forEach((group) => syncGroup(group, count));
    };

    countInputs.forEach((input) => input.addEventListener("change", sync));
    sync();
  });
};

window.addEventListener("DOMContentLoaded", initRadioButtonCountDemos);

const setRadioSegmentedActive = (button) => {
  const group = button.closest(".qizhi-segmented");
  if (!group) return;

  group.querySelectorAll("[data-radio-segmented-demo]").forEach((candidate) => {
    const isActive = candidate === button;
    candidate.classList.toggle("is-active", isActive);
    candidate.setAttribute("aria-checked", String(isActive));
  });
};

const syncRadioSegmentedCountDemo = (demo) => {
  const activeCount = demo.querySelector("[data-radio-segmented-count].is-active");
  const count = Number(activeCount?.dataset.radioSegmentedCount || 4);
  const activeSize = demo.querySelector("[data-radio-segmented-size].is-active");
  const size = activeSize?.dataset.radioSegmentedSize || "default";

  demo.querySelectorAll("[data-radio-segmented-count-target] .qizhi-segmented").forEach((group) => {
    group.classList.remove("qizhi-segmented-sm", "qizhi-segmented-lg");
    if (size === "small") group.classList.add("qizhi-segmented-sm");
    if (size === "large") group.classList.add("qizhi-segmented-lg");

    const options = [...group.querySelectorAll("[data-radio-segmented-option-index]")];
    options.forEach((option) => {
      const hidden = Number(option.dataset.radioSegmentedOptionIndex) > count;
      option.hidden = hidden;
      if (hidden) {
        option.classList.remove("is-active");
        option.setAttribute("aria-checked", "false");
      }
    });

    const visibleOptions = options.filter((option) => !option.hidden);
    if (!visibleOptions.some((option) => option.classList.contains("is-active")) && visibleOptions[0]) {
      setRadioSegmentedActive(visibleOptions[0]);
    }
  });

  demo.querySelectorAll("[data-radio-segmented-count-target] .radio-button-demo").forEach((group) => {
    group.classList.remove("qizhi-radio-size-small", "qizhi-radio-size-default", "qizhi-radio-size-large");
    group.classList.add(`qizhi-radio-size-${size}`);

    const options = [...group.querySelectorAll("[data-radio-segmented-option-index]")];
    options.forEach((option) => {
      const hidden = Number(option.dataset.radioSegmentedOptionIndex) > count;
      option.hidden = hidden;
      option.classList.remove("is-visible-first", "is-visible-last");
      const input = option.querySelector("input");
      if (hidden) {
        option.classList.remove("qizhi-radio-checked");
        if (input) input.checked = false;
      }
    });

    const visibleOptions = options.filter((option) => !option.hidden);
    visibleOptions[0]?.classList.add("is-visible-first");
    visibleOptions[visibleOptions.length - 1]?.classList.add("is-visible-last");

    const checkedOption = visibleOptions.find((option) => option.classList.contains("qizhi-radio-checked"));
    if (!checkedOption && visibleOptions[0]) {
      const input = visibleOptions[0].querySelector("input");
      visibleOptions[0].classList.add("qizhi-radio-checked");
      if (input) input.checked = true;
    }
  });
};

const initRadioSegmentedDemos = () => {
  document.querySelectorAll("[data-radio-segmented-demo]").forEach((button) => {
    button.addEventListener("click", () => {
      setRadioSegmentedActive(button);
      const countDemo = button.closest("[data-radio-segmented-count-demo]");
      if (
        countDemo &&
        (button.hasAttribute("data-radio-segmented-count") || button.hasAttribute("data-radio-segmented-size"))
      ) {
        syncRadioSegmentedCountDemo(countDemo);
      }
    });
  });

  document.querySelectorAll("[data-radio-segmented-count-demo]").forEach(syncRadioSegmentedCountDemo);
};

window.addEventListener("DOMContentLoaded", initRadioSegmentedDemos);

const getInputNumberRawValue = (input) => input.value.replace(/,/g, "");

const getInputNumberStep = (wrapper, input) => {
  const value = Number(wrapper.dataset.inputNumberStepValue || input.getAttribute("step"));
  return Number.isFinite(value) && value > 0 ? value : 1;
};

const getInputNumberPrecision = (wrapper, input) => {
  const value = Number(wrapper.dataset.inputNumberPrecision);
  if (Number.isInteger(value) && value >= 0) return value;
  const stepValue = String(getInputNumberStep(wrapper, input));
  return stepValue.includes(".") ? stepValue.split(".")[1].length : 0;
};

const formatInputNumberValue = (wrapper, input, value) => {
  if (typeof value === "bigint") return String(value);

  const precision = getInputNumberPrecision(wrapper, input);
  const numericValue = precision > 0 ? Number(value).toFixed(precision) : String(value);
  if (wrapper.dataset.inputNumberFormat === "currency") {
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return numericValue;
};

const getInputNumberBound = (input, name, fallback) => {
  const value = Number(input.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
};

const syncInputNumberAria = (wrapper) => {
  const input = wrapper.querySelector("input");
  if (!input) return;

  const rawValue = getInputNumberRawValue(input);
  if (rawValue === "") {
    input.removeAttribute("aria-valuenow");
    return;
  }

  input.setAttribute("aria-valuenow", rawValue);
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-input-number-step]");
  if (!button || button.disabled) return;

  const wrapper = button.closest("[data-input-number]");
  const input = wrapper?.querySelector("input");
  if (!wrapper || !input || input.disabled || input.readOnly) return;

  const min = getInputNumberBound(input, "min", -Infinity);
  const max = getInputNumberBound(input, "max", Infinity);
  const direction = button.dataset.inputNumberStep === "up" ? 1 : -1;
  const currentRawValue = getInputNumberRawValue(input);
  const current = currentRawValue === "" ? 0 : Number(currentRawValue);
  const step = getInputNumberStep(wrapper, input);
  const canUseBigInt = /^-?\d+$/.test(currentRawValue) && Number.isInteger(step) && !Number.isFinite(min) && !Number.isFinite(max);
  const next = canUseBigInt
    ? BigInt(currentRawValue || "0") + BigInt(direction * step)
    : Math.min(max, Math.max(min, (Number.isFinite(current) ? current : 0) + direction * step));

  input.value = formatInputNumberValue(wrapper, input, next);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  syncInputNumberAria(wrapper);
});

const clampSliderValue = (value, min, max) => Math.min(max, Math.max(min, value));

const parseSliderValues = (slider) =>
  String(slider.dataset.sliderValues || "0")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

const initSliderDemos = () => {
  document.querySelectorAll("[data-slider-demo]").forEach((slider) => {
    if (slider.dataset.sliderReady) return;
    slider.dataset.sliderReady = "true";

    const road = slider.querySelector(".qizhi-slider-road");
    const bar = slider.querySelector(".qizhi-slider-bar");
    const buttons = [...slider.querySelectorAll(".qizhi-slider-button")];
    if (!road || !bar || !buttons.length) return;

    const min = Number(slider.dataset.sliderMin || 0);
    const max = Number(slider.dataset.sliderMax || 100);
    const step = Number(slider.dataset.sliderStep || 1);
    const disabled = slider.dataset.sliderDisabled === "true"
      || slider.classList.contains("qizhi-slider-disabled")
      || slider.classList.contains("qizhi-slider-disabled");
    const vertical = slider.dataset.sliderVertical === "true"
      || slider.classList.contains("qizhi-slider-vertical")
      || slider.classList.contains("qizhi-slider-vertical");
    const draggableBar = slider.dataset.sliderDraggableBar === "true";
    const tooltipSuffix = slider.dataset.sliderTooltipSuffix || "";
    const linked = slider.closest("[data-slider-linked]");
    const numberInputs = linked ? [...linked.querySelectorAll("[data-slider-number] input")] : [];
    const output = linked?.querySelector("[data-slider-value-output]");
    let values = parseSliderValues(slider);
    if (!values.length) values = [min];

    const normalize = (nextValues) =>
      nextValues
        .slice(0, buttons.length)
        .map((value) => clampSliderValue(min + Math.round((value - min) / step) * step, min, max))
        .sort((a, b) => a - b);

    const toPercent = (value) => (max === min ? 0 : ((value - min) / (max - min)) * 100);

    const syncBar = () => {
      const start = values.length > 1 ? toPercent(Math.min(...values)) : 0;
      const end = toPercent(Math.max(...values));

      if (vertical) {
        bar.style.left = "0";
        bar.style.right = "0";
        bar.style.bottom = `${start}%`;
        bar.style.top = `${100 - end}%`;
        return;
      }

      bar.style.top = "0";
      bar.style.bottom = "0";
      bar.style.left = `${start}%`;
      bar.style.right = `${100 - end}%`;
    };

    const formatTooltipValue = (value) => `${value}${tooltipSuffix}`;

    buttons.forEach((button) => {
      let tooltip = button.querySelector("[data-slider-tooltip]");
      if (!tooltip) {
        tooltip = document.createElement("span");
        button.appendChild(tooltip);
      }
      tooltip.classList.add("qizhi-tooltip", "tooltip-demo__bubble", "slider-demo-tooltip");
      tooltip.setAttribute("role", "tooltip");
      tooltip.dataset.sliderTooltip = "";
    });

    const sync = (sourceInputIndex = -1) => {
      values = normalize(values);
      slider.dataset.sliderValues = values.join(",");

      syncBar();

      buttons.forEach((button, index) => {
        const value = values[index] ?? values[values.length - 1];
        const percent = toPercent(value);
        if (vertical) {
          button.style.left = "50%";
          button.style.top = "";
          button.style.bottom = `${percent}%`;
        } else {
          button.style.top = "50%";
          button.style.bottom = "";
          button.style.left = `${percent}%`;
        }
        button.setAttribute("aria-valuemin", String(min));
        button.setAttribute("aria-valuemax", String(max));
        button.setAttribute("aria-valuenow", String(value));
        button.setAttribute("aria-valuetext", formatTooltipValue(value));
        button.setAttribute("aria-disabled", String(disabled));
        const tooltip = button.querySelector("[data-slider-tooltip]");
        if (tooltip) tooltip.textContent = formatTooltipValue(value);
        if (disabled) {
          button.disabled = true;
          button.tabIndex = -1;
        } else {
          button.disabled = false;
          button.tabIndex = 0;
        }
      });

      numberInputs.forEach((input, index) => {
        if (index === sourceInputIndex) return;
        input.value = String(values[index] ?? values[values.length - 1]);
        syncInputNumberAria(input.closest("[data-input-number]"));
      });

      if (output) output.textContent = `value: [${values.join(",")}]`;
      slider.dispatchEvent(new CustomEvent("slider:change", { bubbles: true, detail: { values: [...values] } }));
    };

    const getValueFromPointer = (event) => {
      const rect = road.getBoundingClientRect();
      const percent = vertical
        ? (rect.height ? clampSliderValue((rect.bottom - event.clientY) / rect.height, 0, 1) : 0)
        : (rect.width ? clampSliderValue((event.clientX - rect.left) / rect.width, 0, 1) : 0);
      return min + percent * (max - min);
    };

    const getPointerDeltaValue = (event, startPointer) => {
      const rect = road.getBoundingClientRect();
      const trackSize = vertical ? rect.height : rect.width;
      if (!trackSize) return 0;
      const pixelDelta = vertical ? startPointer - event.clientY : event.clientX - startPointer;
      return (pixelDelta / trackSize) * (max - min);
    };

    const closestHandleIndex = (value) => {
      let index = 0;
      let distance = Infinity;
      values.forEach((current, currentIndex) => {
        const currentDistance = Math.abs(current - value);
        if (currentDistance < distance) {
          index = currentIndex;
          distance = currentDistance;
        }
      });
      return index;
    };

    const setHandleValue = (index, value) => {
      values[index] = value;
      sync();
    };

    slider.addEventListener("slider:set", (event) => {
      const nextValues = event.detail?.values;
      if (!Array.isArray(nextValues) || !nextValues.length) return;
      values = normalize(nextValues);
      sync();
    });

    if (draggableBar && buttons.length === 2) {
      bar.addEventListener("pointerdown", (event) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        const startPointer = vertical ? event.clientY : event.clientX;
        const startValues = normalize(values);
        const startLow = startValues[0];
        const startHigh = startValues[1];
        const range = startHigh - startLow;
        bar.setPointerCapture?.(event.pointerId);

        const move = (moveEvent) => {
          const deltaValue = getPointerDeltaValue(moveEvent, startPointer);
          const nextLow = clampSliderValue(startLow + deltaValue, min, max - range);
          values = [nextLow, nextLow + range];
          sync();
        };
        const stop = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", stop);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", stop);
      });
    }

    road.addEventListener("pointerdown", (event) => {
      if (disabled) return;
      const value = getValueFromPointer(event);
      const index = closestHandleIndex(value);
      const activeButton = buttons[index];
      activeButton?.classList.add("is-dragging");
      setHandleValue(index, value);
      road.setPointerCapture?.(event.pointerId);

      const move = (moveEvent) => setHandleValue(index, getValueFromPointer(moveEvent));
      const stop = () => {
        activeButton?.classList.remove("is-dragging");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    });

    buttons.forEach((button, index) => {
      button.addEventListener("pointerdown", (event) => {
        if (disabled) return;
        event.stopPropagation();
        button.classList.add("is-dragging");
        button.setPointerCapture?.(event.pointerId);
        const move = (moveEvent) => setHandleValue(index, getValueFromPointer(moveEvent));
        const stop = () => {
          button.classList.remove("is-dragging");
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", stop);
          window.removeEventListener("pointercancel", stop);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", stop);
        window.addEventListener("pointercancel", stop);
      });

      button.addEventListener("keydown", (event) => {
        if (disabled) return;
        const current = values[index] ?? min;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          setHandleValue(index, current + step);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          setHandleValue(index, current - step);
        } else if (event.key === "Home") {
          event.preventDefault();
          setHandleValue(index, min);
        } else if (event.key === "End") {
          event.preventDefault();
          setHandleValue(index, max);
        }
      });
    });

    numberInputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        const value = Number(input.value);
        if (!Number.isFinite(value)) return;
        values[index] = value;
        sync(index);
      });
    });

    sync();
  });
};

window.addEventListener("DOMContentLoaded", initSliderDemos);

const initInputTagDemo = () => {
  document.querySelectorAll(".input-tag-demo").forEach((demo) => {
    if (demo.classList.contains("qizhi-tree-select")) return;

    const input = demo.querySelector(".qizhi-input-tag-input");
    const inner = demo.querySelector(".qizhi-input-tag-inner");
    let clearButton = demo.querySelector(".qizhi-input-tag-clear-icon");
    if (!clearButton) {
      let suffix = demo.querySelector(".qizhi-input-tag-suffix");
      if (!suffix) {
        suffix = document.createElement("div");
        suffix.className = "qizhi-input-tag-suffix";
        demo.querySelector(".qizhi-input-tag-view")?.append(suffix);
      }
      clearButton = document.createElement("button");
      clearButton.className = "qizhi-icon-hover qizhi-input-tag-clear-icon";
      clearButton.type = "button";
      clearButton.setAttribute("aria-label", "清空");
      clearButton.innerHTML = '<i class="ri-close-line" aria-hidden="true"></i>';
      suffix.append(clearButton);
    }
    const result = demo.closest(".input-tag-demo-stack")?.querySelector("[data-input-tag-result]");
    const message = demo.closest(".input-tag-demo-stack")?.querySelector("[data-input-tag-message]");

    const getTags = () => [...demo.querySelectorAll(".qizhi-input-tag-tag")];
    const originalPlaceholder = input?.getAttribute("placeholder") || "";

    const syncClearButton = () => {
      const hasValue = !!input?.value.trim();
      clearButton?.toggleAttribute("hidden", getTags().length === 0 && !hasValue);
    };

    const syncPlaceholder = () => {
      if (!input) return;
      const shouldShow = getTags().length === 0 && input.value.trim() === "";
      input.setAttribute("placeholder", shouldShow ? originalPlaceholder : "");
    };

    const syncMaxTagCount = () => {
      const isResponsive = demo.dataset.maxTagCount === "responsive";
      const max = Number(demo.dataset.maxTagCount);
      const tags = getTags();
      let ellipsis = demo.querySelector(".qizhi-input-tag-tag-ellipsis");

      if (!isResponsive && (!Number.isFinite(max) || max <= 0)) {
        ellipsis?.remove();
        tags.forEach((tag) => tag.hidden = false);
        return;
      }

      let visibleCount = max;
      if (isResponsive) {
        tags.forEach((tag) => tag.hidden = false);
        ellipsis?.remove();
        ellipsis = document.createElement("span");
        ellipsis.className = "qizhi-input-tag-tag-ellipsis";
        inner?.insertBefore(ellipsis, input || null);

        const availableWidth = inner?.clientWidth || 0;
        const gap = 4;
        visibleCount = tags.length;
        while (visibleCount > 0) {
          const hiddenCount = tags.length - visibleCount;
          if (hiddenCount === 0) {
            ellipsis.textContent = "";
          } else {
            const template = demo.dataset.moreTemplate || "+{count}";
            ellipsis.textContent = template.replace("{count}", String(hiddenCount));
          }
          const tagsWidth = tags.slice(0, visibleCount).reduce((width, tag) => width + tag.getBoundingClientRect().width, 0);
          const itemCount = visibleCount + (hiddenCount > 0 ? 1 : 0);
          const requiredWidth = tagsWidth + (hiddenCount > 0 ? ellipsis.getBoundingClientRect().width : 0) + Math.max(itemCount - 1, 0) * gap;
          if (requiredWidth <= availableWidth) break;
          visibleCount -= 1;
        }
      }

      const hiddenCount = Math.max(tags.length - visibleCount, 0);
      tags.forEach((tag, index) => {
        tag.hidden = index >= visibleCount;
      });

      if (hiddenCount > 0) {
        if (!ellipsis) {
          ellipsis = document.createElement("span");
          ellipsis.className = "qizhi-input-tag-tag-ellipsis";
          inner?.insertBefore(ellipsis, input || null);
        }
        const template = demo.dataset.moreTemplate || "+{count}";
        ellipsis.textContent = template.replace("{count}", String(hiddenCount));
      } else {
        ellipsis?.remove();
      }
    };

    const getTagValue = (tag) => {
      const label = tag.querySelector(".qizhi-tag-content")?.textContent.trim() || "";
      const value = tag.dataset.value || label;
      if (demo.hasAttribute("data-format-word")) return { word: value };
      if (demo.hasAttribute("data-label-in-value")) return { label, value };
      return value;
    };

    const syncResult = () => {
      if (!result) return;
      const value = getTags().map(getTagValue);
      result.textContent = JSON.stringify(value, null, 2);
    };

    const setMessage = (text = "", type = "neutral") => {
      if (!message) return;
      message.textContent = text;
      message.classList.toggle("is-error", type === "error");
      demo.classList.toggle("is-error", type === "error");
    };

    const sync = () => {
      syncClearButton();
      syncPlaceholder();
      syncMaxTagCount();
      syncResult();
    };

    const createTag = (value) => {
      const label = value.trim();
      if (!label || !input || !inner) return;
      const minLength = Number(demo.dataset.minLength);

      if (Number.isFinite(minLength) && label.length <= minLength) {
        setMessage(demo.dataset.errorMessage || `长度必须大于 ${minLength}`, "error");
        return;
      }

      setMessage(message?.dataset.defaultText || "", "neutral");

      const tag = document.createElement("span");
      tag.className = "qizhi-tag qizhi-tag-checked qizhi-tag-size-default qizhi-input-tag-tag";
      tag.title = label;
      if (demo.hasAttribute("data-label-in-value")) tag.dataset.value = label;

      const content = document.createElement("span");
      content.className = "qizhi-tag-content";
      content.textContent = label;

      const closeButton = document.createElement("button");
      closeButton.className = "qizhi-icon-hover qizhi-tag-icon-hover qizhi-tag-close-btn";
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", `删除 ${label}`);

      const icon = document.createElement("i");
      icon.className = "ri-close-line";
      icon.setAttribute("aria-hidden", "true");

      closeButton.append(icon);
      tag.append(content, closeButton);
      inner.insertBefore(tag, input);
      input.value = "";
      sync();
    };

    demo.addEventListener("click", (event) => {
      const tagCloseButton = event.target.closest(".qizhi-tag-close-btn");
      if (tagCloseButton && demo.contains(tagCloseButton)) {
        tagCloseButton.closest(".qizhi-input-tag-tag")?.remove();
        sync();
        input?.focus();
        return;
      }

      const clearTrigger = event.target.closest(".qizhi-input-tag-clear-icon");
      if (clearTrigger && demo.contains(clearTrigger)) {
        getTags().forEach((tag) => tag.remove());
        if (input) input.value = "";
        sync();
        input?.focus();
      }
    });

    input?.addEventListener("input", sync);
    input?.addEventListener("blur", () => {
      if (demo.hasAttribute("data-save-on-blur")) createTag(input.value);
    });

    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        createTag(input.value);
      }

      if (event.key === "Backspace" && input.value === "") {
        getTags().at(-1)?.remove();
        sync();
      }
    });

    sync();

    if (demo.dataset.maxTagCount === "responsive" && "ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(syncMaxTagCount);
      resizeObserver.observe(demo);
    }
  });
};

window.addEventListener("DOMContentLoaded", initInputTagDemo);

const initSelectDemos = (root = document) => {
  const scope = root?.querySelectorAll ? root : document;
  const selects = [...scope.querySelectorAll("[data-select-demo]")]
    .filter((select) => select.dataset.selectInitialized !== "true");
  if (!selects.length) return;

  const getSelectFocusTarget = (select) => select.querySelector(".qizhi-input-tag-input, .qizhi-input, .select-demo-trigger");

  const closeSelect = (select) => {
    select.classList.remove("is-open");
    select.querySelector(".select-demo-popup")?.setAttribute("hidden", "");
    getSelectFocusTarget(select)?.setAttribute("aria-expanded", "false");
  };

  const closeOthers = (activeSelect) => {
    selects.forEach((select) => {
      if (select !== activeSelect) closeSelect(select);
    });
  };

  selects.forEach((select, selectIndex) => {
    select.dataset.selectInitialized = "true";
    const input = select.querySelector("input");
    const popup = select.querySelector(".select-demo-popup");
    let options = [...select.querySelectorAll(".input-demo-select-option")];
    let clearButton = select.querySelector("[data-select-clear]");
    const isMultiple = select.classList.contains("select-demo-multiple") || select.hasAttribute("data-select-multiple");
    const isSearchable = select.hasAttribute("data-select-search");
    const allowCreate = select.hasAttribute("data-select-allow-create");
    const hideSelected = select.hasAttribute("data-select-hide-selected");
    const isCustomTrigger = select.hasAttribute("data-select-custom-trigger");
    const dragToSort = select.hasAttribute("data-select-drag-sort");
    const tokenSeparators = (select.dataset.selectTokenSeparators || "").split("").filter(Boolean);
    const tagInput = select.querySelector(".qizhi-input-tag-input");
    const tagInner = select.querySelector(".qizhi-input-tag-inner");
    const emptyMultiplePlaceholder = tagInput?.placeholder || "请选择";
    const extraPanel = select.querySelector("[data-select-extra-panel]");
    const extraInput = select.querySelector("[data-select-extra-input]");
    const extraButton = select.querySelector("[data-select-add-option]");
    const focusTarget = isCustomTrigger
      ? select.querySelector(".select-demo-trigger")
      : tagInput || input;
    const useUnifiedClear = !isCustomTrigger
      && !select.classList.contains("input-demo--disabled")
      && !select.hasAttribute("data-input-no-clear");
    if (useUnifiedClear) {
      select.setAttribute("data-select-allow-clear", "");
      if (!clearButton) {
        clearButton = document.createElement("button");
        clearButton.className = "qizhi-select-clear input-demo__clear select-demo__clear";
        clearButton.type = "button";
        clearButton.setAttribute("aria-label", "清空");
        clearButton.setAttribute("data-select-clear", "");
        clearButton.hidden = true;

        const icon = document.createElement("i");
        icon.className = "ri-close-line";
        icon.setAttribute("aria-hidden", "true");
        clearButton.append(icon);

        const arrow = select.querySelector(".select-demo__arrow, .input-demo__suffix");
        arrow?.parentElement?.insertBefore(clearButton, arrow);
      }
    }
    if (tagInput && !isSearchable && !allowCreate && tokenSeparators.length === 0) tagInput.readOnly = true;
    const emptyOption = isSearchable && popup
      ? (() => {
        const node = document.createElement("div");
        node.className = "select-demo-empty-option";
        node.textContent = "暂无数据";
        node.hidden = true;
        popup.append(node);
        return node;
      })()
      : null;

    const popupId = popup?.id || `qizhi-select-popup-${selectIndex + 1}`;
    if (popup) popup.id = popupId;
    const labelledBy = select.getAttribute("aria-labelledby");
    const label = select.getAttribute("aria-label") || input?.placeholder || tagInput?.placeholder || "请选择";
    select.removeAttribute("role");
    select.removeAttribute("aria-haspopup");
    select.removeAttribute("aria-expanded");
    select.removeAttribute("aria-controls");
    select.removeAttribute("aria-labelledby");
    select.removeAttribute("aria-label");
    select.removeAttribute("tabindex");
    if (focusTarget) {
      focusTarget.setAttribute("role", "combobox");
      focusTarget.setAttribute("aria-haspopup", "listbox");
      focusTarget.setAttribute("aria-expanded", "false");
      if (popup) focusTarget.setAttribute("aria-controls", popupId);
      if (labelledBy) focusTarget.setAttribute("aria-labelledby", labelledBy);
      else if (!focusTarget.getAttribute("aria-label")) focusTarget.setAttribute("aria-label", label);
    }

    if (clearButton) clearButton.hidden = true;

    const getSelectedOptions = () => options.filter((option) => option.classList.contains("is-selected"));

    const getOptionLabel = (option) => option.querySelector(".select-demo-option-text")?.textContent.trim()
      || option.textContent.trim();

    const setPopupVisible = (open) => {
      popup?.toggleAttribute("hidden", !open);
      select.classList.toggle("is-open", !!open);
      focusTarget?.setAttribute("aria-expanded", String(!!open));
    };

    const syncValueState = () => {
      const hasTagValue = isMultiple
        ? getSelectedOptions().length > 0
        : !!select.querySelector(".qizhi-input-tag-tag:not([hidden]), .select-demo-summary:not([hidden])");
      select.classList.toggle("has-value", !!input?.value || hasTagValue);
      if (clearButton && !select.matches(":hover")) clearButton.hidden = true;
    };

    const syncOptionCheckbox = (option) => {
      const selected = option.classList.contains("is-selected");
      const checkbox = option.querySelector(".select-demo-option-checkbox");
      const checkboxInput = checkbox?.querySelector("input");
      const optionText = option.querySelector(".select-demo-option-text");
      option.classList.toggle("qizhi-select-option-wrapper-selected", selected);
      checkbox?.classList.toggle("qizhi-checkbox-checked", selected);
      optionText?.classList.toggle("qizhi-select-option-selected", selected);
      if (checkboxInput) checkboxInput.checked = selected;
    };

    const updateCustomTrigger = () => {
      if (!isCustomTrigger) return;
      const target = select.querySelector("[data-select-trigger-value]");
      if (!target) return;
      const values = getSelectedOptions().map(getOptionLabel);
      target.textContent = values.join("，") || "无";
    };

    const syncHiddenSelectedOptions = () => {
      if (!hideSelected) return;
      options.forEach((option) => {
        option.hidden = option.classList.contains("is-selected");
      });
    };

    const createSelectTag = (value, closeable = true) => {
      const tag = document.createElement("span");
      tag.className = "qizhi-tag qizhi-tag-checked qizhi-tag-size-default qizhi-input-tag-tag";
      tag.title = value;
      tag.dataset.value = value;
      if (dragToSort && closeable) {
        tag.draggable = true;
        tag.classList.add("select-demo-draggable-tag");
      }

      const content = document.createElement("span");
      content.className = "qizhi-tag-content";
      content.textContent = value;
      tag.append(content);

      if (closeable) {
        const closeButton = document.createElement("button");
        closeButton.className = "qizhi-icon-hover qizhi-tag-icon-hover qizhi-tag-close-btn";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", `删除 ${value}`);

        const icon = document.createElement("i");
        icon.className = "ri-close-line";
        icon.setAttribute("aria-hidden", "true");

        closeButton.append(icon);
        tag.append(closeButton);
      }

      return tag;
    };

    const updateCreateOption = (query) => {
      if (!allowCreate || !query) return;
      const existing = options.find((option) => !option.classList.contains("select-demo-create-option") && (option.dataset.value || getOptionLabel(option)) === query);
      if (existing) return;
      const createOption = options.find((option) => option.classList.contains("select-demo-create-option"));
      if (!createOption) return;
      createOption.dataset.value = query;
      if (createOption.matches("button")) {
        createOption.textContent = query;
      } else {
        const text = createOption.querySelector(".select-demo-option-text");
        if (text) text.textContent = `输入创建：${query}`;
      }
      createOption.hidden = false;
      createOption.classList.remove("is-disabled");
      createOption.removeAttribute("aria-disabled");
    };

    const filterOptions = (query) => {
      const normalizedQuery = query.trim().toLowerCase();
      updateCreateOption(query.trim());
      options.forEach((option) => {
        const selectedAndHidden = hideSelected && option.classList.contains("is-selected");
        if (option.classList.contains("select-demo-create-option")) {
          option.hidden = !normalizedQuery;
          return;
        }
        const value = option.dataset.value || "";
        const label = getOptionLabel(option);
        option.hidden = selectedAndHidden || (!!normalizedQuery
          && !value.toLowerCase().includes(normalizedQuery)
          && !label.toLowerCase().includes(normalizedQuery));
      });
      if (emptyOption) {
        const hasVisibleOption = options.some((option) => !option.hidden);
        emptyOption.hidden = !normalizedQuery || hasVisibleOption;
      }
    };

    const renderMultipleValue = () => {
      if (!isMultiple || !tagInner) return;

      select.querySelectorAll(".qizhi-input-tag-tag, .select-demo-summary").forEach((node) => node.remove());

      const values = getSelectedOptions().map((option) => option.dataset.value || option.textContent.trim());
      if (tagInput && !isSearchable) tagInput.placeholder = values.length ? "" : emptyMultiplePlaceholder;
      if (select.hasAttribute("data-select-summary")) {
        if (values.length > 0) {
          const summary = document.createElement("span");
          summary.className = "select-demo-summary";
          summary.textContent = `已选择 ${values.length} 个城市`;
          tagInner.insertBefore(summary, tagInput || null);
        }
        return;
      }

      const maxTagSetting = select.dataset.selectMaxTags;
      let visibleCount = values.length;
      if (maxTagSetting === "responsive") {
        const availableWidth = (tagInner.clientWidth || select.clientWidth || 0) - 56;
        const estimatedCount = availableWidth > 0 ? Math.max(1, Math.floor(availableWidth / 88)) : values.length;
        visibleCount = Math.min(estimatedCount, values.length);
      } else {
        const maxTags = Number(maxTagSetting);
        visibleCount = Number.isFinite(maxTags) && maxTags > 0 ? Math.min(maxTags, values.length) : values.length;
      }
      values.slice(0, visibleCount).forEach((value) => {
        tagInner.insertBefore(createSelectTag(value), tagInput || null);
      });

      const hiddenCount = values.length - visibleCount;
      if (hiddenCount > 0) {
        const template = select.dataset.selectMoreTemplate || "+{count} 个更多";
        tagInner.insertBefore(createSelectTag(template.replace("{count}", hiddenCount), false), tagInput || null);
      }
    };

    const commitTokenInput = () => {
      if (!isMultiple || !tagInput || tokenSeparators.length === 0) return false;
      const value = tagInput.value;
      if (!value) return false;
      const escapedSeparators = tokenSeparators.map((separator) => separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("");
      const separatorPattern = new RegExp(`[${escapedSeparators}]`);
      if (!separatorPattern.test(value)) return false;

      value.split(separatorPattern).map((item) => item.trim()).filter(Boolean).forEach((item) => {
        const option = options.find((candidate) => (candidate.dataset.value || getOptionLabel(candidate)) === item);
        if (!option || option.classList.contains("is-disabled") || option.getAttribute("aria-disabled") === "true") return;
        option.classList.add("is-selected");
        option.setAttribute("aria-selected", "true");
        syncOptionCheckbox(option);
      });
      tagInput.value = "";
      renderMultipleValue();
      syncHiddenSelectedOptions();
      syncValueState();
      return true;
    };

    const bindOption = (option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        if (option.hidden) return;
        if (option.classList.contains("is-disabled") || option.getAttribute("aria-disabled") === "true") return;
        if (isMultiple) {
          const selected = !option.classList.contains("is-selected");
          option.classList.toggle("is-selected", selected);
          option.setAttribute("aria-selected", String(selected));
          syncOptionCheckbox(option);
          if (selected && option.classList.contains("select-demo-create-option") && tagInput) {
            tagInput.value = "";
            option.hidden = true;
          }
          if (selected && isSearchable && tagInput) {
            tagInput.value = "";
            filterOptions("");
          }
          renderMultipleValue();
          syncHiddenSelectedOptions();
          updateCustomTrigger();
          syncValueState();
          return;
        }
        const nextValue = option.dataset.value || getOptionLabel(option);
        if (input) input.value = nextValue;
        options.forEach((candidate) => {
          const selected = candidate === option;
          candidate.classList.toggle("is-selected", selected);
          candidate.setAttribute("aria-selected", String(selected));
        });
        updateCustomTrigger();
        syncValueState();
        select.dispatchEvent(new CustomEvent("select-demo-change", { detail: { value: nextValue, option } }));
        closeSelect(select);
      });
    };

    select.addEventListener("click", (event) => {
      const tagCloseButton = event.target.closest(".qizhi-tag-close-btn");
      if (!isMultiple || !tagCloseButton || !select.contains(tagCloseButton)) return;

      event.preventDefault();
      event.stopPropagation();
      const tag = tagCloseButton.closest(".qizhi-input-tag-tag");
      const value = tag?.dataset.value || tag?.querySelector(".qizhi-tag-content")?.textContent.trim();
      const option = options.find((candidate) => candidate.dataset.value === value);
      option?.classList.remove("is-selected");
      option?.setAttribute("aria-selected", "false");
      if (option) syncOptionCheckbox(option);
      renderMultipleValue();
      syncHiddenSelectedOptions();
      syncValueState();
    }, true);

    select.addEventListener("click", (event) => {
      if (event.target.closest("[data-select-clear]") || event.target.closest(".select-demo-popup")) return;
      const tagCloseButton = event.target.closest(".qizhi-tag-close-btn");
      if (isMultiple && tagCloseButton && select.contains(tagCloseButton)) {
        const tag = tagCloseButton.closest(".qizhi-input-tag-tag");
        const value = tag?.dataset.value || tag?.querySelector(".qizhi-tag-content")?.textContent.trim();
        const option = options.find((candidate) => candidate.dataset.value === value);
        option?.classList.remove("is-selected");
        option?.setAttribute("aria-selected", "false");
        if (option) syncOptionCheckbox(option);
        renderMultipleValue();
        syncHiddenSelectedOptions();
        syncValueState();
        return;
      }
      const willOpen = popup?.hasAttribute("hidden");
      closeOthers(select);
      setPopupVisible(!!willOpen);
    });

    select.addEventListener("keydown", (event) => {
      if (event.target.closest(".select-demo-popup")) return;
      if (event.key === "Escape") {
        closeSelect(select);
        return;
      }
      if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowDown") return;

      event.preventDefault();
      closeOthers(select);
      setPopupVisible(true);
      if (event.key === "ArrowDown") {
        options.find((option) => !option.hidden && !option.classList.contains("is-disabled"))?.focus();
      }
    });

    input?.addEventListener("input", () => {
      if (commitTokenInput()) return;
      if (!isSearchable && !allowCreate) return;
      closeOthers(select);
      setPopupVisible(true);
      filterOptions(input.value);
      syncValueState();
    });

    tagInput?.addEventListener("paste", () => {
      window.setTimeout(commitTokenInput, 0);
    });

    if (dragToSort && tagInner) {
      let draggingTag = null;

      tagInner.addEventListener("dragstart", (event) => {
        const tag = event.target.closest(".select-demo-draggable-tag");
        if (!tag || !tagInner.contains(tag)) return;
        draggingTag = tag;
        tag.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", tag.dataset.value || tag.textContent.trim());
      });

      tagInner.addEventListener("dragover", (event) => {
        if (!draggingTag) return;
        const target = event.target.closest(".select-demo-draggable-tag");
        if (!target || target === draggingTag || !tagInner.contains(target)) return;
        event.preventDefault();
        const rect = target.getBoundingClientRect();
        const insertAfter = event.clientX > rect.left + rect.width / 2;
        tagInner.insertBefore(draggingTag, insertAfter ? target.nextSibling : target);
      });

      tagInner.addEventListener("drop", (event) => {
        if (draggingTag) event.preventDefault();
      });

      tagInner.addEventListener("dragend", () => {
        const orderedValues = [...tagInner.querySelectorAll(".select-demo-draggable-tag")]
          .map((tag) => tag.dataset.value)
          .filter(Boolean);
        if (orderedValues.length) {
          const selectedByValue = new Map(getSelectedOptions().map((option) => [option.dataset.value || getOptionLabel(option), option]));
          const orderedSelected = orderedValues.map((value) => selectedByValue.get(value)).filter(Boolean);
          const orderedSet = new Set(orderedSelected);
          const remainingSelected = getSelectedOptions().filter((option) => !orderedSet.has(option));
          const unselected = options.filter((option) => !option.classList.contains("is-selected"));
          options = [...orderedSelected, ...remainingSelected, ...unselected];
        }
        draggingTag?.classList.remove("is-dragging");
        draggingTag = null;
      });
    }

    select.addEventListener("mouseenter", () => {
      if (clearButton && select.classList.contains("has-value")) clearButton.hidden = false;
    });

    select.addEventListener("mouseleave", () => {
      if (clearButton) clearButton.hidden = true;
    });

    select.addEventListener("focusin", () => {
      if (clearButton && select.classList.contains("has-value")) clearButton.hidden = false;
    });

    select.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (clearButton && !select.contains(document.activeElement) && !select.matches(":hover")) clearButton.hidden = true;
      }, 0);
    });

    options.forEach(bindOption);

    extraButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const value = extraInput?.value.trim();
      if (!value || options.some((option) => (option.dataset.value || getOptionLabel(option)) === value)) return;

      const option = document.createElement("button");
      option.className = "input-demo-select-option";
      option.type = "button";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.dataset.value = value;
      option.textContent = value;
      popup?.insertBefore(option, extraPanel || null);
      options = [...options, option];
      bindOption(option);
      extraInput.value = "";
    });

    clearButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (input) input.value = "";
      options.forEach((option) => {
        option.hidden = false;
        option.classList.remove("is-selected");
        option.setAttribute("aria-selected", "false");
        syncOptionCheckbox(option);
      });
      renderMultipleValue();
      updateCustomTrigger();
      syncValueState();
      if (emptyOption) emptyOption.hidden = true;
      closeSelect(select);
      if (select.contains(document.activeElement)) document.activeElement.blur();
      select.blur();
    });

    clearButton?.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    if (isMultiple) {
      options.forEach(syncOptionCheckbox);
      renderMultipleValue();
      syncHiddenSelectedOptions();
    }
    if (select.dataset.selectMaxTags === "responsive") {
      window.addEventListener("resize", renderMultipleValue);
    }
    updateCustomTrigger();
    syncValueState();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-select-demo]")) selects.forEach(closeSelect);
  });
};

window.addEventListener("DOMContentLoaded", initSelectDemos);

const initSelectCascadeDemos = () => {
  document.querySelectorAll("[data-select-cascade]").forEach((demo) => {
    const provinceSelect = demo.querySelector("[data-select-cascade-province]");
    const citySelect = demo.querySelector("[data-select-cascade-city]");
    const cityInput = citySelect?.querySelector("input");
    const cityOptions = [...(citySelect?.querySelectorAll(".input-demo-select-option") || [])];
    if (!provinceSelect || !citySelect || !cityInput || !cityOptions.length) return;

    const syncCities = (province) => {
      const visibleOptions = cityOptions.filter((option) => option.dataset.province === province);
      cityOptions.forEach((option) => {
        const visible = option.dataset.province === province;
        option.hidden = !visible;
        option.classList.remove("is-selected");
        option.setAttribute("aria-selected", "false");
      });
      const firstOption = visibleOptions[0];
      if (!firstOption) {
        cityInput.value = "";
        return;
      }
      firstOption.classList.add("is-selected");
      firstOption.setAttribute("aria-selected", "true");
      cityInput.value = firstOption.dataset.value || firstOption.textContent.trim();
    };

    provinceSelect.addEventListener("select-demo-change", (event) => {
      syncCities(event.detail.value);
    });
    syncCities(provinceSelect.querySelector("input")?.value || "");
  });
};

window.addEventListener("DOMContentLoaded", initSelectCascadeDemos);

const initInputAddonSelectDemo = () => {
  const selects = [...document.querySelectorAll("[data-input-addon-select]")];
  if (!selects.length) return;

  const closeSelect = (select) => {
    select.querySelector(".input-demo-select-popup")?.setAttribute("hidden", "");
    select.querySelector(".input-demo-select-view")?.setAttribute("aria-expanded", "false");
  };

  const closeOthers = (activeSelect) => {
    selects.forEach((select) => {
      if (select !== activeSelect) closeSelect(select);
    });
  };

  selects.forEach((select) => {
    const trigger = select.querySelector(".input-demo-select-view");
    const popup = select.querySelector(".input-demo-select-popup");
    const value = select.querySelector("[data-input-addon-select-value]");
    const options = [...select.querySelectorAll(".input-demo-select-option")];

    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = popup?.hasAttribute("hidden");
      closeOthers(select);
      popup?.toggleAttribute("hidden", !willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });

    options.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        const nextValue = option.dataset.value || option.textContent.trim();
        if (value) value.textContent = nextValue;
        options.forEach((candidate) => {
          const selected = candidate === option;
          candidate.classList.toggle("is-selected", selected);
          candidate.setAttribute("aria-selected", String(selected));
        });
        closeSelect(select);
        trigger?.focus();
      });
    });
  });

  document.addEventListener("click", () => {
    selects.forEach(closeSelect);
  });
};

window.addEventListener("DOMContentLoaded", initInputAddonSelectDemo);

const initInputLoadingDemo = () => {
  document.querySelectorAll("[data-input-loading-demo]").forEach((demo) => {
    demo.querySelectorAll(".input-demo-addon--button").forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.add("is-loading");
        window.setTimeout(() => button.classList.remove("is-loading"), 900);
      });
    });
  });
};

window.addEventListener("DOMContentLoaded", initInputLoadingDemo);

const initInputWordLimitDemo = () => {
  document.querySelectorAll("[data-word-limit]").forEach((wrapper) => {
    const maxLength = Number(wrapper.dataset.wordLimit) || 0;
    const counter = wrapper.querySelector("[data-word-limit-count]");
    const field = wrapper.querySelector("input, textarea");
    const errorOnly = wrapper.hasAttribute("data-word-limit-error-only");

    if (!field || !counter || !maxLength) return;

    const sync = () => {
      if (!errorOnly && field.value.length > maxLength) {
        field.value = field.value.slice(0, maxLength);
      }

      const count = field.value.length;
      const isError = errorOnly && count > maxLength;
      counter.textContent = `${count}/${maxLength}`;
      counter.classList.toggle("input-demo-word-limit--error", isError);
      wrapper.classList.toggle("is-error", isError);
      wrapper.classList.toggle("input-demo--error", isError);

      if (isError) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    };

    field.addEventListener("input", sync);
    sync();
  });
};

window.addEventListener("DOMContentLoaded", initInputWordLimitDemo);

const initInputAutoSizeTextareas = () => {
  document.querySelectorAll("[data-auto-size-textarea]").forEach((textarea) => {
    const minRows = Number(textarea.dataset.minRows) || 0;
    const maxRows = Number(textarea.dataset.maxRows) || 0;

    const sync = () => {
      const style = window.getComputedStyle(textarea);
      const lineHeight = Number.parseFloat(style.lineHeight) || 22;
      const paddingY = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
      const borderY = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
      const minHeight = minRows ? Math.ceil(minRows * lineHeight + paddingY + borderY) : 32;
      const maxHeight = maxRows ? Math.ceil(maxRows * lineHeight + paddingY + borderY) : Number.POSITIVE_INFINITY;

      textarea.style.height = "auto";
      const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${nextHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    };

    textarea.addEventListener("input", sync);
    sync();
  });
};

window.addEventListener("DOMContentLoaded", initInputAutoSizeTextareas);

const initInputPasswordDemo = () => {
  document.querySelectorAll("[data-password-input]").forEach((wrapper) => {
    const input = wrapper.querySelector("input");
    const button = wrapper.querySelector("[data-password-toggle]");
    const icon = button?.querySelector("i");

    if (!input || !button || !icon) return;

    const sync = (visible) => {
      input.type = visible ? "text" : "password";
      icon.className = visible ? "ri-eye-line" : "ri-eye-off-line";
      button.setAttribute("aria-label", visible ? "隐藏密码" : "显示密码");
      wrapper.toggleAttribute("data-password-visible", visible);
    };

    sync(wrapper.hasAttribute("data-password-visible"));
    button.addEventListener("click", () => {
      sync(input.type === "password");
      input.focus();
    });
  });
};

window.addEventListener("DOMContentLoaded", initInputPasswordDemo);

const initInputNormalizeDemo = () => {
  document.querySelectorAll("[data-normalize-input]").forEach((wrapper) => {
    const input = wrapper.querySelector("input");
    const trigger = wrapper.dataset.normalizeInput;
    if (!input) return;

    const normalize = () => {
      input.value = input.value.trim();
    };

    if (trigger === "blur") {
      input.addEventListener("blur", normalize);
    }

    if (trigger === "enter") {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") normalize();
      });
    }
  });
};

window.addEventListener("DOMContentLoaded", initInputNormalizeDemo);

const initInputAutoWidthDemo = () => {
  document.querySelectorAll("[data-auto-width-input]").forEach((wrapper) => {
    const input = wrapper.querySelector("input");
    const mirror = wrapper.querySelector(".input-demo-mirror");
    if (!input || !mirror) return;

    const minWidth = Number.isFinite(Number(wrapper.dataset.minWidth)) ? Number(wrapper.dataset.minWidth) : 0;
    const maxWidth = Number.isFinite(Number(wrapper.dataset.maxWidth)) ? Number(wrapper.dataset.maxWidth) : 500;

    const sync = () => {
      const style = window.getComputedStyle(input);
      mirror.style.font = style.font;
      mirror.style.letterSpacing = style.letterSpacing;
      mirror.style.paddingLeft = style.paddingLeft;
      mirror.style.paddingRight = style.paddingRight;
      mirror.textContent = input.value || input.placeholder || "";

      const prefixWidth = [...wrapper.querySelectorAll(".input-demo__text-prefix")].reduce((sum, prefix) => sum + prefix.offsetWidth + 8, 0);
      const measuredWidth = Math.ceil(mirror.scrollWidth + prefixWidth + 2);
      wrapper.style.width = `${Math.min(Math.max(measuredWidth, minWidth), maxWidth)}px`;
    };

    input.addEventListener("input", sync);
    sync();
  });
};

window.addEventListener("DOMContentLoaded", initInputAutoWidthDemo);

const initFrameworkPreview = () => {
  const previews = document.querySelectorAll("[data-frame-preview]");
  if (!previews.length) return;

  previews.forEach((preview) => {
    const topTabs = [...preview.querySelectorAll("[data-frame-tab]")];
    const sidebar = preview.querySelector("[data-framework-sidebar]");
    const sharedSpaceMenu = [
      { type: "space", label: "AI4S_DEV_public_workspace" },
      { label: "空间概览", icon: "ri-home-5-line" },
      { type: "title", label: "模型开发与训练" },
      { label: "交互式建模", icon: "ri-node-tree", active: true },
      { label: "分布式训练", icon: "ri-flow-chart" },
      { label: "高性能计算", icon: "ri-cpu-line" },
      { label: "可视化建模", icon: "ri-box-3-line", disabled: true },
      { type: "title", label: "模型评测" },
      { label: "评测任务", icon: "ri-checkbox-line", disabled: true },
      { label: "评测报告", icon: "ri-file-chart-line", disabled: true },
      { type: "title", label: "AI资产管理" },
      { label: "数据集", icon: "ri-table-line", disabled: true },
      { label: "文件", icon: "ri-folder-3-line" },
      { label: "镜像管理", icon: "ri-box-3-line" },
      { label: "模型仓库", icon: "ri-archive-line" },
      { label: "评测task", icon: "ri-checkbox-line", disabled: true },
      { type: "title", label: "空间管理" },
    ];
    const serviceMenu = [
      { type: "space", label: "测试空间-1" },
      { label: "空间概览", icon: "ri-home-5-line", active: true },
      { type: "title", label: "推理部署" },
      { label: "模型部署", icon: "ri-database-2-line" },
      { label: "在线推理", icon: "ri-pulse-line", nested: true },
      { type: "title", label: "AI资产管理" },
      { label: "文件", icon: "ri-folder-line" },
      { label: "镜像管理", icon: "ri-box-3-line" },
      { label: "模型仓库", icon: "ri-archive-line" },
      { type: "title", label: "空间管理" },
      { label: "计算配额管理", icon: "ri-table-line" },
      { label: "计算类型组", icon: "ri-cpu-line" },
      { label: "调度配置", icon: "ri-equalizer-2-line" },
    ];
    const agentMenu = [
      { type: "space", label: "测试空间-1" },
      { type: "title", label: "Agent 资产库" },
      { label: "Skills 工坊", icon: "ri-brain-line", active: true },
      { label: "MCP 托管", icon: "ri-pushpin-line" },
      { label: "Agent", icon: "ri-robot-2-line" },
      { type: "title", label: "构建" },
      { label: "Agent 运行实例", icon: "ri-terminal-box-line" },
      { label: "Agent 自定义部署", icon: "ri-node-tree" },
      { type: "title", label: "运行&治理" },
      { label: "Sandbox", icon: "ri-inbox-archive-line" },
      { type: "title", label: "AI资产管理" },
      { label: "文件", icon: "ri-folder-line" },
      { label: "镜像管理", icon: "ri-box-3-line" },
      { type: "title", label: "空间管理" },
      { label: "计算配额管理", icon: "ri-table-line" },
      { label: "计算类型组", icon: "ri-cpu-line" },
      { label: "调度配置", icon: "ri-equalizer-2-line" },
    ];
    const menus = {
      workspace: [],
      "custom-model": sharedSpaceMenu,
      service: serviceMenu,
      agent: agentMenu,
      explore: [{ label: "模型广场", icon: "ri-box-3-fill", active: true }],
      operations: [
        { type: "title", label: "资源管理" },
        { label: "资源概览", icon: "ri-dashboard-line", active: true },
        { label: "空间管理", icon: "ri-home-5-line" },
        { label: "资源组管理", icon: "ri-table-line" },
        { label: "节点管理", icon: "ri-focus-3-line" },
        { type: "title", label: "管理中心" },
        { label: "成员管理", icon: "ri-group-line" },
        { label: "操作审计", icon: "ri-list-check-3" },
        { label: "计费管理", icon: "ri-node-tree" },
        { label: "项目账单", icon: "ri-file-list-3-line", nested: true },
        { label: "资源价格配置", icon: "ri-price-tag-3-line", nested: true },
        { label: "审批中心", icon: "ri-checkbox-multiple-line" },
        { label: "项目列表", icon: "ri-apps-2-line" },
      ],
    };

    const renderSidebar = (mode) => {
      if (!sidebar) return;
      sidebar.replaceChildren();
      const entries = menus[mode] || [];
      const list = document.createElement("div");
      list.className = "qizhi-embedded-menu__list";
      list.setAttribute("role", "menu");
      let group = list;
      let groupIndex = 0;

      entries.forEach((entry) => {
        if (entry.type === "space") {
          const dropdown = document.createElement("div");
          dropdown.className = "qizhi-dropdown qizhi-dropdown--bl qizhi-embedded-menu__space-switcher";
          const button = document.createElement("button");
          button.className = "qizhi-dropdown__trigger qizhi-embedded-menu__workspace";
          button.type = "button";
          button.setAttribute("aria-label", `切换空间，当前${entry.label}`);
          button.setAttribute("aria-haspopup", "menu");
          button.setAttribute("aria-expanded", "false");
          button.dataset.tooltip = entry.label;
          const popupId = `framework-${mode}-space-list`;
          button.setAttribute("aria-controls", popupId);
          const back = document.createElement("i");
          back.className = "ri-arrow-left-s-line";
          back.setAttribute("aria-hidden", "true");
          const divider = document.createElement("span");
          divider.className = "qizhi-embedded-menu__workspace-divider";
          divider.setAttribute("aria-hidden", "true");
          const label = document.createElement("strong");
          label.textContent = entry.label;
          const more = document.createElement("i");
          more.className = "ri-expand-up-down-line";
          more.setAttribute("aria-hidden", "true");
          button.append(back, divider, label, more);
          const popup = document.createElement("div");
          popup.className = "qizhi-dropdown__popup qizhi-embedded-menu__space-popup";
          popup.id = popupId;
          popup.setAttribute("role", "menu");
          popup.hidden = true;
          const spaceOptions = [
            entry.label,
            "上海人工智能实验室-模型研发空间",
            "启智公共云长名称测试空间",
          ].filter((spaceName, index, options) => options.indexOf(spaceName) === index);
          spaceOptions.forEach((spaceName, index) => {
            const option = document.createElement("button");
            option.className = `qizhi-dropdown__item${index === 0 ? " is-selected" : ""}`;
            option.type = "button";
            option.setAttribute("role", "menuitemradio");
            option.setAttribute("aria-checked", String(index === 0));
            option.textContent = spaceName;
            option.addEventListener("click", (event) => {
              event.stopPropagation();
              [...popup.querySelectorAll("[role='menuitemradio']")].forEach((candidate) => {
                const isSelected = candidate === option;
                candidate.classList.toggle("is-selected", isSelected);
                candidate.setAttribute("aria-checked", String(isSelected));
              });
              label.textContent = spaceName;
              button.dataset.tooltip = spaceName;
              button.setAttribute("aria-label", `切换空间，当前${spaceName}`);
              button.setAttribute("aria-expanded", "false");
              dropdown.classList.remove("is-open");
              popup.hidden = true;
              button.focus();
            });
            popup.append(option);
          });
          button.addEventListener("click", (event) => {
            event.stopPropagation();
            const willOpen = popup.hidden;
            preview.querySelectorAll("[data-framework-space-popup]").forEach((candidate) => {
              candidate.hidden = true;
              candidate.parentElement?.classList.remove("is-open");
              candidate.previousElementSibling?.setAttribute("aria-expanded", "false");
            });
            popup.hidden = !willOpen;
            dropdown.classList.toggle("is-open", willOpen);
            button.setAttribute("aria-expanded", String(willOpen));
          });
          button.addEventListener("mouseenter", () => {
            const triggerRect = button.getBoundingClientRect();
            button.style.setProperty("--qizhi-space-tooltip-top", `${triggerRect.bottom + 8}px`);
            button.style.setProperty(
              "--qizhi-space-tooltip-left",
              `${triggerRect.left + triggerRect.width / 2}px`,
            );
          });
          button.addEventListener("focus", () => {
            const triggerRect = button.getBoundingClientRect();
            button.style.setProperty("--qizhi-space-tooltip-top", `${triggerRect.bottom + 8}px`);
            button.style.setProperty(
              "--qizhi-space-tooltip-left",
              `${triggerRect.left + triggerRect.width / 2}px`,
            );
          });
          button.addEventListener("keydown", (event) => {
            if (event.key !== "Escape" || popup.hidden) return;
            event.preventDefault();
            popup.hidden = true;
            dropdown.classList.remove("is-open");
            button.setAttribute("aria-expanded", "false");
          });
          popup.dataset.frameworkSpacePopup = "";
          dropdown.append(button, popup);
          const separator = document.createElement("span");
          separator.className = "qizhi-divider qizhi-divider-horizontal qizhi-embedded-menu__divider";
          separator.setAttribute("aria-hidden", "true");
          sidebar.append(dropdown, separator);
          return;
        }
        if (entry.type === "title") {
          groupIndex += 1;
          group = document.createElement("section");
          group.className = "qizhi-embedded-menu__group";
          const titleId = `framework-${mode}-group-${groupIndex}`;
          group.setAttribute("aria-labelledby", titleId);
          const title = document.createElement("h3");
          title.className = "qizhi-embedded-menu__group-title";
          title.id = titleId;
          title.textContent = entry.label;
          if (list.childElementCount > 0) {
            const separator = document.createElement("span");
            separator.className = "qizhi-divider qizhi-divider-horizontal qizhi-embedded-menu__divider";
            separator.setAttribute("aria-hidden", "true");
            group.append(separator);
          }
          group.append(title);
          list.append(group);
          return;
        }
        const button = document.createElement("button");
        button.className = `qizhi-embedded-menu__item${entry.active ? " is-selected" : ""}${entry.nested ? " framework-side-item--nested" : ""}`;
        button.type = "button";
        button.setAttribute("role", "menuitem");
        button.tabIndex = entry.active ? 0 : -1;
        if (entry.active) button.setAttribute("aria-current", "page");
        button.dataset.sideNav = "";
        button.disabled = Boolean(entry.disabled);
        const label = document.createElement("span");
        label.textContent = entry.label;
        if (!entry.nested) {
          const icon = document.createElement("i");
          icon.className = entry.icon;
          icon.setAttribute("aria-hidden", "true");
          button.append(icon);
        }
        button.append(label);
        group.append(button);
      });
      if (entries.some((entry) => entry.type !== "space")) sidebar.append(list);

      [...sidebar.querySelectorAll("[data-side-nav]")].forEach((item) => {
        item.addEventListener("click", () => {
          [...sidebar.querySelectorAll("[data-side-nav]")].forEach((candidate) => {
            const isSelected = candidate === item;
            candidate.classList.toggle("is-selected", isSelected);
            candidate.tabIndex = isSelected ? 0 : -1;
            if (isSelected) {
              candidate.setAttribute("aria-current", "page");
            } else {
              candidate.removeAttribute("aria-current");
            }
          });
        });
      });
    };

    const setMode = (mode) => {
      preview.dataset.mode = mode;
      preview.classList.toggle("has-sidebar", mode !== "workspace");
      preview.style.setProperty("--framework-sidebar-width", "210px");
      renderSidebar(mode);

      topTabs.forEach((tab) => {
        const isActive = tab.dataset.frameTab === mode;
        tab.classList.toggle("is-active", isActive);
        if (tab.hasAttribute("data-top-navigation-item")) {
          tab.tabIndex = isActive ? 0 : -1;
          if (isActive) {
            tab.setAttribute("aria-current", "page");
          } else {
            tab.removeAttribute("aria-current");
          }
        }
      });
    };

    topTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setMode(tab.dataset.frameTab || "workspace");
      });
    });

    document.addEventListener("click", () => {
      preview.querySelectorAll("[data-framework-space-popup]").forEach((popup) => {
        popup.hidden = true;
        popup.parentElement?.classList.remove("is-open");
        popup.previousElementSibling?.setAttribute("aria-expanded", "false");
      });
    });

    setMode(preview.dataset.mode || "workspace");
  });
};

window.addEventListener("DOMContentLoaded", initFrameworkPreview);

const initUploadDemos = () => {
  if (document.querySelector('#component-upload[data-react-island="upload"]')) return;
  const normalizeAccept = (accept) => {
    if (!accept) return [];
    return String(accept)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  };

  const isAcceptFile = (file, accept) => {
    if (!file) return false;
    const accepts = normalizeAccept(accept);
    if (!accepts.length) return true;

    const fileType = (file.type || "").toLowerCase();
    const fileName = (file.name || "").toLowerCase();
    const fileExtension = fileName.includes(".") ? `.${fileName.split(".").pop()}` : "";
    const imageExtensions = new Set([".apng", ".avif", ".gif", ".jpg", ".jpeg", ".png", ".svg", ".webp"]);

    return accepts.some((type) => {
      if (type === fileType) return true;
      if (type.startsWith(".") && type === fileExtension) return true;
      if (type.endsWith("/*")) {
        const category = type.replace("/*", "");
        return fileType.startsWith(`${category}/`) || (category === "image" && imageExtensions.has(fileExtension));
      }
      return false;
    });
  };

  const createUploadIcon = (className) => {
    const icon = document.createElement("i");
    icon.className = className;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  };

  const getUploadFileName = (file) => file?.webkitRelativePath || file?.name || "未命名文件";

  const showUploadToast = (message, type = "success") => {
    document.querySelectorAll(".upload-demo-toast").forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = `upload-demo-toast upload-demo-toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    const icon = createUploadIcon(
      type === "error" ? "ri-close-circle-fill" : type === "warning" ? "ri-information-fill" : "ri-checkbox-circle-fill"
    );
    const text = document.createElement("span");
    text.textContent = message;

    toast.append(icon, text);
    document.body.append(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 220);
    }, 2200);
  };

  const createFileItem = (fileName, status = "uploading") => {
    const item = document.createElement("div");
    item.className = `upload-file-item is-${status}`;
    item.dataset.uploadFileItem = "";

    const iconClass = status === "error" ? "ri-error-warning-line upload-file-item__icon" : "ri-attachment-2 upload-file-item__icon";
    const icon = createUploadIcon(iconClass);

    const main = document.createElement("div");
    main.className = "upload-file-item__main";

    const name = document.createElement("span");
    name.className = "upload-file-item__name";
    name.textContent = fileName;

    main.append(name);

    if (status === "uploading") {
      const progress = document.createElement("div");
      progress.className = "upload-file-item__progress";

      const track = document.createElement("div");
      track.className = "upload-file-item__progress-track";

      const bar = document.createElement("span");
      bar.className = "upload-file-item__progress-bar";
      bar.style.setProperty("--upload-progress", "12%");

      track.append(bar);
      progress.append(track);
      main.append(progress);
    }

    if (status === "error") {
      const retry = document.createElement("button");
      retry.className = "upload-file-item__retry";
      retry.type = "button";
      retry.dataset.uploadRetry = "";
      retry.textContent = "重新上传";
      item.append(icon, main, retry);
    } else {
      item.append(icon, main);
    }

    const remove = document.createElement("button");
    remove.className = "upload-file-item__remove";
    remove.type = "button";
    remove.dataset.uploadRemove = "";
    remove.setAttribute("aria-label", `删除 ${fileName}`);
    remove.append(createUploadIcon("ri-delete-bin-6-line"));

    item.append(remove);
    return item;
  };

  const createPictureItem = (fileName, imageUrl) => {
    const item = document.createElement("div");
    item.className = "upload-picture-item is-uploading";
    item.dataset.uploadFileItem = "";

    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = fileName;
      item.append(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "upload-picture-item__placeholder";
      placeholder.append(createUploadIcon("ri-image-line"));
      item.append(placeholder);
    }

    const progress = document.createElement("div");
    progress.className = "upload-picture-item__progress";

    const bar = document.createElement("span");
    bar.className = "upload-picture-item__progress-bar";
    bar.style.setProperty("--upload-progress", "12%");
    progress.append(bar);

    const mask = document.createElement("div");
    mask.className = "upload-picture-item__mask";

    const remove = document.createElement("button");
    remove.className = "upload-picture-item__remove";
    remove.type = "button";
    remove.dataset.uploadRemove = "";
    remove.setAttribute("aria-label", `删除 ${fileName}`);
    remove.append(createUploadIcon("ri-delete-bin-6-line"));

    mask.append(remove);
    item.append(progress, mask);
    return item;
  };

  const completeUploadItem = (item, fileName) => {
    item.classList.remove("is-uploading");
    item.classList.add("is-success");

    const bar = item.querySelector(".upload-file-item__progress-bar");
    bar?.style.setProperty("--upload-progress", "100%");
    showUploadToast(`${fileName}文件上传成功。`, "success");

    window.setTimeout(() => {
      if (!item.isConnected) return;
      item.classList.remove("is-success");
      item.classList.add("is-complete");
    }, 900);
  };

  const simulateUpload = (list, file, options = {}) => {
    const fileName = options.fileName || getUploadFileName(file);
    const item = createFileItem(fileName, "uploading");
    list.prepend(item);

    let progress = 12;
    const timer = window.setInterval(() => {
      if (!item.isConnected) {
        window.clearInterval(timer);
        return;
      }

      progress = Math.min(progress + 22, 100);
      item.querySelector(".upload-file-item__progress-bar")?.style.setProperty("--upload-progress", `${progress}%`);

      if (progress >= 100) {
        window.clearInterval(timer);
        completeUploadItem(item, fileName);
      }
    }, 260);
  };

  const simulatePictureUpload = (list, file, imageUrl) => {
    const fileName = getUploadFileName(file);
    const item = createPictureItem(fileName, imageUrl);
    list.append(item);

    let progress = 12;
    const timer = window.setInterval(() => {
      if (!item.isConnected) {
        window.clearInterval(timer);
        return;
      }

      progress = Math.min(progress + 22, 100);
      item.querySelector(".upload-picture-item__progress-bar")?.style.setProperty("--upload-progress", `${progress}%`);

      if (progress >= 100) {
        window.clearInterval(timer);
        item.classList.remove("is-uploading");
        item.classList.add("is-success");
        item.querySelector(".upload-picture-item__progress-bar")?.style.setProperty("--upload-progress", "100%");
        showUploadToast(`${fileName}文件上传成功。`, "success");

        window.setTimeout(() => {
          if (!item.isConnected) return;
          item.classList.remove("is-success");
          item.classList.add("is-complete");
        }, 900);
      }
    }, 260);
  };

  const syncUploadLimit = (demo) => {
    const limit = Number(demo?.dataset.limit || 0);
    if (!demo || !Number.isFinite(limit) || limit <= 0) return;
    const count = demo.querySelectorAll("[data-upload-file-item]").length;
    demo.classList.toggle("is-upload-limit-reached", count >= limit);
  };

  const requestUploadDialog = ({ title, content, confirmText = "确定", cancelText = "取消", wide = false, body = null }) => {
    return new Promise((resolve) => {
      const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const mask = document.createElement("div");
      mask.className = "upload-confirm-mask";
      mask.setAttribute("role", "presentation");

      const dialog = document.createElement("div");
      dialog.className = wide ? "upload-confirm-dialog upload-confirm-dialog--wide" : "upload-confirm-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "upload-confirm-title");

      const titleNode = document.createElement("h3");
      titleNode.className = "upload-confirm-title";
      titleNode.id = "upload-confirm-title";
      titleNode.textContent = title;

      const contentNode = document.createElement("p");
      contentNode.className = "upload-confirm-content";
      contentNode.textContent = content;

      const actions = document.createElement("div");
      actions.className = "upload-confirm-actions";

      const cancel = document.createElement("button");
      cancel.className = "upload-confirm-button";
      cancel.type = "button";
      cancel.textContent = cancelText;

      const confirm = document.createElement("button");
      confirm.className = "upload-confirm-button upload-confirm-button--primary";
      confirm.type = "button";
      confirm.textContent = confirmText;

      actions.append(cancel, confirm);
      dialog.append(titleNode);
      if (content) dialog.append(contentNode);
      if (body) dialog.append(body);
      dialog.append(actions);
      mask.append(dialog);

      const close = (confirmed) => {
        document.removeEventListener("keydown", handleKeydown);
        mask.classList.remove("is-visible");
        window.setTimeout(() => {
          mask.remove();
          previousActive?.focus();
          resolve(confirmed);
        }, 180);
      };

      const handleKeydown = (event) => {
        if (event.key === "Escape") close(false);
      };

      dialog.addEventListener("click", (event) => event.stopPropagation());
      mask.addEventListener("click", () => close(false));
      cancel.addEventListener("click", () => close(false));
      confirm.addEventListener("click", () => close(true));
      document.addEventListener("keydown", handleKeydown);

      document.body.append(mask);
      requestAnimationFrame(() => {
        mask.classList.add("is-visible");
        confirm.focus();
        initSliderDemos();
      });
    });
  };

  const requestUploadConfirm = (fileName) =>
    requestUploadDialog({
      title: "beforeUpload",
      content: `确认上传 ${fileName}`,
    });

  const requestRemoveConfirm = (fileName) =>
    requestUploadDialog({
      title: "onRemove",
      content: `确认删除 ${fileName}`,
    });

  const requestCropUpload = (file) => {
    if (!file?.type?.startsWith("image/")) {
      showUploadToast("请选择图片文件进行裁剪。", "error");
      return Promise.resolve(null);
    }

    const imageUrl = URL.createObjectURL(file);
    const body = document.createElement("div");
    body.className = "upload-cropper";

    const stage = document.createElement("div");
    stage.className = "upload-cropper__stage";

    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = file.name || "待裁剪图片";

    const cropArea = document.createElement("div");
    cropArea.className = "upload-cropper__area";
    stage.append(image, cropArea);

    const controls = document.createElement("div");
    controls.className = "upload-cropper__controls";

    const createCropSlider = ({ label, value, min, max, step, role }) => {
      const control = document.createElement("div");
      control.className = "upload-cropper__control";
      control.innerHTML = `
        <span>${label}</span>
        <div class="qizhi-slider upload-cropper__slider" data-slider-demo data-slider-values="${value}" data-slider-min="${min}" data-slider-max="${max}" data-slider-step="${step}" data-crop-slider="${role}">
          <div class="qizhi-slider-wrapper">
            <div class="qizhi-slider-road">
              <div class="qizhi-slider-bar"></div>
              <button class="qizhi-slider-button" type="button" role="slider" aria-valuemax="${max}" aria-valuemin="${min}" aria-valuenow="${value}" aria-disabled="false" aria-valuetext="${value}"></button>
            </div>
          </div>
        </div>
      `;
      return control;
    };

    controls.append(
      createCropSlider({ label: "缩放", value: 10, min: 10, max: 24, step: 1, role: "zoom" }),
      createCropSlider({ label: "旋转", value: 0, min: 0, max: 360, step: 1, role: "rotate" })
    );
    body.append(stage, controls);

    const syncCropTransform = () => {
      const zoomValue = Number(body.querySelector('[data-crop-slider="zoom"]')?.dataset.sliderValues || 10);
      const rotate = body.querySelector('[data-crop-slider="rotate"]')?.dataset.sliderValues || "0";
      const zoom = Number.isFinite(zoomValue) ? zoomValue / 10 : 1;
      stage.style.setProperty("--crop-zoom", zoom);
      stage.style.setProperty("--crop-rotate", `${rotate}deg`);
    };

    body.addEventListener("slider:change", syncCropTransform);
    syncCropTransform();

    return requestUploadDialog({
      title: "裁剪图片",
      content: "",
      confirmText: "裁剪并上传",
      wide: true,
      body,
    }).then((confirmed) => {
      if (!confirmed) {
        URL.revokeObjectURL(imageUrl);
        showUploadToast("取消上传", "warning");
        return null;
      }

      return { file, imageUrl };
    });
  };

  const handleUploadFiles = async (list, files, options = {}) => {
    const demo = options.demo || list?.closest("[data-upload-button-demo], [data-upload-drag-demo]");
    const accept = options.accept || "";
    const beforeUpload = options.beforeUpload || "";
    const isPicture = demo?.classList.contains("upload-picture-demo");
    const limit = Number(demo?.dataset.limit || 0);

    for (const file of [...files]) {
      if (Number.isFinite(limit) && limit > 0 && demo.querySelectorAll("[data-upload-file-item]").length >= limit) {
        showUploadToast(`超过上传数量限制！最多上传${limit}个`, "warning");
        syncUploadLimit(demo);
        continue;
      }

      if (!isAcceptFile(file, accept)) {
        const errorItem = createFileItem(getUploadFileName(file), "error");
        list.prepend(errorItem);
        showUploadToast("不接受的文件类型，请重新上传指定文件类型~", "error");
        continue;
      }

      if (beforeUpload === "confirm") {
        const confirmed = await requestUploadConfirm(getUploadFileName(file));
        if (!confirmed) {
          showUploadToast(`${getUploadFileName(file)} 已取消上传。`, "warning");
          continue;
        }
      }

      if (beforeUpload === "crop") {
        const cropped = await requestCropUpload(file);
        if (!cropped) continue;
        simulatePictureUpload(list, cropped.file, cropped.imageUrl);
        syncUploadLimit(demo);
        continue;
      }

      if (isPicture) {
        const imageUrl = file?.type?.startsWith("image/") ? URL.createObjectURL(file) : "";
        simulatePictureUpload(list, file, imageUrl);
      } else {
        simulateUpload(list, file);
      }

      syncUploadLimit(demo);
    }
  };

  document.addEventListener("click", async (event) => {
    const retryButton = event.target.closest("[data-upload-retry]");
    if (retryButton) {
      const item = retryButton.closest("[data-upload-file-item]");
      const list = retryButton.closest("[data-upload-list]");
      const fileName = item?.querySelector(".upload-file-item__name")?.textContent || "未命名文件";
      item?.remove();
      if (list) simulateUpload(list, { name: fileName });
      return;
    }

    const removeButton = event.target.closest("[data-upload-remove]");
    if (!removeButton) return;
    const item = removeButton.closest("[data-upload-file-item]");
    const demo = removeButton.closest("[data-upload-button-demo], [data-upload-drag-demo]");
    const fileName = item?.querySelector(".upload-file-item__name")?.textContent || removeButton.getAttribute("aria-label")?.replace(/^删除\s*/, "") || "当前文件";

    if (demo?.dataset.beforeRemove === "confirm") {
      const confirmed = await requestRemoveConfirm(fileName);
      if (!confirmed) {
        showUploadToast(`${fileName} 已取消删除。`, "warning");
        return;
      }
    }

    item?.remove();
    syncUploadLimit(demo);
  });

  document.querySelectorAll("[data-upload-button-demo]").forEach((demo) => {
    if (demo.dataset.uploadButtonReady) return;
    demo.dataset.uploadButtonReady = "true";

    const input = demo.querySelector("[data-upload-input]");
    const trigger = demo.querySelector("[data-upload-trigger]");
    const list = demo.querySelector("[data-upload-list]");
    const accept = demo.dataset.accept || input?.getAttribute("accept") || "";
    const beforeUpload = demo.dataset.beforeUpload || "";

    if (!(input instanceof HTMLInputElement) || !trigger || !list) return;

    trigger.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      if (input.files?.length) handleUploadFiles(list, input.files, { accept, beforeUpload, demo });
      input.value = "";
    });
    syncUploadLimit(demo);
  });

  document.querySelectorAll("[data-upload-drag-demo]").forEach((demo) => {
    if (demo.dataset.uploadDragReady) return;
    demo.dataset.uploadDragReady = "true";

    const input = demo.querySelector("[data-upload-input]");
    const dropzone = demo.querySelector("[data-upload-dropzone]");
    const list = demo.querySelector("[data-upload-list]");
    const accept = demo.dataset.accept || input?.getAttribute("accept") || "";
    const beforeUpload = demo.dataset.beforeUpload || "";

    if (!(input instanceof HTMLInputElement) || !dropzone || !list) return;

    dropzone.addEventListener("click", () => input.click());
    dropzone.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      input.click();
    });

    input.addEventListener("change", () => {
      if (input.files?.length) handleUploadFiles(list, input.files, { accept, beforeUpload, demo });
      input.value = "";
    });

    dropzone.addEventListener("dragenter", (event) => {
      event.preventDefault();
      demo.classList.add("is-dragover");
    });

    dropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      demo.classList.add("is-dragover");
    });

    dropzone.addEventListener("dragleave", (event) => {
      if (event.relatedTarget && dropzone.contains(event.relatedTarget)) return;
      demo.classList.remove("is-dragover");
    });

    dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      demo.classList.remove("is-dragover");
      if (event.dataTransfer?.files?.length) handleUploadFiles(list, event.dataTransfer.files, { accept, beforeUpload, demo });
    });
  });
};

window.addEventListener("DOMContentLoaded", initUploadDemos);

const initMessageDemos = () => {
  const triggers = [...document.querySelectorAll(
    "[data-message-trigger], [data-message-update], [data-message-manual-close], [data-message-context-trigger]",
  )].filter((trigger) => !trigger.closest('#component-message[data-react-island="message"]'));
  if (!triggers.length) return;

  const iconByType = {
    info: "ri-information-fill",
    success: "ri-checkbox-circle-fill",
    warning: "ri-error-warning-fill",
    error: "ri-close-circle-fill",
    normal: "ri-information-line",
    loading: "ri-loader-4-line",
  };

  const layer = document.createElement("div");
  layer.className = "qizhi-message-layer";
  layer.setAttribute("aria-live", "polite");
  layer.setAttribute("aria-relevant", "additions text");
  document.body.append(layer);

  const closeMessage = (message) => {
    if (!message || message.classList.contains("is-leaving")) return;
    const timer = Number(message.dataset.timer);
    if (timer) window.clearTimeout(timer);
    message.classList.add("is-leaving");
    window.setTimeout(() => message.remove(), 180);
  };

  const showMessage = ({
    id = "",
    type = "info",
    content = "",
    icon = "",
    closable = false,
    duration = 3000,
    container = layer,
  }) => {
    let message = id ? container.querySelector(`[data-message-id="${id}"]`) : null;

    if (!message) {
      message = document.createElement("div");
      message.className = "qizhi-message";
      message.setAttribute("role", type === "error" ? "alert" : "status");
      if (id) message.dataset.messageId = id;

      const iconNode = document.createElement("i");
      iconNode.className = "qizhi-message__icon";
      iconNode.setAttribute("aria-hidden", "true");
      const contentNode = document.createElement("span");
      contentNode.className = "qizhi-message__content";
      message.append(iconNode, contentNode);
      container.append(message);
      window.requestAnimationFrame(() => message.classList.add("is-visible"));
    }

    message.className = `qizhi-message qizhi-message--${type} is-visible`;
    message.setAttribute("role", type === "error" ? "alert" : "status");
    message.querySelector(".qizhi-message__icon").className =
      `qizhi-message__icon ${icon || iconByType[type] || iconByType.info}`;
    message.querySelector(".qizhi-message__content").textContent = content;

    const existingClose = message.querySelector(".qizhi-message__close");
    if (closable && !existingClose) {
      const closeButton = document.createElement("button");
      closeButton.className = "qizhi-message__close";
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "关闭全局提示");
      closeButton.innerHTML = '<i class="ri-close-line" aria-hidden="true"></i>';
      closeButton.addEventListener("click", () => closeMessage(message));
      message.append(closeButton);
    } else if (!closable) {
      existingClose?.remove();
    }

    const previousTimer = Number(message.dataset.timer);
    if (previousTimer) window.clearTimeout(previousTimer);
    delete message.dataset.timer;

    if (duration > 0) {
      message.dataset.timer = String(window.setTimeout(() => closeMessage(message), duration));
    }

    return () => closeMessage(message);
  };

  triggers.filter((button) => button.matches("[data-message-trigger]")).forEach((button) => {
    button.addEventListener("click", () => {
      showMessage({
        type: button.dataset.messageType || "info",
        content: button.dataset.messageContent || "This is a message!",
        icon: button.dataset.messageIcon || "",
        closable: button.hasAttribute("data-message-closable"),
        duration: Number(button.dataset.messageDuration) || 3000,
      });
    });
  });

  triggers.filter((button) => button.matches("[data-message-update]")).forEach((button) => {
    button.addEventListener("click", () => {
      showMessage({
        id: "need-update",
        type: "loading",
        content: "Will update after 2 seconds...",
        duration: 0,
      });
      window.setTimeout(() => {
        showMessage({
          id: "need-update",
          type: "success",
          content: "Update success!",
        });
      }, 2000);
    });
  });

  triggers.filter((button) => button.matches("[data-message-manual-close]")).forEach((button) => {
    button.addEventListener("click", () => {
      const close = showMessage({
        type: "info",
        content: "Close after 2 seconds...",
        duration: 0,
      });
      window.setTimeout(close, 2000);
    });
  });

  triggers.filter((button) => button.matches("[data-message-context-trigger]")).forEach((button) => {
    button.addEventListener("click", () => {
      const holder = button
        .closest(".qizhi-message-context-demo")
        ?.querySelector("[data-message-context-holder]");
      if (!holder) return;

      showMessage({
        type: button.dataset.messageType || "info",
        content: "Current user: PJY",
        container: holder,
      });
    });
  });
};

window.addEventListener("DOMContentLoaded", initMessageDemos);

const initNotificationDemos = () => {
  if (document.querySelector('#component-notification[data-react-island="notification"]')) return;
  const triggers = document.querySelectorAll(
    "[data-notification-trigger], [data-notification-update], [data-notification-update-duration], [data-notification-action], [data-notification-hook-trigger]",
  );
  if (!triggers.length) return;

  const notifications = new Map();
  const iconMap = {
    info: "ri-information-fill",
    success: "ri-checkbox-circle-fill",
    warning: "ri-error-warning-fill",
    error: "ri-close-circle-fill",
    normal: "ri-notification-3-fill",
  };

  const getLayer = () => {
    let layer = document.querySelector(".qizhi-notification-layer");
    if (layer) return layer;
    layer = document.createElement("div");
    layer.className = "qizhi-notification-layer";
    layer.setAttribute("aria-live", "polite");
    layer.setAttribute("aria-relevant", "additions text removals");
    document.body.append(layer);
    return layer;
  };

  const clearNotificationTimer = (entry) => {
    if (!entry?.timer) return;
    window.clearTimeout(entry.timer);
    entry.timer = null;
  };

  const closeNotification = (id) => {
    const entry = notifications.get(id);
    if (!entry) return;
    clearNotificationTimer(entry);
    notifications.delete(id);
    entry.node.classList.add("is-leaving");
    window.setTimeout(() => {
      entry.node.remove();
      const layer = document.querySelector(".qizhi-notification-layer");
      if (layer && !layer.children.length) layer.remove();
    }, 200);
  };

  const showNotification = ({
    id = `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type = "info",
    title = "通知提醒",
    content = "",
    icon = "",
    closable = true,
    duration = 4500,
    actions = [],
  } = {}) => {
    const existing = notifications.get(id);
    const node = existing?.node || document.createElement("section");
    clearNotificationTimer(existing);
    node.className = `qizhi-notification qizhi-notification--${type}${closable ? " is-closable" : ""}`;
    node.setAttribute("role", type === "error" ? "alert" : "status");
    node.dataset.notificationId = id;
    node.innerHTML = `
      <i class="${icon || iconMap[type] || iconMap.info} qizhi-notification__icon" aria-hidden="true"></i>
      <div class="qizhi-notification__body">
        <div class="qizhi-notification__title"></div>
        <div class="qizhi-notification__content"></div>
      </div>
      ${closable ? '<button class="qizhi-notification__close" type="button" aria-label="关闭通知"><i class="ri-close-line" aria-hidden="true"></i></button>' : ""}
      ${actions.length ? '<div class="qizhi-notification__actions"></div>' : ""}
    `;
    node.querySelector(".qizhi-notification__title").textContent = title;
    node.querySelector(".qizhi-notification__content").textContent = content;

    actions.forEach(({ label, type = "secondary" }) => {
      const actionButton = document.createElement("button");
      actionButton.className = `qz-btn qz-btn-${type} qz-btn-size-default qz-btn-shape-square`;
      actionButton.type = "button";
      const actionLabel = document.createElement("span");
      actionLabel.textContent = label;
      actionButton.append(actionLabel);
      actionButton.addEventListener("click", () => closeNotification(id));
      node.querySelector(".qizhi-notification__actions")?.append(actionButton);
    });

    node.querySelector(".qizhi-notification__close")?.addEventListener("click", () => closeNotification(id));
    if (!existing) {
      getLayer().prepend(node);
      window.requestAnimationFrame(() => node.classList.add("is-visible"));
    } else {
      node.classList.add("is-visible");
    }

    const entry = { node, timer: null };
    notifications.set(id, entry);
    if (duration > 0) {
      entry.timer = window.setTimeout(() => closeNotification(id), duration);
    }
    return id;
  };

  document.querySelectorAll("[data-notification-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      showNotification({
        type: button.dataset.notificationType || "info",
        title: button.dataset.notificationTitle || "通知提醒",
        content: button.dataset.notificationContent || "",
        icon: button.dataset.notificationIcon || "",
        closable: button.dataset.notificationClosable !== "false",
      });
    });
  });

  document.querySelectorAll("[data-notification-hook-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      showNotification({
        type: button.dataset.notificationType || "info",
        title: "个人资料",
        content: "当前用户：启智用户",
      });
    });
  });

  document.querySelector("[data-notification-update]")?.addEventListener("click", () => {
    const id = "notification-update-content";
    showNotification({
      id,
      type: "info",
      title: "准备更新",
      content: "通知将在 2 秒后更新。",
      duration: 0,
    });
    window.setTimeout(() => {
      showNotification({
        id,
        type: "success",
        title: "更新成功",
        content: "通知内容已经更新。",
      });
    }, 2000);
  });

  document.querySelector("[data-notification-update-duration]")?.addEventListener("click", () => {
    const id = "notification-update-duration";
    showNotification({
      id,
      type: "info",
      title: "准备更新",
      content: "通知将在 2 秒后更新。",
      duration: 0,
    });
    window.setTimeout(() => {
      showNotification({
        id,
        type: "success",
        title: "更新成功",
        content: "通知将在 3 秒后自动关闭。",
        duration: 3000,
      });
    }, 2000);
  });

  document.querySelector("[data-notification-action]")?.addEventListener("click", () => {
    showNotification({
      type: "info",
      title: "任务通知",
      content: "你的导出任务已经完成，可以前往查看详情。",
      duration: 0,
      actions: [
        { label: "取消", type: "secondary" },
        { label: "好的", type: "primary" },
      ],
    });
  });
};

window.addEventListener("DOMContentLoaded", initNotificationDemos);

const initModalDemos = () => {
  const openButtons = [...document.querySelectorAll("[data-modal-open]")].filter((button) => (
    !button.closest('#component-modal[data-react-island="modal"]')
  ));
  if (!openButtons.length) return;

  let activeLayer = null;
  let activeTrigger = null;
  let modalTimers = [];

  const clearModalTimers = () => {
    modalTimers.forEach((timer) => window.clearTimeout(timer));
    modalTimers = [];
  };

  const closeModal = () => {
    if (!activeLayer) return;
    clearModalTimers();
    const layer = activeLayer;
    activeLayer = null;
    document.body.classList.remove("has-open-qizhi-modal");
    layer.classList.remove("is-visible");
    window.setTimeout(() => layer.remove(), 180);
    if (activeTrigger instanceof HTMLElement) {
      activeTrigger.focus({ preventScroll: true });
    }
    activeTrigger = null;
  };

  const createButton = (label, variant = "secondary", action = closeModal) => {
    const button = document.createElement("button");
    button.className = `qz-btn qz-btn-${variant} qz-btn-size-default qz-btn-shape-square qizhi-modal__button`;
    button.type = "button";
    const text = document.createElement("span");
    text.textContent = label;
    button.append(text);
    if (action) button.addEventListener("click", action);
    return button;
  };

  const modalCheckbox = (label, role) => `
    <label class="qizhi-checkbox qizhi-modal-table__checkbox" data-modal-checkbox="${role}">
      <input type="checkbox" aria-label="${label}">
      <span class="qizhi-checkbox-mask-wrapper" aria-hidden="true">
        <span class="qizhi-checkbox-mask"><i class="ri-check-line" aria-hidden="true"></i></span>
      </span>
    </label>
  `;

  const setModalCheckbox = (checkbox, checked, indeterminate = false) => {
    const input = checkbox?.querySelector('input[type="checkbox"]');
    if (!input) return;
    input.checked = checked;
    input.indeterminate = indeterminate;
    checkbox.classList.toggle("qizhi-checkbox-checked", checked);
    checkbox.classList.toggle("qizhi-checkbox-indeterminate", indeterminate);
  };

  const initModalTableCheckboxes = (table) => {
    if (!table) return;
    const selectAll = table.querySelector('[data-modal-checkbox="all"]');
    const rows = [...table.querySelectorAll('[data-modal-checkbox="row"]')];
    if (!selectAll || !rows.length) return;

    const syncSelectAll = () => {
      const checkedCount = rows.filter((checkbox) => checkbox.querySelector("input")?.checked).length;
      setModalCheckbox(selectAll, checkedCount === rows.length, checkedCount > 0 && checkedCount < rows.length);
    };

    selectAll.querySelector("input")?.addEventListener("change", (event) => {
      rows.forEach((checkbox) => setModalCheckbox(checkbox, event.currentTarget.checked));
      syncSelectAll();
    });

    rows.forEach((checkbox) => {
      checkbox.querySelector("input")?.addEventListener("change", (event) => {
        setModalCheckbox(checkbox, event.currentTarget.checked);
        syncSelectAll();
      });
    });
  };

  const pluginTable = (multiple = false) => {
    const rows = multiple
      ? [
          ["教学工具", "12.18.1", "狄更斯"],
          ["终端支持", "12.19.2", "亚里士多德"],
          ["Git 工具箱", "12.20.3", "海明威"],
        ]
      : [["教学工具", "12.18.1", "狄更斯"]];
    return `
      <p>你可以为当前项目选择多个插件，系统将检查这些插件是否已安装并启用。</p>
      <p><strong>插件列表</strong></p>
      <table class="qizhi-modal-table">
        <thead><tr><th>${modalCheckbox("选择全部插件", "all")}</th><th>名称</th><th>版本</th><th>作者</th></tr></thead>
        <tbody>${rows.map((row) => `<tr><td>${modalCheckbox(`选择${row[0]}`, "row")}</td><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join("")}</tbody>
      </table>
    `;
  };

  const buildModalContent = (type, body, footer, title) => {
    title.textContent = type === "async"
      ? "添加用户"
      : type === "alert" || type === "steps"
        ? "管理插件"
        : "对话框标题";

    if (type === "basic") {
      body.innerHTML = "<p>你可以根据当前场景自定义对话框正文。点击确定按钮后，对话框会立即关闭。</p>";
      footer.append(createButton("取消"), createButton("确定", "primary"));
      return;
    }

    if (type === "async") {
      body.innerHTML = `
        <form class="qizhi-modal-form" data-modal-form>
          <div class="qizhi-modal-form__item">
            <label class="qizhi-modal-form__label is-required" for="${title.id}-name">姓名</label>
            <span class="qizhi-input-wrapper input-demo qizhi-modal-form__control" data-modal-control>
              <input id="${title.id}-name" class="qizhi-input" name="name" autocomplete="off" placeholder="请输入姓名">
            </span>
          </div>
          <div class="qizhi-modal-form__item">
            <span class="qizhi-modal-form__label is-required" id="${title.id}-gender-label">性别</span>
            <span class="qizhi-input-wrapper input-demo input-demo--with-suffix select-demo qizhi-modal-form__control" data-input-no-clear data-select-demo data-modal-control aria-labelledby="${title.id}-gender-label">
              <input readonly class="qizhi-input" name="gender" placeholder="请选择性别" value="" aria-labelledby="${title.id}-gender-label">
              <i class="ri-arrow-down-s-line input-demo__suffix" aria-hidden="true"></i>
              <span class="input-demo-select-popup select-demo-popup" role="listbox" hidden>
                <button class="input-demo-select-option" type="button" role="option" aria-selected="false" data-value="男">男</button>
                <button class="input-demo-select-option" type="button" role="option" aria-selected="false" data-value="女">女</button>
              </span>
            </span>
          </div>
        </form>
      `;
      initInputClearDemos(body);
      initSelectDemos(body);
      const submit = createButton("确定", "primary", () => {
        const controls = [...body.querySelectorAll("[data-modal-control]")];
        const invalid = controls.filter((control) => !control.querySelector("input")?.value);
        controls.forEach((control) => control.classList.toggle("input-demo--error", invalid.includes(control)));
        if (invalid.length) {
          invalid[0].querySelector("input")?.focus();
          return;
        }
        submit.disabled = true;
        submit.classList.add("is-loading");
        submit.prepend(Object.assign(document.createElement("i"), { className: "ri-loader-4-line btn-loading-icon", ariaHidden: "true" }));
        modalTimers.push(window.setTimeout(closeModal, 1500));
      });
      footer.append(createButton("取消"), submit);
      return;
    }

    if (type.startsWith("footer-")) {
      body.innerHTML = "<p>这里是对话框内容。</p><p>这里是对话框内容。</p><p>这里是对话框内容。</p><p>这里是对话框内容。</p><p>这里是对话框内容。</p>";
      if (type === "footer-none") {
        footer.remove();
      } else if (type === "footer-disabled") {
        const cancel = createButton("取消");
        const ok = createButton("确定", "primary");
        cancel.disabled = true;
        ok.disabled = true;
        footer.append(cancel, ok);
      } else {
        const submit = createButton("提交", "primary", () => {
          submit.disabled = true;
          submit.classList.add("is-loading");
          submit.prepend(Object.assign(document.createElement("i"), { className: "ri-loader-4-line btn-loading-icon", ariaHidden: "true" }));
          modalTimers.push(window.setTimeout(closeModal, 1500));
        });
        footer.append(createButton("返回"), submit);
      }
      return;
    }

    if (type === "confirm") {
      const confirmTitle = "确定要删除已选择的 3 个项目吗？删除后无法撤销此操作。";
      title.closest(".qizhi-modal__header")?.remove();
      body.innerHTML = `<div class="qizhi-modal-confirm"><i class="ri-error-warning-fill qizhi-modal-confirm__icon" aria-hidden="true"></i><h3 class="qizhi-modal-confirm__title" id="${title.id}">${confirmTitle}</h3></div>`;
      footer.append(createButton("取消"), createButton("删除", "danger"));
      return;
    }

    if (type === "manual") {
      title.textContent = "提交中...";
      body.innerHTML = '<div class="qizhi-modal-status"><i class="ri-loader-4-line qizhi-modal-status__icon is-loading" aria-hidden="true"></i><span>对话框将在 1.5 秒后更新为成功状态。</span></div>';
      footer.remove();
      modalTimers.push(window.setTimeout(() => {
        title.textContent = "提交成功";
        const status = body.querySelector(".qizhi-modal-status");
        status.classList.add("is-success");
        status.querySelector("i").className = "ri-checkbox-circle-fill qizhi-modal-status__icon";
        status.querySelector("span").textContent = "对话框将在 1.5 秒后自动关闭。";
        modalTimers.push(window.setTimeout(closeModal, 1500));
      }, 1500));
      return;
    }

    if (type === "alert") {
      body.innerHTML = `<div class="qizhi-modal-alert"><i class="ri-information-fill" aria-hidden="true"></i><span>此提示仅显示一次。</span></div>${pluginTable(false)}`;
      initModalTableCheckboxes(body.querySelector(".qizhi-modal-table"));
      footer.append(createButton("取消"), createButton("确定", "primary"));
      return;
    }

  };

  const openModal = (type, trigger) => {
    closeModal();
    activeTrigger = trigger;

    const layer = document.createElement("div");
    layer.className = "qizhi-modal-layer";
    const mask = document.createElement("button");
    mask.className = "qizhi-modal-mask";
    mask.type = "button";
    mask.setAttribute("aria-label", "关闭对话框");
    const dialog = document.createElement("section");
    dialog.className = `qizhi-modal${type === "async" ? " qizhi-modal--form" : ""}${type === "confirm" ? " qizhi-modal--confirm" : ""}`;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    const titleId = `qizhi-modal-title-${Date.now()}`;
    dialog.setAttribute("aria-labelledby", titleId);
    dialog.innerHTML = `
      <header class="qizhi-modal__header"><div class="qizhi-modal__title" id="${titleId}"></div><button class="qizhi-modal__close" type="button" aria-label="关闭对话框"><i class="ri-close-line" aria-hidden="true"></i></button></header>
      <div class="qizhi-modal__body"></div>
      <footer class="qizhi-modal__footer"></footer>
    `;
    layer.append(mask, dialog);
    document.body.append(layer);
    activeLayer = layer;
    document.body.classList.add("has-open-qizhi-modal");

    const body = dialog.querySelector(".qizhi-modal__body");
    const footer = dialog.querySelector(".qizhi-modal__footer");
    const title = dialog.querySelector(".qizhi-modal__title");
    buildModalContent(type, body, footer, title);

    mask.addEventListener("click", closeModal);
    dialog.querySelector(".qizhi-modal__close").addEventListener("click", closeModal);
    window.requestAnimationFrame(() => {
      layer.classList.add("is-visible");
      dialog.querySelector("button, input, select")?.focus();
    });
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.modalOpen || "basic", button));
  });

  document.addEventListener("keydown", (event) => {
    if (!activeLayer) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...activeLayer.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled)")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
};

window.addEventListener("DOMContentLoaded", initModalDemos);

const initAlertDemos = () => {
  if (document.querySelector('#component-alert[data-react-island="alert"]')) return;
  document.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-alert-close]");
    if (!closeButton) return;

    const alert = closeButton.closest(".qizhi-alert");
    if (alert) alert.hidden = true;
  });
};

window.addEventListener("DOMContentLoaded", initAlertDemos);

const initDrawerDemos = () => {
  const drawers = [...document.querySelectorAll("[data-drawer]")].filter((drawer) => (
    !drawer.closest('#component-drawer[data-react-island="drawer"]')
  ));
  if (!drawers.length) return;

  const triggers = new WeakMap();

  const getDrawerById = (id) => drawers.find((drawer) => drawer.dataset.drawer === id || drawer.id === id);

  const syncTriggerState = (drawer, open) => {
    const id = drawer.dataset.drawer || drawer.id;
    document.querySelectorAll(`[data-drawer-open="${id}"]`).forEach((button) => {
      button.setAttribute("aria-expanded", String(open));
    });
  };

  const syncBodyState = () => {
    document.body.classList.toggle("has-open-drawer-demo", drawers.some((drawer) => drawer.classList.contains("is-open")));
  };

  const closeDrawer = (drawer, restoreFocus = true) => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    syncTriggerState(drawer, false);
    syncBodyState();

    const trigger = triggers.get(drawer);
    if (restoreFocus && trigger instanceof HTMLElement) {
      trigger.focus({ preventScroll: true });
    }
  };

  const openDrawer = (drawer, trigger) => {
    drawers.forEach((candidate) => {
      if (candidate !== drawer) closeDrawer(candidate, false);
    });

    triggers.set(drawer, trigger);
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    syncTriggerState(drawer, true);
    syncBodyState();

    const closeButton = drawer.querySelector("[data-drawer-close]");
    if (closeButton instanceof HTMLElement) {
      closeButton.focus({ preventScroll: true });
    }
  };

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-drawer-open]");
    if (openButton) {
      const drawer = getDrawerById(openButton.dataset.drawerOpen);
      if (drawer) openDrawer(drawer, openButton);
      return;
    }

    const closeButton = event.target.closest("[data-drawer-close]");
    if (!closeButton) return;

    const drawer = closeButton.closest("[data-drawer]");
    if (drawer) closeDrawer(drawer);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const openDrawerLayer = drawers.find((drawer) => drawer.classList.contains("is-open"));
    if (openDrawerLayer) closeDrawer(openDrawerLayer);
  });
};

const initDrawerFormSwitchDemos = () => {
  document.querySelectorAll(".drawer-form .qizhi-switch").forEach((button) => {
    setSwitchDemoChecked(button, button.getAttribute("aria-checked") === "true" || button.classList.contains("qizhi-switch-checked"));
    if (button.disabled) return;

    button.addEventListener("click", () => {
      setSwitchDemoChecked(button, button.getAttribute("aria-checked") !== "true");
    });
  });
};

window.addEventListener("DOMContentLoaded", initDrawerDemos);
window.addEventListener("DOMContentLoaded", initDrawerFormSwitchDemos);

const getPaginationTokens = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) return [1, 2, 3, 4, 5, "next", totalPages];
  if (currentPage >= totalPages - 3) {
    return [1, "prev", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "prev", currentPage - 1, currentPage, currentPage + 1, "next", totalPages];
};

const initPaginationDemos = () => {
  document.querySelectorAll("[data-pagination]").forEach((pagination) => {
    const pages = pagination.querySelector("[data-pagination-pages]");
    const previousButton = pagination.querySelector("[data-pagination-prev]");
    const nextButton = pagination.querySelector("[data-pagination-next]");
    const sizeSelect = pagination.querySelector("[data-pagination-size]");
    const jumper = pagination.querySelector("[data-pagination-jumper]");
    const simpleInput = pagination.querySelector("[data-pagination-simple-input]");
    const simpleTotal = pagination.querySelector("[data-pagination-simple-total]");
    const totalText = pagination.querySelector(".qizhi-pagination__total");
    const rangeText = pagination.querySelector("[data-pagination-range]");
    const loadMore = pagination.hasAttribute("data-pagination-load-more");
    const disabled = pagination.hasAttribute("data-pagination-disabled");
    let total = Math.max(1, Number.parseInt(pagination.dataset.paginationTotal || "1", 10));
    let pageSize = Math.max(1, Number.parseInt(sizeSelect?.value || "10", 10));
    let currentPage = Math.max(1, Number.parseInt(pagination.dataset.paginationPage || "1", 10));

    if (!previousButton || !nextButton || (!pages && !simpleInput)) return;

    const getTotalPages = () => Math.max(1, Math.ceil(total / pageSize));

    const render = (focusPage = false) => {
      const totalPages = getTotalPages();
      currentPage = Math.min(Math.max(1, currentPage), totalPages);
      pagination.dataset.paginationPage = String(currentPage);
      pagination.dataset.paginationTotal = String(total);
      previousButton.disabled = disabled || currentPage === 1;
      nextButton.disabled = disabled || (!loadMore && currentPage === totalPages);

      if (pages) {
        pages.textContent = "";
        getPaginationTokens(currentPage, totalPages).forEach((token) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "qizhi-pagination__item";
          button.disabled = disabled;

          if (typeof token === "number") {
            button.textContent = String(token);
            button.dataset.paginationPageTarget = String(token);
            button.setAttribute("aria-label", `第 ${token} 页`);
            if (token === currentPage) {
              button.classList.add("is-active");
              button.setAttribute("aria-current", "page");
            }
          } else {
            const forward = token === "next";
            button.classList.add("qizhi-pagination__item--ellipsis");
            button.dataset.paginationJump = forward ? "5" : "-5";
            button.setAttribute("aria-label", forward ? "向后 5 页" : "向前 5 页");
            const icon = document.createElement("i");
            icon.className = "ri-more-fill";
            icon.setAttribute("aria-hidden", "true");
            button.append(icon);
          }

          pages.append(button);
        });
      }

      if (simpleInput) {
        simpleInput.value = String(currentPage);
        simpleInput.max = String(totalPages);
      }
      if (simpleTotal) simpleTotal.textContent = String(totalPages);
      if (loadMore && totalText) totalText.textContent = `当前共 ${total} 条`;
      if (rangeText) {
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, total);
        rangeText.textContent = `${start}–${end} / ${total} 条`;
      }

      if (jumper) {
        jumper.max = String(totalPages);
        jumper.setAttribute("aria-valuemax", String(totalPages));
      }

      if (focusPage) {
        if (pages) pages.querySelector(`[data-pagination-page-target="${currentPage}"]`)?.focus({ preventScroll: true });
        else simpleInput?.focus({ preventScroll: true });
      }
    };

    const goToPage = (page, focusPage = false) => {
      currentPage = Math.min(Math.max(1, page), getTotalPages());
      render(focusPage);
    };

    pages?.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const targetPage = Number.parseInt(button.dataset.paginationPageTarget || "", 10);
      const jump = Number.parseInt(button.dataset.paginationJump || "", 10);
      if (Number.isFinite(targetPage)) goToPage(targetPage, true);
      else if (Number.isFinite(jump)) goToPage(currentPage + jump, true);
    });

    previousButton.addEventListener("click", () => goToPage(currentPage - 1, true));
    nextButton.addEventListener("click", () => {
      if (loadMore && currentPage === getTotalPages()) total += pageSize;
      goToPage(currentPage + 1, true);
    });

    sizeSelect?.addEventListener("change", () => {
      pageSize = Math.max(1, Number.parseInt(sizeSelect.value, 10));
      currentPage = 1;
      render();
    });

    jumper?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const targetPage = Number.parseInt(jumper.value, 10);
      if (!Number.isFinite(targetPage)) return;
      event.preventDefault();
      goToPage(targetPage);
      jumper.value = "";
    });

    simpleInput?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const targetPage = Number.parseInt(simpleInput.value, 10);
      if (!Number.isFinite(targetPage)) return;
      event.preventDefault();
      goToPage(targetPage, true);
    });

    render();
  });

  document.querySelectorAll("[data-pagination-size-demo]").forEach((demo) => {
    const pagination = demo.querySelector("[data-pagination]");
    const buttons = [...demo.querySelectorAll("[data-pagination-display-size]")];
    const sizeClasses = ["qizhi-pagination--large", "qizhi-pagination--small", "qizhi-pagination--mini"];
    if (!pagination || !buttons.length) return;

    const setDisplaySize = (button) => {
      const size = button.dataset.paginationDisplaySize || "default";
      pagination.classList.remove(...sizeClasses);
      if (size !== "default") pagination.classList.add(`qizhi-pagination--${size}`);
      buttons.forEach((candidate) => {
        const selected = candidate === button;
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-checked", String(selected));
        candidate.tabIndex = selected ? 0 : -1;
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => setDisplaySize(button));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        const nextButton = buttons[(index + direction + buttons.length) % buttons.length];
        setDisplaySize(nextButton);
        nextButton.focus();
      });
    });
  });
};

window.addEventListener("DOMContentLoaded", initPaginationDemos);


const initBusinessGuideDemos = () => {
  document.querySelectorAll("[data-business-guide-demo]").forEach((demo) => {
    if (demo.dataset.businessGuideReady === "true") return;

    const guide = demo.querySelector(".qizhi-business-guide");
    const closeButton = demo.querySelector("[data-business-guide-close]");
    const closedState = demo.querySelector("[data-business-guide-closed]");
    const restoreButton = demo.querySelector("[data-business-guide-restore]");
    if (!guide || !closeButton || !closedState || !restoreButton) return;

    demo.dataset.businessGuideReady = "true";
    closeButton.addEventListener("click", () => {
      guide.hidden = true;
      closedState.hidden = false;
      restoreButton.focus();
    });

    restoreButton.addEventListener("click", () => {
      guide.hidden = false;
      closedState.hidden = true;
      closeButton.focus();
    });
  });
};

window.addEventListener("DOMContentLoaded", initBusinessGuideDemos);

const initTaskOverviewDemos = () => {
  const taskData = [
    { type: "interactive", name: "maomao创建的交互式建模任务", space: "具身智能", resource: "2 × NVIDIA A100（32GB），36核 CPU 450GB 内存", duration: "19小时2分钟45秒" },
    { type: "interactive", name: "test0317", space: "拟人多模态大任务", resource: "4核 CPU 32GB 内存", duration: "3小时45分钟8秒" },
    { type: "interactive", name: "qhgao-gpu-1-codec", space: "具身智能", resource: "4核 CPU 16GB 内存", duration: "3小时45分钟8秒" },
    { type: "interactive", name: "dispider", space: "具身智能", resource: "4核 CPU 32GB 内存", duration: "12小时54分钟59秒" },
    { type: "interactive", name: "dev-setup-1", space: "拟人化强交互具身多模态", resource: "72核 CPU 800GB 内存", duration: "14小时54分钟6秒" },
    { type: "interactive", name: "vision-language-lab", space: "具身智能", resource: "8核 CPU 64GB 内存", duration: "6小时18分钟12秒" },
    { type: "interactive", name: "embodied-agent-debug", space: "具身智能", resource: "8核 CPU 32GB 内存", duration: "5小时27分钟36秒" },
    { type: "interactive", name: "multimodal-workbench", space: "拟人多模态大任务", resource: "16核 CPU 64GB 内存", duration: "9小时13分钟20秒" },
    { type: "interactive", name: "robot-policy-dev", space: "具身智能", resource: "2 × NVIDIA A800（80GB）", duration: "7小时42分钟11秒" },
    { type: "interactive", name: "vlm-experiment-04", space: "默认空间", resource: "8核 CPU 48GB 内存", duration: "4小时8分钟56秒" },
    { type: "interactive", name: "simulation-notebook", space: "具身智能", resource: "16核 CPU 128GB 内存", duration: "11小时26分钟18秒" },
    { type: "interactive", name: "agent-evaluation-dev", space: "默认空间", resource: "4核 CPU 32GB 内存", duration: "2小时39分钟7秒" },
    { type: "distributed", name: "distributed-train-a100", space: "默认空间", resource: "8 × NVIDIA A100（80GB）", duration: "2小时16分钟30秒" },
    { type: "distributed", name: "llm-pretrain-70b", space: "具身智能", resource: "16 × NVIDIA H800（80GB）", duration: "28小时11分钟5秒" },
    { type: "distributed", name: "distributed-finetune-01", space: "默认空间", resource: "4 × NVIDIA A800（80GB）", duration: "6小时15分钟42秒" },
    { type: "distributed", name: "multinode-training-02", space: "具身智能", resource: "8 × NVIDIA H800（80GB）", duration: "12小时31分钟10秒" },
    { type: "distributed", name: "foundation-model-train", space: "默认空间", resource: "16 × NVIDIA A100（80GB）", duration: "18小时20分钟3秒" },
    { type: "distributed", name: "distributed-eval-run", space: "具身智能", resource: "4 × NVIDIA A100（40GB）", duration: "3小时46分钟28秒" },
    { type: "distributed", name: "data-parallel-job", space: "默认空间", resource: "8 × NVIDIA A800（80GB）", duration: "7小时14分钟51秒" },
    { type: "distributed", name: "tensor-parallel-job", space: "具身智能", resource: "8 × NVIDIA H800（80GB）", duration: "9小时52分钟16秒" },
    { type: "compute", name: "hpc-simulation-01", space: "默认空间", resource: "128核 CPU 512GB 内存", duration: "8小时9分钟42秒" },
    { type: "compute", name: "hpc-simulation-02", space: "具身智能", resource: "96核 CPU 384GB 内存", duration: "5小时37分钟24秒" },
    { type: "compute", name: "scientific-compute-03", space: "默认空间", resource: "64核 CPU 256GB 内存", duration: "3小时22分钟18秒" },
    { type: "dedicated", name: "custom-service-prod", space: "默认空间", resource: "4核 CPU 16GB 内存", duration: "36小时20分钟18秒" },
  ];

  const createTaskItem = (task) => {
    const item = document.createElement("article");
    item.className = "qizhi-task-item";
    item.dataset.taskType = task.type;

    const icon = document.createElement("span");
    icon.className = "qizhi-task-item__icon";
    icon.setAttribute("aria-hidden", "true");
    const iconImage = document.createElement("img");
    iconImage.src = "./assets/qizhi-task-overview-item.svg";
    iconImage.alt = "";
    icon.append(iconImage);

    const content = document.createElement("div");
    content.className = "qizhi-task-item__content";
    const name = document.createElement("strong");
    name.className = "qizhi-task-item__name";
    name.textContent = task.name;
    const meta = document.createElement("div");
    meta.className = "qizhi-task-item__meta";
    const space = document.createElement("span");
    space.className = "qizhi-task-item__space";
    const spaceIcon = document.createElement("i");
    spaceIcon.className = "ri-home-5-line";
    spaceIcon.setAttribute("aria-hidden", "true");
    const spaceText = document.createElement("span");
    spaceText.textContent = task.space;
    space.append(spaceIcon, spaceText);
    const resource = document.createElement("span");
    resource.textContent = `资源规格：${task.resource}`;
    const duration = document.createElement("span");
    duration.textContent = `已运行时长：${task.duration}`;
    meta.append(space, resource, duration);
    content.append(name, meta);

    const status = document.createElement("span");
    status.className = "qizhi-task-item__status";
    status.textContent = "运行中";
    item.append(icon, content, status);
    return item;
  };

  document.querySelectorAll("[data-task-overview]").forEach((overview) => {
    if (overview.dataset.taskOverviewReady === "true") return;
    const cards = [...overview.querySelectorAll(".qizhi-task-overview__grid > [data-task-type]")];
    const list = overview.querySelector("[data-task-list]");
    const toggle = overview.querySelector("[data-task-toggle]");
    const spaceSelect = overview.querySelector(".qizhi-task-overview__space[data-select-demo]");
    const spaceInput = spaceSelect?.querySelector(".qizhi-input");
    if (!cards.length || !list || !toggle || !spaceSelect || !spaceInput) return;

    overview.dataset.taskOverviewReady = "true";
    let expanded = false;

    const render = () => {
      const selectedType = cards.find((card) => card.getAttribute("aria-pressed") === "true")?.dataset.taskType;
      const selectedSpace = spaceInput.value.replace(/^空间：/, "");
      const matchingTasks = taskData.filter((task) => task.type === selectedType
        && (selectedSpace === "全部" || task.space === selectedSpace));
      const visibleTasks = expanded ? matchingTasks : matchingTasks.slice(0, 4);
      list.replaceChildren(...visibleTasks.map(createTaskItem));
      toggle.hidden = matchingTasks.length <= 4;
      toggle.textContent = expanded ? "收起" : "查看全部";
      toggle.setAttribute("aria-expanded", String(expanded));
    };

    cards.forEach((card) => {
      card.addEventListener("click", (event) => {
        if (card.disabled || event.target.closest("[data-tooltip-demo]")) return;
        cards.forEach((candidate) => {
          if (candidate.disabled) {
            candidate.removeAttribute("aria-pressed");
            return;
          }
          const selected = candidate === card;
          candidate.setAttribute("aria-pressed", String(selected));
          candidate.classList.toggle("is-selected", selected);
          candidate.classList.toggle("is-selected-primary", selected);
        });
        expanded = false;
        render();
      });
    });

    toggle.addEventListener("click", () => {
      expanded = !expanded;
      render();
    });

    spaceSelect.addEventListener("select-demo-change", () => {
      expanded = false;
      render();
    });

    render();
  });
};

window.addEventListener("DOMContentLoaded", initTaskOverviewDemos);

const initProjectCardDemos = () => {
  const publicStorage = [
    { name: "inspire-sfs", applied: "2TiB", remaining: "1.97TiB", updatedAt: "2026-08-12 17:01:45" },
    { name: "sfs-legacy", applied: "-", remaining: "0.00TiB", updatedAt: "2026-08-12 17:01:45", warning: "该存储实例暂无有效申请额度，请检查申请状态或提交资源变更。" },
  ];
  const privateStorage = [
    { name: "全闪存储", applied: "10TB", remaining: "8.42TB", updatedAt: "2026-08-12 17:01:45" },
    { name: "混闪存储", applied: "5TB", remaining: "3.16TB", updatedAt: "2026-08-12 17:01:45" },
  ];
  const commonPublicRows = [["申请空间", "XX空间"], ["存储配额", publicStorage], ["作业预算", "¥10,000.00　可用预算：¥899.23"], ["权重优先级", "高优项目-10"]];
  const commonPrivateRows = [["申请空间", "XX独立空间"], ["存储配额", privateStorage], ["空间有效期", "2025-04-12 至 2025-08-12"]];
  const groups = {
    basic: [
      { name: "kevin-003", english: "pvc-test", status: "立项审批中", tone: "primary", rows: [["项目描述", "XXXX"], ["申请备注", "XXXX项目"], ["提交时间", "2025-01-25 12:23"]], members: ["K"] },
      { name: "kevin-003", english: "pvc-test", status: "立项申请驳回", tone: "danger", rows: [["项目描述", "XXXX"], ["申请备注", "XXXX项目"], ["提交时间", "2025-01-25 12:23"]], members: ["K"] },
      { name: "kevin-003公共空间项目", english: "pvc-test", status: "项目申请成功", tone: "success", rows: commonPublicRows, members: ["K", "L", "P"], action: "资源变更" },
    ],
    space: [
      { name: "kevin-003公共空间项目", english: "pvc-test", status: "项目申请成功", tone: "success", rows: commonPublicRows, members: ["K", "L", "P"], action: "资源变更" },
      { name: "kevin-独立空间项目", english: "pvc-test", status: "项目申请成功", tone: "success", rows: commonPrivateRows, members: ["K", "L", "P"], action: "资源变更" },
    ],
    resource: [
      { name: "kevin-003公共空间项目", english: "pvc-test", status: "资源审批中", tone: "primary", rows: commonPublicRows, members: ["K", "L", "P"], action: "资源申请" },
      { name: "kevin-独立空间项目", english: "pvc-test", status: "资源申请驳回", tone: "danger", rows: commonPrivateRows, members: ["K", "L", "P"], action: "资源申请" },
      { name: "基础-启智", english: "inf-inspire", status: "项目变更成功", tone: "success", rows: [["申请空间", "HW-H800-Public"], ["存储配额", publicStorage], ["作业预算", "¥158,609.00　可用预算：¥34,706.59"], ["权重优先级", "普通项目-4"]], members: ["I", "Q"], action: "资源变更" },
    ],
    risk: [
      { name: "kevin-003公共空间项目", english: "pvc-test", status: "项目申请成功", tone: "success", rows: commonPublicRows, members: ["K", "L", "P"], action: "资源变更", risk: "可用预算不足 15%，如需继续使用，请及时进行资源变更。", riskLevel: "warning" },
      { name: "kevin-003公共空间项目", english: "pvc-test", status: "项目申请成功", tone: "success", rows: commonPublicRows.map((row) => row[0] === "作业预算" ? [row[0], "¥10,000.00　可用预算：¥0.00"] : row), members: ["K", "L", "P"], action: "资源变更", risk: "作业预算已耗尽，如需继续使用，请及时进行资源变更。", riskLevel: "danger" },
      { name: "kevin-独立空间项目", english: "pvc-test", status: "项目申请成功", tone: "success", rows: commonPrivateRows, members: ["K", "L", "P"], action: "资源变更", risk: "空间资源即将到期，如需继续使用，请及时进行资源变更。", riskLevel: "danger" },
    ],
  };

  const createProjectCard = (project, notify) => {
    const card = document.createElement("article");
    card.className = "qizhi-project-card";
    card.dataset.tone = project.tone;
    const main = document.createElement("div");
    main.className = "qizhi-project-card__main";
    main.tabIndex = 0;
    main.setAttribute("role", "link");
    main.setAttribute("aria-label", `进入项目 ${project.name} 详情`);
    const openProject = () => notify(`已进入项目“${project.name}”详情`);
    main.addEventListener("click", openProject);
    main.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      openProject();
    });
    const header = document.createElement("div");
    header.className = "qizhi-project-card__header";
    const name = document.createElement("button");
    name.type = "button";
    name.className = "qizhi-project-card__name";
    name.textContent = project.name;
    name.title = `${project.name}\nID：project-${project.english}`;
    name.setAttribute("aria-label", `查看项目 ${project.name}，ID：project-${project.english}`);
    name.addEventListener("click", (event) => {
      event.stopPropagation();
      openProject();
    });
    const status = document.createElement("span");
    status.className = "qizhi-project-card__status";
    status.textContent = project.status;
    header.append(name, status);
    const body = document.createElement("div");
    body.className = "qizhi-project-card__body";
    [["项目英文名", project.english], ...project.rows].forEach(([labelText, valueText]) => {
      const row = document.createElement("div");
      row.className = "qizhi-project-card__row";
      const label = document.createElement("span");
      label.className = "qizhi-project-card__label";
      label.textContent = `${labelText}：`;
      const value = document.createElement("div");
      value.className = "qizhi-project-card__value";
      if (Array.isArray(valueText)) {
        row.classList.add("qizhi-project-card__row--storage");
        value.classList.add("qizhi-project-card__storage-list");
        valueText.forEach((storage) => {
          const item = document.createElement("div");
          item.className = "qizhi-project-card__storage-item";
          const summary = document.createElement("div");
          summary.className = "qizhi-project-card__storage-summary";
          const nameText = document.createElement("span");
          nameText.className = "qizhi-project-card__storage-name qizhi-project-card__truncate";
          nameText.textContent = storage.name;
          nameText.title = storage.name;
          const appliedLabel = document.createElement("span");
          appliedLabel.className = "qizhi-project-card__storage-label";
          appliedLabel.textContent = "已申请";
          const appliedValue = document.createElement("span");
          appliedValue.textContent = storage.applied;
          const remainingLabel = document.createElement("span");
          remainingLabel.className = "qizhi-project-card__storage-label";
          remainingLabel.textContent = "剩余";
          const remainingValue = document.createElement("span");
          remainingValue.textContent = storage.remaining;
          summary.append(nameText, appliedLabel, appliedValue, remainingLabel, remainingValue);
          if (storage.warning) {
            const tooltip = document.createElement("span");
            tooltip.className = "tooltip-demo tooltip-demo--top qizhi-project-card__storage-tooltip";
            tooltip.tabIndex = 0;
            tooltip.dataset.tooltipDemo = "";
            const trigger = document.createElement("span");
            trigger.className = "tooltip-demo__trigger";
            trigger.setAttribute("aria-label", "查看存储配额异常说明");
            const icon = document.createElement("span");
            icon.className = "qizhi-project-card__storage-warning-icon";
            icon.setAttribute("aria-hidden", "true");
            trigger.append(icon);
            const bubble = document.createElement("span");
            bubble.className = "qizhi-tooltip tooltip-demo__bubble";
            bubble.role = "tooltip";
            bubble.textContent = storage.warning;
            tooltip.append(trigger, bubble);
            tooltip.addEventListener("click", (event) => event.stopPropagation());
            tooltip.addEventListener("keydown", (event) => event.stopPropagation());
            summary.append(tooltip);
          }
          const updated = document.createElement("div");
          updated.className = "qizhi-project-card__storage-updated";
          const updatedLabel = document.createElement("span");
          updatedLabel.className = "qizhi-project-card__storage-label";
          updatedLabel.textContent = "数据更新时间";
          const updatedValue = document.createElement("span");
          updatedValue.textContent = storage.updatedAt;
          updated.append(updatedLabel, updatedValue);
          item.append(summary, updated);
          value.append(item);
        });
      } else {
        value.classList.add("qizhi-project-card__truncate");
        value.textContent = valueText;
        value.title = valueText;
      }
      row.append(label, value);
      body.append(row);
    });
    main.append(header, body);
    if (project.risk) {
      const risk = document.createElement("div");
      risk.className = `qizhi-alert ${project.riskLevel === "danger" ? "qizhi-alert-error" : "qizhi-alert-warning"} qizhi-alert-size-small qizhi-alert-inline qizhi-project-card__risk`;
      risk.setAttribute("role", "alert");
      risk.dataset.level = project.riskLevel;
      const iconWrapper = document.createElement("div");
      iconWrapper.className = "qizhi-alert-icon-wrapper";
      const icon = document.createElement("i");
      icon.className = "ri-error-warning-fill";
      icon.setAttribute("aria-hidden", "true");
      iconWrapper.append(icon);
      const contentWrapper = document.createElement("div");
      contentWrapper.className = "qizhi-alert-content-wrapper";
      const text = document.createElement("div");
      text.className = "qizhi-alert-content qizhi-project-card__truncate";
      text.textContent = project.risk;
      text.title = project.risk;
      contentWrapper.append(text);
      risk.append(iconWrapper, contentWrapper);
      main.append(risk);
    }
    const footer = document.createElement("footer");
    footer.className = "qizhi-project-card__footer";
    const members = document.createElement("div");
    members.className = "qizhi-project-card__members avatar-group-demo avatar-group-demo--small";
    project.members.forEach((member, index) => {
      const memberName = ["Kevin", "Lisa", "Project Admin"][index] || member;
      const tooltip = document.createElement("span");
      tooltip.className = "tooltip-demo tooltip-demo--top qizhi-project-card__member-tooltip";
      tooltip.dataset.tooltipDemo = "";
      const avatar = document.createElement("button");
      avatar.type = "button";
      avatar.className = `tooltip-demo__trigger qizhi-avatar qizhi-avatar-circle avatar-demo avatar-size--mini qizhi-project-card__member ${["avatar-demo--letter", "avatar-demo--brand", "avatar-demo--cyan"][index] || "avatar-demo--more"}`;
      avatar.innerHTML = `<span class="qizhi-avatar-text">${member}</span>`;
      avatar.setAttribute("aria-label", memberName);
      const bubble = document.createElement("span");
      bubble.className = "qizhi-tooltip tooltip-demo__bubble";
      bubble.role = "tooltip";
      bubble.textContent = memberName;
      tooltip.append(avatar, bubble);
      members.append(tooltip);
    });
    const actions = document.createElement("div");
    actions.className = "qizhi-project-card__actions";
    if (project.action) {
      const resourceAction = document.createElement("button");
      resourceAction.type = "button";
      resourceAction.className = "qizhi-project-card__action";
      resourceAction.innerHTML = `<img class="qizhi-project-card__action-icon" src="./assets/icons/qizhi-interactive-modeling.svg" alt=""><span>${project.action}</span>`;
      resourceAction.addEventListener("click", () => notify(`已打开“${project.name}”的${project.action}`));
      actions.append(resourceAction);
    }
    const memberActionTooltip = document.createElement("span");
    memberActionTooltip.className = "tooltip-demo tooltip-demo--top qizhi-project-card__member-action-tooltip";
    memberActionTooltip.dataset.tooltipDemo = "";
    const memberAction = document.createElement("button");
    memberAction.type = "button";
    memberAction.className = "tooltip-demo__trigger qizhi-project-card__action qizhi-project-card__action--members";
    memberAction.setAttribute("aria-label", "管理项目成员");
    memberAction.innerHTML = '<img src="./assets/icons/figma-combination/qz-icon-0-5395.svg" alt="">';
    memberAction.addEventListener("click", () => notify(`已打开“${project.name}”的成员管理`));
    const memberActionBubble = document.createElement("span");
    memberActionBubble.className = "qizhi-tooltip tooltip-demo__bubble";
    memberActionBubble.role = "tooltip";
    memberActionBubble.textContent = "成员列表";
    memberActionTooltip.append(memberAction, memberActionBubble);
    actions.append(memberActionTooltip);
    footer.append(members, actions);
    card.append(main, footer);
    return card;
  };

  document.querySelectorAll("[data-project-card-demo]").forEach((demo) => {
    if (demo.dataset.projectCardReady === "true") return;
    const list = demo.querySelector("[data-project-card-list]");
    const feedback = demo.querySelector("[data-project-card-feedback]");
    const options = [...demo.querySelectorAll('input[name="project-card-group"]')];
    if (!list || !feedback || !options.length) return;
    demo.dataset.projectCardReady = "true";
    const pane = demo.closest(".doc-pane");
    const scrollCompensation = document.createElement("div");
    scrollCompensation.className = "qizhi-project-card-demo__scroll-compensation";
    scrollCompensation.setAttribute("aria-hidden", "true");
    pane?.append(scrollCompensation);
    const notify = (message) => {
      feedback.textContent = "";
      window.requestAnimationFrame(() => { feedback.textContent = message; });
    };
    const render = (group) => list.replaceChildren(...groups[group].map((project) => createProjectCard(project, notify)));
    options.forEach((option) => option.addEventListener("change", () => {
      if (!option.checked) return;
      const scrollPosition = window.scrollY;
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      const previousOverflowAnchor = root.style.overflowAnchor;
      root.style.scrollBehavior = "auto";
      root.style.overflowAnchor = "none";
      scrollCompensation.style.height = "0px";
      options.forEach((candidate) => candidate.closest(".qizhi-segmented-item")?.classList.toggle("is-active", candidate.checked));
      render(option.value);
      const maxScrollPosition = Math.max(0, root.scrollHeight - window.innerHeight);
      const requiredCompensation = Math.max(0, scrollPosition - maxScrollPosition);
      scrollCompensation.style.height = `${requiredCompensation}px`;
      window.scrollTo(0, scrollPosition);
      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
        root.style.scrollBehavior = previousScrollBehavior;
        root.style.overflowAnchor = previousOverflowAnchor;
      });
    }));
    render(options.find((option) => option.checked)?.value || "basic");
  });
};

window.addEventListener("DOMContentLoaded", initProjectCardDemos);

const initChoiceCardDemos = () => {
  document.querySelectorAll("[data-choice-card-group]").forEach((group) => {
    if (group.dataset.choiceCardReady === "true") return;
    const inputs = [...group.querySelectorAll('.qizhi-choice-card input[type="radio"]')];
    if (!inputs.length) return;
    group.dataset.choiceCardReady = "true";

    const sync = () => {
      inputs.forEach((input) => {
        const card = input.closest(".qizhi-choice-card");
        card?.classList.toggle("is-selected", input.checked);
        card?.classList.toggle("is-disabled", input.disabled);
        card?.setAttribute("aria-disabled", String(input.disabled));
      });
    };

    inputs.forEach((input) => {
      const card = input.closest(".qizhi-choice-card");
      card?.addEventListener("click", (event) => {
        if (input.disabled) return;
        event.preventDefault();
        const nextChecked = !input.checked;
        inputs.forEach((candidate) => { candidate.checked = false; });
        input.checked = nextChecked;
        sync();
      });
      input.addEventListener("change", sync);
      input.addEventListener("keydown", (event) => {
        if (![" ", "Enter"].includes(event.key)) return;
        event.preventDefault();
        const nextChecked = !input.checked;
        inputs.forEach((candidate) => { candidate.checked = false; });
        input.checked = nextChecked;
        sync();
      });
    });
    sync();
  });
};

window.addEventListener("DOMContentLoaded", initChoiceCardDemos);

const initObjectSelectorDemos = () => {
  const versionsByObject = {
    "inf-v2": [
      { value: "V2", description: "推理性能优化" },
      { value: "V1", description: "初始版本" },
    ],
    "inf-128k": [
      { value: "V3", description: "支持更稳定的长上下文推理" },
      { value: "V2", description: "模型存储路径更新" },
      { value: "V1", description: "初始版本" },
    ],
    "inf-vision": [
      { value: "V2", description: "提升图文理解能力" },
      { value: "V1", description: "初始版本" },
    ],
  };

  document.querySelectorAll("[data-object-selector-demo]").forEach((demo) => {
    if (demo.dataset.objectSelectorReady === "true") return;
    const openButton = demo.querySelector("[data-object-selector-open]");
    const switchButton = demo.querySelector("[data-object-selector-switch]");
    const panel = demo.querySelector("[data-object-selector-panel]");
    const mask = demo.querySelector("[data-object-selector-mask]");
    const closeButton = demo.querySelector("[data-object-selector-close]");
    const cancelButton = demo.querySelector("[data-object-selector-cancel]");
    const confirmButton = demo.querySelector("[data-object-selector-confirm]");
    const searchInput = demo.querySelector("[data-object-selector-search]");
    const list = demo.querySelector("[data-object-selector-list]");
    const versionGroup = demo.querySelector("[data-object-selector-versions]");
    const empty = demo.querySelector(".qizhi-object-selector__empty");
    const count = demo.querySelector("[data-object-selector-count]");
    const selectedCard = demo.querySelector("[data-object-selector-selected]");
    const objectOptions = [...demo.querySelectorAll("[data-object-id]")];
    if (!openButton || !panel || !confirmButton || !list || !versionGroup || !objectOptions.length) return;
    demo.dataset.objectSelectorReady = "true";

    let draftObject = null;
    let draftVersion = "";
    let committedObject = objectOptions[0];
    let committedVersion = "V2";
    let returnFocus = openButton;

    const syncDraft = () => {
      objectOptions.forEach((option) => {
        const selected = option === draftObject;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-selected", String(selected));
        option.tabIndex = selected || (!draftObject && option === objectOptions.find((candidate) => !candidate.hidden)) ? 0 : -1;
      });
      confirmButton.disabled = !(draftObject && draftVersion);
      if (count) count.textContent = `已选模型 ${draftObject && draftVersion ? 1 : 0}/1`;
    };

    const selectVersion = (input) => {
      draftVersion = input.value;
      versionGroup.querySelectorAll(".qizhi-object-property-option").forEach((option) => {
        const candidate = option.querySelector("input");
        option.classList.toggle("qizhi-radio-checked", candidate?.checked);
      });
      syncDraft();
    };

    const renderVersions = () => {
      versionGroup.replaceChildren();
      const versions = draftObject ? versionsByObject[draftObject.dataset.objectId] || [] : [];
      empty.hidden = versions.length > 0;
      versions.forEach((version, index) => {
        const label = document.createElement("label");
        label.className = "qizhi-radio qizhi-object-property-option";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `object-selector-version-${demo.id || "demo"}`;
        input.value = version.value;
        input.checked = version.value === draftVersion;
        label.classList.toggle("qizhi-radio-checked", input.checked);
        const maskWrapper = document.createElement("span");
        maskWrapper.className = "qizhi-radio-mask-wrapper";
        maskWrapper.setAttribute("aria-hidden", "true");
        const mask = document.createElement("span");
        mask.className = "qizhi-radio-mask";
        maskWrapper.append(mask);
        const text = document.createElement("span");
        text.className = "qizhi-object-property-option__text";
        const title = document.createElement("strong");
        title.textContent = version.value;
        const description = document.createElement("span");
        description.textContent = version.description;
        text.append(title, description);
        label.append(input, maskWrapper, text);
        input.addEventListener("change", () => selectVersion(input));
        versionGroup.append(label);
        if (index === 0 && !draftVersion) input.tabIndex = 0;
      });
      syncDraft();
    };

    const selectObject = (option, focus = false) => {
      draftObject = option;
      draftVersion = "";
      renderVersions();
      if (focus) option.focus();
    };

    const openPanel = (trigger) => {
      returnFocus = trigger || openButton;
      draftObject = committedObject;
      draftVersion = committedVersion;
      searchInput.value = "";
      objectOptions.forEach((option) => { option.hidden = false; });
      renderVersions();
      panel.hidden = false;
      document.body.classList.add("has-open-qizhi-modal");
      openButton.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(() => {
        panel.classList.add("is-visible");
        (draftObject || objectOptions[0]).focus();
      });
    };

    const closePanel = (restoreFocus = true) => {
      panel.classList.remove("is-visible");
      panel.hidden = true;
      document.body.classList.remove("has-open-qizhi-modal");
      openButton.setAttribute("aria-expanded", "false");
      if (restoreFocus) returnFocus?.focus();
    };

    const renderCommitted = () => {
      const hasValue = Boolean(committedObject && committedVersion);
      selectedCard.hidden = !hasValue;
      openButton.hidden = hasValue;
      if (!hasValue) return;
      selectedCard.querySelector("[data-selected-object-name]").textContent = committedObject.dataset.objectName;
      selectedCard.querySelector("[data-selected-object-version]").textContent = committedVersion;
      selectedCard.querySelector("[data-selected-object-description]").textContent = committedObject.dataset.objectDescription;
    };

    objectOptions.forEach((option, index) => {
      option.addEventListener("click", () => selectObject(option));
      option.addEventListener("keydown", (event) => {
        if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const visibleOptions = objectOptions.filter((candidate) => !candidate.hidden);
        const currentIndex = visibleOptions.indexOf(option);
        const direction = event.key === "ArrowUp" ? -1 : 1;
        selectObject(visibleOptions[(currentIndex + direction + visibleOptions.length) % visibleOptions.length], true);
      });
      option.tabIndex = index === 0 ? 0 : -1;
    });

    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.trim().toLowerCase();
      objectOptions.forEach((option) => {
        option.hidden = Boolean(keyword && !option.dataset.objectName.toLowerCase().includes(keyword));
      });
      const firstVisible = objectOptions.find((option) => !option.hidden);
      if (draftObject?.hidden) {
        draftObject = null;
        draftVersion = "";
        renderVersions();
      } else {
        objectOptions.forEach((option) => { option.tabIndex = option === (draftObject || firstVisible) ? 0 : -1; });
      }
    });

    openButton.addEventListener("click", () => openPanel(openButton));
    switchButton?.addEventListener("click", () => openPanel(switchButton));
    closeButton?.addEventListener("click", () => closePanel());
    mask?.addEventListener("click", () => closePanel());
    cancelButton?.addEventListener("click", () => closePanel());
    confirmButton.addEventListener("click", () => {
      if (!draftObject || !draftVersion) return;
      committedObject = draftObject;
      committedVersion = draftVersion;
      renderCommitted();
      closePanel(false);
      switchButton?.focus();
    });
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...panel.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hidden);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    renderVersions();
    renderCommitted();
  });
};

window.addEventListener("DOMContentLoaded", initObjectSelectorDemos);

const initSpaceDemos = () => {
  const initControl = (demo, optionSelector, targetSelector, attribute) => {
    const options = [...demo.querySelectorAll(optionSelector)];
    const target = demo.querySelector(targetSelector);
    if (!options.length || !target) return;

    const selectOption = (option, focus = false) => {
      const value = option.dataset[attribute];
      if (!value) return;

      target.setAttribute(`data-${attribute.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}-value`, value);
      options.forEach((candidate) => {
        const selected = candidate === option;
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-checked", String(selected));
        candidate.tabIndex = selected ? 0 : -1;
      });
      if (focus) option.focus();
    };

    options.forEach((option, index) => {
      option.addEventListener("click", () => selectOption(option));
      option.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        selectOption(options[(index + direction + options.length) % options.length], true);
      });
    });
  };

  document.querySelectorAll("[data-space-size-demo]").forEach((demo) => {
    initControl(demo, "[data-space-size]", "[data-space-size-target]", "spaceSize");
  });

  document.querySelectorAll("[data-space-align-demo]").forEach((demo) => {
    initControl(demo, "[data-space-align]", "[data-space-align-target]", "spaceAlign");
  });
};

window.addEventListener("DOMContentLoaded", initSpaceDemos);

const initAnchorDemos = () => {
  document.querySelectorAll("[data-anchor-demo]").forEach((demo) => {
    demo.querySelectorAll(".qizhi-anchor").forEach((anchor) => {
      const links = [...anchor.querySelectorAll(".qizhi-anchor__link")];
      if (!links.length) return;

      anchor.addEventListener("click", (event) => {
        const selectedLink = event.target.closest(".qizhi-anchor__link");
        if (!selectedLink || !anchor.contains(selectedLink)) return;
        event.preventDefault();

        links.forEach((link) => {
          const isActive = link === selectedLink;
          link.classList.toggle("is-active", isActive);
          link.toggleAttribute("aria-current", isActive);
          if (isActive) link.setAttribute("aria-current", "location");
        });
      });
    });
  });
};

window.addEventListener("DOMContentLoaded", initAnchorDemos);

const initConfigProviderDemos = () => {
  document.querySelectorAll("[data-config-provider-demo]").forEach((demo) => {
    const localeButtons = [...demo.querySelectorAll("[data-config-locale]")];
    if (!localeButtons.length) return;

    const localeCopy = {
      "zh-CN": {
        previousPage: "上一页",
        nextPage: "下一页",
        pageLabel: (page) => `第 ${page} 页`,
        jumper: "跳转页码",
        pageSize: "每页条数",
        dateStart: "开始日期",
        dateEnd: "结束日期",
        timeStart: "开始时间",
        timeEnd: "结束时间",
        popconfirmTitle: "确认操作",
        popconfirmContent: "确定要继续吗？",
        cancel: "取消",
        confirm: "确定",
      },
      "en-US": {
        previousPage: "Previous page",
        nextPage: "Next page",
        pageLabel: (page) => `Page ${page}`,
        jumper: "Page number",
        pageSize: "Items per page",
        dateStart: "Start date",
        dateEnd: "End date",
        timeStart: "Start time",
        timeEnd: "End time",
        popconfirmTitle: "Confirm action",
        popconfirmContent: "Are you sure you want to continue?",
        cancel: "Cancel",
        confirm: "Confirm",
      },
    };

    const applyLocale = (locale, focus = false) => {
      const copy = localeCopy[locale] || localeCopy["zh-CN"];
      const isEnglish = locale === "en-US";
      demo.dataset.locale = locale;
      demo.setAttribute("lang", isEnglish ? "en" : "zh-CN");

      localeButtons.forEach((button) => {
        const selected = button.dataset.configLocale === locale;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-checked", String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (selected && focus) button.focus();
      });

      demo.querySelectorAll("[data-config-text]").forEach((node) => {
        node.textContent = isEnglish ? node.dataset.en : node.dataset.zh;
      });
      demo.querySelectorAll("[data-pagination-size] option").forEach((option) => {
        option.textContent = isEnglish ? option.dataset.en : option.dataset.zh;
      });

      const previousButton = demo.querySelector("[data-pagination-prev]");
      const nextButton = demo.querySelector("[data-pagination-next]");
      const pageSize = demo.querySelector("[data-pagination-size]");
      const jumper = demo.querySelector("[data-pagination-jumper]");
      previousButton?.setAttribute("aria-label", copy.previousPage);
      nextButton?.setAttribute("aria-label", copy.nextPage);
      pageSize?.setAttribute("aria-label", copy.pageSize);
      jumper?.setAttribute("aria-label", copy.jumper);
      demo.querySelectorAll("[data-pagination-page-target]").forEach((button) => {
        button.setAttribute("aria-label", copy.pageLabel(button.dataset.paginationPageTarget));
      });

      const dateRange = demo.querySelector("[data-config-date-range]");
      dateRange?.querySelector("[data-date-picker-start]")?.setAttribute("placeholder", copy.dateStart);
      dateRange?.querySelector("[data-date-picker-end]")?.setAttribute("placeholder", copy.dateEnd);
      const timeRange = demo.querySelector("[data-config-time-range]");
      timeRange?.querySelector("[data-time-picker-start]")?.setAttribute("placeholder", copy.timeStart);
      timeRange?.querySelector("[data-time-picker-end]")?.setAttribute("placeholder", copy.timeEnd);

    };

    localeButtons.forEach((button, index) => {
      button.addEventListener("click", () => applyLocale(button.dataset.configLocale));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        const nextButton = localeButtons[(index + direction + localeButtons.length) % localeButtons.length];
        applyLocale(nextButton.dataset.configLocale, true);
      });
    });

    applyLocale(demo.dataset.locale || "zh-CN");
  });
};

window.addEventListener("DOMContentLoaded", initConfigProviderDemos);
const initIconLibrary = () => {
  const input = document.querySelector("[data-icon-search]");
  const filter = document.querySelector("[data-icon-filter]");
  const library = document.querySelector("[data-icon-library]");
  const empty = document.querySelector("[data-icon-empty]");
  if (!input || !filter || !library || !empty) return;

  const cells = Array.from(library.querySelectorAll(".icon-cell"));
  const semanticSections = Array.from(library.querySelectorAll("[data-icon-semantic-section]"));
  const filterButtons = Array.from(filter.querySelectorAll("[data-icon-filter-value]"));
  let activeCategory = "all";
  let copyFeedbackTimer = 0;

  const copyFeedbackLayer = document.createElement("div");
  copyFeedbackLayer.className = "qizhi-message-layer";
  copyFeedbackLayer.setAttribute("aria-live", "polite");
  copyFeedbackLayer.setAttribute("aria-relevant", "text");
  document.body.append(copyFeedbackLayer);

  const showCopyFeedback = (content, type = "success") => {
    copyFeedbackLayer.replaceChildren();
    const message = document.createElement("div");
    message.className = `qizhi-message qizhi-message--${type}`;
    message.setAttribute("role", type === "error" ? "alert" : "status");
    const icon = document.createElement("i");
    icon.className = `qizhi-message__icon ${type === "error" ? "ri-close-circle-fill" : "ri-checkbox-circle-fill"}`;
    icon.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.className = "qizhi-message__content";
    text.textContent = content;
    message.append(icon, text);
    copyFeedbackLayer.append(message);
    window.requestAnimationFrame(() => message.classList.add("is-visible"));
    window.clearTimeout(copyFeedbackTimer);
    copyFeedbackTimer = window.setTimeout(() => {
      message.classList.add("is-leaving");
      window.setTimeout(() => message.remove(), 180);
    }, 2200);
  };

  const copyIconUsage = async (button) => {
    const componentName = button.dataset.iconComponent;
    if (!componentName) return;
    const snippet = `<${componentName} />`;
    try {
      await navigator.clipboard.writeText(snippet);
      showCopyFeedback(`复制成功：${snippet}`);
    } catch (error) {
      showCopyFeedback("复制失败，请检查浏览器剪贴板权限", "error");
    }
  };

  const applyFilters = () => {
    const keyword = input.value.trim().toLocaleLowerCase("zh-CN");
    let nextVisibleCount = 0;

    cells.forEach((cell) => {
      const matchesCategory = activeCategory === "all" || cell.dataset.iconCategory === activeCategory;
      const matchesKeyword = !keyword || cell.dataset.iconName?.toLocaleLowerCase("zh-CN").includes(keyword);
      const matches = matchesCategory && matchesKeyword;
      cell.hidden = !matches;
      if (matches) nextVisibleCount += 1;
    });

    semanticSections.forEach((section) => {
      const sectionCells = Array.from(section.querySelectorAll(".icon-cell"));
      const sectionVisibleCells = sectionCells.filter((cell) => !cell.hidden);
      const sectionVisibleCount = sectionVisibleCells.length;
      const columnCount = window.innerWidth >= 1200 ? 6 : window.innerWidth >= 768 ? 4 : 2;
      sectionCells.forEach((cell) => cell.classList.remove("is-first-row"));
      sectionVisibleCells.slice(0, columnCount).forEach((cell) => cell.classList.add("is-first-row"));
      const sectionCount = section.querySelector("[data-icon-semantic-count]");
      if (sectionCount) sectionCount.textContent = String(sectionVisibleCount);
      section.hidden = sectionVisibleCount === 0;
    });

    empty.hidden = nextVisibleCount !== 0;
  };

  const selectCategory = (button, focusButton = false) => {
    activeCategory = button.dataset.iconFilterValue || "all";
    filterButtons.forEach((item) => {
      const checked = item === button;
      item.classList.toggle("is-active", checked);
      item.setAttribute("aria-checked", String(checked));
      item.tabIndex = checked ? 0 : -1;
    });
    applyFilters();
    if (focusButton) button.focus();
  };

  filterButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectCategory(button));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = filterButtons.length - 1;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + filterButtons.length) % filterButtons.length;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % filterButtons.length;
      selectCategory(filterButtons[nextIndex], true);
    });
  });

  input.addEventListener("input", applyFilters);
  window.addEventListener("resize", applyFilters);
  library.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-icon-copy]");
    if (copyButton) copyIconUsage(copyButton);
  });
  library.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const copyButton = event.target.closest("[data-icon-copy]");
    if (!copyButton) return;
    event.preventDefault();
    copyIconUsage(copyButton);
  });
  applyFilters();
};

window.addEventListener("DOMContentLoaded", initIconLibrary);

const createTokenTable = (tokens, rgbVariables) => {
  const scroll = document.createElement("div");
  scroll.className = "token-table-scroll";
  const table = document.createElement("table");
  table.className = "token-table";
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["变量名", "变量值", "CSS 变量", "描述"].forEach((label) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = label;
    headRow.append(cell);
  });
  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");
  tokens.forEach((token) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const name = document.createElement("div");
    name.className = "token-cell";
    if (token.category === "基础变量" || token.category.includes("色")) {
      const sample = document.createElement("span");
      sample.className = "token-sample";
      sample.style.background = rgbVariables.has(token.cssVariable)
        ? `rgb(var(${token.cssVariable}))`
        : `var(${token.cssVariable})`;
      sample.setAttribute("aria-hidden", "true");
      name.append(sample);
    }
    const nameText = document.createElement("span");
    nameText.textContent = token.name;
    name.append(nameText);
    nameCell.append(name);

    const valueCell = document.createElement("td");
    const value = document.createElement("code");
    value.textContent = token.value;
    valueCell.append(value);
    const variableCell = document.createElement("td");
    const variable = document.createElement("code");
    variable.textContent = token.cssVariable;
    variableCell.append(variable);
    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = token.description;
    row.append(nameCell, valueCell, variableCell, descriptionCell);
    body.append(row);
  });
  table.append(body);
  scroll.append(table);
  return scroll;
};

const tokenManifestUrl = new URL(
  "./packages/qizhi-tokens/dist/tokens.json",
  import.meta.url,
);

const initTokenDocs = async () => {
  const container = document.querySelector("[data-token-docs]");
  if (!container) return;

  try {
    const response = await fetch(tokenManifestUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const manifest = await response.json();
    const tokens = Object.values(manifest.tokens ?? {});
    if (!tokens.length) throw new Error("设计变量数据为空");

    const groups = new Map();
    const tokenByVariable = new Map(tokens.map((token) => [token.cssVariable, token]));
    const rgbVariables = new Set();
    const resolvesToRgbChannels = (token, visited = new Set()) => {
      if (/^\s*\d+\s*,/.test(token.value)) return true;
      const reference = token.value.match(/^var\((--[a-zA-Z0-9-]+)\)$/)?.[1];
      if (!reference || visited.has(reference)) return false;
      const target = tokenByVariable.get(reference);
      if (!target) return false;
      visited.add(reference);
      return resolvesToRgbChannels(target, visited);
    };
    tokens.forEach((token) => {
      if (!token.name || !token.category || !token.cssVariable || !token.description) {
        throw new Error("设计变量数据不完整");
      }
      if (!groups.has(token.category)) groups.set(token.category, []);
      groups.get(token.category).push(token);
      if (resolvesToRgbChannels(token)) rgbVariables.add(token.cssVariable);
    });

    const fragment = document.createDocumentFragment();
    groups.forEach((categoryTokens, category) => {
      const section = document.createElement("section");
      section.className = "token-subsection";
      const heading = document.createElement("h3");
      heading.textContent = category;
      section.append(heading, createTokenTable(categoryTokens, rgbVariables));
      fragment.append(section);
    });
    container.replaceChildren(fragment);
  } catch (error) {
    console.error("设计变量加载失败", error);
    const status = document.createElement("p");
    status.className = "token-docs__status token-docs__status--error";
    status.textContent = "设计变量加载失败，请刷新页面重试。";
    container.replaceChildren(status);
  }
};

window.addEventListener("DOMContentLoaded", initTokenDocs);
