export interface NoticeTimers {
  timer?: number;
  closeTimer?: number;
}

export function clearNoticeTimers(record: NoticeTimers) {
  if (record.timer) window.clearTimeout(record.timer);
  if (record.closeTimer) window.clearTimeout(record.closeTimer);
}

export function getOrCreateNoticeLayer<Position extends string>({
  holder,
  layers,
  position,
  className,
  getContainer,
  relevant = "additions text",
}: {
  holder: HTMLElement | null;
  layers: Map<Position, HTMLElement>;
  position: Position;
  className: string;
  getContainer: () => HTMLElement;
  relevant?: "additions text" | "all";
}) {
  if (holder) return holder;
  const existing = layers.get(position);
  if (existing?.isConnected) return existing;
  const layer = document.createElement("div");
  layer.className = className;
  layer.dataset.position = position;
  layer.setAttribute("aria-live", "polite");
  layer.setAttribute("aria-relevant", relevant);
  getContainer().append(layer);
  layers.set(position, layer);
  return layer;
}
