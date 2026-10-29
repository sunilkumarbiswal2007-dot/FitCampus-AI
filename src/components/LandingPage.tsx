import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Trophy,
  Activity,
  Flame,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Compass,
  Check,
  Send,
  Droplet,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { FitnessCanvas3D } from './FitnessCanvas3D';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
  onOpenDemo: () => void;
  isDarkMode: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenDemo,
  isDarkMode,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('study-break');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', college: '', email: '', message: '' });

  const aiScenarioSuggestions: Record<string, { title: string; rec: string; badge: string }> = {
    'study-break': {
      title: '4-Hour Lecture & Exam Cram Session',
      rec: 'Stand up, do 20 campus quad stretches, take the exterior library staircase, and drink 350ml water to reset cerebral blood flow.',
      badge: 'Cognitive Reset',
    },
    'hostel-night': {
      title: 'Late Night Mess Food & Hostel Lethargy',
      rec: 'A 15-minute brisk quad walk burns ~90 kcal and enhances circadian melatonin release for deeper sleep.',
      badge: 'Metabolism Sync',
    },
    'rainy-day': {
      title: 'Monsoon / Stuck Inside Hostel Room',
      rec: 'Indoor bodyweight sprint: 3 sets of high knees, wall sits, and calf raises beside your study desk.',
      badge: 'Dorm Friendly',
    },
    'sports-sore': {
      title: 'Post-Inter-College Match Soreness',
      rec: 'Gentle 1,500 active recovery steps around the campus cricket oval plus cold water hydration with electrolytes.',
      badge: 'Athletic Recovery',
    },
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email) {
      setContactSubmitted(true);
      setTimeout(() => setContactSubmitted(false), 4000);
      setContactForm({ name: '', college: '', email: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 md:pt-14 overflow-hidden">
        {/* Subtle background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Next-Gen Campus Fitness Technology</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.1] text-slate-100">
                Turn Every Step{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Into Achievement
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Your personal AI fitness companion designed for students. Track campus steps in real time, build daily streaks, conquer hostel challenges, and stay physically energized through busy semesters.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-bold text-sm hover:scale-[1.02] shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenDemo}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Launch Student Demo</span>
                </button>
              </div>

              {/* Micro proof points */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Free for University Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>No Wearable Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Gemini AI Health Engine</span>
                </div>
              </div>
            </div>

            {/* Right: 3D Fitness Model & Floating Glass Cards */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="w-full max-w-[500px] h-[430px] rounded-3xl overflow-hidden relative border border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-2xl backdrop-blur-md">
                <FitnessCanvas3D interactive={true} className="w-full h-full" />

                {/* Floating Activity Card: Steps */}
                <div className="absolute top-4 left-4 p-3 rounded-2xl glass-panel text-xs space-y-1 shadow-lg animate-bounce duration-1000 hidden sm:block">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Live Pace: 115 bpm</span>
                  </div>
                  <div className="text-white font-bold text-sm">7,420 Steps Walked</div>
                </div>

                {/* Floating Activity Card: Streak */}
                <div className="absolute bottom-12 right-4 p-3 rounded-2xl glass-panel text-xs space-y-1 shadow-lg hidden sm:block">
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span>8-Day Campus Streak</span>
                  </div>
                  <div className="text-white font-bold text-sm">Top 5% in Hostel</div>
                </div>

                {/* Floating Activity Card: Hydration */}
                <div className="absolute top-8 right-4 p-2.5 rounded-2xl glass-panel text-xs flex items-center gap-2 shadow-lg hidden sm:flex">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Droplet className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Hydration</div>
                    <div className="text-xs font-bold text-slate-200">2.0L / 3.0L</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS COUNTER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 md:p-8 bg-slate-900/50 border border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold font-display bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              48,000+
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Active College Students</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold font-display bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              1.4 Billion
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Campus Steps Logged</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold font-display bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              350+
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Hostel & Dept Leagues</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold font-display bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              94.2%
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Daily Habit Retention</div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-semibold tracking-widest uppercase text-emerald-400">
            Engineered For Student Life
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-slate-100">
            Features Tailored For Busy Campuses
          </h2>
          <p className="text-sm text-slate-400">
            Say goodbye to complex gym apps designed for bodybuilders. FitCampus AI is built around lecture halls, library runs, and hostel camaraderie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl glass-panel glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-100">
              Triple-Sensor Auto Step Counting
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Count steps accurately with your mobile phone's built-in accelerometer, sync with Google Fit or Apple Health, or use the intelligent desktop walking simulator.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl glass-panel glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-100">
              Gemini AI Fitness & Habit Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Personalized micro-habits and recovery tips adapted to your actual day — from 6-hour lab sessions to exam stress management and canteen nutrition.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl glass-panel glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-100">
              Gamified Campus Economy
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn Campus Points for hitting 10k steps and maintaining active streaks. Redeem points for college gym passes, canteen vouchers, and athletic merchandise.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-3xl glass-panel glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-100">
              Inter-Hostel & Department Leaderboards
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compete with friends in your dorm block and academic branch. Bring sporting glory to your hostel in weekly collective step tournaments.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-3xl glass-panel glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-100">
              Smart Hydration & Brain Fog Sync
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One-tap quick hydration logging with automatic volume targets customized for your body weight and academic study hours.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-3xl glass-panel glass-card-hover space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-100">
              OLED Battery Saver & Dark Mode
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep the step pedometer counting in your pocket during morning campus walks with ultra-low battery consumption and True Black OLED optimization.
            </p>
          </div>
        </div>
      </section>

      {/* 4. AI RECOMMENDATIONS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 lg:p-12 glass-panel border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive AI Demo</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100">
                Experience Gemini AI Campus Coaching
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Test how FitCampus AI adapts to common student scenarios. Click any situation to preview instant AI wellness guidance:
              </p>

              {/* Scenario Pills */}
              <div className="flex flex-col gap-2 pt-2">
                {Object.entries(aiScenarioSuggestions).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedScenario(key)}
                    className={`text-left px-4 py-3 rounded-2xl border text-xs font-medium transition-all flex items-center justify-between ${
                      selectedScenario === key
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Output Card */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-700/80 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950">
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">FitCampus AI Intelligence</div>
                      <div className="text-[10px] text-emerald-400">Powered by Gemini 3.8 Flash</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Response
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="text-lg font-bold font-display text-white">
                    "{aiScenarioSuggestions[selectedScenario].rec}"
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                        Dorm Micro-Action
                      </span>
                      <span className="text-slate-300">Take 3 deep breaths and a 10-minute courtyard walk</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                        Campus Points Reward
                      </span>
                      <span className="text-emerald-400 font-bold">+50 Pts on completion</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Want custom suggestions for your campus routine?</span>
                  <button
                    onClick={onGetStarted}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
                  >
                    Try on Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CAMPUS CHALLENGES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-emerald-400">
              Campus Quests
            </span>
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-100">
              Active College Challenges
            </h2>
          </div>
          <button
            onClick={onOpenDemo}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
          >
            <span>View All Challenges in App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold">
                Daily Quest
              </span>
              <span className="text-xs font-bold text-emerald-400">+150 Pts</span>
            </div>
            <h3 className="text-base font-bold text-white">Hostel to Library 8,000 Step Dash</h3>
            <p className="text-xs text-slate-400">
              Walk or jog between academic blocks and hostels to hit 8,000 steps before sunset.
            </p>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>412 students joined</span>
                <span>1 day left</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-3/4 h-full bg-emerald-400 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-[11px] font-bold">
                Weekly Quest
              </span>
              <span className="text-xs font-bold text-emerald-400">+250 Pts</span>
            </div>
            <h3 className="text-base font-bold text-white">Hydration Hero: 7-Day 3L Streak</h3>
            <p className="text-xs text-slate-400">
              Drink 3,000ml of clean water daily to avoid lecture drowsiness and maintain mental clarity.
            </p>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>628 students joined</span>
                <span>3 days left</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-4/5 h-full bg-cyan-400 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 text-[11px] font-bold">
                Hostel Clash
              </span>
              <span className="text-xs font-bold text-emerald-400">+500 Pts</span>
            </div>
            <h3 className="text-base font-bold text-white">Weekend Inter-Hostel 25k Trek</h3>
            <p className="text-xs text-slate-400">
              Compete for the Hostel Trophy with total collective steps over Saturday and Sunday.
            </p>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>1,240 students joined</span>
                <span>Starts Sat</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="w-1/2 h-full bg-purple-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STUDENT SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-mono font-semibold tracking-widest uppercase text-emerald-400">
            Real Student Impact
          </span>
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-100">
            From Couch Potatoes to Campus Athletes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950">
                R
              </div>
              <div>
                <div className="text-sm font-bold text-white">Rohan Deshmukh</div>
                <div className="text-[11px] text-slate-400">Mechanical • 3rd Year</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Between 8-hour lab days and coding projects, I was barely walking 2,000 steps. FitCampus AI made it a game with our hostel mates. Now I hit 12k steps daily and my focus during exams is unmatched."
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <Flame className="w-4 h-4 fill-emerald-400" />
              <span>21-Day Active Streak • 3,100 Points</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-400 flex items-center justify-center font-bold text-slate-950">
                P
              </div>
              <div>
                <div className="text-sm font-bold text-white">Priya Sharma</div>
                <div className="text-[11px] text-slate-400">Biotechnology • 4th Year</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "The AI coach recommendations are scarily accurate. It knows when I have exam stress and gives me 10-minute micro-walks instead of overwhelming gym workouts. Lost 4 kgs this semester!"
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400 font-bold">
              <Award className="w-4 h-4" />
              <span>Hostel Step Champion • 14-Day Streak</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-400 flex items-center justify-center font-bold text-slate-950">
                A
              </div>
              <div>
                <div className="text-sm font-bold text-white">Ananya Verma</div>
                <div className="text-[11px] text-slate-400">Electronics • 2nd Year</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Redeemed my Campus Points for free smoothies at the college cafeteria and a gym pass! Getting fit has never been this rewarding or socially fun."
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-purple-400 font-bold">
              <Trophy className="w-4 h-4" />
              <span>#3 Campus Leaderboard</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & CAMPUS AMBASSADOR FORM */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-10 glass-panel border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-emerald-400">
              Get In Touch
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100">
              Bring FitCampus AI To Your College
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Want to launch inter-hostel leagues, register your sports council, or become a campus fitness ambassador? Drop us a note.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-bold text-white text-base">Message Received!</div>
              <p className="text-xs text-slate-300">
                Our Campus Operations Team will connect with you within 24 hours. Keep stepping!
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sen"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">College / University</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Institute of Engineering"
                    value={contactForm.college}
                    onChange={(e) => setContactForm({ ...contactForm, college: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student / Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message / Proposal</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your campus or ask a question..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Campus Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 pt-12 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base font-display text-white">FITCAMPUS AI</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} FitCampus AI. Built for student health, academic vitality, and daily momentum.
          </p>
        </div>
      </footer>
    </div>
  );
};
