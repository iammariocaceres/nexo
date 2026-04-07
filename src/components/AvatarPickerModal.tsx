import { motion } from 'framer-motion';
import { LuX } from 'react-icons/lu';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  memberName: string;
}

const PRESET_AVATARS = [
  // Emojis/Fun
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lucky&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Aneka&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Mittens&backgroundColor=d1d4f9',
  
  // Personas
  'https://api.dicebear.com/7.x/personas/svg?seed=Mario&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/personas/svg?seed=Callie&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/personas/svg?seed=Abby&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/personas/svg?seed=Jack&backgroundColor=d1d4f9',
  
  // Avataaars
  'https://api.dicebear.com/7.x/avataaars/svg?seed=George&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Cleo&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buster&backgroundColor=d1d4f9',
  
  // Thumbs
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Tinkerbell&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Oscar&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Coco&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Luna&backgroundColor=d1d4f9',

  // Lorelei
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Max&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Lucy&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Rocky&backgroundColor=d1d4f9',
];

export const AvatarPickerModal = ({ isOpen, onClose, onSelect, memberName }: AvatarPickerModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Choose an Avatar</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Select a profile picture for <span className="font-bold text-primary">{memberName || 'this member'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-600 hover:scale-105 transition-all shadow-sm border border-slate-100"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {PRESET_AVATARS.map((url, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onSelect(url);
                  onClose();
                }}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border-2 border-transparent hover:border-primary focus:outline-none transition-colors"
              >
                {/* Fallback image if dicebear is slow */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
                <img
                  src={url}
                  alt={`Avatar option ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors z-20" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
