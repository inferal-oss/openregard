export interface DisplayProfile {
  /** Stable, case-sensitive persisted identifier. */
  id: string;
  label: string;
  description?: string;
  tokens?: Record<`--${string}`, string>;
}
export interface DisplayConfig {
  version: 1;
  defaultProfile: string;
  storageKey: string;
  controlLabel: string;
  profiles: readonly DisplayProfile[];
  /** A data-* attribute. Defaults to data-regard-profile. */
  attribute?: string;
}
export interface StartOptions {
  root?: HTMLElement;
  window?: Window;
}
export interface Regard {
  readonly config: Readonly<DisplayConfig>;
  getSnapshot(): string;
  getServerSnapshot(): string;
  subscribe(listener: () => void): () => void;
  setProfile(id: string): void;
  /** Remove the saved preference and select the configured default. */
  reset(): void;
  /** Each call acquires a lease. Last cleanup restores the root and removes listeners. */
  start(options?: StartOptions): () => void;
}

/** Validate and take an immutable copy; importing or creating a controller is SSR-safe. */
export function validateConfig(input: DisplayConfig): Readonly<DisplayConfig> {
  const fail = (message: string): never => {
    throw new TypeError(`Open Regard: ${message}`);
  };
  if (!input || input.version !== 1) fail("config.version must be 1");
  for (const key of ["storageKey", "controlLabel"] as const)
    if (typeof input[key] !== "string" || !input[key].trim())
      fail(`${key} must be a nonempty string`);
  if (
    input.attribute !== undefined &&
    !/^data-[a-z][a-z0-9-]*$/.test(input.attribute)
  )
    fail("attribute must be a lowercase data-* attribute");
  if (!Array.isArray(input.profiles) || !input.profiles.length)
    fail("profiles must not be empty");
  const ids = new Set<string>();
  const profiles = input.profiles.map((p, index) => {
    if (
      !p ||
      typeof p.id !== "string" ||
      !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(p.id)
    )
      fail(
        `profiles[${index}].id must be 1–64 ASCII letters, digits, underscores or hyphens, starting with a letter or digit`,
      );
    if (ids.has(p.id)) fail(`duplicate profile id "${p.id}"`);
    ids.add(p.id);
    if (typeof p.label !== "string" || !p.label.trim())
      fail(`profile "${p.id}" needs a label`);
    if (p.description !== undefined && typeof p.description !== "string")
      fail(`profile "${p.id}" description must be a string`);
    if (
      p.tokens !== undefined &&
      (!p.tokens || typeof p.tokens !== "object" || Array.isArray(p.tokens))
    )
      fail(`profile "${p.id}" tokens must be an object`);
    for (const [key, value] of Object.entries(p.tokens ?? {})) {
      if (
        !/^--[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key) ||
        typeof value !== "string" ||
        !value.trim()
      )
        fail(`profile "${p.id}" has invalid token "${key}"`);
    }
    return Object.freeze({
      ...p,
      tokens: p.tokens ? Object.freeze({ ...p.tokens }) : undefined,
    });
  });
  if (!ids.has(input.defaultProfile))
    fail(`defaultProfile "${input.defaultProfile}" does not exist`);
  return Object.freeze({
    ...input,
    attribute: input.attribute ?? "data-regard-profile",
    profiles: Object.freeze(profiles),
  });
}

