import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  RefreshCw,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Challenge } from '../types';

interface ChallengesViewProps {
  challenges: Challenge[];
  onClaimChallenge: (id: string) => void;
  campusPoints: number;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  onClaimChallenge,
  campusPoints,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [mood, setMood] = useState('Study Break Energizer');
  const [intensity, setIntensity] = useState('moderate');
  const [location, setLocation] = useState('campus paths & quad');

  const [customChallenges, setCustomChallenges] = useState<Challenge[]>(challenges);

  const categories = ['all', 'Daily Step', 'Hydration', 'Active Minutes', 'Tournament'];

  const filteredChallenges =
    activeCategory === 'all'
      ? customChallenges
      : customChallenges.filter((c) => c.category.toLowerCase() === activeCategory.toLowerCase());

  const handleClaim = (id: string, reward: number) => {
    onClaimChallenge(id);
    setCustomChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: true } : c))
    );
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleGenerateAiChallenge = async () => {
    setGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, intensity, location }),
      });
      const data = await res.json();

      const newChallenge: Challenge = {
        id: `ai-${Date.now()}`,
        title: data.title || 'AI Campus Stair Blitz',
        description: data.description || 'Climb 3 flights of academic building stairs twice today.',
        category: data.category || 'AI Quest',
        target: data.target || 15,
        unit: data.unit || 'mins',
        progress: 0,
        rewardPoints: data.rewardPoints || 150,
        participants: 1,
        daysLeft: 1,
        completed: false,
        aiTag: 'Gemini Custom',
      };

      setCustomChallenges((prev) => [newChallenge, ...prev]);
      setAiModalOpen(false);
      confetti({
        particleCount: 40,
        spread: 50,
      });
    } catch (err) {
      console.error('Error generating AI challenge:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Campus Quests & Milestones</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Fitness Challenges</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Conquer daily quests, climb campus ranks, and unlock exclusive college cafeteria & gym perks.
          </p>
        </div>

        <button
          onClick={() => setAiModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Generate Custom AI Challenge</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Quests' : cat}
          </button>
        ))}
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map((challenge) => {
          const progressPercent = Math.min(
            100,
            Math.round((challenge.progress / challenge.target) * 100)
          );
          const isFinished = challenge.completed || progressPercent >= 100;

          return (
            <div
              key={challenge.id}
              className={`p-6 rounded-3xl glass-panel border transition-all flex flex-col justify-between ${
                isFinished ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-300">
                      {challenge.category}
                    </span>
                    {challenge.aiTag && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {challenge.aiTag}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    +{challenge.rewardPoints} Pts
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{challenge.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{challenge.description}</p>
              </div>

              <div className="pt-6 space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>
                      {challenge.progress.toLocaleString()} / {challenge.target.toLocaleString()}{' '}
                      {challenge.unit}
                    </span>
                    <span className="font-semibold text-white">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{challenge.participants} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{challenge.daysLeft}d left</span>
                  </div>
                </div>

                {/* Claim / Status Action Button */}
                {challenge.completed ? (
                  <div className="w-full py-2.5 rounded-xl bg-slate-900 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed & Claimed</span>
                  </div>
                ) : progressPercent >= 100 ? (
                  <button
                    onClick={() => handleClaim(challenge.id, challenge.rewardPoints)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Claim +{challenge.rewardPoints} Points</span>
                  </button>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-medium text-xs text-center">
                    In Progress • Walk on campus to complete
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Challenge Generator Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Gemini Custom Challenge</h3>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select your mood and campus location. Gemini AI will construct a tailored micro-workout or step quest.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Mood / Scenario</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="Study Break Energizer">Study Break Energizer (Exams/Lectures)</option>
                  <option value="Post-Mess Meal Digestion">Post-Mess Meal Digestion</option>
                  <option value="Hostel Room Night Workout">Hostel Room Night Workout</option>
                  <option value="High Energy Weekend Stride">High Energy Weekend Stride</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'moderate', 'intense'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setIntensity(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        intensity === lvl
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. library staircase, sports oval, hostel quad"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAiChallenge}
              disabled={generatingAi}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{generatingAi ? 'Generating Challenge...' : 'Create AI Challenge'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
