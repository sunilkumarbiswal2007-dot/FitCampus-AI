import React, { useState, useEffect } from 'react';
import {
  Flame,
  Heart,
  Share2,
  Users,
  Footprints,
  MessageSquare,
  Sparkles,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CampusFeedPost, StudentProfile } from '../types';

interface CampusFeedSectionProps {
  currentStudent: StudentProfile;
  onOpenShareModal: () => void;
}

export const CampusFeedSection: React.FC<CampusFeedSectionProps> = ({
  currentStudent,
  onOpenShareModal,
}) => {
  const [posts, setPosts] = useState<CampusFeedPost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feed');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch campus feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/feed/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes: data.likes, hasLiked: data.hasLiked } : p
          )
        );
        if (data.hasLiked) {
          confetti({
            particleCount: 20,
            spread: 30,
            origin: { y: 0.7 },
            colors: ['#f43f5e', '#fb7185', '#fda4af'],
          });
        }
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 glass-panel border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Campus Social Feed</span>
          </div>
          <h3 className="text-xl font-bold font-display text-white">Live Student Achievements</h3>
          <p className="text-xs text-slate-400">
            Cheer on your hostel mates and celebrate verified campus fitness streaks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFeed}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenShareModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share My Milestone</span>
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => {
          const isMe = post.studentId === currentStudent.id;
          return (
            <div
              key={post.id}
              className={`p-5 rounded-2xl bg-slate-950/60 border transition-all space-y-3.5 ${
                isMe ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {post.photoUrl ? (
                      <img src={post.photoUrl} alt={post.studentName} className="w-full h-full object-cover" />
                    ) : (
                      post.studentName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{post.studentName}</span>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {post.studentCollege} • {post.studentHostel}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500">{post.timestamp}</span>
              </div>

              {/* Achievement Highlight Strip */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400 font-display">
                    {post.achievementTitle}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {post.steps.toLocaleString()} steps • {post.distanceKm} km • {post.caloriesBurned} kcal
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{post.streakDays}d Streak</span>
                </div>
              </div>

              {/* Caption */}
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                "{post.caption}"
              </p>

              {/* Action bar (Like / Cheer) */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    post.hasLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-400' : ''}`} />
                  <span>{post.likes} Cheers</span>
                </button>

                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount || 0} Comments</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
