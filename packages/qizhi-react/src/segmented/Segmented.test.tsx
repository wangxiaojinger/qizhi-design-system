import { fireEvent, render, screen } from "@testing-library/react";
import { Segmented } from "./Segmented";

it("supports controlled segmented selection without native Demo controls", () => {
  const onChange = vi.fn();
  render(
    <Segmented
      value="basic"
      options={[
        { label: "基础与审批", value: "basic" },
        { label: "空间类型", value: "space" },
      ]}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: "空间类型" }));
  expect(onChange).toHaveBeenCalledWith("space");
});
