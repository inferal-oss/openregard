/** Display is Open Regard's first module. The root API remains compatible. */
export {
  createRegard as createDisplay,
  mountWidget as mountDisplayWidget,
  validateConfig as validateDisplayConfig,
} from "./index.js";
export type {
  Regard as DisplayController,
  DisplayConfig,
  DisplayProfile,
  StartOptions,
  WidgetOptions,
} from "./index.js";
