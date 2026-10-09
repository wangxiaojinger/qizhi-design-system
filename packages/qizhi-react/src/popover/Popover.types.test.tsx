import { expectTypeOf, test } from "vitest";
import type {
  PopoverHandle,
  PopoverProps,
  PopoverRole,
  PopoverSemanticName,
  PopoverTrigger,
  PopoverVariant,
} from "./Popover.types";

test("exposes the approved Popover phase-one contract", () => {
  expectTypeOf<PopoverTrigger>().toEqualTypeOf<
    "hover" | "click" | "focus" | "contextMenu"
  >();
  expectTypeOf<PopoverRole>().toEqualTypeOf<"tooltip" | "dialog" | "menu">();
  expectTypeOf<PopoverVariant>().toEqualTypeOf<"light" | "dark">();
  expectTypeOf<PopoverSemanticName>().toEqualTypeOf<
    "root" | "title" | "content" | "arrow"
  >();
  expectTypeOf<PopoverHandle["forceAlign"]>().toBeFunction();
  expectTypeOf<keyof PopoverProps>().toEqualTypeOf<
    | "children"
    | "title"
    | "content"
    | "trigger"
    | "position"
    | "popupVisible"
    | "defaultPopupVisible"
    | "onVisibleChange"
    | "getPopupContainer"
    | "role"
    | "ariaLabel"
    | "mouseEnterDelay"
    | "mouseLeaveDelay"
    | "arrow"
    | "zIndex"
    | "classNames"
    | "styles"
    | "variant"
  >();
});
