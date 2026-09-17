import { createRoot } from "react-dom/client";
import { ConfigPopconfirmIsland } from "./ConfigPopconfirmIsland";

const root = document.querySelector<HTMLElement>(
  '[data-react-island="config-popconfirm"]',
);

if (root) createRoot(root).render(<ConfigPopconfirmIsland />);
