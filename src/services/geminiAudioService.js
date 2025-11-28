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
    }

    initialize(apiKey) {
        if (!apiKey) {
            throw new Error('Gemini API key is required');
        }

        this.apiKey = apiKey;
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Use Gemini 1.5 Flash for audio support
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
            }
        });

        console.log('✅ Gemini Audio Service initialized (gemini-1.5-flash)');
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
     * @returns {Promise<Object>} Structured medical notes
     */
    async processAudioSession(audioBlob) {
        try {
            if (!this.model) {
                throw new Error('Gemini Audio Service not initialized');
            }

            console.log('🚀 Processing audio session with Gemini...');
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
                prompt,
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: 'audio/mp3' // Adjust based on recorder output, usually webm or mp3
                    }
                }
            ]);

            const response = await result.response;
            const text = response.text();

            console.log('📝 Gemini Audio response received');

            // Parse JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse JSON from Gemini response');
            }

        } catch (error) {
            console.error('❌ Gemini Audio Processing Error:', error);
            throw error;
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
