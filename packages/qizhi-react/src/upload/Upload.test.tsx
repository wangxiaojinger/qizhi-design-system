import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button";
import { Upload } from "./Upload";
import type { UploadFile } from "./Upload.types";

const completeRequest = ({ onProgress, onSuccess }: {
  onProgress: (percent: number) => void;
  onSuccess: () => void;
}) => {
  onProgress(28);
  onSuccess();
};

test("selects files and visually advances progress to success", async () => {
  const user = userEvent.setup();
  render(<Upload multiple customRequest={completeRequest}><Button>点击上传</Button></Upload>);
  const input = screen.getByTestId("qizhi-upload-input");
  await user.upload(input, new File(["ice"], "ice.png", { type: "image/png" }));
  const item = screen.getByText("ice.png").closest("[data-upload-file-item]");
  expect(item).toHaveClass("is-success");
  expect(item?.querySelector("[role=progressbar]")).toHaveAttribute("aria-valuenow", "100");
});

test("honors async remove cancellation and restores the item", async () => {
  const user = userEvent.setup();
  const file: UploadFile = { uid: "light", name: "light.png", status: "success" };
  render(<Upload defaultFileList={[file]} onRemove={() => Promise.resolve(false)}>
    <Button>点击上传</Button>
  </Upload>);
  await user.hover(screen.getByText("light.png").closest("[data-upload-file-item]")!);
  await user.click(screen.getByRole("button", { name: "删除 light.png" }));
  expect(screen.getByText("light.png")).toBeVisible();
});

test("filters rejected files and supports retry after request errors", async () => {
  const user = userEvent.setup();
  let attempts = 0;
  render(
    <Upload
      accept="image/*"
      customRequest={({ onError, onSuccess }) => {
        attempts += 1;
        if (attempts === 1) onError();
        else onSuccess();
      }}
    >
      <Button>点击上传</Button>
    </Upload>,
  );
  const input = screen.getByTestId("qizhi-upload-input");
  await user.upload(input, new File(["text"], "readme.txt", { type: "text/plain" }));
  expect(screen.queryByText("readme.txt")).not.toBeInTheDocument();
  await user.upload(input, new File(["cat"], "cat.png", { type: "image/png" }));
  await user.click(screen.getByRole("button", { name: "重新上传 cat.png" }));
  expect(screen.getByText("cat.png").closest("[data-upload-file-item]"))
    .toHaveClass("is-success");
});

test("drag drop, limit hiding, and removal recovery share the same state machine", async () => {
  const user = userEvent.setup();
  render(<Upload drag limit={1} customRequest={completeRequest} />);
  const dropzone = screen.getByRole("button", { name: "点击或拖动文件到该区域上传" });
  fireEvent.drop(dropzone, {
    dataTransfer: { files: [new File(["ice"], "ice.png", { type: "image/png" })] },
  });
  await screen.findByText("ice.png");
  expect(dropzone).not.toBeVisible();
  await user.click(screen.getByRole("button", { name: "删除 ice.png" }));
  await waitFor(() => expect(screen.getByRole("button", {
    name: "点击或拖动文件到该区域上传",
  })).toBeVisible());
});

test("renders the approved Upload icon in the default drag trigger", () => {
  render(<Upload drag />);

  expect(document.querySelector('[data-icon="icon-上传"]'))
    .toBeInTheDocument();
});

test("renders the four approved initial file states and picture cards", () => {
  render(<Upload listType="picture-card" defaultFileList={[
    { uid: "1", name: "ice.png", status: "uploading", percent: 28 },
    { uid: "2", name: "light.png", status: "success", percent: 100 },
    { uid: "3", name: "IMG_5216.PNG", status: "success" },
    { uid: "4", name: "cat.png", status: "error" },
  ]} />);
  const list = screen.getByRole("list", { name: "上传文件列表" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(4);
  expect(screen.getByRole("button", { name: "点击上传" })).toHaveClass("qizhi-upload__picture-trigger");
});

test("reuploads an initial error item that has no origin File", async () => {
  const user = userEvent.setup();
  render(<Upload defaultFileList={[
    { uid: "cat", name: "cat.png", status: "error" },
  ]} customRequest={({ onSuccess }) => onSuccess()} />);
  await user.click(screen.getByRole("button", { name: "重新上传 cat.png" }));
  expect(screen.getByText("cat.png").closest("[data-upload-file-item]"))
    .toHaveClass("is-success");
});
