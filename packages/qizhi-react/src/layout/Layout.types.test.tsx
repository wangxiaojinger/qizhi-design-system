import type { ComponentProps } from "react";
import { expectTypeOf, test } from "vitest";
import { Layout } from "./Layout";

test("Layout compound parts preserve native element props", () => {
  expectTypeOf<ComponentProps<typeof Layout>>().toMatchTypeOf<{ children?: React.ReactNode }>();
  expectTypeOf<ComponentProps<typeof Layout.Sider>>().toMatchTypeOf<{ children?: React.ReactNode }>();
});
