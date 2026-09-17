import { useEffect, useRef, useState } from "react";
import { AddIcon, Button, Space } from "@wangxiaojinger/qizhi-react";

const App = () => {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => { setLoading(true); timer.current = setTimeout(() => setLoading(false), 1600); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <div className="button-loading-demo">
      <Space size="large" className="button-loading-grid">
        <Button type="primary" loading>加载中</Button>
        <Button loading>加载中</Button>
        <Button type="dashed" loading>加载中</Button>
        <Button type="primary" loading aria-label="加载中" />
        <Button loading aria-label="加载中" />
        <Button type="dashed" loading aria-label="加载中" />
      </Space>
      <Space size="large" className="button-loading-actions">
        <Button type="primary" loading={loading} onClick={start}>点击加载</Button>
        <Button type="primary" icon={<AddIcon />} loading={loading} onClick={start}>点击加载</Button>
      </Space>
      <Button type="primary" loading={loading} onClick={start}>搜索</Button>
    </div>
  );
};

export default App;
