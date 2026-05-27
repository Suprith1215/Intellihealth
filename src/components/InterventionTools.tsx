
import React, { useState, useEffect } from 'react';
import { Wind, Footprints, Waves, Phone, ChevronRight, Play, Pause, CheckCircle2, Eye, Hand, Ear, Brain } from 'lucide-react';

import { useToast } from '../contexts/ToastContext';

// --- BOX BREATHING TOOL ---
export const BoxBreathing = () => {
    const { showToast } = useToast();
    const [phase, setPhase] = useState<'Ready' | 'Inhale' | 'Hold' | 'Exhale'>('Ready');
    const [seconds, setSeconds] = useState(4);
    const [isRunning, setIsRunning] = useState(false);
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((prev) => {
                    if (prev === 1) {
                        // Phase Transition Logic
                        if (phase === 'Ready') { setPhase('Inhale'); return 4; }
                        if (phase === 'Inhale') { setPhase('Hold'); return 4; }
                        if (phase === 'Hold') { setPhase('Exhale'); return 4; }
                        if (phase === 'Exhale') {
                            setPhase('Inhale');
                            setCycle(c => {
                                const newCycle = c + 1;
                                if (newCycle % 3 === 0) showToast("Great rhythm. Keep focusing on your breath.", "success");
                                return newCycle;
                            });
                            return 4;
                        }
                        return 4;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setPhase('Ready');
            setSeconds(4);
        }
        return () => clearInterval(interval);
    }, [isRunning, phase, showToast]);

    const scale = phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : 1.5;
    const color = phase === 'Inhale' ? 'bg-cyan-500' : phase === 'Exhale' ? 'bg-indigo-500' : 'bg-teal-500';

    return (
        <div className="flex flex-col items-center justify-center h-80 w-full animate-fade-in glass-card p-6">
            <div className="relative flex items-center justify-center mb-8">
                {/* Animated Breathing Circle */}
                <div
                    className={`rounded-full transition-all duration-[4000ms] ease-linear flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.3)] ${color}`}
                    style={{
                        width: '120px',
                        height: '120px',
                        transform: `scale(${phase === 'Ready' ? 1 : scale})`
                    }}
                >
                    <span className="text-3xl font-bold text-white font-mono">{phase === 'Ready' ? 'START' : seconds}</span>
                </div>

                {/* Text Guidance */}
                <div className="absolute -bottom-20 text-center w-full">
                    <h3 className="text-2xl font-bold text-white mb-1 transition-all">
                        {phase === 'Ready' ? 'Box Breathing' : phase.toUpperCase()}
                    </h3>
                    <p className="text-sm text-slate-400">Cycles: {cycle}</p>
                </div>
            </div>

            <button
                onClick={() => setIsRunning(!isRunning)}
                className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold text-white transition-all flex items-center shadow-lg hover:shadow-cyan-500/20"
            >
                {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isRunning ? 'Pause' : 'Begin'}
            </button>
        </div>
    );
};

