let currentAudio = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "playAudio") {
  (async () => {
    if (currentAudio) {
      currentAudio.pause();
    }

    try {
      currentAudio = new Audio(`data:audio/mp3;base64,${message.audio}`);
      await currentAudio.play();
      sendResponse({ success: true });
    } catch (error) {
      currentAudio = null;
      console.error("Playback failed:", error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true;
}

  if (message.action === 'stopAudio') {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    sendResponse({ success: true });
  }

  if (message.action === 'getSelectedText') {
    sendResponse({ text: window.getSelection().toString() });
    return true;
  }
});
