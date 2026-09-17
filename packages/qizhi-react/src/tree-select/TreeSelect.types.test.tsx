import { expectTypeOf, test } from "vitest";
import type {
  TreeSelectMultipleProps,
  TreeSelectSingleProps,
  TreeSelectValue,
} from "./TreeSelect.types";

test("single mode exposes one selected value", () => {
  expectTypeOf<TreeSelectSingleProps["value"]>().toEqualTypeOf<
    TreeSelectValue | undefined
  >();
  expectTypeOf<NonNullable<TreeSelectSingleProps["onChange"]>>().parameter(0)
    .toEqualTypeOf<TreeSelectValue | undefined>();
});

test("multiple mode exposes an array of selected values", () => {
  expectTypeOf<TreeSelectMultipleProps["value"]>().toEqualTypeOf<
    readonly TreeSelectValue[] | undefined
  >();
  expectTypeOf<NonNullable<TreeSelectMultipleProps["onChange"]>>().parameter(0)
    .toEqualTypeOf<readonly TreeSelectValue[]>();
});
