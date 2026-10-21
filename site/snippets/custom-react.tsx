import { useDisplayProfile } from "openregard/display/react";
import type { DisplayController } from "openregard/display";

export function ProfileButtons({ display }: { display: DisplayController }) {
  // Reuses the library's subscription, SSR snapshot and lifecycle handling.
  const current = useDisplayProfile(display);
  const selected = display.config.profiles.find((p) => p.id === current)!;
  return (
    <fieldset className="custom-display">
      <legend>{display.config.controlLabel}</legend>
      <div className="custom-display-choices">
        {display.config.profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            aria-pressed={profile.id === current}
            aria-description={profile.description}
            onClick={() => display.setProfile(profile.id)}
          >
            {profile.label}
          </button>
        ))}
      </div>
      <p>
        {selected.label}
        {selected.description ? ` — ${selected.description}` : ""}
      </p>
    </fieldset>
  );
}
// <ProfileButtons display={display} />
// Reuse the same createDisplay(config) instance as the rest of your app.