// --- 5-4-3-2-1 GROUNDING TOOL ---
export const GroundingExercise = () => {
    const { showToast } = useToast();
    const [step, setStep] = useState(0);
    const steps = [
        { count: 5, text: "Things you can SEE", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/20" },
        { count: 4, text: "Things you can TOUCH", icon: Hand, color: "text-green-400", bg: "bg-green-500/20" },
        { count: 3, text: "Things you can HEAR", icon: Ear, color: "text-yellow-400", bg: "bg-yellow-500/20" },
        { count: 2, text: "Things you can SMELL", icon: Wind, color: "text-pink-400", bg: "bg-pink-500/20" },
        { count: 1, text: "Thing you can TASTE", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/20" }
    ];

    const current = steps[step];

    const handleNextStep = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            setStep(5); // Complete state
            showToast("Grounding exercise completed successfully.", "success");
        }
    };

    return (
        <div className="h-80 flex flex-col items-center justify-center text-center p-6 glass-card animate-fade-in relative overflow-hidden">
            {step < 5 ? (
                <>
                    <div className="mb-6 relative z-10">
                        <div className={`w-32 h-32 rounded-full ${current.bg} flex items-center justify-center border-2 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500`}>
                            <current.icon className={`w-14 h-14 ${current.color}`} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg border-4 border-[#1a1429] shadow-lg">
                            {current.count}
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 z-10">Acknowledge {current.count} {current.text}</h3>
                    <p className="text-slate-400 mb-8 max-w-xs mx-auto z-10">Look around you. Name them out loud.</p>
                    <button
                        onClick={handleNextStep}
                        className="relative z-10 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-white shadow-xl hover:scale-105 transition-all text-lg flex items-center"
                    >
                        I've found them <ChevronRight className="inline w-5 h-5 ml-2" />
                    </button>

                    {/* Background decoration */}
                    <div className={`absolute inset-0 opacity-10 ${current.bg} blur-3xl transition-all duration-1000`}></div>
                </>
            ) : (
                <div className="text-center z-10">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">You are grounded.</h3>
                    <p className="text-slate-400 mb-8 text-lg">Take a deep breath and carry this calmness with you.</p>
                    <button onClick={() => setStep(0)} className="text-white bg-white/10 px-6 py-2 rounded-lg hover:bg-white/20 font-bold transition-all">Start Over</button>
                </div>
            )}
        </div>
    );
};

// --- URGE SURFING TOOL ---
export const UrgeSurfing = () => {
    const { showToast } = useToast();
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState(false);

    useEffect(() => {
        let interval: any;
        if (active && progress < 100) {
            interval = setInterval(() => {
                setProgress(p => {
                    const next = Math.min(100, p + 0.5);
                    if (next === 100) {
                        setActive(false);
                        showToast("Urge has passed. You stayed strong!", "success");
                    }
                    return next;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [active, progress, showToast]);

    return (
        <div className="h-80 flex flex-col items-center justify-center p-6 glass-card animate-fade-in w-full relative overflow-hidden">
            <div className="z-10 text-center w-full">
                <h3 className="text-2xl font-bold text-white mb-2">Ride the Wave</h3>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">Cravings peak like waves, then subside. You don't have to fight them, just ride them out.</p>

                <div className="relative w-full h-40 bg-[#0f0a1e] rounded-2xl overflow-hidden border border-white/10 mb-8 shadow-inner">
                    {/* Wave Animation Canvas - simulated with CSS */}
                    <div className="absolute bottom-0 left-0 right-0 h-full flex items-end opacity-80">
                        <div
                            className="bg-gradient-to-t from-cyan-600 via-blue-500 to-transparent w-full transition-all duration-100 ease-out"
                            style={{
                                height: `${Math.min(100, Math.max(20, Math.sin(progress / 5) * 30 + 50))}%`,
                                filter: 'blur(8px)' // Soft liquid look
                            }}
                        ></div>
                        <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-700 to-cyan-500 transition-all duration-300 ease-in-out mix-blend-overlay"
                            style={{ height: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <span className="text-5xl font-bold text-white drop-shadow-lg">{Math.round(progress)}%</span>
                    </div>
                </div>

                {!active ? (
                    <button onClick={() => { setActive(true); setProgress(0); }} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/40 hover:scale-105 active:scale-95">
                        Start Surfing (3 min)
                    </button>
                ) : (
                    <div className="text-cyan-300 font-bold animate-pulse flex items-center justify-center">
                        <Waves className="w-5 h-5 mr-2 animate-bounce" /> Surfing the urge...
                    </div>
                )}
            </div>
        </div>
    );
};

// --- EMERGENCY CONTACT BUTTON ---
export const EmergencyButton = ({ contactName, onCall }: { contactName: string, onCall: () => void }) => (
    <button
        onClick={onCall}
        className="w-full relative group overflow-hidden p-1 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 animate-pulse-glow"></div>
        <div className="relative bg-[#1a1429] rounded-xl p-4 flex items-center justify-between group-hover:bg-opacity-90 transition-all">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-red-500 group-hover:text-white transition-all text-red-500">
                    <Phone className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-white text-lg">Emergency Support</h4>
                    <p className="text-sm text-slate-400">Call {contactName}</p>
                </div>
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
    </button>
);
