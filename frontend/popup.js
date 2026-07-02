const voiceMode = document.getElementById("voiceMode");
const voiceSelect = document.getElementById("voiceSelect");
const selectedVoiceText = document.getElementById("selectedVoiceText");

const previewButton = document.getElementById("previewButton");
const stopButton = document.getElementById("stopButton");
const speakButton = document.getElementById("speakButton");

const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

const languageText = document.getElementById("languageText");
const statusText = document.getElementById("statusText");

let availableVoices = []; // VOICE STORAGE

function updateSpeedText(rate) {
  speedValue.textContent = `${Number(rate).toFixed(1)}x`;
} // Update the visible speed label in the popup

function updateSelectedVoiceText() {
  if (voiceMode.value === "auto" || voiceSelect.value === "auto") {
    selectedVoiceText.textContent = "Auto choose best voice";
    return;
  } 

  const selectedVoice = availableVoices.find((voice) => {
    return voice.voiceName === voiceSelect.value;
  });

  if (selectedVoice) {
    selectedVoiceText.textContent = `${selectedVoice.voiceName} (${selectedVoice.lang})`;
  } else {
    selectedVoiceText.textContent = "Auto choose best voice";
  }
}

function updateVoiceSelectState() {
  if (voiceMode.value === "auto") {
    voiceSelect.disabled = true;
    voiceSelect.value = "auto";
  } else {
    voiceSelect.disabled = false;
  }

  updateSelectedVoiceText();
}

function restoreSavedSettings() {
  chrome.storage.sync.get(
    ["voiceMode", "selectedVoiceName", "speechRate"], //Retrieve saved settings from storage
    (result) => {
      const savedVoiceMode = result.voiceMode || "auto"; 
      const savedVoiceName = result.selectedVoiceName || "auto"; 
      const savedRate = result.speechRate || 1.0;
      // if available => use, if not => default values

      voiceMode.value = savedVoiceMode; 
      voiceSelect.value = savedVoiceName;
      speedSlider.value = savedRate;
      // updating UI elements with saved ones

      updateSpeedText(savedRate);
      updateVoiceSelectState();

      languageText.textContent = "Auto";
      statusText.textContent = "Settings loaded.";
    }
  );
}

function loadVoices() {
  chrome.tts.getVoices((voices) => {
    availableVoices = voices;

    voiceSelect.innerHTML = "";

    const autoOption = document.createElement("option");
    autoOption.value = "auto";
    autoOption.textContent = "Auto choose best voice";
    voiceSelect.appendChild(autoOption);

    availableVoices.forEach((voice) => {
      const option = document.createElement("option");

      option.value = voice.voiceName;
      option.textContent = `${voice.voiceName} (${voice.lang})`;

      voiceSelect.appendChild(option);
    });

    restoreSavedSettings();
  });
}

voiceMode.addEventListener("change", () => {
  const selectedMode = voiceMode.value;

  if (selectedMode === "auto") {
    voiceSelect.value = "auto";

    chrome.storage.sync.set({
      voiceMode: "auto",
      selectedVoiceName: "auto"
    });
  } else {
    chrome.storage.sync.set({
      voiceMode: "manual"
    });
  }

  updateVoiceSelectState();

  statusText.textContent = `Voice mode set to ${selectedMode}.`;
  console.log("Saved voice mode:", selectedMode);
});

voiceSelect.addEventListener("change", () => {
  const selectedVoiceName = voiceSelect.value;

  chrome.storage.sync.set({
    selectedVoiceName: selectedVoiceName
  });

  updateSelectedVoiceText();

  statusText.textContent = "Selected voice saved.";
  console.log("Saved selected voice:", selectedVoiceName);
});

speedSlider.addEventListener("input", () => {
  const selectedRate = Number(speedSlider.value);

  updateSpeedText(selectedRate);

  chrome.storage.sync.set({
    speechRate: selectedRate
  });

  statusText.textContent = `Speed set to ${selectedRate.toFixed(1)}x.`;
  console.log("Saved speech rate:", selectedRate);
});

previewButton.addEventListener("click", () => {
  const selectedVoiceName = voiceSelect.value;
  const selectedRate = Number(speedSlider.value);

  chrome.tts.stop();

  if (voiceMode.value === "auto" || selectedVoiceName === "auto") {
    chrome.tts.speak("Hello, this is a voice preview.", {
      rate: selectedRate,
      pitch: 1.0,
      volume: 1.0
    });

    statusText.textContent = "Previewing default voice.";
    return;
  }

  chrome.tts.speak("Hello, this is a voice preview.", {
    voiceName: selectedVoiceName,
    rate: selectedRate,
    pitch: 1.0,
    volume: 1.0
  });

  statusText.textContent = "Previewing selected voice.";
});

stopButton.addEventListener("click", () => {
  chrome.tts.stop();
  statusText.textContent = "Stopped.";
});

speakButton.addEventListener("click", () => {
  statusText.textContent = "Speak Selected Text will be connected next.";
});

loadVoices();