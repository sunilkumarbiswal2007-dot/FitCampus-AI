import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Camera,
  Upload,
  Sparkles,
  School,
  Building,
  Heart,
  Flame,
  Award,
  Trophy,
  Activity,
  Footprints,
  Droplet,
  Compass,
  Edit3,
  Check,
  X,
  ShieldCheck,
  QrCode,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile } from '../types';

interface UserProfileViewProps {
  student: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  isDarkMode: boolean;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  student,
  onUpdateProfile,
  isDarkMode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // Form edit state
  const [name, setName] = useState(student.name);
  const [college, setCollege] = useState(student.college);
  const [department, setDepartment] = useState(student.department);
  const [hostel, setHostel] = useState(student.hostel);
  const [roomNo, setRoomNo] = useState(student.roomNo || 'Room C-312');
  const [studentRollNo, setStudentRollNo] = useState(student.studentRollNo || '23CS1048');
  const [semester, setSemester] = useState(student.semester || '4th Semester (Sophomore)');
  const [bloodGroup, setBloodGroup] = useState(student.bloodGroup || 'B+');
  const [sportsClub, setSportsClub] = useState(student.sportsClub || 'Campus Badminton & Marathon Club');
  const [bio, setBio] = useState(
    student.bio ||
      'CS student balancing algorithms, hostel table tennis, and 10k daily campus strides. Preparing for the Inter-College Marathon.'
  );
  const [age, setAge] = useState(student.age);
  const [height, setHeight] = useState(student.height);
  const [weight, setWeight] = useState(student.weight);
  const [stepGoal, setStepGoal] = useState(student.dailyStepGoal);
  const [waterGoal, setWaterGoal] = useState(student.dailyWaterGoal);

