(function () {
  const LANGUAGE_RULES = [
    {
      code: "vi",
      name: "Vietnamese",
      pattern: /[\u0103\u00e2\u0111\u00ea\u00f4\u01a1\u01b0\u0300\u0301\u0303\u0309\u0323]/i
    },
    { code: "ko", name: "Korean", pattern: /[\uac00-\ud7af]/ },
    { code: "ja", name: "Japanese", pattern: /[\u3040-\u30ff]/ },
    { code: "zh", name: "Chinese", pattern: /[\u4e00-\u9fff]/ },
    { code: "ar", name: "Arabic", pattern: /[\u0600-\u06ff]/ },
    { code: "he", name: "Hebrew", pattern: /[\u0590-\u05ff]/ },
    { code: "th", name: "Thai", pattern: /[\u0e00-\u0e7f]/ },
    { code: "ru", name: "Cyrillic language", pattern: /[\u0400-\u04ff]/ },
    { code: "el", name: "Greek", pattern: /[\u0370-\u03ff]/ },
    { code: "hi", name: "Hindi / Devanagari", pattern: /[\u0900-\u097f]/ }
  ];

  function detectLanguage(text) {
    const sample = text.trim();

    if (!sample) {
      return {
        code: "unknown",
        name: "Unknown"
      };
    }

    const normalizedSample = sample.normalize("NFD");
    const matchedLanguage = LANGUAGE_RULES.find((language) => {
      return language.pattern.test(normalizedSample);
    });

    if (matchedLanguage) {
      return {
        code: matchedLanguage.code,
        name: matchedLanguage.name
      };
    }

    return {
      code: "en",
      name: "English / Latin text"
    };
  }

  function findBestVoice(voices, languageCode) {
    if (!languageCode || languageCode === "unknown") {
      return null;
    }

    const lowerCode = languageCode.toLowerCase();
    const voiceMatches = [
      (voiceLang) => voiceLang === lowerCode,
      (voiceLang) => voiceLang.startsWith(lowerCode),
      (voiceLang) => voiceLang.includes(lowerCode)
    ];

    for (const matches of voiceMatches) {
      const matchedVoice = voices.find((voice) => {
        return voice.lang && matches(voice.lang.toLowerCase());
      });

      if (matchedVoice) {
        return matchedVoice;
      }
    }

    return null;
  }

  function getVoiceLabel(voice) {
    return voice ? `${voice.voiceName} (${voice.lang})` : "Auto choose best voice";
  }

  function getSpeechOptions({ rate, voiceName }) {
    const options = {
      rate,
      pitch: 1.0,
      volume: 1.0
    };

    if (voiceName) {
      options.voiceName = voiceName;
    }

    return options;
  }

  globalThis.SelectSpeak = {
    detectLanguage,
    findBestVoice,
    getSpeechOptions,
    getVoiceLabel
  };
})();
