import { createRoot } from "react-dom/client";
import { AvatarDocsIsland } from "./AvatarDocsIsland";

const root = document.getElementById("component-avatar");
if (root) createRoot(root).render(<AvatarDocsIsland />);
