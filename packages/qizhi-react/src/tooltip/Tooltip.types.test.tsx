import { expectTypeOf, test } from "vitest";
import type {
  TooltipPosition,
  TooltipProps,
  TooltipSemanticName,
  TooltipTrigger,
} from "./Tooltip.types";

test("exposes only the confirmed Tooltip v1 API", () => {
  expectTypeOf<TooltipPosition>().toEqualTypeOf<
    | "topLeft" | "top" | "topRight"
    | "bottomLeft" | "bottom" | "bottomRight"
    | "leftTop" | "left" | "leftBottom"
    | "rightTop" | "right" | "rightBottom"
  >();
  expectTypeOf<TooltipTrigger>().toEqualTypeOf<"hover" | "focus" | "click">();
  expectTypeOf<TooltipSemanticName>().toEqualTypeOf<
    "root" | "container" | "arrow"
  >();
  expectTypeOf<keyof TooltipProps>().toEqualTypeOf<
    | "children"
    | "content"
    | "position"
    | "trigger"
    | "mini"
    | "color"
    | "popupVisible"
    | "defaultPopupVisible"
    | "onVisibleChange"
    | "getPopupContainer"
    | "mouseEnterDelay"
    | "mouseLeaveDelay"
    | "arrow"
    | "zIndex"
    | "classNames"
    | "styles"
  >();
});
