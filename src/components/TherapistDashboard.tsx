
import React, { useState } from 'react';
import { Users, Activity, Bell, FileText, Search, ChevronRight, AlertTriangle, MessageSquare, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '../contexts/ToastContext';

interface Patient {
    id: string;
    name: string;
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
    lastActive: string;
    streak: number;
    trend: 'improving' | 'stable' | 'declining';
    alerts: number;
}

export const TherapistDashboard = () => {
    const { showToast } = useToast();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const patients: Patient[] = [
        { id: '1', name: 'John Doe', riskLevel: 'High', lastActive: '2h ago', streak: 12, trend: 'declining', alerts: 2 },
        { id: '2', name: 'Sarah Smith', riskLevel: 'Low', lastActive: '5m ago', streak: 45, trend: 'stable', alerts: 0 },
        { id: '3', name: 'Mike Johnson', riskLevel: 'Moderate', lastActive: '1d ago', streak: 3, trend: 'improving', alerts: 1 },
        { id: '4', name: 'Emily Davis', riskLevel: 'Critical', lastActive: '10m ago', streak: 0, trend: 'declining', alerts: 4 },
        { id: '5', name: 'Alex Wilson', riskLevel: 'Low', lastActive: '3h ago', streak: 89, trend: 'stable', alerts: 0 },
    ];

    const chartData = [
        { day: 'Mon', score: 65 },
        { day: 'Tue', score: 59 },
        { day: 'Wed', score: 80 }, // Relapse event simulated
        { day: 'Thu', score: 81 },
        { day: 'Fri', score: 56 },
        { day: 'Sat', score: 55 },
        { day: 'Sun', score: 52 },
    ];

    const handleAlertsClick = () => {
        showToast("Alerts Panel: Showing 3 critical notifications.", "info");
    };

    const handleScheduleClick = () => {
        showToast("Calendar opened. Select a slot for Dr. Roberts.", "info");
    };

    const handleSendMessage = () => {
        if (selectedPatient) {
            showToast(`Message window opened for ${selectedPatient.name}.`, "success");
        }
    };

    const handleViewReport = () => {
        if (selectedPatient) {
            showToast(`Generating PDF Clinical Report for ${selectedPatient.name}...`, "info");
        }
    };

    const handleReviewTimeline = () => {
        showToast("Opening detailed event timeline...", "info");
    };

    return (
        <div className="max-w-7xl mx-auto p-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center">
                        <Activity className="w-8 h-8 text-cyan-400 mr-3" />
                        Clinician Portal
                    </h1>
                    <p className="text-slate-400 mt-1">Dr. Roberts • Addiction Medicine Specialty</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleAlertsClick} className="flex items-center space-x-2 px-4 py-2 bg-[#1a1429] border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all">
                        <Bell className="w-4 h-4" />
                        <span>Alerts (3)</span>
                    </button>
                    <button onClick={handleScheduleClick} className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold transition-all shadow-lg shadow-cyan-900/20">
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Session</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Patient List */}
                <div className="glass-card p-0 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-white/10 bg-[#1a1429]">
                        <h3 className="font-bold text-white mb-4">Patient Monitoring</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search patients..."
                                className="w-full bg-[#0f0a1e] border border-white/10 rounded-xl py-2 pl-10 text-sm text-white focus:border-cyan-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(patient => (
                            <div
                                key={patient.id}
                                onClick={() => setSelectedPatient(patient)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border border-transparent ${selectedPatient?.id === patient.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white">{patient.name}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${patient.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                        patient.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                            patient.riskLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-green-500/20 text-green-400'
                                        }`}>
                                        {patient.riskLevel} Risk
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Active: {patient.lastActive}</span>
                                    <span className="flex items-center text-slate-300">
                                        <AlertTriangle className={`w-3 h-3 mr-1 ${patient.alerts > 0 ? 'text-red-400' : 'text-slate-600'}`} />
                                        {patient.alerts}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Details */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedPatient ? (
                        <>
                            {/* Alert Banner */}
                            {selectedPatient.riskLevel === 'Critical' && (
                                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center justify-between animate-fade-in">
                                    <div className="flex items-center">
                                        <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                                        <div>
                                            <h3 className="font-bold text-red-200">Immediate Attention Required</h3>
                                            <p className="text-sm text-red-300/70">Patient flagged for rapid risk escalation (Score 89/100).</p>
                                        </div>
                                    </div>
                                    <button onClick={handleReviewTimeline} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-red-900/40">Review Timeline</button>
                                </div>
                            )}

                            {/* Main Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="glass-card p-4">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Risk Score</p>
                                    <p className={`text-2xl font-bold mt-1 ${selectedPatient.riskLevel === 'Critical' ? 'text-red-400' :
                                        selectedPatient.riskLevel === 'High' ? 'text-orange-400' : 'text-slate-200'
                                        }`}>
                                        {selectedPatient.riskLevel === 'High' ? '78' : selectedPatient.riskLevel === 'Critical' ? '89' : '45'}
                                        <span className="text-sm text-slate-500 font-normal ml-1">/ 100</span>
                                    </p>
                                </div>
                                <div className="glass-card p-4">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Sobriety Streak</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {selectedPatient.streak} <span className="text-sm text-slate-500 font-normal">Days</span>
                                    </p>
                                </div>
                                <div className="glass-card p-4">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Intervention Status</p>
                                    <p className="text-2xl font-bold text-cyan-400 mt-1">Active</p>
                                </div>
                            </div>

                            {/* Risk Trajectory Chart */}
                            <div className="glass-card p-6">
                                <h3 className="font-bold text-white mb-6">7-Day Risk Trajectory</h3>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={chartData}>
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a1429', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                                labelStyle={{ color: '#94a3b8' }}
                                            />
                                            <Line type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Journals */}
                            <div className="glass-card p-6">
                                <h3 className="font-bold text-white mb-4">Latest Insights</h3>
                                <div className="space-y-4">
                                    <div className="bg-[#0f0a1e] p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-slate-500">Today, 9:00 AM • Voice Journal</span>
                                            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">Negative Sentiment</span>
                                        </div>
                                        <p className="text-slate-300 text-sm italic">"I'm feeling really overwhelmed with work. The urge is stronger than it has been in weeks..."</p>
                                    </div>
                                    <div className="bg-[#0f0a1e] p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-slate-500">Yesterday, 8:45 PM • Daily Check-in</span>
                                            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold">Stable</span>
                                        </div>
                                        <p className="text-slate-300 text-sm italic">"Managed to get through the evening cravings by using the breathing tool."</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleSendMessage} className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-all border border-white/10 flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Send Message
                                </button>
                                <button onClick={handleViewReport} className="py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-all border border-white/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 mr-2" /> View Full Report
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <Users className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a patient to view detailed analytics</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
