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
}

export interface Reward {
  id: string;
  title: string;
  emoji: string;
  description: string;
  cost: number;
  category: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface FamilyState {
  group: FamilyGroup | null;
  members: Member[];
  tasks: Task[];
  rewards: Reward[];
  isLoading: boolean;
  hasFetchedOnce: boolean;

  // Supabase Sync Actions
  fetchFamilyData: (userId: string) => Promise<void>;
  setupFamily: (userId: string, data: SetupData) => Promise<void>;

  // Local & Remote Actions (Optimistic UI)
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  removeTask: (taskId: string) => void;

  redeemReward: (rewardId: string, memberId: string) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  removeReward: (rewardId: string) => void;

  addMember: (member: Omit<Member, 'id' | 'points'>) => void;
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
        completed: completedTaskIds.has(t.id),
      }));

      // Fetch Rewards
      const { data: rewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('family_id', userId);

      set({
        group: group || null,
        members: members?.map(m => ({ ...m, displayName: m.display_name, avatar_url: m.avatar_url })) || [],
        tasks: tasksWithStatus,
        rewards: rewards || [],
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
    // Not implemented fully here, just a mock for UI to keep working
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: `t${Date.now()}`, completed: false }],
    }));
  },

  removeTask: async (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== taskId),
    }));
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
    set((state) => ({
      rewards: [...state.rewards, { ...reward, id: `r${Date.now()}` }],
    }));
  },

  removeReward: async (rewardId) => {
    set((state) => ({
      rewards: state.rewards.filter(r => r.id !== rewardId),
    }));
  },

  addMember: async (member) => {
    set((state) => ({
      members: [...state.members, { ...member, id: `m${Date.now()}`, points: 0 }],
    }));
  },

  removeMember: async (memberId) => {
    set((state) => ({
      members: state.members.filter(m => m.id !== memberId),
      tasks: state.tasks.filter(t => t.assignedTo !== memberId),
    }));
  },

  getMemberById: (id) => get().members.find(m => m.id === id),

  getMemberTasks: (memberId) => get().tasks.filter(t => t.assignedTo === memberId),

  getTotalPointsEarnedToday: () => {
    const { tasks } = get();
    return tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.points, 0);
  },
}));