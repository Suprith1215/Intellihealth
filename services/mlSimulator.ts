
import { AssessmentResult, RiskLevel, RecoveryStage, RiskAssessmentInput } from '../types';

/**
 * PHASE 5: AI / ML INTELLIGENCE LAYER SIMULATION
 * 
 * In the real backend (Flask), these would be:
 * - Relapse Prediction: Gradient Boosting Classifier
 * - Severity Classification: Random Forest
 * - Stage Detection: Logistic Regression
 * 
 * This service mimics that logic deterministically for the demo.
 */

export const calculateRiskAssessment = (data: RiskAssessmentInput): AssessmentResult => {
  // 1. Feature Engineering (Simulated)
  const frequencyScore = (data.usageFrequency / 7) * 30; // Weight 30%
  const cravingScore = (data.cravingIntensity / 10) * 40; // Weight 40%
  const stressScore = (data.stressLevel / 10) * 20; // Weight 20%
  const historyScore = Math.min(data.relapseHistory * 5, 10); // Weight 10%

  // 2. Model "Inference"
  const totalRiskScore = frequencyScore + cravingScore + stressScore + historyScore;
  
  // 3. Classification Logic (Random Forest Logic Simulation)
  let riskLevel = RiskLevel.LOW;
  if (totalRiskScore > 75) riskLevel = RiskLevel.CRITICAL;
  else if (totalRiskScore > 50) riskLevel = RiskLevel.HIGH;
  else if (totalRiskScore > 25) riskLevel = RiskLevel.MODERATE;

  // 4. Recovery Stage Detection (Logistic Regression Logic Simulation)
  let stage = RecoveryStage.PRE_CONTEMPLATION;
  if (data.motivation > 8 && data.therapyWillingness) stage = RecoveryStage.ACTION;
  else if (data.motivation > 5) stage = RecoveryStage.PREPARATION;
  else if (data.motivation > 3) stage = RecoveryStage.CONTEMPLATION;

  // 5. Relapse Probability (Gradient Boosting Output Simulation)
  // Higher stress + poor sleep = higher relapse probability
  const relapseProb = Math.min(0.98, ((data.stressLevel + (10 - data.sleepQuality)) / 20) * 0.8 + 0.1);

  return {
    riskLevel,
    riskScore: Math.round(totalRiskScore),
    recoveryStage: stage,
    recommendedPlanId: `PLAN-${Math.floor(Math.random() * 1000)}`,
    predictedRelapseProb: parseFloat(relapseProb.toFixed(2)),
    featureImportance: [
      { feature: 'Craving Intensity', score: 0.35 },
      { feature: 'Sleep Quality', score: 0.25 },
      { feature: 'Stress Level', score: 0.20 },
      { feature: 'Usage Frequency', score: 0.15 },
      { feature: 'Relapse History', score: 0.05 },
    ]
  };
};

export const simulateTraining = async (datasetSize: number): Promise<{
  progress: number;
  completed: boolean;
  metrics?: any;
}> => {
  // Simulates an async training job returning metrics matching the Flask script
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        progress: 100,
        completed: true,
        metrics: {
          accuracy: 0.94,
          f1: 0.91,
          roc: 0.96,
          cv_acc: 0.92,
          cv_f1: 0.89,
          feature_importance: [0.35, 0.25, 0.20, 0.15, 0.05],
          feature_labels: ["Craving Index", "Sleep Quality", "Stress Level", "Usage Freq", "History"]
        }
      });
    }, 2000);
  });
};