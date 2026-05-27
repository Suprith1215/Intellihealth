// Exercise Video Service
// Provides dynamic exercise video data with support for random suggestions

export interface ExerciseVideo {
    id: number;
    name: string;
    type: 'Cardio' | 'Strength' | 'Yoga' | 'Stretching';
    videoId: string;
    intensity: 'Low' | 'Medium' | 'High';
    duration?: number;
    description?: string;
}

class ExerciseVideoService {
    private exerciseDatabase: ExerciseVideo[] = [
        // --- CARDIO ---
        { id: 101, name: "15 Min Fat Burn", type: "Cardio", videoId: "ml6cT4AZdqI", intensity: "High", duration: 15 },
        { id: 102, name: "Low Impact Cardio", type: "Cardio", videoId: "kAU_8m_U3P8", intensity: "Medium", duration: 20 },
        { id: 103, name: "10 Min HIIT Burn", type: "Cardio", videoId: "Vd9PjYv48X8", intensity: "High", duration: 10 },
        { id: 104, name: "Walking Home Workout", type: "Cardio", videoId: "ml6cT4AZdqI", intensity: "Low", duration: 15 },
        { id: 105, name: "Tabata Quick Blast", type: "Cardio", videoId: "Rw3T2_2NS_M", intensity: "High", duration: 20 },
        { id: 106, name: "Dance Cardio Session", type: "Cardio", videoId: "Nm8wdcZptlw", intensity: "Medium", duration: 30 },

        // --- STRENGTH ---
        { id: 201, name: "Bodyweight Strength", type: "Strength", videoId: "UItWltVZZmE", intensity: "Medium", duration: 25 },
        { id: 202, name: "Beginner Weight Training", type: "Strength", videoId: "N1e-3XJ9Z0A", intensity: "Low", duration: 20 },
        { id: 203, name: "Upper Body Sculpt", type: "Strength", videoId: "hAGfBjvIRFI", intensity: "Medium", duration: 15 },
        { id: 204, name: "Ab Core Foundation", type: "Strength", videoId: "dJlFmxiL11s", intensity: "Medium", duration: 10 },
        { id: 205, name: "Full Body Resistance", type: "Strength", videoId: "95846CBGUvM", intensity: "High", duration: 30 },

        // --- YOGA ---
        { id: 301, name: "Yoga for Beginners", type: "Yoga", videoId: "v7AYKMP6bjM", intensity: "Low", duration: 20 },
        { id: 302, name: "Morning Yoga Flow", type: "Yoga", videoId: "4pKly2JojMw", intensity: "Low", duration: 15 },
        { id: 303, name: "Stress Relief Yoga", type: "Yoga", videoId: "s2h4Jq1fC2Y", intensity: "Low", duration: 20 },
        { id: 304, name: "Bedtime Yin Yoga", type: "Yoga", videoId: "BiWDsfZ3zbo", intensity: "Low", duration: 25 },
        { id: 305, name: "Anxiety Relief Flow", type: "Yoga", videoId: "bJJWArRfKa0", intensity: "Low", duration: 15 },

        // --- STRETCHING ---
        { id: 401, name: "Full Body Deep Stretch", type: "Stretching", videoId: "g_tea8ZNk5A", intensity: "Low", duration: 15 },
        { id: 402, name: "Morning Routine Stretch", type: "Stretching", videoId: "L_xrDAtykMI", intensity: "Low", duration: 10 },
        { id: 403, name: "Flexibility Routine", type: "Stretching", videoId: "q_v4S61xL-w", intensity: "Low", duration: 20 },
        { id: 404, name: "Tension Release", type: "Stretching", videoId: "X3-gKAn619k", intensity: "Low", duration: 12 },
        { id: 405, name: "Hip & Back Opening", type: "Stretching", videoId: "NInGto_jU8A", intensity: "Low", duration: 15 },
    ];

    private lastSuggestedId: number | null = null;

    /**
     * Get all exercise videos
     */
    getAllExercises(): Promise<ExerciseVideo[]> {
        return Promise.resolve([...this.exerciseDatabase]);
    }

    /**
     * Get exercises by category
     */
    getExercisesByCategory(category: ExerciseVideo['type']): Promise<ExerciseVideo[]> {
        const filtered = this.exerciseDatabase.filter(ex => ex.type === category);
        return Promise.resolve(filtered);
    }

    /**
     * Get exercises by intensity
     */
    getExercisesByIntensity(intensity: ExerciseVideo['intensity']): Promise<ExerciseVideo[]> {
        const filtered = this.exerciseDatabase.filter(ex => ex.intensity === intensity);
        return Promise.resolve(filtered);
    }

    /**
     * Get a random exercise video (avoids repeating the last suggested video)
     */
    getRandomExercise(category?: ExerciseVideo['type']): Promise<ExerciseVideo> {
        let pool = category
            ? this.exerciseDatabase.filter(ex => ex.type === category)
            : this.exerciseDatabase;

        // If we have a last suggested ID and pool has more than 1 item, exclude it
        if (this.lastSuggestedId !== null && pool.length > 1) {
            pool = pool.filter(ex => ex.id !== this.lastSuggestedId);
        }

        const randomIndex = Math.floor(Math.random() * pool.length);
        const selected = pool[randomIndex];
        this.lastSuggestedId = selected.id;

        return Promise.resolve(selected);
    }

    /**
     * Get multiple random exercises (for variety)
     */
    getRandomExercises(count: number, category?: ExerciseVideo['type']): Promise<ExerciseVideo[]> {
        let pool = category
            ? this.exerciseDatabase.filter(ex => ex.type === category)
            : [...this.exerciseDatabase];

        // Shuffle the pool
        const shuffled = pool.sort(() => Math.random() - 0.5);

        return Promise.resolve(shuffled.slice(0, Math.min(count, shuffled.length)));
    }

    /**
     * Get exercise by ID
     */
    getExerciseById(id: number): Promise<ExerciseVideo | null> {
        const exercise = this.exerciseDatabase.find(ex => ex.id === id);
        return Promise.resolve(exercise || null);
    }

    /**
     * Get all available categories
     */
    getCategories(): string[] {
        return ['Cardio', 'Strength', 'Yoga', 'Stretching'];
    }
}

export const exerciseVideoService = new ExerciseVideoService();
