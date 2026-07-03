importScripts("shared.js");

let availableVoices = [];

function loadVoices() {
  chrome.tts.getVoices((voices) => {
    availableVoices = voices;
  });
}

function createContextMenu() {
  chrome.contextMenus.create({
    id: "read-selected-text",
    title: "Read selected text",
    contexts: ["selection"]
  });
}

function getSettings(callback) {
  chrome.storage.sync.get(
    ["voiceMode", "selectedVoiceName", "speechRate"],
    (settings) => {
      callback({
        voiceMode: settings.voiceMode || "auto",
        selectedVoiceName: settings.selectedVoiceName || "auto",
        speechRate: settings.speechRate || 1.0
      });
    }
  );
}

function getVoiceName(text, settings) {
  if (settings.voiceMode === "manual" && settings.selectedVoiceName !== "auto") {
    return settings.selectedVoiceName;
  }

  const detectedLanguage = SelectSpeak.detectLanguage(text);
  const bestVoice = SelectSpeak.findBestVoice(availableVoices, detectedLanguage.code);

  return bestVoice?.voiceName;
}

function speakSelectedText(selectedText) {
  getSettings((settings) => {
    const voiceName = getVoiceName(selectedText, settings);

    chrome.tts.stop();
    chrome.tts.speak(
      selectedText,
      SelectSpeak.getSpeechOptions({
        voiceName,
        rate: settings.speechRate
      })
    );
  });
}

chrome.runtime.onInstalled.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "read-selected-text") {
    return;
  }

  const selectedText = (info.selectionText || "").trim();

  if (selectedText) {
    speakSelectedText(selectedText);
  }
});

loadVoices();
