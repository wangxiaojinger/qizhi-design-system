import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Cascader } from "../index";

describe("Cascader public export", () => {
  test("renders QIZHI size and status classes with package icons", () => {
    render(<Cascader options={[]} size="small" status="error" open />);

    expect(screen.getByRole("combobox").closest(".qizhi-cascader")).toHaveClass(
      "qizhi-cascader--small",
      "qizhi-cascader--error",
    );
    expect(document.querySelector(".qizhi-cascader__arrow svg")).toBeInTheDocument();
  });
});

