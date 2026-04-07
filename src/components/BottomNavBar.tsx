import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuLayoutDashboard,
  LuCalendar,
  LuSquareCheck,
  LuTrophy,
  LuSettings,
} from 'react-icons/lu';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home',     icon: LuLayoutDashboard, route: '/dashboard',  emoji: '🏠' },
  { id: 'calendar',  label: 'Calendar', icon: LuCalendar,        route: '/calendar',   emoji: '📅' },
  { id: 'chores',    label: 'Chores',   icon: LuSquareCheck,     route: '/chores',     emoji: '✅' },
  { id: 'rewards',   label: 'Rewards',  icon: LuTrophy,          route: '/rewards',    emoji: '🏆' },
  { id: 'admin',     label: 'Manage',   icon: LuSettings,        route: '/management', emoji: '⚙️' },
];

export const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeRoute = location.pathname;

  return (
    <nav
      className="relative z-50 flex items-center justify-around bg-white/80 backdrop-blur-xl border-t border-white/40 shadow-2xl shadow-slate-900/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeRoute === item.route || (activeRoute === '/' && item.route === '/dashboard');

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.route)}
            className="relative flex flex-col items-center justify-center flex-1 py-3 min-h-[64px] transition-colors group"
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active background pill */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-x-3 inset-y-1.5 bg-primary/10 rounded-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </AnimatePresence>

            {/* Icon */}
            <motion.div
              animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative z-10"
            >
              {isActive ? (
                <span className="text-2xl leading-none">{item.emoji}</span>
              ) : (
                <Icon
                  className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors"
                />
              )}
            </motion.div>

            {/* Label */}
            <motion.span
              animate={isActive ? { color: '#00CED1', fontWeight: '800' } : { color: '#94a3b8', fontWeight: '500' }}
              className="text-[10px] mt-1 relative z-10 tracking-wide"
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.span>

            {/* Active dot */}
            {isActive && (
              <motion.div
                layoutId="nav-dot"
                className="absolute bottom-2 w-1 h-1 rounded-full bg-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
