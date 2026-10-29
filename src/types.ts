export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedAt: string;
  category: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  hostel: string;
  age: number;
  gender: string;
  height: number; // cm
  weight: number; // kg
  bmi: number;
  dailyStepGoal: number;
  dailyWaterGoal: number; // ml
  streakDays: number;
  campusPoints: number;
  avatarSeed: string;
  photoUrl?: string; // Real user photo from camera or file
  studentRollNo?: string;
  semester?: string;
  roomNo?: string;
  bloodGroup?: string;
  sportsClub?: string;
  bio?: string;
  targetCalories?: number;
  targetActiveMinutes?: number;
  lifetimeSteps?: number;
  lifetimeDistanceKm?: number;
  badges?: Badge[];
}

export interface DailyFitnessData {
  studentId: string;
  date: string;
  steps: number;
  activeMinutes: number;
  waterIntake: number; // ml
  caloriesBurned: number;
  distanceKm: number;
  hourlySteps: { hour: string; steps: number }[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  unit: string;
  progress: number;
  rewardPoints: number;
  participants: number;
  daysLeft: number;
  completed: boolean;
  aiTag?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  college: string;
  department: string;
  hostel: string;
  steps: number;
  streak: number;
  points: number;
  badge: string;
}

export interface AIRecommendation {
  headline: string;
  tip: string;
  actionableHabit: string;
  recoveryFocus: string;
  hydrationAdvice: string;
  motivationQuote: string;
}

export interface CampusFeedPost {
  id: string;
  studentId: string;
  studentName: string;
  studentCollege: string;
  studentHostel: string;
  photoUrl?: string;
  achievementTitle: string;
  steps: number;
  streakDays: number;
  distanceKm: number;
  caloriesBurned: number;
  caption: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
}

