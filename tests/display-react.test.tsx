import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { beforeEach, afterEach, expect, it } from "vitest";
import {
  DisplayWidget,
  DisplayProvider,
  useDisplayProfile,
} from "../src/display-react.js";
import { createDisplay, type DisplayConfig } from "../src/display.js";

const config: DisplayConfig = {
  version: 1,
  storageKey: "display-react-config",
  controlLabel: "Display",
  defaultProfile: "base",
  profiles: [
    { id: "base", label: "Standard" },
    { id: "vision", label: "Vision", tokens: { "--size": "125%" } },
  ],
};
beforeEach(() => localStorage.clear());
afterEach(() => cleanup());
it("configures a standalone widget and releases its root in StrictMode", () => {
  const view = render(
    <StrictMode>
      <DisplayWidget config={config} />
    </StrictMode>,
  );
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "vision" },
  });
  expect(document.documentElement.style.getPropertyValue("--size")).toBe(
    "125%",
  );
  expect(localStorage.getItem(config.storageKey)).toBe("vision");
  view.unmount();
  expect(document.documentElement.style.getPropertyValue("--size")).toBe("");
});
it("shares provider configuration across controls and the profile hook", () => {
  function Value() {
    return <output>{useDisplayProfile()}</output>;
  }
  const view = render(
    <StrictMode>
      <DisplayProvider config={config}>
        <DisplayWidget />
        <DisplayWidget icon={false} />
        <Value />
      </DisplayProvider>
    </StrictMode>,
  );
  const controls = screen.getAllByRole("combobox");
  fireEvent.change(controls[0], { target: { value: "vision" } });
  expect((controls[1] as HTMLSelectElement).value).toBe("vision");
  expect(screen.getByRole("status").textContent).toBe("vision");
  view.unmount();
  expect(document.documentElement.hasAttribute("data-regard-profile")).toBe(
    false,
  );
});
it("accepts a prepaint controller and remains server-renderable", () => {
  const display = createDisplay(config);
  const stop = display.start();
  display.setProfile("vision");
  try {
    const view = render(
      <DisplayProvider display={display}>
        <DisplayWidget />
      </DisplayProvider>,
    );
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
      "vision",
    );
    view.unmount();
    expect(document.documentElement.dataset.regardProfile).toBe("vision");
    expect(renderToString(<DisplayWidget config={config} />)).toContain(
      'value="base"',
    );
  } finally {
    stop();
  }
});
it("releases the previous controller when React configuration changes", () => {
  const view = render(<DisplayWidget config={config} />);
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "vision" },
  });
  const next = { ...config, profiles: [{ id: "base", label: "Default" }] };
  view.rerender(<DisplayWidget config={next} />);
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
    "base",
  );
  expect(document.documentElement.style.getPropertyValue("--size")).toBe("");
  view.unmount();
});
it("diagnoses a missing configuration source", () => {
  expect(() => renderToString(<DisplayWidget />)).toThrow(
    "provide config, display, or a DisplayProvider",
  );
});
