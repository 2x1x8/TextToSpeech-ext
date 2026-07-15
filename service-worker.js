const apiKey = 'AIzaSyBAD3k8DUrgFLdeiLsFsM8I6Tr68ciwsi4'
const LANGUAGE_MAP = {
  af: { name: "Afrikaans", languageCode: "af-ZA", voiceName: "af-ZA-Wavenet-A" },
  ar: { name: "Arabic", languageCode: "ar-XA", voiceName: "ar-XA-Wavenet-A" },
  bg: { name: "Bulgarian", languageCode: "bg-BG", voiceName: "bg-BG-Wavenet-A" },
  bn: { name: "Bengali", languageCode: "bn-IN", voiceName: "bn-IN-Wavenet-A" },
  ca: { name: "Catalan", languageCode: "ca-ES", voiceName: "ca-ES-Wavenet-A" },
  cs: { name: "Czech", languageCode: "cs-CZ", voiceName: "cs-CZ-Wavenet-A" },
  da: { name: "Danish", languageCode: "da-DK", voiceName: "da-DK-Wavenet-A" },
  de: { name: "German", languageCode: "de-DE", voiceName: "de-DE-Wavenet-A" },
  el: { name: "Greek", languageCode: "el-GR", voiceName: "el-GR-Wavenet-A" },
  en: { name: "English", languageCode: "en-US", voiceName: "en-US-Wavenet-A" },
  es: { name: "Spanish", languageCode: "es-ES", voiceName: "es-ES-Wavenet-A" },
  et: { name: "Estonian", languageCode: "et-EE", voiceName: "et-EE-Standard-A" },
  fa: { name: "Persian", languageCode: "fa-IR", voiceName: "fa-IR-Wavenet-A" },
  fi: { name: "Finnish", languageCode: "fi-FI", voiceName: "fi-FI-Wavenet-A" },
  fil: { name: "Filipino", languageCode: "fil-PH", voiceName: "fil-PH-Wavenet-A" },
  fr: { name: "French", languageCode: "fr-FR", voiceName: "fr-FR-Wavenet-A" },
  gu: { name: "Gujarati", languageCode: "gu-IN", voiceName: "gu-IN-Wavenet-A" },
  he: { name: "Hebrew", languageCode: "he-IL", voiceName: "he-IL-Wavenet-A" },
  hi: { name: "Hindi", languageCode: "hi-IN", voiceName: "hi-IN-Wavenet-A" },
  hr: { name: "Croatian", languageCode: "hr-HR", voiceName: "hr-HR-Wavenet-A" },
  hu: { name: "Hungarian", languageCode: "hu-HU", voiceName: "hu-HU-Wavenet-A" },
  id: { name: "Indonesian", languageCode: "id-ID", voiceName: "id-ID-Wavenet-A" },
  it: { name: "Italian", languageCode: "it-IT", voiceName: "it-IT-Wavenet-A" },
  ja: { name: "Japanese", languageCode: "ja-JP", voiceName: "ja-JP-Wavenet-A" },
  kn: { name: "Kannada", languageCode: "kn-IN", voiceName: "kn-IN-Wavenet-A" },
  ko: { name: "Korean", languageCode: "ko-KR", voiceName: "ko-KR-Wavenet-A" },
  lt: { name: "Lithuanian", languageCode: "lt-LT", voiceName: "lt-LT-Wavenet-A" },
  lv: { name: "Latvian", languageCode: "lv-LV", voiceName: "lv-LV-Wavenet-A" },
  ml: { name: "Malayalam", languageCode: "ml-IN", voiceName: "ml-IN-Wavenet-A" },
  mr: { name: "Marathi", languageCode: "mr-IN", voiceName: "mr-IN-Wavenet-A" },
  ms: { name: "Malay", languageCode: "ms-MY", voiceName: "ms-MY-Wavenet-A" },
  nl: { name: "Dutch", languageCode: "nl-NL", voiceName: "nl-NL-Wavenet-A" },
  no: { name: "Norwegian", languageCode: "nb-NO", voiceName: "nb-NO-Wavenet-A" },
  pa: { name: "Punjabi", languageCode: "pa-IN", voiceName: "pa-IN-Wavenet-A" },
  pl: { name: "Polish", languageCode: "pl-PL", voiceName: "pl-PL-Wavenet-A" },
  pt: { name: "Portuguese", languageCode: "pt-BR", voiceName: "pt-BR-Wavenet-A" },
  ro: { name: "Romanian", languageCode: "ro-RO", voiceName: "ro-RO-Wavenet-A" },
  ru: { name: "Russian", languageCode: "ru-RU", voiceName: "ru-RU-Wavenet-A" },
  sk: { name: "Slovak", languageCode: "sk-SK", voiceName: "sk-SK-Wavenet-A" },
  sl: { name: "Slovenian", languageCode: "sl-SI", voiceName: "sl-SI-Wavenet-A" },
  sr: { name: "Serbian", languageCode: "sr-RS", voiceName: "sr-RS-Wavenet-A" },
  sv: { name: "Swedish", languageCode: "sv-SE", voiceName: "sv-SE-Wavenet-A" },
  sw: { name: "Swahili", languageCode: "sw-KE", voiceName: "sw-KE-Wavenet-A" },
  ta: { name: "Tamil", languageCode: "ta-IN", voiceName: "ta-IN-Wavenet-A" },
  te: { name: "Telugu", languageCode: "te-IN", voiceName: "te-IN-Wavenet-A" },
  th: { name: "Thai", languageCode: "th-TH", voiceName: "th-TH-Wavenet-A" },
  tr: { name: "Turkish", languageCode: "tr-TR", voiceName: "tr-TR-Wavenet-A" },
  uk: { name: "Ukrainian", languageCode: "uk-UA", voiceName: "uk-UA-Wavenet-A" },
  ur: { name: "Urdu", languageCode: "ur-IN", voiceName: "ur-IN-Wavenet-A" },
  vi: { name: "Vietnamese", languageCode: "vi-VN", voiceName: "vi-VN-Wavenet-A" },
  zh: { name: "Chinese", languageCode: "cmn-CN", voiceName: "cmn-CN-Wavenet-A" },
  "zh-CN": { name: "Chinese (Simplified)", languageCode: "cmn-CN", voiceName: "cmn-CN-Wavenet-A" },
  "zh-TW": { name: "Chinese (Traditional)", languageCode: "cmn-TW", voiceName: "cmn-TW-Wavenet-A" },
};