  // Camera & Photo Capture state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(student.photoUrl || null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Calculate BMR (Mifflin-St Jeor Equation)
  // For men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
  // For women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
  const bmr = Math.round(
    10 * student.weight +
      6.25 * student.height -
      5 * student.age +
      (student.gender === 'Female' ? -161 : 5)
  );
  const tdee = Math.round(bmr * 1.45); // Moderate active student multiplier

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable or permission denied. You can upload any photo below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Trigger 3-second snapshot countdown
  const triggerCountdownSnapshot = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          captureSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal for natural mirror look
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoPreview(dataUrl);
    stopCamera();
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save photo to profile
  const handleSavePhoto = async () => {
    if (!photoPreview) return;
    setSaving(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          photoUrl: photoPreview,
        }),
      });
      const data = await res.json();
      if (data.student) {
        onUpdateProfile(data.student);
      }
      setPhotoModalOpen(false);
      confetti({
        particleCount: 50,
        spread: 60,
      });
    } catch (err) {
      console.error('Error saving photo:', err);
    } finally {
      setSaving(false);
    }
  };

  // Save complete profile form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
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
          dailyStepGoal: stepGoal,
          dailyWaterGoal: waterGoal,
        }),
      });
      const data = await res.json();
      if (data.student) {
        onUpdateProfile(data.student);
      }
      setIsEditing(false);
      confetti({
        particleCount: 60,
        spread: 60,
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. STUDENT ATHLETIC ID BANNER */}
      <div className="rounded-3xl p-6 sm:p-8 glass-panel border border-slate-800 relative overflow-hidden shadow-2xl">
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Avatar with live photo, status ring, and camera button */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl p-1 bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 shadow-xl shadow-emerald-500/20 overflow-hidden">
                <div className="w-full h-full rounded-[22px] bg-slate-950 overflow-hidden flex items-center justify-center relative">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800 text-slate-300">
                      <User className="w-14 h-14 text-emerald-400/80 mb-1" />
                      <span className="text-[10px] font-mono text-slate-400">No Photo</span>
                    </div>
                  )}

                  {/* Hover Camera Prompt */}
                  <div
                    onClick={() => {
                      setPhotoPreview(student.photoUrl || null);
                      setPhotoModalOpen(true);
                    }}
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white"
                  >
                    <Camera className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-[11px] font-bold">Take Photo</span>
                  </div>
                </div>
              </div>

              {/* Floating Camera Button */}
              <button
                onClick={() => {
                  setPhotoPreview(student.photoUrl || null);
                  setPhotoModalOpen(true);
                }}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer"
                title="Change or Snap Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Student Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Campus Athlete</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
                  ID: {student.studentRollNo || '23CS1048'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
                {student.name}
              </h1>

              <div className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-semibold text-white">{student.college}</span>
                <span>•</span>
                <span className="text-emerald-400">{student.department}</span>
              </div>

              <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>{student.semester || '4th Semester'}</span>
                <span>•</span>
                <span>{student.hostel} ({student.roomNo || 'Room C-312'})</span>
              </div>

              <p className="text-xs text-slate-400 max-w-xl italic pt-1">
                "{student.bio || 'Balancing lectures and campus runs with high daily step counts.'}"
              </p>
            </div>
          </div>

          {/* Action button: Edit profile */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>Edit Fitness Profile</span>
            </button>

            <button
              onClick={() => {
                setPhotoPreview(student.photoUrl || null);
                setPhotoModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Take / Upload Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BIOMETRIC METABOLIC HUD & DAILY GOALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Biometrics Card */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-base text-white font-display">
                Biometric & Metabolic Engine
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live Health Analysis
            </span>
          </div>

          {/* Biometrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Height</span>
              <span className="text-xl font-black font-display text-white">{student.height}</span>
              <span className="text-[10px] text-slate-400 block">cm</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Weight</span>
              <span className="text-xl font-black font-display text-white">{student.weight}</span>
              <span className="text-[10px] text-slate-400 block">kg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Age / Sex</span>
              <span className="text-lg font-black font-display text-white">
                {student.age} <span className="text-xs font-normal text-slate-400">({student.gender.charAt(0)})</span>
              </span>
              <span className="text-[10px] text-slate-400 block">Student</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Blood</span>
              <span className="text-xl font-black font-display text-rose-400">
                {student.bloodGroup || 'B+'}
              </span>
              <span className="text-[10px] text-slate-400 block">Universal</span>
            </div>
          </div>

          {/* BMI & TDEE Metabolic Bar */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Body Mass Index (BMI):</span>
              <span className="font-bold text-emerald-400 font-display text-sm">
                {student.bmi} (Healthy Athletic Range)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 rounded-full"
                style={{ width: `${Math.min(100, (student.bmi / 30) * 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Basal BMR:</span>
                <span className="font-mono text-slate-200 font-bold">{bmr} kcal/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Campus TDEE:</span>
                <span className="font-mono text-emerald-400 font-bold">{tdee} kcal/day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Goals & Lifetime Record */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-base text-white font-display">
                Lifetime Athletic Milestones
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Campus Lifetime
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lifetime Steps</span>
              </div>
              <div className="text-2xl font-black font-display text-white">
                {(student.lifetimeSteps || 248900).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400">Logged since college freshman year</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lifetime Distance</span>
              </div>
              <div className="text-2xl font-black font-display text-cyan-400">
                {student.lifetimeDistanceKm || 189.2} <span className="text-xs font-normal text-slate-400">km</span>
              </div>
              <div className="text-[10px] text-slate-400">Across campus & athletics</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Daily Step Goal</span>
              </div>
              <div className="text-2xl font-black font-display text-orange-400">
                {student.dailyStepGoal.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Target for 100% streak</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Droplet className="w-3.5 h-3.5 text-blue-400" />
                <span>Water Target</span>
              </div>
              <div className="text-2xl font-black font-display text-blue-400">
                {(student.dailyWaterGoal / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">Liters</span>
              </div>
              <div className="text-[10px] text-slate-400">Daily hydration baseline</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CAMPUS ATHLETIC BADGES & TROPHY CABINET */}
      <div className="rounded-3xl p-6 sm:p-8 glass-panel border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-white font-display">
              Campus Athletic Badges & Trophy Cabinet
            </h3>
            <p className="text-xs text-slate-400">
              Badges earned through consistent steps, campus tournaments, and hydration streaks.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {student.badges?.length || 4} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(student.badges || []).map((badge) => (
            <div
              key={badge.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{badge.icon}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500/20">
                  {badge.category}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{badge.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                Earned: {badge.unlockedAt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MODAL: TAKE / UPLOAD PHOTO */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-slate-700 p-6 sm:p-8 space-y-6 text-white shadow-2xl">
            <button
              onClick={() => {
                stopCamera();
                setPhotoModalOpen(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                <Camera className="w-3.5 h-3.5" />
                <span>User Photo Hub</span>
              </div>
              <h3 className="text-xl font-bold font-display">Update Student Photo</h3>
              <p className="text-xs text-slate-400">
                Snap a live selfie using your device camera or upload a photo from your gallery.
              </p>
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Camera Viewport or Photo Preview */}
            <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  {countdown !== null && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-6xl font-black text-emerald-400 animate-ping">
                        {countdown}
                      </span>
                    </div>
                  )}
                </>
              ) : photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                  <User className="w-16 h-16 mb-2 text-slate-700" />
                  <span className="text-xs">No Photo Selected</span>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Photo Action Controls */}
            <div className="space-y-3">
              {cameraActive ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={triggerCountdownSnapshot}
                    className="py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo (3s)</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                  >
                    Cancel Camera
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={startCamera}
                    className="py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Live Camera</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Upload Image File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Commit / Save Photo button */}
              {photoPreview && !cameraActive && (
                <button
                  onClick={handleSavePhoto}
                  disabled={saving}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving Photo...' : 'Apply Photo to Profile'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: EDIT COMPLETE FITNESS PROFILE */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-3xl glass-panel border border-slate-700 p-6 sm:p-8 space-y-6 text-white shadow-2xl">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pb-2 border-b border-slate-800">
              <h3 className="text-xl font-bold font-display">Edit Student Fitness Profile</h3>
              <p className="text-xs text-slate-400">
                Update your academic affiliations, dorm room, and fitness targets.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student Roll No</label>
                  <input
                    type="text"
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">College / University</label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Branch</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hostel Block</label>
                  <input
                    type="text"
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room No</label>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sports Club Affiliation</label>
                  <input
                    type="text"
                    value={sportsClub}
                    onChange={(e) => setSportsClub(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              {/* Physical Biometrics */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Biometrics & Daily Targets
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Step Target</label>
                    <input
                      type="number"
                      value={stepGoal}
                      onChange={(e) => setStepGoal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Water Target (ml)</label>
                    <input
                      type="number"
                      value={waterGoal}
                      onChange={(e) => setWaterGoal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
