import { useState } from "react";
import type { ReactNode } from "react";
import { AddIcon, Button, Input, Select } from "@wangxiaojinger/qizhi-react";
import type { SelectOption } from "@wangxiaojinger/qizhi-react";

const initialOptions: SelectOption[] = [
  { label: "北京", value: "北京" },
  { label: "上海", value: "上海" },
];

export default function DropdownRenderDemo() {
  const [options, setOptions] = useState(initialOptions);
  const [value, setValue] = useState("");

  const addOption = () => {
    if (value && !options.some((option) => option.value === value)) {
      setOptions([...options, { label: value, value }]);
    }
    setValue("");
  };

  const extendMenu = (menu: ReactNode) => (
    <>
      {menu}
      <div className="select-docs-extra">
        <Input
          size="small"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button type="text" size="small" icon={<AddIcon />} onClick={addOption}>
          添加
        </Button>
      </div>
    </>
  );

  return (
    <Select
      className="select-docs-medium"
      options={options}
      dropdownRender={extendMenu}
    />
  );
}
