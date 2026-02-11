
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart 
} from 'recharts';
import { 
  CalendarCheck, TrendingUp, Activity, Award, 
  Brain, Moon, Zap, AlertTriangle, ChevronDown, CheckCircle2, Trophy, Flame, ShieldCheck
} from 'lucide-react';
import { db } from '../services/databaseService';
import { DailyLog, UserProfile } from '../types';

// Tab Types
type Tab = 'overview' | 'trends' | 'achievements';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e1b4b] border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 text-xs mb-1">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.value}
            {p.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- Separate Function for Trends Analysis (Requested Feature) ---
const TrendsAnalysis = ({ logs }: { logs: DailyLog[] }) => {
  const [range, setRange] = useState<'week' | 'month'>('week');

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  // Enhance logs with derived Relapse Probability for visualization
  const processedLogs = logs.map(log => ({
    ...log,
    relapseProb: Math.min(100, Math.max(0, Math.round(((log.stress + (10 - log.sleepQuality)) / 20) * 100)))
  }));

  const data = range === 'week' ? processedLogs.slice(-7) : processedLogs.slice(-30);

  return (
    <div className="space-y-6 animate-fade-in">
       {/* Controls */}
       <div className="flex justify-between items-center bg-[#1a1429] p-4 rounded-xl border border-white/5">
          <h3 className="text-white font-bold flex items-center">
             <TrendingUp className="w-5 h-5 mr-2 text-purple-400" /> Historical Analysis
          </h3>
          <div className="flex bg-[#0f0a1e] p-1 rounded-lg border border-white/10">
             <button onClick={() => setRange('week')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${range === 'week' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Last 7 Days</button>
             <button onClick={() => setRange('month')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${range === 'month' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Last 30 Days</button>
          </div>
       </div>

       {/* 1. Relapse Probability (Area Chart) */}
       <div className="bg-[#1a1429] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between mb-6">
             <h3 className="font-bold text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" /> Relapse Probability Trend
             </h3>
             <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span> Predicted Risk (%)
             </div>
          </div>
          <div className="w-full h-[320px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorRelapse" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                   <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                   <YAxis stroke="#64748b" domain={[0, 100]} tick={{fontSize: 10}} axisLine={false} tickLine={false} unit="%" />
                   <Tooltip content={<CustomTooltip />} />
                   <Area type="monotone" dataKey="relapseProb" stroke="#ef4444" strokeWidth={2} fill="url(#colorRelapse)" name="Relapse Probability" unit="%" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* 2. Mood vs Craving Correlations (Composed Chart) */}
       <div className="bg-[#1a1429] border border-white/5 rounded-2xl p-6">
          <h3 className="font-bold text-white flex items-center mb-6">
             <Activity className="w-5 h-5 mr-2 text-purple-400" /> Mood vs. Craving Frequency
          </h3>
          <div className="w-full h-[320px]">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                   <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                   <YAxis yAxisId="left" stroke="#8b5cf6" domain={[0, 10]} tick={{fontSize: 10}} axisLine={false} tickLine={false} label={{ value: 'Mood', angle: -90, position: 'insideLeft', fill: '#8b5cf6' }} />
                   <YAxis yAxisId="right" orientation="right" stroke="#ec4899" domain={[0, 10]} tick={{fontSize: 10}} axisLine={false} tickLine={false} label={{ value: 'Craving', angle: 90, position: 'insideRight', fill: '#ec4899' }} />
                   <Tooltip content={<CustomTooltip />} />
                   <Bar yAxisId="right" dataKey="craving" barSize={20} fill="#ec4899" radius={[4, 4, 0, 0]} name="Craving Intensity" fillOpacity={0.6} />
                   <Line yAxisId="left" type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} dot={true} name="Mood Score" />
                </ComposedChart>
             </ResponsiveContainer>
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Sleep Quality */}
           <div className="bg-[#1a1429] border border-white/5 rounded-2xl p-6">
               <h3 className="font-bold text-white flex items-center mb-4">
                  <Moon className="w-5 h-5 mr-2 text-indigo-400" /> Sleep Quality Trend
               </h3>
               <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" domain={[0, 10]} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="step" dataKey="sleepQuality" stroke="#6366f1" strokeWidth={2} dot={false} name="Sleep Score" />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
           </div>

           {/* Stress Levels */}
           <div className="bg-[#1a1429] border border-white/5 rounded-2xl p-6">
               <h3 className="font-bold text-white flex items-center mb-4">
                  <Brain className="w-5 h-5 mr-2 text-orange-400" /> Stress Levels Trend
               </h3>
               <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#64748b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" domain={[0, 10]} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="stress" fill="#f97316" radius={[4, 4, 0, 0]} name="Stress Level" />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
           </div>
       </div>
    </div>
  );
};

const ProgressTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Derived Metrics
  const [soberDays, setSoberDays] = useState(0);
  const [avgMood, setAvgMood] = useState(0);
  const [cravingsResisted, setCravingsResisted] = useState(0);
  const [triggerData, setTriggerData] = useState<any[]>([]);

  useEffect(() => {
    const fetchedLogs = db.getLogs();
    const fetchedUser = db.getUser();
    
    setLogs(fetchedLogs);
    setUser(fetchedUser);

    if (fetchedLogs.length > 0 && fetchedUser) {
      // 1. Calculate Sober Days (Mock logic: days since joined)
      const joined = new Date(fetchedUser.joinedDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - joined.getTime());
      const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      setSoberDays(daysDiff);

      // 2. Avg Mood (Last 7 days)
      const last7 = fetchedLogs.slice(-7);
      const moodSum = last7.reduce((sum, log) => sum + log.mood, 0);
      setAvgMood(last7.length ? Number((moodSum / last7.length).toFixed(1)) : 0);

      // 3. Cravings Resisted (Count logs where craving > 4)
      const resisted = fetchedLogs.filter(l => l.craving > 4 && !l.relapse).length;
      setCravingsResisted(resisted);

      // 4. Trigger Analysis
      const triggerMap: Record<string, number> = {};
      fetchedLogs.forEach(log => {
        log.triggers.forEach(t => {
          triggerMap[t] = (triggerMap[t] || 0) + 1;
        });
      });
      const tData = Object.keys(triggerMap).map(key => ({
        name: key,
        value: triggerMap[key]
      })).sort((a,b) => b.value - a.value);
      
      // Add 'Unknown/Other' if empty just for visuals
      if (tData.length === 0) {
          tData.push({ name: 'None Reported', value: 100 });
      }
      setTriggerData(tData);
    }
  }, []);

  // Format Date for Charts (e.g., "Mon")
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const MetricCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-[#1a1429] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon className={`w-16 h-16 ${colorClass}`} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bgClass}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1 mb-1">{value}</h3>
        <p className="text-xs text-slate-500">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Progress Tracking</h1>
          <p className="text-slate-400">Visualize your recovery journey and celebrate your wins</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="bg-[#1a1429] p-1 rounded-xl border border-white/10 flex">
          {(['overview', 'trends', 'achievements'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Sober Days" 
              value={soberDays} 
              subtext="1 days to First Day Sober" 
              icon={CalendarCheck} 
              colorClass="text-green-400" 
              bgClass="bg-green-500/10" 
            />
            <MetricCard 
              title="Avg Mood" 
              value={avgMood} 
              subtext="Last 7 days" 
              icon={Activity} 
              colorClass="text-purple-400" 
              bgClass="bg-purple-500/10" 
            />
            <MetricCard 
              title="Cravings Resisted" 
              value={cravingsResisted} 
              subtext={`of ${cravingsResisted} total`} 
              icon={ShieldCheck} 
              colorClass="text-pink-400" 
              bgClass="bg-pink-500/10" 
            />
             <MetricCard 
              title="Total Points" 
              value={user?.points || 0} 
              subtext="1 achievements" 
              icon={Trophy} 
              colorClass="text-yellow-400" 
              bgClass="bg-yellow-500/10" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart: Mood Trends */}
            <div className="lg:col-span-2 bg-[#1a1429] border border-white/5 rounded-2xl p-6 h-[320px] flex flex-col">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-400" /> Mood Trends
                 </h3>
                 <span className="text-xs text-slate-400 px-3 py-1 bg-white/5 rounded-full">Last 7 days</span>
               </div>
               <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={logs.slice(-7)}>
                       <defs>
                          <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                       <XAxis 
                          dataKey="date" 
                          tickFormatter={formatXAxis} 
                          stroke="#64748b" 
                          tick={{fontSize: 12}}
                          axisLine={false}
                          tickLine={false}
                       />
                       <YAxis 
                          stroke="#64748b" 
                          domain={[0, 10]} 
                          tick={{fontSize: 12}}
                          axisLine={false}
                          tickLine={false}
                       />
                       <Tooltip content={<CustomTooltip />} />
                       <Area 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorMood)" 
                          name="Mood Score"
                       />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Trigger Analysis */}
            <div className="bg-[#1a1429] border border-white/5 rounded-2xl p-6 h-[320px] flex flex-col">
               <h3 className="text-lg font-bold text-white flex items-center mb-6">
                  <AlertTriangle className="w-5 h-5 mr-2 text-pink-400" /> Trigger Analysis
               </h3>
               <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={triggerData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {triggerData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                           ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: '#1e1b4b', borderRadius: '8px', border: 'none', color: 'white'}} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                     </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                     <span className="text-2xl font-bold text-white">{triggerData.reduce((a,b) => a + b.value, 0)}</span>
                     <span className="text-xs text-slate-500 uppercase">Events</span>
                  </div>
               </div>
               <p className="text-sm text-center text-slate-400 mt-2">
                  Top trigger: <span className="text-white font-bold">{triggerData[0]?.name || 'None'}</span>
               </p>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab Content */}
      {activeTab === 'trends' && <TrendsAnalysis logs={logs} />}

      {/* Achievements Tab Content */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
           {[
             { title: 'First Step', desc: 'Completed the first assessment', date: 'Oct 15, 2023', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/20' },
             { title: 'Week Warrior', desc: 'Logged in for 7 consecutive days', date: 'Oct 22, 2023', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
             { title: 'Zen Master', desc: 'Completed 5 meditation sessions', date: 'Nov 01, 2023', icon: Brain, color: 'text-teal-400', bg: 'bg-teal-500/20' },
             { title: 'Sober Streak', desc: '30 Days substance free', date: 'Pending', icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-800', locked: true },
           ].map((ach, idx) => (
             <div key={idx} className={`border p-6 rounded-2xl flex items-center space-x-4 ${ach.locked ? 'border-white/5 bg-[#0f0a1e] opacity-60' : 'border-white/10 bg-[#1a1429]'}`}>
                <div className={`p-4 rounded-xl ${ach.bg}`}>
                   <ach.icon className={`w-8 h-8 ${ach.color}`} />
                </div>
                <div>
                   <h3 className={`font-bold ${ach.locked ? 'text-slate-500' : 'text-white'}`}>{ach.title}</h3>
                   <p className="text-xs text-slate-400 mb-1">{ach.desc}</p>
                   {!ach.locked && (
                     <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> Earned {ach.date}
                     </span>
                   )}
                   {ach.locked && <span className="text-[10px] text-slate-600 uppercase font-bold">Locked</span>}
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
