const apiKey = 'AIzaSyBAD3k8DUrgFLdeiLsFsM8I6Tr68ciwsi4'
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
					languageCode: 'vi-VN',
					name :`vi-VN-Wavenet-A`,  
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
			let audio = await fetchAudio(selectedText, detectedLanguage.code)
			let response = await chrome.tabs.sendMessage(tab.id, {
				action: 'playAudio',
				audio: audio.audioContent
			})
			console.log("Selected text:", selectedText);
			console.log("Detected language:", detectedLanguage);
		})();
	}
}); // Reload voices when the extension is used

