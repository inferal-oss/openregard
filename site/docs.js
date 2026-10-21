const controls = document.getElementById("docs-controls");
if (controls) OpenRegardDisplay.mountDisplayWidget(controls, window.regard);

const customControls = document.getElementById("custom-display-demo");
if (customControls) mountProfileButtons(customControls, window.regard);
