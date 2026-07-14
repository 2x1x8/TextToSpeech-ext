# SelectSpeak

SelectSpeak is a browser extension backed by a Node.js/Express API. The extension sends page text to a secure backend for language detection and speech generation. The backend uses Gemini for language detection and TTS, with ElevenLabs available as a fallback for quota, rate-limit, or server failures. The browser never receives provider API keys.

## Backend

```powershell
cd backend
npm install
New-Item .env -ItemType File
notepad .env
npm run dev
```

The extension expects the backend at `http://localhost:3000`.

Required `.env` values:

```env
GEMINI_API_KEY=your_gemini_key
GEMINI_TEXT_MODEL=gemini-3.5-flash
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
GEMINI_TTS_VOICE=Kore
TTS_PROVIDER=gemini
TTS_FALLBACK_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_default_voice_id
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
PORT=3000
```

`TTS_PROVIDER=gemini` makes Gemini the primary speech provider. `TTS_FALLBACK_PROVIDER=elevenlabs` keeps ElevenLabs available when Gemini returns a quota, rate-limit, or server error.

## Extension

Load the `frontend` directory as an unpacked Chrome extension. Use the popup or context menu to generate backend-powered speech playback.
