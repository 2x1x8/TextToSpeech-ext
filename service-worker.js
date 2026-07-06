const apiKey = 'AIzaSyBAD3k8DUrgFLdeiLsFsM8I6Tr68ciwsi4'
const languages = {
  af: "af-ZA",
  ar: "ar-XA",
  bg: "bg-BG",
  bn: "bn-IN",
  ca: "ca-ES",
  cs: "cs-CZ",
  da: "da-DK",
  de: "de-DE",
  el: "el-GR",
  en: "en-US",
  es: "es-ES",
  et: "et-EE",
  fa: "fa-IR",
  fi: "fi-FI",
  fil: "fil-PH",
  fr: "fr-FR",
  gu: "gu-IN",
  he: "he-IL",
  hi: "hi-IN",
  hr: "hr-HR",
  hu: "hu-HU",
  id: "id-ID",
  it: "it-IT",
  ja: "ja-JP",
  kn: "kn-IN",
  ko: "ko-KR",
  lt: "lt-LT",
  lv: "lv-LV",
  ml: "ml-IN",
  mr: "mr-IN",
  ms: "ms-MY",
  nl: "nl-NL",
  no: "nb-NO",
  pa: "pa-IN",
  pl: "pl-PL",
  pt: "pt-BR",
  ro: "ro-RO",
  ru: "ru-RU",
  sk: "sk-SK",
  sl: "sl-SI",
  sr: "sr-RS",
  sv: "sv-SE",
  sw: "sw-TZ",
  ta: "ta-IN",
  te: "te-IN",
  th: "th-TH",
  tr: "tr-TR",
  uk: "uk-UA",
  ur: "ur-PK",
  vi: "vi-VN",
  zh: "cmn-CN",
  "zh-CN": "cmn-CN",
  "zh-TW": "cmn-TW",
};

let availableVoices = []; // Check if voices are available



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
					languageCode: 'lang',
					name :`${lang}-Wavenet-A`,  
				},
        audioConfig: {
          audioEncoding: "MP3",
        },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error(data);
    return;
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

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "read-selected-text") {
		(async () => {
			const selectedText = info.selectionText;
			const detectedLanguage = await detectLanguage();
			console.log(selectedText)
			if (!selectedText || selectedText.trim() === "") {
				return;
			}
			let audio = await fetchAudio(selectedText, detectedLanguage.name)
			let response = await chrome.tabs.sendMessage(tab.id, {
				action: 'playAudio',
				audio: audio.audioContent
			})
			console.log("Selected text:", selectedText);
			console.log("Detected language:", detectedLanguage);
		})();
	}
}); // Reload voices when the extension is used

