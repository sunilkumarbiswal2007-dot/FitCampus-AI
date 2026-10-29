import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '12mb' }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

// In-Memory Database for Campus Students, Activities, Leaderboards, and Challenges
interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedAt: string;
  category: string;
}

interface StudentProfile {
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
  photoUrl?: string;
  studentRollNo?: string;
  semester?: string;
  roomNo?: string;
  bloodGroup?: string;
  sportsClub?: string;
  bio?: string;
  lifetimeSteps?: number;
  lifetimeDistanceKm?: number;
  badges?: Badge[];
}

interface DailyFitnessData {
  studentId: string;
  date: string;
  steps: number;
  activeMinutes: number;
  waterIntake: number; // ml
  caloriesBurned: number;
  distanceKm: number;
  hourlySteps: { hour: string; steps: number }[];
}

const mockStudents: Map<string, StudentProfile> = new Map([
  [
    'student-1',
    {
      id: 'student-1',
      name: 'Aarav Patel',
      email: 'aarav.patel@campus.edu',
      college: 'National Tech Institute',
      department: 'Computer Science & Engineering',
      hostel: 'Bhabha Hostel Block C',
      roomNo: 'Room C-312',
      studentRollNo: '23CS1048',
      semester: '4th Semester (Sophomore)',
      bloodGroup: 'B+',
      sportsClub: 'Campus Badminton & Marathon Club',
      bio: 'CS student balancing data structures, hostel table tennis, and 10k daily campus strides. Preparing for the Inter-College 10k Marathon.',
      age: 20,
      gender: 'Male',
      height: 176,
      weight: 68,
      bmi: 21.9,
      dailyStepGoal: 10000,
      dailyWaterGoal: 3000,
      streakDays: 8,
      campusPoints: 1450,
      avatarSeed: 'Aarav',
      photoUrl: '', // Will be updated by user camera or file upload
      lifetimeSteps: 248900,
      lifetimeDistanceKm: 189.2,
      badges: [
        {
          id: 'b-1',
          title: 'Campus Pacer Pro',
          icon: '🏃‍♂️',
          description: 'Walked 10,000 steps 7 days in a row.',
          unlockedAt: 'Oct 22, 2026',
          category: 'Consistency',
        },
        {
          id: 'b-2',
          title: 'Hydration Sentinel',
          icon: '💧',
          description: 'Maintained 3.0L daily water intake during exam week.',
          unlockedAt: 'Oct 18, 2026',
          category: 'Hydration',
        },
        {
          id: 'b-3',
          title: 'Hostel Champion',
          icon: '🏆',
          description: 'Ranked in top 5 step count for Bhabha Hostel.',
          unlockedAt: 'Oct 25, 2026',
          category: 'Tournament',
        },
        {
          id: 'b-4',
          title: 'Dawn Raider',
          icon: '🌅',
          description: 'Completed 3,000 steps before 8:00 AM lectures.',
          unlockedAt: 'Oct 27, 2026',
          category: 'Discipline',
        },
      ],
    },
  ],
  [
    'student-2',
    {
      id: 'student-2',
      name: 'Priya Sharma',
      email: 'priya.s@campus.edu',
      college: 'National Tech Institute',
      department: 'Biotechnology',
      hostel: 'Sarojini Hall',
      age: 21,
      gender: 'Female',
      height: 162,
      weight: 54,
      bmi: 20.6,
      dailyStepGoal: 10000,
      dailyWaterGoal: 2500,
      streakDays: 14,
      campusPoints: 2180,
      avatarSeed: 'Priya',
    },
  ],
  [
    'student-3',
    {
      id: 'student-3',
      name: 'Rohan Deshmukh',
      email: 'rohan.d@campus.edu',
      college: 'State Engineering University',
      department: 'Mechanical',
      hostel: 'Ramanujan Bhavan',
      age: 22,
      gender: 'Male',
      height: 181,
      weight: 75,
      bmi: 22.9,
      dailyStepGoal: 12000,
      dailyWaterGoal: 3200,
      streakDays: 21,
      campusPoints: 3100,
      avatarSeed: 'Rohan',
    },
  ],
]);

const todayStr = new Date().toISOString().split('T')[0];

const studentDailyData: Map<string, DailyFitnessData> = new Map([
  [
    'student-1',
    {
      studentId: 'student-1',
      date: todayStr,
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
    },
  ],
]);

const campusLeaderboard = [
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
    name: 'Aarav Patel',
    college: 'National Tech Institute',
    department: 'Computer Science',
    hostel: 'Bhabha Hostel Block C',
    steps: 7420,
    streak: 8,
    points: 1450,
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
];

