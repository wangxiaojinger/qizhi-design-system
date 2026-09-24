import { expectTypeOf, test } from "vitest";
import { Form } from "./Form";
import type { FormFailedResult, FormInstance, FormNamePath, FormRule, FormValues } from "./Form.types";

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
