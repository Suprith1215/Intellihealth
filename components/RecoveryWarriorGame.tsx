import React, { useState, useEffect } from 'react';
import {
    X, Volume2, VolumeX, Sword, Shield, Zap, Heart,
    Droplet, Pill, BookOpen, Moon, Brain, Target,
    ChevronRight, Lock, Unlock, Star, Trophy
} from 'lucide-react';

interface AegisGameProps {
    waterIntake: number;
    medicationsTaken: number;
    exercisesCompleted: number;
    sleepQuality: number;
    journalEntries: number;
    stressLevel: number;
    onClose: () => void;
}

// Game State Types
type GamePhase = 'intro' | 'chapter1' | 'chapter2' | 'chapter3' | 'victory' | 'defeat';
type PowerType = 'energy_blast' | 'mind_shield' | 'focus_strike' | 'healing_aura';

interface Enemy {
    id: number;
    name: string;
    type: 'Crave' | 'Stressor' | 'Relapse Lord';
    health: number;
    maxHealth: number;
    attack: number;
    defeated: boolean;
    emoji: string;
    color: string;
    description: string;
}

interface Power {
    id: PowerType;
    name: string;
    icon: React.ReactNode;
    damage: number;
    unlocked: boolean;
    requirement: string;
    cooldown: number;
    currentCooldown: number;
}

