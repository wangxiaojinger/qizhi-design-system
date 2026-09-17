import { Select } from "@wangxiaojinger/qizhi-react";

const people = [
  { label: "张伟", value: "张伟" },
  { label: "王芳", value: "王芳" },
  { label: "李娜", value: "李娜" },
  { label: "刘洋", value: "刘洋" },
];

export default function RemoteDemo() {
  return (
    <Select
      className="select-docs-wide"
      mode="multiple"
      options={people}
      showSearch
      renderOption={(option) => (
        <>
          <span className="select-docs-avatar">
            {String(option.label).slice(0, 1)}
          </span>
          {option.label}
        </>
      )}
    />
  );
}