// A single owner per root/attribute prevents competing token cleanup. Widgets share a controller.
const owners = new WeakMap<HTMLElement, Map<string, Regard>>();
const channel = "openregard:profile";
export function createRegard(input: DisplayConfig): Regard {
  const config = validateConfig(input);
  const attribute = config.attribute!;
  const profiles = new Map(config.profiles.map((p) => [p.id, p]));
  const normalize = (id: string | null) =>
    profiles.has(id ?? "") ? id! : config.defaultProfile;
  let current = config.defaultProfile;
  const listeners = new Set<() => void>();
  let active:
    | { root: HTMLElement; win: Window; storage?: Storage; cleanup: () => void }
    | undefined;
  let leases = 0;
  const emit = () => {
    for (const listener of [...listeners]) listener();
  };
  let apply = () => {};
  function update(id: string | null) {
    const next = normalize(id);
    const changed = next !== current;
    current = next;
    apply();
    if (changed) emit();
  }
  function broadcast() {
    if (!active) return;
    const event = active.root.ownerDocument.createEvent("CustomEvent");
    event.initCustomEvent(channel, false, false, {
      storageKey: config.storageKey,
      id: current,
      source: regard,
    });
    active.win.dispatchEvent(event);
  }
  const regard: Regard = {
    config,
    getSnapshot: () => current,
    getServerSnapshot: () => config.defaultProfile,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setProfile(id) {
      if (!profiles.has(id))
        throw new RangeError(`Open Regard: unknown profile "${id}"`);
      update(id);
      try {
        active?.storage?.setItem(config.storageKey, current);
      } catch {
        /* In-memory selection remains usable. */
      }
      broadcast();
    },
    reset() {
      update(config.defaultProfile);
      try {
        active?.storage?.removeItem(config.storageKey);
      } catch {
        /* Best effort. */
      }
      broadcast();
    },
    start(options = {}) {
      const win =
        options.window ?? (typeof window !== "undefined" ? window : undefined);
      const root =
        options.root ?? active?.root ?? win?.document.documentElement;
      if (!win || !root)
        throw new Error(
          "Open Regard: start() requires a browser window and root",
        );
      if (root.ownerDocument.defaultView !== win)
        throw new Error(
          "Open Regard: root and window must belong to the same document",
        );
      if (active && (active.root !== root || active.win !== win))
        throw new Error(
          "Open Regard: controller is already started on another root",
        );
      if (!active) {
        const owned = owners.get(root) ?? new Map();
        if (owned.has(attribute))
          throw new Error(
            `Open Regard: ${attribute} already has a controller; share that controller between widgets`,
          );
        owners.set(root, owned);
        owned.set(attribute, regard);
        const originalAttribute = root.getAttribute(attribute);
        const tokens = [
          ...new Set(
            config.profiles.flatMap((p) => Object.keys(p.tokens ?? {})),
          ),
        ];
        const originals = tokens.map(
          (key) =>
            [
              key,
              root.style.getPropertyValue(key),
              root.style.getPropertyPriority(key),
            ] as const,
        );
        const restoreTokens = () => {
          for (const [key, value, priority] of originals) {
            if (value) root.style.setProperty(key, value, priority);
            else root.style.removeProperty(key);
          }
        };
        apply = () => {
          restoreTokens();
          root.setAttribute(attribute, current);
          for (const [key, value] of Object.entries(
            profiles.get(current)!.tokens ?? {},
          ))
            root.style.setProperty(key, value);
        };
        let storage: Storage | undefined;
        let saved: string | null = current;
        try {
          storage = win.localStorage;
          saved = storage.getItem(config.storageKey);
        } catch {
          /* Keep memory state. */
        }
        const onStorage = (event: StorageEvent) => {
          if (
            !storage ||
            event.storageArea !== storage ||
            (event.key !== config.storageKey && event.key !== null)
          )
            return;
          update(event.key === null ? null : event.newValue);
        };
        const onPage = (event: Event) => {
          const detail = (event as CustomEvent).detail;
          if (
            detail?.source !== regard &&
            detail?.storageKey === config.storageKey
          )
            update(detail.id);
        };
        win.addEventListener("storage", onStorage);
        win.addEventListener(channel, onPage);
        active = {
          root,
          win,
          storage,
          cleanup() {
            win.removeEventListener("storage", onStorage);
            win.removeEventListener(channel, onPage);
            restoreTokens();
            if (originalAttribute === null) root.removeAttribute(attribute);
            else root.setAttribute(attribute, originalAttribute);
            owned.delete(attribute);
            apply = () => {};
          },
        };
        update(saved);
      }
      leases++;
      let released = false;
      return () => {
        if (released) return;
        released = true;
        if (--leases === 0) {
          active!.cleanup();
          active = undefined;
        }
      };
    },
  };
  return regard;
}

/** Original decorative icon, with no third-party asset dependency. */
export const eyePath =
  "M2 12 Q12 0 22 12 Q12 24 2 12 Z M16 12 A4 4 0 1 1 8 12 A4 4 0 1 1 16 12";
export interface WidgetOptions {
  /** Additional classes on the outer .openregard-widget element. */
  className?: string;
  /** false hides the eye; a factory supplies your own decorative DOM element. */
  icon?: false | ((document: Document) => Element);
}
export function profileDescription(regard: Regard): string {
  return regard.config.profiles
    .map((p) => `${p.label}${p.description ? `: ${p.description}` : ""}`)
    .join(". ");
}
export function mountWidget(
  container: HTMLElement,
  regard: Regard,
  options: WidgetOptions = {},
) {
  const doc = container.ownerDocument;
  const label = doc.createElement("label");
  label.className = "openregard";
  if (options.icon !== false) {
    const icon =
      typeof options.icon === "function"
        ? options.icon(doc)
        : doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (typeof options.icon !== "function") {
      icon.setAttribute("viewBox", "0 0 24 24");
      const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", eyePath);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      icon.append(path);
    }
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    icon.classList.add("openregard-icon");
    label.append(icon);
  }
  const name = doc.createElement("span");
  name.className = "openregard-label";
  name.textContent = regard.config.controlLabel;
  const select = doc.createElement("select");
  // Explicit label also supports compact designs which visually hide the label.
  select.className = "openregard-select";
  select.setAttribute("aria-label", regard.config.controlLabel);
  for (const profile of regard.config.profiles) {
    const option = doc.createElement("option");
    option.value = profile.id;
    option.textContent = profile.label;
    select.append(option);
  }
  const description = doc.createElement("span");
  description.className = "openregard-description";
  const sync = () => {
    select.value = regard.getSnapshot();
    const profile = regard.config.profiles.find((p) => p.id === select.value)!;
    description.textContent = `${profile.label}${profile.description ? ` — ${profile.description}` : ""}`;
    if (profile.description)
      select.setAttribute("aria-description", profile.description);
    else select.removeAttribute("aria-description");
    select.title = profileDescription(regard);
  };
  const change = () => regard.setProfile(select.value);
  select.addEventListener("change", change);
  label.append(name, select);
  const wrapper = doc.createElement("div");
  wrapper.className = `openregard-widget ${options.className ?? ""}`.trim();
  wrapper.append(label, description);
  const stop = regard.start({ window: doc.defaultView! });
  const unsubscribe = regard.subscribe(sync);
  sync();
  container.append(wrapper);
  return {
    element: wrapper,
    select,
    destroy() {
      unsubscribe();
      select.removeEventListener("change", change);
      wrapper.remove();
      stop();
    },
  };
}
