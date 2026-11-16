import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AdminFilterSelect, AdminSearchInput, PageHeader, SectionCard } from "./index";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, media: "", addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true }));
});

it("renders backend page compositions with the QIZHI admin contract", () => {
  const onSearch = vi.fn();
  render(
    <>
      <PageHeader title="成员管理" description="管理后台成员" actions={<button type="button">新增成员</button>} />
      <SectionCard title="筛选条件"><span>筛选内容</span></SectionCard>
      <AdminFilterSelect filterLabel="状态" allLabel="全部" options={[]} />
      <AdminSearchInput placeholder="搜索成员" onSearch={onSearch} />
    </>,
  );

  expect(screen.getByRole("heading", { name: "成员管理" })).toBeTruthy();
  expect(screen.getByText("筛选内容")).toBeTruthy();
  expect(screen.getByText("状态：")).toBeTruthy();
  const input = screen.getByPlaceholderText("搜索成员");
  fireEvent.change(input, { target: { value: "启智" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(onSearch).toHaveBeenCalledWith("启智");
});
