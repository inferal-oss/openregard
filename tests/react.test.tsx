import { act, StrictMode, createContext } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createRegard, type DisplayConfig } from "../src/index.js";
import { RegardWidget } from "../src/react.js";
const config: DisplayConfig = {
  version: 1,
  defaultProfile: "base",
  storageKey: "react-regard",
  controlLabel: "Reading preferences",
  profiles: [
    { id: "base", label: "Standard" },
    { id: "large", label: "Large", description: "Larger text" },
  ],
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("shares state across StrictMode widgets and cleans up on final unmount", () => {
  const r = createRegard(config);
  const view = render(
    <StrictMode>
      <RegardWidget regard={r} />
      <RegardWidget regard={r} icon={false} />
    </StrictMode>,
  );
  const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
  fireEvent.change(selects[0], { target: { value: "large" } });
  expect(selects.map((s) => s.value)).toEqual(["large", "large"]);
  view.unmount();
  expect(document.documentElement.hasAttribute("data-regard-profile")).toBe(
    false,
  );
});
it("hydrates saved preference from before-paint controller with extra client providers and no generated IDs", async () => {
  const server = createRegard(config);
  const client = createRegard(config);
  const container = document.createElement("div");
  document.body.append(container);
  container.innerHTML = renderToString(<RegardWidget regard={server} />);
  const select = container.querySelector("select")!;
  localStorage.setItem(config.storageKey, "large");
  const stop = client.start();
  expect(document.documentElement.dataset.regardProfile).toBe("large");
  const Context = createContext("");
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const recoverable = vi.fn();
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(
      container,
      <Context.Provider value="wrapper">
        <StrictMode>
          <RegardWidget regard={client} />
        </StrictMode>
      </Context.Provider>,
      { onRecoverableError: recoverable },
    );
  });
  expect(container.querySelector("select")).toBe(select);
  expect(select.value).toBe("large");
  expect(error).not.toHaveBeenCalled();
  expect(recoverable).not.toHaveBeenCalled();
  await act(async () => root.unmount());
  stop();
  container.remove();
});
