const DEFAULT_LANGUAGE = "en";
async function fetchAudio(text, lang, gender) {
  try {
    const response = await fetch("http://localhost:3000/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        language: lang,
        gender: gender
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
      audioContent: data.audioContent,
      timepoints: data.timepoints ?? [],
      words: data.words ?? []
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
async function speak(tabId, text, gender) {
    const lang = await detectLanguage(tabId);

    const audio = await fetchAudio(text, lang, gender);

    if (!audio.success)
        return audio;

    return chrome.tabs.sendMessage(tabId, {
        action: "playAudio",
        audio: audio.audioContent,
        timepoints: audio.timepoints,
        words: audio.words
    });
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
      const selection = await chrome.tabs.sendMessage(tab.id, {
        action: "getSelectedText"
      });

      const selectedText = selection?.text?.trim();

      console.log('selected text: ', selectedText)
      if (!selectedText) return;

      const result = await speak(tab.id, selectedText);

      if (!result?.success) {
        console.error(
          "Playback failed:",
          result?.error ?? "No response from the page."
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
        const result = await speak(message.tabId, message.text, message.gender);
        sendResponse(result);
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});

