import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { GranularitySelect } from "./GranularitySelect";

it("显示实际自动粒度，过滤重复的保留项，并保留手动项的禁用状态", async () => {
  const onChange = vi.fn();
  render(<GranularitySelect value="auto" resolvedValue="day" onChange={onChange} options={[
    { value: "auto", label: "重复自动" },
    { value: "hour", label: "按小时", disabled: true },
    { value: "day", label: "按天" },
  ]} />);
  const trigger = screen.getByRole("combobox", { name: "聚合粒度" });
  expect(trigger).toHaveValue("自动（按天）");
  fireEvent.click(trigger);
  expect(await screen.findAllByRole("option")).toHaveLength(3);
  expect(screen.queryByRole("option", { name: "重复自动" })).not.toBeInTheDocument();
  const disabled = screen.getByRole("option", { name: "按小时" });
  expect(disabled).toHaveAttribute("aria-disabled", "true");
  fireEvent.click(disabled);
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("option", { name: "按天" }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith("day");
});
