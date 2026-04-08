import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 left-6 sm:left-auto z-9999 bg-white border border-slate-200 p-5 rounded-3xl shadow-2xl flex flex-col gap-3 sm:max-w-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl shrink-0">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h3 className="font-black text-slate-800 leading-tight">Update Available!</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">A new version of Nexo is ready to be installed.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => setNeedRefresh(false)}
              className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
            >
              Later
            </button>
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-4 py-2 bg-primary text-white rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-transform shadow-md shadow-primary/30"
            >
              Update Now 🚀
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
