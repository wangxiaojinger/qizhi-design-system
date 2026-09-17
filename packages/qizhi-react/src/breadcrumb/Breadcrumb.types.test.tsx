import type { ComponentProps, ReactNode } from "react";
import { expectTypeOf, test } from "vitest";
import { Breadcrumb } from "./Breadcrumb";

type Props = ComponentProps<typeof Breadcrumb>;

const validSize: Props["size"] = "small";
const validSeparator: Props["separator"] = "/";
const validItem = (
  <Breadcrumb.Item href="#target" current={false} data-id="channel">
    频道
  </Breadcrumb.Item>
);

// @ts-expect-error Breadcrumb v1 has no large size.
const invalidSize: Props["size"] = "large";

test("accepts only approved Breadcrumb props and item attributes", () => {
  expectTypeOf<Props["size"]>()
    .toEqualTypeOf<"default" | "small" | undefined>();
  expectTypeOf(validSeparator).toMatchTypeOf<Props["separator"]>();
  expectTypeOf(validItem).toMatchTypeOf<ReactNode>();
  void invalidSize;
});
