import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Form } from "./Form";
import type { FormDraftController, FormDraftOptions, FormDraftRecord, FormDraftStorage, FormInstance, FormValues } from "./Form.types";

type DraftValues = FormValues & { name?: unknown; members?: unknown };
type DraftMetadata = { stepKey: string };

const record = (overrides: Partial<FormDraftRecord<DraftValues, DraftMetadata>> = {}): FormDraftRecord<DraftValues, DraftMetadata> => ({
  key: "service:create:user-1",
  version: "v1",
  revision: "r1",
  values: { name: "draft-name", members: [] },
  metadata: { stepKey: "contact" },
  updatedAt: "2026-09-24T00:00:00.000Z",
  ...overrides,
});

function createStorage(): FormDraftStorage<DraftValues, DraftMetadata> {
  return {
    load: vi.fn(async () => record()),
    save: vi.fn(async (input) => ({
      status: "saved" as const,
      record: record({
        values: input.values,
        metadata: input.metadata,
        revision: "r2",
      }),
    })),
    remove: vi.fn(async () => undefined),
  };
}

function renderDraft(options: Omit<FormDraftOptions<DraftValues, DraftMetadata>, "form">) {
  let form: FormInstance | undefined;
  let draft: FormDraftController<DraftValues, DraftMetadata> | undefined;

  function Harness({ currentOptions }: { currentOptions: Omit<FormDraftOptions<DraftValues, DraftMetadata>, "form"> }) {
    const [instance] = Form.useForm();
    form = instance;
    draft = Form.useDraft({ ...currentOptions, form: instance });
    return (
      <Form form={instance} initialValues={{ name: "initial", password: "secret", members: [{ name: "A" }] }}>
        <Form.Item name="name"><input aria-label="名称" /></Form.Item>
        <Form.Item name="password"><input aria-label="密码" /></Form.Item>
        <Form.List name="members">{(fields) => fields.map((field) => (
          <Form.Item key={field.key} name={["members", field.name, "name"]}>
            <input aria-label={`成员 ${field.name + 1}`} />
          </Form.Item>
        ))}</Form.List>
      </Form>
    );
  }

  const view = render(<Harness currentOptions={options} />);
  return {
    form: () => form as FormInstance,
    draft: () => draft as FormDraftController<DraftValues, DraftMetadata>,
    rerender: (nextOptions: Omit<FormDraftOptions<DraftValues, DraftMetadata>, "form">) => view.rerender(<Harness currentOptions={nextOptions} />),
    unmount: view.unmount,
  };
}

const defaultOptions = (storage: FormDraftStorage<DraftValues, DraftMetadata>): Omit<FormDraftOptions<DraftValues, DraftMetadata>, "form"> => ({
  draftKey: "service:create:user-1",
  version: "v1",
  storage,
  selectValues: (values) => ({ name: values.name, members: values.members }),
  getMetadata: () => ({ stepKey: "contact" }),
});

