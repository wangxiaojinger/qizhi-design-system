import { useState } from "react";
import { Button, Form, Input, Select } from "@wangxiaojinger/qizhi-react";

function ConditionalEndpoint() {
  const serviceType = Form.useWatch("serviceType");
  return serviceType === "remote" ? (
    <Form.Item
      name={["service", "endpoint"]}
      label="服务地址"
      preserve={false}
      rules={[{ required: true, message: "请输入服务地址" }]}
    >
      <Input aria-label="服务地址" allowClear={false} />
    </Form.Item>
  ) : null;
}

export default function ComplexFieldsDemo() {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState("");

  return (
    <Form
      form={form}
      aria-label="复杂表单联动"
      initialValues={{
        serviceType: "remote",
        service: { endpoint: "https://api.qizhi.cn" },
        credentials: { password: "qizhi-pass", confirmPassword: "qizhi-pass" },
        members: [{ name: "成员甲" }, { name: "成员乙" }],
      }}
      onFinish={(values) => setSubmitted(JSON.stringify(values))}
    >
      <Form.Item name="serviceType" label="服务类型">
        <Select
          aria-label="服务类型"
          options={[
            { label: "远程服务", value: "remote" },
            { label: "本地服务", value: "local" },
          ]}
        />
      </Form.Item>
      <ConditionalEndpoint />

      <Form.Item name={["credentials", "password"]} label="登录密码">
        <Input aria-label="登录密码" allowClear={false} />
      </Form.Item>
      <Form.Item
        name={["credentials", "confirmPassword"]}
        label="确认密码"
        dependencies={[["credentials", "password"]]}
        rules={[{
          validator: (value, values) => {
            const credentials = values.credentials as { password?: unknown } | undefined;
            if (value !== credentials?.password) throw new Error("两次输入的密码不一致");
          },
        }]}
      >
        <Input aria-label="确认密码" allowClear={false} />
      </Form.Item>

      <Form.List name="members">
        {(fields, operations) => (
          <div className="form-docs-complex-list">
            {fields.map((field, index) => (
              <div className="form-docs-complex-row" key={field.key}>
                <Form.Item name={["members", field.name, "name"]} label={`成员 ${index + 1}`}>
                  <Input aria-label={`成员 ${index + 1} 名称`} allowClear={false} />
                </Form.Item>
                <div className="form-docs-complex-actions">
                  <Button size="small" disabled={index === 0} onClick={() => operations.move(index, index - 1)} aria-label={`成员 ${index + 1} 上移`}>上移</Button>
                  <Button size="small" disabled={index === fields.length - 1} onClick={() => operations.move(index, index + 1)} aria-label={`成员 ${index + 1} 下移`}>下移</Button>
                  <Button size="small" status="danger" onClick={() => operations.remove(index)} aria-label={`删除成员 ${index + 1}`}>删除</Button>
                </div>
              </div>
            ))}
            <div className="form-docs-complex-toolbar">
              <Button type="secondary" onClick={() => operations.add({ name: "" })}>新增成员</Button>
              <Button onClick={() => form.setFieldErrors(["members", 0, "name"], ["成员名称已存在"])}>模拟成员错误</Button>
            </div>
          </div>
        )}
      </Form.List>

      <Button type="primary" htmlType="submit">提交复杂表单</Button>
      {submitted ? <output className="form-docs-submit-status" aria-label="复杂表单提交结果">{submitted}</output> : null}
    </Form>
  );
}
