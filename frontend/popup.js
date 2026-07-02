const stopButton = document.getElementById("stopButton");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

function updateSpeedText(rate) {
  speedValue.textContent = `${Number(rate).toFixed(1)}x`; // update displayed speed value to 1 decimal place for aesthetic purposes
}

chrome.storage.sync.get(["speechRate"], (result) => {
  const savedRate = result.speechRate || 1.0;

  speedSlider.value = savedRate;
  updateSpeedText(savedRate);
}); // if there's a saved speech rate in storage => use that saved rate, else default to 1.0x

speedSlider.addEventListener("input", () => {
  const selectedRate = Number(speedSlider.value);

  updateSpeedText(selectedRate);

  chrome.storage.sync.set({
    speechRate: selectedRate
  });

  console.log("Saved speech rate:", selectedRate); // debug
});

stopButton.addEventListener("click", () => {
  console.log("Stop button clicked");
  chrome.tts.stop();
});