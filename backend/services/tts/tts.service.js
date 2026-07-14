import { generateElevenLabsSpeech } from "./elevenlabs.tts.js";
import { generateGeminiSpeech } from "./gemini.tts.js";

const PROVIDERS = {
  gemini: {
    contentType: "audio/wav",
    maxAttempts: 2,
    generateSpeech({ text, language, voiceSelection }) {
      return generateGeminiSpeech({
        text,
        language,
        voiceName: voiceSelection.gemini.voiceName,
      });
    },
  },
  elevenlabs: {
    contentType: "audio/mpeg",
    maxAttempts: 1,
    generateSpeech({ text, language, voiceSelection }) {
      return generateElevenLabsSpeech({
        text,
        voiceId: voiceSelection.elevenlabs.voiceId,
        languageCode: language.code,
      });
    },
  },
};

function normalizeProvider(provider, fallbackProvider = "gemini") {
  return Object.hasOwn(PROVIDERS, provider) ? provider : fallbackProvider;
}

function getProviderOrder(requestedProvider) {
  const primaryProvider = normalizeProvider(process.env.TTS_PROVIDER || "gemini");
  const fallbackProvider = normalizeProvider(process.env.TTS_FALLBACK_PROVIDER || "elevenlabs", "elevenlabs");

  if (requestedProvider && requestedProvider !== "auto") {
    return [normalizeProvider(requestedProvider)];
  }

  return [...new Set([primaryProvider, fallbackProvider])];
}

function canRetryProvider(error) {
  return [429, 500, 502, 503, 504].includes(error?.status);
}

async function generateWithProvider(providerName, provider, params) {
  let lastError = null;

  for (let attempt = 1; attempt <= provider.maxAttempts; attempt += 1) {
    try {
      return await provider.generateSpeech(params);
    } catch (error) {
      lastError = error;

      if (attempt >= provider.maxAttempts || !canRetryProvider(error)) {
        throw error;
      }

      console.warn(`TTS provider ${providerName} failed on attempt ${attempt}; retrying.`, error);
    }
  }

  throw lastError;
}

export async function synthesizeSpeech({ text, language, voiceSelection }) {
  const providerOrder = getProviderOrder(voiceSelection.provider);
  let lastError = null;

  for (const providerName of providerOrder) {
    const provider = PROVIDERS[providerName];

    try {
      const audioBuffer = await generateWithProvider(providerName, provider, {
        text,
        language,
        voiceSelection,
      });

      return {
        audioBuffer,
        contentType: provider.contentType,
        provider: providerName,
      };
    } catch (error) {
      lastError = error;

      if (providerName === providerOrder.at(-1) || !canRetryProvider(error)) {
        throw error;
      }

      console.warn(`TTS provider ${providerName} failed; trying fallback provider.`, error);
    }
  }

  throw lastError || new Error("No TTS providers are configured.");
}
