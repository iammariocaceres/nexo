
import { motion } from 'framer-motion';
import { LuStar, LuZap, LuLogOut } from 'react-icons/lu';
import { useFamilyStore } from '../store/useFamilyStore';
import { useAuthStore } from '../store/useAuthStore';

const GREETINGS = {
  morning: { text: 'Good morning', emoji: '☀️' },
  afternoon: { text: 'Good afternoon', emoji: '🌤️' },
  evening: { text: 'Good evening', emoji: '🌙' },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS.morning;
  if (hour < 18) return GREETINGS.afternoon;
  return GREETINGS.evening;
}

export const AppHeader = () => {
  const { group, members, tasks } = useFamilyStore();
  const { signOut } = useAuthStore();

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const totalPointsToday = tasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.points, 0);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-xl border-b border-white/20 relative z-40">
      {/* Left: Brand + Greeting */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-linear-to-br from-primary to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white font-black text-base">N</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-black text-slate-800 leading-none text-base">Nexo</p>
            <p className="text-[9px] font-bold text-primary tracking-widest uppercase leading-none mt-0.5">Family Hub</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 hidden md:block" />

        {/* Greeting */}
        <div className="hidden md:block">
          <p className="font-black text-slate-800 text-sm leading-tight">
            {greeting.emoji} {greeting.text}, <span className="text-primary">{group.name.split(' ')[1] || group.name}!</span>
          </p>
          <p className="text-xs text-slate-400 font-medium">{today}</p>
        </div>
      </div>

      {/* Center: Family name on tablet */}
      <div className="hidden lg:flex flex-col items-center">
        <p className="font-black text-slate-700 text-sm">{group.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-primary to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs text-slate-400 font-bold">{completedCount}/{totalCount} done</span>
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex items-center gap-3">
        {/* Member Avatars */}
        <div className="hidden sm:flex items-center -space-x-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm"
              title={`${member.name} — ${member.points} XP`}
              style={{ borderColor: member.color }}
            >
              <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Total XP Today */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <LuStar className="w-4 h-4 text-amber-500 fill-amber-400" />
          <div>
            <span className="font-black text-amber-700 text-sm">{totalPointsToday}</span>
            <span className="text-amber-600 text-xs font-medium ml-1 hidden sm:inline">XP today</span>
          </div>
        </motion.div>

        {/* Family total XP */}
        <motion.div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full"
        >
          <LuZap className="w-4 h-4 text-emerald-500 fill-emerald-400" />
          <span className="font-black text-emerald-700 text-sm">
            {members.reduce((s, m) => s + m.points, 0)}
          </span>
          <span className="text-emerald-600 text-xs font-medium hidden lg:inline">family XP</span>
        </motion.div>

        {/* Sign out */}
        <button
          onClick={() => signOut()}
          title="Sign out"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100"
        >
          <LuLogOut className="w-4 h-4" />
          <span className="text-xs font-bold hidden lg:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
};

