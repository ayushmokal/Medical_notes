import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Ensure EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
} else {
    console.warn("AI Service: Missing EXPO_PUBLIC_GEMINI_API_KEY");
}

export const getCoachResponse = async (userMessage, healthData, sessions = []) => {
    if (!model) {
        return "I'm having trouble connecting to my brain. Please check the API key configuration.";
    }

    try {
        // Format recent sessions
        const recentSessions = sessions.slice(0, 3).map(s => {
            const date = s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown Date';
            return `- Date: ${date}\n  Diagnosis: ${s.diagnosis}\n  Notes: ${s.notes}\n  Prescription: ${s.prescription}`;
        }).join('\n\n');

        // Construct context from health data
        const context = `
You are an empathetic and knowledgeable AI Health Coach.
The user's current health data is:
- Sleep Score: ${healthData.sleepScore} (Duration: ${healthData.sleep}h)
- Recovery Score: ${healthData.recoveryScore} (HRV: ${healthData.hrv}ms)
- Activity Score: ${healthData.activityScore} (Steps: ${healthData.steps})
- Overall Health Score: ${healthData.overallScore}

Recent Doctor Sessions:
${recentSessions || "No recent sessions found."}

Provide a helpful, encouraging, and concise response to the user's message.
Focus on insights derived from their data and doctor's notes.
Do not give medical advice. If the user asks for medical advice, kindly remind them to consult a doctor.
Keep responses under 3 sentences unless asked for detailed analysis.
`;

        const prompt = `${context}\n\nUser: ${userMessage}\nCoach:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("AI Service Error:", error);
        return "I'm sorry, I'm having trouble processing that right now. Please try again later.";
    }
};
