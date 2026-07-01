document.getElementById("actionBtn").addEventListener("click", () => {
  console.log('safd')
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs[0]);
    chrome.tabs.sendMessage(tabs[0].id, { action: "getText" }, (response) => {
      if (chrome.runtime.lastError) {
        alert("Please refresh the quiz page and try again.");
      } else {
        setTimeout(() => {
          displayText(response.text)
        }, 500);
      }
    });
  });
});

document.getElementById("speak").addEventListener("click", () => {
  let text = document.getElementById("displayer").innerText
  chrome.tts.getVoices(function(voices) {
    console.log(voices);
  });
  chrome.tts.speak(text, {
  'lang': 'vi-VN',
  'rate': 1.0,
  'onEvent': function(event) {
    if (event.type === 'error') {
      console.error('TTS Error: ' + event.errorMessage);
    }
  }
});
});

// Display questions in the popup
function displayText(text) {
  const container = document.getElementById("displayer");
  container.innerHTML = text;
}

// Get AI answer for specific question
function getAIAnswerForQuestion() {
  console.log("abcd");
  chrome.runtime.sendMessage({ action: "ask"}, (response) => {
    console.log("afg");
  });
}

// Select answer for question on the webpag


// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Always show main section since API key is hardcoded
  // Check if we're on a quiz page by scanning for questions
});
