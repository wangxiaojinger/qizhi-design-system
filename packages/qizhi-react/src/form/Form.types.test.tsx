import { expect, expectTypeOf, test } from "vitest";
import { Form } from "./Form";
import type { FormFailedResult, FormInstance, FormNamePath, FormRule, FormRuleFailure, FormValidationException, FormValues } from "./Form.types";
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
