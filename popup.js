const stopButton = document.getElementById("stopButton");
const speakButton = document.getElementById("speakButton");
const statusText = document.getElementById("statusText");
const languageSelect = document.getElementById("languageSelect");
const genderSelect = document.getElementById("genderSelect");

const DEFAULT_SETTINGS = {
  gender: "FEMALE",
  language: "auto",
  speed: 1.0,
  voice: "default",
  highlight: true
};

const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);

genderSelect.value = settings.gender;
languageSelect.value = settings.language;

stopButton.disabled = true
stopButton.style.opacity = 0.5

async function saveSetting(key, value) {
    await chrome.storage.local.set({ [key]: value });
}

async function loadLanguages() {
  const response = await fetch("http://localhost:3000/languages");
  const { languages } = await response.json();

  for (const language of languages) {
    languageSelect.add(new Option(language.name, language.code));
  }
}
function setPlayingState(isPlaying){
  stopButton.disabled = !isPlaying
  stopButton.style.opacity = isPlaying? 1 : 0.5
}
function isAudioPlaying(){
  return !stopButton.disabled
}

loadLanguages();

genderSelect.addEventListener("change", () =>
    saveSetting("gender", genderSelect.value)
);

languageSelect.addEventListener("change", () =>
    saveSetting("language", languageSelect.value)
);

document.addEventListener("DOMContentLoaded", async ()=>{
  const {language, gender} = await chrome.storage.local.get({
    gender: 'MALE',
    language: "auto"
  })
})

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
        {
          action: "speakText",
          text: selResponse.text.trim(),
          tabId: tab.id,
          language: languageSelect.value,
          gender: genderSelect.value
        },
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