const DEFAULT_LANGUAGE = LANGUAGE_MAP.en;

async function fetchAudio(text, lang) {
  console.log(`fetching audio for lang: ${lang} and text:${text}`)
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: lang.languageCode,
          name: lang.voiceName,
        },
        audioConfig: {
          audioEncoding: "MP3",
        },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error('failed to fetch audio');
    console.log(data)
    return;
  } else{
    console.log(data)
  }
  return data
  // Play the returned MP3
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
  let detected = DEFAULT_LANGUAGE
  let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  let language = await chrome.tabs.detectLanguage(tab.id)
  if (language !== "und") {
    detected = LANGUAGE_MAP[language]
      ?? LANGUAGE_MAP[language.split("-")[0]]
      ?? DEFAULT_LANGUAGE;
  };
  return detected
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "read-selected-text") {
    (async () => {
      const selectedText = info.selectionText;
      const detectedLanguage = await detectLanguage();
      console.log("Selected text:", selectedText);
      console.log("Detected language:", detectedLanguage)
      if (!selectedText || selectedText.trim() === "") {
        return;
      }
      let audio = await fetchAudio(selectedText, detectedLanguage)
      if(audio){
        let response = await chrome.tabs.sendMessage(tab.id, {
          action: 'playAudio',
          audio: audio.audioContent
        });
      }else{
        console.log()
      }
    })();
  }
}); // Reload voices when the extension is used

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'speakText') {
    (async () => {
      try {
        const detectedLanguage = await detectLanguage();
        const audio = await fetchAudio(message.text, detectedLanguage);
        if (!audio) {
          sendResponse({ success: false, error: "Failed to fetch audio from API." });
          return;
        }
        await chrome.tabs.sendMessage(message.tabId, {
          action: 'playAudio',
          audio: audio.audioContent
        });
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});

