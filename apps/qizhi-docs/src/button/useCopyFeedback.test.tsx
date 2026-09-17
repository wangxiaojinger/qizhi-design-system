import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCopyFeedback } from "./useCopyFeedback";

function CopyProbe({ source }: { source: string }) {
  const { copy, message } = useCopyFeedback(source);
  return <><button type="button" onClick={copy}>复制代码</button><span role="status">{message}</span></>;
}

it("reports real clipboard success and failure", async () => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("denied"));
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  render(<CopyProbe source="formal source" />);
  await user.click(screen.getByRole("button", { name: "复制代码" }));
  expect(screen.getByRole("status")).toHaveTextContent("复制成功");
  await user.click(screen.getByRole("button", { name: "复制代码" }));
  expect(screen.getByRole("status")).toHaveTextContent("复制失败");
});
