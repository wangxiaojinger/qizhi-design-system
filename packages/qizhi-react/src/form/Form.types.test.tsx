import { expect, expectTypeOf, test } from "vitest";
import { Form } from "./Form";
import type { FormDraftStorage, FormFailedResult, FormInstance, FormListField, FormListRowRule, FormListRule, FormNamePath, FormRule, FormRuleFailure, FormValidationException, FormValues } from "./Form.types";
import type {
  FormBulkEditBlockedCode,
  FormBulkEditBlockedError,
  FormBulkEditController,
  FormBulkEditFailure,
  FormBulkEditFieldState,
  FormBulkEditKey,
  FormBulkEditMode,
  FormBulkEditOptions,
  FormBulkEditPatch,
  FormBulkEditResult,
  FormBulkEditStatus,
} from "../index";

test("Form v2 对外类型覆盖字段管理、校验和提交", () => {
  function Example() {
    const [form] = Form.useForm();
    const rules: FormRule[] = [
      { required: true, message: "请输入服务名称" },
      { validator: async (value, values) => { expectTypeOf(value).toEqualTypeOf<unknown>(); expectTypeOf(values).toEqualTypeOf<FormValues>(); } },
    ];

    expectTypeOf(form).toEqualTypeOf<FormInstance>();

    return (
      <Form
        form={form}
        initialValues={{ serviceName: "" }}
        onValuesChange={(changedValues, allValues) => {
          expectTypeOf(changedValues).toEqualTypeOf<FormValues>();
          expectTypeOf(allValues).toEqualTypeOf<FormValues>();
        }}
        onFinish={(values) => { expectTypeOf(values).toEqualTypeOf<FormValues>(); }}
        onFinishFailed={(result) => { expectTypeOf(result).toEqualTypeOf<FormFailedResult>(); }}
        scrollToFirstError
      >
        <Form.Item name="serviceName" rules={rules} validateTrigger="onBlur" validateStatus="error" help="服务名称已存在">
          <input />
        </Form.Item>
      </Form>
    );
  }

  expectTypeOf(Example).toBeFunction();
});

test("Form v3 对外类型覆盖嵌套路径、动态列表和监听", () => {
  function Example() {
    const [form] = Form.useForm();
    const path: FormNamePath = ["user", "email"];
    const email = Form.useWatch(path, form);
    expectTypeOf(email).toEqualTypeOf<unknown>();
    return <Form form={form} preserve={false}>
      <Form.Item name={path} dependencies={[["user", "type"]]} preserve><input /></Form.Item>
      <Form.List name="members">{(fields, operations) => <>{fields.map((field) => <span key={field.key}>{field.name}</span>)}<button onClick={() => operations.add()}>新增</button></>}</Form.List>
    </Form>;
  }
  expectTypeOf(Example).toBeFunction();
});

test("Advanced Form.List 对外类型覆盖列表、整行校验与批量操作", () => {
  const listRule: FormListRule = {
    validator: async (rows, values) => {
      expectTypeOf(rows).toEqualTypeOf<unknown[]>();
      expectTypeOf(values).toEqualTypeOf<FormValues>();
    },
  };
  const rowRule: FormListRowRule = async (row, index, values) => {
    expectTypeOf(row).toEqualTypeOf<unknown>();
    expectTypeOf(index).toEqualTypeOf<number>();
    expectTypeOf(values).toEqualTypeOf<FormValues>();
  };

  const example = (
    <Form.List name="members" min={1} max={10} rules={[listRule]} rowRules={[rowRule]}>
      {(fields, operations, meta) => {
        operations.addMany([{ name: "A" }, { name: "B" }]);
        expectTypeOf(operations.canAdd(2)).toEqualTypeOf<boolean>();
        expectTypeOf(operations.canRemove([0, 1])).toEqualTypeOf<boolean>();
        expectTypeOf(fields).toEqualTypeOf<FormListField[]>();
        expectTypeOf(meta.errors).toEqualTypeOf<string[]>();
        return <Form.ErrorList errors={meta.errors} />;
      }}
    </Form.List>
  );

  expectTypeOf(example).not.toBeNever();
});

