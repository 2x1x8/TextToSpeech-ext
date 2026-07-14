import { ELEVENLABS_VOICE_BY_LANGUAGE, GEMINI_VOICE_BY_LANGUAGE } from "./voice.config.js";

export function selectVoice({ languageCode, preferences = {} }) {
  const code = (languageCode || "default").toLowerCase();
  const elevenLabsVoiceId =
    preferences.voiceId ||
    ELEVENLABS_VOICE_BY_LANGUAGE[code] ||
    ELEVENLABS_VOICE_BY_LANGUAGE.default;
  const geminiVoiceName =
    preferences.voiceName ||
    GEMINI_VOICE_BY_LANGUAGE[code] ||
    GEMINI_VOICE_BY_LANGUAGE.default;

  return {
    provider: preferences.provider || "auto",
    elevenlabs: {
      voiceId: elevenLabsVoiceId,
    },
    gemini: {
      voiceName: geminiVoiceName,
    },
  };
}
