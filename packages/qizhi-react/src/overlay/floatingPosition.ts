export type FloatingPosition =
  | "topLeft" | "top" | "topRight"
  | "bottomLeft" | "bottom" | "bottomRight"
  | "leftTop" | "left" | "leftBottom"
  | "rightTop" | "right" | "rightBottom";

export const FLOATING_GAP = 12;
export const FLOATING_VIEWPORT_MARGIN = 8;

const oppositePositions: Record<FloatingPosition, FloatingPosition> = {
  topLeft: "bottomLeft",
  top: "bottom",
  topRight: "bottomRight",
  bottomLeft: "topLeft",
  bottom: "top",
  bottomRight: "topRight",
  leftTop: "rightTop",
  left: "right",
  leftBottom: "rightBottom",
  rightTop: "leftTop",
  right: "left",
  rightBottom: "leftBottom",
};

export const getFloatingCoordinates = (
  trigger: DOMRect,
  popup: DOMRect,
  position: FloatingPosition,
  gap = FLOATING_GAP,
) => {
  const centeredLeft = trigger.left + (trigger.width - popup.width) / 2;
  const centeredTop = trigger.top + (trigger.height - popup.height) / 2;
  const horizontal = {
    Left: trigger.left,
    Center: centeredLeft,
    Right: trigger.right - popup.width,
  };
  const vertical = {
    Top: trigger.top,
    Center: centeredTop,
    Bottom: trigger.bottom - popup.height,
  };

  if (position.startsWith("top")) {
    return {
      left: position === "topLeft"
        ? horizontal.Left
        : position === "topRight"
          ? horizontal.Right
          : horizontal.Center,
      top: trigger.top - popup.height - gap,
    };
  }
  if (position.startsWith("bottom")) {
    return {
      left: position === "bottomLeft"
        ? horizontal.Left
        : position === "bottomRight"
          ? horizontal.Right
          : horizontal.Center,
      top: trigger.bottom + gap,
    };
  }
  if (position.startsWith("left")) {
    return {
      left: trigger.left - popup.width - gap,
      top: position === "leftTop"
        ? vertical.Top
        : position === "leftBottom"
          ? vertical.Bottom
          : vertical.Center,
    };
  }
  return {
    left: trigger.right + gap,
    top: position === "rightTop"
      ? vertical.Top
      : position === "rightBottom"
        ? vertical.Bottom
        : vertical.Center,
  };
};

export const constrainFloatingCoordinates = (
  coordinates: { left: number; top: number },
  popup: DOMRect,
  viewport = { width: window.innerWidth, height: window.innerHeight },
) => ({
  left: Math.min(
    Math.max(coordinates.left, FLOATING_VIEWPORT_MARGIN),
    Math.max(
      FLOATING_VIEWPORT_MARGIN,
      viewport.width - popup.width - FLOATING_VIEWPORT_MARGIN,
    ),
  ),
  top: Math.min(
    Math.max(coordinates.top, FLOATING_VIEWPORT_MARGIN),
    Math.max(
      FLOATING_VIEWPORT_MARGIN,
      viewport.height - popup.height - FLOATING_VIEWPORT_MARGIN,
    ),
  ),
});

const overflowsPrimaryAxis = (
  coordinates: { left: number; top: number },
  popup: DOMRect,
  position: FloatingPosition,
  viewport: { width: number; height: number },
) => {
  if (position.startsWith("top")) {
    return coordinates.top < FLOATING_VIEWPORT_MARGIN;
  }
  if (position.startsWith("bottom")) {
    return coordinates.top + popup.height
      > viewport.height - FLOATING_VIEWPORT_MARGIN;
  }
  if (position.startsWith("left")) {
    return coordinates.left < FLOATING_VIEWPORT_MARGIN;
  }
  return coordinates.left + popup.width
    > viewport.width - FLOATING_VIEWPORT_MARGIN;
};

export const getFittedFloatingPlacement = (
  trigger: DOMRect,
  popup: DOMRect,
  requestedPosition: FloatingPosition,
  viewport = { width: window.innerWidth, height: window.innerHeight },
  gap = FLOATING_GAP,
) => {
  const requestedCoordinates = getFloatingCoordinates(
    trigger,
    popup,
    requestedPosition,
    gap,
  );
  const oppositePosition = oppositePositions[requestedPosition];
  const oppositeCoordinates = getFloatingCoordinates(
    trigger,
    popup,
    oppositePosition,
    gap,
  );
  const position = overflowsPrimaryAxis(
    requestedCoordinates,
    popup,
    requestedPosition,
    viewport,
  ) && !overflowsPrimaryAxis(
    oppositeCoordinates,
    popup,
    oppositePosition,
    viewport,
  )
    ? oppositePosition
    : requestedPosition;
  const coordinates = position === requestedPosition
    ? requestedCoordinates
    : oppositeCoordinates;

  return {
    ...constrainFloatingCoordinates(coordinates, popup, viewport),
    position,
  };
};

export interface FloatingOverlayLayoutOptions {
  gap?: number;
}

export const getFloatingOverlayLayout = (
  trigger: DOMRect,
  popup: DOMRect,
  requestedPosition: FloatingPosition,
  options: FloatingOverlayLayoutOptions = {},
) => {
  const { gap = FLOATING_GAP } = options;
  const next = getFittedFloatingPlacement(
    trigger,
    popup,
    requestedPosition,
    undefined,
    gap,
  );
  const verticalPlacement = next.position.startsWith("top")
    || next.position.startsWith("bottom");
  const arrowOffset = verticalPlacement
    ? trigger.left + trigger.width / 2 - next.left
    : trigger.top + trigger.height / 2 - next.top;

  return { ...next, arrowOffset };
};
