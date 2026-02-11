export interface DietPlan {
  nutritionFocus: string;
  hydrationGoal: number;
  meals: { type: string; name: string; benefits: string }[];
}

export interface ExercisePlan {
  activity: string;
  durationMinutes: number;
  intensity: 'Low' | 'Medium' | 'High';
  focusArea: string;
  description: string;
}

export interface WellnessPlanResult {
  focusGoal: string;
  dietPlan: DietPlan;
  exercisePlan: ExercisePlan;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  currentDay: number;
  category: 'mindfulness' | 'hydration' | 'sleep' | 'movement';
  isJoined: boolean;
  isCompleted: boolean;
  badgeName?: string;
  points: number;
}

export const getMockChallenges = (): Challenge[] => [
  {
    id: 'c1',
    title: '7-Day Mindfulness',
    description: 'Meditate for 10 minutes every day to reduce cortisol.',
    durationDays: 7,
    currentDay: 2,
    category: 'mindfulness',
    isJoined: false,
    isCompleted: false,
    badgeName: 'Zen Master',
    points: 100
  },
  {
    id: 'c2',
    title: '30-Day Hydration',
    description: 'Drink 3L of water daily for cellular repair and detox.',
    durationDays: 30,
    currentDay: 12, // Simulated existing progress
    category: 'hydration',
    isJoined: true,
    isCompleted: false,
    badgeName: 'Hydro Hero',
    points: 300
  },
  {
     id: 'c3',
     title: 'Sleep Reset',
     description: 'No screens 1 hour before bed for 14 days.',
     durationDays: 14,
     currentDay: 0,
     category: 'sleep',
     isJoined: false,
     isCompleted: false,
     badgeName: 'Dream Catcher',
     points: 200
  }
];

export const generateWellnessPlan = (mood: number, stress: number, energy: number): WellnessPlanResult => {
  // Logic: High Stress -> Magnesium/GABA + Low Intensity Cardio
  // Logic: Low Mood -> Omega-3/Protein + Moderate Intensity (Endorphins)
  // Logic: Low Energy -> Complex Carbs + Light Movement

  let focusGoal = "Maintenance & Balance";
  let dietPlan: DietPlan = {
    nutritionFocus: "Balanced Nutrition",
    hydrationGoal: 2.5,
    meals: []
  };
  let exercisePlan: ExercisePlan = {
    activity: "Brisk Walking",
    durationMinutes: 30,
    intensity: "Medium",
    focusArea: "General Fitness",
    description: "A steady pace walk to clear the mind and improve circulation without overtaxing the body."
  };

  // 1. Stress Dominant Logic (Stress > 7)
  if (stress > 7) {
    focusGoal = "Cortisol Reduction & Calm";
    dietPlan = {
      nutritionFocus: "Magnesium & GABA Support",
      hydrationGoal: 3.0,
      meals: [
        { type: "Breakfast", name: "Oatmeal with Almonds & Banana", benefits: "Complex carbs increase serotonin; almonds provide magnesium." },
        { type: "Lunch", name: "Spinach & Salmon Salad", benefits: "Leafy greens for stress reduction; Omega-3s for brain health." },
        { type: "Dinner", name: "Turkey Breast with Sweet Potato", benefits: "Tryptophan in turkey aids sleep; sweet potato regulates blood sugar." },
        { type: "Snack", name: "Dark Chocolate & Chamomile Tea", benefits: "Antioxidants and calming herbal properties." }
      ]
    };
    exercisePlan = {
      activity: "Restorative Yoga & Deep Breathing",
      durationMinutes: 45,
      intensity: "Low",
      focusArea: "Nervous System Regulation",
      description: "Focus on slow movements and long holds to activate the parasympathetic nervous system (rest and digest)."
    };
  } 
  // 2. Low Energy Logic (Energy < 4)
  else if (energy < 4) {
    focusGoal = "Energy Restoration";
    dietPlan = {
      nutritionFocus: "Sustained Glucose Release",
      hydrationGoal: 2.0,
      meals: [
        { type: "Breakfast", name: "Greek Yogurt with Berries", benefits: "High protein for alertness; antioxidants for cellular health." },
        { type: "Lunch", name: "Quinoa Bowl with Black Beans", benefits: "Iron and B-vitamins to combat fatigue." },
        { type: "Dinner", name: "Grilled Chicken & Brown Rice", benefits: "Lean protein and fiber for steady energy repair." },
        { type: "Snack", name: "Apple slices with Peanut Butter", benefits: "Quick natural sugar boost with stabilizing fats." }
      ]
    };
    exercisePlan = {
      activity: "Light Stretching & Nature Walk",
      durationMinutes: 20,
      intensity: "Low",
      focusArea: "Gentle Activation",
      description: "Low impact movement to get blood flowing without depleting limited energy reserves."
    };
  }
  // 3. Low Mood Logic (Mood < 4)
  else if (mood < 4) {
    focusGoal = "Dopamine & Endorphin Boost";
    dietPlan = {
      nutritionFocus: "Gut-Brain Axis Support",
      hydrationGoal: 2.5,
      meals: [
        { type: "Breakfast", name: "Eggs & Avocado Toast", benefits: "Choline and healthy fats support neurotransmitter function." },
        { type: "Lunch", name: "Probiotic Yogurt Parfait", benefits: "Gut health is directly linked to serotonin production." },
        { type: "Dinner", name: "Spicy Stir-Fry with Tofu/Beef", benefits: "Capsaicin in peppers can trigger mild endorphin release." },
        { type: "Snack", name: "Walnuts & Pumpkin Seeds", benefits: "Zinc and Omega-3s essential for mood regulation." }
      ]
    };
    exercisePlan = {
      activity: "Interval Cardio (HIIT) or Dance",
      durationMinutes: 25,
      intensity: "High",
      focusArea: "Mood Elevation",
      description: "Short bursts of intense activity are proven to release the most endorphins to combat low mood."
    };
  }
  // 4. High Energy/Good Mood (Optimization)
  else {
    focusGoal = "Strength & Resilience Building";
    dietPlan = {
      nutritionFocus: "Muscle Repair & Metabolic Health",
      hydrationGoal: 3.5,
      meals: [
        { type: "Breakfast", name: "Protein Smoothie Bowl", benefits: "High protein start to fuel intense activity." },
        { type: "Lunch", name: "Lean Steak/Tempeh Salad", benefits: "Iron and protein for muscle synthesis." },
        { type: "Dinner", name: "Baked Cod with Asparagus", benefits: "Light, high-nutrient density dinner for recovery." },
        { type: "Snack", name: "Protein Bar / Hard Boiled Egg", benefits: "Sustained satiety and muscle fuel." }
      ]
    };
    exercisePlan = {
      activity: "Resistance Training / Weightlifting",
      durationMinutes: 60,
      intensity: "High",
      focusArea: "Physical Strength",
      description: "Utilize high energy levels to build physical discipline and resilience, reinforcing mental fortitude."
    };
  }

  return { focusGoal, dietPlan, exercisePlan };
};