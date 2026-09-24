import { expectTypeOf, test } from "vitest";
import { AutoComplete } from "./AutoComplete";
import type { AutoCompleteOption, AutoCompleteProps } from "./AutoComplete.types";

test("AutoComplete 对外类型与 v1 契约一致", () => {
  const option: AutoCompleteOption = { value: "beijing", label: "北京", group: "华北" };
  const props: AutoCompleteProps = {
    data: [option],
    strict: true,
    filterOption: (inputValue, current) => current.value.startsWith(inputValue),
    onChange: (value) => expectTypeOf(value).toEqualTypeOf<string>(),
    onSelect: (value, current) => {
      expectTypeOf(value).toEqualTypeOf<string>();
      expectTypeOf(current).toMatchTypeOf<AutoCompleteOption>();
    },
    loading: false,
    emptyContent: "暂无区域",
    error: "查询失败",
    onRetry: () => undefined,
  };

  <AutoComplete {...props} />;
  <AutoComplete.Option value="shanghai">上海</AutoComplete.Option>;
});
