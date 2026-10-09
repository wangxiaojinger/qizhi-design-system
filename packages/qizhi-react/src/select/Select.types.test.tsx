import type { FocusEventHandler } from "react";
import { expectTypeOf, test } from "vitest";
import type { SelectMultipleProps, SelectOptionGroup, SelectSingleProps } from "./Select.types";

test("onBlur exposes the actual custom-trigger element type", () => {
  expectTypeOf<SelectSingleProps["onBlur"]>()
    .toEqualTypeOf<FocusEventHandler<HTMLElement> | undefined>();
});

test("group and independent events are public contracts", () => {
  expectTypeOf<SelectOptionGroup["options"]>()
    .toEqualTypeOf<import("./Select.types").SelectOption[]>();
  expectTypeOf<SelectSingleProps["onSelect"]>()
    .not.toBeNever();
  expectTypeOf<SelectMultipleProps["onDeselect"]>()
    .not.toBeNever();
});

test("P1 props preserve single and multiple mode contracts", () => {
  expectTypeOf<SelectSingleProps["searchValue"]>().toEqualTypeOf<string | undefined>();
  expectTypeOf<SelectSingleProps["loading"]>().toEqualTypeOf<boolean | undefined>();
  expectTypeOf<SelectMultipleProps["maxCount"]>().toEqualTypeOf<number | undefined>();
  expectTypeOf<SelectSingleProps["virtual"]>().toEqualTypeOf<boolean | undefined>();
  expectTypeOf<SelectSingleProps["listHeight"]>().toEqualTypeOf<number | undefined>();
});
