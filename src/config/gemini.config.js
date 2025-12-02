// Gemini API Configuration for Medical Notes OCR

export const geminiConfig = {
  // Gemini API Key - Your actual key
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  
  // Model configuration - Using Gemini 2.0 Flash for speed and accuracy
  model: 'gemini-2.0-flash-exp',
  
  // Generation configuration
  generationConfig: {
    temperature: 0.4,      // Lower = more consistent/accurate
    topK: 32,
    topP: 1,
    maxOutputTokens: 2048
  },
  
  // Rate limiting (free tier)
  rateLimiting: {
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    requestDelay: 4000 // 4 seconds between requests
  },
  
  // Features
  features: {
    structuredExtraction: true,  // Extract medical data in JSON format
    handwritingRecognition: true, // Excellent handwriting OCR
    medicalContext: true,         // Understands medical terminology
    multiLanguage: false          // English only for medical safety
  },
  
  // API endpoint
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
};

/**
 * Validate Gemini configuration
 * @returns {Object} Validation result
 */
export function validateGeminiConfig() {
  const apiKey = geminiConfig.apiKey;
  
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return {
      valid: false,
      message: '⚠️ Gemini API key not configured. Using fallback Tesseract.js',
      suggestion: 'Add VITE_GEMINI_API_KEY to your .env file'
    };
  }
  
  if (apiKey.length < 20) {
    return {
      valid: false,
      message: '⚠️ Gemini API key appears invalid (too short)',
      suggestion: 'Check your API key from https://aistudio.google.com/app/apikey'
    };
  }
  
  console.log('✅ Gemini API key configured');
  return {
    valid: true,
    message: '✅ Gemini 2.0 Flash ready for OCR',
    model: geminiConfig.model
  };
}

/**
 * Get API key from config or environment
 * @returns {string} API key
 */
export function getApiKey() {
  return geminiConfig.apiKey;
}

/**
 * Check if Gemini is available
 * @returns {boolean} True if Gemini can be used
 */
export function isGeminiAvailable() {
  return validateGeminiConfig().valid;
}
