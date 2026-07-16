const stopButton = document.getElementById("stopButton");
const speakButton = document.getElementById("speakButton");
const statusText = document.getElementById("statusText");

stopButton.disabled = true
stopButton.style.opacity = 0.5

function setPlayingState(isPlaying){
  stopButton.disabled = !isPlaying
  stopButton.style.opacity = isPlaying? 1 : 0.5
}
function isAudioPlaying(){
  return !stopButton.disabled
}

stopButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { action: 'stopAudio' });
  });
  setPlayingState(false)
  statusText.textContent = "Stopped.";
});

speakButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) {
      statusText.textContent = "No active tab found.";
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' }, (selResponse) => {
      if (chrome.runtime.lastError || !selResponse?.text?.trim()) {
        statusText.textContent = "No text selected. Highlight text on the page first.";
        return;
      }
      statusText.textContent = "Fetching audio...";
      chrome.runtime.sendMessage(
        { action: 'speakText', text: selResponse.text.trim(), tabId: tab.id },
        (res) => {
          if (chrome.runtime.lastError || !res?.success) {
            statusText.textContent = res?.error ?? "Failed to speak text.";
            return;
          }else if(res.success){
            setPlayingState(true)
            statusText.textContent = "Speaking..."
          };
        }
      );
    });
  });
});
