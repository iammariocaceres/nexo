import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuChevronLeft, LuChevronRight, LuPlus, LuX, LuCalendar, LuTrash2 } from 'react-icons/lu';
import { useFamilyStore, type CalendarEvent } from '../store/useFamilyStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const EMOJI_OPTIONS = ['📅', '🎉', '🎂', '✈️', '🏕️', '🍕', '🎬', '🦷', '💃', '🎭', '⚽️', '🛒', '🎮', '👨‍👩‍👧‍👦', '🏖️', '🎄'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Parse "YYYY-MM-DD" safely to local visual interpretation (ignoring GMT offsets)
const parseDateString = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  return {
    year: parseInt(y, 10),
    month: parseInt(m, 10) - 1, // 0-indexed
    day: parseInt(d, 10),
  };
};

const getEventsForDay = (events: CalendarEvent[], year: number, month: number, day: number) => {
  return events.filter(ev => {
    const d = parseDateString(ev.date);
    return d.year === year && d.month === month && d.day === day;
  });
};

// ─── Event Modal ──────────────────────────────────────────────────────────────

interface EventModalProps {
  onClose: () => void;
  onSave: (data: { title: string; date: string; emoji: string }) => void;
  defaultDate?: string; // YYYY-MM-DD
}

const EventModal = ({ onClose, onSave, defaultDate }: EventModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [emoji, setEmoji] = useState('📅');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({ title: title.trim(), date, emoji });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-slate-800 text-lg">Add Family Event</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Pizza Night"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Icon</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                className="w-full sm:w-16 h-16 text-center text-3xl bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all shrink-0"
                placeholder="📅"
                title="Type any emoji"
              />
              <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                {EMOJI_OPTIONS.slice(0, 10).map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`text-xl p-2 rounded-xl border-2 transition-all flex items-center justify-center ${emoji === em ? 'border-primary bg-primary/10 scale-110' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                      }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || !date}
            className="mt-2 w-full bg-primary text-white font-black py-3.5 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            Create Event
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Day Cell ─────────────────────────────────────────────────────────────────

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  events: CalendarEvent[];
  onSelect: (day: number) => void;
}

const DayCell = ({ day, isToday, events, onSelect }: DayCellProps) => {
  if (day === null) {
    return <div className="h-16 sm:h-20 rounded-xl" />;
  }

  const hasEvents = events.length > 0;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(day)}
      className={`
        h-16 sm:h-20 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex flex-col items-center transition-all relative overflow-hidden
        ${isToday
          ? 'bg-primary text-white shadow-lg shadow-primary/30 font-black'
          : hasEvents
            ? 'bg-white border-2 border-slate-100 hover:border-primary/30 hover:shadow-md'
            : 'hover:bg-white/60 border border-transparent'
        }
      `}
    >
      <span className={`text-xs sm:text-sm font-bold leading-none mt-0.5 sm:mt-1 ${isToday ? 'text-white' : 'text-slate-700'}`}>
        {day}
      </span>

      {/* Event dots & titles */}
      {hasEvents && (
        <div className="flex flex-col gap-0.5 w-full mt-1 px-0.5 relative overflow-hidden h-full">
          {events.slice(0, 2).map((ev, i) => (
            <div key={i} className={`flex items-center justify-center sm:justify-start gap-1 w-full rounded pl-0.5 sm:px-1 py-0.5 min-h-0 overflow-hidden ${isToday ? 'bg-black/10' : 'bg-slate-50'}`} title={ev.title}>
              <span className="text-[10px] sm:text-xs leading-none shrink-0">{ev.emoji}</span>
              <span className={`text-[8px] sm:text-[9px] font-bold truncate hidden sm:block leading-tight ${isToday ? 'text-white' : ev.text_color}`}>
                {ev.title}
              </span>
            </div>
          ))}
          {events.length > 2 && (
            <div className={`text-[9px] leading-none font-bold mx-auto mt-0.5 ${isToday ? 'text-white/80' : 'text-slate-400'}`}>
              +{events.length - 2}
            </div>
          )}
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
  onAddEventClick: () => void;
  onRemoveEvent: (id: string) => void;
}

const EventPanel = ({ day, month, year, events, onClose, onAddEventClick, onRemoveEvent }: EventPanelProps) => {
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
            <button
              onClick={onAddEventClick}
              className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-colors"
            >
              <LuPlus className="w-3.5 h-3.5" />
              Add Event
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {events.map((ev) => (
              <div
                key={ev.id}
                className={`flex items-center gap-3 p-3 rounded-2xl ${ev.color} group`}
              >
                <span className="text-xl shrink-0">{ev.emoji}</span>
                <p className={`font-bold text-sm flex-1 ${ev.text_color}`}>{ev.title}</p>
                <button
                  onClick={() => onRemoveEvent(ev.id)}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white text-rose-500`}
                  title="Remove event"
                >
                  <LuTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={onAddEventClick}
              className="mt-1 flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-400 hover:text-primary hover:border-primary/30 transition-colors w-fit"
            >
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

const UpcomingSidebar = ({ events, onAddEventClick }: {
  events: CalendarEvent[];
  onAddEventClick: () => void;
}) => {
  // Compute upcoming safely
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter(ev => {
        const d = parseDateString(ev.date);
        const evDate = new Date(d.year, d.month, d.day);
        return evDate >= today;
      })
      .sort((a, b) => {
        const d1 = parseDateString(a.date);
        const d2 = parseDateString(b.date);
        return new Date(d1.year, d1.month, d1.day).getTime() - new Date(d2.year, d2.month, d2.day).getTime();
      })
      .slice(0, 6);
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
        <p className="text-slate-400 text-sm font-medium text-center py-4">All clear! No upcoming events 🎉</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {upcoming.map(ev => {
            const d = parseDateString(ev.date);
            const evDate = new Date(d.year, d.month, d.day);
            const diffDays = Math.round((evDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            const dateLabel = diffDays === 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;

            return (
              <motion.div
                key={ev.id}
                whileHover={{ x: 3 }}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${ev.color} border-opacity-50`}
              >
                <span className="text-xl shrink-0">{ev.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${ev.text_color}`}>{ev.title}</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {MONTH_NAMES[d.month]} {d.day} · <span className="font-bold">{dateLabel}</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <button
        onClick={onAddEventClick}
        className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 hover:border-primary/40 hover:text-primary/60 transition-all flex items-center justify-center gap-2 text-sm font-bold group"
      >
        <LuPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
        Add Family Event
      </button>
    </div>
  );
};

// ─── Family Calendar ──────────────────────────────────────────────────────────

export const FamilyCalendar = () => {
  const { events, addEvent, removeEvent } = useFamilyStore();

  const todayDate = new Date();
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  // Build calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

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

  const handleAddEventClick = (day?: number) => {
    if (day) {
      // Format YYYY-MM-DD
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      setModalDefaultDate(`${viewYear}-${mStr}-${dStr}`);
    } else {
      setModalDefaultDate(undefined);
    }
    setIsModalOpen(true);
  };

  const handleSaveEvent = (data: { title: string; date: string; emoji: string }) => {
    addEvent(data);
    setIsModalOpen(false);
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
                  day === todayDate.getDate() &&
                  viewMonth === todayDate.getMonth() &&
                  viewYear === todayDate.getFullYear()
                }
                events={day !== null ? getEventsForDay(events, viewYear, viewMonth, day) : []}
                onSelect={(d) => setSelectedDay(d)}
              />
            ))}
          </motion.div>

          {/* Selected day panel (inline, below grid) */}
          <AnimatePresence>
            {selectedDay !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <EventPanel
                  day={selectedDay}
                  month={viewMonth}
                  year={viewYear}
                  events={getEventsForDay(events, viewYear, viewMonth, selectedDay)}
                  onClose={() => setSelectedDay(null)}
                  onAddEventClick={() => handleAddEventClick(selectedDay)}
                  onRemoveEvent={removeEvent}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <UpcomingSidebar events={events} onAddEventClick={() => handleAddEventClick()} />
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <EventModal
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveEvent}
            defaultDate={modalDefaultDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};