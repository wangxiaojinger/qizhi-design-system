import type { ComponentProps } from "react";
import { expectTypeOf, test } from "vitest";
import { PageHeader } from "./PageHeader";

type Props = ComponentProps<typeof PageHeader>;

// @ts-expect-error PageHeader v1 has no configurable height.
const invalidHeight: Props["height"] = 64;

test("exposes only native header attributes and children", () => {
  expectTypeOf<Props["children"]>().toMatchTypeOf<React.ReactNode>();
  expectTypeOf<Props["className"]>().toEqualTypeOf<string | undefined>();
  expectTypeOf<Props["title"]>().toEqualTypeOf<string | undefined>();
  void invalidHeight;
});
