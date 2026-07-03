chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "getSelectedText") {
    return;
  }

  sendResponse({
    text: window.getSelection().toString()
  });
});
