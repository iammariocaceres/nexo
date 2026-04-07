import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuChevronLeft, LuChevronRight, LuPlus, LuX, LuCalendar } from 'react-icons/lu';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  day: number;
  month: number;   // 0-indexed
  year: number;
  title: string;
  emoji: string;
  color: string;   // Tailwind bg color class
  textColor: string;
}

// ─── Mock Events ──────────────────────────────────────────────────────────────

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', day: 10, month: 3, year: 2026, title: "Diana's Dance Class", emoji: '💃', color: 'bg-pink-100', textColor: 'text-pink-700' },
  { id: 'e2', day: 15, month: 3, year: 2026, title: "Dentist — Leo 🦷",    emoji: '🦷', color: 'bg-cyan-100',  textColor: 'text-cyan-700'  },
  { id: 'e3', day: 18, month: 3, year: 2026, title: "Family Pizza Night",  emoji: '🍕', color: 'bg-orange-100',textColor: 'text-orange-700'},
  { id: 'e4', day: 22, month: 3, year: 2026, title: "School Play 🎭",      emoji: '🎭', color: 'bg-purple-100',textColor: 'text-purple-700'},
  { id: 'e5', day: 25, month: 3, year: 2026, title: "Mario's Birthday! 🎂",emoji: '🎂', color: 'bg-amber-100', textColor: 'text-amber-700' },
  { id: 'e6', day: 7,  month: 4, year: 2026, title: "Movie Night 🎬",      emoji: '🎬', color: 'bg-indigo-100',textColor: 'text-indigo-700'},
  { id: 'e7', day: 12, month: 4, year: 2026, title: "Camping Weekend 🏕️", emoji: '🏕️', color: 'bg-emerald-100',textColor: 'text-emerald-700'},
  { id: 'e8', day: 20, month: 4, year: 2026, title: "Yoris's Work Trip",  emoji: '✈️', color: 'bg-sky-100',    textColor: 'text-sky-700'   },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Day Cell ─────────────────────────────────────────────────────────────────

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  events: CalendarEvent[];
  onSelect: (day: number, events: CalendarEvent[]) => void;
}

const DayCell = ({ day, isToday, events, onSelect }: DayCellProps) => {
  if (day === null) {
    return <div className="aspect-square rounded-2xl" />;
  }

  const hasEvents = events.length > 0;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(day, events)}
      className={`
        aspect-square rounded-2xl p-1.5 flex flex-col items-center transition-all relative
        ${isToday
          ? 'bg-primary text-white shadow-lg shadow-primary/30 font-black'
          : hasEvents
            ? 'bg-white border-2 border-slate-100 hover:border-primary/30 hover:shadow-md'
            : 'hover:bg-white/60 border border-transparent'
        }
      `}
    >
      <span className={`text-sm font-bold leading-none mt-1 ${isToday ? 'text-white' : 'text-slate-700'}`}>
        {day}
      </span>

      {/* Event dots */}
      {hasEvents && (
        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
          {events.slice(0, 3).map((ev, i) => (
            <span key={i} className="text-[10px] leading-none">{ev.emoji}</span>
          ))}
        </div>
      )}
    </motion.button>
  );
};

// ─── Event Detail Panel ───────────────────────────────────────────────────────

interface EventPanelProps {
  day: number;
  month: number;
  year: number;
  events: CalendarEvent[];
  onClose: () => void;
}

const EventPanel = ({ day, month, year, events, onClose }: EventPanelProps) => {
  const dateLabel = new Date(year, month, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-slate-800 text-base">{dateLabel}</h3>
            <p className="text-xs text-slate-400 font-medium">
              {events.length > 0 ? `${events.length} event${events.length > 1 ? 's' : ''}` : 'No events'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <LuX className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-4xl block mb-2">📅</span>
            <p className="text-slate-400 font-medium text-sm">Nothing planned yet!</p>
            <button className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-colors">
              <LuPlus className="w-3.5 h-3.5" />
              Add Event
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {events.map(ev => (
              <div
                key={ev.id}
                className={`flex items-center gap-3 p-3 rounded-2xl ${ev.color}`}
              >
                <span className="text-xl shrink-0">{ev.emoji}</span>
                <p className={`font-bold text-sm ${ev.textColor}`}>{ev.title}</p>
              </div>
            ))}
            <button className="mt-1 flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-400 hover:text-primary hover:border-primary/30 transition-colors w-fit">
              <LuPlus className="w-3.5 h-3.5" />
              Add another
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Upcoming Events Sidebar ──────────────────────────────────────────────────

const UpcomingSidebar = ({ events }: {
  events: CalendarEvent[];
}) => {
  const today = new Date();
  const upcoming = events
    .filter(ev => {
      const d = new Date(ev.year, ev.month, ev.day);
      return d >= today;
    })
    .sort((a, b) => new Date(a.year, a.month, a.day).getTime() - new Date(b.year, b.month, b.day).getTime())
    .slice(0, 6);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <LuCalendar className="w-5 h-5 text-primary" />
        <h3 className="font-black text-slate-800 text-base">Upcoming Events</h3>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-slate-400 text-sm font-medium text-center py-4">All clear! No upcoming events 🎉</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {upcoming.map(ev => {
            const evDate = new Date(ev.year, ev.month, ev.day);
            const diffDays = Math.ceil((evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const dateLabel = diffDays === 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;

            return (
              <motion.div
                key={ev.id}
                whileHover={{ x: 3 }}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${ev.color} border-opacity-50`}
              >
                <span className="text-xl shrink-0">{ev.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${ev.textColor}`}>{ev.title}</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {MONTH_NAMES[ev.month]} {ev.day} · <span className="font-bold">{dateLabel}</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <button className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 hover:border-primary/40 hover:text-primary/60 transition-all flex items-center justify-center gap-2 text-sm font-bold group">
        <LuPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
        Add Family Event
      </button>
    </div>
  );
};

// ─── Family Calendar ──────────────────────────────────────────────────────────

export const FamilyCalendar = () => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [events]                  = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedDay, setSelectedDay] = useState<{ day: number; events: CalendarEvent[] } | null>(null);

  // Build calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth     = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (day: number) =>
    events.filter(e => e.day === day && e.month === viewMonth && e.year === viewYear);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">Family Calendar</h1>
          <p className="text-sm text-slate-500 font-medium">Plan your family's adventures together 🗓️</p>
        </div>
        <span className="text-3xl ml-auto animate-bounce">📅</span>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Calendar grid — takes 2/3 */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-lg">

          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={prevMonth}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <LuChevronLeft className="w-5 h-5 text-slate-500" />
            </motion.button>

            <motion.h2
              key={`${viewMonth}-${viewYear}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-black text-slate-800"
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </motion.h2>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <LuChevronRight className="w-5 h-5 text-slate-500" />
            </motion.button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <motion.div
            key={`${viewMonth}-${viewYear}-grid`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-7 gap-1"
          >
            {cells.map((day, i) => (
              <DayCell
                key={i}
                day={day}
                isToday={
                  day !== null &&
                  day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear()
                }
                events={day !== null ? eventsForDay(day) : []}
                onSelect={(d, evs) => setSelectedDay({ day: d, events: evs })}
              />
            ))}
          </motion.div>

          {/* Selected day panel (inline, below grid) */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <EventPanel
                  day={selectedDay.day}
                  month={viewMonth}
                  year={viewYear}
                  events={selectedDay.events}
                  onClose={() => setSelectedDay(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <UpcomingSidebar events={events} />
        </div>
      </div>
    </div>
  );
};