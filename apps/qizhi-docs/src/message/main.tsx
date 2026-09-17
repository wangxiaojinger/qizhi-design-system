import { createRoot } from "react-dom/client";
import { MessageDocsIsland } from "./MessageDocsIsland";

const root = document.querySelector<HTMLElement>('#component-message[data-react-island="message"]');
if (root) createRoot(root).render(<MessageDocsIsland />);
