let currentAudio = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'playAudio') {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    currentAudio = new Audio(`data:audio/mp3;base64,${message.audio}`);
    currentAudio.play().catch(err => console.error('Playback failed:', err));
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
