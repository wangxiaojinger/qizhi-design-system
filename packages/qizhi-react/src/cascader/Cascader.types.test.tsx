import type { CascaderProps } from "./Cascader.types";

describe("Cascader type contract", () => {
  test("separates single and multiple value modes", () => {
    const single: CascaderProps = { options: [], value: ["shanghai"] };
    const multiple: CascaderProps = {
      options: [],
      mode: "multiple",
      value: [["shanghai"]],
      dragToSort: true,
    };

    // @ts-expect-error single mode does not accept multiple paths
    const invalidValue: CascaderProps = { options: [], value: [["shanghai"]] };
    // @ts-expect-error dragToSort only belongs to multiple mode
    const invalidDrag: CascaderProps = { options: [], dragToSort: true };

    expect(single.value).toEqual(["shanghai"]);
    expect(multiple.mode).toBe("multiple");
    expect(invalidValue.value).toEqual([["shanghai"]]);
    expect(invalidDrag.dragToSort).toBe(true);
  });
});
