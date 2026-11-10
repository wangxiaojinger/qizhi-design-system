import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { DateTimeRangePicker } from "@wangxiaojinger/qizhi-react";

const start = Date.UTC(2026, 0, 1);
const end = Date.UTC(2026, 0, 4);

function Fixture() {
  const [value, setValue] = useState({ start, end });

  useEffect(() => {
    const update = () => setValue({ start: Date.UTC(2026, 0, 2), end });
    window.addEventListener("fixture:update-range", update);
    return () => window.removeEventListener("fixture:update-range", update);
  }, []);

  return <>
    <DateTimeRangePicker value={value} onChange={setValue} />
    <button type="button">下一控件</button>
  </>;
}

createRoot(document.getElementById("root")!).render(<Fixture />);
