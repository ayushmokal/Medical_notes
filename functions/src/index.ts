import { setGlobalOptions } from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

export const chatWithCoach = onCall(async (request) => {
    const { message, history } = request.data;
    const uid = request.auth?.uid;

    if (!uid) {
        throw new Error("Unauthenticated");
    }

    logger.info("Chat with coach", { uid, message });

    // Mock AI response for now
    // In production, use Genkit or OpenAI API here
    const response = "I'm your AI health coach. I see you're doing great! (Mock Response)";

    return {
        response,
        timestamp: new Date().toISOString()
    };
});

export const calculateScores = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new Error("Unauthenticated");
    }

    // Mock score calculation
    // In production, fetch health metrics from Firestore and calculate
    const scores = {
        sleep: Math.floor(Math.random() * 30) + 70,
        recovery: Math.floor(Math.random() * 30) + 70,
        activity: Math.floor(Math.random() * 30) + 70,
        date: new Date().toISOString()
    };

    // Save to Firestore
    await admin.firestore().collection("user_scores").add({
        uid,
        ...scores
    });

    return scores;
});
