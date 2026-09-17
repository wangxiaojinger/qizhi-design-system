import { createRoot } from "react-dom/client";
import { PopconfirmDocsIsland } from "./PopconfirmDocsIsland";

const root = document.querySelector(
  '#component-popconfirm[data-react-island="popconfirm"]',
);

if (root) createRoot(root).render(<PopconfirmDocsIsland />);
