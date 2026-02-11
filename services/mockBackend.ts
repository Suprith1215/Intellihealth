
import { UserProfile, DailyTask } from '../types';

export const mockUser: UserProfile = {
  id: 'user_12345',
  name: 'Alex Mercer',
  email: 'alex.mercer@example.com',
  age: 32,
  phoneNumber: '+1 (555) 123-4567',
  emergencyContact: '+1 (555) 987-6543',
  joinedDate: '2023-10-15',
  avatarUrl: 'https://picsum.photos/200/200'
};

export const getDailyPlan = async (): Promise<DailyTask[]> => {
  return [
    { id: '1', title: 'Morning Meditation (10 min)', type: 'exercise', completed: true, time: '08:00 AM' },
    { id: '2', title: 'Log Mood & Cravings', type: 'check-in', completed: false, time: '12:00 PM' },
    { id: '3', title: 'CBT Session: Identifying Triggers', type: 'therapy', completed: false, time: '02:00 PM' },
    { id: '4', title: 'Evening Walk', type: 'exercise', completed: false, time: '06:00 PM' },
    { id: '5', title: 'Gratitude Journaling', type: 'journal', completed: false, time: '09:00 PM' },
  ];
};

export const getMonthlyProgress = async (): Promise<any[]> => {
    // Generate 30 days of synthetic data
    const data = [];
    const baseCraving = 7;
    const baseMood = 4;
    
    for (let i = 0; i < 30; i++) {
        // Trend: Craving goes down, Mood goes up over time
        const cravingTrend = Math.max(1, baseCraving - (i * 0.15) + (Math.random() * 2 - 1));
        const moodTrend = Math.min(10, baseMood + (i * 0.18) + (Math.random() * 2 - 1));
        
        data.push({
            day: `Day ${i + 1}`,
            craving: Number(cravingTrend.toFixed(1)),
            mood: Number(moodTrend.toFixed(1)),
            relapseProb: Number((0.8 - (i * 0.02)).toFixed(2)) // Relapse prob decreasing
        });
    }
    return data;
};