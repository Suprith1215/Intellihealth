
import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FeatureImpact {
    name: string;
    impact: number;
    trend: 'up' | 'down' | 'stable';
    description: string;
}

interface ExplainableRiskProps {
    riskScore: number;
    features: FeatureImpact[];
    timeframe: string;
}

export const ExplainableRiskCard: React.FC<ExplainableRiskProps> = ({ riskScore, features, timeframe }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<FeatureImpact | null>(null);

    const getRisk = (score: number) => {
        if (score < 30) return { label: 'Low Risk', color: '#34d399', badgeClass: 'badge-green', glow: 'rgba(52,211,153,0.25)' };
        if (score < 60) return { label: 'Moderate Risk', color: '#fbbf24', badgeClass: 'badge-amber', glow: 'rgba(251,191,36,0.25)' };
        if (score < 85) return { label: 'High Risk', color: '#fb923c', badgeClass: 'badge-red', glow: 'rgba(251,146,60,0.25)' };
        return { label: 'Critical Risk', color: '#f87171', badgeClass: 'badge-red', glow: 'rgba(248,113,113,0.3)' };
    };

    const risk = getRisk(riskScore);
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (riskScore / 100) * circumference;

    return (
        <div className="glass-card animate-fade-in" style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Relapse Prediction Model
                        <button title="Model v4.2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.4)', display: 'inline-flex' }}>
                            <Info className="w-3.5 h-3.5" />
                        </button>
                    </h3>
                    <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 2 }}>Forecast for: {timeframe}</p>
                </div>
                <span className={`badge ${risk.badgeClass}`}>{risk.label}</span>
            </div>

            {/* Score Ring + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
                {/* Ring */}
                <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                    <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                        <defs>
                            <linearGradient id="riskRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="50%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#f87171" />
                            </linearGradient>
                        </defs>
                        {/* Track */}
                        <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
                        {/* Fill */}
                        <circle
                            cx="60" cy="60" r="52"
                            stroke="url(#riskRingGrad)"
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={`${circumference}`}
                            strokeDashoffset={`${offset}`}
                            strokeLinecap="round"
                            style={{
                                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                filter: `drop-shadow(0 0 6px ${risk.glow})`,
                            }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: 26, fontWeight: 800, color: risk.color, lineHeight: 1 }}>{riskScore}%</span>
                        <span style={{ fontSize: 9, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Probability</span>
                    </div>
                </div>

                {/* Description */}
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'rgba(203,213,225,0.8)', lineHeight: 1.6, marginBottom: 12 }}>
                        Risk predicted from <strong style={{ color: '#e2e8f0' }}>multimodal signals</strong> including sleep patterns, voice sentiment analysis, and biometric stress markers.
                    </p>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 12, fontWeight: 600, color: '#22d3ee',
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 0, transition: 'color 0.2s',
                        }}
                    >
                        Why this score?
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Feature Contributions */}
            {expanded && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }} className="animate-slide-up">
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(148,163,184,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                        Key Contributors
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedFeature(feature === selectedFeature ? null : feature)}
                                style={{
                                    padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                                    background: selectedFeature === feature ? 'rgba(34,211,238,0.05)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${selectedFeature === feature ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {feature.name}
                                        {feature.trend === 'up' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#22d3ee' }}>
                                        {feature.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                                            feature.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                                                <Minus className="w-3 h-3" />}
                                        <span style={{ fontFamily: 'monospace' }}>{feature.impact}% Impact</span>
                                    </div>
                                </div>
                                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 999,
                                        width: `${feature.impact}%`,
                                        background: feature.impact > 50
                                            ? 'linear-gradient(90deg, #f97316, #ef4444)'
                                            : 'linear-gradient(90deg, #06B6D4, #7C3AED)',
                                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                                    }} />
                                </div>
                                {selectedFeature === feature && (
                                    <div style={{
                                        marginTop: 8, padding: '9px 12px', borderRadius: 8,
                                        background: 'rgba(0,0,0,0.2)', borderLeft: '2px solid #22d3ee',
                                        fontSize: 11, color: 'rgba(203,213,225,0.7)', lineHeight: 1.6,
                                    }} className="animate-fade-in">
                                        {feature.description}
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
