
import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare,
    MoreVertical, LayoutGrid, ExternalLink, Brain, Heart,
    Wind, Book, Anchor, Smile, ChevronRight, ArrowLeft, ArrowRight,
    CheckCircle2, Play, Pause, Save, X, Calendar, Clock, Users, Shield, Zap, AlertCircle, Sparkles, Monitor, Grid, Minimize2, Trophy,
    Video as VideoIcon
} from 'lucide-react';
import { genAiService } from '../services/genAiService';
import { useToast } from '../contexts/ToastContext';

// --- TYPES ---
type ViewState = 'hub' | 'video' | 'tool-cbt' | 'tool-breathing' | 'tool-journal';
type HubTab = 'sessions' | 'tools';

// --- SUB-COMPONENTS ---

const VideoRoom = ({ onLeave, sessionTitle }: { onLeave: () => void, sessionTitle: string }) => {
    const { showToast } = useToast();
    const [sessionActive, setSessionActive] = useState(false);

    const handleLaunch = (platform: 'google' | 'zoom') => {
        setSessionActive(true);
        showToast(`Launching ${platform === 'google' ? 'Google Meet' : 'Zoom'} secure session...`, "success");
        if (platform === 'google') {
            // Opens a new Google Meet room
            window.open('https://meet.google.com/new', '_blank');
        } else {
            // Opens the Zoom Join page (In a real app, this would be a specific meeting URL)
            window.open('https://zoom.us/join', '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#0f0a1e] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#1a1429]">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-600/20 rounded-lg mr-4">
                        <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{sessionTitle}</h2>
                        <div className="flex items-center space-x-4 text-xs mt-1">
                            <span className="text-green-400 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Secure Connection
                            </span>
                            <span className="text-slate-400">ID: #TH-{Math.floor(Math.random() * 10000)}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onLeave}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-full flex items-center transition-all"
                >
                    <X className="mr-2 w-4 h-4" /> Cancel Session
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-4xl w-full z-10 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Info Card */}
                    <div className="bg-[#1a1429]/80 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex flex-col justify-between">
                        <div>
                            <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden mb-6 border-4 border-purple-500/30">
                                <img
                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                                    alt="Doctor"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Dr. Sarah Jenkins</h3>
                            <p className="text-slate-400 mb-6">Licensed Addiction Specialist • PhD, Clinical Psychology</p>

                            <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center text-sm text-slate-300">
                                    <Clock className="w-4 h-4 mr-3 text-purple-400" /> 45 Minute Session
                                </div>
                                <div className="flex items-center text-sm text-slate-300">
                                    <Calendar className="w-4 h-4 mr-3 text-purple-400" /> Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-6">
                            *This session is private and confidential under HIPAA regulations.
                        </p>
                    </div>

                    {/* Action Card */}
                    <div className="bg-[#1a1429]/80 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex flex-col justify-center space-y-6">
                        <h3 className="text-xl font-bold text-white text-center mb-2">Select Video Platform</h3>

                        <button
                            onClick={() => handleLaunch('google')}
                            className="group relative overflow-hidden w-full p-4 bg-[#202124] hover:bg-[#303134] border border-white/10 rounded-2xl flex items-center transition-all hover:scale-[1.02]"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Google_Meet_icon_%282020%29.svg/1024px-Google_Meet_icon_%282020%29.svg.png" alt="Meet" className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-white text-lg">Google Meet</h4>
                                <p className="text-xs text-slate-400">Launch secure browser session</p>
                            </div>
                            <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover:text-white" />
                        </button>

                        <button
                            onClick={() => handleLaunch('zoom')}
                            className="group relative overflow-hidden w-full p-4 bg-[#2d8cff] hover:bg-[#1a7aff] rounded-2xl flex items-center transition-all hover:scale-[1.02] shadow-lg shadow-blue-900/30"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4 shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/1200px-Zoom_Communications_Logo.svg.png" alt="Zoom" className="w-auto h-3" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-white text-lg">Zoom Meeting</h4>
                                <p className="text-xs text-blue-100">Launch via App or Web</p>
                            </div>
                            <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200 group-hover:text-white" />
                        </button>

                        {sessionActive && (
                            <div className="text-center animate-fade-in pt-4 border-t border-white/10">
                                <p className="text-slate-300 mb-4 text-sm">Session launched in a new tab.</p>
                                <button onClick={onLeave} className="px-6 py-2 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-all">
                                    End Session & Return to App
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

const CBTTool = ({ onBack }: { onBack: () => void }) => {
    const { showToast } = useToast();
    const [gameStep, setGameStep] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedDistortion, setSelectedDistortion] = useState<string | null>(null);

    const questions = [
        {
            thought: "I relapsed once, so I'm a complete failure and will never recover.",
            correct: "All-or-Nothing Thinking",
            options: ["Mind Reading", "All-or-Nothing Thinking", "Emotional Reasoning"]
        },
        {
            thought: "My friend didn't text back, they must be angry at me.",
            correct: "Mind Reading",
            options: ["Mind Reading", "Catastrophizing", "Labeling"]
        },
        {
            thought: "I feel anxious, so something bad is definitely going to happen.",
            correct: "Emotional Reasoning",
            options: ["Emotional Reasoning", "Should Statements", "Filtering"]
        }
    ];

    const handleGuess = (distortion: string) => {
        if (distortion === questions[gameStep].correct) {
            setScore(score + 100);
            showToast("Correct! +100 Points", "success");
        } else {
            showToast(`Not quite. This is ${questions[gameStep].correct}.`, "error");
        }

        if (gameStep < questions.length - 1) {
            setGameStep(gameStep + 1);
        } else {
            setGameStep(3); // End screen
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <div className="bg-[#1a1429] rounded-2xl border border-white/5 p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="bg-purple-600/20 p-4 rounded-full">
                        <Brain className="w-12 h-12 text-purple-400" />
                    </div>
                </div>

                {gameStep < 3 ? (
                    <>
                        <h2 className="text-xl font-bold text-slate-300 uppercase tracking-wide mb-2">Cognitive Distortion Buster</h2>
                        <div className="text-4xl font-bold text-white mb-8">{score} Pts</div>

                        <div className="bg-[#0f0a1e] p-6 rounded-xl border border-white/10 mb-8">
                            <p className="text-lg italic text-slate-200">"{questions[gameStep].thought}"</p>
                        </div>

                        <h3 className="text-slate-400 mb-4">Identify the distortion:</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {questions[gameStep].options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleGuess(opt)}
                                    className="p-4 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 rounded-xl transition-all font-bold text-slate-300"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="py-10">
                        <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Level Complete!</h2>
                        <p className="text-slate-400 mb-8">You scored {score} points.</p>
                        <button onClick={onBack} className="px-8 py-3 bg-purple-600 rounded-xl font-bold text-white">Finish</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const BreathingTool = ({ onBack }: { onBack: () => void }) => {
    // Reusing the gamified Box Breathing logic but standalone
    return (
        <div className="max-w-xl mx-auto text-center pt-10">
            <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white mb-6 mx-auto">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
            </button>
            <h2 className="text-3xl font-bold text-white mb-8">Deep Calm Breathing</h2>
            <div className="relative w-64 h-64 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite]">
                <div className="w-48 h-48 bg-blue-500/20 rounded-full flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite_reverse]">
                    <span className="text-white font-bold">Breathe</span>
                </div>
            </div>
            <p className="text-slate-400 mt-8">Sync your breath with the circle.</p>
        </div>
    );
};

// --- UPDATED JOURNAL TOOL WITH AI (Same as before) ---
const JournalTool = ({ onBack }: { onBack: () => void }) => {
    const { showToast } = useToast();
    const [entry, setEntry] = useState('');
    const [analysis, setAnalysis] = useState<{ sentiment: string, themes: string[], insight: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!entry.trim()) return;
        setIsAnalyzing(true);
        const result = await genAiService.analyzeJournal(entry);
        setAnalysis(result);
        setIsAnalyzing(false);
        showToast("AI Analysis complete.", "success");
    };

    const handleSaveEntry = () => {
        showToast("Journal entry saved to encrypted storage.", "success");
        onBack();
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            <div className="bg-[#1a1429] rounded-2xl border border-white/5 p-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Book className="w-6 h-6 mr-3 text-orange-400" /> Therapeutic Journal
                </h2>

                <textarea
                    className="w-full h-48 bg-[#0f0a1e] border border-white/10 rounded-xl p-6 text-white text-lg leading-relaxed focus:border-orange-500 outline-none resize-none mb-4"
                    placeholder="What's on your mind? How are you feeling today?"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                />

                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !entry}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center disabled:opacity-50"
                    >
                        {isAnalyzing ? <Sparkles className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                    </button>
                    <button onClick={handleSaveEntry} className="px-6 py-2 border border-white/10 text-slate-300 font-bold rounded-xl hover:bg-white/5">
                        Save Entry
                    </button>
                </div>

                {/* AI Analysis Result */}
                {analysis && (
                    <div className="bg-white/5 border border-purple-500/30 rounded-xl p-6 animate-fade-in">
                        <h3 className="text-purple-300 font-bold text-sm uppercase mb-3 flex items-center">
                            <Brain className="w-4 h-4 mr-2" /> AI Psychological Insight
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Sentiment Detected:</span>
                                <span className={`text-sm font-bold ${analysis.sentiment === 'Negative' ? 'text-red-400' : 'text-green-400'}`}>
                                    {analysis.sentiment}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 text-sm block mb-1">Key Themes:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {analysis.themes.map(t => (
                                        <span key={t} className="text-xs bg-black/30 text-slate-300 px-2 py-1 rounded">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20 mt-2">
                                <p className="text-sm text-slate-200 italic">"{analysis.insight}"</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const TherapyCenter: React.FC = () => {
    const { showToast } = useToast();
    const [view, setView] = useState<ViewState>('hub');
    const [activeTab, setActiveTab] = useState<HubTab>('sessions');
    const [currentSessionTitle, setCurrentSessionTitle] = useState('Therapy Session');

    const handleToolSelect = (id: string) => {
        if (id === 'cbt') setView('tool-cbt');
        if (id === 'breathing') setView('tool-breathing');
        if (id === 'journal') setView('tool-journal');
    };

    const handleJoinSession = (type: string, title: string) => {
        setCurrentSessionTitle(title);
        setView('video');
    };

    if (view === 'video') return <VideoRoom sessionTitle={currentSessionTitle} onLeave={() => setView('hub')} />;
    if (view === 'tool-cbt') return <CBTTool onBack={() => setView('hub')} />;
    if (view === 'tool-breathing') return <BreathingTool onBack={() => setView('hub')} />;
    if (view === 'tool-journal') return <JournalTool onBack={() => setView('hub')} />;

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div className="bg-[#1a1429] p-8 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Therapy Center</h2>
                    <p className="text-slate-400">Access professional video therapy and AI-powered cognitive tools.</p>
                </div>
                <div className="hidden md:flex space-x-2">
                    <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold flex items-center">
                        <Users className="w-4 h-4 mr-2" /> 12 Counselors Online
                    </div>
                </div>
            </div>

            <div className="flex border-b border-white/10">
                <button onClick={() => setActiveTab('sessions')} className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'sessions' ? 'border-purple-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>Video Sessions</button>
                <button onClick={() => setActiveTab('tools')} className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'tools' ? 'border-purple-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>Cognitive Tools</button>
            </div>

            {activeTab === 'sessions' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => handleJoinSession('counselor', 'Dr. Sarah Jenkins')} className="group relative overflow-hidden p-8 bg-[#1a1429] border border-white/5 rounded-2xl text-left hover:border-purple-500 transition-all shadow-lg hover:shadow-purple-900/20">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <VideoIcon className="w-32 h-32 text-purple-500" />
                        </div>
                        <div className="relative z-10">
                            <span className="bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase mb-3 inline-block">Available Now</span>
                            <h3 className="text-2xl font-bold text-white mb-1">1-on-1 Therapy</h3>
                            <p className="text-slate-400 mb-6">Connect with your assigned specialist via secure HD video.</p>
                            <div className="inline-flex items-center text-purple-400 font-bold group-hover:text-white transition-colors">
                                Join Room <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </div>
                    </button>

                    <button onClick={() => handleJoinSession('group', 'Daily Support Group')} className="group relative overflow-hidden p-8 bg-[#1a1429] border border-white/5 rounded-2xl text-left hover:border-teal-500 transition-all shadow-lg hover:shadow-teal-900/20">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-32 h-32 text-teal-500" />
                        </div>
                        <div className="relative z-10">
                            <span className="bg-teal-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase mb-3 inline-block">Starts in 5m</span>
                            <h3 className="text-2xl font-bold text-white mb-1">Group Support</h3>
                            <p className="text-slate-400 mb-6">Join 15+ others in a moderated peer support circle.</p>
                            <div className="inline-flex items-center text-teal-400 font-bold group-hover:text-white transition-colors">
                                Join Circle <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => handleToolSelect('journal')} className="p-6 bg-[#1a1429] border border-white/5 rounded-xl cursor-pointer hover:border-orange-500 group transition-all">
                        <Book className="w-10 h-10 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-white text-lg">AI Journal</h3>
                        <p className="text-sm text-slate-400 mt-2">Analyze emotional patterns with Gemini AI.</p>
                    </div>
                    <div onClick={() => handleToolSelect('cbt')} className="p-6 bg-[#1a1429] border border-white/5 rounded-xl cursor-pointer hover:border-purple-500 group transition-all">
                        <Brain className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-white text-lg">CBT Game</h3>
                        <p className="text-sm text-slate-400 mt-2">Challenge negative thoughts in a gamified way.</p>
                    </div>
                    <div onClick={() => handleToolSelect('breathing')} className="p-6 bg-[#1a1429] border border-white/5 rounded-xl cursor-pointer hover:border-sky-500 group transition-all">
                        <Wind className="w-10 h-10 text-sky-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-white text-lg">Deep Breathing</h3>
                        <p className="text-sm text-slate-400 mt-2">Visual guides to calm your nervous system.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapyCenter;
