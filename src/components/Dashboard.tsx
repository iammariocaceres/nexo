import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LuStar, LuTrophy, LuZap, LuCalendar, LuFlame, LuRepeat } from 'react-icons/lu';
import { useFamilyStore, getEventsForDay, isTaskActive, type Member, type CalendarEvent } from '../store/useFamilyStore';
import { formatEventTime } from '../lib/dateUtils';

// ─── Member Progress Card ─────────────────────────────────────────────────────

const MemberCard = ({ member }: { member: Member }) => {
  const { tasks } = useFamilyStore();
  const JS_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = JS_DAYS[new Date().getDay()];
  const JS_TODAY = new Date().toDateString();
  const today = new Date();

  const memberTasks = tasks.filter(t => t.assignedTo === member.id && t.days.includes(currentDay) && isTaskActive(t, today));
  const completed = memberTasks.filter(t => !!(t.completedAt && new Date(t.completedAt).toDateString() === JS_TODAY)).length;
  const total = memberTasks.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  const todayEarned = memberTasks
    .filter(t => !!(t.completedAt && new Date(t.completedAt).toDateString() === JS_TODAY))
    .reduce((s, t) => s + t.points, 0);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg flex flex-col gap-3 cursor-default"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-14 h-14 rounded-2xl overflow-hidden shadow-md"
            style={{ border: `3px solid ${member.color}` }}
          >
            <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
          </div>
          {completed === total && total > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-md"
            >
              <span className="text-xs">⭐</span>
            </motion.div>
          )}
        </div>
        <div>
          <h3 className="font-black text-slate-800 text-base leading-tight">{member.name}</h3>
          <p className="text-xs font-medium" style={{ color: member.color }}>{member.displayName}</p>
        </div>
        <div className="ml-auto text-2xl">{member.emoji}</div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
          <span>{completed} / {total} chores</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: member.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <LuStar className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-black text-slate-800 text-sm">{member.points}</span>
          <span className="text-xs text-slate-400 font-medium">XP balance</span>
        </div>
        {todayEarned > 0 && (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            <LuZap className="w-3 h-3 text-green-500" />
            <span className="text-xs font-black text-green-600">+{todayEarned} today</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────

const Leaderboard = () => {
  const { members, tasks } = useFamilyStore();
  const JS_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = JS_DAYS[new Date().getDay()];
  const JS_TODAY = new Date().toDateString();

  const ranked = [...members]
    .map(m => ({
      ...m,
      todayXP: tasks.filter(t => t.assignedTo === m.id && t.days.includes(currentDay) && !!(t.completedAt && new Date(t.completedAt).toDateString() === JS_TODAY)).reduce((s, t) => s + t.points, 0),
    }))
    .sort((a, b) => b.todayXP - a.todayXP);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-linear-to-br from-primary to-cyan-600 rounded-3xl p-5 text-white shadow-xl shadow-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <LuTrophy className="w-5 h-5 text-yellow-300" />
        <h3 className="font-black text-base uppercase tracking-tight">Today's Leaders</h3>
        <span className="text-lg ml-auto">🏆</span>
      </div>
      <div className="flex flex-col gap-3">
        {ranked.map((member, idx) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10"
          >
            <span className="text-xl min-w-[28px]">{medals[idx] || `${idx + 1}`}</span>
            <img src={member.avatar_url} alt={member.name} className="w-9 h-9 rounded-full border-2 border-white/30" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{member.name}</p>
              <p className="text-xs text-white/60">{member.displayName}</p>
            </div>
            <div className="flex items-center gap-1 text-yellow-300 shrink-0">
              <LuStar className="w-3.5 h-3.5 fill-yellow-300" />
              <span className="font-black text-sm">{member.todayXP}</span>
              <span className="text-white/50 text-xs">XP</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Quick Stats ──────────────────────────────────────────────────────────────

const QuickStats = () => {
  const { tasks } = useFamilyStore();
  const JS_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = JS_DAYS[new Date().getDay()];
  const JS_TODAY = new Date().toDateString();
  const today = new Date();
  const todaysTasks = tasks.filter(t => t.days.includes(currentDay) && isTaskActive(t, today));

  const totalCompleted = todaysTasks.filter(t => !!(t.completedAt && new Date(t.completedAt).toDateString() === JS_TODAY)).length;
  const totalTasks = todaysTasks.length;
  const totalEarned = todaysTasks.filter(t => !!(t.completedAt && new Date(t.completedAt).toDateString() === JS_TODAY)).reduce((s, t) => s + t.points, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Chores Done', value: `${totalCompleted}/${totalTasks}`, emoji: '✅', color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
        { label: 'XP Earned Today', value: `+${totalEarned}`, emoji: '⚡', color: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
        { label: 'Day Streak', value: '3 days', emoji: '🔥', color: 'bg-rose-50 border-rose-100', text: 'text-rose-700' },
      ].map(stat => (
        <motion.div
          key={stat.label}
          whileHover={{ scale: 1.03 }}
          className={`${stat.color} border rounded-2xl p-3 flex items-center gap-3`}
        >
          <span className="text-2xl">{stat.emoji}</span>
          <div>
            <p className={`font-black text-base ${stat.text}`}>{stat.value}</p>
            <p className={`text-[10px] font-bold ${stat.text} opacity-70 uppercase tracking-wide`}>{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Helpers removed, now imported from dateUtils and useFamilyStore

const UpcomingEvents = () => {
  const { events } = useFamilyStore();

  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expanded: { ev: CalendarEvent; date: Date; label: string }[] = [];
    const lookaheadDays = 14;

    for (let i = 0; i < lookaheadDays; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);

      const dayEvents = getEventsForDay(events, targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

      dayEvents.forEach(ev => {
        let label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `In ${i} days`;
        if (ev.time) label += ` at ${formatEventTime(ev.time)}`;

        expanded.push({ ev, date: new Date(targetDate), label });
      });
    }

    return expanded
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 4);
  }, [events]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <LuCalendar className="w-5 h-5 text-primary" />
        <h3 className="font-black text-slate-800 text-base">Upcoming Events</h3>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-slate-400 text-sm font-medium text-center py-4">No upcoming events 🎉</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {upcoming.map(({ ev, label }, idx) => {
            return (
              <div key={`${ev.id}-${idx}`} className={`flex items-center gap-3 p-3 rounded-2xl border ${ev.color} border-opacity-50`}>
                <span className="text-xl shrink-0">{ev.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${ev.text_color} flex items-center gap-1.5`}>
                    {ev.title}
                    {ev.isRecurring && <LuRepeat className="w-3 h-3 opacity-60" />}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const Dashboard = () => {
  const { members } = useFamilyStore();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">Family Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Here's everyone's progress for today 🌟</p>
        </div>
        <LuFlame className="w-8 h-8 text-rose-400 fill-rose-400 ml-auto animate-pulse" />
      </div>

      <QuickStats />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {members.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Leaderboard />
        <UpcomingEvents />
      </div>
    </div>
  );
};
