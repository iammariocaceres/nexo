import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSun, LuCloudSun, LuMoon,
  LuCircleCheck, LuCircle, LuStar, LuPlus, LuPartyPopper
} from 'react-icons/lu';
import { useFamilyStore, type Task, type Member, type TimeSlot } from '../store/useFamilyStore';
import { useEffect } from 'react';

// ─── Completion Modal ─────────────────────────────────────────────────────────

interface CompletionModalProps {
  task: Task;
  member: Member;
  onConfirm: () => void;
  onCancel: () => void;
}

const CompletionModal = ({ task, member, onConfirm, onCancel }: CompletionModalProps) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.7, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Member avatar */}
        <div
          className="w-24 h-24 rounded-3xl mx-auto mb-4 overflow-hidden border-4 shadow-xl"
          style={{ borderColor: member.color }}
        >
          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
        </div>

        {/* Task emoji */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl mb-3"
        >
          {task.emoji}
        </motion.div>

        <h2 className="text-xl font-black text-slate-800 mb-1">
          Is this you, <span style={{ color: member.color }}>{member.name}</span>? 👋
        </h2>
        <p className="text-slate-500 font-medium text-sm mb-2">"{task.title}"</p>

        {/* XP reward */}
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full mb-6">
          <LuStar className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="font-black text-amber-700">+{task.points} XP</span>
          <span className="text-amber-600 text-sm">reward</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: member.color, boxShadow: `0 10px 30px ${member.color}40` }}
          >
            <LuPartyPopper className="w-6 h-6" />
            Yes, I did it! 🎉
          </motion.button>

          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors text-sm"
          >
            Not me — go back
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Time Slot Header ─────────────────────────────────────────────────────────

const TIME_SLOT_CONFIG = {
  morning:   { label: 'Morning',   icon: LuSun,      color: 'text-amber-600 bg-amber-50 border-amber-100',  dot: 'bg-amber-400' },
  afternoon: { label: 'Afternoon', icon: LuCloudSun,  color: 'text-sky-600 bg-sky-50 border-sky-100',        dot: 'bg-sky-400'   },
  night:     { label: 'Night',     icon: LuMoon,      color: 'text-indigo-600 bg-indigo-50 border-indigo-100', dot: 'bg-indigo-400' },
};

const TimeSlotHeader = ({ type }: { type: TimeSlot }) => {
  const { label, icon: Icon, color } = TIME_SLOT_CONFIG[type];
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl mb-3 border w-fit ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-black uppercase tracking-wider">{label}</span>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  memberColor: string;
  onTap: (task: Task) => void;
}

const TaskCard = ({ task, memberColor, onTap }: TaskCardProps) => {
  const [justCompleted, setJustCompleted] = useState(false);

  // Dynamic daily completion check
  const todayStr = new Date().toDateString();
  const isCompleted = !!(task.completedAt && new Date(task.completedAt).toDateString() === todayStr);

  const handleTap = () => {
    if (isCompleted) return;
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 600);
    onTap(task);
  };

  return (
    <motion.div
      layout
      whileTap={!isCompleted ? { scale: 0.97 } : {}}
      onClick={handleTap}
      className={`
        relative group flex items-center gap-3 p-3.5 mb-2.5 rounded-2xl border-2 transition-all
        ${isCompleted
          ? 'bg-slate-50 border-slate-100 opacity-70'
          : 'bg-white border-slate-100 cursor-pointer hover:shadow-md active:scale-[0.98]'
        }
      `}
      style={!isCompleted ? { borderColor: 'transparent' } : {}}
    >
      {/* Task emoji */}
      <span className={`text-2xl select-none ${isCompleted ? 'grayscale' : ''}`}>{task.emoji}</span>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm leading-tight ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <LuStar className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-slate-400">+{task.points} XP</span>
        </div>
      </div>

      {/* Completion toggle */}
      <motion.div
        animate={justCompleted ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } : {}}
        className="shrink-0 w-8 h-8 flex items-center justify-center"
      >
        {isCompleted ? (
          <LuCircleCheck className="w-7 h-7 text-emerald-500 fill-emerald-100" />
        ) : (
          <LuCircle
            className="w-7 h-7 transition-colors"
            style={{ color: '#e2e8f0' }}
          />
        )}
      </motion.div>

      {/* Hover glow effect for incomplete tasks */}
      {!isCompleted && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2"
          style={{ borderColor: memberColor }}
        />
      )}
    </motion.div>
  );
};

