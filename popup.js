const stopButton = document.getElementById("stopButton");

console.log("popup.js loaded");

stopButton.addEventListener("click", () => {
  console.log("Stop button clicked");
  chrome.tts.stop();
});