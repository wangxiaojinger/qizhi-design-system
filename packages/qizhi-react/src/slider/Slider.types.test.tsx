import { expectTypeOf, test } from "vitest";
import { Slider } from "./Slider";
import type {
  SliderMultipleProps,
  SliderMultipleValue,
  SliderRangeProps,
  SliderRangeValue,
  SliderSingleProps,
} from "./Slider.types";

test("narrows Slider values and callbacks from the selected mode", () => {
  const single: SliderSingleProps = {
    value: 20,
    onChange: (value) => expectTypeOf(value).toEqualTypeOf<number>(),
    onChangeComplete: (value) => expectTypeOf(value).toEqualTypeOf<number>(),
  };
  const range: SliderRangeProps = {
    range: true,
    value: [10, 80],
    onChange: (value) => expectTypeOf(value).toEqualTypeOf<SliderRangeValue>(),
    onChangeComplete: (value) => expectTypeOf(value).toEqualTypeOf<SliderRangeValue>(),
  };
  const multiple: SliderMultipleProps = {
    multiple: true,
    value: [0, 20, 50],
    onChange: (value) => expectTypeOf(value).toEqualTypeOf<SliderMultipleValue>(),
    onChangeComplete: (value) => expectTypeOf(value).toEqualTypeOf<SliderMultipleValue>(),
  };

  expectTypeOf(single.value).toEqualTypeOf<number | undefined>();
  expectTypeOf(range.value).toEqualTypeOf<SliderRangeValue | undefined>();
  expectTypeOf(multiple.value).toEqualTypeOf<SliderMultipleValue | undefined>();
});

test("rejects values that conflict with the selected Slider mode", () => {
  // @ts-expect-error single mode does not accept an array value
  <Slider value={[10, 80]} />;
  // @ts-expect-error range mode requires an array value
  <Slider range value={80} />;
  // @ts-expect-error multiple mode requires an array value
  <Slider multiple value={20} />;
  // @ts-expect-error range and multiple are mutually exclusive
  <Slider range multiple value={[10, 80]} />;
});