const AegisGame: React.FC<AegisGameProps> = ({
    waterIntake,
    medicationsTaken,
    exercisesCompleted,
    sleepQuality = 7,
    journalEntries = 0,
    stressLevel,
    onClose
}) => {
    const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
    const [currentChapter, setCurrentChapter] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    // Hero Stats
    const [heroHealth, setHeroHealth] = useState(100);
    const [heroMaxHealth] = useState(100);
    const [heroEnergy, setHeroEnergy] = useState(100);
    const [heroLevel, setHeroLevel] = useState(1);
    const [heroXP, setHeroXP] = useState(0);

    // Calculate hero power from real-life actions
    const calculateHeroPower = () => {
        let power = 0;
        power += medicationsTaken * 30; // Medicine is most important
        power += waterIntake * 10;
        power += exercisesCompleted * 20;
        power += sleepQuality * 5;
        power += journalEntries * 15;
        power -= stressLevel * 5; // Stress reduces power
        return Math.max(0, power);
    };

    const [heroPower] = useState(calculateHeroPower());

    // Powers System
    const [powers, setPowers] = useState<Power[]>([
        {
            id: 'energy_blast',
            name: 'Energy Blast',
            icon: <Zap className="w-6 h-6" />,
            damage: 30,
            unlocked: medicationsTaken >= 1,
            requirement: 'Take medication',
            cooldown: 3,
            currentCooldown: 0
        },
        {
            id: 'mind_shield',
            name: 'Mind Shield',
            icon: <Shield className="w-6 h-6" />,
            damage: 0,
            unlocked: sleepQuality >= 6,
            requirement: 'Get good sleep (6+ hours)',
            cooldown: 5,
            currentCooldown: 0
        },
        {
            id: 'focus_strike',
            name: 'Focus Strike',
            icon: <Target className="w-6 h-6" />,
            damage: 50,
            unlocked: journalEntries >= 1,
            requirement: 'Write in journal',
            cooldown: 4,
            currentCooldown: 0
        },
        {
            id: 'healing_aura',
            name: 'Healing Aura',
            icon: <Droplet className="w-6 h-6" />,
            damage: 0,
            unlocked: waterIntake >= 4,
            requirement: 'Drink 4+ glasses of water',
            cooldown: 6,
            currentCooldown: 0
        }
    ]);

    // Enemies for each chapter
    const [enemies, setEnemies] = useState<Enemy[]>([
        // Chapter 1
        { id: 1, name: 'Minor Urge', type: 'Crave', health: 50, maxHealth: 50, attack: 10, defeated: false, emoji: '😈', color: '#8B5CF6', description: 'A small craving trying to distract you' },
        { id: 2, name: 'Doubt Whisper', type: 'Stressor', health: 60, maxHealth: 60, attack: 12, defeated: false, emoji: '👻', color: '#6366F1', description: 'Voices of self-doubt' },

        // Chapter 2
        { id: 3, name: 'Craving Storm', type: 'Crave', health: 100, maxHealth: 100, attack: 20, defeated: false, emoji: '🌪️', color: '#EF4444', description: 'Intense cravings attacking your resolve' },
        { id: 4, name: 'Anxiety Beast', type: 'Stressor', health: 120, maxHealth: 120, attack: 25, defeated: false, emoji: '😱', color: '#F59E0B', description: 'Overwhelming anxiety' },

        // Chapter 3 - Final Boss
        { id: 5, name: 'The Relapse Lord', type: 'Relapse Lord', health: 200, maxHealth: 200, attack: 35, defeated: false, emoji: '👹', color: '#DC2626', description: 'The ultimate test of your recovery' }
    ]);

    const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
    const [battleLog, setBattleLog] = useState<string[]>(['🛡️ Aegis, Mind Guardian of Neurovia, awakens...']);
    const [isAttacking, setIsAttacking] = useState(false);
    const [shieldActive, setShieldActive] = useState(false);

    const currentEnemy = enemies[currentEnemyIndex];

    // Story chapters
    const storyChapters = [
        {
            chapter: 1,
            title: 'The Broken Mind',
            subtitle: 'Neurovia Under Siege',
            story: `The city of Neurovia was once a beacon of mental clarity and peace. But darkness has fallen. 
      
The Craves have emerged from the shadows of addiction, the Stressors feed on anxiety and fear, and the legendary Relapse Lord waits in the depths.

You are Aegis, the Mind Guardian. Once broken by these very forces, you have begun your recovery. Each healthy choice you make in the real world strengthens you here.

Your journey begins now. The first enemies are weak, but they test your resolve.`,
            image: '🏙️',
            enemies: [0, 1]
        },
        {
            chapter: 2,
            title: 'The Craving Storm',
            subtitle: 'Power Through Discipline',
            story: `You've defeated the minor threats, but the real battle begins now.

The Craving Storm approaches - a manifestation of intense urges that once controlled you. The Anxiety Beast lurks nearby, feeding on your fears.

But you are stronger now. Your medication has unlocked the Energy Blast. Your water intake fuels your Healing Aura. Your journal entries sharpen your Focus Strike.

Remember: Every healthy habit in real life is a weapon here. Every neglected task weakens you.

The storm is coming. Are you ready?`,
            image: '⚡',
            enemies: [2, 3]
        },
        {
            chapter: 3,
            title: 'The Relapse Lord',
            subtitle: 'Final Battle for Freedom',
            story: `Deep in the darkest corner of Neurovia stands the Relapse Lord - the embodiment of all your past struggles.

This enemy cannot be defeated by strength alone. Only true recovery discipline can vanquish it:

✅ Consistent medication
✅ Proper hydration  
✅ Regular journaling
✅ Quality sleep
✅ Low stress levels

This is not just a game. This is your recovery journey made real.

The final battle awaits. Your freedom depends on the choices you've made.`,
            image: '👹',
            enemies: [4]
        }
    ];

    const addLog = (message: string) => {
        setBattleLog(prev => [...prev.slice(-4), message]);
    };

    const playSound = (type: 'attack' | 'power' | 'heal' | 'damage' | 'victory' | 'defeat') => {
        if (isMuted) return;

        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gainNode = audio.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audio.destination);

        switch (type) {
            case 'attack':
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.3, audio.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2);
                break;
            case 'power':
                [440, 554, 659, 880].forEach((freq, i) => {
                    setTimeout(() => {
                        const osc = audio.createOscillator();
                        const gain = audio.createGain();
                        osc.connect(gain);
                        gain.connect(audio.destination);
                        osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.2, audio.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15);
                        osc.start();
                        osc.stop(audio.currentTime + 0.15);
                    }, i * 50);
                });
                return;
            case 'heal':
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, audio.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4);
                break;
            case 'damage':
                oscillator.frequency.value = 150;
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.3, audio.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3);
                break;
            case 'victory':
                [523, 659, 784, 1047].forEach((freq, i) => {
                    setTimeout(() => {
                        const osc = audio.createOscillator();
                        const gain = audio.createGain();
                        osc.connect(gain);
                        gain.connect(audio.destination);
                        osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.25, audio.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4);
                        osc.start();
                        osc.stop(audio.currentTime + 0.4);
                    }, i * 120);
                });
                return;
            case 'defeat':
                oscillator.frequency.value = 100;
                gainNode.gain.setValueAtTime(0.4, audio.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 1);
                break;
        }

        oscillator.start();
        oscillator.stop(audio.currentTime + 0.5);
    };

    const usePower = (powerId: PowerType) => {
        const power = powers.find(p => p.id === powerId);
        if (!power || !power.unlocked || power.currentCooldown > 0 || isAttacking) return;

        setIsAttacking(true);
        playSound('power');

        if (powerId === 'healing_aura') {
            const healAmount = 30;
            setHeroHealth(prev => Math.min(heroMaxHealth, prev + healAmount));
            addLog(`💚 Healing Aura restored ${healAmount} health!`);
            playSound('heal');
        } else if (powerId === 'mind_shield') {
            setShieldActive(true);
            addLog(`🛡️ Mind Shield activated! Next attack blocked.`);
            setTimeout(() => setShieldActive(false), 5000);
        } else {
            // Attack power
            const damage = power.damage + (heroPower / 10);
            const newHealth = Math.max(0, currentEnemy.health - damage);

            setEnemies(prev => prev.map((e, idx) =>
                idx === currentEnemyIndex ? { ...e, health: newHealth, defeated: newHealth === 0 } : e
            ));

            addLog(`⚡ ${power.name} dealt ${Math.floor(damage)} damage to ${currentEnemy.name}!`);

            if (newHealth === 0) {
                handleEnemyDefeated();
            } else {
                enemyCounterAttack();
            }
        }

        // Set cooldown
        setPowers(prev => prev.map(p =>
            p.id === powerId ? { ...p, currentCooldown: p.cooldown } : p
        ));

        setTimeout(() => setIsAttacking(false), 500);
    };

    const handleEnemyDefeated = () => {
        playSound('victory');
        const xpGain = 50;
        setHeroXP(prev => prev + xpGain);
        addLog(`🎉 ${currentEnemy.name} defeated! +${xpGain} XP`);

        // Check if chapter complete
        const chapterEnemies = storyChapters[currentChapter].enemies;
        const allDefeated = chapterEnemies.every(idx => enemies[idx].defeated || idx === currentEnemyIndex);

        if (allDefeated) {
            if (currentChapter < 2) {
                setTimeout(() => {
                    setCurrentChapter(prev => prev + 1);
                    setCurrentEnemyIndex(storyChapters[currentChapter + 1].enemies[0]);
                    addLog(`📖 Chapter ${currentChapter + 2} unlocked!`);
                }, 2000);
            } else {
                setTimeout(() => setGamePhase('victory'), 2000);
            }
        } else {
            // Move to next enemy in chapter
            const nextEnemyIdx = chapterEnemies.find(idx => !enemies[idx].defeated && idx !== currentEnemyIndex);
            if (nextEnemyIdx !== undefined) {
                setTimeout(() => setCurrentEnemyIndex(nextEnemyIdx), 1500);
            }
        }
    };

    const enemyCounterAttack = () => {
        setTimeout(() => {
            if (shieldActive) {
                addLog(`🛡️ Mind Shield blocked ${currentEnemy.name}'s attack!`);
                setShieldActive(false);
                return;
            }

            let damage = currentEnemy.attack;
            // Stress increases enemy damage
            damage += stressLevel * 2;

            setHeroHealth(prev => {
                const newHealth = Math.max(0, prev - damage);
                if (newHealth === 0) {
                    setGamePhase('defeat');
                    playSound('defeat');
                }
                return newHealth;
            });

            addLog(`💥 ${currentEnemy.name} strikes for ${damage} damage!`);
            playSound('damage');
        }, 800);
    };

    // Cooldown system
    useEffect(() => {
        const interval = setInterval(() => {
            setPowers(prev => prev.map(p => ({
                ...p,
                currentCooldown: Math.max(0, p.currentCooldown - 1)
            })));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Intro Screen
    if (gamePhase === 'intro') {
        return (
            <div className="fixed inset-0 z-[150] bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex items-center justify-center p-8 overflow-auto">
                <div className="max-w-5xl w-full">
                    <div className="text-center mb-12">
                        <div className="text-8xl mb-6 animate-pulse">🛡️</div>
                        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-4">
                            AEGIS
                        </h1>
                        <p className="text-3xl text-purple-300 font-bold mb-2">Mind Guardian of Neurovia</p>
                        <p className="text-xl text-slate-400 italic">A Story-Driven Recovery Adventure</p>
                    </div>

                    <div className="bg-black/60 backdrop-blur-2xl rounded-3xl p-12 border-4 border-purple-500/50 mb-8">
                        <h2 className="text-3xl font-black text-white mb-6 text-center">🏙️ The World of Neurovia</h2>
                        <p className="text-lg text-slate-300 leading-relaxed mb-8 text-center max-w-3xl mx-auto">
                            A city under siege by dark forces: <span className="text-red-400 font-bold">Craves</span>,
                            <span className="text-orange-400 font-bold"> Stressors</span>, and the legendary
                            <span className="text-purple-400 font-bold"> Relapse Lord</span>.
                            <br /><br />
                            You are <span className="text-cyan-400 font-bold">Aegis</span>, powered not by the sun, but by
                            <span className="text-green-400 font-bold"> recovery discipline</span>.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-cyan-500/10 p-6 rounded-2xl border-2 border-cyan-500/30 text-center">
                                <Pill className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                                <div className="text-2xl font-black text-white">{medicationsTaken}</div>
                                <div className="text-sm text-cyan-300">Medicine</div>
                                <div className="text-xs text-slate-400 mt-2">+{medicationsTaken * 30} Power</div>
                            </div>
                            <div className="bg-blue-500/10 p-6 rounded-2xl border-2 border-blue-500/30 text-center">
                                <Droplet className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                <div className="text-2xl font-black text-white">{waterIntake}</div>
                                <div className="text-sm text-blue-300">Hydration</div>
                                <div className="text-xs text-slate-400 mt-2">+{waterIntake * 10} Power</div>
                            </div>
                            <div className="bg-orange-500/10 p-6 rounded-2xl border-2 border-orange-500/30 text-center">
                                <Heart className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                                <div className="text-2xl font-black text-white">{exercisesCompleted}</div>
                                <div className="text-sm text-orange-300">Exercise</div>
                                <div className="text-xs text-slate-400 mt-2">+{exercisesCompleted * 20} Power</div>
                            </div>
                            <div className="bg-purple-500/10 p-6 rounded-2xl border-2 border-purple-500/30 text-center">
                                <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                                <div className="text-2xl font-black text-white">{journalEntries}</div>
                                <div className="text-sm text-purple-300">Journal</div>
                                <div className="text-xs text-slate-400 mt-2">+{journalEntries * 15} Power</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-2xl border-2 border-yellow-500/50 text-center mb-8">
                            <div className="text-sm text-yellow-300 font-bold mb-2">TOTAL HERO POWER</div>
                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                {heroPower}
                            </div>
                            <div className="text-sm text-slate-400 mt-2">
                                {heroPower < 50 ? '⚠️ Low Power - Complete more wellness activities!' :
                                    heroPower < 100 ? '💪 Good Power - Ready for battle!' :
                                        '🔥 Excellent Power - Unstoppable!'}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setGamePhase('chapter1')}
                            className="px-16 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-3xl font-black rounded-2xl hover:scale-110 transition-transform shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-pulse"
                        >
                            ⚔️ BEGIN ADVENTURE ⚔️
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <X className="w-8 h-8 text-white" />
                    </button>
                </div>
            </div>
        );
    }

    // Victory Screen
    if (gamePhase === 'victory') {
        return (
            <div className="fixed inset-0 z-[150] bg-gradient-to-b from-yellow-900 via-orange-900 to-black flex items-center justify-center p-8">
                <div className="max-w-4xl text-center">
                    <div className="text-9xl mb-8 animate-bounce">🏆</div>
                    <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
                        VICTORY!
                    </h1>
                    <h2 className="text-4xl font-bold text-white mb-4">Neurovia is Free!</h2>
                    <p className="text-2xl text-orange-300 mb-8">
                        You have defeated the Relapse Lord and saved the city!
                    </p>

                    <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-12 border-4 border-yellow-500/50 mb-8">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            Through discipline, dedication, and daily recovery actions, you have proven that
                            <span className="text-cyan-400 font-bold"> healthy behavior equals strength</span>.
                            <br /><br />
                            Every medication taken, every glass of water, every journal entry - these were not just tasks.
                            <br />
                            <span className="text-yellow-400 font-bold text-2xl">They were your weapons.</span>
                            <br /><br />
                            The journey continues. Keep building your power every day.
                        </p>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="bg-purple-500/20 p-6 rounded-2xl">
                                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                                <div className="text-3xl font-black text-white">{heroXP}</div>
                                <div className="text-sm text-slate-300">Total XP</div>
                            </div>
                            <div className="bg-blue-500/20 p-6 rounded-2xl">
                                <Trophy className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                                <div className="text-3xl font-black text-white">{heroLevel}</div>
                                <div className="text-sm text-slate-300">Final Level</div>
                            </div>
                            <div className="bg-green-500/20 p-6 rounded-2xl">
                                <Sword className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <div className="text-3xl font-black text-white">{heroPower}</div>
                                <div className="text-sm text-slate-300">Hero Power</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-black rounded-2xl hover:scale-110 transition-transform"
                    >
                        Continue Your Journey
                    </button>
                </div>
            </div>
        );
    }

    // Defeat Screen
    if (gamePhase === 'defeat') {
        return (
            <div className="fixed inset-0 z-[150] bg-gradient-to-b from-red-950 via-gray-900 to-black flex items-center justify-center p-8">
                <div className="max-w-4xl text-center">
                    <div className="text-9xl mb-8">💔</div>
                    <h1 className="text-6xl font-black text-red-500 mb-6">
                        The Battle Continues...
                    </h1>
                    <p className="text-2xl text-slate-300 mb-8">
                        Recovery is a journey, not a destination.
                    </p>

                    <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-12 border-4 border-red-500/50 mb-8">
                        <p className="text-xl text-slate-300 leading-relaxed mb-8">
                            This setback doesn't define you. Every warrior faces challenges.
                            <br /><br />
                            <span className="text-cyan-400 font-bold">Complete more wellness activities</span> to gain power:
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-left mb-8">
                            <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/30">
                                <Pill className="w-6 h-6 text-cyan-400 mb-2" />
                                <div className="text-white font-bold">Take your medication</div>
                                <div className="text-sm text-slate-400">Unlocks Energy Blast</div>
                            </div>
                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
                                <Droplet className="w-6 h-6 text-blue-400 mb-2" />
                                <div className="text-white font-bold">Drink more water</div>
                                <div className="text-sm text-slate-400">Unlocks Healing Aura</div>
                            </div>
                            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/30">
                                <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
                                <div className="text-white font-bold">Write in your journal</div>
                                <div className="text-sm text-slate-400">Unlocks Focus Strike</div>
                            </div>
                            <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30">
                                <Moon className="w-6 h-6 text-indigo-400 mb-2" />
                                <div className="text-white font-bold">Get quality sleep</div>
                                <div className="text-sm text-slate-400">Unlocks Mind Shield</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setGamePhase('intro');
                                setHeroHealth(100);
                                setCurrentEnemyIndex(0);
                                setEnemies(prev => prev.map(e => ({ ...e, health: e.maxHealth, defeated: false })));
                            }}
                            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xl font-black rounded-xl hover:scale-110 transition-transform"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold rounded-xl transition-all"
                        >
                            Exit Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Game Screen
    return (
        <div className="fixed inset-0 z-[150] bg-gradient-to-b from-indigo-950 via-purple-950 to-black overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-40 bg-black/50 backdrop-blur-sm border-b border-purple-500/30">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Brain className="w-7 h-7 text-cyan-400" />
                        AEGIS: Mind Guardian
                    </h2>
                    <p className="text-purple-300 text-sm">Chapter {currentChapter + 1}: {storyChapters[currentChapter].title}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-yellow-400 font-bold text-xs">LEVEL {heroLevel}</div>
                        <div className="text-white text-lg font-black">{heroXP} XP</div>
                    </div>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all text-sm"
                    >
                        Exit
                    </button>
                </div>
            </div>

            {/* Battle Arena */}
            <div className="absolute inset-0 pt-24 pb-48 flex items-center justify-between px-20">
                {/* Hero (Aegis) */}
                <div className="relative">
                    <div className={`relative ${isAttacking ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
                        {/* Hero glow */}
                        <div className="absolute inset-0 bg-cyan-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>

                        {/* Shield effect */}
                        {shieldActive && (
                            <div className="absolute inset-0 border-8 border-blue-400 rounded-full animate-ping"></div>
                        )}

                        {/* Hero character */}
                        <div className="relative z-10 w-48">
                            {/* Head */}
                            <div className="w-20 h-20 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full mx-auto mb-3 border-4 border-yellow-600 shadow-2xl">
                                <div className="flex gap-2 justify-center pt-6">
                                    <div className="w-2 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                                    <div className="w-2 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="w-28 h-36 bg-gradient-to-b from-cyan-500 to-blue-700 rounded-t-3xl rounded-b-xl mx-auto border-4 border-cyan-800 shadow-2xl relative">
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-yellow-600">
                                    <Brain className="w-6 h-6 text-blue-700" />
                                </div>
                                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-28 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                            </div>

                            {/* Legs */}
                            <div className="flex gap-3 justify-center -mt-2">
                                <div className="w-8 h-20 bg-gradient-to-b from-cyan-600 to-cyan-900 rounded-b-xl border-2 border-cyan-800"></div>
                                <div className="w-8 h-20 bg-gradient-to-b from-cyan-600 to-cyan-900 rounded-b-xl border-2 border-cyan-800"></div>
                            </div>
                        </div>
                    </div>

                    {/* Hero stats */}
                    <div className="mt-6 bg-black/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-cyan-500 min-w-[280px]">
                        <div className="text-cyan-300 font-bold mb-4 text-center text-lg">AEGIS</div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-500" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500"
                                            style={{ width: `${(heroHealth / heroMaxHealth) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-white text-sm font-bold w-16 text-right">{heroHealth}/{heroMaxHealth}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                                            style={{ width: `${(heroEnergy / 100) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-yellow-400 text-sm font-bold w-16 text-right">{heroEnergy}/100</span>
                            </div>

                            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 rounded-xl border border-cyan-500/30 text-center">
                                <div className="text-xs text-cyan-300 mb-1">POWER</div>
                                <div className="text-2xl font-black text-cyan-400">{heroPower}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enemy */}
                {currentEnemy && !currentEnemy.defeated && (
                    <div className="relative">
                        <div className="relative animate-float">
                            <div className="absolute inset-0 rounded-full blur-3xl opacity-60" style={{ backgroundColor: currentEnemy.color }}></div>

                            <div className="relative z-10 w-48">
                                <div className="text-9xl text-center mb-4 filter drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                                    {currentEnemy.emoji}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-black/80 backdrop-blur-xl rounded-2xl p-6 border-2 min-w-[300px]" style={{ borderColor: currentEnemy.color }}>
                            <div className="font-bold mb-2 text-center text-lg" style={{ color: currentEnemy.color }}>
                                {currentEnemy.name}
                            </div>
                            <div className="text-slate-400 text-xs text-center mb-4">{currentEnemy.description}</div>

                            <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-500" />
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{
                                                width: `${(currentEnemy.health / currentEnemy.maxHealth) * 100}%`,
                                                background: `linear-gradient(to right, ${currentEnemy.color}, ${currentEnemy.color}88)`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-white text-sm font-bold">{currentEnemy.health}/{currentEnemy.maxHealth}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Powers Panel */}
            <div className="absolute bottom-6 left-6 bg-black/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-500/50 max-w-md">
                <h3 className="text-purple-300 font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Special Powers
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {powers.map(power => (
                        <button
                            key={power.id}
                            onClick={() => usePower(power.id)}
                            disabled={!power.unlocked || power.currentCooldown > 0 || isAttacking}
                            className={`p-4 rounded-xl border-2 transition-all ${power.unlocked && power.currentCooldown === 0
                                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 hover:scale-105 cursor-pointer'
                                    : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {power.unlocked ? power.icon : <Lock className="w-6 h-6" />}
                                <span className="text-white font-bold text-sm">{power.name}</span>
                            </div>
                            {power.unlocked ? (
                                power.currentCooldown > 0 ? (
                                    <div className="text-xs text-orange-400">Cooldown: {power.currentCooldown}s</div>
                                ) : (
                                    <div className="text-xs text-green-400">Ready!</div>
                                )
                            ) : (
                                <div className="text-xs text-slate-400">{power.requirement}</div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Battle Log */}
            <div className="absolute bottom-6 right-6 bg-black/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-cyan-500/50 max-w-md">
                <h3 className="text-cyan-300 font-bold mb-3 text-sm uppercase tracking-wider">Battle Log</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                    {battleLog.map((log, idx) => (
                        <p key={idx} className="text-white text-sm animate-fade-in">{log}</p>
                    ))}
                </div>
            </div>

            {/* Starfield */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(100)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            opacity: Math.random() * 0.7
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default AegisGame;
