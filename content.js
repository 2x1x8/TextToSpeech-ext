
//---------------------------------------------------LISTENERS-----------------------------------------------------------------
let text = ''
// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getText") {
    sendResponse({text: text})
  } 
  return true;
});

//---------------------------------------------------SEND MESSAGE------------------------------------------------------------
function init() {
  text = document.documentElement.innerText

}

init();

