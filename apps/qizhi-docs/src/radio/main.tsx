import { createRoot } from "react-dom/client";
import "../demo-controls/demoSegmented.css";
import { RadioDocsIsland } from "./RadioDocsIsland";

const root = document.getElementById("component-radio");
if (root) createRoot(root).render(<RadioDocsIsland />);
