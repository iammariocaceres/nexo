import React from 'react';
import { AppHeader } from './AppHeader';
import { BottomNavBar } from './BottomNavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-nexo-light font-plus-jakarta overflow-hidden">
      {/* Compact top header */}
      <AppHeader />

      {/* Main scrollable content area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 relative z-10">
        {children}
      </main>

      {/* Bottom navigation (tablet / PWA optimized) */}
      <BottomNavBar />

      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed top-0 right-0 -z-0 w-96 h-96 bg-cyan-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="pointer-events-none fixed bottom-0 left-0 -z-0 w-80 h-80 bg-amber-50/40 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
      <div className="pointer-events-none fixed bottom-1/2 right-1/4 -z-0 w-64 h-64 bg-pink-50/30 rounded-full blur-[80px]" />
    </div>
  );
};

