import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini OCR Service for Medical Notes
 * Uses Google's Gemini 2.0 Flash for superior handwriting and medical text recognition
 */
class GeminiOcrService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.apiKey = null;
  }

  /**
   * Initialize Gemini API
   * @param {string} apiKey - Gemini API key
   */
  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use Gemini 2.0 Flash for fast, accurate medical OCR
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.2, // Even lower for maximum medical accuracy
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Increased for detailed medical context
      }
    });
    
    console.log('✅ Gemini 2.0 Flash initialized');
  }

  /**
   * Extract text and medical data from canvas image
   * @param {string} imageDataUrl - Base64 image data URL from canvas
   * @returns {Promise<Object>} Extracted medical data
   */
  async extractFromCanvas(imageDataUrl) {
    try {
      if (!this.model) {
        throw new Error('Gemini API not initialized. Call initialize() first.');
      }

      console.log('🚀 Starting Gemini OCR extraction...');

      // Remove data URL prefix to get pure base64
      const base64Data = imageDataUrl.includes(',') 
        ? imageDataUrl.split(',')[1] 
        : imageDataUrl;

      // Enhanced medical prompt for Gemini with comprehensive context
      const prompt = `You are an expert medical transcriptionist and clinical documentation specialist with extensive knowledge of medical terminology, abbreviations, and handwriting patterns.

TASK: Extract and structure ALL information from this doctor's handwritten medical note with maximum accuracy.

MEDICAL CONTEXT & GUIDELINES:
1. COMMON MEDICAL ABBREVIATIONS:
   - BP = Blood Pressure, HR = Heart Rate, T/Temp = Temperature
   - RR = Respiratory Rate, O2/SpO2 = Oxygen Saturation
   - Wt = Weight, Ht = Height, BMI = Body Mass Index
   - Hx = History, Dx = Diagnosis, Tx = Treatment, Rx = Prescription
   - S/Sx = Symptoms, C/C = Chief Complaint, PMH = Past Medical History
   - F/U = Follow-up, PRN = As needed, BID = Twice daily, TID = Three times daily
   - QID = Four times daily, QD = Once daily, HS = At bedtime
   - NPO = Nothing by mouth, SOB = Shortness of breath, N/V = Nausea/Vomiting
   - DOE = Dyspnea on exertion, CP = Chest pain, HA = Headache
   - Abd = Abdominal, HEENT = Head, Eyes, Ears, Nose, Throat
   - CVS = Cardiovascular System, RS = Respiratory System, CNS = Central Nervous System
   - GI = Gastrointestinal, GU = Genitourinary, MSK = Musculoskeletal

2. VITAL SIGNS RANGES (for context):
   - BP: Normal 90/60 to 120/80 mmHg
   - HR: Normal 60-100 bpm
   - Temperature: Normal 97-99°F (36.1-37.2°C)
   - RR: Normal 12-20 breaths/min
   - O2 Saturation: Normal 95-100%

3. COMMON MEDICATIONS & DOSAGES:
   - Antibiotics: Amoxicillin (250mg-500mg), Azithromycin (250mg-500mg)
   - Pain relievers: Paracetamol/Acetaminophen (500mg-1000mg), Ibuprofen (200mg-800mg)
   - Diabetes: Metformin (500mg-1000mg), Insulin (units)
   - Hypertension: Amlodipine (5mg-10mg), Lisinopril (10mg-40mg)
   - Look for dosage patterns: mg, mcg, units, mL, tablets, capsules

4. HANDWRITING RECOGNITION TIPS:
   - Numbers: 1 vs 7, 0 vs O, 5 vs S, 8 vs B
   - Letters: a vs o, u vs v, i vs l, c vs e
   - Medical units: mg (milligrams), ml (milliliters), mcg (micrograms)
   - Decimal points vs commas: 120.5 vs 120,5
   - Slashes in BP readings: 120/80

5. CLINICAL STRUCTURE:
   - Subjective: Patient's complaints, symptoms, history
   - Objective: Physical findings, vital signs, examination
   - Assessment: Diagnosis, clinical impression
   - Plan: Treatment plan, medications, follow-up (SOAP format)

REQUIRED OUTPUT (JSON format):
{
  "fullText": "Complete word-for-word transcription of all handwritten text, preserving medical abbreviations",
  "chiefComplaint": "Main reason for visit - extract from 'C/C', 'Chief Complaint', or first symptom mentioned",
  "vitals": {
    "bloodPressure": "Format: 120/80 mmHg (or empty if not found)",
    "heartRate": "Format: 72 bpm (or empty)",
    "temperature": "Format: 98.6°F or 37°C (or empty)",
    "weight": "Format: 70 kg or 154 lbs (or empty)",
    "height": "Format: 175 cm or 5'9\" (or empty)",
    "oxygenSaturation": "Format: 98% (or empty)",
    "respiratoryRate": "Format: 16/min (or empty)",
    "bmi": "Format: 22.5 (or empty)"
  },
  "symptoms": [
    "List each symptom separately",
    "Include duration if mentioned (e.g., 'fever for 3 days')",
    "Include severity if noted (e.g., 'severe headache', 'mild cough')"
  ],
  "diagnosis": "Primary diagnosis or differential diagnoses - look for 'Dx:', 'Diagnosis:', 'Impression:', 'Assessment:'",
  "medications": [
    {
      "name": "Full medication name (brand or generic)",
      "dosage": "Amount per dose (e.g., 500mg, 10 units)",
      "frequency": "How often (e.g., BID, TID, once daily, every 6 hours)",
      "route": "How administered (e.g., oral, IV, topical) if mentioned",
      "duration": "How long (e.g., 7 days, 2 weeks, ongoing)"
    }
  ],
  "labResults": "Any lab test results mentioned (CBC, blood sugar, X-ray findings, etc.)",
  "physicalExamination": "Physical exam findings from HEENT, CVS, RS, Abd, etc.",
  "treatmentPlan": "Recommended treatments, procedures, lifestyle modifications",
  "followUp": "Follow-up instructions - date, conditions to watch, when to return",
  "pastMedicalHistory": "Any mentioned PMH, allergies, previous conditions",
  "additionalNotes": "Any other relevant information - impressions, referrals, patient education"
}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no explanations or markdown
- If a field is not found in the note, use empty string "" or empty array []
- Preserve exact medical abbreviations from the original note
- Include units with all measurements (mg, kg, mmHg, °F, etc.)
- For medications, parse carefully: "Amox 500mg TID x 7d" = Amoxicillin 500mg three times daily for 7 days
- Extract dates in standardized format: MM/DD/YYYY or text like "in 2 weeks"
- If handwriting is unclear for critical information, note "Unclear" rather than guessing
- For complex vitals (e.g., "BP: 120/80, HR: 72"), parse each separately
- Look for arrows (↑↓) indicating increase/decrease
- Recognize common exam findings: "clear", "normal", "tender", "swollen", etc.

EXAMPLES:
- "BP 120/80 HR 72 T 98.6" → bloodPressure: "120/80 mmHg", heartRate: "72 bpm", temperature: "98.6°F"
- "Amox 500 TID x7d" → name: "Amoxicillin", dosage: "500mg", frequency: "TID (three times daily)", duration: "7 days"
- "F/U 2 wks" → followUp: "Follow-up in 2 weeks"
- "Dx: URTI" → diagnosis: "URTI (Upper Respiratory Tract Infection)"

Analyze the image carefully, considering typical doctor handwriting patterns and medical documentation styles.`;

      // Generate content with image
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png'
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      console.log('📝 Raw Gemini response received');

      // Extract JSON from response
      let extractedData;
      
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          extractedData = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed structured medical data');
        } catch (parseError) {
          console.warn('⚠️ JSON parsing failed, using text response');
          extractedData = this.createFallbackStructure(text);
        }
      } else {
        console.warn('⚠️ No JSON found in response, creating fallback structure');
        extractedData = this.createFallbackStructure(text);
      }

      return {
        success: true,
        data: extractedData,
        rawResponse: text,
        model: 'gemini-2.0-flash-exp'
      };

    } catch (error) {
      console.error('❌ Gemini OCR Error:', error);
      
      // Provide helpful error messages
      let errorMessage = error.message;
      
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your Gemini API key in .env file';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Free tier: 15 requests/minute';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection';
      }

      return {
        success: false,
        error: errorMessage,
        data: null
      };
    }
  }

  /**
   * Create fallback data structure when JSON parsing fails
   * @param {string} text - Raw text response
   * @returns {Object} Structured data object
   */
  createFallbackStructure(text) {
    return {
      fullText: text,
      chiefComplaint: this.extractField(text, /(?:Chief Complaint|C\/C|CC):?\s*([^\n]+)/i),
      vitals: {
        bloodPressure: this.extractVital(text, /BP:?\s*(\d{2,3}\/\d{2,3})/i),
        heartRate: this.extractVital(text, /HR:?\s*(\d{2,3})\s*(bpm)?/i),
        temperature: this.extractVital(text, /T(?:emp)?:?\s*([\d.]+)\s*[°]?[FC]/i),
        weight: this.extractVital(text, /(?:Weight|Wt):?\s*([\d.]+)\s*(?:kg|lbs)?/i),
        height: this.extractVital(text, /(?:Height|Ht):?\s*([\d.]+)\s*(?:cm|in)?/i),
        oxygenSaturation: this.extractVital(text, /(?:O2|SpO2):?\s*(\d{2,3}%)/i),
        respiratoryRate: this.extractVital(text, /RR:?\s*(\d{1,2})/i),
        bmi: this.extractVital(text, /BMI:?\s*([\d.]+)/i)
      },
      symptoms: this.extractList(text, /(?:Symptoms?|S\/Sx):?\s*([^\n]+)/i),
      diagnosis: this.extractField(text, /(?:Diagnosis|Dx|Assessment|Impression):?\s*([^\n]+)/i),
      medications: this.extractMedications(text),
      labResults: this.extractField(text, /(?:Lab Results?|Labs?):?\s*([^\n]+)/i),
      physicalExamination: this.extractField(text, /(?:Physical Exam|PE|Examination):?\s*([^\n]+)/i),
      treatmentPlan: this.extractField(text, /(?:Treatment|Plan|Tx):?\s*([^\n]+)/i),
      followUp: this.extractField(text, /(?:Follow.?up|F\/U):?\s*([^\n]+)/i),
      pastMedicalHistory: this.extractField(text, /(?:PMH|Past Medical History|History):?\s*([^\n]+)/i),
      additionalNotes: ''
    };
  }

  /**
   * Extract a specific vital sign using regex
   */
  extractVital(text, regex) {
    const match = text.match(regex);
    return match ? match[1] : '';
  }

  /**
   * Extract a field using regex
   */
  extractField(text, regex) {
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract a list of items (symptoms, etc.)
   */
  extractList(text, regex) {
    const match = text.match(regex);
    if (!match) return [];
    
    return match[1]
      .split(/[,;]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Extract medications with basic parsing
   */
  extractMedications(text) {
    const medRegex = /(?:Rx|Medications?):?\s*([^\n]+)/gi;
    const matches = [];
    let match;

    while ((match = medRegex.exec(text)) !== null) {
      const medText = match[1].trim();
      matches.push({
        name: medText,
        dosage: '',
        frequency: '',
        duration: ''
      });
    }

    return matches;
  }

  /**
   * Simple text extraction without structured data
   * @param {string} imageDataUrl - Base64 image data URL
   * @returns {Promise<string>} Extracted text
   */
  async extractTextOnly(imageDataUrl) {
    try {
      if (!this.model) {
        throw new Error('Gemini API not initialized');
      }

      const base64Data = imageDataUrl.includes(',') 
        ? imageDataUrl.split(',')[1] 
        : imageDataUrl;

      const prompt = 'Transcribe ALL text from this medical note image. Provide only the exact transcription without any additional formatting, explanations, or analysis.';

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png'
          }
        }
      ]);

      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('❌ Gemini Text Extraction Error:', error);
      throw error;
    }
  }

  /**
   * Verify API key is valid
   * @returns {Promise<boolean>} True if API key is valid
   */
  async verifyApiKey() {
    try {
      const result = await this.model.generateContent('Test');
      return true;
    } catch (error) {
      console.error('❌ API Key Verification Failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const geminiOcrService = new GeminiOcrService();

// Auto-initialize with API key from environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
  try {
    geminiOcrService.initialize(apiKey);
    console.log('✅ Gemini OCR Service auto-initialized with API key from .env');
  } catch (error) {
    console.error('⚠️ Failed to auto-initialize Gemini:', error.message);
  }
} else {
  console.warn('⚠️ Gemini API key not found in environment. Please set VITE_GEMINI_API_KEY in .env file');
}

export default geminiOcrService;
