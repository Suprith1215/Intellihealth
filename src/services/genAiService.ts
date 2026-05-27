import { GoogleGenerativeAI } from "@google/generative-ai";

// Use import.meta.env for Vite, or fallback to process.env defines
// @ts-ignore - Ignore TS complaining about import.meta.env in non-Vite strict mode
const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) || (typeof process !== 'undefined' && process.env.API_KEY) || '';

const genAI = new GoogleGenerativeAI(apiKey);
const safetySettings = [
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
    threshold: "BLOCK_NONE" as any,
  },
];
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings
});

/**
 * INTELLIHEAL AI ENGINE
 * Powered by Google Gemini
 */

export const genAiService = {

  // 1. AI Recovery Coach — MAIN CHATBOT FUNCTION
  chatWithAI: async (userMessage: string, conversationHistory: { role: string; text: string }[] = []) => {
    try {
      // Build readable history (last 12 turns)
      const historyText = conversationHistory
        .slice(-12)
        .map(m => `${m.role === 'user' ? 'User' : 'IntelliHeal AI'}: ${m.text}`)
        .join('\n\n');

      const prompt = `You are IntelliHeal AI — an elite, highly intelligent medical and mental health assistant built exclusively for the IntelliHeal platform.

ABOUT YOU:
- Specialized in addiction recovery, mental health, psychology, and holistic wellness.
- Evidence-based: You use proven medical facts, CBT, DBT, and mindfulness techniques.
- Professional, deeply accurate, yet exceedingly compassionate and non-judgmental.
- You must always respond in the SAME LANGUAGE the user writes in.

FORMATTING RULES (STRICT STRICT):
- YOUR ANSWERS MUST BE HIGHLY STRUCTURED, CLEAR, AND EASY TO READ.
- Use **Markdown headers (###)** to break down your response into logical, beautifully spaced sections.
- ALWAYS use **bullet points** or **numbered lists** to list steps, tips, or facts — absolutely no giant walls of text.
- **Bold** key terms, important concepts, numbers, and techniques to make them stand out instantly.
- Keep paragraphs very short (no more than 2-3 sentences max).
- Include a clear "**# Action Plan**" or "**# Key Takeaways**" header at the end if you give advice.
- You aim to feel like a premium, billion-dollar app's AI engine. Quality is everything.

HOW TO RESPOND:
- For cravings/urges: Validate their feeling fast, then provide an immediate, structured 3-step coping plan (e.g., HALT, Urge Surfing).
- For emotional distress: Offer true empathy, then list a structured grounding technique (like 5-4-3-2-1).
- For general questions: Provide a deeply accurate, meticulously structured, multi-part answer.
- For depression/crisis: Be warm but very urgent — heavily emphasize reaching out, and explicitly **bold** the Helpline: **iCall India: 9152987821**.

${historyText ? `CONVERSATION SO FAR:\n${historyText}\n\n` : ''}User: ${userMessage}

IntelliHeal AI:`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim() || null;
    } catch (error: any) {
      console.error("IntelliHeal Chat Error:", error);
      // If there's an API error, we bubble it up so the component can use fallback OR we return null
      return null;
    }
  },

  // 2. AI Motivational Message Generator
  getDailyMotivation: async (name: string, streak: number, mood: number) => {
    try {
      const prompt = `Generate a short, powerful, empathetic motivational message for ${name} who is on day ${streak} of recovery. Their mood is ${mood}/10. Keep it under 20 words. No emojis.`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim() || "Every step forward is a victory. Keep going.";
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

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Simple JSON extraction in case there are markdown backticks
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Plan Gen Error:", error);
      return null;
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
      const result = await model.generateContent(prompt);
      return result.response.text().trim() || "Your risk metrics are elevated based on recent stress and sleep patterns. We recommend a short breathing exercise.";
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
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      return { sentiment: "Neutral", themes: ["Processing"], insight: "Keep writing to explore these feelings further." };
    }
  }
};