const campusChallenges = [
  {
    id: 'c-1',
    title: 'Hostel to Library 8,000 Step Dash',
    description: 'Walk or jog between academic blocks and hostels to hit 8k steps before sunset.',
    category: 'Daily Step',
    target: 8000,
    unit: 'steps',
    progress: 7420,
    rewardPoints: 150,
    participants: 412,
    daysLeft: 1,
    completed: false,
    aiTag: 'Popular Today',
  },
  {
    id: 'c-2',
    title: 'Hydration Champion (3 Liters)',
    description: 'Beat campus heat and brain fog by staying hydrated during lectures.',
    category: 'Hydration',
    target: 3000,
    unit: 'ml',
    progress: 2000,
    rewardPoints: 100,
    participants: 628,
    daysLeft: 1,
    completed: false,
    aiTag: 'Health Essential',
  },
  {
    id: 'c-3',
    title: 'Exam Stress-Buster 45-Min Workout',
    description: 'Engage in badminton, gym, campus brisk walking, or brisk jogging.',
    category: 'Active Minutes',
    target: 45,
    unit: 'mins',
    progress: 48,
    rewardPoints: 200,
    participants: 295,
    daysLeft: 2,
    completed: true,
    aiTag: 'AI Recommended',
  },
  {
    id: 'c-4',
    title: 'Weekend Inter-Hostel 25,000 Step Clash',
    description: 'Compete for the Hostel Trophy with total collective steps over the weekend.',
    category: 'Tournament',
    target: 25000,
    unit: 'steps',
    progress: 18200,
    rewardPoints: 500,
    participants: 1240,
    daysLeft: 3,
    completed: false,
    aiTag: 'Campus Major',
  },
];

