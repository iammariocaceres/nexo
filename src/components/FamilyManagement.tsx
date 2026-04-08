import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuUsers, LuShield, LuUser, LuStar, LuTrash2,
  LuSquareCheck, LuTrophy, LuPlus, LuX, LuPencil, LuPencilLine
} from 'react-icons/lu';
import { useFamilyStore, type TimeSlot, type Member } from '../store/useFamilyStore';

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

import { AvatarPickerModal } from './AvatarPickerModal';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

const MembersPanel = () => {
  const { members, removeMember, updateMember, addMember } = useFamilyStore();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});

  // Add state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', displayName: '', role: 'member' as const, emoji: '😎', color: '#3b82f6', avatar_url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=new' });

  // Avatar picker state
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarTarget, setAvatarTarget] = useState<'edit' | 'add' | null>(null);

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateMember(editingId, editForm);
    setEditingId(null);
  };

  const handleSaveAdd = () => {
    if (!addForm.name.trim()) return;
    addMember(addForm);
    setShowAddForm(false);
    setAddForm({ name: '', displayName: '', role: 'member', emoji: '😎', color: '#3b82f6', avatar_url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=new' });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg">
      <SectionHeader
        icon={LuUsers}
        title="Family Members"
        subtitle={`${members.length} members in your family`}
        action={
          <button
            onClick={() => setShowAddForm(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-md shadow-primary/30 hover:scale-105 transition-transform"
          >
            <LuPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        }
      />

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden flex flex-col gap-3"
          >
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 bg-white" style={{ borderColor: addForm.color }}>
                <img src={addForm.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setAvatarTarget('add'); setAvatarPickerOpen(true); }}
                  className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-tl-lg shadow-sm focus:outline-none"
                >
                  <LuPlus className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 rounded-xl text-sm border font-bold" placeholder="First Name" />
                <input value={addForm.displayName} onChange={e => setAddForm(f => ({ ...f, displayName: e.target.value }))} className="px-3 py-2 rounded-xl text-sm border font-medium" placeholder="Display (e.g. Dad)" />
                <select value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value as any }))} className="px-3 py-2 rounded-xl text-sm border bg-white col-span-2">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <input value={addForm.emoji} onChange={e => setAddForm(f => ({ ...f, emoji: e.target.value }))} className="w-14 items-center text-center px-2 py-2 rounded-xl border" maxLength={2} placeholder="😎" />
              <div className="flex items-center gap-1.5 flex-1 px-3 py-2 border rounded-xl bg-white overflow-x-auto">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setAddForm(f => ({ ...f, color: c }))} className={`w-5 h-5 rounded-full shrink-0 ${addForm.color === c ? 'ring-2 ring-offset-1 ring-slate-800' : ''}`} style={{ backgroundColor: c }} />
                ))}
                {/* Custom Color Wheel Bubble */}
                <div
                  className={`relative w-5 h-4 rounded-full shrink-0 overflow-hidden ${!COLORS.includes(addForm.color) ? 'ring-2 ring-offset-1 ring-slate-800' : ''}`}
                  style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                  title="Pick a custom color"
                >
                  <input
                    type="color"
                    value={addForm.color}
                    onChange={e => setAddForm(f => ({ ...f, color: e.target.value }))}
                    className="absolute -top-4 -left-4 w-12 h-12 cursor-pointer opacity-0"
                  />
                </div>
              </div>
              <button onClick={handleSaveAdd} className="px-4 py-2 bg-primary text-white rounded-xl font-black text-sm">Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {members.map(member => {
          const isEditing = editingId === member.id;

          return (
            <motion.div
              key={member.id}
              layout
              className={`flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border ${isEditing ? 'border-primary shadow-sm' : 'border-slate-100'}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 bg-white" style={{ borderColor: isEditing && editForm.color ? editForm.color : member.color }}>
                  <img src={isEditing && editForm.avatar_url ? editForm.avatar_url : member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                </div>
                {isEditing && (
                  <button onClick={() => { setAvatarTarget('edit'); setAvatarPickerOpen(true); }} className="absolute -bottom-1 -right-1 p-1 bg-slate-800 text-white rounded-full shadow-md z-10 w-6 h-6 flex items-center justify-center border border-white">
                    <LuPlus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Info or Edit Form */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={editForm.name ?? member.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="px-2 py-1.5 rounded-lg text-xs border font-bold" placeholder="Name" />
                      <input value={editForm.displayName ?? member.displayName} onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))} className="px-2 py-1.5 rounded-lg text-xs border font-medium" placeholder="Display" />
                    </div>
                    <div className="flex gap-2">
                      <select value={editForm.role ?? member.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as any }))} className="px-2 py-1.5 rounded-lg text-xs border bg-white flex-1">
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <input value={editForm.emoji ?? member.emoji} onChange={e => setEditForm(f => ({ ...f, emoji: e.target.value }))} className="w-10 text-center px-1 rounded-lg border text-sm" maxLength={2} />
                    </div>
                    {/* Color picker small */}
                    <div className="flex items-center gap-1 mt-1 overflow-x-auto py-1">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setEditForm(f => ({ ...f, color: c }))} className={`w-4 h-4 rounded-full shrink-0 ${editForm.color === c || (!editForm.color && member.color === c) ? 'ring-2 ring-offset-1 ring-slate-800' : ''}`} style={{ backgroundColor: c }} />
                      ))}
                      {/* Custom Color Wheel Bubble */}
                      <div
                        className={`relative w-4 h-4 rounded-full shrink-0 overflow-hidden ${editForm.color && !COLORS.includes(editForm.color) ? 'ring-2 ring-offset-1 ring-slate-800' : ''}`}
                        style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                        title="Pick a custom color"
                      >
                        <input
                          type="color"
                          value={editForm.color ?? member.color}
                          onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                          className="absolute -top-4 -left-4 w-12 h-12 cursor-pointer opacity-0"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* XP or Save */}
              {!isEditing && (
                <div className="flex items-center gap-1 shrink-0 px-2 lg:px-4">
                  <LuStar className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-black text-slate-700 text-sm hidden md:inline">{member.points}</span>
                  <span className="text-[10px] text-slate-400 hidden md:inline">XP</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                {isEditing ? (
                  <>
                    <button onClick={handleSaveEdit} className="p-2 bg-primary text-white hover:bg-cyan-600 rounded-xl transition-all">
                      <LuSquareCheck className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-xl transition-all">
                      <LuX className="w-4 h-4" />
                    </button>
                  </>
                ) : confirmDelete === member.id ? (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-row items-center gap-1">
                    <button onClick={() => { removeMember(member.id); setConfirmDelete(null); }} className="px-2 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-black">Del</button>
                    <button onClick={() => setConfirmDelete(null)} className="p-1.5 hover:bg-slate-200 rounded-xl"><LuX className="w-3 h-3 text-slate-500" /></button>
                  </motion.div>
                ) : (
                  <>
                    <motion.button onClick={() => { setEditingId(member.id); setEditForm({}); }} className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all h-full self-stretch flex items-center">
                      <LuPencilLine className="w-4 h-4" />
                    </motion.button>
                    <motion.button onClick={() => setConfirmDelete(member.id)} className="p-2 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-all h-full self-stretch flex items-center">
                      <LuTrash2 className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AvatarPickerModal
        isOpen={avatarPickerOpen}
        memberName="this member"
        onSelect={(url) => {
          if (avatarTarget === 'add') setAddForm(f => ({ ...f, avatar_url: url }));
          if (avatarTarget === 'edit') setEditForm(f => ({ ...f, avatar_url: url }));
        }}
        onClose={() => setAvatarPickerOpen(false)}
      />
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
  const { rewards, removeReward, addReward } = useFamilyStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', emoji: '🎁', description: '', cost: 100, category: 'Fun' });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addReward(form);
    setShowForm(false);
    setForm({ title: '', emoji: '🎁', description: '', cost: 100, category: 'Fun' });
  };
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg">
      <SectionHeader
        icon={LuTrophy}
        title="Available Rewards"
        subtitle={`${rewards.length} rewards in the store`}
        action={
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-200 hover:scale-105 transition-transform"
          >
            <LuPlus className="w-3.5 h-3.5" />
            New Reward
          </button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                className="col-span-1 px-3 py-2 rounded-xl border border-slate-200 font-bold text-center text-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Emoji"
                maxLength={2}
              />
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="col-span-1 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Reward title..."
              />
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Short description..."
              />
              <div className="flex items-center gap-2">
                <LuStar className="w-4 h-4 text-amber-400" />
                <input
                  type="number"
                  value={form.cost}
                  onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="Cost XP"
                  min={1}
                />
              </div>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                <option value="Fun">Fun</option>
                <option value="Food">Food</option>
                <option value="Screen Time">Screen Time</option>
                <option value="Special">Special</option>
              </select>
              <button
                onClick={handleAdd}
                className="col-span-2 py-2 bg-amber-400 text-white rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-transform shadow-md mt-1"
              >
                Create Reward 🎁
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <p className="text-sm text-slate-500 font-medium">{group?.name || 'Familia'} · {admins.map(a => a.name).join(' & ')} manage here ⚙️</p>
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