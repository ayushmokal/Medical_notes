/**
 * ElevenLabs Speech-to-Text service
 * Uses the official ElevenLabs transcription endpoint with multipart upload.
 */
class ElevenLabsService {
    constructor() {
        this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
        this.baseUrl = 'https://api.elevenlabs.io';
        // Default to current production STT model
        this.modelId = 'scribe_v2';
    }

    getFilenameForMime(mimeType = '') {
        if (mimeType.includes('wav')) return 'recording.wav';
        if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'recording.mp3';
        if (mimeType.includes('mp4')) return 'recording.mp4';
        if (mimeType.includes('ogg')) return 'recording.ogg';
        return 'recording.webm';
    }

    async transcribeAudio(audioBlob, mimeType) {
        if (!this.apiKey) {
            throw new Error('Missing ElevenLabs API key (set VITE_ELEVENLABS_API_KEY)');
        }

        if (!audioBlob) {
            throw new Error('No audio provided for transcription');
        }

        const formData = new FormData();
        const filename = this.getFilenameForMime(mimeType || audioBlob.type);

        formData.append('file', audioBlob, filename);
        formData.append('model_id', this.modelId);
        formData.append('language_code', 'en');

        const response = await fetch(`${this.baseUrl}/v1/speech-to-text`, {
            method: 'POST',
            headers: {
                'xi-api-key': this.apiKey
            },
            body: formData
        });

        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = '[no body]';
            }
            console.error('❌ ElevenLabs STT error:', response.status, errorText);
            throw new Error(`ElevenLabs STT failed (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        // ElevenLabs returns { text: "..." }
        if (!data || !data.text) {
            console.error('Unexpected ElevenLabs response:', data);
            throw new Error('Empty transcription from ElevenLabs');
        }

        return data.text;
    }
}

const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;
