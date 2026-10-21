import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { eyePath, profileDescription, type Regard } from "./index.js";
export function useProfile(regard: Regard): string {
  const profile = useSyncExternalStore(
    regard.subscribe,
    regard.getSnapshot,
    regard.getServerSnapshot,
  );
  useEffect(() => regard.start(), [regard]);
  return profile;
}
export interface RegardWidgetProps {
  regard: Regard;
  icon?: ReactNode;
  className?: string;
}
/** No generated IDs: safe inside a different surrounding client provider tree. */
export function RegardWidget({
  regard,
  icon,
  className = "",
}: RegardWidgetProps) {
  const profile = useProfile(regard);
  const selected = regard.config.profiles.find((p) => p.id === profile)!;
  const description = selected.description;
  return (
    <div className={`openregard-widget ${className}`}>
      <label className="openregard">
        {icon !== false && (
          <span className="openregard-icon" aria-hidden="true">
            {icon ?? (
              <svg viewBox="0 0 24 24" focusable="false">
                <path d={eyePath} fill="none" stroke="currentColor" />
              </svg>
            )}
          </span>
        )}
        <span className="openregard-label">{regard.config.controlLabel}</span>
        <select
          className="openregard-select"
          aria-description={description}
          aria-label={regard.config.controlLabel}
          title={profileDescription(regard)}
          value={profile}
          onChange={(event) => regard.setProfile(event.target.value)}
        >
          {regard.config.profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <span className="openregard-description">
        {selected.label}
        {description ? ` — ${description}` : ""}
      </span>
    </div>
  );
}