// ─── Member Column ────────────────────────────────────────────────────────────

interface MemberColumnProps {
  member: Member;
  onTaskTap: (task: Task, member: Member) => void;
}

const MemberColumn = ({ member, onTaskTap }: MemberColumnProps) => {
  const { tasks } = useFamilyStore();
  
  const JS_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = JS_DAYS[new Date().getDay()];
  const todayStr = new Date().toDateString();
  
  const memberTasks = tasks.filter(t => t.assignedTo === member.id && t.days.includes(currentDay));
  const completedCount = memberTasks.filter(t => !!(t.completedAt && new Date(t.completedAt).toDateString() === todayStr)).length;
  const isAllDone = completedCount === memberTasks.length && memberTasks.length > 0;

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <div className="flex items-center gap-3 mb-4 p-4 bg-white/60 rounded-2xl border border-white/40">
        <div
          className="w-12 h-12 rounded-2xl overflow-hidden border-3 shadow-md"
          style={{ borderColor: member.color, borderWidth: 3 }}
        >
          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-slate-800 text-base leading-none">{member.name}</h3>
          <p className="text-xs font-medium mt-0.5" style={{ color: member.color }}>
            {member.emoji} {member.displayName}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-black text-sm text-slate-700">{completedCount}/{memberTasks.length}</p>
          {isAllDone && <span className="text-xs">🌟 Done!</span>}
        </div>
      </div>

      {/* Tasks by time slot */}
      {(['morning', 'afternoon', 'night'] as TimeSlot[]).map(slot => {
        const slotTasks = memberTasks.filter(t => t.timeSlot === slot);
        if (slotTasks.length === 0) return null;
        return (
          <section key={slot} className="mb-4">
            <TimeSlotHeader type={slot} />
            {slotTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                memberColor={member.color}
                onTap={(t) => onTaskTap(t, member)}
              />
            ))}
          </section>
        );
      })}

      {/* Add task button (admin shortcut — auth gate TBD) */}
      <button className="mt-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 hover:border-primary/40 hover:text-primary/60 transition-all flex items-center justify-center gap-2 group">
        <LuPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
        <span className="text-xs font-bold">Add Chore</span>
      </button>
    </div>
  );
};

// ─── Confetti Burst ───────────────────────────────────────────────────────────

const ConfettiBurst = ({ color }: { color: string }) => {
  const particles = ['⭐', '✨', '🌟', '💫', '🎉', '🎊'];
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
          animate={{
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            opacity: 0,
            scale: 1.5,
          }}
          transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
          style={{ color }}
        >
          {p}
        </motion.div>
      ))}
    </div>
  );
};

// ─── Task Board ───────────────────────────────────────────────────────────────

export const TaskBoard = () => {
  const { members, completeTask } = useFamilyStore();
  const [pendingTask, setPendingTask] = useState<{ task: Task; member: Member } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiColor, setConfettiColor] = useState('#00CED1');
  const [, setTick] = useState(0);

  // Force re-render every minute so tasks naturally "reset" right at midnight
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskTap = (task: Task, member: Member) => {
    setPendingTask({ task, member });
  };

  const handleConfirm = () => {
    if (!pendingTask) return;
    completeTask(pendingTask.task.id);
    setConfettiColor(pendingTask.member.color);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 900);
    setPendingTask(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">Today's Chores</h1>
          <p className="text-sm text-slate-500 font-medium">Tap a chore to mark it complete! ✅</p>
        </div>
        <span className="text-3xl animate-bounce">🧹</span>
      </div>

      {/* 3-column board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {members.map(member => (
          <MemberColumn
            key={member.id}
            member={member}
            onTaskTap={handleTaskTap}
          />
        ))}
      </div>

      {/* Completion modal */}
      {pendingTask && (
        <CompletionModal
          task={pendingTask.task}
          member={pendingTask.member}
          onConfirm={handleConfirm}
          onCancel={() => setPendingTask(null)}
        />
      )}

      {/* Confetti burst */}
      {showConfetti && <ConfettiBurst color={confettiColor} />}
    </div>
  );
};