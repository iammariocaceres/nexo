import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { SetupData } from '../components/SetupWizard';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MemberRole = 'admin' | 'member';
export type TimeSlot = 'morning' | 'afternoon' | 'night';

export interface Member {
  id: string;
  name: string;
  displayName: string;
  role: MemberRole;
  avatar_url: string;
  color: string;
  emoji: string;
  points: number;
}

export interface Task {
  id: string;
  title: string;
  emoji: string;
  points: number;
  completed: boolean; // Virtual property, calculated from task_completions
  timeSlot: TimeSlot;
  assignedTo: string;
  days: string[];
}

export interface Reward {
  id: string;
  title: string;
  emoji: string;
  description: string;
  cost: number;
  category: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  emoji: string;
  color: string;
  text_color: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  admin_pin: string;
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface FamilyState {
  group: FamilyGroup | null;
  members: Member[];
  tasks: Task[];
  rewards: Reward[];
  events: CalendarEvent[];
  isLoading: boolean;
  hasFetchedOnce: boolean;

  // Group actions
  updateFamilyName: (newName: string) => Promise<void>;
  resetAllPoints: () => Promise<void>;

  // Supabase Sync Actions
  fetchFamilyData: (userId: string) => Promise<void>;
  setupFamily: (userId: string, data: SetupData) => Promise<void>;

  // Local & Remote Actions (Optimistic UI)
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;

  redeemReward: (rewardId: string, memberId: string) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  removeReward: (rewardId: string) => void;

  addEvent: (event: Omit<CalendarEvent, 'id' | 'color' | 'text_color'>) => void;
  removeEvent: (eventId: string) => void;

  addMember: (member: Omit<Member, 'id' | 'points'>) => void;
  updateMember: (memberId: string, updates: Partial<Member>) => void;
  removeMember: (memberId: string) => void;

  // Helpers
  getMemberById: (id: string) => Member | undefined;
  getMemberTasks: (memberId: string) => Task[];
  getTotalPointsEarnedToday: () => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFamilyStore = create<FamilyState>()((set, get) => ({
  group: null,
  members: [],
  tasks: [],
  rewards: [],
  events: [],
  isLoading: true,
  hasFetchedOnce: false,

  fetchFamilyData: async (userId) => {
    set({ isLoading: true });

    try {
      // Fetch Family Group
      const { data: group } = await supabase
        .from('family_groups')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Fetch Members
      const { data: members } = await supabase
        .from('members')
        .select('*')
        .eq('family_id', userId);

      // Fetch Tasks
      const { data: rawTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', userId);

      // Fetch completed tasks for today to calculate the `completed` boolean
      const todayString = new Date().toISOString().split('T')[0];
      const { data: completions } = await supabase
        .from('task_completions')
        .select('task_id')
        .eq('family_id', userId)
        .gte('completed_at', `${todayString}T00:00:00Z`);

      const completedTaskIds = new Set(completions?.map(c => c.task_id) || []);

      const tasksWithStatus = (rawTasks || []).map(t => ({
        id: t.id,
        title: t.title,
        emoji: t.emoji,
        points: t.points,
        timeSlot: t.time_slot,
        assignedTo: t.assigned_to,
        days: t.days_of_week || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        completed: completedTaskIds.has(t.id),
      }));

      // Fetch Rewards
      const { data: rewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('family_id', userId);

      // Fetch Events
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', userId);

      set({
        group: group || null,
        members: members?.map(m => ({ ...m, displayName: m.display_name, avatar_url: m.avatar_url })) || [],
        tasks: tasksWithStatus,
        rewards: rewards || [],
        events: events || [],
        isLoading: false,
        hasFetchedOnce: true,
      });
    } catch (e) {
      console.error('Failed to fetch family data from Supabase', e);
      set({ isLoading: false, hasFetchedOnce: true });
    }
  },

  setupFamily: async (userId, data) => {
    set({ isLoading: true });
    try {
      // 1. Upsert family group (creates it if trigger missed it for old users)
      await supabase
        .from('family_groups')
        .upsert({ id: userId, name: data.familyName, admin_pin: data.adminPin });

      // 2. Insert members
      const membersToInsert = data.members.map(m => ({
        family_id: userId,
        name: m.name,
        display_name: m.displayName,
        role: m.role,
        avatar_url: m.avatar_url,
        color: m.color,
        emoji: m.emoji,
        points: 0,
      }));

      await supabase.from('members').insert(membersToInsert);

      // Reload
      await get().fetchFamilyData(userId);
    } catch (e) {
      console.error('Failed to setup family', e);
      set({ isLoading: false });
    }
  },

  completeTask: async (taskId) => {
    const state = get();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.completed || !state.group) return;

    // Optimistic UI
    set({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
      members: state.members.map(m =>
        m.id === task.assignedTo ? { ...m, points: m.points + task.points } : m
      ),
    });

    // Supabase update (Historial + points)
    await supabase.from('task_completions').insert({
      family_id: state.group.id,
      task_id: taskId,
      member_id: task.assignedTo,
      awarded_points: task.points,
    });
    
    const member = state.members.find(m => m.id === task.assignedTo);
    if (member) {
      await supabase.from('members').update({ points: member.points + task.points }).eq('id', member.id);
    }
  },

  uncompleteTask: async (taskId) => {
    // Note: undoing completition is harder with a completions table. 
    // For now we'll just optimistically update the UI, but in a real app 
    // we would delete the completion record.
    const state = get();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || !task.completed) return;

    set({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: false } : t),
      members: state.members.map(m =>
        m.id === task.assignedTo ? { ...m, points: Math.max(0, m.points - task.points) } : m
      ),
    });
    
    // In background: fetch today's completion and delete it
    // then update member points... this is omitted for simplicity in this prototype.
  },

  addTask: async (task) => {
    const state = get();
    if (!state.group) return;

    // Supabase Insert taking advantage of the table triggers
    const { data, error } = await supabase.from('tasks').insert({
      family_id: state.group.id,
      assigned_to: task.assignedTo,
      title: task.title,
      emoji: task.emoji,
      points: task.points,
      time_slot: task.timeSlot,
      days_of_week: task.days,
    }).select('*').single();

    if (error || !data) {
      console.error('Failed to add task', error);
      return;
    }

    set({
      tasks: [...state.tasks, {
        id: data.id,
        title: data.title,
        emoji: data.emoji,
        points: data.points,
        timeSlot: data.time_slot,
        assignedTo: data.assigned_to,
        days: data.days_of_week || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        completed: false, // brand new tasks are incomplete
      }],
    });
  },

  updateTask: async (taskId, updates) => {
    const state = get();
    if (!state.group) return;

    // Optimistic cache
    set({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    });

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
    if (updates.points !== undefined) dbUpdates.points = updates.points;
    if (updates.timeSlot !== undefined) dbUpdates.time_slot = updates.timeSlot;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.days !== undefined) dbUpdates.days_of_week = updates.days;

    await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
  },

  removeTask: async (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
    }));
    await supabase.from('tasks').delete().eq('id', taskId);
  },

  redeemReward: async (rewardId, memberId) => {
    const state = get();
    const reward = state.rewards.find(r => r.id === rewardId);
    const member = state.members.find(m => m.id === memberId);
    if (!reward || !member || member.points < reward.cost || !state.group) return;

    set({
      members: state.members.map(m =>
        m.id === memberId ? { ...m, points: m.points - reward.cost } : m
      ),
    });

    // Record redemption
    await supabase.from('reward_redemptions').insert({
      family_id: state.group.id,
      reward_id: rewardId,
      member_id: memberId,
      spent_points: reward.cost,
    });

    await supabase.from('members').update({ points: member.points - reward.cost }).eq('id', memberId);
  },

  addReward: async (reward) => {
    const state = get();
    if (!state.group) return;

    const { data, error } = await supabase.from('rewards').insert({
      family_id: state.group.id,
      title: reward.title,
      emoji: reward.emoji,
      description: reward.description,
      cost: reward.cost,
      category: reward.category,
    }).select('*').single();

    if (error || !data) {
      console.error('Failed to add reward', error);
      return;
    }

    set({
      rewards: [...state.rewards, {
        id: data.id,
        title: data.title,
        emoji: data.emoji,
        description: data.description,
        cost: data.cost,
        category: data.category,
      }],
    });
  },

  removeReward: async (rewardId) => {
    set((state) => ({
      rewards: state.rewards.filter(r => r.id !== rewardId),
    }));
  },

  addEvent: async (event) => {
    const state = get();
    if (!state.group) return;

    // Random pastel color logic
    const COLORS = [
      { color: 'bg-pink-100', text_color: 'text-pink-700' },
      { color: 'bg-cyan-100', text_color: 'text-cyan-700' },
      { color: 'bg-orange-100', text_color: 'text-orange-700' },
      { color: 'bg-purple-100', text_color: 'text-purple-700' },
      { color: 'bg-amber-100', text_color: 'text-amber-700' },
      { color: 'bg-indigo-100', text_color: 'text-indigo-700' },
      { color: 'bg-emerald-100', text_color: 'text-emerald-700' },
      { color: 'bg-sky-100', text_color: 'text-sky-700' },
    ];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const { data, error } = await supabase.from('calendar_events').insert({
      family_id: state.group.id,
      title: event.title,
      date: event.date,
      time: event.time || null,
      emoji: event.emoji,
      color: randomColor.color,
      text_color: randomColor.text_color,
    }).select('*').single();

    if (error || !data) {
      console.error('Failed to add event', error);
      return;
    }

    set({
      events: [...state.events, data],
    });
  },

  removeEvent: async (eventId) => {
    set((state) => ({
      events: state.events.filter(e => e.id !== eventId),
    }));
    await supabase.from('calendar_events').delete().eq('id', eventId);
  },

  addMember: async (member) => {
    const state = get();
    if (!state.group) return;

    const dbInsert = {
      family_id: state.group.id,
      name: member.name,
      display_name: member.displayName,
      role: member.role,
      avatar_url: member.avatar_url,
      color: member.color,
      emoji: member.emoji,
      points: 0
    };

    const { data, error } = await supabase.from('members').insert(dbInsert).select('*').single();

    if (error || !data) {
      console.error('Failed to add member', error);
      return;
    }

    set((state) => ({
      members: [...state.members, { ...member, id: data.id, points: 0 }],
    }));
  },

  updateMember: async (memberId, updates) => {
    const state = get();
    const existing = state.members.find(m => m.id === memberId);
    if (!existing || !state.group) return;

    // Safety check: Cannot demote the last admin
    if (updates.role === 'member' && existing.role === 'admin') {
      const admins = state.members.filter(m => m.role === 'admin');
      if (admins.length <= 1) {
        alert('You cannot demote the last admin.');
        return;
      }
    }

    // Optimistic UI Output
    set({
      members: state.members.map(m => m.id === memberId ? { ...m, ...updates } : m)
    });

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;

    await supabase.from('members').update(dbUpdates).eq('id', memberId);
  },

  removeMember: async (memberId) => {
    const state = get();
    const existing = state.members.find(m => m.id === memberId);
    
    // Safety check: Cannot delete the last admin
    if (existing?.role === 'admin') {
      const admins = state.members.filter(m => m.role === 'admin');
      if (admins.length <= 1) {
        alert('You cannot delete the last admin.');
        return;
      }
    }

    set((state) => ({
      members: state.members.filter(m => m.id !== memberId),
      tasks: state.tasks.filter(t => t.assignedTo !== memberId),
    }));

    await supabase.from('members').delete().eq('id', memberId);
  },

  getMemberById: (id) => get().members.find(m => m.id === id),

  getMemberTasks: (memberId) => get().tasks.filter(t => t.assignedTo === memberId),

  getTotalPointsEarnedToday: () => {
    const { tasks } = get();
    return tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.points, 0);
  },

  updateFamilyName: async (newName: string) => {
    const state = get();
    if (!state.group) return;
    set({ group: { ...state.group, name: newName } });
    await supabase.from('family_groups').update({ name: newName }).eq('id', state.group.id);
  },

  resetAllPoints: async () => {
    const state = get();
    if (!state.group) return;
    
    // Optimistic UI update
    set({
      members: state.members.map(m => ({ ...m, points: 0 }))
    });
    
    await supabase.from('members').update({ points: 0 }).eq('family_id', state.group.id);
  },
}));