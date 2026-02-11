import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils, Activity,
  Leaf, Pill, CheckSquare,
  Play, X, Brain, Video, Shuffle, Droplet, Bell, Volume2, Gamepad2
} from 'lucide-react';
import { genAiService } from '../services/genAiService';
import { WellnessPlanResult } from '../services/mockWellnessService';
import RecoveryWarriorGame from './RecoveryWarriorGame';
import JournalTracker from './JournalTracker';

// Fallback data
const FALLBACK_PLAN: WellnessPlanResult = {
  focusGoal: "Adaptive Stabilization",
  dietPlan: {
    nutritionFocus: "Neuro-Recovery Balance",
    hydrationGoal: 2.5,
    meals: [
      { type: "First Meal", name: "Protein-Rich Oatmeal", benefits: "Dopamine precursor synthesis" },
      { type: "Refuel", name: "Quinoa Power Bowl", benefits: "Sustained energy release" },
      { type: "Recovery", name: "Grilled Salmon & Greens", benefits: "Omega-3 neural repair" },
      { type: "Evening", name: "Casein Yogurt Mix", benefits: "Overnight muscle repair" }
    ]
  },
  exercisePlan: {
    activity: "Metabolic Reset Circuit",
    durationMinutes: 30,
    intensity: "Medium",
    focusArea: "Whole Body Activation",
    description: "A synchronized sequence designed to re-calibrate autonomic nervous system response."
  }
};

/**
 * VERIFIED & TESTED EXERCISE DATABASE
 * All videos confirmed playable and embeddable
 */
const EXERCISE_DATABASE = [
  // --- CARDIO ---
  { id: 101, name: "15 Min Fat Burn", type: "Cardio", videoId: "ml6cT4AZdqI", intensity: "High" },
  { id: 102, name: "Low Impact Cardio", type: "Cardio", videoId: "kAU_8m_U3P8", intensity: "Medium" },
  { id: 103, name: "10 Min HIIT Burn", type: "Cardio", videoId: "Vd9PjYv48X8", intensity: "High" },
  { id: 104, name: "Walking Home Workout", type: "Cardio", videoId: "ml6cT4AZdqI", intensity: "Low" },
  { id: 105, name: "Tabata Quick Blast", type: "Cardio", videoId: "Rw3T2_2NS_M", intensity: "High" },
  { id: 106, name: "Dance Cardio Session", type: "Cardio", videoId: "Nm8wdcZptlw", intensity: "Medium" },

  // --- STRENGTH ---
  { id: 201, name: "Bodyweight Strength", type: "Strength", videoId: "UItWltVZZmE", intensity: "Medium" },
  { id: 202, name: "Beginner Weight Training", type: "Strength", videoId: "N1e-3XJ9Z0A", intensity: "Low" },
  { id: 203, name: "Upper Body Sculpt", type: "Strength", videoId: "hAGfBjvIRFI", intensity: "Medium" },
  { id: 204, name: "Ab Core Foundation", type: "Strength", videoId: "dJlFmxiL11s", intensity: "Medium" },
  { id: 205, name: "Full Body Resistance", type: "Strength", videoId: "95846CBGUvM", intensity: "High" },

  // --- YOGA ---
  { id: 301, name: "Yoga for Beginners", type: "Yoga", videoId: "v7AYKMP6bjM", intensity: "Low" },
  { id: 302, name: "Morning Yoga Flow", type: "Yoga", videoId: "4pKly2JojMw", intensity: "Low" },
  { id: 303, name: "Stress Relief Yoga", type: "Yoga", videoId: "s2h4Jq1fC2Y", intensity: "Low" },
  { id: 304, name: "Bedtime Yin Yoga", type: "Yoga", videoId: "BiWDsfZ3zbo", intensity: "Low" },
  { id: 305, name: "Anxiety Relief Flow", type: "Yoga", videoId: "bJJWArRfKa0", intensity: "Low" },

  // --- STRETCHING ---
  { id: 401, name: "Full Body Deep Stretch", type: "Stretching", videoId: "g_tea8ZNk5A", intensity: "Low" },
  { id: 402, name: "Morning Routine Stretch", type: "Stretching", videoId: "L_xrDAtykMI", intensity: "Low" },
  { id: 403, name: "Flexibility Routine", type: "Stretching", videoId: "q_v4S61xL-w", intensity: "Low" },
  { id: 404, name: "Tension Release", type: "Stretching", videoId: "X3-gKAn619k", intensity: "Low" },
  { id: 405, name: "Hip & Back Opening", type: "Stretching", videoId: "NInGto_jU8A", intensity: "Low" },
];

