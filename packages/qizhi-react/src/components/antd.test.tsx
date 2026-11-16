import { Button as AntButton, Form as AntForm, Input as AntInput, Table as AntTable, Tabs as AntTabs } from "antd";
import { expect, it } from "vitest";
import { Button, Form, Input, Table, Tabs } from "./antd";

it("exports reviewed Ant Design primitives by identity", () => {
  expect(Button).toBe(AntButton);
  expect(Form).toBe(AntForm);
  expect(Input).toBe(AntInput);
  expect(Table).toBe(AntTable);
  expect(Tabs).toBe(AntTabs);
});
