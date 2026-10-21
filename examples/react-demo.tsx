import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DisplayWidget } from "openregard/display/react";
import type { DisplayController } from "openregard/display";
const regard = (window as unknown as { regard: DisplayController }).regard;
createRoot(document.getElementById("react-controls")!).render(
  <StrictMode>
    <DisplayWidget display={regard} className="demo-widget" />
  </StrictMode>,
);
(
  window as unknown as {
    OpenRegardDisplay: {
      mountDisplayWidget: (
        el: HTMLElement,
        r: DisplayController,
        options?: { className: string },
      ) => void;
    };
  }
).OpenRegardDisplay.mountDisplayWidget(
  document.getElementById("controls")!,
  regard,
  {
    className: "demo-widget",
  },
);