describe("Form.useDraft", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("显式读取、恢复和删除草稿，并恢复干净基线与 metadata", async () => {
    const storage = createStorage();
    const onRestoreMetadata = vi.fn();
    const harness = renderDraft({ ...defaultOptions(storage), onRestoreMetadata });

    await act(async () => {
      expect(await harness.draft().load()).toEqual(record());
    });
    expect(harness.draft().status).toBe("ready");

    act(() => {
      harness.form().setFieldValue("name", "changed");
      expect(harness.draft().restore()).toBe(true);
    });
    expect(harness.form().getFieldsValue()).toEqual({ name: "draft-name", password: "secret", members: [] });
    expect(harness.form().isFieldsDirty()).toBe(false);
    expect(onRestoreMetadata).toHaveBeenCalledWith({ stepKey: "contact" });

    await act(async () => {
      expect(await harness.draft().remove()).toBe(true);
    });
    expect(storage.remove).toHaveBeenCalledWith("service:create:user-1", "r1");
    expect(harness.draft().record).toBeNull();
    expect(harness.draft().status).toBe("idle");
  });

  it.each([
    ["version-mismatch" as const, record({ version: "v0" })],
    ["expired" as const, record({ expiresAt: "2020-01-01T00:00:00.000Z" })],
  ])("%s 草稿不会写入表单", async (status, remoteRecord) => {
    const storage = createStorage();
    vi.mocked(storage.load).mockResolvedValue(remoteRecord);
    const harness = renderDraft(defaultOptions(storage));

    await act(async () => {
      await harness.draft().load();
    });
    expect(harness.draft().status).toBe(status);
    expect(harness.draft().restore()).toBe(false);
    expect(harness.form().getFieldValue("name")).toBe("initial");
  });

  it("只保存筛选字段，并显式处理远端冲突", async () => {
    const storage = createStorage();
    const remote = record({ revision: "r2", values: { name: "remote", members: [] } });
    const harness = renderDraft(defaultOptions(storage));
    await act(async () => {
      await harness.draft().load();
    });
    act(() => {
      harness.form().setFieldValue("name", "safe-name");
      harness.form().setFieldValue("password", "new-secret");
    });
    vi.mocked(storage.save).mockResolvedValueOnce({ status: "conflict", remote });

    await act(async () => {
      expect(await harness.draft().save()).toBe(false);
    });
    expect(storage.save).toHaveBeenCalledWith({
      key: "service:create:user-1",
      version: "v1",
      values: { name: "safe-name", members: [{ name: "A" }] },
      metadata: { stepKey: "contact" },
      expectedRevision: "r1",
      force: undefined,
    });
    expect(harness.draft().status).toBe("conflict");
    expect(harness.draft().conflict).toEqual(remote);
    expect(harness.form().getFieldValue("password")).toBe("new-secret");

    act(() => expect(harness.draft().useRemote()).toBe(true));
    expect(harness.form().getFieldValue("name")).toBe("remote");
    expect(harness.draft().record?.revision).toBe("r2");

    vi.mocked(storage.save).mockResolvedValueOnce({ status: "conflict", remote: record({ revision: "r3" }) });
    await act(async () => {
      await harness.draft().save();
      expect(await harness.draft().overwrite()).toBe(true);
    });
    expect(storage.save).toHaveBeenLastCalledWith(expect.objectContaining({ force: true, expectedRevision: "r3" }));
    expect(harness.draft().status).toBe("saved");
  });

  it("适配器失败保留上次成功记录，重叠读取只接纳最新请求", async () => {
    const storage = createStorage();
    let resolveOld: ((value: FormDraftRecord<DraftValues, DraftMetadata>) => void) | undefined;
    vi.mocked(storage.load)
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce(record({ revision: "new", values: { name: "newest" } }));
    const harness = renderDraft(defaultOptions(storage));

    let oldRequest: Promise<FormDraftRecord<DraftValues, DraftMetadata> | null>;
    await act(async () => {
      oldRequest = harness.draft().load();
      await harness.draft().load();
    });
    expect(harness.draft().record?.revision).toBe("new");
    await act(async () => {
      resolveOld?.(record({ revision: "old", values: { name: "stale" } }));
      await oldRequest!;
    });
    expect(harness.draft().record?.revision).toBe("new");

    vi.mocked(storage.save).mockRejectedValueOnce(new Error("network unavailable"));
    await act(async () => {
      expect(await harness.draft().save()).toBe(false);
    });
    expect(harness.draft().status).toBe("error");
    expect(harness.draft().record?.revision).toBe("new");
  });

  it("可选自动保存只提交防抖窗口内最后一次筛选值，并在卸载时清理", async () => {
    vi.useFakeTimers();
    const storage = createStorage();
    const harness = renderDraft({ ...defaultOptions(storage), autoSave: { debounceMs: 1000 } });

    act(() => {
      harness.form().setFieldValue("name", "one");
      harness.form().setFieldValue("name", "two");
      harness.form().setFieldValue("name", "three");
      vi.advanceTimersByTime(999);
    });
    expect(storage.save).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(storage.save).toHaveBeenCalledOnce();
    expect(storage.save).toHaveBeenCalledWith(expect.objectContaining({ values: { name: "three", members: [{ name: "A" }] } }));

    act(() => harness.form().setFieldValue("name", "unmounted"));
    harness.unmount();
    await vi.advanceTimersByTimeAsync(1000);
    expect(storage.save).toHaveBeenCalledOnce();
  });

  it("默认关闭自动保存", async () => {
    vi.useFakeTimers();
    const storage = createStorage();
    const harness = renderDraft(defaultOptions(storage));
    act(() => harness.form().setFieldValue("name", "changed"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it("保存请求期间的新编辑仍保持脏状态", async () => {
    const storage = createStorage();
    let resolveSave: ((value: Awaited<ReturnType<FormDraftStorage<DraftValues, DraftMetadata>["save"]>>) => void) | undefined;
    vi.mocked(storage.save).mockImplementationOnce((input) => new Promise((resolve) => {
      resolveSave = resolve;
      expect(input.values.name).toBe("submitted");
    }));
    const harness = renderDraft(defaultOptions(storage));
    act(() => harness.form().setFieldValue("name", "submitted"));

    let saving: Promise<boolean>;
    await act(async () => {
      saving = harness.draft().save();
      harness.form().setFieldValue("name", "edited-after-submit");
      resolveSave?.({ status: "saved", record: record({ values: { name: "submitted", members: [{ name: "A" }] }, revision: "r2" }) });
      await saving;
    });

    expect(harness.form().getFieldValue("name")).toBe("edited-after-submit");
    expect(harness.form().isFieldsDirty(["name"])).toBe(true);
  });

  it("只把实际保存或恢复的叶子路径标为干净", async () => {
    const storage = createStorage();
    let form: FormInstance | undefined;
    let draft: FormDraftController<DraftValues, DraftMetadata> | undefined;
    function NestedHarness() {
      const [instance] = Form.useForm();
      form = instance;
      draft = Form.useDraft({
        ...defaultOptions(storage),
        form: instance,
        selectValues: (values) => ({ profile: { name: (values.profile as FormValues | undefined)?.name } }),
      });
      return <Form form={instance}>
        <Form.Item name={["profile", "name"]}><input /></Form.Item>
        <Form.Item name={["profile", "secret"]}><input /></Form.Item>
      </Form>;
    }
    render(<NestedHarness />);
    act(() => {
      form?.setFieldsValue({ profile: { name: "new-name", secret: "new-secret" } });
    });
    await act(async () => { await draft?.save(); });

    expect(form?.isFieldsDirty([["profile", "name"]])).toBe(false);
    expect(form?.isFieldsDirty([["profile", "secret"]])).toBe(true);

    vi.mocked(storage.load).mockResolvedValueOnce(record({ values: { profile: { name: "restored" } } }));
    await act(async () => { await draft?.load(); });
    act(() => { expect(draft?.restore()).toBe(true); });
    expect(form?.isFieldsDirty([["profile", "secret"]])).toBe(true);
  });

  it("运行时关闭自动保存会取消已经排队的保存", async () => {
    vi.useFakeTimers();
    const storage = createStorage();
    const enabled = { ...defaultOptions(storage), autoSave: { debounceMs: 1000 } };
    const harness = renderDraft(enabled);
    act(() => harness.form().setFieldValue("name", "queued"));
    harness.rerender(defaultOptions(storage));

    await vi.advanceTimersByTimeAsync(1000);
    expect(storage.save).not.toHaveBeenCalled();
  });
});
