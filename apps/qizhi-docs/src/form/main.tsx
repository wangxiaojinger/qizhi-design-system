import { createRoot } from "react-dom/client";
import { FormDocsIsland } from "./FormDocsIsland";

const root = document.getElementById("component-form");
if (root) createRoot(root).render(<FormDocsIsland />);

