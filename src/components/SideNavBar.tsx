import React from 'react';
import { useFamilyStore } from '../store/useFamilyStore';
import { useNavigate } from 'react-router-dom';
import {
  LuLayoutDashboard,
  LuCalendar,
  LuSquareCheck,
  LuTrophy,
  LuSettings,
  LuLogOut,
  LuCirclePlus
} from 'react-icons/lu';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 w-full px-6 py-4 transition-all duration-300 group
      ${isActive
        ? 'bg-primary text-white rounded-full shadow-lg shadow-primary/30 scale-105'
        : 'text-slate-500 hover:bg-white/50 hover:text-primary rounded-full'
      }
    `}
  >
    <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
    <span className="font-bold tracking-tight">{label}</span>
  </button>
);

export const SideNavBar = () => {
  const { activeProfile, logout } = useFamilyStore();
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const navigate = useNavigate();
  const navItems = [
    { label: 'Dashboard', icon: LuLayoutDashboard, route: '/dashboard' },
    { label: 'Calendario', icon: LuCalendar, route: '/calendar' },
    { label: 'Tareas', icon: LuSquareCheck, route: '/chores' },
    { label: 'Premios', icon: LuTrophy, route: '/rewards' },
  ];

  return (
    <aside className="w-80 h-screen bg-white/70 backdrop-blur-xl border-r border-white/20 flex flex-col py-8 px-4 relative z-50">
      {/* Brand Logo */}
      <div className="px-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
            <span className="text-white font-black text-xl">H</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 leading-tight">Hearth</h2>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Family Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.label}
            onClick={() => { setActiveTab(item.label), navigate(item.route) }}
          />
        ))}

        <div className="mt-8 px-6">
          <button className="flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-opacity">
            <LuCirclePlus className="w-5 h-5" />
            <span>Nuevo Evento</span>
          </button>
        </div>
      </nav>

      {/* Footer / Profile */}
      <div className="mt-auto pt-8 border-t border-slate-100">
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={activeProfile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-primary/20"
            />
            <div className="overflow-hidden">
              <p className="font-bold text-slate-800 truncate">{activeProfile?.name || 'Usuario'}</p>
              <p className="text-xs text-slate-500 capitalize">{activeProfile?.role || 'Miembro'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-600 transition-colors font-medium text-sm w-full"
            onClick={() => { setActiveTab('Ajustes de Familia'), navigate('/management') }}
          >
            <LuSettings className="w-4 h-4" />
            <span>Ajustes de Familia</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-6 py-3 text-rose-400 hover:text-rose-600 transition-colors font-medium text-sm w-full"
          >
            <LuLogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
};