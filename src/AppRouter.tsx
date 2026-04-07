import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';

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

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"           element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"  element={wrap(Dashboard)} />
      <Route path="/calendar"   element={wrap(FamilyCalendar)} />
      <Route path="/chores"     element={wrap(TaskBoard)} />
      <Route path="/rewards"    element={wrap(RewardsStore)} />
      <Route path="/management" element={wrap(FamilyManagement)} />
      <Route path="*"           element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);
