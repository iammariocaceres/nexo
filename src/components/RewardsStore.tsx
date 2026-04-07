import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuStar, LuZap, LuShoppingBag, LuLock, LuPartyPopper, LuCheck } from 'react-icons/lu';
import { useFamilyStore, type Reward, type Member } from '../store/useFamilyStore';

// ─── Member Selector ──────────────────────────────────────────────────────────

interface MemberSelectorProps {
  members: Member[];
  selected: Member | null;
  onSelect: (member: Member) => void;
}

const MemberSelector = ({ members, selected, onSelect }: MemberSelectorProps) => (
  <div className="flex items-center gap-3 p-4 bg-white/80 rounded-2xl border border-white/40 shadow-sm">
    <span className="text-sm font-bold text-slate-500 shrink-0">👤 Who's shopping?</span>
    <div className="flex gap-2 flex-wrap">
      {members.map(member => {
        const isSelected = selected?.id === member.id;
        return (
          <motion.button
            key={member.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(member)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all border-2"
            style={isSelected
              ? { backgroundColor: member.color, borderColor: member.color, color: 'white', boxShadow: `0 4px 14px ${member.color}50` }
              : { backgroundColor: 'transparent', borderColor: '#e2e8f0', color: '#64748b' }
            }
          >
            <img src={member.avatar_url} alt={member.name} className="w-6 h-6 rounded-full" />
            {member.name}
            {isSelected && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4">
                <LuCheck className="w-4 h-4" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
    {selected && (
      <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full shrink-0">
        <LuStar className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
        <span className="font-black text-amber-700 text-sm">{selected.points}</span>
        <span className="text-amber-600 text-xs font-medium">XP available</span>
      </div>
    )}
  </div>
);

// ─── Redeem Modal ─────────────────────────────────────────────────────────────

interface RedeemModalProps {
  reward: Reward;
  member: Member;
  onConfirm: () => void;
  onCancel: () => void;
}

const RedeemModal = ({ reward, member, onConfirm, onCancel }: RedeemModalProps) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 30 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Reward emoji */}
        <motion.div
          animate={{ rotate: [0, -15, 15, -8, 8, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl mb-4"
        >
          {reward.emoji}
        </motion.div>

        <h2 className="text-xl font-black text-slate-800 mb-1">{reward.title}</h2>
        <p className="text-slate-500 text-sm font-medium mb-5">{reward.description}</p>

        {/* Cost + balance */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-4 py-2 rounded-full">
            <LuStar className="w-4 h-4 text-rose-500 fill-rose-400" />
            <span className="font-black text-rose-700">-{reward.cost} XP</span>
          </div>
          <span className="text-slate-300 text-xl">→</span>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
            <span className="font-black text-emerald-700">{member.points - reward.cost} XP left</span>
          </div>
        </div>

        {/* Member confirm */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-6">
          <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full" />
          <div className="text-left">
            <p className="font-bold text-slate-800 text-sm">{member.name}</p>
            <p className="text-xs text-slate-400">redeeming this reward</p>
          </div>
          <span className="text-xl ml-auto">{member.emoji}</span>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: member.color, boxShadow: `0 10px 30px ${member.color}40` }}
          >
            <LuPartyPopper className="w-5 h-5" />
            Yes, redeem it! 🎉
          </motion.button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors text-sm"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Success Toast ────────────────────────────────────────────────────────────

const SuccessToast = ({ reward, member }: { reward: Reward; member: Member }) => (
  <motion.div
    initial={{ opacity: 0, y: 80, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 80, scale: 0.8 }}
    transition={{ type: 'spring', stiffness: 350 }}
    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-3xl shadow-2xl text-white flex items-center gap-3"
    style={{ backgroundColor: member.color }}
  >
    <span className="text-2xl">{reward.emoji}</span>
    <div>
      <p className="font-black text-sm">{reward.title} redeemed!</p>
      <p className="text-xs opacity-80">-{reward.cost} XP · Enjoy, {member.name}! 🎉</p>
    </div>
  </motion.div>
);

// ─── Reward Card ──────────────────────────────────────────────────────────────

interface RewardCardProps {
  reward: Reward;
  selectedMember: Member | null;
  onRedeem: (reward: Reward) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Fun': 'bg-purple-50 text-purple-600 border-purple-100',
  'Food': 'bg-rose-50 text-rose-600 border-rose-100',
  'Screen Time': 'bg-blue-50 text-blue-600 border-blue-100',
  'Special': 'bg-amber-50 text-amber-600 border-amber-100',
};

const RewardCard = ({ reward, selectedMember, onRedeem }: RewardCardProps) => {
  const canAfford = selectedMember ? selectedMember.points >= reward.cost : false;
  const pointsNeeded = selectedMember ? Math.max(0, reward.cost - selectedMember.points) : reward.cost;

  return (
    <motion.div
      whileHover={canAfford ? { y: -6, scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`
        relative bg-white/80 backdrop-blur-md rounded-3xl p-5 border-2 flex flex-col h-full transition-all
        ${canAfford ? 'border-white/40 shadow-lg' : 'border-slate-100 opacity-60 grayscale-[0.3]'}
      `}
    >
      {/* Category badge */}
      <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${CATEGORY_COLORS[reward.category] || 'bg-slate-50 text-slate-500'}`}>
        {reward.category}
      </div>

      {/* Emoji */}
      <div className="text-5xl mb-3 mt-1">{reward.emoji}</div>

      <h3 className="text-lg font-black text-slate-800 leading-tight mb-1.5 pr-16">{reward.title}</h3>
      <p className="text-sm text-slate-500 font-medium flex-1 mb-4 leading-relaxed">{reward.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-1.5">
          <LuStar className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-black text-slate-800 text-base">{reward.cost}</span>
          <span className="text-slate-400 text-xs font-medium">XP</span>
        </div>

        {!selectedMember ? (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
            <LuLock className="w-3.5 h-3.5" />
            Select profile
          </div>
        ) : canAfford ? (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onRedeem(reward)}
            className="px-4 py-2 rounded-xl font-black text-xs text-white shadow-md flex items-center gap-1.5"
            style={{ backgroundColor: selectedMember.color, boxShadow: `0 4px 12px ${selectedMember.color}40` }}
          >
            <LuZap className="w-3.5 h-3.5" />
            Redeem!
          </motion.button>
        ) : (
          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold py-2">
            <LuLock className="w-3.5 h-3.5" />
            Need {pointsNeeded} more
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Rewards Store ────────────────────────────────────────────────────────────

export const RewardsStore = () => {
  const { members, rewards, redeemReward } = useFamilyStore();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pendingRedeem, setPendingRedeem] = useState<{ reward: Reward; member: Member } | null>(null);
  const [successReward, setSuccessReward] = useState<{ reward: Reward; member: Member } | null>(null);

  const handleRedeemClick = (reward: Reward) => {
    if (!selectedMember) return;
    setPendingRedeem({ reward, member: selectedMember });
  };

  const handleConfirmRedeem = () => {
    if (!pendingRedeem) return;
    redeemReward(pendingRedeem.reward.id, pendingRedeem.member.id);
    setSuccessReward(pendingRedeem);
    setPendingRedeem(null);
    setTimeout(() => setSuccessReward(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 shrink-0">
          <LuShoppingBag className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">Rewards Store</h1>
          <p className="text-sm text-slate-500 font-medium">Turn your hard work into amazing rewards! ✨</p>
        </div>
        <span className="text-3xl ml-auto">🎁</span>
      </div>

      {/* Member selector */}
      <MemberSelector
        members={members}
        selected={selectedMember}
        onSelect={setSelectedMember}
      />

      {/* Selected member hint */}
      {selectedMember && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 py-3 rounded-2xl flex items-center gap-3"
          style={{ backgroundColor: `${selectedMember.color}15`, borderColor: `${selectedMember.color}30`, border: '1px solid' }}
        >
          <span className="text-xl">{selectedMember.emoji}</span>
          <p className="text-sm font-bold" style={{ color: selectedMember.color }}>
            Hi {selectedMember.name}! You have <strong>{selectedMember.points} XP</strong> to spend.
            {selectedMember.points < 60 && " Keep completing chores to earn more! 💪"}
          </p>
        </motion.div>
      )}

      {/* Rewards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rewards.map((reward, i) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <RewardCard
              reward={reward}
              selectedMember={selectedMember}
              onRedeem={handleRedeemClick}
            />
          </motion.div>
        ))}
      </div>

      {/* Motivation footer */}
      <div className="p-5 bg-linear-to-r from-primary/10 to-cyan-100/50 rounded-3xl border border-primary/10 flex items-center gap-4">
        <span className="text-3xl shrink-0">💡</span>
        <div>
          <p className="font-bold text-slate-800 text-sm">Want more rewards?</p>
          <p className="text-xs text-slate-500 font-medium">Complete your morning chores before 10 AM for a bonus XP streak! 🌅</p>
        </div>
      </div>

      {/* Redeem modal */}
      {pendingRedeem && (
        <RedeemModal
          reward={pendingRedeem.reward}
          member={pendingRedeem.member}
          onConfirm={handleConfirmRedeem}
          onCancel={() => setPendingRedeem(null)}
        />
      )}

      {/* Success toast */}
      <AnimatePresence>
        {successReward && (
          <SuccessToast reward={successReward.reward} member={successReward.member} />
        )}
      </AnimatePresence>
    </div>
  );
};