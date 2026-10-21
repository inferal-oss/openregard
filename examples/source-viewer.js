// Only the demo's source viewer uses this script. It is not part of the core widget.
for (const viewer of document.querySelectorAll("[data-source-viewer]")) {
  const tabs = [...viewer.querySelectorAll('[role="tab"]')];
  const panels = [...viewer.querySelectorAll("[data-source-panel]")];
  function activate(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
      panel.setAttribute("role", "tabpanel");
    });
    if (focus) tabs[index].focus();
  }
  viewer.querySelector("[data-source-tabs]").hidden = false;
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(index));
    tab.addEventListener("keydown", (event) => {
      const keys = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      if (Object.hasOwn(keys, event.key)) {
        event.preventDefault();
        activate(keys[event.key], true);
      }
    });
  });
  for (const button of viewer.querySelectorAll("[data-copy-source]"))
    button.addEventListener("click", async () => {
      const panel = button.closest("[data-source-panel]");
      const status = panel.querySelector('[role="status"]');
      try {
        await navigator.clipboard.writeText(
          panel.querySelector("code").textContent,
        );
        status.textContent = "Source copied.";
      } catch {
        status.textContent = "Select the code below to copy it.";
      }
    });
  activate(0);
}
