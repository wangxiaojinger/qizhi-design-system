import { Button, Form, Input } from "@wangxiaojinger/qizhi-react";

interface RuleRow {
  name: string;
  start: string;
  end: string;
  aliases: Array<{ value: string }>;
}

const createRow = (name = ""): RuleRow => ({ name, start: "1", end: "2", aliases: [] });

export default function AdvancedListDemo() {
  const [form] = Form.useForm();
  return (
    <Form form={form} aria-label="高级动态列表" initialValues={{ members: [createRow("成员甲")] }}>
      <Form.List
        name="members"
        min={1}
        max={10}
        rules={[{
          validator: (rows) => {
            const names = rows.map((row) => (row as RuleRow).name).filter(Boolean);
            return new Set(names).size === names.length ? undefined : { type: "field", message: "成员名称不能重复" };
          },
        }]}
        rowRules={[(row) => {
          const current = row as RuleRow;
          return Number(current.start) < Number(current.end) ? undefined : { type: "field", message: "开始值必须小于结束值" };
        }]}
      >
        {(fields, operations, meta) => <div className="form-advanced-list">
          {fields.map((field, index) => <div className="form-advanced-list__row" key={field.key}>
            <div className="form-advanced-list__fields">
              <Form.Item name={["members", field.name, "name"]} label={`成员 ${index + 1}`} rules={[{ required: true, message: "请输入成员名称" }]}>
                <Input aria-label={`第 ${index + 1} 行名称`} allowClear={false} />
              </Form.Item>
              <Form.Item name={["members", field.name, "start"]} label="开始值"><Input aria-label={`第 ${index + 1} 行开始值`} allowClear={false} /></Form.Item>
              <Form.Item name={["members", field.name, "end"]} label="结束值"><Input aria-label={`第 ${index + 1} 行结束值`} allowClear={false} /></Form.Item>
            </div>
            <div className="form-advanced-list__actions">
              <Button size="small" disabled={index === 0} onClick={() => operations.move(index, index - 1)} aria-label={`第 ${index + 1} 行上移`}>上移</Button>
              <Button size="small" status="danger" disabled={!operations.canRemove(index)} onClick={() => operations.remove(index)} aria-label={`删除第 ${index + 1} 行`}>删除</Button>
            </div>
            <Form.ErrorList errors={field.errors} />
          </div>)}
          <div className="form-advanced-list__toolbar">
            <Button type="secondary" disabled={!operations.canAdd()} onClick={() => operations.add(createRow())}>新增 1 项</Button>
            <Button type="secondary" disabled={!operations.canAdd(2)} onClick={() => operations.addMany([createRow("成员乙"), createRow("成员丙")])}>批量新增 2 项</Button>
            <Button onClick={() => { void form.validateFields().catch(() => undefined); }}>校验高级列表</Button>
          </div>
          <Form.ErrorList errors={meta.errors} />
        </div>}
      </Form.List>
    </Form>
  );
}
