import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MemberRole = 'admin' | 'member';
export type TimeSlot = 'morning' | 'afternoon' | 'night';

export interface Member {
  id: string;
  name: string;
  displayName: string;   // e.g. "Dad", "Mum", "Daughter"
  role: MemberRole;
  avatar_url: string;
  color: string;          // hex color for this member's accent
  emoji: string;          // fun emoji for this member
  points: number;         // current XP balance
}

export interface Task {
  id: string;
  title: string;
  emoji: string;
  points: number;
  completed: boolean;
  timeSlot: TimeSlot;
  assignedTo: string;    // memberId
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mario',
    name: 'Mario',
    displayName: 'Dad',
    role: 'admin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mario&backgroundColor=b6e3f4',
    color: '#3B82F6',
    emoji: '👨‍💼',
    points: 120,
  },
  {
    id: 'yoris',
    name: 'Yoris',
    displayName: 'Mum',
    role: 'admin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yoris&backgroundColor=d1d4f9',
    color: '#8B5CF6',
    emoji: '👩',
    points: 80,
  },
  {
    id: 'diana',
    name: 'Diana',
    displayName: 'Daughter',
    role: 'member',
    avatar_url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Diana',
    color: '#F472B6',
    emoji: '🌸',
    points: 30,
  },
];

const INITIAL_TASKS: Task[] = [
  // ── Mario ──────────────────────────────────────────────────────────────────
  { id: 't1', title: 'Prepare breakfast', emoji: '🍳', points: 20, completed: false, timeSlot: 'morning', assignedTo: 'mario' },
  { id: 't2', title: 'Empty the dishwasher', emoji: '🍽️', points: 15, completed: true, timeSlot: 'morning', assignedTo: 'mario' },
  { id: 't3', title: 'Take out the trash', emoji: '🗑️', points: 20, completed: false, timeSlot: 'afternoon', assignedTo: 'mario' },
  { id: 't4', title: 'Vacuum the living room', emoji: '🧹', points: 25, completed: false, timeSlot: 'afternoon', assignedTo: 'mario' },
  { id: 't5', title: 'Check homework', emoji: '📋', points: 15, completed: false, timeSlot: 'night', assignedTo: 'mario' },

  // ── Yoris ──────────────────────────────────────────────────────────────────
  { id: 't6', title: 'Do the laundry', emoji: '👕', points: 30, completed: false, timeSlot: 'morning', assignedTo: 'yoris' },
  { id: 't7', title: 'Write the grocery list', emoji: '📝', points: 10, completed: true, timeSlot: 'morning', assignedTo: 'yoris' },
  { id: 't8', title: 'Cook dinner', emoji: '🍲', points: 35, completed: false, timeSlot: 'afternoon', assignedTo: 'yoris' },
  { id: 't9', title: 'Water the plants', emoji: '🌱', points: 15, completed: false, timeSlot: 'afternoon', assignedTo: 'yoris' },
  { id: 't10', title: 'Tidy up the kitchen', emoji: '🫧', points: 20, completed: false, timeSlot: 'night', assignedTo: 'yoris' },

  // ── Diana ──────────────────────────────────────────────────────────────────
  { id: 't11', title: 'Make your bed', emoji: '🛏️', points: 10, completed: true, timeSlot: 'morning', assignedTo: 'diana' },
  { id: 't12', title: 'Brush your teeth', emoji: '🦷', points: 5, completed: false, timeSlot: 'morning', assignedTo: 'diana' },
  { id: 't13', title: 'Pack your backpack', emoji: '🎒', points: 10, completed: false, timeSlot: 'morning', assignedTo: 'diana' },
  { id: 't14', title: 'Do your homework', emoji: '📚', points: 20, completed: false, timeSlot: 'afternoon', assignedTo: 'diana' },
  { id: 't15', title: 'Tidy up your room', emoji: '🧸', points: 15, completed: false, timeSlot: 'afternoon', assignedTo: 'diana' },
  { id: 't16', title: 'Bath time', emoji: '🛁', points: 10, completed: false, timeSlot: 'night', assignedTo: 'diana' },
  { id: 't17', title: 'Read for 15 minutes', emoji: '📖', points: 15, completed: false, timeSlot: 'night', assignedTo: 'diana' },
];

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', title: 'Movie Night', emoji: '🎬', description: 'You pick what we watch for family movie night!', cost: 100, category: 'Fun' },
  { id: 'r2', title: 'Pizza Night', emoji: '🍕', description: 'Choose your favorite pizza toppings for everyone!', cost: 300, category: 'Food' },
  { id: 'r3', title: '30min Extra Tablet Time', emoji: '📱', description: 'Half an hour of extra games or YouTube.', cost: 80, category: 'Screen Time' },
  { id: 'r4', title: 'Choose Your Dessert', emoji: '🍦', description: 'Pick any dessert or ice cream you want!', cost: 60, category: 'Food' },
  { id: 'r5', title: 'Stay Up 30min Late', emoji: '🌙', description: 'Go to bed 30 minutes after your usual bedtime.', cost: 120, category: 'Special' },
  { id: 'r6', title: 'Pick Weekend Adventure', emoji: '🎡', description: 'You choose what the family does this weekend!', cost: 400, category: 'Special' },
  { id: 'r7', title: 'No Chores Day', emoji: '🏖️', description: 'One free day with no chores assigned — enjoy!', cost: 250, category: 'Special' },
  { id: 'r8', title: 'Sleepover Party', emoji: '🛌', description: 'Invite a friend for a sleepover this weekend.', cost: 500, category: 'Fun' },
];

