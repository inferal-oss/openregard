// These example profiles and tokens belong to this example, not to Open Regard.
window.regardConfig = {
  version: 1,
  defaultProfile: "standard",
  storageKey: "openregard-example",
  controlLabel: "Reading and display preferences",
  profiles: [
    {
      id: "standard",
      label: "Standard",
      description: "Use the original site presentation.",
    },
    {
      id: "roomy",
      label: "Room to read",
      description: "Larger text with more generous spacing.",
      tokens: { "--reading-size": "125%", "--reading-leading": "1.8" },
    },
    {
      id: "strong",
      label: "Larger type with stronger contrast and generous spacing",
      description:
        "A deliberately long label that remains available below the native select.",
      tokens: {
        "--reading-size": "150%",
        "--reading-leading": "1.8",
        "--page-ink": "#111",
        "--page-paper": "#fff",
        "--panel-ink": "#fff",
        "--panel-paper": "#111",
      },
    },
  ],
};
window.regard = OpenRegard.createRegard(window.regardConfig);
window.stopRegard = window.regard.start();
