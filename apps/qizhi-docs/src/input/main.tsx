import { createRoot } from "react-dom/client";
import "../demo-controls/demoSegmented.css";
import { InputDocsIsland } from "./InputDocsIsland";
const root = document.getElementById("component-input");
if (root) createRoot(root).render(<InputDocsIsland />);
