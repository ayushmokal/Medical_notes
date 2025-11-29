import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini Audio Service for Medical Sessions
 * Uses Gemini 1.5 Flash for multimodal (audio) understanding
 */
class GeminiAudioService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.apiKey = null;
        this.apiVersion = 'v1';
    }

    normalizeMimeType(mime) {
        if (!mime) return 'audio/webm';
        const lower = mime.toLowerCase();
        if (lower.includes('webm')) return 'audio/webm';
        if (lower.includes('ogg')) return 'audio/ogg';
        if (lower.includes('wav')) return 'audio/wav';
        if (lower.includes('mp3') || lower.includes('mpeg')) return 'audio/mpeg';
        if (lower.includes('mp4')) return 'audio/mp4';
        return 'audio/webm';
    }

    initialize(apiKey) {
        if (!apiKey) {
            throw new Error('Gemini API key is required');
        }

        this.apiKey = apiKey;
        this.genAI = new GoogleGenerativeAI(apiKey, { apiVersion: this.apiVersion });

        // Use latest 1.5 Flash (audio-capable) model name (v1 endpoint)
        const modelName = 'gemini-1.5-flash';

        this.model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
                // Force JSON so we can parse reliably
                responseMimeType: 'application/json'
            }
        });

        console.log(`✅ Gemini Audio Service initialized (${modelName}, apiVersion=${this.apiVersion})`);
    }

    /**
     * Convert Blob to Base64 string
     */
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Process audio session and generate medical notes
     * @param {Blob} audioBlob - The recorded audio blob
     * @param {string} [mimeTypeOverride] - Optional mime type hint from recorder
     * @returns {Promise<Object>} Structured medical notes
     */
    async processAudioSession(audioBlob, mimeTypeOverride) {
        try {
            if (!audioBlob) {
                throw new Error('No audio provided for transcription');
            }

            // Lazy re-init in case constructor failed to run
            if (!this.model) {
                if (this.apiKey) {
                    this.initialize(this.apiKey);
                } else {
                    throw new Error('Gemini Audio Service not initialized');
                }
            }

            const resolvedMimeType = this.normalizeMimeType(mimeTypeOverride || audioBlob.type);

            console.log('🚀 Processing audio session with Gemini...', {
                mimeType: resolvedMimeType,
                size: audioBlob.size
            });
            const base64Audio = await this.blobToBase64(audioBlob);

            const prompt = `
You are an expert medical scribe. Listen to this doctor-patient consultation and generate a structured SOAP note.

OUTPUT FORMAT (JSON ONLY):
{
  "summary": "Brief summary of the conversation",
  "soap": {
    "subjective": "Patient's chief complaint, HPI, symptoms",
    "objective": "Vital signs (if mentioned), physical exam findings",
    "assessment": "Diagnosis or differential diagnosis",
    "plan": "Medications, treatment, follow-up instructions"
  },
  "extractedData": {
    "chiefComplaint": "",
    "symptoms": [],
    "diagnosis": "",
    "medications": [],
    "followUp": ""
  }
}

CRITICAL:
- Be accurate and professional.
- Use medical terminology where appropriate.
- If information is missing (e.g., no vitals mentioned), leave that field empty.
- Return ONLY valid JSON.
`;

            const result = await this.model.generateContent([
                { text: prompt },
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: resolvedMimeType
                    }
                }
            ]);

            const response = result.response ? await result.response : result;

            const extractText = (resp) => {
                if (!resp) return '';
                if (typeof resp.text === 'function') {
                    try {
                        return resp.text();
                    } catch (e) {
                        console.warn('Gemini response.text() failed, falling back to candidates', e);
                    }
                }
                const parts = resp.candidates?.[0]?.content?.parts;
                if (Array.isArray(parts)) {
                    const joined = parts
                        .map(p => p.text)
                        .filter(Boolean)
                        .join('\n');
                    if (joined) return joined;
                }
                return '';
            };

            const text = extractText(response);

            console.log('📝 Gemini Audio response received');

            if (!text) {
                throw new Error('Empty response from Gemini Audio');
            }

            // Parse JSON response, fallback to best-effort regex
            try {
                return JSON.parse(text);
            } catch (primaryParseError) {
                const jsonMatch = text?.match?.(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }

                console.error('Gemini audio raw response:', text);
                throw new Error('Failed to parse JSON from Gemini response');
            }

        } catch (error) {
            console.error('❌ Gemini Audio Processing Error:', error);
            throw error;
        }
    }

    /**
     * Convert plain transcript text into structured SOAP JSON using Gemini
     * @param {string} transcript - text from STT
     */
    async processTranscriptText(transcript) {
        if (!transcript || !transcript.trim()) {
            throw new Error('Transcript is empty');
        }

        // Lazy init if needed
        if (!this.model) {
            if (this.apiKey) {
                this.initialize(this.apiKey);
            } else {
                throw new Error('Gemini Audio Service not initialized');
            }
        }

        const prompt = `You are an expert medical scribe. Convert the following consultation transcript into structured SOAP JSON.

OUTPUT FORMAT (JSON ONLY):
{
  "summary": "Brief summary of the conversation",
  "soap": {
    "subjective": "Patient's chief complaint, HPI, symptoms",
    "objective": "Vital signs (if mentioned), physical exam findings",
    "assessment": "Diagnosis or differential diagnosis",
    "plan": "Medications, treatment, follow-up instructions"
  },
  "extractedData": {
    "chiefComplaint": "",
    "symptoms": [],
    "diagnosis": "",
    "medications": [],
    "followUp": ""
  }
}

Transcript:
${transcript}
`;

        const result = await this.model.generateContent([{ text: prompt }]);
        const response = result.response ? await result.response : result;
        const text = response.text ? response.text() : '';

        if (!text) {
            throw new Error('Empty response from Gemini text generation');
        }

        try {
            return JSON.parse(text);
        } catch (primaryParseError) {
            const jsonMatch = text?.match?.(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            console.error('Gemini text raw response:', text);
            throw new Error('Failed to parse JSON from Gemini text response');
        }
    }
}

const geminiAudioService = new GeminiAudioService();

// Auto-initialize
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
        geminiAudioService.initialize(apiKey);
    } catch (e) {
        console.error('Failed to auto-init Gemini Audio:', e);
    }
}

export default geminiAudioService;
