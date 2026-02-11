
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

/**
 * INTELLIHEAL AI ENGINE
 * Powered by Google Gemini
 */

export const genAiService = {
  
  // 1. AI Recovery Coach (Chat Logic handled in Component, this helper is for specific prompts)
  
  // 2. AI Motivational Message Generator
  getDailyMotivation: async (name: string, streak: number, mood: number) => {
    try {
      const prompt = `Generate a short, powerful, empathetic motivational message for ${name} who is on day ${streak} of recovery. Their mood is ${mood}/10. Keep it under 20 words. No emojis.`;
      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      });
      return result.text || "Every step forward is a victory. Keep going.";
    } catch (error) {
      console.error("AI Error:", error);
      return "Every step forward is a victory. Keep going.";
    }
  },

  // 3. AI Personalized Recovery Plan Generator
  generatePersonalizedPlan: async (mood: number, stress: number, energy: number, focus: string) => {
    try {
      const prompt = `
        Act as an expert addiction recovery specialist and nutritionist.
        User Status: Mood ${mood}/10, Stress ${stress}/10, Energy ${energy}/10.
        Current Focus: ${focus}.
        
        Generate a daily recovery plan in JSON format with these exact fields:
        {
          "focusGoal": "Short goal string",
          "dietPlan": {
            "nutritionFocus": "String",
            "hydrationGoal": Number (liters),
            "meals": [{ "type": "Breakfast", "name": "Meal Name", "benefits": "Why this helps recovery" }, ...] (4 meals)
          },
          "exercisePlan": {
            "activity": "Activity Name",
            "durationMinutes": Number,
            "intensity": "Low" | "Medium" | "High",
            "focusArea": "String",
            "description": "Short description"
          }
        }
        Return ONLY valid JSON.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      return result.text ? JSON.parse(result.text) : null;
    } catch (error) {
      console.error("Plan Gen Error:", error);
      return null; // Component handles fallback
    }
  },

  // 4. AI Relapse Risk Explainer
  explainRisk: async (riskScore: number, factors: string[]) => {
    try {
      const prompt = `
        The user has a relapse risk of ${riskScore}%. 
        Contributing factors: ${factors.join(', ')}.
        Explain this risk to the user in a calm, non-alarmist, clinical but empathetic way. 
        Suggest one immediate simple action. Max 50 words.
      `;
      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      });
      return result.text || "Your risk metrics are elevated based on recent stress and sleep patterns. We recommend a short breathing exercise.";
    } catch (error) {
      return "Your risk metrics are elevated based on recent stress and sleep patterns. We recommend a short breathing exercise.";
    }
  },

  // 5. AI Journal Insight Engine
  analyzeJournal: async (entry: string) => {
    try {
      const prompt = `
        Analyze this journal entry for emotional themes and potential triggers: "${entry}"
        Return JSON:
        {
          "sentiment": "Positive" | "Neutral" | "Negative",
          "themes": ["Theme1", "Theme2"],
          "insight": "One deep psychological insight about this entry (max 15 words)"
        }
      `;
      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      return result.text ? JSON.parse(result.text) : { sentiment: "Neutral", themes: ["Processing"], insight: "Keep writing to explore these feelings further." };
    } catch (error) {
        return { sentiment: "Neutral", themes: ["Processing"], insight: "Keep writing to explore these feelings further." };
    }
  }
};
