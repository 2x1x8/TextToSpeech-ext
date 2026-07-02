let  availableVoices = []; // Check if voices are available

function loadVoices() {
  chrome.tts.getVoices((voices) => {
    availableVoices = voices;

    console.log("Number of TTS voices:", availableVoices.length);
    console.log("Available TTS voices:", availableVoices);
  });
}

loadVoices();

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "read-selected-text",
    title: "Read selected text",
    contexts: ["selection"]
  });
});
// when extension is reloaded/installed, create a right-click menu item named "Read selected text" (ONLY IF user highlight/select text)

function detectLanguage(text) {
  const sample = text.trim();

  if(!sample) {
    return {
      code: "Unknown",
      name: "Unknown"
    };
  }

  if (/[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(sample)) {
    return {
      code: "vi",
      name: "Vietnamese"
    };
  }

  if (/[\uAC00-\uD7AF]/.test(sample)) {
    return {
      code: "ko",
      name: "Korean"
    };
  }

  if (/[\u3040-\u30FF]/.test(sample)) {
    return {
      code: "ja",
      name: "Japanese"
    };
  }

  if (/[\u4E00-\u9FFF]/.test(sample)) {
    return {
      code: "zh",
      name: "Chinese"
    };
  }

  if (/[\u0600-\u06FF]/.test(sample)) {
    return {
      code: "ar",
      name: "Arabic"
    };
  }

  if (/[\u0590-\u05FF]/.test(sample)) {
    return {
      code: "he",
      name: "Hebrew"
    };
  }

  if (/[\u0E00-\u0E7F]/.test(sample)) {
    return {
      code: "th",
      name: "Thai"
    };
  }

  if (/[\u0400-\u04FF]/.test(sample)) {
    return {
      code: "ru",
      name: "Cyrillic language"
    };
  }

  if (/[\u0370-\u03FF]/.test(sample)) {
    return {
      code: "el",
      name: "Greek"
    };
  }

  if (/[\u0900-\u097F]/.test(sample)) {
    return {
      code: "hi",
      name: "Hindi / Devanagari"
    };
  }

  return {
    code: "en",
    name: "English / Latin text"
  };
}

function findBestVoice(languageCode) {
  if (!languageCode || languageCode === "unknown") {
    return null;
  } // check if lang code is available in voices list or not.

  const lowerCode = languageCode.toLowerCase();
  // normalize lang code to lowercase for comparison since microsoft edge tts voices have lang codes in lowercase, while chrome tts voices have lang codes in uppercase.

  const exactMatch = availableVoices.find((voice) => {
    return voice.lang && voice.lang.toLowerCase() === lowerCode;
  });
  // check for exact match in array, return boolean value

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

  return null;
}


chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "read-selected-text") {
    const selectedText = info.selectionText;

    if (!selectedText || selectedText.trim() === "") {
      return;
    }

    const detectedLanguage = detectLanguage(selectedText);
    const bestVoice = findBestVoice(detectedLanguage.code);

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
  }
}); // Reload voices when the extension is used