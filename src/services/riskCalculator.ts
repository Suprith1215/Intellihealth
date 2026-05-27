import { AddictionType, AssessmentResult, RiskLevel, RecoveryStage } from '../types';

interface AnswerData {
    addictionType: AddictionType;
    answers: Record<string, any>;
}

/**
 * Calculate comprehensive risk assessment based on actual survey answers
 */
export function calculateDynamicRiskAssessment(data: AnswerData): AssessmentResult {
    const { addictionType, answers } = data;

    let riskScore = 0;
    let maxPossibleScore = 0;

    // Calculate risk based on addiction type and answers
    switch (addictionType) {
        case AddictionType.ALCOHOL:
            riskScore = calculateAlcoholRisk(answers);
            maxPossibleScore = 100;
            break;
        case AddictionType.SMOKING:
            riskScore = calculateSmokingRisk(answers);
            maxPossibleScore = 100;
            break;
        case AddictionType.DRUGS:
            riskScore = calculateDrugRisk(answers);
            maxPossibleScore = 100;
            break;
        case AddictionType.GAMBLING:
            riskScore = calculateGamblingRisk(answers);
            maxPossibleScore = 100;
            break;
        case AddictionType.TECH:
            riskScore = calculateTechRisk(answers);
            maxPossibleScore = 100;
            break;
    }

    // Normalize to 0-100
    const normalizedScore = Math.min(100, Math.max(0, riskScore));

    // Determine risk level
    let riskLevel: RiskLevel;
    if (normalizedScore < 25) riskLevel = RiskLevel.LOW;
    else if (normalizedScore < 50) riskLevel = RiskLevel.MODERATE;
    else if (normalizedScore < 75) riskLevel = RiskLevel.HIGH;
    else riskLevel = RiskLevel.CRITICAL;

    // Determine recovery stage
    let recoveryStage: RecoveryStage;
    if (normalizedScore > 70) recoveryStage = RecoveryStage.PRE_CONTEMPLATION;
    else if (normalizedScore > 50) recoveryStage = RecoveryStage.CONTEMPLATION;
    else if (normalizedScore > 30) recoveryStage = RecoveryStage.PREPARATION;
    else if (normalizedScore > 15) recoveryStage = RecoveryStage.ACTION;
    else recoveryStage = RecoveryStage.MAINTENANCE;

    // Calculate relapse probability (0-1)
    const predictedRelapseProb = Math.min(1, normalizedScore / 100);

    // Calculate dynamic feature importance based on actual answers
    const featureImportance = calculateFeatureImportance(addictionType, answers, normalizedScore);

    return {
        riskLevel,
        riskScore: normalizedScore,
        recoveryStage,
        recommendedPlanId: `plan_${addictionType.toLowerCase()}_${riskLevel.toLowerCase()}`,
        predictedRelapseProb,
        featureImportance
    };
}

function calculateAlcoholRisk(answers: Record<string, any>): number {
    let score = 0;

    // Q1: Frequency (0-7) -> 0-15 points
    score += (answers.q1 || 0) * 2.14;

    // Q2: Drinks per day (number) -> 0-15 points
    const drinksPerDay = answers.q2 || 0;
    if (drinksPerDay > 10) score += 15;
    else if (drinksPerDay > 5) score += 10;
    else if (drinksPerDay > 2) score += 5;

    // Q3: Unable to stop (1-10) -> 0-15 points
    score += ((answers.q3 || 1) - 1) * 1.67;

    // Q4-Q9: Boolean questions (6 questions) -> 0-30 points (5 each)
    ['q4', 'q5', 'q7', 'q8', 'q9'].forEach(q => {
        if (answers[q] === true) score += 6;
    });

    // Q6: Guilt (1-10) -> 0-10 points
    score += ((answers.q6 || 1) - 1) * 1.11;

    // Q10: Stress cravings (1-10) -> 0-15 points
    score += ((answers.q10 || 1) - 1) * 1.67;

    return score;
}

