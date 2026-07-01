chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read-selected-text",
    title: "Read selected text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "read-selected-text") {
    const selectedText = info.selectionText;

    if (!selectedText || selectedText.trim() === "") {
      return;
    }

    chrome.tts.stop();

    chrome.tts.speak(selectedText, {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    });
  }
});
