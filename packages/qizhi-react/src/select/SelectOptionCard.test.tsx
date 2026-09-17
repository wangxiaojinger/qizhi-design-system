import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Select } from "./Select";
import { SelectOptionCard } from "./SelectOptionCard";

it("renders card fields without introducing another interactive control", () => {
  render(<SelectOptionCard name="项目" fields={[{ key: "budget", label: "预算", value: "100元" }]} />);
  expect(screen.getByText("预算：")).toBeInTheDocument();
  expect(screen.getByText("100元")).toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("exposes option descriptions to keyboard navigation and closes with selection", () => {
  render(<Select aria-label="镜像测试" options={[{ label: "镜像A", value: "a" }]} renderOptionDescription={() => "创建成功"} />);
  const input = screen.getByRole("combobox", { name: "镜像测试" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByText("创建成功")).toBeInTheDocument();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input).toHaveValue("镜像A");
  expect(screen.queryByText("创建成功")).not.toBeInTheDocument();
});

it("shows descriptions on hover without adding tab stops and removes them on leave", () => {
  render(<Select aria-label="悬停测试" defaultOpen options={[{ label: "可用镜像", value: "a" }, { label: "不可用镜像", value: "b", disabled: true }]} renderOptionDescription={() => "镜像描述"} />);
  const option = screen.getByRole("option", { name: "可用镜像" });
  fireEvent.mouseEnter(option);
  expect(screen.getByText("镜像描述")).toBeInTheDocument();
  fireEvent.mouseLeave(option);
  expect(screen.queryByText("镜像描述")).not.toBeInTheDocument();
  fireEvent.mouseEnter(screen.getByRole("option", { name: "不可用镜像" }));
  expect(screen.queryByText("镜像描述")).not.toBeInTheDocument();
});

it("keyboard descriptions skip disabled options", () => {
  render(<Select aria-label="禁用导航" options={[{ label: "禁用", value: "a", disabled: true }, { label: "可用", value: "b" }]} renderOptionDescription={(option) => `说明${option.label}`} />);
  fireEvent.keyDown(screen.getByRole("combobox", { name: "禁用导航" }), { key: "ArrowDown" });
  expect(screen.getByText("说明可用")).toBeInTheDocument();
  expect(screen.queryByText("说明禁用")).not.toBeInTheDocument();
});
