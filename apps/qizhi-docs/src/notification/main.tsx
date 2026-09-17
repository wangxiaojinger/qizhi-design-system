import { createRoot } from "react-dom/client";
import { NotificationDocsIsland } from "./NotificationDocsIsland";

const root = document.querySelector<HTMLElement>(
  '#component-notification[data-react-island="notification"]',
);
if (root) createRoot(root).render(<NotificationDocsIsland />);
