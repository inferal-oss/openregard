import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RegardWidget } from "../src/react.js";
import type { Regard } from "../src/index.js";
const regard = (window as unknown as { regard: Regard }).regard;
createRoot(document.getElementById("react-controls")!).render(
  <StrictMode>
    <RegardWidget regard={regard} />
  </StrictMode>,
);
(
  window as unknown as {
    OpenRegard: { mountWidget: (el: HTMLElement, r: Regard) => void };
  }
).OpenRegard.mountWidget(document.getElementById("controls")!, regard);