test("Form v4 对外类型覆盖异常分层和未保存修改", () => {
  const failure: FormRuleFailure = { type: "network", message: "服务暂不可用" };
  const exception: FormValidationException = { name: ["service", "region"], ...failure, type: "network" };
  expectTypeOf(exception).toMatchTypeOf<FormValidationException>();

  function DirtyState() {
    const [form] = Form.useForm();
    const dirty = Form.useDirty(form);
    form.isFieldsDirty([["service", "region"]]);
    form.markFieldsClean([["service", "region"]]);
    return <Form form={form} onValidationException={(current) => current.message}>{String(dirty)}</Form>;
  }

  expectTypeOf(DirtyState).toBeFunction();
});

test("Form Bulk Edit 对外类型覆盖混合值、差异补丁和结果回填", () => {
  function BulkEditState() {
    const [form] = Form.useForm();
    const options: FormBulkEditOptions<{ id: string; department: string }, string> = {
      form,
      records: [{ id: "1", department: "研发部" }],
      getRowKey: (record) => record.id,
      fields: ["department", ["profile", "remark"]],
    };
    const bulk = Form.useBulkEdit(options);
    expectTypeOf(bulk).toEqualTypeOf<FormBulkEditController<string>>();
    expectTypeOf(bulk.validate()).toEqualTypeOf<Promise<FormBulkEditPatch<string>>>();
    expectTypeOf(bulk.status).toEqualTypeOf<FormBulkEditStatus>();
    return <Form form={form} />;
  }

  expect(Form.useBulkEdit).toBeTypeOf("function");
  expectTypeOf(BulkEditState).toBeFunction();
  expectTypeOf<FormBulkEditKey>().toEqualTypeOf<string | number>();
  expectTypeOf<FormBulkEditMode>().toEqualTypeOf<"keep" | "set" | "clear">();
  expectTypeOf<FormBulkEditBlockedCode>().toEqualTypeOf<"no-changes" | "no-targets" | "source-changed">();
  expectTypeOf<FormBulkEditBlockedError>().toMatchTypeOf<Error>();
  expectTypeOf<FormBulkEditFieldState>().toHaveProperty("mixed");
  expectTypeOf<FormBulkEditFailure<string>>().toHaveProperty("message");
  expectTypeOf<FormBulkEditResult<string>>().toHaveProperty("succeededKeys");
});

test("Form Steps 对外类型覆盖步骤字段、切换和提交", () => {
  function Wizard() {
    const [form] = Form.useForm();
    const steps = Form.useSteps({
      form,
      initialStep: 1,
      steps: [
        { key: "base", fields: ["name"] },
        { key: "detail", fields: [["profile", "email"]] },
      ],
    });
    expectTypeOf(steps.current).toEqualTypeOf<number>();
    expectTypeOf(steps.next()).toEqualTypeOf<Promise<boolean>>();
    expectTypeOf(steps.goTo(2)).toEqualTypeOf<Promise<boolean>>();
    expectTypeOf(steps.submit()).toEqualTypeOf<Promise<boolean>>();
    return <Form form={form}>{steps.current}</Form>;
  }
  expectTypeOf(Wizard).toBeFunction();
});

test("Form Steps 对外类型支持受控步骤", () => {
  function ControlledWizard() {
    const [form] = Form.useForm();
    Form.useSteps({
      form,
      steps: [],
      current: 2,
      onCurrentChange: (next) => {
        expectTypeOf(next).toEqualTypeOf<number>();
      },
    });
    return <Form form={form} />;
  }
  expectTypeOf(ControlledWizard).toBeFunction();
});

test("Form Draft 对外类型要求显式存储与字段筛选", () => {
  const storage: FormDraftStorage = {
    load: async () => null,
    save: async (input) => ({
      status: "saved",
      record: {
        key: input.key,
        version: input.version,
        values: input.values,
        metadata: input.metadata,
        revision: "r1",
        updatedAt: "2026-09-24T00:00:00.000Z",
      },
    }),
    remove: async () => undefined,
  };

  function DraftState() {
    const [form] = Form.useForm();
    const draft = Form.useDraft({
      form,
      draftKey: "service:create:user-1",
      version: "v1",
      storage,
      selectValues: (values) => ({ name: values.name }),
    });
    expectTypeOf(draft.save()).toEqualTypeOf<Promise<boolean>>();
    return <Form form={form} />;
  }

  expectTypeOf(DraftState).toBeFunction();
});
