import { Button, Space, type ButtonStatus } from "@wangxiaojinger/qizhi-react";

const statuses: ButtonStatus[] = ["warning", "danger", "success"];

const App = () => {
  return (
    <div className="button-status-demo">
      {statuses.map((status) => (
        <Space size="large" key={status}>
          <Button type="primary" status={status}>{status}</Button>
          <Button status={status}>{status}</Button>
          <Button type="text" status={status}>{status}</Button>
        </Space>
      ))}
    </div>
  );
};

export default App;
