import { createRoot } from "react-dom/client";
import { UploadDocsIsland } from "./UploadDocsIsland";

const root = document.getElementById("component-upload");
if (root) {
  root.dataset.reactIsland = "upload";
  createRoot(root).render(<UploadDocsIsland />);
}
