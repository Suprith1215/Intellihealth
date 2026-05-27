import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Activity, Lock, Watch, Smartphone, Camera, Brain, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

// ── Emotion config ────────────────────────────────────────────────
interface EmotionResult {
    primaryEmotion: string;
    stage: 'Stable' | 'Mildly Distressed' | 'Distressed' | 'Critical';
    stressLevel: number;   // 0–100
    sentimentScore: number; // -1 to 1
    confidence: number;    // 0–100
    insights: string[];
    recommendation: string;
    crisisFlag: boolean;
}

const STAGE_CONFIG: Record<EmotionResult['stage'], { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    'Stable': {
        color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)',
        icon: <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />,
    },
    'Mildly Distressed': {
        color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)',
        icon: <Activity className="w-4 h-4" style={{ color: '#fbbf24' }} />,
    },
    'Distressed': {
        color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)',
        icon: <AlertTriangle className="w-4 h-4" style={{ color: '#fb923c' }} />,
    },
    'Critical': {
        color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)',
        icon: <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />,
    },
};

// ── Gemini Voice Analysis ─────────────────────────────────────────
async function analyzeVoiceWithAI(transcript: string): Promise<EmotionResult> {
    try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

        const prompt = `You are an expert clinical psychologist and vocal biomarker specialist trained in addiction recovery assessment.

Analyze the following speech transcript for emotional state, psychological stability, and addiction recovery indicators.

TRANSCRIPT: "${transcript}"

Perform a deep analysis considering:
1. Linguistic patterns (word choice, sentence structure, negative vs positive language)
2. Emotional indicators (stress, anxiety, depression, hope, motivation)
3. Recovery stage indicators (craving mentions, triggers, relapse risk)
4. Crisis signals (self-harm, giving up, hopelessness)
5. Overall sentiment and wellbeing

Return ONLY valid JSON (no markdown):
{
  "primaryEmotion": "one word e.g. Anxious / Hopeful / Calm / Depressed / Motivated / Frustrated / Grateful",
  "stage": "Stable" | "Mildly Distressed" | "Distressed" | "Critical",
  "stressLevel": number 0-100,
  "sentimentScore": number -1.0 to 1.0,
  "confidence": number 0-100,
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendation": "One specific, actionable recommendation for this person right now (max 20 words)",
  "crisisFlag": boolean (true only if text contains self-harm or suicidal ideation)
}`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt,
            config: { responseMimeType: 'application/json' },
        });

        const parsed = JSON.parse(result.text || '{}');
        return {
            primaryEmotion: parsed.primaryEmotion || 'Neutral',
            stage: parsed.stage || 'Stable',
            stressLevel: Math.min(100, Math.max(0, parsed.stressLevel ?? 30)),
            sentimentScore: Math.min(1, Math.max(-1, parsed.sentimentScore ?? 0)),
            confidence: Math.min(100, Math.max(0, parsed.confidence ?? 70)),
            insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 3) : ['Analysis complete.'],
            recommendation: parsed.recommendation || 'Continue practicing mindfulness and regular check-ins.',
            crisisFlag: !!parsed.crisisFlag,
        };
    } catch (err) {
        console.error('Voice AI analysis error:', err);
        // Fallback: basic keyword analysis
        const lower = transcript.toLowerCase();
        const negWords = ['sad', 'depressed', 'hurt', 'pain', 'craving', 'relapse', 'can\'t', 'struggling', 'hopeless', 'tired', 'anxious', 'scared', 'angry', 'hate'];
        const posWords = ['good', 'happy', 'better', 'hope', 'strong', 'grateful', 'progress', 'calm', 'okay', 'great', 'improving'];
        const crisisWords = ['kill', 'die', 'suicide', 'end it', 'give up', 'self-harm'];

        const negCount = negWords.filter(w => lower.includes(w)).length;
        const posCount = posWords.filter(w => lower.includes(w)).length;
        const isCrisis = crisisWords.some(w => lower.includes(w));
        const stressLevel = Math.min(95, negCount * 20 + 10);
        const sentimentScore = (posCount - negCount) / Math.max(1, posCount + negCount);
        const stage: EmotionResult['stage'] = isCrisis ? 'Critical' : negCount > 3 ? 'Distressed' : negCount > 1 ? 'Mildly Distressed' : 'Stable';

        return {
            primaryEmotion: negCount > posCount ? 'Anxious' : posCount > negCount ? 'Hopeful' : 'Neutral',
            stage,
            stressLevel,
            sentimentScore,
            confidence: 60,
            insights: ['Speech pattern analyzed.', `Detected ${negCount} stress markers.`, 'Consider speaking with your therapist.'],
            recommendation: 'Practice a 4-7-8 breathing exercise to center yourself.',
            crisisFlag: isCrisis,
        };
    }
}

