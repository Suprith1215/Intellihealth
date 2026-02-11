
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, YAxis, Legend, AreaChart, Area } from 'recharts';
import { AssessmentResult, UserProfile } from '../types';
import { db } from '../services/databaseService';
import { genAiService } from '../services/genAiService';
import {
   AlertTriangle, MapPin, Zap, Flame, Crown,
   ChevronRight, Trophy, Activity, Thermometer,
   Shield, Signal, Wifi, Battery, Smile, Frown, Meh,
   Leaf, Brain, Wind, Footprints, Waves
} from 'lucide-react';

// New Components
import { BoxBreathing, GroundingExercise, EmergencyButton, UrgeSurfing } from './InterventionTools';
import { MindBalance3D, HydrationVisualizer, StressTopology } from './ThreeDVisuals';
import { ExplainableRiskCard } from './ExplainableRisk';
import { VoiceAnalysisRecorder, DataSourcesPanel } from './MultimodalInput';
import { useToast } from '../contexts/ToastContext';
import InterventionModal from './InterventionModal';

interface DashboardProps {
   assessment: AssessmentResult | null;
   onNavigate?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ assessment, onNavigate }) => {
   const { showToast } = useToast();
   const [moodLevel, setMoodLevel] = useState(5);
   const [energyLevel, setEnergyLevel] = useState(5);
   const [user, setUser] = useState<UserProfile | null>(null);
   const [isLocationActive, setIsLocationActive] = useState(false);
   const [aiMotivation, setAiMotivation] = useState("Loading your personalized insight...");
   const [riskExplanation, setRiskExplanation] = useState<string | null>(null);
   const [isExplainingRisk, setIsExplainingRisk] = useState(false);

   const [checkInComplete, setCheckInComplete] = useState(false);
   const [points, setPoints] = useState(850);
   const [streak, setStreak] = useState(12);
   const [chartData, setChartData] = useState([
      { day: 'Mon', mood: 4, intensity: 8 },
      { day: 'Tue', mood: 5, intensity: 6 },
      { day: 'Wed', mood: 6, intensity: 7 },
      { day: 'Thu', mood: 5, intensity: 5 },
      { day: 'Fri', mood: 7, intensity: 4 },
      { day: 'Sat', mood: 8, intensity: 3 },
      { day: 'Sun', mood: 7, intensity: 4 },
   ]);

   const [rewards, setRewards] = useState([
      { day: 1, val: "+10", claimed: true, active: false },
      { day: 2, val: "+10", claimed: true, active: false },
      { day: 3, val: "+15", claimed: true, active: false },
      { day: 4, val: "+20", claimed: false, active: true },
      { day: 5, val: "+25", claimed: false, active: false },
      { day: 6, val: "+30", claimed: false, active: false },
      { day: 7, val: "+100", claimed: false, active: false, big: true },
   ]);

   const [showSupportModal, setShowSupportModal] = useState(false);
   const [activeIntervention, setActiveIntervention] = useState<'urge' | 'calm' | null>(null);

   // Detailed Metrics State
   const [showMetricsModal, setShowMetricsModal] = useState(false);

   // Mock Data for ML Metrics
   const performanceData = [
      { name: 'Model A', acc: 92, prec: 89, recall: 94, f1: 91 },
      { name: 'Model B', acc: 88, prec: 85, recall: 87, f1: 86 },
      { name: 'Current', acc: 95, prec: 93, recall: 96, f1: 94 },
   ];

   const timeSeriesData = [
      { time: '00:00', acc: 85 }, { time: '04:00', acc: 88 },
      { time: '08:00', acc: 92 }, { time: '12:00', acc: 94 },
      { time: '16:00', acc: 95 }, { time: '20:00', acc: 93 },
      { time: '23:59', acc: 95 },
   ];

   // Gamification State
   const [level, setLevel] = useState(5);
   const [xp, setXp] = useState(2450);
   const nextLevelXp = 3000;

   // ... (riskFactors definition) ...
   const riskFactors = [
      { name: 'Sleep Patterns', impact: 85, trend: 'down' as const, description: 'Deep sleep duration reduced by 15% this week.' },
      { name: 'Voice Sentiment', impact: 65, trend: 'stable' as const, description: 'Detected tonal flattening in recent journals.' },
      { name: 'Stress Markers', impact: 45, trend: 'up' as const, description: 'Heart rate variability indicates mild stress.' },
   ];

   useEffect(() => {
      const u = db.getUser();
      if (u) {
         setUser(u);
         genAiService.getDailyMotivation(u.name.split(' ')[0], 12, 7).then(setAiMotivation);
      }
   }, []);


   const handleLevelUp = () => {
      // Mock animation trigger
      showToast("Level Up! You are now a Level 6 Guardian!", "success");
   };

   const handleCravingSupport = () => {
      setShowSupportModal(true);
   };

   const toggleLocationMonitoring = () => {
      setIsLocationActive(!isLocationActive);
      if (!isLocationActive) {
         showToast("Location Monitoring Active. You'll be alerted in high-risk zones.", "info");
      } else {
         showToast("Location Monitoring Paused.", "info");
      }
   };

   const handleMoodSubmit = () => {
      const newData = [...chartData];
      newData.shift();
      newData.push({
         day: 'Today',
         mood: moodLevel,
         intensity: Math.max(1, 10 - energyLevel)
      });
      setChartData(newData);
      setCheckInComplete(true);
      showToast("Daily check-in logged successfully!", "success");
   };

   const handleClaimReward = () => {
      const activeIndex = rewards.findIndex(r => r.active && !r.claimed);
      if (activeIndex !== -1) {
         const rewardValue = parseInt(rewards[activeIndex].val.replace('+', ''));
         setPoints(prev => prev + rewardValue);
         const newRewards = [...rewards];
         newRewards[activeIndex].claimed = true;
         newRewards[activeIndex].active = false;
         if (activeIndex + 1 < newRewards.length) {
            newRewards[activeIndex + 1].active = true;
         }
         setRewards(newRewards);
         setStreak(prev => prev + 1);

         showToast(`🎉 Reward Claimed! +${rewardValue} points added.`, "success");
      } else {
         if (rewards.some(r => r.active)) return; // Should not happen if button disabled correctly
         showToast("No rewards available to claim right now.", "error");
      }
   };

   const handleExplainRisk = async () => {
      if (riskExplanation) return;
      setIsExplainingRisk(true);
      // Simulate API delay for better UX
      setTimeout(async () => {
         const explanation = await genAiService.explainRisk(61, ["High Stress", "Poor Sleep", "Craving Spike"]);
         setRiskExplanation(explanation);
         setIsExplainingRisk(false);
         showToast("Risk analysis complete.", "success");
      }, 1500);
   };

   const handleQuickAction = (action: string) => {
      if (onNavigate) {
         if (action === 'Therapy') {
            onNavigate('telehealth');
            showToast("Navigating to Therapy portal...", "info");
         }
         else if (action === 'Progress') {
            onNavigate('progress');
            showToast("Opening Progress Tracker...", "info");
         }
         else if (action === 'Medication') {
            showToast("Medication Reminder: No doses due now.", "info");
         }
         else if (action === 'Journal') {
            // Maybe navigate to Journal or just show toast for now as route not explicitly checking 'journal' in quick action logic
            showToast("Journal feature coming soon to quick actions!", "info");
         }
      }
   };

   return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">

         {/* --- HEADER & GAMIFICATION --- */}
         <div className="flex flex-col md:flex-row items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div>
               <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                     Welcome back, {user?.name.split(' ')[0]}
                  </h1>
                  <span className="ml-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                     Level {level} Guardian
                  </span>
               </div>
               <p className="text-slate-400 max-w-xl italic flex items-start">
                  <span className="mr-2 text-2xl text-purple-500">"</span>
                  {aiMotivation}
                  <span className="ml-2 text-2xl text-purple-500">"</span>
               </p>
            </div>

            {/* Gamified Bar */}
            <div className="w-full md:w-auto glass-card p-4 min-w-[300px]">
               <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span>Progress to Lvl {level + 1}</span>
                  <span>{xp} / {nextLevelXp} XP</span>
               </div>
               <div className="w-full h-3 bg-[#0f0a1e] rounded-full overflow-hidden border border-white/5 relative">
                  <div
                     className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-1000 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                     style={{ width: `${(xp / nextLevelXp) * 100}%` }}
                  >
                     <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                  </div>
               </div>
               <div className="flex justify-between mt-3">
                  <div className="flex flex-col items-center">
                     <span className="text-[10px] text-slate-500">STREAK</span>
                     <span className="font-bold text-orange-400 flex items-center"><Flame className="w-3 h-3 mr-1 fill-orange-400" /> 12 Days</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <span className="text-[10px] text-slate-500">BALANCE</span>
                     <span className="font-bold text-cyan-400 flex items-center"><Crown className="w-3 h-3 mr-1" /> Top 5%</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <span className="text-[10px] text-slate-500">MOOD</span>
                     <span className="font-bold text-green-400 flex items-center"><Smile className="w-3 h-3 mr-1" /> Stable</span>
                  </div>
               </div>
            </div>
         </div>

         {/* --- 3D WELLNESS VISUALIZATION --- */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card md:col-span-2 overflow-hidden relative group">
               <div className="absolute top-4 left-6 z-10">
                  <h3 className="text-xl font-bold text-white flex items-center">
                     <Brain className="w-5 h-5 text-purple-400 mr-2" />
                     Mind Balance Model
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Real-time neural stability visualization</p>
               </div>
               <MindBalance3D stability={85} />

               <div className="absolute bottom-4 right-6 flex gap-2">
                  <div className="glass-card-sm px-3 py-1 text-xs font-bold text-cyan-300 border-cyan-500/30">Stable State</div>
                  <div className="glass-card-sm px-3 py-1 text-xs font-bold text-slate-400">Looking Good</div>
               </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
               <div>
                  <h3 className="font-bold text-white mb-2 flex items-center"> <Leaf className="w-5 h-5 text-green-400 mr-2" /> Wellness Status</h3>
                  <div className="space-y-4 mt-6">
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Hydration</span>
                        <span className="text-cyan-400 font-bold">60%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 w-[60%]"></div>
                     </div>

                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Sleep Recharge</span>
                        <span className="text-purple-400 font-bold">82%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[82%]"></div>
                     </div>

                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Stress Load</span>
                        <span className="text-amber-400 font-bold">Low</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[20%]"></div>
                     </div>
                  </div>
               </div>
               <button
                  onClick={() => setShowMetricsModal(true)}
                  className="w-full mt-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400"
               >
                  View Detailed Metrics
               </button>
            </div>
         </div>

         {/* --- MAIN DASHBOARD CONTENT --- */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: INTERVENTION & TOOLS */}
            <div className="space-y-6">
               <div className="glass-card p-6 border-l-4 border-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
                  <h3 className="font-bold text-white mb-2 flex items-center">
                     <Zap className="w-5 h-5 text-red-500 mr-2" /> Real-Time Intervention
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">AI detected a 15% rise in craving markers.</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                     <button
                        onClick={() => setActiveIntervention('urge')}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 text-red-400 font-bold text-xs transition-all text-left flex items-center gap-2"
                     >
                        <Flame className="w-4 h-4" />
                        Survive Urge
                     </button>
                     <button
                        onClick={() => setActiveIntervention('calm')}
                        className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs transition-all text-left flex items-center gap-2"
                     >
                        <Wind className="w-4 h-4" />
                        Calm Down
                     </button>
                     <button
                        onClick={() => onNavigate?.('music-therapy')}
                        className="col-span-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 text-purple-400 font-bold text-xs transition-all flex items-center justify-center gap-2"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        Music Therapy
                     </button>
                  </div>

                  <EmergencyButton contactName={user?.emergencyContact || "Sponsor"} onCall={() => showToast("Connecting to emergency contact...", "info")} />
               </div>

               <VoiceAnalysisRecorder />

               <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-white flex items-center">
                        <MapPin className="w-5 h-5 text-purple-400 mr-2" /> Geo-Fence
                     </h3>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isLocationActive} onChange={() => setIsLocationActive(!isLocationActive)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                     </label>
                  </div>
                  <p className="text-xs text-slate-400">Alerts active for 3 known high-risk zones near current location.</p>
               </div>
            </div>

            {/* CENTER: EXPLAINABLE AI & FORECAST */}
            <div className="lg:col-span-2 space-y-6">
               <ExplainableRiskCard
                  riskScore={assessment?.riskScore || 45}
                  features={riskFactors}
                  timeframe="Coming Week"
               />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                     <h4 className="text-sm font-bold text-slate-300 mb-4">Recovery Trajectory</h4>
                     <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                           <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                           <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px' }} />
                           <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                           <Line type="monotone" dataKey="intensity" stroke="#ec4899" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                     <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center text-xs text-purple-400"><div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>Mood</div>
                        {/* Toast Notification Removed */}

                     </div>
                  </div>

                  <DataSourcesPanel />
               </div>
            </div>
         </div>

         {/* --- INTERVENTION MODAL --- */}
         {showSupportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
               <div className="bg-[#1a1429] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
                  <button onClick={() => { setShowSupportModal(false); setActiveIntervention(null); }} className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-all">✕</button>

                  <div className="p-8 pb-0">
                     <h2 className="text-3xl font-bold text-white mb-2">Immediate Support</h2>
                     <p className="text-slate-400">Select a tool to regain balance.</p>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto">
                     {!activeIntervention ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <button onClick={() => setActiveIntervention('breathing')} className="glass-card p-6 hover:border-cyan-500 transition-all text-left group">
                              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                 <Wind className="w-6 h-6 text-cyan-400" />
                              </div>
                              <h3 className="font-bold text-white text-lg">Box Breathing</h3>
                              <p className="text-sm text-slate-400 mt-2">Reduce cortisol levels instantly.</p>
                           </button>

                           <button onClick={() => setActiveIntervention('grounding')} className="glass-card p-6 hover:border-purple-500 transition-all text-left group">
                              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                 <Footprints className="w-6 h-6 text-purple-400" />
                              </div>
                              <h3 className="font-bold text-white text-lg">5-4-3-2-1 Grounding</h3>
                              <p className="text-sm text-slate-400 mt-2">Reconnect with reality.</p>
                           </button>

                           <button onClick={() => setActiveIntervention('surfing')} className="glass-card p-6 hover:border-blue-500 transition-all text-left group">
                              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                 <Waves className="w-6 h-6 text-blue-400" />
                              </div>
                              <h3 className="font-bold text-white text-lg">Urge Surfing</h3>
                              <p className="text-sm text-slate-400 mt-2">Ride out intense cravings.</p>
                           </button>
                        </div>
                     ) : (
                        <div className="animate-slide-up h-full flex flex-col">
                           <button onClick={() => setActiveIntervention(null)} className="flex items-center text-slate-400 hover:text-white mb-6 font-bold">
                              <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Tools
                           </button>
                           <div className="flex-1 flex items-center justify-center">
                              {activeIntervention === 'breathing' && <BoxBreathing />}
                              {activeIntervention === 'grounding' && <GroundingExercise />}
                              {activeIntervention === 'surfing' && <UrgeSurfing />}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* --- METRICS MODAL --- */}
         {showMetricsModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in overflow-y-auto">
               <div className="bg-[#0f0a1e] w-full max-w-6xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[95vh] relative overflow-hidden">

                  {/* Header */}
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-900/50">
                     <div>
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                           <Activity className="w-8 h-8 text-cyan-400" />
                           Model Performance Metrics
                        </h2>
                        <p className="text-slate-400">Real-time analysis of prediction accuracy, precision, and recall.</p>
                     </div>
                     <button onClick={() => setShowMetricsModal(false)} className="p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all">✕</button>
                  </div>

                  <div className="p-8 overflow-y-auto space-y-8">
                     {/* Top Stats */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 text-center border-t-4 border-green-500">
                           <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Accuracy</h4>
                           <div className="text-4xl font-bold text-white">95.4%</div>
                           <div className="text-green-400 text-xs mt-1">↑ 2.1% vs last week</div>
                        </div>
                        <div className="glass-card p-4 text-center border-t-4 border-blue-500">
                           <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Precision</h4>
                           <div className="text-4xl font-bold text-white">93.2%</div>
                           <div className="text-blue-400 text-xs mt-1">High Confidence</div>
                        </div>
                        <div className="glass-card p-4 text-center border-t-4 border-purple-500">
                           <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Recall</h4>
                           <div className="text-4xl font-bold text-white">96.1%</div>
                           <div className="text-purple-400 text-xs mt-1">Minimal Misses</div>
                        </div>
                        <div className="glass-card p-4 text-center border-t-4 border-pink-500">
                           <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">F1 Score</h4>
                           <div className="text-4xl font-bold text-white">94.6%</div>
                           <div className="text-pink-400 text-xs mt-1">Balanced</div>
                        </div>
                     </div>

                     {/* Charts Grid */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Accuracy Trend */}
                        <div className="glass-card p-6">
                           <h3 className="text-lg font-bold text-white mb-6 pl-2 border-l-4 border-cyan-500">Validation Accuracy Over Time</h3>
                           <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={timeSeriesData}>
                                 <defs>
                                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                       <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                 <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                                 <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                 />
                                 <Area type="monotone" dataKey="acc" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>

                        {/* Metrics Comparison */}
                        <div className="glass-card p-6">
                           <h3 className="text-lg font-bold text-white mb-6 pl-2 border-l-4 border-purple-500">Model Comparison (F1, Precision, Recall)</h3>
                           <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={performanceData} barGap={0} barCategoryGap="20%">
                                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                 <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                 <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                                 />
                                 <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                 <Bar dataKey="prec" name="Precision" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                 <Bar dataKey="recall" name="Recall" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                 <Bar dataKey="f1" name="F1 Score" fill="#ec4899" radius={[4, 4, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>

                        {/* Confusion Matrix Visualization (Mock) */}
                        <div className="glass-card p-6 lg:col-span-2">
                           <h3 className="text-lg font-bold text-white mb-6 pl-2 border-l-4 border-orange-500">Confusion Matrix Heatmap</h3>
                           <div className="grid grid-cols-2 gap-8">
                              <div className="flex items-center justify-center p-8 bg-white/5 rounded-2xl relative overflow-hidden">
                                 <div className="text-center z-10">
                                    <div className="text-5xl font-bold text-green-400 mb-2">True Positives</div>
                                    <div className="text-2xl text-white">452</div>
                                    <div className="text-xs text-slate-400 mt-2">Correctly identified high-risk events</div>
                                 </div>
                                 <div className="absolute inset-0 bg-green-500/10 blur-3xl"></div>
                              </div>
                              <div className="flex items-center justify-center p-8 bg-white/5 rounded-2xl relative overflow-hidden">
                                 <div className="text-center z-10">
                                    <div className="text-5xl font-bold text-blue-400 mb-2">True Negatives</div>
                                    <div className="text-2xl text-white">1,203</div>
                                    <div className="text-xs text-slate-400 mt-2">Correctly ignored safe baselines</div>
                                 </div>
                                 <div className="absolute inset-0 bg-blue-500/10 blur-3xl"></div>
                              </div>
                           </div>
                        </div>

                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Intervention Modal */}
         {activeIntervention && (
            <InterventionModal
               type={activeIntervention}
               onClose={() => setActiveIntervention(null)}
            />
         )}
      </div>
   );
};

export default Dashboard;
