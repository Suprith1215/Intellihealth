import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Calendar, Smile, Frown, Meh } from 'lucide-react';

interface JournalEntry {
    id: string;
    date: string;
    time: string;
    content: string;
    mood: 'positive' | 'neutral' | 'negative';
}

interface JournalTrackerProps {
    onEntriesChange: (count: number) => void;
}

const JournalTracker: React.FC<JournalTrackerProps> = ({ onEntriesChange }) => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [newMood, setNewMood] = useState<'positive' | 'neutral' | 'negative'>('neutral');

    const addEntry = () => {
        if (newContent.trim()) {
            const now = new Date();
            const entry: JournalEntry = {
                id: Date.now().toString(),
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                content: newContent,
                mood: newMood
            };

            const updatedEntries = [entry, ...entries];
            setEntries(updatedEntries);
            onEntriesChange(updatedEntries.length);

            setNewContent('');
            setNewMood('neutral');
            setShowNewEntry(false);

            // Voice feedback
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance('Great job! Journal entry saved.');
                utterance.rate = 1.1;
                utterance.pitch = 1.2;
                speechSynthesis.speak(utterance);
            }
        }
    };

    const deleteEntry = (id: string) => {
        const updatedEntries = entries.filter(e => e.id !== id);
        setEntries(updatedEntries);
        onEntriesChange(updatedEntries.length);
    };

    const getMoodIcon = (mood: 'positive' | 'neutral' | 'negative') => {
        switch (mood) {
            case 'positive': return <Smile className="w-5 h-5 text-green-400" />;
            case 'negative': return <Frown className="w-5 h-5 text-red-400" />;
            default: return <Meh className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getMoodColor = (mood: 'positive' | 'neutral' | 'negative') => {
        switch (mood) {
            case 'positive': return 'border-green-500/30 bg-green-500/10';
            case 'negative': return 'border-red-500/30 bg-red-500/10';
            default: return 'border-yellow-500/30 bg-yellow-500/10';
        }
    };

    return (
        <div className="bg-[#211246] rounded-[2.5rem] p-10 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-black text-white">Recovery Journal</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 px-4 py-2 rounded-xl border border-purple-500/30">
                        <span className="text-purple-300 text-sm font-bold">{entries.length} Entries</span>
                    </div>
                    <button
                        onClick={() => setShowNewEntry(!showNewEntry)}
                        className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* New Entry Form */}
            {showNewEntry && (
                <div className="bg-black/30 rounded-2xl p-6 border border-purple-500/30 mb-6 animate-slide-up">
                    <h4 className="text-white font-bold mb-4">New Entry</h4>

                    {/* Mood Selector */}
                    <div className="mb-4">
                        <label className="text-sm text-slate-400 mb-2 block">How are you feeling?</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setNewMood('positive')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${newMood === 'positive'
                                        ? 'border-green-500 bg-green-500/20'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <Smile className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <div className="text-white text-sm font-bold">Positive</div>
                            </button>
                            <button
                                onClick={() => setNewMood('neutral')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${newMood === 'neutral'
                                        ? 'border-yellow-500 bg-yellow-500/20'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <Meh className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <div className="text-white text-sm font-bold">Neutral</div>
                            </button>
                            <button
                                onClick={() => setNewMood('negative')}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${newMood === 'negative'
                                        ? 'border-red-500 bg-red-500/20'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <Frown className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                <div className="text-white text-sm font-bold">Struggling</div>
                            </button>
                        </div>
                    </div>

                    {/* Text Area */}
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Write about your day, your feelings, your progress..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
                    />

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={addEntry}
                            disabled={!newContent.trim()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Save Entry
                        </button>
                        <button
                            onClick={() => {
                                setShowNewEntry(false);
                                setNewContent('');
                                setNewMood('neutral');
                            }}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Entries List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {entries.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">No journal entries yet</p>
                        <p className="text-slate-500 text-xs mt-2">Start writing to unlock Focus Strike in the game!</p>
                    </div>
                ) : (
                    entries.map(entry => (
                        <div
                            key={entry.id}
                            className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${getMoodColor(entry.mood)}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {getMoodIcon(entry.mood)}
                                    <div>
                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            <Calendar className="w-4 h-4 text-purple-400" />
                                            {entry.date}
                                        </div>
                                        <div className="text-slate-400 text-xs">{entry.time}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteEntry(entry.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                {entry.content}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            {entries.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30 text-center">
                        <Smile className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-black text-white">
                            {entries.filter(e => e.mood === 'positive').length}
                        </div>
                        <div className="text-xs text-green-300">Positive</div>
                    </div>
                    <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30 text-center">
                        <Meh className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <div className="text-2xl font-black text-white">
                            {entries.filter(e => e.mood === 'neutral').length}
                        </div>
                        <div className="text-xs text-yellow-300">Neutral</div>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 text-center">
                        <Frown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                        <div className="text-2xl font-black text-white">
                            {entries.filter(e => e.mood === 'negative').length}
                        </div>
                        <div className="text-xs text-red-300">Struggling</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JournalTracker;
