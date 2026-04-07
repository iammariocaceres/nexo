import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LuStar, LuZap } from 'react-icons/lu';
import { useFamilyStore, type Member } from '../store/useFamilyStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GREETINGS: Record<string, { text: string; emoji: string }> = {
  morning: { text: 'Good Morning', emoji: '☀️' },
  afternoon: { text: 'Good Afternoon', emoji: '🌤️' },
  evening: { text: 'Good Evening', emoji: '🌙' },
};

function getGreetingKey(): keyof typeof GREETINGS {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ─── Floating particle background ─────────────────────────────────────────────

const PARTICLES = ['⭐', '✨', '🌟', '💫', '🎉', '🌸', '💪', '🏆', '❤️', '🎯'];

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {PARTICLES.map((p, i) => (
      <motion.span
        key={i}
        className="absolute text-2xl select-none"
        style={{
          left: `${(i * 11 + 5) % 95}%`,
          top: `${(i * 17 + 10) % 90}%`,
          opacity: 0.12,
        }}
        animate={{
          y: [0, -24, 0, 12, 0],
          rotate: [0, 15, -10, 5, 0],
          opacity: [0.08, 0.18, 0.08],
        }}
        transition={{
          duration: 5 + (i % 4),
          repeat: Infinity,
          delay: i * 0.4,
          ease: 'easeInOut',
        }}
      >
        {p}
      </motion.span>
    ))}
  </div>
);

// ─── Member card ──────────────────────────────────────────────────────────────

const IdleMemberCard = ({ member }: { member: Member }) => {
  const { tasks } = useFamilyStore();
  const memberTasks = tasks.filter(t => t.assignedTo === member.id);
  const done = memberTasks.filter(t => t.completed).length;
  const total = memberTasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const allDone = done === total && total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/15 min-w-[140px]"
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl overflow-hidden border-3 shadow-xl"
          style={{ borderColor: member.color, borderWidth: 3 }}
        >
          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
        </div>
        {allDone && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg text-sm"
          >
            ⭐
          </motion.div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="font-black text-white text-base leading-none">{member.name}</p>
        <p className="text-white/50 text-xs font-medium mt-0.5">{member.displayName}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: member.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <p className="text-white/50 text-[10px] font-bold text-center mt-1">
          {done}/{total} chores
        </p>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1">
        <LuStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="font-black text-amber-300 text-sm">{member.points}</span>
        <span className="text-white/40 text-xs">XP</span>
      </div>
    </motion.div>
  );
};

// ─── Idle Screen ──────────────────────────────────────────────────────────────

interface IdleScreenProps {
  onWake: () => void;
}

export const IdleScreen = ({ onWake }: IdleScreenProps) => {
  const { group, members, tasks } = useFamilyStore();
  const now = useLiveClock();

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const [hours, minutesAndPeriod] = timeStr.split(':');
  const [minutes, period] = minutesAndPeriod.split(' ');

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const totalDone = tasks.filter(t => t.completed).length;
  const totalXP = tasks.filter(t => t.completed).reduce((s, t) => s + t.points, 0);

  const greetingKey = getGreetingKey();
  const greeting = GREETINGS[greetingKey];

  const BACKGROUNDS: Record<string, string> = {
    morning: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', // turquoise/teal
    afternoon: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', // sunset orange/pink
    evening: 'linear-gradient(135deg, #0c1a2e 0%, #0a3d4a 40%, #1a1040 100%)', // dark night
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={onWake}
      onTouchStart={onWake}
      className="fixed inset-0 z-999 flex flex-col items-center justify-between overflow-hidden cursor-pointer select-none"
      style={{
        background: BACKGROUNDS[greetingKey],
      }}
    >
      <FloatingParticles />

      {/* Top row: date */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 pt-8 text-center"
      >
        <p className="text-white/40 font-bold text-sm uppercase tracking-[0.2em]">{dateStr}</p>
      </motion.div>

      {/* Center: clock + greeting */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">

        {/* Clock */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex items-end gap-1"
        >
          <span className="font-black text-white leading-none"
            style={{ fontSize: 'clamp(5rem, 10vw, 8rem)', letterSpacing: '-0.03em' }}>
            {hours}
          </span>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="font-black text-primary leading-none pb-2"
            style={{ fontSize: 'clamp(4rem, 8vw, 6rem)' }}>
            :
          </motion.span>
          <span className="font-black text-white leading-none"
            style={{ fontSize: 'clamp(5rem, 10vw, 8rem)', letterSpacing: '-0.03em' }}>
            {minutes}
          </span>
          <span className="font-black text-white/40 pb-3 ml-1 text-3xl">{period}</span>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-black text-white leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {greeting.emoji} {greeting.text},
          </h1>
          <h1 className="font-black leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#00CED1' }}>
            {group?.name || 'Familia'}!
          </h1>
        </motion.div>

        {/* Today's summary pill */}
        {totalDone > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 px-6 py-3 bg-white/10 rounded-full border border-white/15 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-lg">✅</span>
              <span className="font-bold text-sm">{totalDone} chores done today</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <LuZap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-black text-amber-300 text-sm">+{totalXP} XP earned</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Member cards */}
      <div className="relative z-10 flex gap-4 px-6 pb-4 flex-wrap justify-center">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <IdleMemberCard member={member} />
          </motion.div>
        ))}
      </div>

      {/* Wake hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ delay: 1, duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 pb-6 text-center"
      >
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
          ✦ Tap anywhere to continue ✦
        </p>
      </motion.div>
    </motion.div>
  );
};