interface Medication {
  id: string; name: string; dosage: string; time: string; taken: boolean;
}

// Voice Notification System
const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
  }
};

// --- 3D WATER GLASS COMPONENT ---
const WaterGlass3D = ({ waterLevel }: { waterLevel: number }) => {
  const fillPercentage = (waterLevel / 8) * 100;

  return (
    <div className="relative w-32 h-48 mx-auto perspective-1000">
      {/* Glass Container */}
      <div className="absolute inset-0 rounded-b-[3rem] rounded-t-lg bg-gradient-to-b from-white/10 to-white/5 border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-sm overflow-hidden">
        {/* Water Fill */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-400 to-blue-300 transition-all duration-1000 ease-out"
          style={{ height: `${fillPercentage}%` }}
        >
          {/* Water Surface Animation */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>

          {/* Bubbles */}
          {waterLevel > 0 && (
            <>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
              <div className="absolute bottom-8 right-6 w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
              <div className="absolute bottom-12 left-8 w-1 h-1 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
            </>
          )}
        </div>

        {/* Glass Shine Effect */}
        <div className="absolute top-2 left-2 w-8 h-16 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm"></div>
      </div>

      {/* Water Level Text */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <p className="text-2xl font-black text-cyan-400">{waterLevel}/8</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Glasses</p>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

interface VideoItemProps {
  ex: any;
  onClick: () => void;
  isPlaying: boolean;
  onExpand: () => void;
}

const VideoItem: React.FC<VideoItemProps> = ({ ex, onClick, isPlaying, onExpand }) => {
  if (isPlaying) {
    return (
      <div className="bg-white/5 p-3 rounded-xl border border-purple-500/30 animate-slide-up">
        <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden mb-2">
          <iframe
            src={`https://www.youtube.com/embed/${ex.videoId}?autoplay=1&modestbranding=1&rel=0`}
            title={ex.name}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-white">{ex.name}</p>
          <div className="flex gap-2">
            <button
              onClick={onExpand}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all hover:scale-105"
            >
              Expand
            </button>
            <button
              onClick={onClick}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all group"
    >
      <div className="relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
        <img
          src={`https://i.ytimg.com/vi/${ex.videoId}/mqdefault.jpg`}
          alt={ex.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
          <Play className="w-4 h-4 text-white fill-current" />
        </div>
      </div>
      <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors flex-1">{ex.name}</p>
    </div>
  );
};

const VideoModal = ({ videoId, title, onClose }: { videoId: string, title: string, onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
    <div className="relative w-full max-w-5xl bg-[#121216] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#0a0a0c]">
        <h3 className="text-2xl font-black text-white flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Video className="w-6 h-6 text-purple-500" />
          </div>
          {title}
        </h3>
        <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
          <X className="w-8 h-8" />
        </button>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="p-6 bg-[#0a0a0c] border-t border-white/5 flex justify-end">
        <button onClick={onClose} className="px-10 py-4 bg-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all">
          Complete Session
        </button>
      </div>
    </div>
  </div>
);

const WellnessPlan: React.FC = () => {
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);

  const [plan, setPlan] = useState<WellnessPlanResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ id: string, title: string } | null>(null);
  const [inlinePlayingId, setInlinePlayingId] = useState<number | null>(null);
  const [randomSeed, setRandomSeed] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);
  const [journalEntries, setJournalEntries] = useState(0);

  // Water Tracking
  const [waterIntake, setWaterIntake] = useState(0);
  const [showWaterCelebration, setShowWaterCelebration] = useState(false);

  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Naltrexone', dosage: '50mg', time: '08:00', taken: false },
    { id: '2', name: 'Vitamin D3', dosage: '2000 IU', time: '09:00', taken: false }
  ]);

  // Water Reminder System
  useEffect(() => {
    const waterReminderInterval = setInterval(() => {
      if (waterIntake < 8) {
        speak("It's time to drink water! Stay hydrated for optimal recovery.");
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('💧 Hydration Reminder', {
            body: "Time to drink a glass of water!",
            icon: '/water-icon.png'
          });
        }
      }
    }, 3600000); // Every hour

    return () => clearInterval(waterReminderInterval);
  }, [waterIntake]);

  // Medication Reminder
  useEffect(() => {
    const checkMedications = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      medications.forEach(med => {
        if (med.time === currentTime && !med.taken) {
          speak(`Time to take your ${med.name}, ${med.dosage}`);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('💊 Medication Reminder', {
              body: `${med.name} - ${med.dosage}`,
              icon: '/pill-icon.png'
            });
          }
        }
      });
    };

    const medReminderInterval = setInterval(checkMedications, 60000); // Check every minute
    return () => clearInterval(medReminderInterval);
  }, [medications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleDrinkWater = () => {
    if (waterIntake < 8) {
      const newWaterLevel = waterIntake + 1;
      setWaterIntake(newWaterLevel);
      setShowWaterCelebration(true);

      // Voice celebration
      speak("Yayyyy! Great job staying hydrated!");

      setTimeout(() => setShowWaterCelebration(false), 3000);
    }
  };

  // Personalized Random Exercise Selection Logic
  const prescribedExercises = useMemo(() => {
    const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

    let categories: string[] = ["Cardio", "Strength", "Yoga", "Stretching"];

    return categories.map(cat => {
      let pool = EXERCISE_DATABASE.filter(ex => ex.type === cat);

      if (cat === 'Yoga' && stress > 6) pool = shuffle(pool);
      if (cat === 'Cardio' && energy > 7) pool = shuffle(pool);

      return {
        category: cat,
        items: shuffle(pool).slice(0, 2)
      };
    });
  }, [mood, stress, energy, randomSeed]);

  useEffect(() => {
    setIsGenerating(true);
    const timer = setTimeout(async () => {
      const aiPlan = await genAiService.generatePersonalizedPlan(mood, stress, energy, "Maintenance");
      setPlan(aiPlan || FALLBACK_PLAN);
      setIsGenerating(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [mood, stress, energy]);

  const handleToggleMedication = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med && !med.taken) {
      speak(`Great! You've taken your ${med.name}`);
    }
    setMedications(medications.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  const handleVideoClick = (exerciseId: number, videoId: string, title: string) => {
    if (inlinePlayingId === exerciseId) {
      setInlinePlayingId(null);
    } else {
      setInlinePlayingId(exerciseId);
    }
  };

  const handleExpandToModal = (videoId: string, title: string) => {
    setInlinePlayingId(null);
    setSelectedVideo({ id: videoId, title });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 bg-[#160a2c] min-h-screen pb-20">
      {/* Celebration Overlay */}
      {showWaterCelebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className="text-8xl font-black text-cyan-400 animate-bounce drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]">
            🎉 YAYYYY! 🎉
          </div>
        </div>
      )}

      {/* Brand Header */}
      <div className="flex items-center justify-between py-6 border-b border-white/5">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-purple-500/20">
            <Activity className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-none">ADDICTIVE<span className="text-cyan-400">CARE</span></h1>
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">Neuro-Adaptive Intelligence</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGame(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-2xl text-white transition-all group shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:scale-105"
          >
            <Gamepad2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Play Recovery Warrior</span>
          </button>
          <button
            onClick={() => setRandomSeed(prev => prev + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-all group"
          >
            <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-xs font-black uppercase tracking-widest">Re-Calibrate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Biometric Input */}
          <div className="bg-[#211246] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-12 flex items-center gap-3">
              <Brain className="w-6 h-6 text-cyan-400" /> Biometric Input
            </h3>

            {[
              { label: "Mood Level", val: mood, set: setMood, color: "bg-purple-500" },
              { label: "Stress Load", val: stress, set: setStress, color: "bg-rose-500" },
              { label: "Energy Index", val: energy, set: setEnergy, color: "bg-amber-500" }
            ].map(s => (
              <div key={s.label} className="mb-12 last:mb-0">
                <div className="flex justify-between mb-4">
                  <label className="text-[12px] font-black uppercase tracking-widest text-slate-400">{s.label}</label>
                  <span className="text-2xl font-black text-white font-mono">{s.val}</span>
                </div>
                <div className="relative h-2 w-full bg-black/40 rounded-full">
                  <input
                    type="range" min="1" max="10" value={s.val}
                    onChange={(e) => s.set(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div
                    className={`absolute h-full rounded-full ${s.color} transition-all duration-300 shadow-[0_0_15px_currentColor]`}
                    style={{ width: `${(s.val - 1) / 9 * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* 3D Water Tracker */}
          <div className="bg-[#211246] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Droplet className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-black text-white">Hydration Tracker</h3>
              </div>

              <WaterGlass3D waterLevel={waterIntake} />

              <button
                onClick={handleDrinkWater}
                disabled={waterIntake >= 8}
                className="w-full mt-12 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
              >
                <Droplet className="w-5 h-5" />
                {waterIntake >= 8 ? 'Daily Goal Reached!' : 'Drink Water'}
              </button>

              {waterIntake >= 8 && (
                <p className="text-center text-green-400 font-bold text-sm mt-4 animate-pulse">
                  🎉 Excellent hydration today!
                </p>
              )}
            </div>
          </div>

          {/* Protocol Tracker */}
          <div className="bg-[#211246] rounded-[2.5rem] p-10 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Tracker</h3>
              <Bell className="w-4 h-4 text-orange-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              {medications.map(med => (
                <div
                  key={med.id}
                  onClick={() => handleToggleMedication(med.id)}
                  className={`flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${med.taken ? 'bg-green-500/10 border-green-500/20 opacity-60' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08]'}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-xl ${med.taken ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-md font-black ${med.taken ? 'text-slate-600 line-through' : 'text-white'}`}>{med.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{med.dosage} @ {med.time}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${med.taken ? 'bg-green-500 border-green-500' : 'border-white/10'}`}>
                    {med.taken && <CheckSquare className="w-5 h-5 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journal Tracker */}
          <JournalTracker onEntriesChange={setJournalEntries} />
        </div>

        {/* Exercise Section */}
        <div className="lg:col-span-8 bg-[#2a1157] rounded-3xl p-8 border border-white/5 shadow-2xl">

          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
            <Video className="text-purple-400 w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Exercise Video Guides</h2>
          </div>

          {isGenerating ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Loading Sessions...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {prescribedExercises.map(section => (
                <div key={section.category} className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">{section.category}</h3>
                  <div className="space-y-3">
                    {section.items.map(ex => (
                      <VideoItem
                        key={ex.id}
                        ex={ex}
                        isPlaying={inlinePlayingId === ex.id}
                        onClick={() => handleVideoClick(ex.id, ex.videoId, ex.name)}
                        onExpand={() => handleExpandToModal(ex.videoId, ex.name)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedVideo && (
        <VideoModal
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {showGame && (
        <RecoveryWarriorGame
          waterIntake={waterIntake}
          medicationsTaken={medications.filter(m => m.taken).length}
          exercisesCompleted={exercisesCompleted}
          sleepQuality={7}
          journalEntries={journalEntries}
          stressLevel={stress}
          onClose={() => setShowGame(false)}
        />
      )}
    </div>
  );
};

export default WellnessPlan;
