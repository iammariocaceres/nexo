import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuShieldAlert, LuArrowLeft, LuDelete, LuLock } from 'react-icons/lu';
import { useFamilyStore } from '../store/useFamilyStore';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

interface PinGateProps {
  children: React.ReactNode;
}

export const PinGate = ({ children }: PinGateProps) => {
  const { group } = useFamilyStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const correctPin = group?.admin_pin || '0000';

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
  }, [pin, correctPin]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4 && !error) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !error) {
      setPin(prev => prev.slice(0, -1));
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  const shakeAnimation = {
    x: error ? [-10, 10, -10, 10, -5, 5, 0] : 0,
    transition: { duration: 0.4 }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 overflow-hidden font-plus-jakarta">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

      {/* Top Bar for escape */}
      {!isMobile && (
        <div className="absolute top-0 w-full p-8 flex justify-start">
          <motion.button 
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white font-bold text-slate-500 hover:text-slate-800 transition-all"
          >
            <LuArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver</span>
          </motion.button>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center w-full max-w-sm px-8 relative z-10"
      >
        {/* Header Icon */}
        <div className="relative mb-8">
          <motion.div 
            animate={error ? { scale: [1, 1.1, 1] } : {}}
            className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-colors duration-300 ${
              error ? 'bg-rose-50 text-rose-500 shadow-rose-200/50' : 'bg-primary/10 text-primary shadow-primary/20'
            }`}
          >
            {error ? <LuShieldAlert className="w-10 h-10" /> : <LuLock className="w-10 h-10" />}
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-50">
            <div className={`w-3 h-3 rounded-full ${error ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 text-center tracking-tight mb-2">
          Acceso Admin
        </h1>
        <p className="text-slate-500 font-medium text-center mb-10 text-sm leading-relaxed">
          Ingresa el PIN de 4 dígitos para <br /> gestionar tu familia.
        </p>

        {/* PIN Dots */}
        <motion.div animate={shakeAnimation} className="flex gap-5 mb-14 h-6 items-center justify-center">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="relative">
              <motion.div
                initial={false}
                animate={{ 
                  scale: pin.length > i ? 1.2 : 1,
                  backgroundColor: error ? '#f43f5e' : pin.length > i ? '#00CED1' : '#e2e8f0',
                }}
                className="w-4 h-4 rounded-full transition-all duration-200"
              />
              <AnimatePresence>
                {pin.length > i && !error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-5 w-full max-w-[320px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
              whileTap={{ scale: 0.95, backgroundColor: '#f1f5f9' }}
              onClick={() => handleKeyPress(num.toString())}
              className="aspect-square bg-white rounded-[2rem] text-3xl font-black text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center justify-center transition-shadow hover:shadow-xl active:shadow-inner"
            >
              {num}
            </motion.button>
          ))}
          <div />
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }}
            whileTap={{ scale: 0.95, backgroundColor: '#f1f5f9' }}
            onClick={() => handleKeyPress('0')}
            className="aspect-square bg-white rounded-[2rem] text-3xl font-black text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center justify-center transition-shadow hover:shadow-xl active:shadow-inner"
          >
            0
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="aspect-square text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
          >
            <LuDelete className="w-9 h-9" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

