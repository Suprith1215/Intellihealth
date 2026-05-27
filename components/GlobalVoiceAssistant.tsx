import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { genAiService } from '../services/genAiService';

interface GlobalVoiceAssistantProps {
    onNavigate: (tab: string) => void;
}

export const GlobalVoiceAssistant: React.FC<GlobalVoiceAssistantProps> = ({ onNavigate }) => {
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const { showToast } = useToast();
    const intentionalStopRef = useRef(false);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const responseDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

    const speakText = (text: string, onEndCallback?: () => void) => {
        if (!('speechSynthesis' in window)) {
            if (onEndCallback) onEndCallback();
            return;
        }

        // Cancel any currently stuck/hanging audio from a previous cancelled query
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = 1;
        utterance.rate = 1;
        utterance.pitch = 1;

        // Browsers load voices asynchronously, we must check gracefully
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            utterance.voice = voices.find(v => v.lang.includes('en') && v.name.includes('Female')) ||
                voices.find(v => v.lang.includes('en')) ||
                null;
        }

        if (onEndCallback) {
            utterance.onend = onEndCallback;
            utterance.onerror = (e) => {
                console.error("Speech Synthesis Error:", e);
                onEndCallback(); // Ensure mic restarts even if audio fails
            };
        }

        // Small delay helps Chrome audio context wake up
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);
    };

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true; // Catch things fast
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                intentionalStopRef.current = false;
            };

            recognitionRef.current.onend = () => {
                if (!intentionalStopRef.current) {
                    // Auto restart logic if disconnected by browser timeout (Chrome does this ~60s)
                    try {
                        recognitionRef.current.start();
                    } catch (e) { }
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current.onresult = (event: any) => {
                let fullTranscript = '';
                // Only look at the latest segment of speech to avoid repeating history endlessly
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    fullTranscript += event.results[i][0].transcript + ' ';
                }

                const transcriptLower = fullTranscript.toLowerCase();

                // Listen for wake word (flexible fuzzy matching) anywhere in the recent buffer
                // Clear any existing silence timer
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                // Listen for wake word (flexible fuzzy matching) anywhere in the recent buffer
                const wakeWords = ['shalini', 'salini', 'charlie', 'hey charlie'];
                const matchedWake = wakeWords.find(w => transcriptLower.includes(w));

                if (matchedWake) {
                    const routes = [
                        { keywords: ['wellness', 'exercise', 'workout', 'yoga', 'stretch', 'plan'], tab: 'wellness', name: 'Wellness Plan' },
                        { keywords: ['dashboard', 'home', 'main page'], tab: 'dashboard', name: 'Dashboard' },
                        { keywords: ['profile', 'account', 'my details'], tab: 'profile', name: 'Profile' },
                        { keywords: ['progress', 'tracker', 'stats'], tab: 'progress', name: 'Progress Tracker' },
                        { keywords: ['report', 'health report'], tab: 'health-reports', name: 'Health Reports' },
                        { keywords: ['video', 'therapy', 'telehealth', 'connect', 'doctor', 'therapist'], tab: 'telehealth', name: 'Video Therapy' },
                        { keywords: ['music', 'sound', 'relaxing', 'audio'], tab: 'music-therapy', name: 'Music Therapy' },
                        { keywords: ['survey', 'assessment', 'test'], tab: 'survey', name: 'Self Assessment' },
                        { keywords: ['chat', 'assistant', 'bot', 'talk to ai'], tab: 'chatbot', name: 'AI Assistant' },
                        { keywords: ['week', 'weekly'], tab: 'weekly-reports', name: 'Weekly Reports' },
                        { keywords: ['developer', 'hub', 'code'], tab: 'developer', name: 'Developer Hub' }
                    ];

                    let isNavigation = false;

                    for (const route of routes) {
                        if (route.keywords.some(kw => transcriptLower.includes(kw))) {
                            isNavigation = true;
                            // Stop listening temporarily so she doesn't hear her own response
                            intentionalStopRef.current = true;
                            recognitionRef.current.stop();
                            setIsListening(false);

                            speakText(`Yes, opening ${route.name} right away.`);
                            showToast(`Voice Command: Redirecting to ${route.name}`, 'success');

                            setTimeout(() => {
                                onNavigate(route.tab);
                                setTimeout(() => {
                                    intentionalStopRef.current = false;
                                    try { recognitionRef.current.start(); } catch (e) { }
                                }, 2500);
                            }, 1000);
                            break;
                        }
                    }

                    // If it was NOT a navigation command, start the silence timer to ask AI
                    if (!isNavigation) {
                        silenceTimerRef.current = setTimeout(() => {
                            handleGeneralAiQuery(fullTranscript, matchedWake);
                        }, 1500);
                    }
                }
            };

            const handleGeneralAiQuery = async (fullTranscript: string, matchedWake: string) => {
                intentionalStopRef.current = true;
                recognitionRef.current.stop();
                setIsListening(false);
                setIsThinking(true);
                setAiResponse(null);

                // Extract query after the wake word
                const queryParts = fullTranscript.toLowerCase().split(matchedWake);
                const query = queryParts.length > 1 ? queryParts.pop()?.trim() : "What can you help me with?";
                const finalQuery = (query && query.length > 3) ? query : "What can you help me with?";

                showToast(`Thinking about: "${finalQuery}"...`, 'info');

                try {
                    // Inject a strict prompt context to make it conversational and short
                    const response = await genAiService.chatWithAI(`The user asked: "${finalQuery}". Give a brief, conversational, highly empathetic response. No formatting, no markdown. Max 3 short sentences.`);

                    setIsThinking(false);

                    if (response) {
                        // Clean markdown if it leaked through
                        const cleanResponse = response.replace(/\*/g, '').replace(/#/g, '').trim();
                        setAiResponse(cleanResponse); // Show visually

                        // Auto-dismiss the visual bubble after 12 seconds
                        if (responseDismissTimerRef.current) clearTimeout(responseDismissTimerRef.current);
                        responseDismissTimerRef.current = setTimeout(() => {
                            setAiResponse(null);
                        }, 12000);

                        speakText(cleanResponse, () => {
                            setTimeout(() => {
                                intentionalStopRef.current = false;
                                try { recognitionRef.current.start(); } catch (e) { }
                            }, 500);
                        });

                        // Fallback: if speech synthesis is broken/blocked by browser, still restart mic after delay
                        setTimeout(() => {
                            if (intentionalStopRef.current) {
                                intentionalStopRef.current = false;
                                try { recognitionRef.current.start(); } catch (e) { }
                            }
                        }, 6000);
                    }
                } catch (error) {
                    setIsThinking(false);
                    setAiResponse("I had a little trouble connecting to my brain. Could you try asking again?");
                    if (responseDismissTimerRef.current) clearTimeout(responseDismissTimerRef.current);
                    responseDismissTimerRef.current = setTimeout(() => setAiResponse(null), 5000);

                    intentionalStopRef.current = false;
                    try { recognitionRef.current.start(); } catch (e) { }
                }
            };
        } else {
            console.warn("SpeechRecognition not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                intentionalStopRef.current = true;
                recognitionRef.current.stop();
            }
        };
    }, [onNavigate, showToast]);

    // Auto-start listening on any user interaction (browser policy requires interaction to use microphone)
    useEffect(() => {
        const handleGlobalClick = () => {
            if (recognitionRef.current && !isListening && !intentionalStopRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    // Already started or blocked
                }
            }
        };

        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [isListening]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            showToast("Voice recognition not supported in this browser. Try Chrome/Edge.", "error");
            return;
        }

        if (isListening) {
            intentionalStopRef.current = true;
            recognitionRef.current.stop();
            setIsListening(false);
            showToast('Shalini Voice Assistant Paused', 'info');
        } else {
            intentionalStopRef.current = false;
            try {
                recognitionRef.current.start();
                showToast('Listening! Say "Hey Shalini, open [page]" anytime.', 'success');
            } catch (e) {
                console.error("Mic already started", e);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3">
            {aiResponse && !isThinking && (
                <div className="absolute bottom-20 right-0 w-[300px] bg-black/85 backdrop-blur-xl border border-violet-500/40 rounded-2xl rounded-br-none p-4 shadow-[0_10px_40px_rgba(124,58,237,0.3)] animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Shalini AI</span>
                    </div>
                    <p className="text-[14px] leading-relaxed text-slate-200">
                        {aiResponse}
                    </p>
                </div>
            )}

            {isThinking && (
                <div className="flex bg-black/80 backdrop-blur-md rounded-full px-5 py-2.5 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] items-center gap-3 animate-fade-in whitespace-nowrap">
                    <div className="flex gap-1 items-center h-4">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm font-medium text-cyan-100">Shalini is thinking...</span>
                </div>
            )}
            {isListening && !isThinking && (
                <div className="flex bg-black/60 backdrop-blur-md rounded-full px-5 py-2.5 border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.2)] items-center gap-2 animate-fade-in whitespace-nowrap">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-sm font-medium text-violet-200">Processing Audio...</span>
                </div>
            )}
            <button
                onClick={toggleListening}
                className={isListening ? "p-4 rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse" : "p-4 rounded-full flex items-center justify-center transition-all duration-300 bg-black/80 border border-white/20 hover:border-violet-500/70 hover:bg-black/90 text-slate-300 hover:text-white backdrop-blur-xl shadow-lg"}
                title="Toggle Shalini Voice Assistant"
            >
                {isListening ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5" />}
            </button>
        </div>
    );
};
