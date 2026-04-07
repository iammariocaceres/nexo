import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LuShieldAlert, LuArrowLeft, LuDelete } from 'react-icons/lu';
import { useFamilyStore } from '../store/useFamilyStore';
import { useNavigate } from 'react-router-dom';

interface PinGateProps {
  children: React.ReactNode;
}

export const PinGate = ({ children }: PinGateProps) => {
  const { group } = useFamilyStore();
  const navigate = useNavigate();
  
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
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
      {/* Top Bar for escape */}
      <div className="absolute top-0 w-full p-6 flex justify-start">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <LuArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-sm px-6">
        <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 mb-6 shadow-sm border border-amber-100">
          <LuShieldAlert className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 text-center tracking-tight mb-2">
          Admin Access
        </h1>
        <p className="text-slate-500 font-medium text-center mb-10 text-sm">
          Enter your 4-digit family management PIN.
        </p>

        {/* PIN Dots */}
        <motion.div animate={shakeAnimation} className="flex gap-4 mb-12 h-5 items-center justify-center">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                pin.length > i 
                  ? 'bg-primary border-primary scale-110' 
                  : 'border-slate-200 bg-transparent'
              } ${error ? 'bg-rose-500 border-rose-500' : ''}`}
            />
          ))}
        </motion.div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="aspect-square bg-white border border-slate-100 rounded-3xl text-3xl font-black text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          {/* Empty space */}
          <div />
          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className="aspect-square bg-white border border-slate-100 rounded-3xl text-3xl font-black text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          >
            0
          </button>
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="aspect-square bg-slate-100 rounded-3xl text-2xl font-black text-slate-500 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center"
          >
            <LuDelete className="w-8 h-8 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
