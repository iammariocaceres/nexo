import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuUsers, LuShield, LuUser, LuStar, LuTrash2,
  LuSquareCheck, LuTrophy, LuPlus, LuX
} from 'react-icons/lu';
import { useFamilyStore, type TimeSlot } from '../store/useFamilyStore';

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle, action }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="font-black text-slate-800 text-base">{title}</h2>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

// ─── Members Panel ────────────────────────────────────────────────────────────

const MembersPanel = () => {
  const { members, removeMember } = useFamilyStore();
  const [confirm, setConfirm] = useState<string | null>(null);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg">
      <SectionHeader
        icon={LuUsers}
        title="Family Members"
        subtitle={`${members.length} members in your family`}
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-md shadow-primary/30 hover:scale-105 transition-transform">
            <LuPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        }
      />

      <div className="flex flex-col gap-3">
        {members.map(member => (
          <motion.div
            key={member.id}
            layout
            className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100"
          >
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0"
              style={{ borderColor: member.color }}
            >
              <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-black text-slate-800">{member.name}</p>
                <span className="text-lg">{member.emoji}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                  style={{ backgroundColor: `${member.color}20`, color: member.color }}
                >
                  {member.role === 'admin' ? <LuShield className="w-3 h-3" /> : <LuUser className="w-3 h-3" />}
                  {member.role}
                </div>
                <p className="text-xs text-slate-400 font-medium">{member.displayName}</p>
              </div>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 shrink-0">
              <LuStar className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-black text-slate-700 text-sm">{member.points}</span>
              <span className="text-xs text-slate-400">XP</span>
            </div>

            {/* Remove */}
            <AnimatePresence mode="wait">
              {confirm === member.id ? (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                  <button
                    onClick={() => { removeMember(member.id); setConfirm(null); }}
                    className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-black"
                  >
                    Confirm
                  </button>
                  <button onClick={() => setConfirm(null)} className="p-1.5 hover:bg-slate-200 rounded-xl transition-colors">
                    <LuX className="w-4 h-4 text-slate-500" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="delete"
                  onClick={() => setConfirm(member.id)}
                  className="p-2 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <LuTrash2 className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Tasks Panel ──────────────────────────────────────────────────────────────

const TasksPanel = () => {
  const { tasks, members, removeTask } = useFamilyStore();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { addTask } = useFamilyStore();

  const [form, setForm] = useState({ title: '', emoji: '✅', points: 10, timeSlot: 'morning' as TimeSlot, assignedTo: members[0]?.id ?? '' });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask(form);
    setShowForm(false);
    setForm({ title: '', emoji: '✅', points: 10, timeSlot: 'morning', assignedTo: members[0]?.id ?? '' });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg">
      <SectionHeader
        icon={LuSquareCheck}
        title="Chores & Tasks"
        subtitle={`${tasks.length} tasks total · ${tasks.filter(t => t.completed).length} completed today`}
        action={
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-md shadow-primary/30 hover:scale-105 transition-transform"
          >
            <LuPlus className="w-3.5 h-3.5" />
            New Task
          </button>
        }
      />

      {/* Add task form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                className="col-span-1 px-3 py-2 rounded-xl border border-slate-200 font-bold text-center text-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Emoji"
                maxLength={2}
              />
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="col-span-1 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Task title..."
              />
              <div className="flex items-center gap-2">
                <LuStar className="w-4 h-4 text-amber-400" />
                <input
                  type="number"
                  value={form.points}
                  onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="XP points"
                  min={1}
                />
              </div>
              <select
                value={form.assignedTo}
                onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select
                value={form.timeSlot}
                onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value as TimeSlot }))}
                className="px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              >
                <option value="morning">☀️ Morning</option>
                <option value="afternoon">🌤️ Afternoon</option>
                <option value="night">🌙 Night</option>
              </select>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-white rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-transform shadow-md"
              >
                Add Task ✅
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {tasks.map(task => {
          const member = members.find(m => m.id === task.assignedTo);
          return (
            <motion.div key={task.id} layout className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xl">{task.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.title}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {member?.name} · {task.timeSlot} · +{task.points} XP
                  {task.completed && ' · ✅ Completed'}
                </p>
              </div>
              <AnimatePresence mode="wait">
                {confirm === task.id ? (
                  <motion.div key="confirm" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                    <button onClick={() => { removeTask(task.id); setConfirm(null); }} className="px-2 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-black">Del</button>
                    <button onClick={() => setConfirm(null)} className="p-1 hover:bg-slate-200 rounded-lg"><LuX className="w-3 h-3 text-slate-500" /></button>
                  </motion.div>
                ) : (
                  <motion.button key="delete" onClick={() => setConfirm(task.id)} className="p-1.5 text-slate-300 hover:text-rose-400 transition-colors">
                    <LuTrash2 className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Rewards Panel ────────────────────────────────────────────────────────────

const RewardsPanel = () => {
  const { rewards, removeReward } = useFamilyStore();
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg">
      <SectionHeader
        icon={LuTrophy}
        title="Available Rewards"
        subtitle={`${rewards.length} rewards in the store`}
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-200 hover:scale-105 transition-transform">
            <LuPlus className="w-3.5 h-3.5" />
            New Reward
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-2">
        {rewards.map(reward => (
          <div key={reward.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-2xl shrink-0">{reward.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-700 text-xs leading-tight truncate">{reward.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <LuStar className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black text-amber-600">{reward.cost} XP</span>
              </div>
            </div>
            <button onClick={() => removeReward(reward.id)} className="p-1.5 text-slate-200 hover:text-rose-400 transition-colors shrink-0">
              <LuTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Family Management ────────────────────────────────────────────────────────

export const FamilyManagement = () => {
  const { group, members } = useFamilyStore();
  const admins = members.filter(m => m.role === 'admin');

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-linear-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
          <LuShield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">Family Admin Panel</h1>
          <p className="text-sm text-slate-500 font-medium">{group.name} · {admins.map(a => a.name).join(' & ')} manage here ⚙️</p>
        </div>
      </div>

      {/* Admin notice */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <span className="text-2xl">🔐</span>
        <p className="text-sm font-bold text-amber-700">
          This section is for family admins only. Please make sure an adult is managing this.
        </p>
      </div>

      {/* Management panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MembersPanel />
        <RewardsPanel />
      </div>
      <TasksPanel />
    </div>
  );
};