import React, { useState, useEffect } from 'react';
import { Mic, Camera, Activity, Lock, WifiOff, Smartphone, Watch } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export const VoiceAnalysisRecorder = () => {
    const { showToast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(10));

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setVisualizerData(prev => prev.map(() => Math.random() * 40 + 10));
            }, 100);
        } else {
            setVisualizerData(new Array(20).fill(10));
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleRecordToggle = () => {
        if (!isRecording) {
            showToast("Listening for vocal biomarkers (Secure Mode)...", "info");
        } else {
            showToast("Analysis complete. Sentiment: Stable.", "success");
        }
        setIsRecording(!isRecording);
    };

    return (
        <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center">
                    <Mic className="w-5 h-5 text-cyan-400 mr-2" />
                    Vocal Biomarkers
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-green-900/40 text-green-400 font-bold border border-green-500/20">Active</span>
            </div>

            <div className="bg-[#0f0a1e] rounded-xl p-4 border border-white/5 mb-4 h-24 flex items-center justify-center space-x-1">
                {visualizerData.map((h, i) => (
                    <div
                        key={i}
                        className="w-1.5 rounded-full bg-cyan-500 transition-all duration-100 ease-in-out"
                        style={{ height: `${h}px`, opacity: isRecording ? 1 : 0.3 }}
                    ></div>
                ))}
            </div>

            <button
                onClick={handleRecordToggle}
                className={`w-full py-3 rounded-xl font-bold transition-all ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'}`}
            >
                {isRecording ? 'End Analysis' : 'Start Voice Journal'}
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center flex items-center justify-center">
                <Lock className="w-3 h-3 mr-1" /> On-device processing • Privacy protected
            </p>
        </div>
    );
};

export const DataSourcesPanel = () => {
    const { showToast } = useToast();

    const handleConnectCamera = () => {
        showToast("Requesting camera access for facial affect analysis...", "info");
        setTimeout(() => showToast("Camera connected successfully.", "success"), 1000);
    };

    return (
        <div className="glass-card p-6">
            <h3 className="font-bold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 text-purple-400 mr-2" />
                Live Signals
            </h3>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center">
                        <Watch className="w-5 h-5 text-slate-400 mr-3" />
                        <div>
                            <div className="text-sm font-bold text-white">Wearable Sync</div>
                            <div className="text-xs text-slate-500">Heart Rate: 72 BPM</div>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center">
                        <Smartphone className="w-5 h-5 text-slate-400 mr-3" />
                        <div>
                            <div className="text-sm font-bold text-white">Digital Phenotyping</div>
                            <div className="text-xs text-slate-500">Screen Time: 3h 12m</div>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center">
                        <Camera className="w-5 h-5 text-slate-400 mr-3" />
                        <div>
                            <div className="text-sm font-bold text-white">Facial Affect</div>
                            <div className="text-xs text-slate-500">Micro-expressions: Neutral</div>
                        </div>
                    </div>
                    <button onClick={handleConnectCamera} className="text-[10px] text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-500/10 transition-colors">Connect</button>
                </div>
            </div>
        </div>
    );
};
