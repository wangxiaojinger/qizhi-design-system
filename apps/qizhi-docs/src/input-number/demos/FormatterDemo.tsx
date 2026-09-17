import { InputNumber } from "@wangxiaojinger/qizhi-react";

const parser = (value: string) => value.replaceAll(",", "");
const withThousands = (value: number | string | undefined) =>
  String(value ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function FormatterDemo() {
  return (
    <div className="input-number-demo-row">
      <InputNumber
        defaultValue={12000}
        step={1000}
        prefix="¥"
        parser={parser}
        formatter={(value) => withThousands(value)}
        aria-label="货币格式化"
      />
      <InputNumber
        defaultValue={12000}
        step={1000}
        prefix="¥"
        parser={parser}
        formatter={(value, { userTyping, input }) => userTyping ? input : withThousands(value)}
        aria-label="输入完成后格式化"
      />
    </div>
  );
}
