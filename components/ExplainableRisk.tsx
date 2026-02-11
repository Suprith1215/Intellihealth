
import React, { useState } from 'react';
import { HelpCircle, Info, ChevronDown, ChevronUp, Activity, Moon, Zap, AlertTriangle } from 'lucide-react';

interface FeatureImpact {
    name: string;
    impact: number; // 0-100
    trend: 'up' | 'down' | 'stable';
    description: string;
}

interface ExplainableRiskProps {
    riskScore: number; // 0-100
    features: FeatureImpact[];
    timeframe: string;
}

export const ExplainableRiskCard: React.FC<ExplainableRiskProps> = ({ riskScore, features, timeframe }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<FeatureImpact | null>(null);

    const getRiskLabel = (score: number) => {
        if (score < 30) return { label: 'Low Risk', color: 'text-green-400', bg: 'bg-green-500' };
        if (score < 60) return { label: 'Moderate Risk', color: 'text-amber-400', bg: 'bg-amber-500' };
        if (score < 85) return { label: 'High Risk', color: 'text-orange-400', bg: 'bg-orange-500' };
        return { label: 'Critical Risk', color: 'text-red-400', bg: 'bg-red-500' };
    };

    const info = getRiskLabel(riskScore);

    return (
        <div className="glass-card p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center">
                        Relapse Prediction Model
                        <button className="ml-2 text-slate-400 hover:text-white" title="Model v4.2"><Info className="w-4 h-4" /></button>
                    </h3>
                    <p className="text-sm text-slate-400">Forecast for: {timeframe}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-opacity-20 ${info.bg} ${info.color}`}>
                    {info.label}
                </div>
            </div>

            {/* Score Visualization */}
            <div className="flex items-center mb-8">
                <div className="relative w-32 h-32 mr-8 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="12" fill="none" />
                        <circle
                            cx="64" cy="64" r="56"
                            stroke="url(#riskGradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${(riskScore / 100) * 351} 351`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="50%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{riskScore}%</span>
                        <span className="text-[10px] uppercase text-slate-400">Probability</span>
                    </div>
                </div>

                <div className="flex-1">
                    <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                        Your risk level is predicted based on <strong className="text-white">multimodal inputs</strong> including recent sleep patterns, voice sentiment, and stress markers.
                    </p>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-sm text-cyan-400 font-bold flex items-center hover:underline"
                    >
                        Why this score? {expanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </button>
                </div>
            </div>

            {/* Feature Contributions (Expandable) */}
            {expanded && (
                <div className="border-t border-white/5 pt-6 animate-slide-up">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Key Contributors</h4>
                    <div className="space-y-4">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer ${selectedFeature === feature ? 'bg-white/5 border-cyan-500/30' : ''}`}
                                onClick={() => setSelectedFeature(feature === selectedFeature ? null : feature)}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-white flex items-center">
                                        {feature.name}
                                        {feature.trend === 'up' && <AlertTriangle className="w-3 h-3 text-red-400 ml-2" />}
                                    </span>
                                    <span className="text-xs font-mono text-cyan-400">{feature.impact}% Impact</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full rounded-full ${feature.impact > 50 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                                        style={{ width: `${feature.impact}%` }}
                                    ></div>
                                </div>

                                {selectedFeature === feature && (
                                    <div className="bg-[#0f0a1e] p-3 rounded-lg text-xs text-slate-300 mt-2 border-l-2 border-cyan-500 animate-fade-in">
                                        <div className="flex items-start">
                                            <HelpCircle className="w-4 h-4 text-cyan-500 mr-2 flex-shrink-0" />
                                            {feature.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
