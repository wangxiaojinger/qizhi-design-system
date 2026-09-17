import { createRoot } from "react-dom/client";
import { AlertDocsIsland } from "./AlertDocsIsland";

const root = document.querySelector<HTMLElement>(
  '#component-alert[data-react-island="alert"]',
);
if (root) createRoot(root).render(<AlertDocsIsland />);
