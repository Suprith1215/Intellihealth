
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Sparkles, Trash2, MessageSquare, Download, Search, X, Copy, ThumbsUp, ThumbsDown, Code, FileText, Zap, Heart, Brain, Activity, Radio, Languages } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { genAiService } from '../services/genAiService';

// Language detection and mapping
const LANGUAGE_MAP = {
  'te': 'te-IN', 'hi': 'hi-IN', 'en': 'en-US', 'ta': 'ta-IN',
  'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
  'pt': 'pt-BR', 'ru': 'ru-RU', 'ja': 'ja-JP', 'ko': 'ko-KR',
  'zh': 'zh-CN', 'ar': 'ar-SA',
};

const SUGGESTED_PROMPTS = [
  "How can I manage my cravings?",
  "What are some mindfulness exercises?",
  "Tips for better sleep in recovery",
  "How do I deal with stress?",
];

const QUICK_ACTIONS = [
  { icon: Brain, label: "Mental Health Tips", prompt: "Give me mental health tips for today" },
  { icon: Activity, label: "Breathing Exercise", prompt: "Guide me through a breathing exercise" },
  { icon: Heart, label: "Self-Care Ideas", prompt: "What are some self-care activities I can do?" },
  { icon: Zap, label: "Energy Boost", prompt: "How can I boost my energy naturally?" },
];

interface Message {
  role: 'user' | 'model';
  text: string;
  language?: string;
  timestamp?: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
  reaction?: string;
}

interface ChatBotProps {
  onNavigate?: (tab: string) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [detectedLanguage, setDetectedLanguage] = useState('en-US');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [liveMode, setLiveMode] = useState(false); // Live Mode toggle
  const [isLiveListening, setIsLiveListening] = useState(false); // Continuous listening in Live Mode


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  // Refs for accessing state inside event listeners
  const liveModeRef = useRef(liveMode);
  const isLiveListeningRef = useRef(isLiveListening);
  const isLoadingRef = useRef(isLoading);
  const isSpeakingRef = useRef(isSpeaking);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    liveModeRef.current = liveMode;
    isLiveListeningRef.current = isLiveListening;
    isLoadingRef.current = isLoading;
    isSpeakingRef.current = isSpeaking;

