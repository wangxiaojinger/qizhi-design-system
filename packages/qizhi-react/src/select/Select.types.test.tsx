import type { FocusEventHandler } from "react";
import { expectTypeOf, test } from "vitest";
import type { SelectSingleProps } from "./Select.types";

test("onBlur exposes the actual custom-trigger element type", () => {
  expectTypeOf<SelectSingleProps["onBlur"]>()
    .toEqualTypeOf<FocusEventHandler<HTMLElement> | undefined>();
});
