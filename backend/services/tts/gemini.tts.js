import { createGeminiInteraction } from "../../config/gemini.client.js";

const DEFAULT_GEMINI_TTS_MODEL = "gemini-3.1-flash-tts-preview";
const DEFAULT_GEMINI_TTS_VOICE = "Kore";
const GEMINI_TTS_SAMPLE_RATE = 24000;
const GEMINI_TTS_CHANNELS = 1;
const GEMINI_TTS_BITS_PER_SAMPLE = 16;

function collectAudioBlocks(value, blocks = []) {
  if (!value || typeof value !== "object") {
    return blocks;
  }

  if (typeof value.data === "string" && (value.type === "audio" || value.mime_type?.startsWith("audio/"))) {
    blocks.push(value.data);
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectAudioBlocks(item, blocks));
    return blocks;
  }

  Object.values(value).forEach((item) => collectAudioBlocks(item, blocks));
  return blocks;
}

function extractAudioData(interaction) {
  const outputAudio = interaction.output_audio || interaction.outputAudio;

  if (typeof outputAudio?.data === "string") {
    return outputAudio.data;
  }

  const audioBlocks = collectAudioBlocks(interaction);
  return audioBlocks.join("");
}

function createWavBuffer(pcmBuffer) {
  const byteRate = GEMINI_TTS_SAMPLE_RATE * GEMINI_TTS_CHANNELS * (GEMINI_TTS_BITS_PER_SAMPLE / 8);
  const blockAlign = GEMINI_TTS_CHANNELS * (GEMINI_TTS_BITS_PER_SAMPLE / 8);
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(GEMINI_TTS_CHANNELS, 22);
  header.writeUInt32LE(GEMINI_TTS_SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(GEMINI_TTS_BITS_PER_SAMPLE, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}

function buildTtsPrompt({ text, languageName }) {
  const languageInstruction = languageName ? `Language: ${languageName}\n` : "";

  return [
    "Synthesize speech for the transcript below.",
    "Read only the transcript. Do not read these instructions aloud.",
    languageInstruction,
    "### TRANSCRIPT",
    text,
  ].join("\n");
}

export async function generateGeminiSpeech({ text, voiceName, language }) {
  const interaction = await createGeminiInteraction({
    model: process.env.GEMINI_TTS_MODEL || DEFAULT_GEMINI_TTS_MODEL,
    store: false,
    input: buildTtsPrompt({
      text,
      languageName: language?.name,
    }),
    response_format: {
      type: "audio",
    },
    generation_config: {
      speech_config: [
        {
          voice: voiceName || process.env.GEMINI_TTS_VOICE || DEFAULT_GEMINI_TTS_VOICE,
        },
      ],
    },
  });

  const audioData = extractAudioData(interaction);

  if (!audioData) {
    const error = new Error(`Gemini did not return audio. Response keys: ${Object.keys(interaction).join(", ")}`);
    error.status = 500;
    throw error;
  }

  return createWavBuffer(Buffer.from(audioData, "base64"));
}

