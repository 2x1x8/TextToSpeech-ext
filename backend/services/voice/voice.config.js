import "../../config/env.js";

export const ELEVENLABS_VOICE_BY_LANGUAGE = {
  default: process.env.ELEVENLABS_VOICE_ID,
};

export const GEMINI_VOICE_BY_LANGUAGE = {
  default: process.env.GEMINI_TTS_VOICE || "Kore",
};

export const GEMINI_TTS_VOICES = [
  {
    provider: "gemini",
    voiceName: "Kore",
    lang: "Gemini",
    description: "Balanced Gemini TTS voice",
  },
  {
    provider: "gemini",
    voiceName: "Puck",
    lang: "Gemini",
    description: "Brighter Gemini TTS voice",
  },
];
