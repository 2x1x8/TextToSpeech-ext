const stopButton = document.getElementById("stopButton");

stopButton.addEventListener("click", () => {
  chrome.tts.stop();
});

document.getElementById("stopButton");

<button id="stopButton">Stop Reading</button>;