function calculateSmokingRisk(answers: Record<string, any>): number {
    let score = 0;

    // Q1: Time to first cigarette (minutes) -> 0-20 points
    const minutesToFirst = answers.q1 || 60;
    if (minutesToFirst <= 5) score += 20;
    else if (minutesToFirst <= 30) score += 15;
    else if (minutesToFirst <= 60) score += 10;
    else score += 5;

    // Q4: Cigarettes per day -> 0-25 points
    const cigsPerDay = answers.q4 || 0;
    if (cigsPerDay > 30) score += 25;
    else if (cigsPerDay > 20) score += 20;
    else if (cigsPerDay > 10) score += 15;
    else if (cigsPerDay > 5) score += 10;
    else score += 5;

    // Q2, Q3, Q5, Q6, Q8, Q9: Boolean (6 questions) -> 0-30 points
    ['q2', 'q3', 'q5', 'q6', 'q8', 'q9'].forEach(q => {
        if (answers[q] === true) score += 5;
    });

    // Q7: Smell triggers (1-10) -> 0-15 points
    score += ((answers.q7 || 1) - 1) * 1.67;

    // Q10: Stress smoking (1-10) -> 0-10 points
    score += ((answers.q10 || 1) - 1) * 1.11;

    return score;
}

function calculateDrugRisk(answers: Record<string, any>): number {
    let score = 0;

    // Boolean questions (q1, q2, q4, q6, q7, q8, q10) -> 0-50 points
    ['q1', 'q2', 'q4', 'q6', 'q7', 'q8', 'q10'].forEach(q => {
        if (answers[q] === true) score += 7.14;
    });

    // Q3: Able to stop (inverted) -> 0-15 points
    if (answers.q3 === false) score += 15;

    // Q5: Guilt (1-10) -> 0-15 points
    score += ((answers.q5 || 1) - 1) * 1.67;

    // Q9: Withdrawal (1-10) -> 0-20 points
    score += ((answers.q9 || 1) - 1) * 2.22;

    return score;
}

function calculateGamblingRisk(answers: Record<string, any>): number {
    let score = 0;

    // Boolean questions (q1, q2, q4, q5, q6, q7, q9) -> 0-50 points
    ['q1', 'q2', 'q4', 'q5', 'q6', 'q7', 'q9'].forEach(q => {
        if (answers[q] === true) score += 7.14;
    });

    // Q3: Sleep loss (1-10) -> 0-20 points
    score += ((answers.q3 || 1) - 1) * 2.22;

    // Q8: Depression (1-10) -> 0-20 points
    score += ((answers.q8 || 1) - 1) * 2.22;

    // Q10: Escape gambling (1-10) -> 0-10 points
    score += ((answers.q10 || 1) - 1) * 1.11;

    return score;
}

function calculateTechRisk(answers: Record<string, any>): number {
    let score = 0;

    // Q1: Hours per day -> 0-25 points
    const hoursPerDay = answers.q1 || 0;
    if (hoursPerDay > 10) score += 25;
    else if (hoursPerDay > 6) score += 20;
    else if (hoursPerDay > 4) score += 15;
    else if (hoursPerDay > 2) score += 10;
    else score += 5;

    // Q2: Anxiety (1-10) -> 0-20 points
    score += ((answers.q2 || 1) - 1) * 2.22;

    // Q4: Sleep impact (1-10) -> 0-20 points
    score += ((answers.q4 || 1) - 1) * 2.22;

    // Boolean questions (q3, q5, q6, q7, q8, q9, q10) -> 0-35 points
    ['q3', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'].forEach(q => {
        if (answers[q] === true) score += 5;
    });

    return score;
}

/**
 * Calculate dynamic feature importance based on actual answers
 * This provides personalized insights into what factors contribute most to the user's risk
 */
