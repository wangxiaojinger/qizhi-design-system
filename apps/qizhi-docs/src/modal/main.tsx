import { createRoot } from "react-dom/client";
import { ModalDocsIsland } from "./ModalDocsIsland";

const root = document.querySelector<HTMLElement>('#component-modal[data-react-island="modal"]');
if (root) createRoot(root).render(<ModalDocsIsland />);
