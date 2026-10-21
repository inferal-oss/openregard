import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RegardWidget } from "openregard/react";
import type { Regard } from "openregard";
const regard = (window as unknown as { regard: Regard }).regard;
createRoot(document.getElementById("react-controls")!).render(
  <StrictMode>
    <RegardWidget regard={regard} className="demo-widget" />
  </StrictMode>,
);
(
  window as unknown as {
    OpenRegard: {
      mountWidget: (
        el: HTMLElement,
        r: Regard,
        options?: { className: string },
      ) => void;
    };
  }
).OpenRegard.mountWidget(document.getElementById("controls")!, regard, {
  className: "demo-widget",
});
