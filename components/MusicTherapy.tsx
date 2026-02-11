import React, { useState, useEffect, useRef } from 'react';
import {
    Music, Play, Pause, SkipForward, Volume2, VolumeX, Heart,
    Smile, Frown, Meh, Zap, Wind, Brain, Sparkles, X,
    TrendingUp, Moon, Headphones
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/databaseService';

// --- TYPES ---
type MoodType = 'calm' | 'sad' | 'anxious' | 'motivated' | 'low-energy' | 'focused';
type MusicCategory = 'devotional' | 'motivational' | 'bgm' | 'lofi' | 'ambient';

interface Track {
    id: string;
    title: string;
    artist: string;
    category: MusicCategory;
    mood: MoodType[];
    duration: number;
    frequency: number; // For audio generation
}

// --- SIMPLE MUSIC LIBRARY WITH AUDIO GENERATION ---
const MUSIC_LIBRARY: Track[] = [
    // Devotional/Calming Frequencies
    { id: 't1', title: 'Peaceful Meditation 432Hz', artist: 'Healing Frequencies', category: 'devotional', mood: ['calm', 'focused'], duration: 30, frequency: 432 },
    { id: 't2', title: 'Deep Relaxation 396Hz', artist: 'Therapeutic Sounds', category: 'devotional', mood: ['calm', 'sad'], duration: 30, frequency: 396 },
    { id: 't3', title: 'Spiritual Awakening 528Hz', artist: 'Healing Tones', category: 'devotional', mood: ['motivated', 'anxious'], duration: 30, frequency: 528 },
    { id: 't4', title: 'Inner Peace 417Hz', artist: 'Meditation Music', category: 'devotional', mood: ['calm', 'focused'], duration: 30, frequency: 417 },
    { id: 't5', title: 'Emotional Balance 639Hz', artist: 'Wellness Therapy', category: 'devotional', mood: ['calm', 'motivated'], duration: 30, frequency: 639 },
    { id: 't6', title: 'Clarity & Focus 741Hz', artist: 'Mindfulness Sounds', category: 'devotional', mood: ['calm', 'sad'], duration: 30, frequency: 741 },

    // Motivational/Energizing Frequencies
    { id: 't7', title: 'Energy Boost 852Hz', artist: 'Motivation Tones', category: 'motivational', mood: ['motivated', 'low-energy'], duration: 30, frequency: 852 },
    { id: 't8', title: 'Confidence Builder 963Hz', artist: 'Empowerment Music', category: 'motivational', mood: ['motivated', 'anxious'], duration: 30, frequency: 963 },
    { id: 't9', title: 'Strength & Power 440Hz', artist: 'Recovery Sounds', category: 'motivational', mood: ['motivated', 'sad'], duration: 30, frequency: 440 },
    { id: 't10', title: 'Positive Energy 523Hz', artist: 'Uplifting Frequencies', category: 'motivational', mood: ['motivated', 'low-energy'], duration: 30, frequency: 523 },

    // Ambient/Background Frequencies
    { id: 't11', title: 'Calm Background 587Hz', artist: 'Ambient Therapy', category: 'bgm', mood: ['focused', 'calm'], duration: 30, frequency: 587 },
    { id: 't12', title: 'Focus Enhancement 659Hz', artist: 'Concentration Tones', category: 'bgm', mood: ['motivated', 'focused'], duration: 30, frequency: 659 },
    { id: 't13', title: 'Gentle Comfort 698Hz', artist: 'Soothing Sounds', category: 'bgm', mood: ['calm', 'sad'], duration: 30, frequency: 698 },

    // Nature-Inspired Frequencies
    { id: 't14', title: 'Nature Harmony 396Hz', artist: 'Natural Healing', category: 'lofi', mood: ['calm', 'anxious', 'focused'], duration: 30, frequency: 396 },
    { id: 't15', title: 'Tranquil Waters 432Hz', artist: 'Nature Therapy', category: 'ambient', mood: ['calm', 'anxious', 'low-energy'], duration: 30, frequency: 432 },
];

const MOOD_CONFIG = {
    calm: { icon: Wind, color: 'from-blue-500 to-cyan-500', label: 'Calm & Peaceful', emoji: '🌊' },
    sad: { icon: Frown, color: 'from-indigo-500 to-purple-500', label: 'Feeling Down', emoji: '😔' },
    anxious: { icon: Zap, color: 'from-orange-500 to-red-500', label: 'Anxious & Restless', emoji: '😰' },
    motivated: { icon: TrendingUp, color: 'from-green-500 to-emerald-500', label: 'Motivated & Energized', emoji: '💪' },
    'low-energy': { icon: Moon, color: 'from-slate-500 to-gray-600', label: 'Low Energy', emoji: '😴' },
    focused: { icon: Brain, color: 'from-purple-500 to-pink-500', label: 'Need Focus', emoji: '🎯' }
};

const MusicTherapy: React.FC = () => {
    const { showToast } = useToast();

    const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(70);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [sessionDuration, setSessionDuration] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const trackTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Audio Context
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);

        return () => {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const generatePlaylist = (mood: MoodType) => {
        const matchingTracks = MUSIC_LIBRARY.filter(track => track.mood.includes(mood));
        const shuffled = matchingTracks.sort(() => Math.random() - 0.5).slice(0, 10);
        setPlaylist(shuffled);

        if (shuffled.length > 0) {
            setCurrentTrack(shuffled[0]);
            setCurrentTrackIndex(0);
        }
    };

    const handleMoodSelect = (mood: MoodType) => {
        setSelectedMood(mood);
        generatePlaylist(mood);
        setSessionStartTime(new Date());
        showToast(`Starting ${MOOD_CONFIG[mood].label} therapy session`, 'success');
    };

    const playAudio = (frequency: number) => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        // Stop any existing oscillator
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
        }

        // Create new oscillator
        oscillatorRef.current = audioContextRef.current.createOscillator();
        oscillatorRef.current.type = 'sine';
        oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        oscillatorRef.current.connect(gainNodeRef.current);
        oscillatorRef.current.start();

        showToast(`🎵 Playing: ${currentTrack?.title}`, 'success');
    };

    const stopAudio = () => {
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current = null;
        }
    };

    const togglePlay = () => {
        if (!currentTrack) return;

        if (isPlaying) {
            stopAudio();
            setIsPlaying(false);
            if (trackTimerRef.current) clearInterval(trackTimerRef.current);
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        } else {
            playAudio(currentTrack.frequency);
            setIsPlaying(true);

            // Start progress tracking
            const startTime = Date.now();
            progressTimerRef.current = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                const prog = (elapsed / currentTrack.duration) * 100;
                setProgress(Math.min(prog, 100));
            }, 100);

            // Auto-advance when track ends
            trackTimerRef.current = setTimeout(() => {
                handleNext();
            }, currentTrack.duration * 1000);
        }
    };

    const handleNext = () => {
        stopAudio();
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (trackTimerRef.current) clearTimeout(trackTimerRef.current);

        if (currentTrackIndex < playlist.length - 1) {
            const nextIndex = currentTrackIndex + 1;
            setCurrentTrackIndex(nextIndex);
            setCurrentTrack(playlist[nextIndex]);
            setProgress(0);

            if (isPlaying) {
                setTimeout(() => playAudio(playlist[nextIndex].frequency), 100);

                const startTime = Date.now();
                progressTimerRef.current = setInterval(() => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const prog = (elapsed / playlist[nextIndex].duration) * 100;
                    setProgress(Math.min(prog, 100));
                }, 100);

                trackTimerRef.current = setTimeout(() => {
                    handleNext();
                }, playlist[nextIndex].duration * 1000);
            }

            showToast(`Now playing: ${playlist[nextIndex].title}`, 'info');
        } else {
            setIsPlaying(false);
            setShowFeedback(true);
        }
    };

    // Volume control
    useEffect(() => {
        if (gainNodeRef.current) {
            const vol = isMuted ? 0 : volume / 100;
            gainNodeRef.current.gain.setValueAtTime(vol, audioContextRef.current!.currentTime);
        }
    }, [volume, isMuted]);

    // Session timer
    useEffect(() => {
        if (isPlaying && sessionStartTime) {
            sessionTimerRef.current = setInterval(() => {
                setSessionDuration(prev => prev + 1);
                if (sessionDuration === 1800) {
                    showToast('You\'ve been listening for 30 minutes. Take a mindful break if needed.', 'info');
                }
            }, 1000);
        } else {
            if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        }

        return () => {
            if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        };
    }, [isPlaying, sessionStartTime]);

    const toggleFavorite = (trackId: string) => {
        setFavorites(prev =>
            prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
        );
        showToast(favorites.includes(trackId) ? 'Removed from favorites' : 'Added to favorites', 'success');
    };

    const handleFeedback = (feedback: 'helpful' | 'neutral' | 'not-helpful') => {
        showToast('Thank you for your feedback!', 'success');
        setShowFeedback(false);
        setSelectedMood(null);
        setCurrentTrack(null);
        setPlaylist([]);
        setSessionDuration(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Feedback Modal
    if (showFeedback) {
        return (
            <div className="max-w-2xl mx-auto p-8 animate-in fade-in duration-300">
                <div className="glass-card p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Music className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">How did this session help you?</h2>
                    <p className="text-slate-400 mb-8">Your feedback helps us personalize future recommendations</p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <button onClick={() => handleFeedback('helpful')} className="p-6 bg-green-500/10 border-2 border-green-500/30 hover:border-green-500 rounded-xl transition-all group">
                            <Smile className="w-12 h-12 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-white font-bold">Helpful</span>
                        </button>

                        <button onClick={() => handleFeedback('neutral')} className="p-6 bg-yellow-500/10 border-2 border-yellow-500/30 hover:border-yellow-500 rounded-xl transition-all group">
                            <Meh className="w-12 h-12 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-white font-bold">Neutral</span>
                        </button>

                        <button onClick={() => handleFeedback('not-helpful')} className="p-6 bg-red-500/10 border-2 border-red-500/30 hover:border-red-500 rounded-xl transition-all group">
                            <Frown className="w-12 h-12 text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-white font-bold">Not Helpful</span>
                        </button>
                    </div>

                    <p className="text-xs text-slate-500">Session duration: {formatTime(sessionDuration)}</p>
                </div>
            </div>
        );
    }

    // Mood Selection Screen
    if (!selectedMood) {
        return (
            <div className="max-w-6xl mx-auto p-8 space-y-8">
                <div className="text-center mb-12">
                    <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                        <Headphones className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Music Therapy
                    </h1>
                    <p className="text-slate-400 text-lg">Let music support your emotional well-being and recovery journey</p>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        How are you feeling right now?
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(Object.keys(MOOD_CONFIG) as MoodType[]).map((mood) => {
                            const config = MOOD_CONFIG[mood];
                            const Icon = config.icon;

                            return (
                                <button
                                    key={mood}
                                    onClick={() => handleMoodSelect(mood)}
                                    className="group relative p-6 bg-[#1a1429] border-2 border-white/10 hover:border-white/30 rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                                    <div className="relative z-10 text-center">
                                        <div className="text-4xl mb-3">{config.emoji}</div>
                                        <Icon className={`w-8 h-8 mx-auto mb-3 bg-gradient-to-br ${config.color} bg-clip-text text-transparent`} />
                                        <h3 className="text-white font-bold mb-1">{config.label}</h3>
                                        <p className="text-xs text-slate-400">Curated playlist</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                    <div className="glass-card p-4 text-center">
                        <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <h3 className="text-white font-bold text-sm mb-1">Therapeutic Tones</h3>
                        <p className="text-xs text-slate-400">Healing frequencies for recovery</p>
                    </div>

                    <div className="glass-card p-4 text-center">
                        <Brain className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <h3 className="text-white font-bold text-sm mb-1">Mood-Adaptive</h3>
                        <p className="text-xs text-slate-400">Sounds match your current state</p>
                    </div>

                    <div className="glass-card p-4 text-center">
                        <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                        <h3 className="text-white font-bold text-sm mb-1">Evidence-Based</h3>
                        <p className="text-xs text-slate-400">Clinically appropriate selections</p>
                    </div>
                </div>
            </div>
        );
    }

    // Music Player Screen
    const moodConfig = MOOD_CONFIG[selectedMood];
    const MoodIcon = moodConfig.icon;

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-3 bg-gradient-to-br ${moodConfig.color} rounded-xl`}>
                        <MoodIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{moodConfig.label}</h2>
                        <p className="text-sm text-slate-400">Therapeutic Session</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        stopAudio();
                        setSelectedMood(null);
                        setIsPlaying(false);
                        setCurrentTrack(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="glass-card p-8 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${moodConfig.color} opacity-5`}></div>

                <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 opacity-20 px-8">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 bg-gradient-to-t ${moodConfig.color} rounded-full transition-all duration-300`}
                            style={{
                                height: isPlaying ? `${Math.random() * 100}%` : '10%',
                                animationDelay: `${i * 50}ms`
                            }}
                        ></div>
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className={`w-48 h-48 mx-auto rounded-2xl bg-gradient-to-br ${moodConfig.color} flex items-center justify-center text-8xl mb-4 shadow-2xl`}>
                            {moodConfig.emoji}
                        </div>

                        {currentTrack && (
                            <>
                                <h3 className="text-2xl font-bold text-white mb-2">{currentTrack.title}</h3>
                                <p className="text-slate-400">{currentTrack.artist}</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-xs text-slate-300">
                                    {currentTrack.category.toUpperCase()}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>{formatTime(Math.floor((progress / 100) * (currentTrack?.duration || 0)))}</span>
                            <span>{currentTrack ? formatTime(currentTrack.duration) : '0:00'}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${moodConfig.color} transition-all duration-300`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-6 mb-6">
                        <button
                            onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
                            className={`p-3 rounded-full transition-all ${currentTrack && favorites.includes(currentTrack.id)
                                ? 'bg-pink-500/20 text-pink-400'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${currentTrack && favorites.includes(currentTrack.id) ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={togglePlay}
                            disabled={!currentTrack}
                            className={`p-6 rounded-full bg-gradient-to-br ${moodConfig.color} text-white shadow-2xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={!currentTrack || currentTrackIndex >= playlist.length - 1}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SkipForward className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="w-5 h-5 text-slate-400" />
                            ) : (
                                <Volume2 className="w-5 h-5 text-slate-400" />
                            )}
                        </button>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                                setVolume(parseInt(e.target.value));
                                if (parseInt(e.target.value) > 0) setIsMuted(false);
                            }}
                            className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${volume}%, rgb(51, 65, 85) ${volume}%, rgb(51, 65, 85) 100%)`
                            }}
                        />

                        <span className="text-xs text-slate-400 w-8 text-right">{volume}%</span>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    Up Next ({playlist.length} tracks)
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {playlist.map((track, index) => (
                        <div
                            key={track.id}
                            className={`p-3 rounded-xl transition-all ${index === currentTrackIndex
                                ? `bg-gradient-to-r ${moodConfig.color} bg-opacity-20 border border-white/20`
                                : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-bold ${index === currentTrackIndex ? 'text-white' : 'text-slate-500'}`}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h4 className={`text-sm font-bold ${index === currentTrackIndex ? 'text-white' : 'text-slate-300'}`}>
                                            {track.title}
                                        </h4>
                                        <p className="text-xs text-slate-500">{track.artist}</p>
                                    </div>
                                </div>

                                <span className="text-xs text-slate-500">{formatTime(track.duration)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-400 px-4">
                <span>Session time: {formatTime(sessionDuration)}</span>
                <span>Track {currentTrackIndex + 1} of {playlist.length}</span>
            </div>
        </div>
    );
};

export default MusicTherapy;
