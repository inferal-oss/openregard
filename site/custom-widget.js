// A headless vanilla widget: the controller handles all preference behavior.
function mountProfileButtons(container, display) {
  const doc = container.ownerDocument;
  const group = doc.createElement("fieldset");
  group.className = "custom-display";
  const legend = doc.createElement("legend");
  legend.textContent = display.config.controlLabel;
  const choices = doc.createElement("div");
  choices.className = "custom-display-choices";
  const description = doc.createElement("p");
  const buttons = display.config.profiles.map((profile) => {
    const button = doc.createElement("button");
    button.type = "button";
    button.textContent = profile.label;
    button.dataset.profile = profile.id;
    if (profile.description)
      button.setAttribute("aria-description", profile.description);
    choices.append(button);
    return button;
  });
  const sync = () => {
    const current = display.getSnapshot();
    buttons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.profile === current),
      ),
    );
    const profile = display.config.profiles.find(
      (profile) => profile.id === current,
    );
    description.textContent = `${profile.label}${profile.description ? ` — ${profile.description}` : ""}`;
  };
  const change = (event) => {
    const button = event.target.closest?.("button[data-profile]");
    if (button && choices.contains(button))
      display.setProfile(button.dataset.profile);
  };
  const stop = display.start({ window: doc.defaultView });
  const unsubscribe = display.subscribe(sync);
  choices.addEventListener("click", change);
  group.append(legend, choices, description);
  container.append(group);
  sync();
  return {
    destroy() {
      choices.removeEventListener("click", change);
      unsubscribe();
      group.remove();
      stop();
    },
  };
}
