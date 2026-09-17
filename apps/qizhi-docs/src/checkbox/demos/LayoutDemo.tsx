import { Checkbox } from "@wangxiaojinger/qizhi-react";

const layoutStyles = `
  .checkbox-layout-demo {
    display: grid;
    grid-template-columns: repeat(3, minmax(96px, 1fr));
    gap: 12px 24px;
    width: min(100%, 480px);
  }

  @media (max-width: 480px) {
    .checkbox-layout-demo {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
  }
`;

const App = () => {
  return (
    <>
      <style>{layoutStyles}</style>
      <Checkbox.Group
        className="checkbox-layout-demo"
        defaultValue={[1, 2]}
        options={[
          { label: "选项 1", value: 1 },
          { label: "选项 2", value: 2, disabled: true },
          { label: "选项 3", value: 3 },
          { label: "选项 4", value: 4 },
          { label: "选项 5", value: 5 },
        ]}
      />
    </>
  );
};

export default App;
