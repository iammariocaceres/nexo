import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { useAuthStore } from './store/useAuthStore';
import { useFamilyStore } from './store/useFamilyStore';
import { LoginScreen } from './components/LoginScreen';
import { AppRouter } from './AppRouter';
import { SetupWizard, type SetupData } from './components/SetupWizard';

// ─── Splash / loading ────────────────────────────────────────────────────────

const SplashScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="min-h-screen flex flex-col items-center justify-center"
    style={{ background: 'linear-gradient(135deg, #f0fdff 0%, #e0f8f4 40%, #f0f4ff 100%)' }}
  >
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-24 h-24 rounded-3xl bg-linear-to-br from-primary to-cyan-600 flex items-center justify-center shadow-2xl shadow-primary/30 mb-4"
    >
      <span className="text-white font-black text-5xl leading-none">N</span>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex gap-1.5 mt-2"
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/40"
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  </motion.div>
);

// ─── App root ─────────────────────────────────────────────────────────────────

import { UpdatePrompt } from './components/UpdatePrompt';

export default function App() {
  const { session, setSession } = useAuthStore();
  const { members, fetchFamilyData, setupFamily, hasFetchedOnce } = useFamilyStore();
  
  // `initializing` = true until Supabase resolves the real session for the first time
  const [initializing, setInitializing] = useState(true);

  // Sync Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession]);

  // Fetch Family Data when session changes
  useEffect(() => {
    if (session) {
      fetchFamilyData(session.user.id);
    }
  }, [session, fetchFamilyData]);

  const handleSetupComplete = async (data: SetupData) => {
    if (session) {
      await setupFamily(session.user.id, data);
    }
  };

  return (
    <>
      <UpdatePrompt />
      <AnimatePresence mode="wait">
        {initializing || (session && !hasFetchedOnce) ? (
          <SplashScreen key="splash" />
        ) : session ? (
          members.length === 0 ? (
            <SetupWizard key="setup" onComplete={handleSetupComplete} />
          ) : (
            <AppRouter key="app" />
          )
        ) : (
          <LoginScreen key="login" />
        )}
      </AnimatePresence>
    </>
  );
}