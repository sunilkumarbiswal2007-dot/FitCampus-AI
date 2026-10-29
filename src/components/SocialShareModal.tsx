import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Twitter,
  Flame,
  Footprints,
  Compass,
  Trophy,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, DailyFitnessData } from '../types';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  fitnessData: DailyFitnessData;
  onPostToCampusFeed?: (caption: string) => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  student,
  fitnessData,
  onPostToCampusFeed,
}) => {
  const [copied, setCopied] = useState(false);
  const [postingToFeed, setPostingToFeed] = useState(false);
  const [postedSuccess, setPostedSuccess] = useState(false);
  const [caption, setCaption] = useState(
    `Just locked in ${fitnessData.steps.toLocaleString()} campus steps and maintained my ${student.streakDays}-day streak on FitCampus AI! 👟🔥`
  );

  if (!isOpen) return null;

  const shareText = `🏃‍♂️ FitCampus AI Update:
👤 ${student.name} (${student.college})
🔥 Streak: ${student.streakDays} Days
👟 Steps Today: ${fitnessData.steps.toLocaleString()}
📍 Distance: ${fitnessData.distanceKm} km
⚡ Burned: ${fitnessData.caloriesBurned} kcal

${caption}
Check out FitCampus AI!`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      confetti({
        particleCount: 25,
        spread: 40,
      });
    } catch (err) {
      console.error('Failed to copy share text:', err);
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Twitter / X share
  const handleTwitterShare = () => {
    const encoded = encodeURIComponent(
      `Just walked ${fitnessData.steps.toLocaleString()} steps with an ${student.streakDays}-day streak on FitCampus AI! 🏃‍♂️🔥 #FitCampus #StudentFitness #CollegeLife`
    );
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'FitCampus AI - Daily Fitness Milestone',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopy();
    }
  };

  // Post to Campus Social Feed
  const handleCampusFeedPost = async () => {
    setPostingToFeed(true);
    try {
      const res = await fetch('/api/feed/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          caption,
          achievementTitle: `Crushed ${fitnessData.steps.toLocaleString()} steps today!`,
        }),
      });

      if (res.ok) {
        setPostedSuccess(true);
        if (onPostToCampusFeed) {
          onPostToCampusFeed(caption);
        }
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          setPostedSuccess(false);
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error('Failed to post to campus feed:', err);
    } finally {
      setPostingToFeed(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 text-white space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5" />
            <span>Campus Social & Messaging</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display">
            Share Daily Fitness Achievement
          </h3>
          <p className="text-xs text-slate-400">
            Inspire hostel friends, campus clubs, and messaging groups with your verified stats.
          </p>
        </div>

        {/* 1. VISUAL ACHIEVEMENT SHARE CARD */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
          {/* Card background glows */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/15 rounded-full blur-[45px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Top brand header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-extrabold text-xs tracking-wider text-emerald-400 font-display">
                  FITCAMPUS AI • DAILY MILESTONE
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Student ID strip */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  student.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate">{student.name}</div>
                <div className="text-[11px] text-slate-400 truncate">
                  {student.college} • {student.hostel}
                </div>
              </div>
            </div>

            {/* Central Stat Highlight */}
            <div className="py-2 text-center space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                Today's Step Milestone
              </span>
              <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
                {fitnessData.steps.toLocaleString()}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mt-1">
                <Flame className="w-3.5 h-3.5 fill-orange-400 animate-pulse" />
                <span>{student.streakDays}-Day Active Streak 🔥</span>
              </div>
            </div>

            {/* Mini metrics bar */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Distance</span>
                <span className="text-sm font-bold text-cyan-400">{fitnessData.distanceKm} km</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Calories</span>
                <span className="text-sm font-bold text-orange-400">{fitnessData.caloriesBurned} kcal</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. EDITABLE CAPTION */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Caption for Campus Social Feed & Chats
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* 3. PRIMARY ACTION: POST TO CAMPUS SOCIAL FEED */}
        {postedSuccess ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Shared to Campus Social Feed! +25 Points Awarded</span>
          </div>
        ) : (
          <button
            onClick={handleCampusFeedPost}
            disabled={postingToFeed}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>{postingToFeed ? 'Sharing...' : 'Post to Campus Social Feed (+25 Pts)'}</span>
          </button>
        )}

        {/* 4. MESSAGING PLATFORM BUTTONS */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Direct Share to Messaging
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Twitter className="w-3.5 h-3.5" />
              <span>Twitter / X</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Stats'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