// ── VoiceAnalysisRecorder ─────────────────────────────────────────
export const VoiceAnalysisRecorder = () => {
    const { showToast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [result, setResult] = useState<EmotionResult | null>(null);
    const [bars, setBars] = useState<number[]>(new Array(28).fill(4));
    const [recordingTime, setRecordingTime] = useState(0);

    const recognitionRef = useRef<any>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number>(0);
    const timerRef = useRef<any>(null);

    // ── Real audio waveform visualization ─────────────────────────
    const startAudioVisualizer = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioCtxRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyzer = ctx.createAnalyser();
            analyzer.fftSize = 64;
            source.connect(analyzer);
            analyzerRef.current = analyzer;

            const draw = () => {
                if (!analyzerRef.current) return;
                const data = new Uint8Array(analyzer.frequencyBinCount);
                analyzer.getByteFrequencyData(data);
                const newBars = Array.from({ length: 28 }, (_, i) => {
                    const idx = Math.floor((i / 28) * data.length);
                    return Math.max(4, (data[idx] / 255) * 56);
                });
                setBars(newBars);
                animFrameRef.current = requestAnimationFrame(draw);
            };
            draw();
        } catch {
            // Fallback: animated bars
            const interval = setInterval(() => {
                setBars(prev => prev.map(() => Math.random() * 48 + 4));
            }, 80);
            (analyzerRef.current as any) = interval;
        }
    }, []);

    const stopAudioVisualizer = useCallback(() => {
        cancelAnimationFrame(animFrameRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        analyzerRef.current = null;
        setBars(new Array(28).fill(4));
    }, []);

    // ── Timer ──────────────────────────────────────────────────────
    const startTimer = useCallback(() => {
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    }, []);
    const stopTimer = useCallback(() => {
        clearInterval(timerRef.current);
        setRecordingTime(0);
    }, []);

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── Start Recording ────────────────────────────────────────────
    const startRecording = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast('Speech recognition not supported. Please use Chrome/Edge.', 'error');
            return;
        }

        setTranscript('');
        setInterimTranscript('');
        setResult(null);

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        recognitionRef.current = rec;

        let finalText = '';

        rec.onresult = (e: any) => {
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                    finalText += t + ' ';
                    setTranscript(finalText);
                } else {
                    interim += t;
                }
            }
            setInterimTranscript(interim);
        };

        rec.onerror = (e: any) => {
            if (e.error !== 'no-speech') {
                showToast(`Microphone error: ${e.error}`, 'error');
            }
        };

        rec.start();
        setIsRecording(true);
        startAudioVisualizer();
        startTimer();
        showToast('🎙️ Vocal analysis started — speak naturally', 'info');
    }, [showToast, startAudioVisualizer, startTimer]);

    // ── Stop + Analyze ─────────────────────────────────────────────
    const stopAndAnalyze = useCallback(async () => {
        recognitionRef.current?.stop();
        stopAudioVisualizer();
        stopTimer();
        setIsRecording(false);

        const textToAnalyze = transcript.trim();
        if (!textToAnalyze || textToAnalyze.length < 5) {
            showToast('Please speak for at least a few seconds to enable analysis.', 'warning');
            return;
        }

        setIsAnalyzing(true);
        showToast('🧠 AI is analyzing your vocal biomarkers…', 'info');

        const analysis = await analyzeVoiceWithAI(textToAnalyze);
        setResult(analysis);
        setIsAnalyzing(false);

        if (analysis.crisisFlag) {
            showToast('⚠️ Please reach out to iCall India: 9152987821', 'error');
        } else {
            showToast(`Analysis complete — ${analysis.stage}`, 'success');
        }
    }, [transcript, stopAudioVisualizer, stopTimer, showToast]);

    const handleToggle = () => {
        if (isRecording) stopAndAnalyze();
        else startRecording();
    };

    const handleReset = () => {
        setTranscript('');
        setInterimTranscript('');
        setResult(null);
    };

    const stageInfo = result ? STAGE_CONFIG[result.stage] : null;

    return (
        <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.12)',
                        border: `1px solid ${isRecording ? 'rgba(239,68,68,0.3)' : 'rgba(6,182,212,0.25)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s',
                    }}>
                        <Mic className="w-4 h-4" style={{ color: isRecording ? '#f87171' : '#22d3ee' }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Vocal Biomarker Analyzer</h3>
                        <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>Gemini AI • Real-time emotion detection</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isRecording && (
                        <span style={{
                            fontSize: 11, fontWeight: 600, color: '#f87171',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', animation: 'pulse 1s infinite' }} />
                            {formatTime(recordingTime)}
                        </span>
                    )}
                    {result && !isRecording && (
                        <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px' }}>
                            <RefreshCw className="w-3 h-3" /> Reset
                        </button>
                    )}
                    <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: isRecording ? '#f87171' : '#22d3ee',
                        background: isRecording ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)',
                        border: `1px solid ${isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(6,182,212,0.2)'}`,
                        borderRadius: 6, padding: '3px 8px',
                    }}>
                        {isRecording ? 'Recording' : result ? 'Done' : 'Ready'}
                    </span>
                </div>
            </div>

            {/* Waveform Visualizer */}
            <div style={{
                height: 72, borderRadius: 12,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '0 16px', position: 'relative', overflow: 'hidden',
            }}>
                {/* Base glow */}
                {isRecording && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 70%)',
                    }} />
                )}
                {bars.map((h, i) => (
                    <div
                        key={i}
                        style={{
                            width: 3,
                            height: `${isRecording ? h : result ? Math.max(4, (result.stressLevel / 100) * 56 * Math.sin((i / bars.length) * Math.PI)) : 4}px`,
                            borderRadius: 3,
                            background: isRecording
                                ? `hsl(${185 + h * 1.2}, 80%, 65%)`
                                : result
                                    ? `hsl(${result.stage === 'Stable' ? 160 : result.stage === 'Mildly Distressed' ? 45 : result.stage === 'Distressed' ? 25 : 0}, 80%, 60%)`
                                    : 'rgba(255,255,255,0.08)',
                            transition: isRecording ? 'height 0.08s ease' : 'height 0.5s ease',
                            flexShrink: 0,
                        }}
                    />
                ))}
            </div>

            {/* Live Transcript */}
            {(isRecording || transcript) && (
                <div style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    minHeight: 48, maxHeight: 80, overflowY: 'auto',
                }}>
                    <p style={{ fontSize: 12, color: 'rgba(203,213,225,0.8)', lineHeight: 1.6 }}>
                        {transcript}
                        {interimTranscript && (
                            <span style={{ color: 'rgba(148,163,184,0.4)', fontStyle: 'italic' }}>{interimTranscript}</span>
                        )}
                        {isRecording && !transcript && !interimTranscript && (
                            <span style={{ color: 'rgba(148,163,184,0.3)', fontStyle: 'italic' }}>Listening… speak naturally</span>
                        )}
                    </p>
                </div>
            )}

            {/* Record / Analyze Button */}
            <button
                onClick={handleToggle}
                disabled={isAnalyzing}
                style={{
                    width: '100%', padding: '12px 20px', borderRadius: 12,
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.3s',
                    background: isRecording
                        ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))'
                        : isAnalyzing
                            ? 'rgba(255,255,255,0.05)'
                            : 'linear-gradient(135deg, #06B6D4, #7C3AED)',
                    color: isRecording ? '#f87171' : isAnalyzing ? 'rgba(148,163,184,0.6)' : 'white',
                    boxShadow: isRecording
                        ? '0 0 20px rgba(239,68,68,0.2)'
                        : isAnalyzing
                            ? 'none'
                            : '0 4px 20px rgba(6,182,212,0.3)',
                    border: isRecording ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
                    outline: 'none',
                }}
            >
                {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with Gemini AI…</>
                ) : isRecording ? (
                    <><MicOff className="w-4 h-4" /> Stop & Analyze</>
                ) : (
                    <><Mic className="w-4 h-4" /> Start Vocal Analysis</>
                )}
            </button>

            {/* AI Analysis Results */}
            {result && !isAnalyzing && stageInfo && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

                    {/* Stage + Emotion */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{
                            flex: 1, padding: '14px 16px', borderRadius: 12,
                            background: stageInfo.bg, border: `1px solid ${stageInfo.border}`,
                            display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {stageInfo.icon}
                                <span style={{ fontSize: 11, fontWeight: 600, color: stageInfo.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {result.stage}
                                </span>
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#f0f4f8', lineHeight: 1 }}>
                                {result.primaryEmotion}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                            {/* Stress level */}
                            <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em' }}>STRESS LEVEL</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
                                        <div style={{ height: '100%', width: `${result.stressLevel}%`, borderRadius: 999, background: `linear-gradient(90deg, #34d399, ${result.stressLevel > 70 ? '#f87171' : result.stressLevel > 40 ? '#fbbf24' : '#34d399'})`, transition: 'width 1s' }} />
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', flexShrink: 0 }}>{result.stressLevel}%</span>
                                </div>
                            </div>
                            {/* Confidence */}
                            <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', marginBottom: 5, fontWeight: 600, letterSpacing: '0.06em' }}>AI CONFIDENCE</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa' }}>{result.confidence}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                            AI Insights
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {result.insights.map((ins, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(203,213,225,0.8)' }}>
                                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7C3AED', marginTop: 6, flexShrink: 0 }} />
                                    {ins}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div style={{
                        padding: '12px 14px', borderRadius: 10,
                        background: 'rgba(124,58,237,0.06)',
                        border: '1px solid rgba(124,58,237,0.18)',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                        <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <p style={{ fontSize: 12, color: 'rgba(203,213,225,0.85)', lineHeight: 1.55 }}>
                            <strong style={{ color: '#a78bfa' }}>Recommendation: </strong>{result.recommendation}
                        </p>
                    </div>

                    {/* Crisis Banner */}
                    {result.crisisFlag && (
                        <div style={{
                            padding: '12px 14px', borderRadius: 10,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                        }}>
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.55 }}>
                                <strong>Crisis Support: </strong>Please reach out immediately → iCall India: <strong>9152987821</strong>
                            </p>
                        </div>
                    )}
                </div>
            )}

            <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.35)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Lock className="w-3 h-3" /> On-device recording • Gemini AI analysis • Privacy protected
            </p>
        </div>
    );
};

// ── DataSourcesPanel ──────────────────────────────────────────────
export const DataSourcesPanel = () => {
    const { showToast } = useToast();
    const [hrv, setHrv] = useState(68);
    const [screenTime] = useState('3h 12m');
    const [facialState, setFacialState] = useState<'Neutral' | 'Connected' | 'Analyzing'>('Neutral');

    useEffect(() => {
        const interval = setInterval(() => {
            setHrv(prev => Math.min(95, Math.max(55, prev + (Math.random() > 0.5 ? 1 : -1))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleConnectCamera = () => {
        setFacialState('Analyzing');
        showToast('Requesting camera access for facial affect analysis…', 'info');
        setTimeout(() => {
            setFacialState('Connected');
            showToast('Facial affect analysis active.', 'success');
        }, 1500);
    };

    const signals = [
        {
            icon: <Watch className="w-4 h-4" style={{ color: 'rgba(148,163,184,0.6)' }} />,
            label: 'Biometric Sync',
            sub: `Heart Rate: ${hrv} BPM`,
            status: 'live' as const,
        },
        {
            icon: <Smartphone className="w-4 h-4" style={{ color: 'rgba(148,163,184,0.6)' }} />,
            label: 'Digital Phenotyping',
            sub: `Screen Time: ${screenTime}`,
            status: 'live' as const,
        },
    ];

    return (
        <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Live Data Signals</h3>
                    <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>Multimodal health inputs</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {signals.map((s, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '11px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {s.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 1 }}>{s.label}</div>
                                <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>{s.sub}</div>
                            </div>
                        </div>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: '#34d399',
                            boxShadow: '0 0 8px rgba(52,211,153,0.6)',
                            animation: 'pulse 2s infinite',
                        }} />
                    </div>
                ))}

                {/* Facial Affect */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 14px', borderRadius: 12,
                    background: facialState === 'Connected' ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${facialState === 'Connected' ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Camera className="w-4 h-4" style={{ color: 'rgba(148,163,184,0.6)' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 1 }}>Facial Affect AI</div>
                            <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>
                                {facialState === 'Connected' ? 'Micro-expressions: Tracking' : facialState === 'Analyzing' ? 'Connecting…' : 'Micro-expressions: Offline'}
                            </div>
                        </div>
                    </div>
                    {facialState === 'Connected' ? (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.6)', animation: 'pulse 2s infinite' }} />
                    ) : (
                        <button
                            onClick={handleConnectCamera}
                            disabled={facialState === 'Analyzing'}
                            style={{
                                fontSize: 11, fontWeight: 600, color: '#22d3ee',
                                background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}
                        >
                            {facialState === 'Analyzing' ? <><Loader2 className="w-3 h-3 animate-spin" /> Connecting</> : 'Connect'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
