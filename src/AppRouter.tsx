import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PinGate } from './components/PinGate';
import { useIsMobile } from './hooks/useIsMobile';

// Lazy-loaded screens
const Dashboard        = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const FamilyCalendar   = React.lazy(() => import('./components/FamilyCalendar').then(m => ({ default: m.FamilyCalendar })));
const TaskBoard        = React.lazy(() => import('./components/TaskBoard').then(m => ({ default: m.TaskBoard })));
const RewardsStore     = React.lazy(() => import('./components/RewardsStore').then(m => ({ default: m.RewardsStore })));
const FamilyManagement = React.lazy(() => import('./components/FamilyManagement').then(m => ({ default: m.FamilyManagement })));

const LoadingView = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const wrap = (Screen: React.ComponentType) => (
  <Layout>
    <Suspense fallback={<LoadingView />}>
      <Screen />
    </Suspense>
  </Layout>
);

const MobileRedirect = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <Navigate to="/management" replace />;
  }
  return <>{children}</>;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"           element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"  element={<MobileRedirect>{wrap(Dashboard)}</MobileRedirect>} />
      <Route path="/calendar"   element={<MobileRedirect>{wrap(FamilyCalendar)}</MobileRedirect>} />
      <Route path="/chores"     element={<MobileRedirect>{wrap(TaskBoard)}</MobileRedirect>} />
      <Route path="/rewards"    element={<MobileRedirect>{wrap(RewardsStore)}</MobileRedirect>} />
      <Route path="/management" element={<PinGate>{wrap(FamilyManagement)}</PinGate>} />
      <Route path="*"           element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

