import React from 'react';
import { LuBell, LuSearch, LuStar, LuCloudSun } from 'react-icons/lu';

export const TopAppBar = () => {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <header className="flex justify-between items-center w-full px-12 py-8 bg-transparent">
      {/* Search & Greeting */}
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-96 group">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar tareas o eventos..."
            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
          />
        </div>

        <div className="hidden xl:block">
          <p className="text-slate-500 font-medium capitalize">{today}</p>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-6">
        {/* Weather Widget */}
        <div className="flex items-center gap-3 px-5 py-2 bg-amber-50 border border-amber-100 rounded-full text-amber-700 shadow-sm">
          <LuCloudSun className="w-5 h-5" />
          <span className="font-bold text-sm">24°C Despejado</span>
        </div>

        {/* Global XP / Points */}
        <div className="flex items-center gap-3 px-5 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 shadow-sm">
          <LuStar className="w-5 h-5 fill-emerald-500" />
          <span className="font-bold text-sm">1,250 XP Familia</span>
        </div>

        {/* Notifications */}
        <button className="relative p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
          <LuBell className="w-6 h-6 text-slate-600" />
          <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Quick Action Button */}
        <button className="px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
          Check-in Familiar
        </button>
      </div>
    </header>
  );
};