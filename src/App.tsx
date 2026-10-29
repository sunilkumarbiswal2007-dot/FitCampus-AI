/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { AutomaticStepCounter } from './components/AutomaticStepCounter';
import { LeaderboardView } from './components/LeaderboardView';
import { ChallengesView } from './components/ChallengesView';
import { UserProfileView } from './components/UserProfileView';
import { AuthModal } from './components/AuthModal';
import { RewardsModal } from './components/RewardsModal';
import { StudentProfile, DailyFitnessData, Challenge } from './types';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [rewardsModalOpen, setRewardsModalOpen] = useState<boolean>(false);

  // Student Profile State
  const [student, setStudent] = useState<StudentProfile | null>(null);

  // Daily Fitness Data
  const [fitnessData, setFitnessData] = useState<DailyFitnessData>({
    studentId: 'student-1',
    date: new Date().toISOString().split('T')[0],
    steps: 7420,
    activeMinutes: 48,
    waterIntake: 2000,
    caloriesBurned: 420,
    distanceKm: 5.4,
    hourlySteps: [
      { hour: '7 AM', steps: 350 },
      { hour: '9 AM', steps: 1200 },
      { hour: '11 AM', steps: 980 },
      { hour: '1 PM', steps: 1450 },
      { hour: '3 PM', steps: 890 },
      { hour: '5 PM', steps: 1650 },
      { hour: '7 PM', steps: 900 },
    ],
  });

  // Challenges State
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.body.className = 'bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.className = 'bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white';
      }
      return next;
    });
  };

  // Fetch initial student or fallback to demo
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/fitness/today?studentId=student-1');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) setStudent(data.profile);
          if (data.fitness) setFitnessData(data.fitness);
        }

        const challRes = await fetch('/api/challenges');
        if (challRes.ok) {
          const cData = await challRes.json();
          setChallenges(cData.challenges || []);
        }
      } catch (err) {
        console.error('Initial data fetch error:', err);
      }
    };
    fetchInitialData();
  }, []);

  // Update steps (live from sensor, Google Fit, Apple Health, or Simulator)
  const handleUpdateSteps = async (newSteps: number, method: string) => {
    setFitnessData((prev) => {
      const distanceKm = parseFloat(((newSteps * 0.76) / 1000).toFixed(2));
      const caloriesBurned = Math.round(newSteps * 0.045);
      const activeMinutes = Math.min(240, Math.round(newSteps / 110));
      return {
        ...prev,
        steps: newSteps,
        distanceKm,
        caloriesBurned,
        activeMinutes,
      };
    });

    try {
      await fetch('/api/fitness/update-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student?.id || 'student-1',
          steps: newSteps,
          method,
        }),
      });
    } catch (err) {
      console.error('Error syncing steps with backend:', err);
    }
  };

  // Log water intake
  const handleLogWater = async (amountMl: number) => {
    setFitnessData((prev) => ({
      ...prev,
      waterIntake: prev.waterIntake + amountMl,
    }));

    try {
      await fetch('/api/fitness/log-water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student?.id || 'student-1',
          amountMl,
        }),
      });
    } catch (err) {
      console.error('Error logging water with backend:', err);
    }
  };

  // Claim Challenge
  const handleClaimChallenge = async (id: string) => {
    try {
      const res = await fetch(`/api/challenges/${id}/claim`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (student) {
          setStudent({ ...student, campusPoints: data.newBalance || student.campusPoints + 150 });
        }
      }
    } catch (err) {
      console.error('Error claiming challenge:', err);
    }
  };

  // Redeem Campus Points in Store
  const handleRedeemReward = (cost: number) => {
    if (!student || student.campusPoints < cost) return false;
    setStudent({
      ...student,
      campusPoints: student.campusPoints - cost,
    });
    return true;
  };

  // Handle Login / Registration Success
  const handleLoginSuccess = (profile: StudentProfile) => {
    setStudent(profile);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setStudent(null);
    setCurrentView('landing');
  };

  const openAuth = (tab: 'login' | 'register') => {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        student={student}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
        onOpenRewards={() => setRewardsModalOpen(true)}
      />

      {/* Main Page View Switching */}
      <main className="transition-opacity duration-300">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => openAuth('register')}
            onExploreFeatures={() => {
              const feat = document.getElementById('features');
              feat?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenDemo={async () => {
              try {
                const res = await fetch('/api/auth/demo', { method: 'POST' });
                const data = await res.json();
                handleLoginSuccess(data.student);
              } catch {
                openAuth('login');
              }
            }}
            isDarkMode={isDarkMode}
          />
        )}

        {currentView === 'dashboard' && student && (
          <StudentDashboard
            student={student}
            fitnessData={fitnessData}
            onUpdateSteps={handleUpdateSteps}
            onLogWater={handleLogWater}
            onNavigate={(v) => setCurrentView(v)}
            isDarkMode={isDarkMode}
          />
        )}

        {(currentView === 'steps' || (currentView === 'dashboard' && !student)) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <AutomaticStepCounter
              initialSteps={fitnessData.steps}
              stepGoal={student?.dailyStepGoal || 10000}
              profile={student}
              onUpdateSteps={handleUpdateSteps}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {currentView === 'ai-coach' && student && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <StudentDashboard
              student={student}
              fitnessData={fitnessData}
              onUpdateSteps={handleUpdateSteps}
              onLogWater={handleLogWater}
              onNavigate={(v) => setCurrentView(v)}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {currentView === 'challenges' && (
          <ChallengesView
            challenges={challenges}
            onClaimChallenge={handleClaimChallenge}
            campusPoints={student?.campusPoints || 1450}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            currentStudentId={student?.id || 'student-1'}
            userPhotoUrl={student?.photoUrl}
            student={student}
          />
        )}

        {currentView === 'profile' && student && (
          <UserProfileView
            student={student}
            onUpdateProfile={(updated) => setStudent(updated)}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* Auth Modal (Login / Register with Biometrics) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
      />

      {/* Campus Rewards Modal */}
      <RewardsModal
        isOpen={rewardsModalOpen}
        onClose={() => setRewardsModalOpen(false)}
        campusPoints={student?.campusPoints || 0}
        onRedeem={handleRedeemReward}
      />
    </div>
  );
}
