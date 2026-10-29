import React, { useState } from 'react';
import {
  X,
  Gift,
  Coffee,
  Shield,
  Sparkles,
  ShoppingBag,
  Dumbbell,
  Check,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campusPoints: number;
  onRedeem: (cost: number, itemName: string) => boolean;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  campusPoints,
  onRedeem,
}) => {
  const [redeemedItems, setRedeemedItems] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const storeItems = [
    {
      id: 'r-1',
      name: 'Campus Canteen 20% Off Token',
      description: 'Valid for healthy smoothies, fruit bowls, or mess cafeteria meals.',
      cost: 250,
      icon: Coffee,
      badge: 'Popular',
    },
    {
      id: 'r-2',
      name: '1-Day Streak Freeze Shield',
      description: 'Preserve your active streak even during heavy 24h exam cramming.',
      cost: 300,
      icon: Shield,
      badge: 'Student Essential',
    },
    {
      id: 'r-3',
      name: 'Campus Gym Weekend VIP Pass',
      description: 'Free access to university weight room, cardio zone, and sauna.',
      cost: 500,
      icon: Dumbbell,
      badge: 'Fitness Perks',
    },
    {
      id: 'r-4',
      name: 'FitCampus Insulated Steel Flask',
      description: 'Keep water cold for 24h during long summer campus lecture walks.',
      cost: 1200,
      icon: Gift,
      badge: 'Physical Merch',
    },
    {
      id: 'r-5',
      name: 'College Sports League Jersey',
      description: 'Official moisture-wicking campus athletic apparel with your name.',
      cost: 2500,
      icon: ShoppingBag,
      badge: 'Premium Reward',
    },
  ];

  const handleRedeemClick = (item: (typeof storeItems)[0]) => {
    if (campusPoints < item.cost) {
      alert(`You need ${item.cost - campusPoints} more Campus Points! Take more steps to earn points.`);
      return;
    }

    const success = onRedeem(item.cost, item.name);
    if (success) {
      setRedeemedItems((prev) => [...prev, item.id]);
      setSuccessMsg(`Redeemed "${item.name}"! Voucher sent to student email.`);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-slate-700 p-6 sm:p-8 text-white space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
              <Gift className="w-3.5 h-3.5" />
              <span>Campus Rewards Store</span>
            </div>
            <h2 className="text-2xl font-bold font-display">Redeem Campus Points</h2>
            <p className="text-xs text-slate-400">
              Turn your active steps and habit streaks into tangible student rewards.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Balance: {campusPoints.toLocaleString()} Pts</span>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Store Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {storeItems.map((item) => {
            const Icon = item.icon;
            const canAfford = campusPoints >= item.cost;
            const isRedeemed = redeemedItems.includes(item.id);

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-sm font-extrabold text-emerald-400 font-display">
                    {item.cost} Pts
                  </span>

                  <button
                    onClick={() => handleRedeemClick(item)}
                    disabled={isRedeemed}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isRedeemed
                        ? 'bg-slate-800 text-slate-500 cursor-default'
                        : canAfford
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 cursor-pointer'
                    }`}
                  >
                    {isRedeemed ? 'Redeemed' : canAfford ? 'Redeem Voucher' : 'Need More Steps'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
