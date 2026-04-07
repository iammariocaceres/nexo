import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuMail, LuLock, LuEye, LuEyeOff, LuCircleAlert, LuLoader } from 'react-icons/lu';
import { useAuthStore } from '../store/useAuthStore';

// ─── Floating background particles ────────────────────────────────────────────

const BG_PARTICLES = ['🏠', '⭐', '✨', '🌟', '💪', '🎯', '🏆', '❤️', '🌸', '🎉'];

const FloatingBG = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {BG_PARTICLES.map((p, i) => (
      <motion.span
        key={i}
        className="absolute text-2xl select-none"
        style={{
          left: `${(i * 11 + 3) % 92}%`,
          top:  `${(i * 17 + 5) % 88}%`,
          opacity: 0.06,
        }}
        animate={{
          y:       [0, -20, 0, 10, 0],
          rotate:  [0, 12, -8, 4, 0],
          opacity: [0.04, 0.1, 0.04],
        }}
        transition={{
          duration: 6 + (i % 4),
          repeat: Infinity,
          delay: i * 0.5,
          ease: 'easeInOut',
        }}
      >
        {p}
      </motion.span>
    ))}
  </div>
);

// ─── Input field ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
  autoComplete?: string;
}

const InputField = ({
  id, label, type, value, onChange, placeholder,
  icon: Icon, rightElement, autoComplete,
}: InputFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-bold text-slate-600 ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="
          w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-100
          bg-white/70 backdrop-blur-sm text-slate-800 font-medium text-base
          placeholder:text-slate-300 outline-none
          focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/10
          transition-all duration-200
        "
      />
      {rightElement && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

// ─── Login Screen ─────────────────────────────────────────────────────────────

export const LoginScreen = () => {
  const { signIn, loading, error, clearError } = useAuthStore();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    await signIn(email.trim(), password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0fdff 0%, #e0f8f4 40%, #f0f4ff 100%)',
      }}
    >
      <FloatingBG />

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="
          relative z-10 w-full max-w-md
          bg-white/70 backdrop-blur-2xl
          rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/80
          border border-white/60
        "
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.1 }}
            className="
              w-20 h-20 rounded-3xl mb-4 flex items-center justify-center
              bg-linear-to-br from-primary to-cyan-600
              shadow-xl shadow-primary/30
            "
          >
            <span className="text-white font-black text-4xl leading-none">N</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-3xl font-black text-slate-800 leading-none">Nexo</h1>
            <p className="text-xs font-black text-primary tracking-[0.2em] uppercase mt-1">Family Hub</p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 text-sm font-medium mt-4 text-center"
          >
            Welcome back! Sign in to access your family hub 🏡
          </motion.p>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <LuCircleAlert className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-rose-700 font-bold text-sm flex-1">{error}</p>
                <button
                  onClick={clearError}
                  className="text-rose-400 hover:text-rose-600 font-black text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="your@email.com"
            icon={LuMail}
            autoComplete="email"
          />

          <InputField
            id="password"
            label="Password"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            icon={LuLock}
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="text-slate-400 hover:text-primary transition-colors p-1"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass
                  ? <LuEyeOff className="w-5 h-5" />
                  : <LuEye    className="w-5 h-5" />
                }
              </button>
            }
          />

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || !email || !password}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading  ? { scale: 0.98 } : {}}
            className="
              mt-2 w-full py-4 rounded-2xl font-black text-white text-base
              bg-linear-to-r from-primary to-cyan-500
              shadow-lg shadow-primary/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <LuLoader className="w-5 h-5 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in to Nexo 🚀
              </>
            )}
          </motion.button>
        </form>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 font-medium mt-6 leading-relaxed">
          This tablet is shared by your whole family. 🏠<br />
          Only the family admin needs to sign in.
        </p>
      </motion.div>
    </div>
  );
};
