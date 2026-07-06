const languages = {
  af: "Afrikaans",
  ar: "Arabic",
  bg: "Bulgarian",
  bn: "Bengali",
  ca: "Catalan",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  es: "Spanish",
  et: "Estonian",
  fa: "Persian",
  fi: "Finnish",
  fil: "Filipino",
  fr: "French",
  gu: "Gujarati",
  he: "Hebrew",
  hi: "Hindi",
  hr: "Croatian",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  kn: "Kannada",
  ko: "Korean",
  lt: "Lithuanian",
  lv: "Latvian",
  ml: "Malayalam",
  mr: "Marathi",
  ms: "Malay",
  nl: "Dutch",
  no: "Norwegian",
  pa: "Punjabi",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  sl: "Slovenian",
  sr: "Serbian",
  sv: "Swedish",
  sw: "Swahili",
  ta: "Tamil",
  te: "Telugu",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  ur: "Urdu",
  vi: "Vietnamese",
  zh: "Chinese",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)"
};

let availableVoices = []; // Check if voices are available

function loadVoices() {
  chrome.tts.getVoices((voices) => {
    availableVoices = voices;

    console.log("Number of TTS voices:", availableVoices.length);
    console.log("Available TTS voices:", availableVoices);
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

async function detectLanguage() {
  let res = {
      code: "Unknown",
      name: "Unknown"
  };
  let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  let language = await chrome.tabs.detectLanguage(tab.id)
  if (language !== "und") {
    res = {
      code: language,
      name: languages[language]
    }
  };
  return res
}

function findBestVoice(languageCode) {
  if (!languageCode || languageCode === "unknown") {
    return null;
  } // check if lang code is available in voices list or not.

  const lowerCode = languageCode.toLowerCase();
  // normalize lang code to lowercase for comparison since microsoft edge tts voices have lang codes in lowercase, while chrome tts voices have lang codes in uppercase.

  console.log('stuka', availableVoices)
  const exactMatch = availableVoices.find((voice) => {
    return voice.lang && voice.lang.toLowerCase() === lowerCode;
  });
  // check for exact match in array, return boolean value
  console.log('blius', languageCode,exactMatch)
  if (exactMatch) {
    return exactMatch;
  }
  // if found exact match, return immediately (For edge users mainly)
  const startsWithMatch = availableVoices.find((voice) => {
    return voice.lang && voice.lang.toLowerCase().startsWith(lowerCode);
  });
  // check if any voice lang code starts with detected lang code, return boolean value

  if (startsWithMatch) {
    return startsWithMatch;
  }
  // if found startsWith match, return immediately (For chrome users mainly)

  const containsMatch = availableVoices.find((voice) => {
    return voice.lang && voice.lang.toLowerCase().includes(lowerCode);
  });
  if (containsMatch) {
    return containsMatch;
  }
  // fallback: if no exact or startsWith match found, check if any voice lang code contains detected lang code, return boolean value
  console.log('fahhh')
  return null;
}


chrome.contextMenus.onClicked.addListener((info) => {
  loadVoices();
  if (info.menuItemId === "read-selected-text") {(async () => {
    const selectedText = info.selectionText;

    if (!selectedText || selectedText.trim() === "") {
      return;
    }

    const detectedLanguage = await detectLanguage();
    const bestVoice = findBestVoice(detectedLanguage.code);
    console.log('bluh', bestVoice)
    console.log("Selected text:", selectedText);
    console.log("Detected language:", detectedLanguage);
    console.log("Best voice:", bestVoice);
    
    chrome.storage.sync.get(["speechRate"], (result) => {
      const speechRate = result.speechRate || 1.0;

      console.log("Using speech rate:", speechRate); // debug

      chrome.tts.stop();

      chrome.tts.speak(selectedText, {
        voiceName: bestVoice ? bestVoice.voiceName : undefined, //(equivalent to this code below)
        // let selectedVoiceName;
        // if (bestVoice) {
        //   selectedVoiceName = bestVoice.voiceName;
        // } else {
        //   selectedVoiceName = undefined;
        // } 
        rate: speechRate, // use the saved speech rate from storage
        pitch: 1.0,
        volume: 1.0
      });
    });
  })();}
}); // Reload voices when the extension is used