interface CampusFeedPost {
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

const campusFeedPosts: CampusFeedPost[] = [
  {
    id: 'post-1',
    studentId: 'student-3',
    studentName: 'Rohan Deshmukh',
    studentCollege: 'State Engineering University',
    studentHostel: 'Ramanujan Bhavan',
    achievementTitle: 'Crushed 14,820 steps on campus paths today!',
    steps: 14820,
    streakDays: 21,
    distanceKm: 11.2,
    caloriesBurned: 670,
    caption: 'Brisk pace around the tech park and basketball grounds between seminars. Ramanujan Bhavan leading the board! 🔥',
    timestamp: '1 hour ago',
    likes: 42,
    hasLiked: false,
    commentsCount: 6,
  },
  {
    id: 'post-2',
    studentId: 'student-2',
    studentName: 'Priya Sharma',
    studentCollege: 'National Tech Institute',
    studentHostel: 'Sarojini Hall',
    achievementTitle: '14-Day Streak Unlocked & 12.4k Steps!',
    steps: 12450,
    streakDays: 14,
    distanceKm: 9.4,
    caloriesBurned: 540,
    caption: 'Evening campus perimeter walk after biotech lab practicals. Consistency is paying off! 👟💪',
    timestamp: '3 hours ago',
    likes: 38,
    hasLiked: false,
    commentsCount: 4,
  },
];

// Helper: Calculate BMI
function calculateBMI(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0) return 22.0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

// Auth API Routes
app.post('/api/auth/register', (req, res) => {
  const { name, college, email, password, age, gender, height, weight, department, hostel, photoUrl } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  // Check if exists
  for (const [, student] of mockStudents) {
    if (student.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({ error: 'Student with this email already registered.' });
    }
  }

  const id = `student-${Date.now()}`;
  const parsedWeight = Number(weight) || 65;
  const parsedHeight = Number(height) || 170;
  const bmi = calculateBMI(parsedWeight, parsedHeight);

  // Suggested daily goals based on profile
  const dailyStepGoal = 10000;
  const dailyWaterGoal = Math.round(parsedWeight * 35); // ~35ml per kg

  const newStudent: StudentProfile = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    college: college?.trim() || 'Premier Institute of Technology',
    department: department?.trim() || 'Computer Science & Engineering',
    hostel: hostel?.trim() || 'Central Campus Block',
    roomNo: 'Room 204',
    studentRollNo: `24${department?.substring(0, 2).toUpperCase() || 'CS'}${Math.floor(1000 + Math.random() * 9000)}`,
    semester: '1st Year Freshman',
    bloodGroup: 'O+',
    sportsClub: 'Campus Track & Fitness Community',
    bio: 'Freshman student enthusiastic about staying fit, walking campus pathways, and competing in hostel challenges.',
    age: Number(age) || 20,
    gender: gender || 'Student',
    height: parsedHeight,
    weight: parsedWeight,
    bmi,
    dailyStepGoal,
    dailyWaterGoal,
    streakDays: 1,
    campusPoints: 100, // Sign up welcome bonus
    avatarSeed: name,
    photoUrl: photoUrl || '',
    lifetimeSteps: 0,
    lifetimeDistanceKm: 0,
    badges: [
      {
        id: 'b-welcome',
        title: 'Campus Rookie',
        icon: '👟',
        description: 'Joined FitCampus AI community and created student profile.',
        unlockedAt: 'Today',
        category: 'Welcome',
      },
    ],
  };

  mockStudents.set(id, newStudent);

  // Initialize today's data
  studentDailyData.set(id, {
    studentId: id,
    date: todayStr,
    steps: 0,
    activeMinutes: 0,
    waterIntake: 500,
    caloriesBurned: 0,
    distanceKm: 0,
    hourlySteps: [
      { hour: '8 AM', steps: 0 },
      { hour: '12 PM', steps: 0 },
      { hour: '4 PM', steps: 0 },
      { hour: '8 PM', steps: 0 },
    ],
  });

  return res.json({
    token: `jwt-token-${id}`,
    student: newStudent,
    message: 'Fitness profile created successfully!',
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Find student
  let foundStudent: StudentProfile | null = null;
  for (const [, student] of mockStudents) {
    if (student.email.toLowerCase() === email.toLowerCase()) {
      foundStudent = student;
      break;
    }
  }

  if (!foundStudent) {
    // For convenience in testing/demo, create a dynamic profile if standard credentials used
    return res.status(401).json({ error: 'Invalid credentials. Try demo login or register.' });
  }

  return res.json({
    token: `jwt-token-${foundStudent.id}`,
    student: foundStudent,
  });
});

// Demo Fast Login
app.post('/api/auth/demo', (req, res) => {
  const student = mockStudents.get('student-1');
  return res.json({
    token: `jwt-token-student-1`,
    student,
  });
});

// Update Profile & Photo API
app.post('/api/auth/update-profile', (req, res) => {
  const {
    studentId = 'student-1',
    photoUrl,
    name,
    college,
    department,
    hostel,
    roomNo,
    studentRollNo,
    semester,
    bloodGroup,
    sportsClub,
    bio,
    age,
    height,
    weight,
    dailyStepGoal,
    dailyWaterGoal,
  } = req.body;

  let student = mockStudents.get(studentId);
  if (!student) {
    student = mockStudents.get('student-1')!;
  }

  if (photoUrl !== undefined) student.photoUrl = photoUrl;
  if (name) student.name = name.trim();
  if (college) student.college = college.trim();
  if (department) student.department = department.trim();
  if (hostel) student.hostel = hostel.trim();
  if (roomNo !== undefined) student.roomNo = roomNo.trim();
  if (studentRollNo !== undefined) student.studentRollNo = studentRollNo.trim();
  if (semester !== undefined) student.semester = semester.trim();
  if (bloodGroup !== undefined) student.bloodGroup = bloodGroup.trim();
  if (sportsClub !== undefined) student.sportsClub = sportsClub.trim();
  if (bio !== undefined) student.bio = bio.trim();
  if (age) student.age = Number(age);
  if (height) student.height = Number(height);
  if (weight) student.weight = Number(weight);
  if (dailyStepGoal) student.dailyStepGoal = Number(dailyStepGoal);
  if (dailyWaterGoal) student.dailyWaterGoal = Number(dailyWaterGoal);

  // Recalculate BMI if height or weight changed
  if (student.height && student.weight) {
    student.bmi = calculateBMI(student.weight, student.height);
  }

  mockStudents.set(student.id, student);

  return res.json({
    success: true,
    message: 'Profile updated successfully!',
    student,
  });
});

// Get Current Student Fitness Data
app.get('/api/fitness/today', (req, res) => {
  const studentId = (req.query.studentId as string) || 'student-1';
  const profile = mockStudents.get(studentId) || mockStudents.get('student-1');
  const data = studentDailyData.get(studentId) || studentDailyData.get('student-1');

  return res.json({
    profile,
    fitness: data,
  });
});

// Update Steps / Sync Live Device Sensors
app.post('/api/fitness/update-steps', (req, res) => {
  const { studentId = 'student-1', steps, method = 'sensor' } = req.body;
  const current = studentDailyData.get(studentId) || studentDailyData.get('student-1')!;

  const newSteps = Math.max(0, Number(steps));
  current.steps = newSteps;
  // Estimate distance: average step length ~0.76m
  current.distanceKm = parseFloat(((newSteps * 0.76) / 1000).toFixed(2));
  // Estimate calories: ~0.045 kcal per step
  current.caloriesBurned = Math.round(newSteps * 0.045);
  // Estimate active minutes: ~100 steps per minute
  current.activeMinutes = Math.min(180, Math.round(newSteps / 110));

  studentDailyData.set(studentId, current);

  // Update points for milestone
  const profile = mockStudents.get(studentId);
  if (profile && newSteps >= profile.dailyStepGoal && profile.streakDays <= 8) {
    profile.campusPoints += 50;
  }

  return res.json({
    success: true,
    steps: current.steps,
    distanceKm: current.distanceKm,
    caloriesBurned: current.caloriesBurned,
    activeMinutes: current.activeMinutes,
    method,
  });
});

// Log Water Intake
app.post('/api/fitness/log-water', (req, res) => {
  const { studentId = 'student-1', amountMl = 250 } = req.body;
  const current = studentDailyData.get(studentId) || studentDailyData.get('student-1')!;

  current.waterIntake = Math.min(6000, current.waterIntake + Number(amountMl));
  studentDailyData.set(studentId, current);

  return res.json({
    success: true,
    waterIntake: current.waterIntake,
  });
});

// Leaderboard API
app.get('/api/fitness/leaderboard', (req, res) => {
  return res.json({
    leaderboard: campusLeaderboard,
  });
});

// Challenges API
app.get('/api/challenges', (req, res) => {
  return res.json({
    challenges: campusChallenges,
  });
});

// Join / Claim Challenge
app.post('/api/challenges/:id/claim', (req, res) => {
  const { id } = req.params;
  const challenge = campusChallenges.find((c) => c.id === id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const profile = mockStudents.get('student-1');
  if (profile) {
    profile.campusPoints += challenge.rewardPoints;
  }
  challenge.completed = true;

  return res.json({
    success: true,
    message: `Earned ${challenge.rewardPoints} Campus Points!`,
    newBalance: profile?.campusPoints,
  });
});

// Campus Social Feed API
app.get('/api/feed', (_req, res) => {
  return res.json({ posts: campusFeedPosts });
});

app.post('/api/feed/share', (req, res) => {
  const { studentId = 'student-1', caption, achievementTitle } = req.body;
  const student = mockStudents.get(studentId) || mockStudents.get('student-1')!;
  const data = studentDailyData.get(student.id) || studentDailyData.get('student-1')!;

  const newPost: CampusFeedPost = {
    id: `post-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    studentCollege: student.college,
    studentHostel: student.hostel,
    photoUrl: student.photoUrl,
    achievementTitle: achievementTitle || `Hit ${data.steps.toLocaleString()} steps today!`,
    steps: data.steps,
    streakDays: student.streakDays,
    distanceKm: data.distanceKm,
    caloriesBurned: data.caloriesBurned,
    caption: caption || `Just locked in my daily campus fitness streak on FitCampus AI! 👟🔥`,
    timestamp: 'Just now',
    likes: 1,
    hasLiked: true,
    commentsCount: 0,
  };

  student.campusPoints += 25; // Bonus for sharing
  campusFeedPosts.unshift(newPost);

  return res.json({
    success: true,
    message: 'Achievement shared to Campus Social Feed! (+25 Campus Points)',
    post: newPost,
    newBalance: student.campusPoints,
  });
});

app.post('/api/feed/:id/like', (req, res) => {
  const { id } = req.params;
  const post = campusFeedPosts.find((p) => p.id === id);
  if (post) {
    if (post.hasLiked) {
      post.likes = Math.max(0, post.likes - 1);
      post.hasLiked = false;
    } else {
      post.likes += 1;
      post.hasLiked = true;
    }
    return res.json({ success: true, likes: post.likes, hasLiked: post.hasLiked });
  }
  return res.status(404).json({ error: 'Post not found' });
});

// AI Gemini Integration: Daily Personalized Recommendation
app.post('/api/ai/daily-recommendation', async (req, res) => {
  const { studentName, steps, stepGoal, waterMl, activeMinutes, context } = req.body;

  const defaultRecommendation = {
    headline: 'Prime Afternoon Campus Stride',
    tip: 'You are at 7,420 steps! Take a 15-minute campus loop between lectures, stretch your hamstrings, and drink 2 glasses of water to hit your daily goal before library study hours.',
    actionableHabit: 'Take the stairs to the 3rd floor lab instead of the elevator today.',
    recoveryFocus: 'Dorm posture reset: 3 sets of 30s doorway chest stretches after studying.',
    hydrationAdvice: 'Drink 500ml water before your next class to prevent afternoon lethargy.',
    motivationQuote: 'Small campus steps turn into lifelong athletic endurance.',
  };

  if (!aiClient) {
    return res.json(defaultRecommendation);
  }

  try {
    const prompt = `You are FitCampus AI, an enthusiastic, science-backed student fitness and wellness coach for college students.
A student named ${studentName || 'Student'} has the following stats today:
- Current Steps: ${steps || 7420} / Goal: ${stepGoal || 10000}
- Water Intake: ${waterMl || 2000} ml / Goal: 3000 ml
- Active Minutes: ${activeMinutes || 48} mins
- Student Situation / Context: ${context || 'Balancing lectures, exams, and hostel food.'}

Generate an encouraging, realistic, student-focused fitness recommendation in strict JSON format:
{
  "headline": "A punchy, catchy 3-5 word headline",
  "tip": "A crisp 1-2 sentence tailored recommendation (e.g. 'Walk for 20 minutes in the evening and drink two more glasses of water.')",
  "actionableHabit": "One practical micro-habit doable on a college campus",
  "recoveryFocus": "A quick dorm or study-break mobility/stretching exercise",
  "hydrationAdvice": "Specific hydration cue tailored to study hours",
  "motivationQuote": "An inspiring student-centric one-liner"
}
Return ONLY valid JSON.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    }
    return res.json(defaultRecommendation);
  } catch (error) {
    console.error('Gemini recommendation error:', error);
    return res.json(defaultRecommendation);
  }
});

// AI Gemini Integration: Generate Custom Campus Challenge
app.post('/api/ai/generate-challenge', async (req, res) => {
  const { mood, intensity = 'medium', location = 'campus' } = req.body;

  const fallback = {
    title: 'Hostel Quad 10-Minute Power Circuit',
    description: 'Do 3 rounds of 20 bodyweight squats, 15 jumping jacks, and 1 lap around the hostel garden.',
    category: 'Hostel Workout',
    target: 10,
    unit: 'mins',
    rewardPoints: 120,
    aiTag: 'AI Tailored',
  };

  if (!aiClient) {
    return res.json(fallback);
  }

  try {
    const prompt = `Generate a creative, safe, and fun college fitness micro-challenge for a student with mood '${mood || 'energized'}', intensity '${intensity}', and location '${location}'.
Output in strict JSON:
{
  "title": "Short punchy challenge title",
  "description": "Clear step-by-step instructions suitable for campus grounds or hostel room",
  "category": "E.g. Step Quest, Cardio Blitz, Room Mobility, or Campus Trek",
  "target": 15,
  "unit": "mins or steps or laps",
  "rewardPoints": 150,
  "aiTag": "AI Custom"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed.title ? parsed : fallback);
  } catch (err) {
    console.error('Gemini challenge generation error:', err);
    return res.json(fallback);
  }
});

// AI Gemini Integration: Interactive Student Fitness Coach Chat
app.post('/api/ai/coach-chat', async (req, res) => {
  const { message, studentContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!aiClient) {
    return res.json({
      reply: `Hey ${studentContext?.name || 'there'}! As your FitCampus AI coach, staying consistent in college is all about micro-habits. Aim to break up long study sessions every 45 minutes with a 3-minute walking break, keep a reusable water bottle at your desk, and take the campus stairs. You're already doing great with your streak!`,
    });
  }

  try {
    const systemPrompt = `You are FitCampus AI Coach, a supportive, athletic, and knowledgeable wellness advisor built specifically for university students. 
You understand hostel life, late-night cramming, exam stress, messy mess food diets, and busy lecture schedules.
Keep responses concise, energized, empathetic, and actionable (max 3 short paragraphs). Never give medical diagnoses. Emphasize progressive steps, mobility, good sleep, hydration, and positive mindset.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent Query: "${message}"\nStudent info: ${JSON.stringify(studentContext || {})}` }] },
      ],
    });

    return res.json({
      reply: response.text?.trim() || 'Keep moving! Every step on campus brings you closer to peak fitness and sharp mental focus.',
    });
  } catch (err) {
    console.error('Gemini coach chat error:', err);
    return res.json({
      reply: 'Taking a brisk 10-minute walk right now will boost your dopamine and circulation. Drink a glass of water and keep that campus streak going!',
    });
  }
});

// Serve frontend in production or mount Vite in dev
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 FitCampus AI Server running on port ${PORT}`);
  });
}

setupServer();
