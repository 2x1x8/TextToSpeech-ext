const DEFAULT_LANGUAGE = "en";
async function fetchAudio(text, lang) {
  try {
    const response = await fetch("http://localhost:3000/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        language: lang
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data?.error?.message ?? data?.error ?? "Unable to generate audio."
      };
    }

    if (typeof data.audioContent !== "string" || !data.audioContent) {
      return {
        success: false,
        error: "The TTS service returned no audio."
      };
    }

    return {
      success: true,
      audioContent: data.audioContent
    };
  } catch (error) {
    return {
      success: false,
      error: error.message ?? "Could not reach the TTS server."
    };
  }
}
async function detectLanguage(tabid) {
  const language = await chrome.tabs.detectLanguage(tabid)
  return language === "und"? DEFAULT_LANGUAGE : language;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read-selected-text",
    title: "Read selected text",
    contexts: ["selection"]
  });
});
// when extension is reloaded/installed, create a right-click menu item named "Read selected text" (ONLY IF user highlight/select text)


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "read-selected-text" || !tab?.id) return;

  (async () => {
    try {
      const selectedText = info.selectionText?.trim();

      if (!selectedText) return;

      const detectedLanguage = await detectLanguage(tab.id);
      const audio = await fetchAudio(selectedText, detectedLanguage);

      if (!audio.success) {
        console.error("TTS request failed:", audio.error);
        return;
      }

      const playback = await chrome.tabs.sendMessage(tab.id, {
        action: "playAudio",
        audio: audio.audioContent
      });

      if (!playback?.success) {
        console.error(
          "Playback failed:",
          playback?.error ?? "No response from the page."
        );
      }
    } catch (error) {
      console.error(
        "Could not read selected text:",
        error.message ?? error
      );
    }
  })();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'speakText') {
    (async () => {
      try {
        const detectedLanguage = await detectLanguage(message.tabId);
        const audio = await fetchAudio(message.text, detectedLanguage);
        if (!audio.success) {
          sendResponse(audio);
          return;
        }
        const res = await chrome.tabs.sendMessage(message.tabId, {
          action: 'playAudio',
          audio: audio.audioContent
        });
        sendResponse(res);
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});

