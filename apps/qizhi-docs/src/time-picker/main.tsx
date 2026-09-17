import { createRoot } from "react-dom/client";
import { TimePickerDocsIsland } from "./TimePickerDocsIsland";

const root = document.getElementById("component-time-picker");
if (root) createRoot(root).render(<TimePickerDocsIsland />);
