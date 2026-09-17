import { createRoot } from "react-dom/client";
import "../demo-controls/demoSegmented.css";
import { PaginationDocsIsland } from "./PaginationDocsIsland";

const root = document.getElementById("component-pagination");
if (root) createRoot(root).render(<PaginationDocsIsland />);
