
import { UserProfile, SurveyData, AssessmentResult, DailyLog } from '../types';

/**
 * MOCK DATABASE SERVICE (MongoDB Simulation)
 * 
 * In a real-world scenario, this would connect to a MongoDB Atlas cluster via Flask.
 * Here, we use LocalStorage to persist data across reloads to simulate a database.
 */

const DB_KEYS = {
  USER: 'addictivecare_user_v1',
  SURVEY: 'addictivecare_survey_v1',
  ASSESSMENT: 'addictivecare_assessment_v1',
  LOGS: 'addictivecare_logs_v1'
};

export const db = {
  // --- User Collection ---
  saveUser: (user: UserProfile): void => {
    // Ensure points exist
    if (!user.points) user.points = 0;
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    console.log('[MongoDB Mock] User record saved:', user.id);
  },

  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(DB_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  // --- Survey Collection ---
  saveSurvey: (data: SurveyData): void => {
    localStorage.setItem(DB_KEYS.SURVEY, JSON.stringify(data));
    console.log('[MongoDB Mock] Survey response saved');
  },

  getSurvey: (): SurveyData | null => {
    const data = localStorage.getItem(DB_KEYS.SURVEY);
    return data ? JSON.parse(data) : null;
  },

  // --- Assessment Collection ---
  saveAssessment: (data: AssessmentResult): void => {
    localStorage.setItem(DB_KEYS.ASSESSMENT, JSON.stringify(data));
  },

  getAssessment: (): AssessmentResult | null => {
    const data = localStorage.getItem(DB_KEYS.ASSESSMENT);
    return data ? JSON.parse(data) : null;
  },

  // --- Progress Logs Collection ---
  getLogs: (): DailyLog[] => {
    const data = localStorage.getItem(DB_KEYS.LOGS);
    if (data) return JSON.parse(data);

    // If no logs, generate mock history for visualization
    const mockLogs = generateMockHistory();
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(mockLogs));
    return mockLogs;
  },

  saveLog: (log: DailyLog): void => {
    const logs = db.getLogs();
    // Replace if date exists, else push
    const index = logs.findIndex(l => l.date === log.date);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
  },

  clearDatabase: (): void => {
    localStorage.removeItem(DB_KEYS.USER);
    localStorage.removeItem(DB_KEYS.SURVEY);
    localStorage.removeItem(DB_KEYS.ASSESSMENT);
    localStorage.removeItem(DB_KEYS.LOGS);
    window.location.reload();
  }
};

// Helper to generate 30 days of mock data
function generateMockHistory(): DailyLog[] {
  const logs: DailyLog[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Simulate recovery trend: Mood goes up, Craving goes down over time
    const progressFactor = (30 - i) / 30; // 0 to 1
    
    const baseMood = 4 + (progressFactor * 4); // 4 -> 8
    const baseCraving = 8 - (progressFactor * 5); // 8 -> 3
    
    // Add randomness
    const mood = Math.min(10, Math.max(1, Math.round(baseMood + (Math.random() * 2 - 1))));
    const craving = Math.min(10, Math.max(1, Math.round(baseCraving + (Math.random() * 3 - 1.5))));
    const stress = Math.min(10, Math.max(1, Math.round(7 - (progressFactor * 3) + (Math.random() * 2 - 1))));
    const sleepQuality = Math.min(10, Math.max(1, Math.round(5 + (progressFactor * 3) + (Math.random() * 2 - 1))));
    
    const triggers = [];
    if (Math.random() > 0.7) triggers.push('Stress');
    if (Math.random() > 0.8) triggers.push('Boredom');
    if (Math.random() > 0.9) triggers.push('Social');

    logs.push({
      date: dateStr,
      mood,
      craving,
      stress,
      sleepQuality,
      sleepHours: Math.round(6 + (Math.random() * 2)),
      triggers,
      relapse: false
    });
  }
  return logs;
}
