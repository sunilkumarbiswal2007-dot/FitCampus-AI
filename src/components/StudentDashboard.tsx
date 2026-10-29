import React, { useState, useEffect } from 'react';
import {
  Flame,
  Footprints,
  Droplet,
  Activity,
  Compass,
  Sparkles,
  Plus,
  RefreshCw,
  Send,
  MessageSquare,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Heart,
  Calendar,
  CheckCircle2,
  Share2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import confetti from 'canvas-confetti';
import { StudentProfile, DailyFitnessData, AIRecommendation } from '../types';
import { SocialShareModal } from './SocialShareModal';
import { CampusFeedSection } from './CampusFeedSection';

interface StudentDashboardProps {
  student: StudentProfile;
  fitnessData: DailyFitnessData;
  onUpdateSteps: (newSteps: number, method: string) => void;
  onLogWater: (amountMl: number) => void;
  onNavigate: (view: string) => void;
  isDarkMode: boolean;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  fitnessData,
  onUpdateSteps,
  onLogWater,
  onNavigate,
  isDarkMode,
}) => {
  // Determine dynamic greeting based on time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  // AI Recommendation State
  const [recommendation, setRecommendation] = useState<AIRecommendation>({
    headline: 'Prime Evening Campus Stride',
    tip: 'Walk for 20 minutes in the evening and drink two more glasses of water.',
    actionableHabit: 'Take the external library staircase instead of the elevator before study hours.',
    recoveryFocus: 'Dorm posture reset: 3 sets of 30-second doorway chest stretches.',
    hydrationAdvice: 'Drink 300ml right now to avoid lecture drowsiness.',
    motivationQuote: 'Small campus steps turn into lifelong athletic endurance.',
  });
  const [loadingAi, setLoadingAi] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // AI Coach Chat Drawer State
  const [coachChatOpen, setCoachChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hey ${student.name.split(' ')[0]}! I'm your FitCampus AI Coach. How are classes and training feeling today? Need a dorm workout, hydration cue, or study-break walk tip?`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch AI Recommendation
  const fetchAiRecommendation = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/daily-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          steps: fitnessData.steps,
          stepGoal: student.dailyStepGoal,
          waterMl: fitnessData.waterIntake,
          activeMinutes: fitnessData.activeMinutes,
          context: `${student.college}, ${student.department}, staying in ${student.hostel}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendation(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI recommendation:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiRecommendation();
  }, [student.id]);

  // Send message to AI Coach
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          studentContext: {
            name: student.name,
            college: student.college,
            steps: fitnessData.steps,
            waterIntake: fitnessData.waterIntake,
            streakDays: student.streakDays,
            hostel: student.hostel,
          },
        }),
      });

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'Keep moving! Every step on campus brings you closer to peak fitness.',
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Great effort today! Take a quick 5-minute hydration stretch and stay consistent.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Mock weekly activity comparison data for Recharts
  const weeklyTrendData = [
    { day: 'Mon', steps: 8400, target: 10000, calories: 480 },
    { day: 'Tue', steps: 10200, target: 10000, calories: 590 },
    { day: 'Wed', steps: 7100, target: 10000, calories: 410 },
    { day: 'Thu', steps: 9600, target: 10000, calories: 540 },
    { day: 'Fri', steps: 11400, target: 10000, calories: 650 },
    { day: 'Sat', steps: 12800, target: 10000, calories: 720 },
    { day: 'Today', steps: fitnessData.steps, target: 10000, calories: fitnessData.caloriesBurned },
  ];

  // Quick water logging handler
  const handleQuickWater = (amount: number) => {
    onLogWater(amount);
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#06b6d4', '#38bdf8', '#0284c7'],
    });
  };

  const stepPercent = Math.min(100, Math.round((fitnessData.steps / student.dailyStepGoal) * 100));
  const waterPercent = Math.min(100, Math.round((fitnessData.waterIntake / student.dailyWaterGoal) * 100));
  const activePercent = Math.min(100, Math.round((fitnessData.activeMinutes / 60) * 100));
  const caloriePercent = Math.min(100, Math.round((fitnessData.caloriesBurned / 600) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. WELCOME CARD */}
      <div className="rounded-3xl p-6 sm:p-8 glass-panel border border-slate-800 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Student Photo Avatar */}
            <div
              onClick={() => onNavigate('profile')}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-0.5 bg-gradient-to-tr from-emerald-400 to-cyan-400 shadow-lg cursor-pointer group flex-shrink-0"
              title="Click to view athletic profile & snap photo"
            >
              <div className="w-full h-full rounded-[14px] bg-slate-950 overflow-hidden flex items-center justify-center">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-emerald-400 font-bold text-xl">
                    {student.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                <span className="text-[10px] font-bold">✓</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Campus Active Status: Live</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                {greeting}, {student.name.split(' ')[0]} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {student.college} • <span className="text-emerald-400 font-medium">{student.department}</span> • {student.hostel}
              </p>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5 fill-orange-400 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Streak</span>
                <span className="text-base font-extrabold text-white">{student.streakDays} Days 🔥</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Campus Points</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {student.campusPoints.toLocaleString()} Pts
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('steps')}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Footprints className="w-4 h-4" />
              <span>Step Counters</span>
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="px-4 py-3.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              title="Share achievement to Campus Social Feed or Messaging"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Milestone</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S PROGRESS CARDS & RADIAL RINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Multi-Ring Activity Circle (Apple Fitness / Whoop style) */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 glass-panel border border-slate-800 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800/80">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              Daily Progress Rings
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              {stepPercent >= 100 ? 'Goal Completed 🎉' : `${stepPercent}% Complete`}
            </span>
          </div>

          <div className="relative w-64 h-64 my-6 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Outer Ring: Steps (Emerald) */}
              <circle cx="60" cy="60" r="50" strokeWidth="6" fill="transparent" className="stroke-slate-800/80" />
              <circle
                cx="60"
                cy="60"
                r="50"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * stepPercent) / 100}
                strokeLinecap="round"
                className="stroke-emerald-400 transition-all duration-700"
              />

              {/* Middle Ring: Active Minutes (Cyan) */}
              <circle cx="60" cy="60" r="40" strokeWidth="6" fill="transparent" className="stroke-slate-800/80" />
              <circle
                cx="60"
                cy="60"
                r="40"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="251"
                strokeDashoffset={251 - (251 * activePercent) / 100}
                strokeLinecap="round"
                className="stroke-cyan-400 transition-all duration-700"
              />

              {/* Inner Ring: Water Intake (Indigo) */}
              <circle cx="60" cy="60" r="30" strokeWidth="6" fill="transparent" className="stroke-slate-800/80" />
              <circle
                cx="60"
                cy="60"
                r="30"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="188"
                strokeDashoffset={188 - (188 * waterPercent) / 100}
                strokeLinecap="round"
                className="stroke-indigo-400 transition-all duration-700"
              />
            </svg>

            {/* Central summary inside rings */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Steps</span>
              <span className="text-2xl font-black font-display text-white">
                {fitnessData.steps.toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                / {student.dailyStepGoal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Ring Legends */}
          <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-center">
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Steps</span>
              </div>
              <div className="text-xs font-bold text-white">{stepPercent}%</div>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-cyan-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Workout</span>
              </div>
              <div className="text-xs font-bold text-white">{activePercent}%</div>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-indigo-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Water</span>
              </div>
              <div className="text-xs font-bold text-white">{waterPercent}%</div>
            </div>
          </div>
        </div>

        {/* 5 Today's Progress Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Card 1: Daily Steps */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Daily Steps</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Footprints className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {fitnessData.steps.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">Goal: {student.dailyStepGoal.toLocaleString()}</div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${stepPercent}%` }} />
            </div>
          </div>

          {/* Card 2: Active Minutes */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Minutes</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {fitnessData.activeMinutes} <span className="text-sm font-normal text-slate-400">min</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Goal: 60 min</div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${activePercent}%` }} />
            </div>
          </div>

          {/* Card 3: Water Intake */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Water Intake</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {(fitnessData.waterIntake / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-400">L</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Goal: {(student.dailyWaterGoal / 1000).toFixed(1)} L</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleQuickWater(250)}
                className="w-full py-1.5 px-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" /> 250ml
              </button>
            </div>
          </div>

          {/* Card 4: Calories Burned */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Calories Burned</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {fitnessData.caloriesBurned} <span className="text-sm font-normal text-slate-400">kcal</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Target: ~600 kcal</div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-400 h-full rounded-full" style={{ width: `${caloriePercent}%` }} />
            </div>
          </div>

          {/* Card 5: Distance Walked */}
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Distance Walked</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {fitnessData.distanceKm} <span className="text-sm font-normal text-slate-400">km</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Equivalent to ~{Math.round(fitnessData.distanceKm / 0.4)} laps of campus sports ground
              </div>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Great campus mobility pace today</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI RECOMMENDATION SECTION (Gemini API) */}
      <div className="rounded-3xl p-6 sm:p-8 glass-panel border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                  Today's AI Recommendation
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized fitness, posture, and hydration guidance for your campus schedule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAiRecommendation}
              disabled={loadingAi}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>{loadingAi ? 'Analyzing...' : 'Refresh AI Plan'}</span>
            </button>

            <button
              onClick={() => setCoachChatOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Coach</span>
            </button>
          </div>
        </div>

        {/* AI Content Grid */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wide font-mono">
              {recommendation.headline}
            </div>
            <div className="text-lg sm:text-xl font-bold font-display text-white leading-relaxed">
              "{recommendation.tip}"
            </div>
            <p className="text-xs text-slate-400 italic">
              "{recommendation.motivationQuote}"
            </p>
          </div>

          <div className="md:col-span-4 space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Campus Habit</span>
              <span className="text-slate-200 font-medium">{recommendation.actionableHabit}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Dorm Mobility</span>
              <span className="text-slate-200 font-medium">{recommendation.recoveryFocus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3.5 MY PERSONAL LEADERBOARD STANDING (LOGGED-IN USER ONLY) */}
      <div className="rounded-3xl p-6 sm:p-8 glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold font-display text-white">
              My Personal Leaderboard Standing
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Personal Solo View
            </span>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Showing only your account • Other athletes hidden</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Your Campus Rank</span>
            <span className="text-2xl font-black font-display text-emerald-400">#4 Overall</span>
            <span className="text-[10px] text-slate-500 block">Top 8% in College</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Hostel Rank</span>
            <span className="text-2xl font-black font-display text-cyan-400">#1 in {student.hostel.split(' ')[0]}</span>
            <span className="text-[10px] text-slate-500 block">Dorm step leader</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Streak Standings</span>
            <span className="text-2xl font-black font-display text-orange-400">{student.streakDays} Days 🔥</span>
            <span className="text-[10px] text-slate-500 block">Unbroken consistency</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Campus Points</span>
            <span className="text-2xl font-black font-display text-purple-400">{student.campusPoints.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">Earned from steps</span>
          </div>
        </div>
      </div>

      {/* 4. CHARTS: HOURLY STEPS & 7-DAY TREND (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Step Distribution */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold font-display text-white">Today's Hourly Steps</h3>
              <p className="text-xs text-slate-400">Activity cadence during campus lectures & meals</p>
            </div>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fitnessData.hourlySteps} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                />
                <Bar dataKey="steps" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Trend Area Chart */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold font-display text-white">7-Day Consistency Curve</h3>
              <p className="text-xs text-slate-400">Tracking streak adherence against 10k target</p>
            </div>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area type="monotone" dataKey="steps" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorSteps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. CAMPUS SOCIAL ACHIEVEMENTS FEED */}
      <CampusFeedSection
        currentStudent={student}
        onOpenShareModal={() => setShareModalOpen(true)}
      />

      {/* 6. INTERACTIVE AI COACH CHAT DRAWER */}
      {coachChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 flex flex-col p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 font-bold">
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">FitCampus AI Coach</h3>
                  <p className="text-[10px] text-emerald-400">Gemini 3.8 Flash • Online</p>
                </div>
              </div>
              <button
                onClick={() => setCoachChatOpen(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none leading-relaxed'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>AI Coach thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompt suggestions */}
            <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400">
              <button
                onClick={() => setChatInput('How do I stay active with 6 hours of lectures today?')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white whitespace-nowrap"
              >
                📚 6h Lecture Plan
              </button>
              <button
                onClick={() => setChatInput('Best dorm stretch for lower back pain after studying')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-white whitespace-nowrap"
              >
                🧘 Dorm Stretches
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask your coach anything about campus health..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. SOCIAL SHARE MODAL */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        student={student}
        fitnessData={fitnessData}
      />
    </div>
  );
};
