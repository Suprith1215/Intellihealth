
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, CartesianGrid, YAxis, Legend } from 'recharts';
import { AssessmentResult, UserProfile } from '../types';
import { db } from '../services/databaseService';
import { genAiService } from '../services/genAiService';
import {
   AlertTriangle, MapPin, Zap, Flame, Crown,
   ChevronRight, Activity, Smile,
   Leaf, Brain, Wind, Footprints, Waves,
   TrendingUp, TrendingDown, Minus, Shield,
   Sparkles, Heart, Target, Clock
} from 'lucide-react';

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

// ── Inline Logo SVG ─────────────────────────────────────────────────────────
const Logo = () => (
   <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
      <defs>
         <linearGradient id="dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
         </linearGradient>
      </defs>
      <path d="M22 3L6 9.5V21C6 30.5 13 39 22 42C31 39 38 30.5 38 21V9.5L22 3Z"
         fill="url(#dGrad)" fillOpacity="0.15" stroke="url(#dGrad)" strokeWidth="1.5" />
      <circle cx="22" cy="21" r="4" fill="url(#dGrad)" opacity="0.9" />
      <line x1="22" y1="13" x2="22" y2="29" stroke="url(#dGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="21" x2="30" y2="21" stroke="url(#dGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22" cy="13" r="2" fill="url(#dGrad)" opacity="0.7" />
      <circle cx="22" cy="29" r="2" fill="url(#dGrad)" opacity="0.7" />
      <circle cx="14" cy="21" r="2" fill="url(#dGrad)" opacity="0.7" />
      <circle cx="30" cy="21" r="2" fill="url(#dGrad)" opacity="0.7" />
   </svg>
);

// ── Stat Card ───────────────────────────────────────────────────────────────
const StatCard: React.FC<{
   icon: React.ReactNode;
   label: string;
   value: string | number;
   sub?: string;
   trend?: 'up' | 'down' | 'stable';
   accentColor?: string;
}> = ({ icon, label, value, sub, trend, accentColor = '#7C3AED' }) => (
   <div className="stat-card animate-fade-in" style={{ height: '100%' }}>
      <div style={{
         position: 'absolute', top: 0, left: 0, right: 0, height: '2px', borderRadius: '16px 16px 0 0',
         background: `linear-gradient(90deg, ${accentColor}, transparent)`
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
         <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
         }}>
            {icon}
         </div>
         {trend && (
            <div style={{
               display: 'flex', alignItems: 'center', gap: 4,
               fontSize: 11, fontWeight: 600,
               color: trend === 'up' ? '#34d399' : trend === 'down' ? '#f87171' : '#94a3b8'
            }}>
               {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                  trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                     <Minus className="w-3 h-3" />}
            </div>
         )}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#f0f4f8', lineHeight: 1, marginBottom: 4 }}>
         {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(148,163,184,0.7)', marginBottom: 2 }}>
         {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.4)' }}>{sub}</div>}
   </div>
);

// ── Wellness Bar ─────────────────────────────────────────────────────────────
const WellnessBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
   <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
         <span style={{ fontSize: 13, color: 'rgba(226,232,240,0.8)', fontWeight: 500 }}>{label}</span>
         <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div className="progress-bar-track">
         <div
            className="progress-bar-fill"
            style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}aa, ${color})` }}
         />
      </div>
   </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
   <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
         <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: subtitle ? 3 : 0 }}>{title}</h2>
         {subtitle && <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>{subtitle}</p>}
      </div>
      {action}
   </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard: React.FC<DashboardProps> = ({ assessment, onNavigate }) => {
   const { showToast } = useToast();
   const [user, setUser] = useState<UserProfile | null>(null);
   const [aiMotivation, setAiMotivation] = useState('Loading your daily insight...');
   const [isLocationActive, setIsLocationActive] = useState(false);
   const [activeIntervention, setActiveIntervention] = useState<'urge' | 'calm' | null>(null);
   const [showMetricsModal, setShowMetricsModal] = useState(false);
   const [checkInComplete, setCheckInComplete] = useState(false);
   const [moodLevel, setMoodLevel] = useState(5);
   const [energyLevel, setEnergyLevel] = useState(5);

   const [xp] = useState(2450);
   const nextLevelXp = 3000;
   const [level] = useState(5);
   const [streak] = useState(12);

   const [chartData] = useState([
      { day: 'Mon', mood: 4, intensity: 8, risk: 65 },
      { day: 'Tue', mood: 5, intensity: 6, risk: 58 },
      { day: 'Wed', mood: 6, intensity: 7, risk: 52 },
      { day: 'Thu', mood: 5, intensity: 5, risk: 55 },
      { day: 'Fri', mood: 7, intensity: 4, risk: 45 },
      { day: 'Sat', mood: 8, intensity: 3, risk: 38 },
      { day: 'Sun', mood: 7, intensity: 4, risk: 42 },
   ]);

   const riskFactors = [
      { name: 'Sleep Patterns', impact: 85, trend: 'down' as const, description: 'Deep sleep duration reduced by 15% this week.' },
      { name: 'Voice Sentiment', impact: 65, trend: 'stable' as const, description: 'Detected tonal flattening in recent journals.' },
      { name: 'Stress Markers', impact: 45, trend: 'up' as const, description: 'Heart rate variability indicates mild stress.' },
   ];

   const performanceData = [
      { name: 'Model A', acc: 92, prec: 89, recall: 94, f1: 91 },
      { name: 'Model B', acc: 88, prec: 85, recall: 87, f1: 86 },
      { name: 'Current', acc: 95, prec: 93, recall: 96, f1: 94 },
   ];

   const timeSeriesData = [
      { time: '00:00', acc: 85 }, { time: '04:00', acc: 88 },
      { time: '08:00', acc: 92 }, { time: '12:00', acc: 94 },
      { time: '16:00', acc: 95 }, { time: '20:00', acc: 93 }, { time: '23:59', acc: 95 },
   ];

   useEffect(() => {
      const u = db.getUser();
      if (u) {
         setUser(u);
         genAiService.getDailyMotivation(u.name.split(' ')[0], 12, 7).then(setAiMotivation);
      }
   }, []);

   const handleMoodSubmit = () => {
      setCheckInComplete(true);
      showToast('Daily check-in logged successfully!', 'success');
   };

   const tooltipStyle = {
      backgroundColor: 'rgba(12, 8, 30, 0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      fontSize: '12px',
      color: '#e2e8f0',
   };

   return (
      <div className="animate-fade-in" style={{ maxWidth: 1400, margin: '0 auto' }}>

         {/* ── HERO HEADER ──────────────────────────────────────────── */}
         <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 32, flexWrap: 'wrap', gap: 16,
         }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: 'white',
                  flexShrink: 0,
                  boxShadow: '0 0 24px rgba(124,58,237,0.5)',
                  border: '2px solid rgba(124,58,237,0.4)',
               }}>
                  {user?.name?.charAt(0) || 'U'}
               </div>
               <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                     <h1 style={{
                        fontSize: 26, fontWeight: 800, color: '#f0f4f8',
                        letterSpacing: '-0.02em', lineHeight: 1,
                     }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Guardian'}
                     </h1>
                     <span className="badge badge-purple">Lvl {level} Guardian</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.7)', fontStyle: 'italic' }}>
                     <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-purple-400" />
                     {aiMotivation}
                  </p>
               </div>
            </div>

            {/* XP Progress Panel */}
            <div style={{
               padding: '16px 20px',
               background: 'rgba(255,255,255,0.025)',
               border: '1px solid rgba(255,255,255,0.07)',
               borderRadius: 16, minWidth: 280,
            }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(148,163,184,0.5)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                  <span>Progress to Level {level + 1}</span>
                  <span>{xp} / {nextLevelXp} XP</span>
               </div>
               <div className="progress-bar-track" style={{ height: 8, marginBottom: 12 }}>
                  <div className="progress-bar-fill animate-shimmer" style={{ width: `${(xp / nextLevelXp) * 100}%` }} />
               </div>
               <div style={{ display: 'flex', gap: 20 }}>
                  {[
                     { label: 'STREAK', value: `${streak} Days`, icon: <Flame className="w-3 h-3 fill-orange-400" />, color: '#fb923c' },
                     { label: 'RANK', value: 'Top 5%', icon: <Crown className="w-3 h-3" />, color: '#22d3ee' },
                     { label: 'MOOD', value: 'Stable', icon: <Smile className="w-3 h-3" />, color: '#34d399' },
                  ].map(s => (
                     <div key={s.label} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)', letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: s.color }}>
                           {s.icon} {s.value}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* ── TOP STATS ROW ─────────────────────────────────────────── */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}
            className="grid-cols-2 md:grid-cols-4">
            <StatCard
               icon={<Shield className="w-5 h-5" style={{ color: '#a78bfa' }} />}
               label="Risk Score"
               value={`${assessment?.riskScore ?? 45}%`}
               sub="Relapse probability"
               trend="down"
               accentColor="#7C3AED"
            />
            <StatCard
               icon={<Heart className="w-5 h-5" style={{ color: '#f472b6' }} />}
               label="Wellness Score"
               value="78"
               sub="Out of 100"
               trend="up"
               accentColor="#EC4899"
            />
            <StatCard
               icon={<Target className="w-5 h-5" style={{ color: '#22d3ee' }} />}
               label="AI Accuracy"
               value="95.4%"
               sub="Model confidence"
               trend="up"
               accentColor="#06B6D4"
            />
            <StatCard
               icon={<Clock className="w-5 h-5" style={{ color: '#fb923c' }} />}
               label="Sober Days"
               value={streak}
               sub="Personal best: 30"
               trend="up"
               accentColor="#f97316"
            />
         </div>

         {/* ── MAIN GRID — 3D MIND MODEL + WELLNESS ─────────────────── */}
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>

            {/* Mind Balance 3D */}
            <div className="glass-card" style={{ overflow: 'hidden', position: 'relative', minHeight: 280 }}>
               <div style={{ position: 'absolute', top: 18, left: 20, zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                     <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Brain className="w-4 h-4 text-purple-400" />
                     </div>
                     <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Mind Balance Model</h3>
                        <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>Real-time neural stability</p>
                     </div>
                  </div>
               </div>
               <MindBalance3D stability={85} />
               <div style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', gap: 8 }}>
                  <span className="glass-card-sm badge badge-cyan" style={{ border: 'none' }}>Stable State</span>
                  <span className="glass-card-sm" style={{ padding: '4px 10px', fontSize: 11, color: 'rgba(148,163,184,0.6)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>Looking Good</span>
               </div>
            </div>

            {/* Wellness Status */}
            <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Leaf className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                     <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Wellness Status</h3>
                     <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>Today's vitals</p>
                  </div>
               </div>

               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <WellnessBar label="Hydration" value={60} color="#06B6D4" />
                  <WellnessBar label="Sleep Recharge" value={82} color="#a78bfa" />
                  <WellnessBar label="Stress Level" value={20} color="#f97316" />
                  <WellnessBar label="Recovery Index" value={73} color="#34d399" />
               </div>

               <button
                  onClick={() => setShowMetricsModal(true)}
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: 12, padding: '9px 16px' }}
               >
                  <Activity className="w-3.5 h-3.5" />
                  View Detailed Metrics
               </button>
            </div>
         </div>

         {/* ── SECONDARY GRID — RISK, CHART, TOOLS ───────────────────── */}
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 20, marginBottom: 24 }}>

            {/* Explainable Risk */}
            <ExplainableRiskCard
               riskScore={(() => {
                  const raw = assessment?.riskScore ?? 45;
                  const score = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
                  return Math.min(100, Math.max(0, score));
               })()}
               features={riskFactors}
               timeframe="Coming Week"
            />

            {/* Recovery Trajectory Chart */}
            <div className="glass-card" style={{ padding: 24 }}>
               <SectionHeader
                  title="Recovery Trajectory"
                  subtitle="7-day mood & risk trend"
               />
               <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                           <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="riskGrad2" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#EC4899" stopOpacity={0.25} />
                           <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 11 }} />
                     <YAxis hide />
                     <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                     <Area type="monotone" dataKey="mood" stroke="#7C3AED" strokeWidth={2.5} fill="url(#moodGrad)" dot={false} name="Mood" />
                     <Area type="monotone" dataKey="risk" stroke="#EC4899" strokeWidth={2} fill="url(#riskGrad2)" strokeDasharray="4 2" dot={false} name="Risk %" />
                  </AreaChart>
               </ResponsiveContainer>
               <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a78bfa' }}>
                     <div style={{ width: 12, height: 2, borderRadius: 2, background: '#7C3AED' }} /> Mood
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#f472b6' }}>
                     <div style={{ width: 12, height: 2, borderRadius: 2, background: '#EC4899', borderTop: '1px dashed #EC4899' }} /> Risk %
                  </div>
               </div>
            </div>

            {/* Quick Actions / Intervention Panel */}
            <div className="glass-card" style={{ padding: 22 }}>
               <SectionHeader title="Quick Actions" subtitle="Real-time support" />

               <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                     {
                        label: 'Survive Urge',
                        desc: 'Urge surfing technique',
                        icon: <Flame className="w-4 h-4" />,
                        color: '#ef4444',
                        action: () => setActiveIntervention('urge')
                     },
                     {
                        label: 'Calm Down',
                        desc: 'Box breathing exercise',
                        icon: <Wind className="w-4 h-4" />,
                        color: '#06B6D4',
                        action: () => setActiveIntervention('calm')
                     },
                     {
                        label: 'Music Therapy',
                        desc: 'Healing soundscapes',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>,
                        color: '#a78bfa',
                        action: () => onNavigate?.('music-therapy')
                     },
                  ].map((item) => (
                     <button
                        key={item.label}
                        onClick={item.action}
                        style={{
                           display: 'flex', alignItems: 'center', gap: 12,
                           padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                           background: `${item.color}12`,
                           border: `1px solid ${item.color}25`,
                           textAlign: 'left', width: '100%', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${item.color}22`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${item.color}12`; }}
                     >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                           {item.icon}
                        </div>
                        <div>
                           <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{item.label}</div>
                           <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{item.desc}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto opacity-30" style={{ color: item.color }} />
                     </button>
                  ))}

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

                  <EmergencyButton
                     contactName={user?.emergencyContact || 'Sponsor'}
                     onCall={() => showToast('Connecting to emergency contact...', 'info')}
                  />
               </div>

               {/* Geo-fence toggle */}
               <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <div>
                           <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Geo-Fence</div>
                           <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)' }}>3 risk zones monitored</div>
                        </div>
                     </div>
                     <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={isLocationActive} onChange={() => setIsLocationActive(!isLocationActive)} style={{ display: 'none' }} />
                        <div style={{
                           width: 36, height: 20, borderRadius: 999, position: 'relative',
                           background: isLocationActive
                              ? 'linear-gradient(135deg, #7C3AED, #06B6D4)'
                              : 'rgba(255,255,255,0.1)',
                           transition: 'background 0.3s',
                           border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                           <div style={{
                              position: 'absolute', top: 2, left: isLocationActive ? 18 : 2,
                              width: 14, height: 14, borderRadius: '50%', background: 'white',
                              transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                           }} />
                        </div>
                     </label>
                  </div>
               </div>
            </div>
         </div>

         {/* ── VOICE, DATA SOURCES ROW ───────────────────────────────── */}
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <VoiceAnalysisRecorder />
            <DataSourcesPanel />
         </div>

         {/* ── Intervention Modal ─────────────────────────────────────── */}
         {activeIntervention && (
            <InterventionModal
               type={activeIntervention}
               onClose={() => setActiveIntervention(null)}
            />
         )}

         {/* ── METRICS MODAL ─────────────────────────────────────────── */}
         {showMetricsModal && (
            <div style={{
               position: 'fixed', inset: 0, zIndex: 100,
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
               padding: 16,
            }} onClick={() => setShowMetricsModal(false)}>
               <div
                  style={{
                     background: 'rgba(12, 8, 30, 0.98)',
                     width: '100%', maxWidth: 900,
                     borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
                     overflow: 'hidden', maxHeight: '90vh',
                     boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                  }}
                  onClick={e => e.stopPropagation()}
               >
                  {/* Modal Header */}
                  <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Logo />
                        <div>
                           <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Model Performance Metrics</h2>
                           <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)' }}>Real-time accuracy, precision & recall analysis</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setShowMetricsModal(false)}
                        style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}
                     >✕</button>
                  </div>

                  <div style={{ padding: 28, overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
                     {/* Stat tiles */}
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
                        {[
                           { label: 'Accuracy', value: '95.4%', delta: '↑ 2.1%', color: '#34d399' },
                           { label: 'Precision', value: '93.2%', delta: 'High Confidence', color: '#60a5fa' },
                           { label: 'Recall', value: '96.1%', delta: 'Minimal Misses', color: '#a78bfa' },
                           { label: 'F1 Score', value: '94.6%', delta: 'Balanced', color: '#f472b6' },
                        ].map(m => (
                           <div key={m.label} style={{
                              padding: '18px 16px', borderRadius: 14, textAlign: 'center',
                              background: 'rgba(255,255,255,0.02)', border: `1px solid ${m.color}30`,
                              borderTopWidth: 3,
                           }}>
                              <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
                              <div style={{ fontSize: 30, fontWeight: 700, color: '#f0f4f8', lineHeight: 1, marginBottom: 4 }}>{m.value}</div>
                              <div style={{ fontSize: 11, color: m.color }}>{m.delta}</div>
                           </div>
                        ))}
                     </div>

                     {/* Charts */}
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                           <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16, paddingLeft: 10, borderLeft: '3px solid #06B6D4' }}>
                              Accuracy Over Time
                           </h4>
                           <ResponsiveContainer width="100%" height={200}>
                              <AreaChart data={timeSeriesData}>
                                 <defs>
                                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                       <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                 <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[80, 100]} />
                                 <Tooltip contentStyle={tooltipStyle} />
                                 <Area type="monotone" dataKey="acc" stroke="#06B6D4" strokeWidth={2.5} fill="url(#accGrad)" name="Accuracy %" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>

                        <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                           <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16, paddingLeft: 10, borderLeft: '3px solid #7C3AED' }}>
                              Model Comparison
                           </h4>
                           <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={performanceData} barGap={4} barCategoryGap="25%">
                                 <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                 <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                 <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                 <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                 <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                                 <Bar dataKey="prec" name="Precision" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                 <Bar dataKey="recall" name="Recall" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                                 <Bar dataKey="f1" name="F1 Score" fill="#EC4899" radius={[4, 4, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Dashboard;
