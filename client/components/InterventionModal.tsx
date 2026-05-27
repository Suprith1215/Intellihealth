import React, { useState } from 'react';
import {
    X, Zap, Wind, Heart, Brain, Shield, Waves, Flame,
    CheckCircle, Clock, Target, TrendingDown, Sparkles
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface InterventionModalProps {
    type: 'urge' | 'calm';
    onClose: () => void;
}

const InterventionModal: React.FC<InterventionModalProps> = ({ type, onClose }) => {
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState(false);

    // SURVIVE URGE - 5-Minute Distraction Protocol
    const urgeSteps = [
        {
            title: "Acknowledge the Urge",
            icon: Flame,
            color: "from-orange-500 to-red-500",
            instruction: "Notice the craving without judgment. Say: 'This is just a temporary feeling.'",
            duration: 30,
            action: "I acknowledge this urge"
        },
        {
            title: "Delay & Distract",
            icon: Clock,
            color: "from-yellow-500 to-orange-500",
            instruction: "Wait 5 minutes. The urge will peak and pass. Do something else right now.",
            duration: 300,
            action: "Start 5-minute timer"
        },
        {
            title: "Call Your Support",
            icon: Heart,
            color: "from-pink-500 to-rose-500",
            instruction: "Text or call your sponsor, therapist, or support person immediately.",
            duration: 60,
            action: "Contact support now"
        },
        {
            title: "Change Your Environment",
            icon: Target,
            color: "from-cyan-500 to-blue-500",
            instruction: "Leave the location. Go for a walk. Get into a public space.",
            duration: 120,
            action: "Move to safe space"
        },
        {
            title: "Urge Surfing Complete",
            icon: CheckCircle,
            color: "from-green-500 to-emerald-500",
            instruction: "You did it! The urge has passed. You are stronger than the craving.",
            duration: 0,
            action: "Celebrate victory"
        }
    ];

    // CALM DOWN - Anxiety Reduction Protocol
    const calmSteps = [
        {
            title: "Deep Breathing",
            icon: Wind,
            color: "from-blue-500 to-cyan-500",
            instruction: "Breathe in for 4 counts, hold for 4, exhale for 6. Repeat 3 times.",
            duration: 60,
            action: "Start breathing"
        },
        {
            title: "5-4-3-2-1 Grounding",
            icon: Brain,
            color: "from-purple-500 to-indigo-500",
            instruction: "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.",
            duration: 90,
            action: "Begin grounding"
        },
        {
            title: "Progressive Muscle Relaxation",
            icon: Waves,
            color: "from-teal-500 to-cyan-500",
            instruction: "Tense and release each muscle group from toes to head.",
            duration: 120,
            action: "Start relaxation"
        },
        {
            title: "Positive Affirmation",
            icon: Sparkles,
            color: "from-pink-500 to-purple-500",
            instruction: "Repeat: 'I am safe. I am in control. This feeling will pass.'",
            duration: 30,
            action: "Say affirmation"
        },
        {
            title: "Calm Restored",
            icon: CheckCircle,
            color: "from-green-500 to-emerald-500",
            instruction: "Well done! Your nervous system is calming. You've regained control.",
            duration: 0,
            action: "Feel the peace"
        }
    ];

    const steps = type === 'urge' ? urgeSteps : calmSteps;
    const currentStepData = steps[currentStep];
    const StepIcon = currentStepData.icon;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            showToast(`Step ${currentStep + 2}/${steps.length}: ${steps[currentStep + 1].title}`, 'info');
        } else {
            setCompleted(true);
            showToast('Intervention completed successfully!', 'success');
            setTimeout(() => onClose(), 2000);
        }
    };

    const handleSkip = () => {
        showToast('Intervention cancelled', 'info');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="max-w-2xl w-full bg-[#1a1429] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className={`p-6 bg-gradient-to-r ${currentStepData.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                {type === 'urge' ? <Flame className="w-8 h-8 text-white" /> : <Wind className="w-8 h-8 text-white" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {type === 'urge' ? 'Survive the Urge' : 'Calm Down Protocol'}
                                </h2>
                                <p className="text-white/80 text-sm">
                                    {type === 'urge' ? 'Emergency Craving Management' : 'Anxiety Reduction Technique'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSkip}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 relative">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/80 transition-all duration-500"
                                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-white/80 mt-2 text-center">
                            Step {currentStep + 1} of {steps.length}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Step Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`p-6 bg-gradient-to-br ${currentStepData.color} rounded-2xl shadow-2xl`}>
                            <StepIcon className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-3xl font-bold text-white text-center mb-4">
                        {currentStepData.title}
                    </h3>

                    {/* Instruction */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                        <p className="text-lg text-slate-300 leading-relaxed text-center">
                            {currentStepData.instruction}
                        </p>
                    </div>

                    {/* Duration Indicator */}
                    {currentStepData.duration > 0 && (
                        <div className="flex items-center justify-center gap-2 mb-6 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                                Recommended: {currentStepData.duration < 60
                                    ? `${currentStepData.duration} seconds`
                                    : `${Math.floor(currentStepData.duration / 60)} minute${currentStepData.duration >= 120 ? 's' : ''}`
                                }
                            </span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleNext}
                        className={`w-full py-4 bg-gradient-to-r ${currentStepData.color} text-white font-bold text-lg rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3`}
                    >
                        {currentStep === steps.length - 1 ? (
                            <>
                                <CheckCircle className="w-6 h-6" />
                                Complete Intervention
                            </>
                        ) : (
                            <>
                                <Shield className="w-6 h-6" />
                                {currentStepData.action}
                            </>
                        )}
                    </button>

                    {/* Skip Option */}
                    {currentStep < steps.length - 1 && (
                        <button
                            onClick={handleNext}
                            className="w-full mt-3 py-2 text-slate-400 hover:text-white text-sm transition-colors"
                        >
                            Skip to next step →
                        </button>
                    )}
                </div>

                {/* Emergency Contact (for Urge only) */}
                {type === 'urge' && currentStep === 2 && (
                    <div className="px-8 pb-8">
                        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Heart className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-bold mb-1">Emergency Support</h4>
                                    <p className="text-sm text-slate-300 mb-3">
                                        If you're in crisis, call your emergency contact or crisis hotline immediately.
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">
                                            Call Sponsor
                                        </button>
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors">
                                            Crisis Hotline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterventionModal;
