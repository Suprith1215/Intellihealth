
import { AddictionType } from './types';

export const APP_NAME = "IntelliHeal";
export const APP_VERSION = "1.0.0-beta";

export const ADDICTION_OPTIONS = [
  { value: AddictionType.ALCOHOL, label: 'Alcohol', emoji: '🍺', gradient: 'from-amber-500 to-orange-600' },
  { value: AddictionType.SMOKING, label: 'Smoking/Nicotine', emoji: '🚬', gradient: 'from-gray-500 to-slate-700' },
  { value: AddictionType.DRUGS, label: 'Drugs/Substances', emoji: '💊', gradient: 'from-purple-500 to-pink-600' },
  { value: AddictionType.GAMBLING, label: 'Gambling', emoji: '🎰', gradient: 'from-green-500 to-emerald-600' },
  { value: AddictionType.TECH, label: 'Technology/Social Media', emoji: '📱', gradient: 'from-blue-500 to-cyan-600' },
];

export interface Question {
  id: string;
  text: string;
  type: 'scale' | 'boolean' | 'number';
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

// 10 Personalized Questions per Addiction Type
export const DYNAMIC_QUESTIONS: Record<AddictionType, Question[]> = {
  [AddictionType.ALCOHOL]: [
    { id: 'q1', text: 'How often do you have a drink containing alcohol?', type: 'scale', min: 0, max: 7, minLabel: 'Never', maxLabel: 'Daily' },
    { id: 'q2', text: 'How many drinks do you have on a typical day when you are drinking?', type: 'number' },
    { id: 'q3', text: 'How often do you find that you are not able to stop drinking once you have started?', type: 'scale', min: 1, max: 10, minLabel: 'Never', maxLabel: 'Always' },
    { id: 'q4', text: 'Have you failed to do what was normally expected of you because of drinking?', type: 'boolean' },
    { id: 'q5', text: 'Do you need a drink in the morning to get yourself going after a heavy drinking session?', type: 'boolean' },
    { id: 'q6', text: 'Do you feel guilt or remorse after drinking?', type: 'scale', min: 1, max: 10, minLabel: 'No Guilt', maxLabel: 'Extreme Guilt' },
    { id: 'q7', text: 'Have you been unable to remember what happened the night before because of your drinking?', type: 'boolean' },
    { id: 'q8', text: 'Have you or someone else been injured because of your drinking?', type: 'boolean' },
    { id: 'q9', text: 'Has a relative, friend, doctor, or other health care worker been concerned about your drinking or suggested you cut down?', type: 'boolean' },
    { id: 'q10', text: 'On a scale of 1-10, how intense are your cravings when you are stressed?', type: 'scale', min: 1, max: 10, minLabel: 'None', maxLabel: 'Unbearable' }
  ],
  [AddictionType.SMOKING]: [
    { id: 'q1', text: 'How soon after you wake up do you smoke your first cigarette?', type: 'number' }, // minutes
    { id: 'q2', text: 'Do you find it difficult to refrain from smoking in places where it is forbidden?', type: 'boolean' },
    { id: 'q3', text: 'Which cigarette would you hate most to give up?', type: 'boolean' }, // true = first one, false = others
    { id: 'q4', text: 'How many cigarettes do you smoke per day?', type: 'number' },
    { id: 'q5', text: 'Do you smoke more frequently during the first hours after waking than during the rest of the day?', type: 'boolean' },
    { id: 'q6', text: 'Do you smoke if you are so ill that you are in bed most of the day?', type: 'boolean' },
    { id: 'q7', text: 'Does the smell of smoke trigger a craving?', type: 'scale', min: 1, max: 10, minLabel: 'No', maxLabel: 'Instantly' },
    { id: 'q8', text: 'Have you tried to quit before?', type: 'boolean' },
    { id: 'q9', text: 'How does smoking affect your physical activity/stamina?', type: 'scale', min: 1, max: 10, minLabel: 'Not at all', maxLabel: 'Severely' },
    { id: 'q10', text: 'Do you smoke to manage stress or anxiety?', type: 'scale', min: 1, max: 10, minLabel: 'Never', maxLabel: 'Always' }
  ],
  [AddictionType.DRUGS]: [
    { id: 'q1', text: 'Have you used drugs other than those required for medical reasons?', type: 'boolean' },
    { id: 'q2', text: 'Do you abuse more than one drug at a time?', type: 'boolean' },
    { id: 'q3', text: 'Are you always able to stop using when you want to?', type: 'boolean' },
    { id: 'q4', text: 'Have you had "blackouts" or "flashbacks" as a result of drug use?', type: 'boolean' },
    { id: 'q5', text: 'Do you ever feel bad or guilty about your drug use?', type: 'scale', min: 1, max: 10, minLabel: 'No', maxLabel: 'Intense Guilt' },
    { id: 'q6', text: 'Does your spouse (or parents) ever complain about your drug use?', type: 'boolean' },
    { id: 'q7', text: 'Have you neglected your family because of your use of drugs?', type: 'boolean' },
    { id: 'q8', text: 'Have you engaged in illegal activities in order to obtain drugs?', type: 'boolean' },
    { id: 'q9', text: 'Have you ever experienced withdrawal symptoms (felt sick) when you stopped taking drugs?', type: 'scale', min: 1, max: 10, minLabel: 'None', maxLabel: 'Severe' },
    { id: 'q10', text: 'Have you had medical problems as a result of your drug use (e.g., memory loss, hepatitis, convulsions, bleeding)?', type: 'boolean' }
  ],
  [AddictionType.GAMBLING]: [
    { id: 'q1', text: 'Have you often gambled longer than you had planned?', type: 'boolean' },
    { id: 'q2', text: 'Have you often gambled until your last dollar was gone?', type: 'boolean' },
    { id: 'q3', text: 'Have thoughts of gambling caused you to lose sleep?', type: 'scale', min: 1, max: 10, minLabel: 'Never', maxLabel: 'Frequently' },
    { id: 'q4', text: 'Have you used your income or savings to gamble while letting bills go unpaid?', type: 'boolean' },
    { id: 'q5', text: 'Have you made repeated, unsuccessful attempts to stop gambling?', type: 'boolean' },
    { id: 'q6', text: 'Have you broken the law or considered breaking the law to finance your gambling?', type: 'boolean' },
    { id: 'q7', text: 'Have you borrowed money to finance your gambling?', type: 'boolean' },
    { id: 'q8', text: 'Have you ever felt depressed or suicidal because of your gambling losses?', type: 'scale', min: 1, max: 10, minLabel: 'Never', maxLabel: 'Often' },
    { id: 'q9', text: 'Have you been remorseful after gambling?', type: 'boolean' },
    { id: 'q10', text: 'Do you gamble to escape worry, trouble, boredom, or loneliness?', type: 'scale', min: 1, max: 10, minLabel: 'Never', maxLabel: 'Always' }
  ],
  [AddictionType.TECH]: [
    { id: 'q1', text: 'How many hours per day do you spend on non-work/school related technology?', type: 'number' },
    { id: 'q2', text: 'Do you feel anxious or irritable when you cannot check your phone/social media?', type: 'scale', min: 1, max: 10, minLabel: 'Not at all', maxLabel: 'Panic' },
    { id: 'q3', text: 'Do you check your phone immediately upon waking up?', type: 'boolean' },
    { id: 'q4', text: 'Has your technology use affected your sleep patterns?', type: 'scale', min: 1, max: 10, minLabel: 'No effect', maxLabel: 'Severe Insomnia' },
    { id: 'q5', text: 'Do you use technology to escape from real-life problems or negative feelings?', type: 'boolean' },
    { id: 'q6', text: 'Have you tried to cut down on screen time but failed?', type: 'boolean' },
    { id: 'q7', text: 'Do you neglect personal hygiene or eating due to gaming/internet use?', type: 'boolean' },
    { id: 'q8', text: 'Do you lie to others about the amount of time you spend online?', type: 'boolean' },
    { id: 'q9', text: 'Do you feel your social life in the real world has suffered?', type: 'boolean' },
    { id: 'q10', text: 'Do you experience phantom vibration syndrome (thinking your phone buzzed when it didnt)?', type: 'boolean' }
  ]
};

// Mock data for graphs
export const MOCK_PROGRESS_DATA = [
  { day: 'Mon', craving: 8, mood: 4 },
  { day: 'Tue', craving: 7, mood: 5 },
  { day: 'Wed', craving: 6, mood: 5 },
  { day: 'Thu', craving: 5, mood: 6 },
  { day: 'Fri', craving: 4, mood: 7 },
  { day: 'Sat', craving: 3, mood: 8 },
  { day: 'Sun', craving: 2, mood: 8 },
];
