import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import {
  createDisplay,
  type DisplayController,
  type DisplayConfig,
} from "./display.js";
import { RegardWidget, useProfile } from "./react.js";

type Source =
  | { config: DisplayConfig; display?: never }
  | { display: DisplayController; config?: never };
const DisplayContext = createContext<DisplayController | null>(null);

export type DisplayProviderProps = Source & { children: ReactNode };

/** Configure once and share the module across widgets and custom React UI. */
export function DisplayProvider({
  config,
  display,
  children,
}: DisplayProviderProps) {
  if (config && display)
    throw new TypeError(
      "Open Regard Display: pass config or display, not both",
    );
  const controller = useMemo(
    () => display ?? createDisplay(config!),
    [display, config],
  );
  useEffect(() => controller.start(), [controller]);
  return (
    <DisplayContext.Provider value={controller}>
      {children}
    </DisplayContext.Provider>
  );
}

export type DisplayWidgetProps = {
  icon?: ReactNode;
  className?: string;
} & (Source | { config?: never; display?: never });

/** Configure a standalone widget, supply a controller, or inherit a provider. */
export function DisplayWidget({
  config,
  display,
  icon,
  className,
}: DisplayWidgetProps) {
  const parent = useContext(DisplayContext);
  if (config && display)
    throw new TypeError(
      "Open Regard Display: pass config or display, not both",
    );
  if (config && parent)
    throw new TypeError(
      "Open Regard Display: configure DisplayProvider instead of a nested widget",
    );
  const own = useMemo(() => (config ? createDisplay(config) : null), [config]);
  const controller = display ?? own ?? parent;
  if (!controller)
    throw new TypeError(
      "Open Regard Display: provide config, display, or a DisplayProvider",
    );
  return <RegardWidget regard={controller} icon={icon} className={className} />;
}

/** Read the current profile from a provider or an explicit controller. */
export function useDisplayProfile(display?: DisplayController): string {
  const parent = useContext(DisplayContext);
  const controller = display ?? parent;
  if (!controller)
    throw new TypeError(
      "Open Regard Display: useDisplayProfile needs a controller or DisplayProvider",
    );
  return useProfile(controller);
}
