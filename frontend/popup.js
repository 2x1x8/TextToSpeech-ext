const PREVIEW_TEXT = "Hello, this is a voice preview.";
const DEFAULT_SETTINGS = {
  voiceMode: "auto",
  selectedVoiceName: "auto",
  speechRate: 1.0
};

const elements = {
  voiceMode: document.getElementById("voiceMode"),
  voiceSelect: document.getElementById("voiceSelect"),
  selectedVoiceText: document.getElementById("selectedVoiceText"),
  previewButton: document.getElementById("previewButton"),
  stopButton: document.getElementById("stopButton"),
  speakButton: document.getElementById("speakButton"),
  speedSlider: document.getElementById("speedSlider"),
  speedValue: document.getElementById("speedValue"),
  languageText: document.getElementById("languageText"),
  statusText: document.getElementById("statusText")
};

let availableVoices = [];

function setStatus(message) {
  elements.statusText.textContent = message;
}

function updateSpeedText(rate) {
  elements.speedValue.textContent = `${Number(rate).toFixed(1)}x`;
}

function getSelectedVoice() {
  return availableVoices.find((voice) => {
    return voice.voiceName === elements.voiceSelect.value;
  });
}

function updateSelectedVoiceText(voice = getSelectedVoice()) {
  if (elements.voiceMode.value === "auto" || elements.voiceSelect.value === "auto") {
    elements.selectedVoiceText.textContent = "Auto choose best voice";
    return;
  }

  elements.selectedVoiceText.textContent = SelectSpeak.getVoiceLabel(voice);
}

function updateVoiceSelectState() {
  const isAutoMode = elements.voiceMode.value === "auto";

  elements.voiceSelect.disabled = isAutoMode;

  if (isAutoMode) {
    elements.voiceSelect.value = "auto";
  }

  updateSelectedVoiceText();
}

function saveSettings(settings) {
  chrome.storage.sync.set(settings);
}

function restoreSavedSettings() {
  chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS), (savedSettings) => {
    const settings = {
      ...DEFAULT_SETTINGS,
      ...savedSettings
    };

    elements.voiceMode.value = settings.voiceMode;
    elements.voiceSelect.value = settings.selectedVoiceName;
    elements.speedSlider.value = settings.speechRate;

    updateSpeedText(settings.speechRate);
    updateVoiceSelectState();

    elements.languageText.textContent = "Auto";
    setStatus("Settings loaded.");
  });
}

function addVoiceOption(value, label) {
  const option = document.createElement("option");

  option.value = value;
  option.textContent = label;
  elements.voiceSelect.appendChild(option);
}

function populateVoiceOptions() {
  elements.voiceSelect.replaceChildren();
  addVoiceOption("auto", "Auto choose best voice");

  availableVoices.forEach((voice) => {
    addVoiceOption(voice.voiceName, SelectSpeak.getVoiceLabel(voice));
  });
}

function loadVoices() {
  chrome.tts.getVoices((voices) => {
    availableVoices = voices;
    populateVoiceOptions();
    restoreSavedSettings();
  });
}

function getCurrentTab() {
  return chrome.tabs.query({
    active: true,
    currentWindow: true
  }).then((tabs) => tabs[0]);
}

async function getSelectedTextFromPage() {
  const tab = await getCurrentTab();
  const response = await chrome.tabs.sendMessage(tab.id, {
    action: "getSelectedText"
  });

  return (response?.text || "").trim();
}

function getConfiguredVoiceName(detectedLanguage) {
  if (elements.voiceMode.value === "manual" && elements.voiceSelect.value !== "auto") {
    updateSelectedVoiceText();

    return {
      voiceName: elements.voiceSelect.value,
      status: "Reading with manually selected voice."
    };
  }

  const bestVoice = SelectSpeak.findBestVoice(availableVoices, detectedLanguage.code);

  if (!bestVoice) {
    elements.selectedVoiceText.textContent = "No matching voice found";

    return {
      voiceName: undefined,
      status: "No matching voice found. Using default voice."
    };
  }

  elements.selectedVoiceText.textContent = SelectSpeak.getVoiceLabel(bestVoice);

  return {
    voiceName: bestVoice.voiceName,
    status: "Reading with auto-detected voice."
  };
}

function speak(text, voiceName, rate) {
  chrome.tts.stop();
  chrome.tts.speak(text, SelectSpeak.getSpeechOptions({ rate, voiceName }));
}

elements.voiceMode.addEventListener("change", () => {
  const selectedMode = elements.voiceMode.value;
  const settings = {
    voiceMode: selectedMode
  };

  if (selectedMode === "auto") {
    settings.selectedVoiceName = "auto";
    elements.voiceSelect.value = "auto";
  }

  saveSettings(settings);
  updateVoiceSelectState();
  setStatus(`Voice mode set to ${selectedMode}.`);
});

elements.voiceSelect.addEventListener("change", () => {
  saveSettings({
    selectedVoiceName: elements.voiceSelect.value
  });

  updateSelectedVoiceText();
  setStatus("Selected voice saved.");
});

elements.speedSlider.addEventListener("input", () => {
  const selectedRate = Number(elements.speedSlider.value);

  updateSpeedText(selectedRate);
  saveSettings({
    speechRate: selectedRate
  });
  setStatus(`Speed set to ${selectedRate.toFixed(1)}x.`);
});

elements.previewButton.addEventListener("click", () => {
  const selectedRate = Number(elements.speedSlider.value);
  const selectedVoiceName =
    elements.voiceMode.value === "manual" && elements.voiceSelect.value !== "auto"
      ? elements.voiceSelect.value
      : undefined;

  speak(PREVIEW_TEXT, selectedVoiceName, selectedRate);
  setStatus(selectedVoiceName ? "Previewing selected voice." : "Previewing default voice.");
});

elements.stopButton.addEventListener("click", () => {
  chrome.tts.stop();
  setStatus("Stopped.");
});

elements.speakButton.addEventListener("click", async () => {
  try {
    const selectedText = await getSelectedTextFromPage();

    if (!selectedText) {
      setStatus("Please select text on the page first.");
      return;
    }

    const detectedLanguage = SelectSpeak.detectLanguage(selectedText);
    const selectedRate = Number(elements.speedSlider.value);
    const selectedVoice = getConfiguredVoiceName(detectedLanguage);

    elements.languageText.textContent = `${detectedLanguage.name} (${detectedLanguage.code})`;
    speak(selectedText, selectedVoice.voiceName, selectedRate);
    setStatus(selectedVoice.status);
  } catch (error) {
    console.error(error);
    setStatus("Cannot read this page. Refresh the page and try again.");
  }
});

loadVoices();
