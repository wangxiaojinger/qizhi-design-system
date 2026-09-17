import { expectTypeOf, test } from "vitest";
import type { Ref } from "react";
import type {
  TimePickerComponent,
  TimePickerProps,
  TimeRangePickerProps,
} from "./TimePicker.types";

test("single and range props narrow their values and callbacks", () => {
  const single: TimePickerProps = {
    value: "09:24",
    format: "HH:mm",
    onChange: (value) => expectTypeOf(value).toEqualTypeOf<string>(),
  };
  const range: TimeRangePickerProps = {
    value: ["08:00:00", "18:00:00"],
    onChange: (value) => expectTypeOf(value).toEqualTypeOf<[string, string] | []>(),
  };
  expectTypeOf(single.value).toEqualTypeOf<string | undefined>();
  expectTypeOf(range.value).toEqualTypeOf<readonly [string, string] | readonly [] | undefined>();
});

test("component accepts a root div ref", () => {
  expectTypeOf<Parameters<TimePickerComponent>[0]["ref"]>()
    .toEqualTypeOf<Ref<HTMLDivElement> | undefined>();
});

test("unsupported formats and malformed ranges fail type checking", () => {
  // @ts-expect-error v1 only supports 24-hour HH:mm and HH:mm:ss formats.
  const unsupportedFormat: TimePickerProps = { format: "hh:mm A" };
  // @ts-expect-error range values must contain zero or two entries.
  const malformedRange: TimeRangePickerProps = { value: ["08:00:00"] };
  expectTypeOf(unsupportedFormat).toEqualTypeOf<TimePickerProps>();
  expectTypeOf(malformedRange).toEqualTypeOf<TimeRangePickerProps>();
});