const INITIAL_GROUP: FamilyGroup = {
  id: '1',
  name: 'The Caceres Family',
};

// ─── Store Interface ──────────────────────────────────────────────────────────

interface FamilyState {
  group: FamilyGroup;
  members: Member[];
  tasks: Task[];
  rewards: Reward[];

  // Task actions
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  removeTask: (taskId: string) => void;

  // Reward actions
  redeemReward: (rewardId: string, memberId: string) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  removeReward: (rewardId: string) => void;

  // Member actions
  addMember: (member: Omit<Member, 'id' | 'points'>) => void;
  removeMember: (memberId: string) => void;

  // Helpers
  getMemberById: (id: string) => Member | undefined;
  getMemberTasks: (memberId: string) => Task[];
  getTotalPointsEarnedToday: () => number;
  resetDailyTasks: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      group: INITIAL_GROUP,
      members: INITIAL_MEMBERS,
      tasks: INITIAL_TASKS,
      rewards: INITIAL_REWARDS,

      completeTask: (taskId) => set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return state;
        return {
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
          members: state.members.map(m =>
            m.id === task.assignedTo ? { ...m, points: m.points + task.points } : m
          ),
        };
      }),

      uncompleteTask: (taskId) => set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || !task.completed) return state;
        return {
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, completed: false } : t),
          members: state.members.map(m =>
            m.id === task.assignedTo ? { ...m, points: Math.max(0, m.points - task.points) } : m
          ),
        };
      }),

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: `t${Date.now()}`, completed: false }],
      })),

      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
      })),

      redeemReward: (rewardId, memberId) => set((state) => {
        const reward = state.rewards.find(r => r.id === rewardId);
        const member = state.members.find(m => m.id === memberId);
        if (!reward || !member || member.points < reward.cost) return state;
        return {
          members: state.members.map(m =>
            m.id === memberId ? { ...m, points: m.points - reward.cost } : m
          ),
        };
      }),

      addReward: (reward) => set((state) => ({
        rewards: [...state.rewards, { ...reward, id: `r${Date.now()}` }],
      })),

      removeReward: (rewardId) => set((state) => ({
        rewards: state.rewards.filter(r => r.id !== rewardId),
      })),

      addMember: (member) => set((state) => ({
        members: [...state.members, { ...member, id: `m${Date.now()}`, points: 0 }],
      })),

      removeMember: (memberId) => set((state) => ({
        members: state.members.filter(m => m.id !== memberId),
        tasks: state.tasks.filter(t => t.assignedTo !== memberId),
      })),

      getMemberById: (id) => get().members.find(m => m.id === id),

      getMemberTasks: (memberId) => get().tasks.filter(t => t.assignedTo === memberId),

      getTotalPointsEarnedToday: () => {
        const { tasks, members } = get();
        return tasks
          .filter(t => t.completed)
          .reduce((sum, t) => sum + t.points, 0);
      },

      resetDailyTasks: () => set((state) => ({
        tasks: state.tasks.map(t => ({ ...t, completed: false })),
      })),
    }),
    { name: 'nexo-family-storage' }
  )
);