    // Reset processing flag when loading finishes or speaking starts
    if (!isLoading && isSpeaking) {
      isProcessingRef.current = false;
    }
  }, [liveMode, isLiveListening, isLoading, isSpeaking]);


  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        text: "Hello! I'm IntelliHeal AI, your intelligent health assistant powered by advanced AI. I can help with recovery, wellness, mental health support, and answer questions in multiple languages. How are you feeling today?",
        language: 'en-US',
        timestamp: new Date(),
        sentiment: 'positive'
      }]);
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Enable continuous recognition for Live Mode
      recognitionRef.current.interimResults = true; // Show interim results
      recognitionRef.current.lang = 'en-US'; // Default language

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const isFinal = event.results[event.results.length - 1].isFinal;

        console.log(`🎤 Heard: "${transcript}" (Final: ${isFinal})`);

        // Update input in real-time
        setInput(transcript);

        // CLEAR EXISTING SILENCE TIMER
        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
        }

        if (isFinal) {
          const detectedLang = detectLanguage(transcript);
          setDetectedLanguage(detectedLang);

          if (liveModeRef.current) {
            isProcessingRef.current = true; // Mark as processing to prevent restart
            handleSend(transcript, detectedLang);
          }
        } else if (liveModeRef.current) {
          // INTERIM RESULTS: Start Silence Timer for Rapid Response
          silenceTimer.current = setTimeout(() => {
            console.log("⚡ Rapid Response: Silence detected, sending message...");
            isProcessingRef.current = true; // Mark as processing
            recognitionRef.current.stop();
            const detectedLang = detectLanguage(transcript);
            setDetectedLanguage(detectedLang);
            handleSend(transcript, detectedLang);
          }, 1500);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 Recognition ended');
        setIsListening(false);

        // In Live Mode, restart listening if still active
        // BUT ONLY if we are NOT loading, NOT speaking, and NOT processing a request
        if (liveModeRef.current && isLiveListeningRef.current) {
          if (!isLoadingRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
            console.log('🔄 Restarting recognition for Live Mode');
            setTimeout(() => {
              if (recognitionRef.current && liveModeRef.current && isLiveListeningRef.current) {
                setIsListening(true);
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  // Ignore if already started
                }
              }
            }, 1000);
          } else {
            console.log('⏳ Not restarting recognition because: ' +
              (isLoadingRef.current ? 'Loading ' : '') +
              (isSpeakingRef.current ? 'Speaking ' : '') +
              (isProcessingRef.current ? 'Processing' : ''));
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        // console.error("🎤 Speech recognition error:", event.error); // Reduce noise
        setIsListening(false);

        if (event.error === 'no-speech') {
          // Don't show error for no-speech in Live Mode
          if (!liveModeRef.current) {
            showToast("No speech detected. Please try again.", "warning");
          } else {
            // In Live Mode, just restart quietly
            if (isLiveListeningRef.current && !isLoadingRef.current && !isSpeakingRef.current) {
              setTimeout(() => {
                try { recognitionRef.current.start(); setIsListening(true); } catch (e) { }
              }, 500);
            }
          }
        } else if (event.error === 'aborted') {
          // Ignore
        } else {
          showToast(`Voice error: ${event.error}`, "error");
        }
      };
    }

    // Initialize Speech Synthesis and load voices
    synthRef.current = window.speechSynthesis;

    // Load voices - important for Chrome/Edge
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log(`🗣️ Loaded ${voices.length} voices`);

      // Log Telugu voices if available
      const teluguVoices = voices.filter(v => v.lang.startsWith('te'));
      if (teluguVoices.length > 0) {
        console.log('✅ Telugu voices available:', teluguVoices.map(v => v.name));
      } else {
        console.log('⚠️ No Telugu voices found. Using fallback.');
      }
    };

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices(); // Also try loading immediately
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const detectLanguage = (text: string): string => {
    const teluguChars = /[\u0C00-\u0C7F]/;
    const hindiChars = /[\u0900-\u097F]/;
    const tamilChars = /[\u0B80-\u0BFF]/;
    const arabicChars = /[\u0600-\u06FF]/;
    const chineseChars = /[\u4E00-\u9FFF]/;
    const japaneseChars = /[\u3040-\u309F\u30A0-\u30FF]/;
    const koreanChars = /[\uAC00-\uD7AF]/;

    if (teluguChars.test(text)) return 'te-IN';
    if (hindiChars.test(text)) return 'hi-IN';
    if (tamilChars.test(text)) return 'ta-IN';
    if (arabicChars.test(text)) return 'ar-SA';
    if (chineseChars.test(text)) return 'zh-CN';
    if (japaneseChars.test(text)) return 'ja-JP';
    if (koreanChars.test(text)) return 'ko-KR';

    const lowerText = text.toLowerCase();
    if (/\b(hola|gracias|por favor|español)\b/.test(lowerText)) return 'es-ES';
    if (/\b(bonjour|merci|français|s'il vous plaît)\b/.test(lowerText)) return 'fr-FR';
    if (/\b(hallo|danke|guten tag|deutsch)\b/.test(lowerText)) return 'de-DE';
    if (/\b(ciao|grazie|italiano)\b/.test(lowerText)) return 'it-IT';
    if (/\b(olá|obrigado|português)\b/.test(lowerText)) return 'pt-BR';

    return 'en-US';
  };

  const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
    const positiveWords = /\b(good|great|happy|excellent|wonderful|amazing|love|joy|better|improve|help|thank)\b/i;
    const negativeWords = /\b(bad|sad|terrible|awful|hate|pain|hurt|worse|difficult|struggle|anxiety|depressed)\b/i;

    if (positiveWords.test(text)) return 'positive';
    if (negativeWords.test(text)) return 'negative';
    return 'neutral';
  };

  const speak = (text: string, language?: string) => {
    if (!voiceEnabled || !synthRef.current) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langToUse = language || detectedLanguage;
    const voices = synthRef.current.getVoices();

    let matchingVoice = null;

    // LIVE MODE: Prioritize female voices for Shalini persona
    if (liveMode) {
      // Try to find female voices first
      const femaleVoices = voices.filter(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('heera') ||
        voice.name.toLowerCase().includes('swara') ||
        voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('serena')
      );

      // For English in Live Mode, prefer female voices
      if (langToUse.startsWith('en') && femaleVoices.length > 0) {
        matchingVoice = femaleVoices.find(v => v.lang.startsWith('en')) || femaleVoices[0];
        console.log(`🎙️ Live Mode - Shalini using: ${matchingVoice.name}`);
      }
      // For Telugu in Live Mode, prefer female voices
      else if (langToUse.startsWith('te') && femaleVoices.length > 0) {
        matchingVoice = femaleVoices.find(v => v.lang.startsWith('te')) || femaleVoices[0];
        console.log(`🎙️ Live Mode - Shalini using: ${matchingVoice.name}`);
      }
    }

    // Regular voice selection (non-Live Mode)
    if (!matchingVoice) {
      // First, try exact language match (e.g., 'te-IN')
      matchingVoice = voices.find(voice => voice.lang === langToUse);

      // If no exact match, try language code match (e.g., 'te')
      if (!matchingVoice) {
        const langCode = langToUse.split('-')[0];
        matchingVoice = voices.find(voice => voice.lang.startsWith(langCode));
      }

      // For Telugu, prioritize Google voices if available
      if (langToUse.startsWith('te') && !matchingVoice) {
        matchingVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('telugu') ||
          voice.name.toLowerCase().includes('google') && voice.lang.startsWith('te')
        );
      }

      // For Hindi, prioritize Google voices
      if (langToUse.startsWith('hi') && !matchingVoice) {
        matchingVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('hindi') ||
          voice.name.toLowerCase().includes('google') && voice.lang.startsWith('hi')
        );
      }

      // For Tamil, prioritize Google voices
      if (langToUse.startsWith('ta') && !matchingVoice) {
        matchingVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('tamil') ||
          voice.name.toLowerCase().includes('google') && voice.lang.startsWith('ta')
        );
      }
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
      utterance.lang = matchingVoice.lang;
      console.log(`🗣️ Using voice: ${matchingVoice.name} (${matchingVoice.lang})`);
    } else {
      utterance.lang = langToUse;
      console.log(`🗣️ Using default voice for: ${langToUse}`);
    }

    // Live Mode: More natural, conversational speech
    if (liveMode) {
      utterance.rate = 1.0; // Natural speaking speed
      utterance.pitch = 1.1; // Slightly higher pitch for feminine voice
      utterance.volume = 1.0;
    } else {
      // Regular mode: Adjust rate and pitch for better clarity in Indian languages
      utterance.rate = langToUse.startsWith('te') || langToUse.startsWith('hi') || langToUse.startsWith('ta') ? 0.9 : 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // In Live Mode, automatically start listening again after speaking
      if (liveMode && isLiveListening && recognitionRef.current) {
        setTimeout(() => {
          setIsListening(true);
          recognitionRef.current.start();
        }, 500);
      }
    };
    utterance.onerror = (error) => {
      // Ignore 'interrupted' or 'canceled' errors as they are often intentional (e.g. new message)
      if (error.error === 'interrupted' || error.error === 'canceled') {
        setIsSpeaking(false);
        return;
      }

      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      showToast(`Voice output warning: ${error.error}`, "warning");
    };

    synthRef.current.speak(utterance);
  };

  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    if (!newState) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    showToast(`Voice output ${newState ? 'enabled' : 'disabled'}`, "info");
  };

  const toggleLiveMode = () => {
    const newState = !liveMode;
    setLiveMode(newState);

    if (newState) {
      // Enable Live Mode
      setVoiceEnabled(true); // Auto-enable voice
      setIsLiveListening(true);

      // shorter, natural greeting
      const greeting = "Hi! I'm Shalini. How are you feeling today?";

      setMessages(prev => [...prev, {
        role: 'model',
        text: greeting,
        language: 'en-US',
        timestamp: new Date(),
        sentiment: 'positive'
      }]);

      speak(greeting, 'en-US');
      showToast("🎙️ Live Mode - Shalini is listening!", "success");

      // Set recognition to support both languages (will auto-detect)
      if (recognitionRef.current) {
        recognitionRef.current.lang = 'en-US'; // Start with English, will switch based on detection
      }

      // Start listening after greeting
      setTimeout(() => {
        if (recognitionRef.current) {
          setIsListening(true);
          recognitionRef.current.start();
        }
      }, 4000); // Shorter wait for shorter greeting

    } else {
      // Disable Live Mode
      setIsLiveListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      window.speechSynthesis.cancel();
      showToast("Live Mode deactivated", "info");
    }
  };


  const switchRecognitionLanguage = (lang: string) => {
    if (recognitionRef.current) {
      const wasListening = isListening;

      // Stop current recognition
      if (wasListening) {
        recognitionRef.current.stop();
      }

      // Switch language
      recognitionRef.current.lang = lang;
      console.log(`🌍 Switched recognition language to: ${lang}`);

      // Restart if was listening
      if (wasListening && liveMode) {
        setTimeout(() => {
          if (recognitionRef.current) {
            setIsListening(true);
            recognitionRef.current.start();
          }
        }, 500);
      }

      showToast(`🌍 Now listening in ${lang === 'te-IN' ? 'Telugu' : 'English'}`, "info");
    }
  };


  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([{
        role: 'model',
        text: "Chat cleared. How can I help you now?",
        language: 'en-US',
        timestamp: new Date(),
        sentiment: 'neutral'
      }]);
      showToast("Chat history cleared", "success");
    }
  };

  const exportChat = () => {
    const chatText = messages.map(msg =>
      `[${msg.timestamp?.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.text}`
    ).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelliheal-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Chat history exported", "success");
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Message copied to clipboard", "success");
  };

  const addReaction = (index: number, reaction: string) => {
    setMessages(prev => prev.map((msg, i) =>
      i === index ? { ...msg, reaction } : msg
    ));
  };

  const handleSend = async (manualInput?: string, detectedLang?: string) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim()) return;

    const userMessage = textToSend.trim();
    const userLang = detectedLang || detectLanguage(userMessage);
    const sentiment = analyzeSentiment(userMessage);

    setInput('');
    setMessages(prev => [...prev, {
      role: 'user' as const,
      text: userMessage,
      language: userLang,
      timestamp: new Date(),
      sentiment,
    }]);
    setIsLoading(true);
    setIsTyping(true);

    // --- VOICE NAVIGATION INTERCEPT ---
    const lowerMsg = userMessage.toLowerCase();
    const isNavCommand = lowerMsg.includes('open') || lowerMsg.includes('go to') ||
      lowerMsg.includes('navigate') || lowerMsg.includes('take me to') ||
      lowerMsg.includes('show me');

    if (isNavCommand && onNavigate) {
      const routes = [
        { keywords: ['wellness', 'exercise', 'workout', 'yoga', 'stretch'], tab: 'wellness', name: 'Wellness Plan & Exercises' },
        { keywords: ['dashboard', 'home', 'main'], tab: 'dashboard', name: 'Dashboard' },
        { keywords: ['profile', 'account', 'my details'], tab: 'profile', name: 'Profile' },
        { keywords: ['progress', 'tracker', 'stats'], tab: 'progress', name: 'Progress Tracker' },
        { keywords: ['report', 'health report'], tab: 'health-reports', name: 'Health Reports' },
        { keywords: ['video', 'therapy', 'telehealth', 'counselor'], tab: 'telehealth', name: 'Video Therapy' },
        { keywords: ['music', 'sound', 'relaxing music'], tab: 'music-therapy', name: 'Music Therapy' },
        { keywords: ['survey', 'assessment', 'test'], tab: 'survey', name: 'Self Assessment' }
      ];

      for (const route of routes) {
        if (route.keywords.some(kw => lowerMsg.includes(kw))) {
          const reply = `Right away. Opening the ${route.name} for you.`;
          setIsTyping(false);
          setMessages(prev => [...prev, {
            role: 'model' as const,
            text: reply,
            timestamp: new Date(),
            sentiment: 'positive',
          }]);
          speak(reply, 'en-US');

          setTimeout(() => {
            onNavigate(route.tab);
          }, 1500); // Give it a second to speak before switching tabs
          setIsLoading(false);
          return;
        }
      }
    }
    // ----------------------------------

    // Pass conversation history to AI
    const historyForAI = messages.map(m => ({ role: m.role, text: m.text }));

    const aiResponse = await genAiService.chatWithAI(userMessage, historyForAI);

    setIsTyping(false);

    if (aiResponse) {
      // AI responded successfully
      setMessages(prev => [...prev, {
        role: 'model' as const,
        text: aiResponse,
        language: userLang,
        timestamp: new Date(),
        sentiment: analyzeSentiment(aiResponse),
      }]);
      speak(aiResponse, userLang);
    } else {
      // Intelligent local fallback when network fails
      const lower = userMessage.toLowerCase();
      let reply: string;

      if (lower.includes('alcohol') || lower.includes('drink') || lower.includes('beer') || lower.includes('wine') || lower.includes('liquor')) {
        reply = "I understand you're feeling the pull toward alcohol right now — that craving is real, and acknowledging it takes strength. 💪\n\n**Try the HALT check:** Are you Hungry, Angry, Lonely, or Tired? These are the most common craving triggers.\n\n**Right now:**\n1. Drink a large glass of cold water slowly\n2. Step outside for 60 seconds of fresh air\n3. Call your sponsor or a trusted friend\n\nCravings peak at 15–20 minutes then pass like a wave. You've beaten this before — you can do it again. I'm right here with you.";
      } else if (lower.includes('smok') || lower.includes('cigarette') || lower.includes('nicotine') || lower.includes('tobacco')) {
        reply = "That nicotine craving is real and intense — but it WILL pass, usually within 20 minutes. You've got this. 🙌\n\n**Urge surfing:** Imagine the craving as a wave. Don't fight it — just observe it. Notice where you feel it in your body. Breathe through it.\n\n**4-7-8 breathing:** Inhale for 4 → Hold for 7 → Exhale for 8. This actively calms your nervous system within minutes.\n\nYou chose to reach out instead of giving in — that IS recovery in action.";
      } else if (lower.includes('drug') || lower.includes('relapse') || lower.includes('using') || lower.includes('high')) {
        reply = "I hear you — the urge to use is one of the hardest things in recovery, and your honesty right now is real courage.\n\n**HALT check:** Hungry? Angry? Lonely? Tired? One of these is likely underneath this urge.\n\n**Immediate action:** Move to a different physical location, text your sponsor, or call iCall India: **9152987821** — you don't have to white-knuckle this alone.\n\nWhat triggered this feeling today? Talk to me.";
      } else if (lower.includes('anxiety') || lower.includes('anxious') || lower.includes('panic') || lower.includes('stress')) {
        reply = "Your anxiety is valid — your nervous system is trying to protect you, even if it's overdoing it right now.\n\n**Box breathing — do this now:**\n🌬️ Breathe IN... 1... 2... 3... 4\n⏸️ HOLD... 1... 2... 3... 4\n💨 Breathe OUT... 1... 2... 3... 4\n⏸️ HOLD... 1... 2... 3... 4\n\nRepeat 4 times. You'll feel the difference in under 2 minutes — this directly activates your parasympathetic nervous system. You are safe. 💙";
      } else if (lower.includes('sad') || lower.includes('depress') || lower.includes('hopeless') || lower.includes('give up') || lower.includes('cant do')) {
        reply = "I'm really glad you reached out. What you're feeling is completely real — and you don't have to carry it alone.\n\nRecovery is not a straight line. Hard days don't erase the progress you've already made. Every single day you've shown up — even this one — counts.\n\n**One small step right now:** Name one tiny thing you can do in the next 5 minutes that's kind to yourself. Drink water. Open a window. Lie down. That counts.\n\nIf you're feeling very low, please reach out: iCall India **9152987821** 💙";
      } else if (lower.includes('mental health') || lower.includes('tip') || lower.includes('advice') || lower.includes('help me')) {
        reply = "Here are 3 powerful mental wellness actions for today:\n\n**1. 5-4-3-2-1 Grounding** — Name 5 things you SEE, 4 you FEEL, 3 you HEAR, 2 you SMELL, 1 you TASTE. Instant anxiety reset.\n\n**2. 10-minute movement** — Walk, stretch, or dance. Your brain gets a natural dopamine rush within minutes.\n\n**3. One genuine human connection** — Text someone you trust, even just 'thinking of you'. Human connection is the #1 protective factor in recovery.\n\nYou're here, you're trying — that matters more than you know. 🌟";
      } else if (lower.includes('breath') || lower.includes('breathing') || lower.includes('calm') || lower.includes('relax')) {
        reply = "Let's do box breathing together RIGHT NOW — follow along:\n\n🌬️ **Breathe IN** slowly... 1... 2... 3... 4\n⏸️ **HOLD** gently... 1... 2... 3... 4\n💨 **Breathe OUT** fully... 1... 2... 3... 4\n⏸️ **HOLD** softly... 1... 2... 3... 4\n\nRepeat this 4 times. Each cycle activates your vagus nerve — your body's built-in calm switch. You should feel noticeably calmer in under 2 minutes. You've got this. ✨";
      } else {
        reply = "I'm here and fully present with you. 🌿\n\nTell me more about what's going on — there's no rush and absolutely no judgment here. Whatever you're carrying right now, we can work through it together, one step at a time.";
      }

      setMessages(prev => [...prev, {
        role: 'model' as const,
        text: reply,
        timestamp: new Date(),
        sentiment: 'positive',
      }]);
      speak(reply, 'en-US');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const renderMessageContent = (text: string) => {
    // Check if message contains code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', language: match[1] || 'text', content: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    const formatMarkdown = (rawText: string) => {
      // Basic Lightweight Markdown Parser for headers, bold, and lists
      let html = rawText
        .replace(/### (.*?)(?:\n|$)/g, '<h3 class="text-[17px] font-bold text-white/90 mt-5 mb-2">$1</h3>')
        .replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-[19px] font-extrabold text-white/95 mt-6 mb-3">$1</h2>')
        .replace(/# (.*?)(?:\n|$)/g, '<h1 class="text-[22px] font-black text-white mt-6 mb-4">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
        .replace(/^- (.*?)(?:\n|$)/gm, '<li class="ml-5 list-disc mb-1 marker:text-cyan-400/70">$1</li>');
      return html;
    };

    if (parts.length === 0) {
      return <div className="text-[15px] leading-relaxed tracking-wide font-light opacity-95 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />;
    }

    return (
      <div className="space-y-2">
        {parts.map((part, idx) =>
          part.type === 'code' ? (
            <div key={idx} className="relative mt-2 mb-2">
              <div className="absolute top-2 right-2 flex gap-2">
                <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-1 rounded">{part.language}</span>
                <button onClick={() => copyMessage(part.content)} className="text-slate-400 hover:text-white transition-colors">
                  <Copy size={14} />
                </button>
              </div>
              <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-sm border border-white/5">
                <code>{part.content}</code>
              </pre>
            </div>
          ) : (
            <div key={idx} className="text-[15px] leading-relaxed tracking-wide font-light opacity-95 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(part.content) }} />
          )
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-6xl mx-auto bg-[#1a1429] rounded-2xl shadow-2xl overflow-hidden border border-white/10 m-4 relative font-sans">

      {/* Header with 3D Logo */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-4 flex items-center justify-between shadow-lg z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="flex items-center space-x-3 relative z-10">
          <div className="logo-3d-container relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-xl blur-md opacity-60 animate-pulse-glow"></div>
            <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 p-0.5 rounded-xl animate-rotate-slow">
              <div className="bg-[#1a1429] p-2.5 rounded-xl">
                <Brain className="w-7 h-7 logo-3d animate-float" style={{
                  filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.4)) drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))',
                  background: 'linear-gradient(135deg, #ec4899, #a855f7, #22d3ee, #84cc16)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }} />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-shimmer">IntelliHeal</span>
              <span className="text-xs bg-gradient-to-r from-pink-500/20 to-cyan-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 animate-pulse">AI Powered</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
              <p className="text-purple-200/80 text-xs font-medium">Online & Ready</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-transparent hover:border-white/10"
            title="Search Messages"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={exportChat}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-transparent hover:border-white/10"
            title="Export Chat"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={clearChat}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-transparent hover:border-white/10"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={toggleVoice}
            className={`p-2.5 rounded-lg transition-all border ${voiceEnabled
              ? 'bg-purple-500/20 text-purple-200 border-purple-500/30'
              : 'bg-white/5 text-slate-400 border-transparent'
              }`}
            title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleLiveMode}
            className={`p-2.5 rounded-lg transition-all border ${liveMode
              ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-200 border-pink-500/50 animate-pulse'
              : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
              }`}
            title={liveMode ? "Shalini Live Mode Active" : "Activate Live Mode with Shalini"}
          >
            <Radio className="w-5 h-5" />
          </button>
          {liveMode && (
            <>
              <button
                onClick={() => switchRecognitionLanguage('en-US')}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30 hover:bg-blue-500/30 transition-all text-xs font-medium"
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => switchRecognitionLanguage('te-IN')}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-200 border border-green-500/30 hover:bg-green-500/30 transition-all text-xs font-medium"
                title="Switch to Telugu"
              >
                తె
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 bg-[#1a1429] border-b border-white/5">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 bg-[#0f0a1e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500/50 outline-none"
            />
            <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="p-3 bg-[#0f0a1e]/50 border-b border-white/5 overflow-x-auto">
        <div className="flex gap-2 max-w-4xl mx-auto">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(action.prompt)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 rounded-lg text-xs text-slate-300 hover:text-purple-300 transition-all whitespace-nowrap group"
            >
              <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0f0a1e] scroll-smooth">
        {filteredMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex items-end gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar with sentiment indicator */}
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-gradient-to-br from-indigo-600 to-cyan-600'
                }`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Sparkles size={14} className="text-white" />}
                {msg.sentiment && (
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0f0a1e] ${msg.sentiment === 'positive' ? 'bg-green-400' :
                    msg.sentiment === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} title={`Sentiment: ${msg.sentiment}`}></div>
                )}
              </div>

              {/* Bubble */}
              <div className="flex flex-col gap-2">
                <div
                  className={`p-4 rounded-2xl shadow-md backdrop-blur-sm border ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-none border-purple-500/50'
                    : 'bg-white/5 text-slate-100 rounded-tl-none border-white/10'
                    }`}
                >
                  {renderMessageContent(msg.text)}
                </div>

                {/* Message Actions */}
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 px-2">
                    <button
                      onClick={() => copyMessage(msg.text)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                      title="Copy"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => addReaction(index, '👍')}
                      className={`p-1.5 rounded-lg transition-all ${msg.reaction === '👍' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'}`}
                      title="Like"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => addReaction(index, '👎')}
                      className={`p-1.5 rounded-lg transition-all ${msg.reaction === '👎' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'}`}
                      title="Dislike"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className={`mt-1 flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider px-12 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.language && <span>{msg.language.split('-')[0]}</span>}
              {msg.timestamp && <span>•</span>}
              {msg.timestamp && <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          </div>
        ))}

        {/* Suggested Prompts */}
        {messages.length === 1 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-2xl mx-auto px-4">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 rounded-xl text-left text-sm text-slate-300 transition-all flex items-center gap-3 group"
              >
                <MessageSquare className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="flex items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-purple-200/50 font-medium ml-2">IntelliHeal is typing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="fixed bottom-24 right-8 bg-black/60 backdrop-blur-md p-3 rounded-full border border-purple-500/30 flex items-center gap-3 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-1 h-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-sound-wave" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <span className="text-xs text-purple-200 font-medium pr-2">Speaking</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-[#1a1429] border-t border-white/5 relative z-20">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            onClick={toggleListening}
            className={`p-4 rounded-2xl transition-all duration-300 ${isListening
              ? 'bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            title="Voice Input"
          >
            {isListening ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? "🎤 Listening to your voice..." : "Type your message here..."}
              className="w-full p-4 pr-12 rounded-2xl bg-[#0f0a1e] border border-white/10 focus:border-purple-500/50 outline-none transition-all text-white placeholder-slate-500/50 shadow-inner"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-4 rounded-2xl transition-all duration-300 ${input.trim() && !isLoading
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95'
              : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
              }`}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-3">
          IntelliHeal uses advanced AI to provide helpful information but is not a substitute for professional medical advice.
        </p>
      </div>

      {/* Live Mode Overlay (Gemini Live Style) */}
      {liveMode && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-fade-in font-sans">

          {/* Top Bar */}
          <div className="p-6 flex justify-between items-center z-10">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-sm font-medium tracking-wider">IntelliHeal</span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">5G</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Toggles */}
              <div className="flex bg-[#1e1e1e] rounded-full p-1 border border-white/10">
                <button
                  onClick={() => switchRecognitionLanguage('en-US')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${recognitionRef.current?.lang === 'en-US' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  English
                </button>
                <button
                  onClick={() => switchRecognitionLanguage('te-IN')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${recognitionRef.current?.lang === 'te-IN' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Telugu
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-0">
            {/* Center Logo/Status */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-pulse-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-light text-white tracking-wide mb-2">Shalini Live</h2>
                <p className="text-slate-400 text-sm font-light">
                  {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Thinking..."}
                </p>
              </div>
            </div>

            {/* Dynamic Transcript / Response Text */}
            <div className="absolute bottom-20 left-0 right-0 px-8 text-center min-h-[60px]">
              <p className="text-xl text-white/90 font-light leading-relaxed animate-fade-in bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                {isSpeaking ? messages[messages.length - 1]?.text : input || "Go ahead, I'm listening..."}
              </p>
            </div>
          </div>

          {/* Bottom Controls & Waveform */}
          <div className="relative h-1/3 bg-gradient-to-t from-[#1e1e1e] to-transparent flex flex-col justify-end pb-8">

            {/* Glowing Waveform Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden opacity-40 pointer-events-none">
              <div className={`absolute bottom-[-50%] left-[-50%] right-[-50%] h-[200%] bg-gradient-to-t from-blue-600 via-purple-600 to-transparent blur-[100px] rounded-[100%] transition-transform duration-300 ${isSpeaking || isListening ? 'scale-y-100 opacity-80' : 'scale-y-50 opacity-30'}`} />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-8 relative z-10 w-full px-8">

              {/* Hold/Pause Button */}
              <button
                onClick={() => setIsListening(!isListening)}
                className="w-14 h-14 rounded-full bg-[#2d2d2d] flex items-center justify-center text-white hover:bg-[#3d3d3d] transition-all border border-white/5 shadow-lg active:scale-95"
              >
                {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-slate-400" />}
              </button>

              {/* End Button (Big Red X) */}
              <button
                onClick={toggleLiveMode}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Keyboard/Input Button */}
              <button className="w-14 h-14 rounded-full bg-[#2d2d2d] flex items-center justify-center text-white hover:bg-[#3d3d3d] transition-all border border-white/5 shadow-lg active:scale-95">
                <Code className="w-6 h-6 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for custom animations */}
      <style>{`
        @keyframes sound-wave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-sound-wave {
          animation: sound-wave 1s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
        
        /* 3D Logo Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-shimmer {
          background-size: 200% 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .logo-3d {
          transform-style: preserve-3d;
          transition: all 0.3s ease;
        }
        .logo-3d-container:hover .logo-3d {
          transform: translateY(-4px) rotateY(15deg) rotateX(10deg) scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
