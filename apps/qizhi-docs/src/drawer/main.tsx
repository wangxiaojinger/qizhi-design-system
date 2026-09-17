import { createRoot } from "react-dom/client";
import { DrawerDocsIsland } from "./DrawerDocsIsland";

const root = document.getElementById("component-drawer");
if (root) {
  root.dataset.reactIsland = "drawer";
  createRoot(root).render(<DrawerDocsIsland />);
}
