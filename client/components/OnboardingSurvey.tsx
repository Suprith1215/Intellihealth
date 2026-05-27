
import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, ChevronRight, Check, Sparkles, TrendingUp, Shield, Heart } from 'lucide-react';
import { AddictionType, SurveyData, AssessmentResult } from '../types';
import { calculateDynamicRiskAssessment } from '../services/riskCalculator';
import { ADDICTION_OPTIONS, DYNAMIC_QUESTIONS, Question } from '../constants';
import { db } from '../services/databaseService';

interface OnboardingSurveyProps {
  onComplete: (data: SurveyData, result: AssessmentResult) => void;
}

const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1); // 1 = Select Type, 2 = Dynamic Questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [finalResult, setFinalResult] = useState<AssessmentResult | null>(null);

  const [selectedAddiction, setSelectedAddiction] = useState<AddictionType>(AddictionType.ALCOHOL);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Get the 10 questions for the selected type
  const activeQuestions = DYNAMIC_QUESTIONS[selectedAddiction];
  const selectedOption = ADDICTION_OPTIONS.find(opt => opt.value === selectedAddiction);

  const handleTypeSelect = (type: AddictionType) => {
    setSelectedAddiction(type);
    setStep(2);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswer = (value: any) => {
    const currentQ = activeQuestions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));

    setTimeout(() => {
      if (currentQuestionIndex < activeQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleSubmit({ ...answers, [currentQ.id]: value });
      }
    }, 300);
  };

  const handleSubmit = async (finalAnswers: Record<string, any>) => {
    setIsAnalyzing(true);

    const surveyData: SurveyData = {
      addictionType: selectedAddiction,
      answers: finalAnswers
    };

    db.saveSurvey(surveyData);

    setTimeout(() => {
      const result = calculateDynamicRiskAssessment({
        addictionType: selectedAddiction,
        answers: finalAnswers
      });

      db.saveAssessment(result);
      setFinalResult(result);
      setIsAnalyzing(false);
      setShowResult(true);
    }, 2500);
  };

  // --- RESULT SCREEN ---
  if (showResult && finalResult) {
    const getRiskColor = () => {
      switch (finalResult.riskLevel) {
        case 'Low Risk': return 'from-green-500 to-emerald-600';
        case 'Moderate Risk': return 'from-yellow-500 to-orange-500';
        case 'High Risk': return 'from-orange-500 to-red-500';
        case 'Critical': return 'from-red-500 to-rose-700';
        default: return 'from-purple-500 to-pink-500';
      }
    };

    const getRiskIcon = () => {
      switch (finalResult.riskLevel) {
        case 'Low Risk': return <Shield className="w-10 h-10" />;
        case 'Moderate Risk': return <AlertTriangle className="w-10 h-10" />;
        case 'High Risk': return <AlertTriangle className="w-10 h-10" />;
        case 'Critical': return <AlertTriangle className="w-10 h-10" />;
        default: return <Heart className="w-10 h-10" />;
      }
    };

    return (
      <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-500">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="text-6xl mb-2 animate-bounce">{selectedOption?.emoji}</div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Your Recovery Profile
          </h1>
          <p className="text-slate-400 text-lg">Based on your personalized responses for {selectedOption?.label}</p>
        </div>

        {/* Risk Score Circle */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-slate-800"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(finalResult.riskScore / 100) * 553} 553`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white">{Math.round(finalResult.riskScore)}</span>
              <span className="text-sm text-slate-400 uppercase tracking-wider">Risk Score</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Severity Card */}
          <div className={`bg-gradient-to-br ${getRiskColor()} p-[2px] rounded-2xl`}>
            <div className="bg-[#1a1429] p-6 rounded-2xl h-full">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${getRiskColor()} rounded-xl text-white`}>
                  {getRiskIcon()}
                </div>
              </div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Severity Level</p>
              <h2 className="text-2xl font-bold text-white mb-2">{finalResult.riskLevel}</h2>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getRiskColor()} transition-all duration-1000`}
                  style={{ width: `${finalResult.riskScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Relapse Probability */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] rounded-2xl">
            <div className="bg-[#1a1429] p-6 rounded-2xl h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                  <TrendingUp className="w-10 h-10" />
                </div>
              </div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Relapse Risk</p>
              <h2 className="text-2xl font-bold text-white mb-2">
                {(finalResult.predictedRelapseProb * 100).toFixed(0)}%
              </h2>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${finalResult.predictedRelapseProb * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recovery Stage */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-[2px] rounded-2xl">
            <div className="bg-[#1a1429] p-6 rounded-2xl h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl text-white">
                  <Sparkles className="w-10 h-10" />
                </div>
              </div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Recovery Stage</p>
              <h2 className="text-xl font-bold text-white mb-2">{finalResult.recoveryStage}</h2>
              <p className="text-xs text-slate-400">Your current phase in recovery journey</p>
            </div>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-[#1a1429] border border-white/5 p-6 rounded-2xl mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Key Risk Factors
          </h3>
          <div className="space-y-3">
            {finalResult.featureImportance.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">{feature.feature}</span>
                    <span className="text-sm text-purple-400 font-bold">{(feature.score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                      style={{ width: `${feature.score * 100}%`, transitionDelay: `${idx * 100}ms` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onComplete({ addictionType: selectedAddiction, answers }, finalResult)}
          className="w-full py-5 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-2xl font-bold text-white text-lg shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3 group hover:scale-[1.02] active:scale-[0.98]"
        >
          <Heart className="w-6 h-6 group-hover:animate-pulse" />
          Start Your Personalized Recovery Journey
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  // --- ANALYZING SCREEN ---
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-purple-900/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-pink-500 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-cyan-500 border-r-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Analyzing Your Responses...
        </h2>
        <p className="text-slate-400 text-lg mb-6">Our AI is processing {Object.keys(answers).length} data points</p>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  // --- STEP 1: SELECT ADDICTION TYPE ---
  if (step === 1) {
    return (
      <div className="relative max-w-5xl mx-auto p-8 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Decorative Grids and Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -top-[10%] left-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-4">
            What brings you here today?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Select the area you want to focus your recovery on. Your journey to wellness starts with this single step.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {ADDICTION_OPTIONS.map((opt, idx) => (
            <button
              key={opt.value}
              onClick={() => handleTypeSelect(opt.value)}
              className={`group relative p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:shadow-[0_8px_40px_0_rgba(168,85,247,0.25)] hover:border-white/20 hover:bg-white/10 transition-all duration-300 text-left overflow-hidden hover:-translate-y-1`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Animated glow on hover */}
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${opt.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700 rounded-3xl -z-10`}></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 drop-shadow-2xl">{opt.emoji}</div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {opt.label}
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed flex-grow">
                  Start your personalized assessment and get actionable health insights.
                </p>
                <div className="mt-8 flex items-center justify-between text-purple-400 group-hover:text-pink-400 transition-colors">
                  <span className="text-sm font-bold tracking-wide uppercase">Begin Survey</span>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all shadow-inner">
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- STEP 2: DYNAMIC QUESTIONS ---
  const currentQ = activeQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / activeQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#1a1429] to-[#0f0a1e] border border-white/10 rounded-3xl shadow-2xl p-10 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header with emoji */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{selectedOption?.emoji}</div>
          <div>
            <h3 className="text-sm text-slate-400 uppercase tracking-wider">Assessment for</h3>
            <h2 className="text-xl font-bold text-white">{selectedOption?.label}</h2>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400">{currentQuestionIndex + 1}/{activeQuestions.length}</div>
          <div className="text-xs text-slate-500 uppercase">Questions</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-2 uppercase tracking-wide">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-white mb-10 leading-relaxed">
        {currentQ.text}
      </h2>

      {/* Answer Options */}
      {currentQ.type === 'scale' && (
        <div className="bg-[#0f0a1e] p-8 rounded-2xl border border-white/5">
          <div className="text-center mb-6">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
              <span className="text-4xl font-bold text-white">Select a value</span>
            </div>
          </div>

          <div className="flex justify-between mb-4 text-sm text-slate-400 font-semibold px-2">
            <span>{currentQ.minLabel}</span>
            <span>{currentQ.maxLabel}</span>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {Array.from({ length: (currentQ.max || 10) - (currentQ.min || 1) + 1 }, (_, i) => i + (currentQ.min || 1)).map(val => (
              <button
                key={val}
                onClick={() => handleAnswer(val)}
                className="aspect-square p-4 bg-slate-800 hover:bg-gradient-to-br hover:from-pink-600 hover:to-purple-600 rounded-xl text-white font-bold text-lg transition-all hover:scale-110 active:scale-95 border-2 border-transparent hover:border-white/20 shadow-lg hover:shadow-purple-500/50"
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentQ.type === 'boolean' && (
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => handleAnswer(true)}
            className="group p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 hover:border-green-500 hover:from-green-500/20 hover:to-emerald-500/20 transition-all text-white font-bold flex flex-col items-center justify-center gap-4 hover:scale-105 active:scale-95"
          >
            <CheckCircle className="w-16 h-16 text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-xl">Yes</span>
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="group p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border-2 border-red-500/30 hover:border-red-500 hover:from-red-500/20 hover:to-rose-500/20 transition-all text-white font-bold flex flex-col items-center justify-center gap-4 hover:scale-105 active:scale-95"
          >
            <AlertTriangle className="w-16 h-16 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-xl">No</span>
          </button>
        </div>
      )}

      {currentQ.type === 'number' && (
        <div className="space-y-6">
          <input
            type="number"
            className="w-full p-6 bg-[#0f0a1e] border-2 border-white/10 focus:border-purple-500 rounded-2xl text-white text-3xl font-bold text-center outline-none transition-all placeholder-slate-600"
            placeholder="Enter number..."
            id="numberInput"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const el = document.getElementById('numberInput') as HTMLInputElement;
                if (el.value) handleAnswer(parseInt(el.value));
              }
            }}
          />
          <button
            onClick={() => {
              const el = document.getElementById('numberInput') as HTMLInputElement;
              if (el.value) handleAnswer(parseInt(el.value));
            }}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/50"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingSurvey;
