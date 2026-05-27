
export enum AddictionType {
  ALCOHOL = 'Alcohol',
  SMOKING = 'Smoking',
  DRUGS = 'Substance Use',
  GAMBLING = 'Gambling',
  TECH = 'Technology/Social Media'
}

export enum RiskLevel {
  LOW = 'Low Risk',
  MODERATE = 'Moderate Risk',
  HIGH = 'High Risk',
  CRITICAL = 'Critical'
}

export enum RecoveryStage {
  PRE_CONTEMPLATION = 'Pre-contemplation',
  CONTEMPLATION = 'Contemplation',
  PREPARATION = 'Preparation',
  ACTION = 'Action',
  MAINTENANCE = 'Maintenance'
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  phoneNumber: string;
  emergencyContact: string;
  email?: string;
  avatarUrl?: string;
  joinedDate: string;
  points?: number;
}

export interface SurveyData {
  addictionType: AddictionType;
  answers: Record<string, number | string | boolean>; // Dynamic answers based on questions
  riskScore?: number;
}

export interface RiskAssessmentInput {
  usageFrequency: number;
  cravingIntensity: number;
  stressLevel: number;
  relapseHistory: number;
  motivation: number;
  therapyWillingness: boolean;
  sleepQuality: number;
}

export interface AssessmentResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  recoveryStage: RecoveryStage;
  recommendedPlanId: string;
  predictedRelapseProb: number; // 0-1
  featureImportance: { feature: string; score: number }[];
}

export interface DailyTask {
  id: string;
  title: string;
  type: 'medication' | 'therapy' | 'exercise' | 'journal' | 'check-in';
  completed: boolean;
  time?: string;
}

export interface DailyLog {
  date: string;
  mood: number; // 1-10
  craving: number; // 1-10
  stress: number; // 1-10
  sleepQuality: number; // 1-10
  sleepHours: number;
  triggers: string[]; // e.g., 'Stress', 'Boredom'
  relapse: boolean;
}
