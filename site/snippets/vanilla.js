import { createDisplay, mountDisplayWidget } from "openregard/display";
import "openregard/display/style.css";

const display = createDisplay({
  version: 1,
  defaultProfile: "standard",
  storageKey: "my-site-view",
  controlLabel: "Choose your view",
  profiles: [
    { id: "standard", label: "Standard" },
    { id: "vision", label: "Vision", tokens: { "--reading-size": "125%" } },
  ],
});

mountDisplayWidget(container, display);
