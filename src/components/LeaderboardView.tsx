import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Search,
  School,
  Building,
  Award,
  Crown,
  Medal,
  ChevronRight,
  TrendingUp,
  User,
  ShieldCheck,
  Target,
  Sparkles,
  Lock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { LeaderboardEntry, StudentProfile } from '../types';

interface LeaderboardViewProps {
  currentStudentId: string;
  userPhotoUrl?: string;
  student?: StudentProfile | null;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentStudentId,
  userPhotoUrl,
  student,
}) => {
  // Default to 'my_standing_only' as requested: "only shows only not other person only who login"
  const [displayScope, setDisplayScope] = useState<'my_standing_only' | 'all_campus'>('my_standing_only');
  const [filterTab, setFilterTab] = useState<'overall' | 'hostels' | 'departments'>('overall');
  const [searchQuery, setSearchQuery] = useState('');

  const fullLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      id: 'student-3',
      name: 'Rohan Deshmukh',
      college: 'State Engineering University',
      department: 'Mechanical',
      hostel: 'Ramanujan Bhavan',
      steps: 14820,
      streak: 21,
      points: 3100,
      badge: 'Campus Legend',
    },
    {
      rank: 2,
      id: 'student-2',
      name: 'Priya Sharma',
      college: 'National Tech Institute',
      department: 'Biotechnology',
      hostel: 'Sarojini Hall',
      steps: 12450,
      streak: 14,
      points: 2180,
      badge: 'Sprint Queen',
    },
    {
      rank: 3,
      id: 'student-4',
      name: 'Ananya Verma',
      college: 'Metro Science Campus',
      department: 'Electronics',
      hostel: 'Kalpana Chawla Hall',
      steps: 10980,
      streak: 11,
      points: 1890,
      badge: 'Trailblazer',
    },
    {
      rank: 4,
      id: 'student-1',
      name: student?.name || 'Aarav Patel (You)',
      college: student?.college || 'National Tech Institute',
      department: student?.department || 'Computer Science',
      hostel: student?.hostel || 'Bhabha Hostel Block C',
      steps: 7420,
      streak: student?.streakDays || 8,
      points: student?.campusPoints || 1450,
      badge: 'Pacer Pro',
    },
    {
      rank: 5,
      id: 'student-5',
      name: 'Vikram Sethi',
      college: 'National Tech Institute',
      department: 'Civil Eng',
      hostel: 'Bhabha Hostel Block A',
      steps: 6850,
      streak: 5,
      points: 1120,
      badge: 'Active Cadet',
    },
    {
      rank: 6,
      id: 'student-6',
      name: 'Devika Nair',
      college: 'Premier Institute of Tech',
      department: 'Data Science',
      hostel: 'Sarojini Hall',
      steps: 6200,
      streak: 4,
      points: 980,
      badge: 'Stride Scout',
    },
    {
      rank: 7,
      id: 'student-7',
      name: 'Karan Mehra',
      college: 'National Tech Institute',
      department: 'Mechanical',
      hostel: 'Ramanujan Bhavan',
      steps: 5900,
      streak: 3,
      points: 840,
      badge: 'Campus Pacer',
    },
  ];

  // Find the logged-in student's entry
  const myEntry =
    fullLeaderboard.find((item) => item.id === currentStudentId) || fullLeaderboard[3];

  // Filtered entries for public board
  const filtered = fullLeaderboard.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hostel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const topThree = filtered.slice(0, 3);
  const remaining = filtered.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER & SCOPE SELECTOR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Campus Athletic Standings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Leaderboard & Standing Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {displayScope === 'my_standing_only'
              ? 'Showing exclusively your personal standing and athletic statistics (other users hidden).'
              : 'Viewing all campus and inter-hostel student rankings.'}
          </p>
        </div>

        {/* Primary View Mode Switcher: "My Standing Only" vs "Campus All" */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setDisplayScope('my_standing_only')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                displayScope === 'my_standing_only'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Standing Only (Solo)</span>
            </button>
            <button
              onClick={() => setDisplayScope('all_campus')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                displayScope === 'all_campus'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Campus All (Public)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. MODE: MY STANDING ONLY (Strictly Logged-in User Only)     */}
      {/* ========================================================== */}
      {displayScope === 'my_standing_only' && (
        <div className="space-y-6">
          {/* Privacy & Exclusive Notice */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/25 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span>
                Personal Athletic Standing Active: <strong>Only your verified stats</strong> are shown.
              </span>
            </div>
            <button
              onClick={() => setDisplayScope('all_campus')}
              className="text-emerald-400 font-semibold hover:underline flex items-center gap-1 text-xs"
            >
              <span>View Full Campus Board</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Large Solo Standing Card */}
          <div className="rounded-3xl p-6 sm:p-10 glass-panel border border-emerald-500/30 relative overflow-hidden shadow-2xl">
            {/* Ambient backdrops */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: User Avatar & Standing Badge */}
              <div className="lg:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 shadow-xl overflow-hidden">
                    <div className="w-full h-full rounded-[22px] bg-slate-950 overflow-hidden flex items-center justify-center">
                      {userPhotoUrl || student?.photoUrl ? (
                        <img
                          src={userPhotoUrl || student?.photoUrl}
                          alt={myEntry.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-black text-emerald-400">
                          {myEntry.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg font-mono">
                    #{myEntry.rank} RANK
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                      {myEntry.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Authenticated
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {myEntry.college} • {myEntry.department}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium">
                    {myEntry.hostel}
                  </p>
                </div>
              </div>

              {/* Right: Key Personal Standing Stats */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Campus Standing
                  </span>
                  <div className="text-2xl font-black font-display text-emerald-400">
                    #{myEntry.rank}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Top 8% in College</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Today's Steps
                  </span>
                  <div className="text-2xl font-black font-display text-white">
                    {myEntry.steps.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Goal: 10,000 steps</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Active Streak
                  </span>
                  <div className="text-2xl font-black font-display text-orange-400 flex items-center gap-1">
                    <Flame className="w-5 h-5 fill-orange-400" />
                    <span>{myEntry.streak}d</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Unbroken momentum</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Campus Points
                  </span>
                  <div className="text-2xl font-black font-display text-cyan-400">
                    {myEntry.points.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Available for perks</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Athletic Badge
                  </span>
                  <div className="text-sm font-bold text-white font-display">
                    {myEntry.badge}
                  </div>
                  <span className="text-[10px] text-emerald-400 block">Verified Tier</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Hostel Rank
                  </span>
                  <div className="text-2xl font-black font-display text-purple-400">
                    #1
                  </div>
                  <span className="text-[10px] text-slate-400 block">In {myEntry.hostel}</span>
                </div>
              </div>
            </div>

            {/* Gap to Top 3 Milestone Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Next Milestone: Reach Top 3 Podium (10,980 steps)</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  3,560 steps remaining
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                  style={{ width: `${Math.min(100, (myEntry.steps / 10980) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. MODE: FULL CAMPUS STANDINGS (Public Board)             */}
      {/* ========================================================== */}
      {displayScope === 'all_campus' && (
        <div className="space-y-6">
          {/* Tab filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by student name, hostel, or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800">
              <button
                onClick={() => setFilterTab('overall')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'overall'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Students
              </button>
              <button
                onClick={() => setFilterTab('hostels')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'hostels'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hostels
              </button>
              <button
                onClick={() => setFilterTab('departments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'departments'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Departments
              </button>
            </div>
          </div>

          {/* Top 3 Podium */}
          {topThree.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
              {/* #2 Rank (Silver) */}
              <div className="order-2 md:order-1 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-extrabold text-xs flex items-center justify-center absolute -top-3 shadow-lg">
                  #2
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 p-1 mb-3">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-lg font-bold text-slate-200">
                    {topThree[1].name.charAt(0)}
                  </div>
                </div>
                <h3 className="font-bold text-white text-base">{topThree[1].name}</h3>
                <p className="text-xs text-slate-400">{topThree[1].hostel}</p>
                <div className="my-3 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
                  {topThree[1].badge}
                </div>
                <div className="text-xl font-extrabold font-display text-white">
                  {topThree[1].steps.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">steps</span>
                </div>
                <div className="text-xs text-orange-400 font-bold flex items-center gap-1 mt-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{topThree[1].streak}d Streak</span>
                </div>
              </div>

              {/* #1 Rank (Gold - Center) */}
              <div className="order-1 md:order-2 p-8 rounded-3xl glass-panel border border-amber-500/40 shadow-2xl shadow-amber-500/10 flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform md:-translate-y-4">
                <Crown className="w-8 h-8 text-amber-400 mb-1" />
                <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center absolute -top-4 shadow-xl">
                  #1
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 p-1 mb-3">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-2xl font-black text-amber-400">
                    {topThree[0].name.charAt(0)}
                  </div>
                </div>
                <h3 className="font-black text-white text-lg">{topThree[0].name}</h3>
                <p className="text-xs text-slate-400">{topThree[0].hostel}</p>
                <div className="my-3 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  👑 {topThree[0].badge}
                </div>
                <div className="text-2xl font-black font-display text-amber-400">
                  {topThree[0].steps.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">steps</span>
                </div>
                <div className="text-xs text-orange-400 font-bold flex items-center gap-1 mt-1">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  <span>{topThree[0].streak}d Streak • {topThree[0].points} Pts</span>
                </div>
              </div>

              {/* #3 Rank (Bronze) */}
              <div className="order-3 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center absolute -top-3 shadow-lg">
                  #3
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 p-1 mb-3">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-lg font-bold text-amber-500">
                    {topThree[2].name.charAt(0)}
                  </div>
                </div>
                <h3 className="font-bold text-white text-base">{topThree[2].name}</h3>
                <p className="text-xs text-slate-400">{topThree[2].hostel}</p>
                <div className="my-3 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
                  {topThree[2].badge}
                </div>
                <div className="text-xl font-extrabold font-display text-white">
                  {topThree[2].steps.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400">steps</span>
                </div>
                <div className="text-xs text-orange-400 font-bold flex items-center gap-1 mt-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{topThree[2].streak}d Streak</span>
                </div>
              </div>
            </div>
          )}

          {/* Remaining Rankings Table */}
          <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 text-xs font-mono font-semibold uppercase text-slate-400">
              Rankings ({filtered.length} Athletes)
            </div>
            <div className="divide-y divide-slate-800/80">
              {remaining.map((item) => {
                const isUser = item.id === currentStudentId;
                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                      isUser
                        ? 'bg-emerald-500/10 border-l-4 border-emerald-400'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="font-bold text-slate-400 text-sm w-6 text-center">
                        #{item.rank}
                      </span>
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {isUser && (userPhotoUrl || student?.photoUrl) ? (
                          <img
                            src={userPhotoUrl || student?.photoUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm">{item.name}</span>
                          {isUser && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{item.department}</span>
                          <span>•</span>
                          <span>{item.hostel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="font-bold font-display text-white text-sm">
                          {item.steps.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">Steps</div>
                      </div>

                      <div className="hidden sm:block">
                        <div className="font-bold text-orange-400 text-xs flex items-center gap-1 justify-end">
                          <Flame className="w-3.5 h-3.5 fill-orange-400" />
                          <span>{item.streak}d</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Streak</div>
                      </div>

                      <div className="hidden sm:block">
                        <div className="font-bold text-emerald-400 text-xs">
                          {item.points.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">Points</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
