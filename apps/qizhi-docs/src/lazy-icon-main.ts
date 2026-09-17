let iconIslandPromise: Promise<unknown> | undefined;

const loadIconIsland = (pane?: Element | null) => {
  const targetPane = pane ?? document.querySelector("#components-icon.is-visible");
  if (targetPane?.id !== "components-icon") return;
  iconIslandPromise ??= import("./icon/main");
};

document.addEventListener("qizhi:route-rendered", (event) => {
  loadIconIsland((event as CustomEvent<{ pane?: Element }>).detail?.pane);
});

window.addEventListener("DOMContentLoaded", () => loadIconIsland());
