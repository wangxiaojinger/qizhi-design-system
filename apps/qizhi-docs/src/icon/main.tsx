import { createRoot } from "react-dom/client";
import "../demo-controls/demoSegmented.css";
import { IconDocsIsland } from "./IconDocsIsland";

const root = document.getElementById("components-icon");
if (root) createRoot(root).render(<IconDocsIsland />);
