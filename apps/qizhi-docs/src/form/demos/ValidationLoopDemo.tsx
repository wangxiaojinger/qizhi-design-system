import { useState } from "react";
import { Button, Form, Input } from "@wangxiaojinger/qizhi-react";

export default function ValidationLoopDemo() {
  const [form] = Form.useForm();
  const [message, setMessage] = useState("");

  return (
    <Form
      form={form}
      aria-label="业务校验闭环表单"
      scrollToFirstError
      onValuesChange={() => setMessage("")}
      onFinish={(values) => {
        if (values.serviceName === "existing-service") {
          form.setFieldErrors("serviceName", ["服务名称已存在"]);
          return;
        }
        setMessage("校验通过，可以提交。");
      }}
    >
      <Form.Item
        name="serviceName"
        label="服务名称"
        required
        extra="输入 existing-service 可模拟后端返回名称重复错误。"
        rules={[
          { required: true, message: "请输入服务名称" },
          { pattern: /^[a-z][a-z0-9-]*$/, message: "须以小写字母开头，仅支持小写字母、数字和短横线" },
        ]}
      >
        <Input allowClear={false} placeholder="请输入" />
      </Form.Item>
      <Button type="primary" htmlType="submit">提交</Button>
      {message ? <span className="form-docs-submit-status" role="status">{message}</span> : null}
    </Form>
  );
}
