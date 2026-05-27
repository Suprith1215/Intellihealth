
import React, { useEffect, useState } from 'react';

// --- 3D MIND BALANCE VISUALIZER ---
export const MindBalance3D = ({ stability = 85 }: { stability: number }) => {
    // Stability controls the rotation speed/gentleness
    // 100 = perfectly stable, 0 = chaotic

    return (
        <div className="relative w-full h-64 flex items-center justify-center perspective-1000 overflow-hidden">
            {/* Background Aura */}
            <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 to-transparent opacity-50"></div>

            {/* The Gyroscope Structure */}
            <div className="relative w-40 h-40 preserve-3d animate-float">
                {/* Outer Ring */}
                <div
                    className="absolute inset-0 rounded-full border-4 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    style={{
                        transform: `rotateX(60deg) rotateY(${Date.now() / 50}deg)`,
                        animation: `spin ${20 - (stability / 10)}s linear infinite`
                    }}
                ></div>

                {/* Middle Ring */}
                <div
                    className="absolute inset-2 rounded-full border-4 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    style={{
                        transform: `rotateX(-45deg) rotateY(${Date.now() / 40}deg)`,
                        animation: `spin-reverse ${15 - (stability / 10)}s linear infinite`
                    }}
                ></div>

                {/* Inner Ring */}
                <div
                    className="absolute inset-4 rounded-full border-4 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                    style={{
                        transform: `rotateY(30deg) rotateX(${Date.now() / 30}deg)`,
                        animation: `spin ${10 - (stability / 10)}s linear infinite`
                    }}
                ></div>

                {/* Core Nucleus */}
                <div className="absolute inset-0 m-auto w-8 h-8 bg-white rounded-full shadow-[0_0_30px_#fff] animate-pulse"></div>
            </div>

            {/* CSS Animations */}
            <style>{`
            @keyframes spin { from { transform: rotateX(60deg) rotateZ(0deg); } to { transform: rotateX(60deg) rotateZ(360deg); } }
            @keyframes spin-reverse { from { transform: rotateY(45deg) rotateZ(360deg); } to { transform: rotateY(45deg) rotateZ(0deg); } }
        `}</style>

            <div className="absolute bottom-4 text-center">
                <p className="text-white font-bold tracking-widest text-xs uppercase opacity-70">Neural Stability</p>
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">{stability}%</p>
            </div>
        </div>
    );
};

// --- HYDRATION VISUALIZER (Water Physics) ---
export const HydrationVisualizer = ({ level = 60 }) => {
    return (
        <div className="relative w-32 h-64 glass-card rounded-3xl overflow-hidden border-2 border-white/20 mx-auto">
            {/* Glass Highlights */}
            <div className="absolute top-2 left-2 w-1 bg-white/40 h-56 rounded-full z-20"></div>
            <div className="absolute top-2 right-4 w-2 bg-white/20 h-10 rounded-full z-20"></div>

            {/* Water Fill */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-1000 ease-in-out"
                style={{ height: `${level}%` }}
            >
                {/* Surface Wave */}
                <div className="absolute -top-4 left-0 w-[200%] h-8 bg-cyan-400 opacity-50 rounded-[40%] animate-wave"></div>
                <div className="absolute -top-3 left-0 w-[200%] h-8 bg-cyan-300 opacity-30 rounded-[35%] animate-wave-slow" style={{ left: '-50%' }}></div>

                {/* Bubbles */}
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-bubble"></div>
                <div className="absolute bottom-8 right-6 w-3 h-3 bg-white/20 rounded-full animate-bubble" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/40 rounded-full animate-bubble" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Percentage Label */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <span className="text-3xl font-bold text-white drop-shadow-md">{level}%</span>
            </div>

            <style>{`
                @keyframes wave { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
                @keyframes wave-slow { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
                @keyframes bubble { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-100px); opacity: 0; } }
                .animate-wave { animation: wave 3s linear infinite; }
                .animate-wave-slow { animation: wave-slow 6s linear infinite; }
                .animate-bubble { animation: bubble 4s ease-in infinite; }
            `}</style>
        </div>
    );
};

// --- STRESS SURFACE TOPOLOGY ---
export const StressTopology = ({ stress = 5 }) => {
    // 1 = Flat/Calm, 10 = Jagged/Spiky
    return (
        <div className="relative w-full h-40 overflow-hidden flex items-end justify-center perspective-1000">
            {/* Grid Floor */}
            <div className="absolute inset-0 bg-purple-900/10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    transform: 'rotateX(60deg) scale(2)',
                }}
            ></div>

            {/* Dynamic Mesh Line */}
            <svg className="w-full h-full relative z-10 overflow-visible" preserveAspectRatio="none">
                <path
                    d={`M0,100 Q20,${100 - stress * 8} 40,100 T80,100 T120,${100 - stress * 5} T160,100 T200,100 T240,${100 - stress * 10} T280,100 T320,100 T360,${100 - stress * 6} T400,100 V150 H0 Z`}
                    fill="url(#stressGradient)"
                    className="transition-all duration-1000 ease-in-out"
                />
                <defs>
                    <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stress > 7 ? '#ef4444' : stress > 4 ? '#f59e0b' : '#22d3ee'} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={stress > 7 ? '#7f1d1d' : stress > 4 ? '#78350f' : '#0e7490'} stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute top-2 right-2 text-xs text-slate-400 font-mono">
                TOPOLOGY SCAN<br />
                INTENSITY: {stress}/10
            </div>
        </div>
    );
};
