import { render } from "@testing-library/react";
import { CodeHighlight } from "./CodeHighlight";

const source = `// QIZHI React example
import { Button, Space } from "@wangxiaojinger/qizhi-react";

const App = () => (
  <Space size="large">
    <Button type="primary" loading={false}>提交</Button>
    <button aria-label="原生按钮">取消</button>
  </Space>
);

export default App;`;

it("highlights the shared TSX syntax contract", () => {
  const { container } = render(<CodeHighlight source={source} />);

  expect(container.querySelector(".qizhi-code-token--comment")).toHaveTextContent("QIZHI React example");
  expect([...container.querySelectorAll(".qizhi-code-token--component")].some((node) => node.textContent === "Button")).toBe(true);
  expect([...container.querySelectorAll(".qizhi-code-token--tag")].some((node) => node.textContent === "button")).toBe(true);
  expect([...container.querySelectorAll(".qizhi-code-token--property")].some((node) => node.textContent === "loading")).toBe(true);
  expect([...container.querySelectorAll(".qizhi-code-token--attribute-value")].some((node) => node.textContent === "primary")).toBe(true);
  expect(container.querySelector(".qizhi-code-token--keyword")).toHaveTextContent("import");
  expect(container.querySelector(".qizhi-code-token--string")).toHaveTextContent("@wangxiaojinger/qizhi-react");
  expect(container.querySelector(".qizhi-code-token--boolean")).toHaveTextContent("false");
  expect([...container.querySelectorAll(".qizhi-code-token--function")].some((node) => node.textContent === "App")).toBe(true);
  expect([...container.querySelectorAll(".qizhi-code-token--operator")].some((node) => node.textContent === "=>")).toBe(true);
  expect([...container.querySelectorAll(".qizhi-code-token--punctuation")].some((node) => node.textContent === "{")).toBe(true);
});

it("preserves the original source as readable code text", () => {
  const { container } = render(<CodeHighlight source={source} />);

  expect(container.querySelector("code")?.textContent).toBe(source);
});
