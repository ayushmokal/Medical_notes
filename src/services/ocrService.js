import Tesseract from 'tesseract.js';

export const ocrService = {
  // Extract text from image
  extractText: async (imageData) => {
    try {
      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: (m) => console.log(m)
      });
      return { success: true, text: result.data.text };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Extract medical data from text using basic pattern matching
  extractMedicalData: (text) => {
    const medicalData = {
      symptoms: [],
      diagnosis: [],
      medications: [],
      vitals: {},
      notes: text
    };

    // Extract vitals (BP, HR, Temp, etc.)
    const bpMatch = text.match(/BP:?\s*(\d+\/\d+)/i);
    if (bpMatch) medicalData.vitals.bloodPressure = bpMatch[1];

    const hrMatch = text.match(/HR:?\s*(\d+)/i);
    if (hrMatch) medicalData.vitals.heartRate = hrMatch[1];

    const tempMatch = text.match(/Temp(?:erature)?:?\s*(\d+\.?\d*)/i);
    if (tempMatch) medicalData.vitals.temperature = tempMatch[1];

    // Extract symptoms (lines starting with "Symptoms:", "Complaint:", etc.)
    const symptomsMatch = text.match(/(?:Symptoms?|Complaints?):?\s*([^\n]+)/i);
    if (symptomsMatch) {
      medicalData.symptoms = symptomsMatch[1].split(',').map(s => s.trim());
    }

    // Extract diagnosis
    const diagnosisMatch = text.match(/(?:Diagnosis|Dx):?\s*([^\n]+)/i);
    if (diagnosisMatch) {
      medicalData.diagnosis = diagnosisMatch[1].split(',').map(d => d.trim());
    }

    // Extract medications
    const medicationsMatch = text.match(/(?:Medications?|Rx|Prescription):?\s*([^\n]+)/i);
    if (medicationsMatch) {
      medicalData.medications = medicationsMatch[1].split(',').map(m => m.trim());
    }

    return medicalData;
  }
};
