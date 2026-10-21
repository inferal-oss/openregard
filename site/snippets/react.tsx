import { DisplayWidget } from "openregard/display/react";
import "openregard/display/style.css";

const config = {
  version: 1 as const,
  defaultProfile: "standard",
  storageKey: "my-site-view",
  controlLabel: "Choose your view",
  profiles: [
    { id: "standard", label: "Standard" },
    { id: "vision", label: "Vision", tokens: { "--reading-size": "125%" } },
  ],
};

export function Settings() {
  return <DisplayWidget config={config} />;
}
