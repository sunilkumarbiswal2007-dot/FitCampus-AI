import React, { useState } from 'react';
import {
  Zap,
  Flame,
  Award,
  Moon,
  Sun,
  Menu,
  X,
  User,
  LogOut,
  Footprints,
  Sparkles,
  Trophy,
  LayoutDashboard,
  Gift,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  student: StudentProfile | null;
  onOpenAuth: (initialTab: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenRewards: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  student,
  onOpenAuth,
  onLogout,
  onOpenRewards,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'steps', label: 'Step Counters (Auto & Manual)', icon: Footprints },
    { id: 'ai-coach', label: 'AI Coach', icon: Sparkles },
    { id: 'challenges', label: 'Challenges', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ...(student ? [{ id: 'profile', label: 'My Profile', icon: User }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <div
            onClick={() => onNavigate(student ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight font-display bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  FITCAMPUS
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider -mt-1 hidden sm:block">
                CAMPUS FITNESS PLATFORM
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            {student ? (
              <div className="flex items-center gap-3">
                {/* Streak Badge */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold"
                  title="Consecutive Day Active Streak"
                >
                  <Flame className="w-4 h-4 fill-orange-400 animate-pulse" />
                  <span>{student.streakDays}d Streak</span>
                </div>

                {/* Campus Points */}
                <button
                  onClick={onOpenRewards}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                  title="Redeem Campus Points"
                >
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>{student.campusPoints.toLocaleString()} Pts</span>
                </button>

                {/* Profile Pill */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-slate-950">
                      {student.photoUrl ? (
                        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                      {student.name}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-xs space-y-3 z-50">
                      <div className="pb-2 border-b border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-200 text-sm truncate">{student.name}</div>
                          <div className="text-slate-400 text-[11px] truncate">{student.studentRollNo || student.email}</div>
                          <div className="text-emerald-400 font-medium text-[11px] truncate">{student.college}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div className="bg-slate-950/60 p-2 rounded-xl text-center">
                          <span className="text-slate-500 text-[10px] block">BMI</span>
                          <span className="font-bold text-emerald-400">{student.bmi}</span>
                        </div>
                        <div className="bg-slate-950/60 p-2 rounded-xl text-center">
                          <span className="text-slate-500 text-[10px] block">Step Target</span>
                          <span className="font-bold">{student.dailyStepGoal.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 flex items-center justify-center gap-2 font-bold transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>View Athletic Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full py-2 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 hover:bg-rose-500/25 flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {student ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-slate-300">{student.streakDays} Day Streak</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <Gift className="w-3.5 h-3.5" />
                    <span>{student.campusPoints} Pts</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500/15 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 font-semibold text-xs"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
