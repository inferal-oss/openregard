OpenRegardDisplay.mountDisplayWidget(
  document.getElementById("site-controls"),
  window.regard,
);
OpenRegardDisplay.mountDisplayWidget(
  document.getElementById("site-controls-secondary"),
  window.regard,
  { icon: false },
);
document
  .getElementById("reset-preference")
  .addEventListener("click", () => window.regard.reset());
const copy = document.getElementById("copy-install");
copy.addEventListener("click", async () => {
  const status = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText("npm install openregard");
    status.textContent = "Install command copied.";
  } catch {
    status.textContent = "Copy this command: npm install openregard";
  }
});

const framework = document.getElementById("quickstart-framework");
framework.addEventListener("change", () => {
  document.querySelectorAll("[data-quickstart-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.quickstartPanel !== framework.value;
  });
});
