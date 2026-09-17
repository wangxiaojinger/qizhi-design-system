import { createRoot } from "react-dom/client";
import "../demo-controls/demoSegmented.css";
import { TableDocsIsland } from "./TableDocsIsland";

const root = document.getElementById("component-table");
if (root) createRoot(root).render(<TableDocsIsland />);
