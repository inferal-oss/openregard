import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  createRegard,
  mountWidget,
  validateConfig,
  type DisplayConfig,
} from "../src/index.js";
export const config: DisplayConfig = {
  version: 1,
  storageKey: "test-regard",
  controlLabel: "Display settings",
  defaultProfile: "base",
  profiles: [
    { id: "base", label: "Standard" },
    {
      id: "large",
      label: "Larger type",
      description: "More room for reading",
      tokens: { "--size": "150%", "--ink": "#111" },
    },
    { id: "night", label: "Night", tokens: { "--ink": "#fff" } },
  ],
};
const cleanups: (() => void)[] = [];
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanups
    .splice(0)
    .reverse()
    .forEach((f) => f());
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("style");
  vi.restoreAllMocks();
});
function start(c = config, options = {}) {
  const r = createRegard(c);
  cleanups.push(r.start(options));
  return r;
}
it.each([
  [{ ...config, version: 2 }, "version"],
  [{ ...config, profiles: [] }, "empty"],
  [
    { ...config, profiles: [config.profiles[0], config.profiles[0]] },
    "duplicate",
  ],
  [{ ...config, defaultProfile: "gone" }, "does not exist"],
  [{ ...config, controlLabel: " " }, "controlLabel"],
  [{ ...config, attribute: "onclick" }, "data-"],
  [{ ...config, profiles: [{ id: "bad id", label: "bad" }] }, "id"],
  [{ ...config, profiles: [{ id: "base", label: "" }] }, "label"],
  [
    {
      ...config,
      profiles: [{ id: "base", label: "Base", tokens: { color: "red" } }],
    },
    "token",
  ],
])("rejects invalid configuration with diagnostics", (value, message) => {
  expect(() => validateConfig(value as DisplayConfig)).toThrow(message);
});
it("copies and freezes config to prevent mutation after validation", () => {
  const input = structuredClone(config);
  const r = createRegard(input);
  input.profiles[1].tokens!["--size"] = "9px";
  expect(r.config.profiles[1].tokens!["--size"]).toBe("150%");
  expect(Object.isFrozen(r.config.profiles)).toBe(true);
});
it("restores preexisting token values and priorities on switches and final cleanup", () => {
  const root = document.documentElement;
  root.style.setProperty("--size", "100%", "important");
  root.setAttribute("data-regard-profile", "original");
  const r = createRegard(config);
  const stop = r.start();
  const second = r.start();
  r.setProfile("large");
  expect(root.style.getPropertyValue("--size")).toBe("150%");
  r.setProfile("night");
  expect(root.style.getPropertyValue("--size")).toBe("100%");
  expect(root.style.getPropertyPriority("--size")).toBe("important");
  r.setProfile("base");
  expect(root.style.getPropertyValue("--ink")).toBe("");
  stop();
  expect(root.dataset.regardProfile).toBe("base");
  second();
  second();
  expect(root.dataset.regardProfile).toBe("original");
  root.removeAttribute("data-regard-profile");
});
it("loads persistence and falls back for removed IDs, including reset", () => {
  localStorage.setItem(config.storageKey, "large");
  const r = start();
  expect(r.getSnapshot()).toBe("large");
  r.setProfile("night");
  expect(localStorage.getItem(config.storageKey)).toBe("night");
  r.reset();
  expect(r.getSnapshot()).toBe("base");
  expect(localStorage.getItem(config.storageKey)).toBeNull();
  expect(() => r.setProfile("typo")).toThrow("unknown profile");
});
it("unknown persisted ID falls back to default", () => {
  localStorage.setItem(config.storageKey, "deleted");
  expect(start().getSnapshot()).toBe("base");
});
it("handles storage events, clear, unknown values and ignores other storage areas/keys", () => {
  const r = start();
  const send = (
    key: string | null,
    newValue: string | null,
    storageArea = localStorage,
  ) =>
    window.dispatchEvent(
      new StorageEvent("storage", { key, newValue, storageArea }),
    );
  send(config.storageKey, "large");
  expect(r.getSnapshot()).toBe("large");
  send("unrelated", "night");
  send(config.storageKey, "night", sessionStorage);
  expect(r.getSnapshot()).toBe("large");
  send(config.storageKey, "deleted");
  expect(r.getSnapshot()).toBe("base");
  send(config.storageKey, "night");
  send(null, null);
  expect(r.getSnapshot()).toBe("base");
});
it("keeps memory and same-page controllers working when storage reads/writes fail", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw Error("blocked");
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
    throw Error("blocked");
  });
  const a = start();
  const root = document.createElement("section");
  document.body.append(root);
  const b = start(config, { root });
  a.setProfile("large");
  expect(b.getSnapshot()).toBe("large");
  b.reset();
  expect(a.getSnapshot()).toBe("base");
});
it("works when accessing localStorage itself throws", () => {
  vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
    throw Error("blocked");
  });
  const r = start();
  r.setProfile("large");
  expect(r.getSnapshot()).toBe("large");
});
it("shares multiple widgets without replacing selects or losing focus", () => {
  const r = createRegard(config);
  const a = mountWidget(document.body, r);
  const b = mountWidget(document.body, r, { icon: false });
  cleanups.push(() => {
    a.destroy();
    b.destroy();
  });
  a.select.focus();
  a.select.value = "large";
  a.select.dispatchEvent(new Event("change"));
  expect(document.activeElement).toBe(a.select);
  expect(b.select.value).toBe("large");
  expect(a.select.getAttribute("aria-label")).toBe(config.controlLabel);
  expect(a.select.getAttribute("aria-description")).toBe(
    "More room for reading",
  );
  expect(b.element.querySelector("svg")).toBeNull();
});
it("rejects conflicting controllers and permits ownership after cleanup", () => {
  const a = createRegard(config);
  const stop = a.start();
  expect(() => createRegard(config).start()).toThrow(
    "already has a controller",
  );
  stop();
  const b = createRegard(config);
  cleanups.push(b.start());
});
it("supports legacy CSS hooks and custom root without changing outside content", () => {
  const root = document.createElement("main");
  document.body.append(root);
  const r = start({ ...config, attribute: "data-display" }, { root });
  r.setProfile("large");
  expect(root.dataset.display).toBe("large");
  expect(document.documentElement.hasAttribute("data-display")).toBe(false);
});
it("stops notifications after cleanup", () => {
  const r = createRegard(config);
  const stop = r.start();
  const fn = vi.fn();
  const unsub = r.subscribe(fn);
  stop();
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: config.storageKey,
      newValue: "large",
      storageArea: localStorage,
    }),
  );
  expect(fn).not.toHaveBeenCalled();
  unsub();
});
