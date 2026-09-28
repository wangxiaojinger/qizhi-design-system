import { Button, Form, Input, Message, Steps } from "@wangxiaojinger/qizhi-react";

const items = [
  { title: "基本信息" },
  { title: "联系方式" },
  { title: "确认提交" },
];

const stepFields = [
  { key: "base", fields: ["name"] },
  { key: "contact", fields: ["email"] },
  { key: "confirm", fields: [] },
] as const;

export default function StepsDemo() {
  const [form] = Form.useForm();
  const wizard = Form.useSteps({ form, steps: stepFields });

  return (
    <div className="form-steps-demo">
      <Steps items={items} current={wizard.current} aria-label="创建服务步骤" />
      <Form form={form} onFinish={() => { Message.success("提交成功"); }}>
        <section hidden={wizard.current !== 1 && wizard.current !== 3} aria-label="基本信息">
          <Form.Item
            name="name"
            label="服务名称"
            required
            rules={[
              { required: true, message: "请输入服务名称" },
              { pattern: /^[a-z][a-z0-9-]*$/, message: "须以小写字母开头，仅支持小写字母、数字和短横线" },
            ]}
          >
            <Input />
          </Form.Item>
        </section>
        <section hidden={wizard.current !== 2 && wizard.current !== 3} aria-label="联系方式">
          <Form.Item
            name="email"
            label="联系邮箱"
            required
            rules={[
              { required: true, message: "请输入联系邮箱" },
              { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input type="email" />
          </Form.Item>
        </section>
        <div className="form-steps-demo__actions">
          <Button type="secondary" disabled={wizard.isFirst} onClick={wizard.previous}>上一步</Button>
          {wizard.isLast
            ? <Button type="primary" onClick={() => void wizard.submit()}>提交</Button>
            : <Button type="primary" onClick={() => void wizard.next()}>下一步</Button>}
        </div>
      </Form>
    </div>
  );
}
