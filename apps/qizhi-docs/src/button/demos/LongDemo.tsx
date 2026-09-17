import { Button } from "@wangxiaojinger/qizhi-react";

const App = () => {
  return (
    <div className="button-long-demo__inner">
      <Button type="primary" long>主要按钮</Button>
      <Button long>次要按钮</Button>
      <Button type="dashed" long>虚线按钮</Button>
      <Button type="text" long>文本按钮</Button>
    </div>
  );
};

export default App;