function calculateFeatureImportance(
    addictionType: AddictionType,
    answers: Record<string, any>,
    totalScore: number
): Array<{ feature: string; score: number }> {
    const features: Array<{ feature: string; score: number }> = [];

    switch (addictionType) {
        case AddictionType.ALCOHOL:
            // Analyze alcohol-specific factors
            const frequency = (answers.q1 || 0) * 2.14;
            const quantity = answers.q2 > 5 ? 15 : (answers.q2 > 2 ? 10 : 5);
            const lossOfControl = ((answers.q3 || 1) - 1) * 1.67;
            const negativeConsequences = ['q4', 'q5', 'q7', 'q8', 'q9'].filter(q => answers[q] === true).length * 6;
            const guilt = ((answers.q6 || 1) - 1) * 1.11;
            const stressCravings = ((answers.q10 || 1) - 1) * 1.67;

            features.push(
                { feature: 'Drinking Frequency', score: frequency / totalScore },
                { feature: 'Quantity per Session', score: quantity / totalScore },
                { feature: 'Loss of Control', score: lossOfControl / totalScore },
                { feature: 'Negative Consequences', score: negativeConsequences / totalScore },
                { feature: 'Guilt & Remorse', score: guilt / totalScore },
                { feature: 'Stress-Related Drinking', score: stressCravings / totalScore }
            );
            break;

        case AddictionType.SMOKING:
            const timeToFirst = answers.q1 <= 5 ? 20 : (answers.q1 <= 30 ? 15 : 10);
            const cigsPerDay = answers.q4 > 20 ? 25 : (answers.q4 > 10 ? 15 : 10);
            const behavioralPatterns = ['q2', 'q3', 'q5', 'q6', 'q8', 'q9'].filter(q => answers[q] === true).length * 5;
            const triggerSensitivity = ((answers.q7 || 1) - 1) * 1.67;
            const stressSmoking = ((answers.q10 || 1) - 1) * 1.11;

            features.push(
                { feature: 'Morning Dependence', score: timeToFirst / totalScore },
                { feature: 'Daily Consumption', score: cigsPerDay / totalScore },
                { feature: 'Behavioral Patterns', score: behavioralPatterns / totalScore },
                { feature: 'Trigger Sensitivity', score: triggerSensitivity / totalScore },
                { feature: 'Stress Smoking', score: stressSmoking / totalScore }
            );
            break;

        case AddictionType.DRUGS:
            const usagePatterns = ['q1', 'q2', 'q4', 'q6', 'q7', 'q8', 'q10'].filter(q => answers[q] === true).length * 7.14;
            const controlAbility = answers.q3 === false ? 15 : 0;
            const guiltScore = ((answers.q5 || 1) - 1) * 1.67;
            const withdrawal = ((answers.q9 || 1) - 1) * 2.22;

            features.push(
                { feature: 'Usage Patterns', score: usagePatterns / totalScore },
                { feature: 'Ability to Control', score: controlAbility / totalScore },
                { feature: 'Guilt & Shame', score: guiltScore / totalScore },
                { feature: 'Withdrawal Symptoms', score: withdrawal / totalScore },
                { feature: 'Life Impact', score: (usagePatterns * 0.3) / totalScore }
            );
            break;

        case AddictionType.GAMBLING:
            const gamblingBehaviors = ['q1', 'q2', 'q4', 'q5', 'q6', 'q7', 'q9'].filter(q => answers[q] === true).length * 7.14;
            const sleepImpact = ((answers.q3 || 1) - 1) * 2.22;
            const depression = ((answers.q8 || 1) - 1) * 2.22;
            const escapeGambling = ((answers.q10 || 1) - 1) * 1.11;

            features.push(
                { feature: 'Gambling Behaviors', score: gamblingBehaviors / totalScore },
                { feature: 'Sleep Disruption', score: sleepImpact / totalScore },
                { feature: 'Emotional Impact', score: depression / totalScore },
                { feature: 'Escape Motivation', score: escapeGambling / totalScore },
                { feature: 'Financial Consequences', score: (gamblingBehaviors * 0.4) / totalScore }
            );
            break;

        case AddictionType.TECH:
            const dailyUsage = answers.q1 > 6 ? 25 : (answers.q1 > 4 ? 15 : 10);
            const anxiety = ((answers.q2 || 1) - 1) * 2.22;
            const sleepDisruption = ((answers.q4 || 1) - 1) * 2.22;
            const techBehaviors = ['q3', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'].filter(q => answers[q] === true).length * 5;

            features.push(
                { feature: 'Daily Screen Time', score: dailyUsage / totalScore },
                { feature: 'Disconnection Anxiety', score: anxiety / totalScore },
                { feature: 'Sleep Impact', score: sleepDisruption / totalScore },
                { feature: 'Compulsive Behaviors', score: techBehaviors / totalScore },
                { feature: 'Social Withdrawal', score: (techBehaviors * 0.3) / totalScore }
            );
            break;
    }

    // Sort by score descending and normalize to ensure they sum to ~1
    features.sort((a, b) => b.score - a.score);

    // Normalize scores to sum to 1
    const sum = features.reduce((acc, f) => acc + f.score, 0);
    if (sum > 0) {
        features.forEach(f => f.score = Math.max(0, Math.min(1, f.score / sum)));
    }

    // Return top 5 features
    return features.slice(0, 5);
}
