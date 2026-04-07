import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuArrowRight, LuCheck, LuPlus, LuTrash2, LuShieldCheck, LuUsers, LuHouse, LuCamera } from 'react-icons/lu';
import { AvatarPickerModal } from './AvatarPickerModal';

export interface SetupMemberData {
  id: string;
  name: string;
  displayName: string;
  role: 'admin' | 'member';
  avatar_url: string;
  color: string;
  emoji: string;
}

export interface SetupData {
  familyName: string;
  adminPin: string;
  members: SetupMemberData[];
}

interface SetupWizardProps {
  onComplete: (data: SetupData) => Promise<void>;
}

export const SetupWizard = ({ onComplete }: SetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [familyName, setFamilyName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [members, setMembers] = useState<SetupMemberData[]>([]);

  // Avatar Picker State
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [activeEditingMemberId, setActiveEditingMemberId] = useState<string | null>(null);

  const addEmptyMember = () => {
    const newId = `tmp_${Date.now()}`;
    setMembers(prev => [
      ...prev,
      {
        id: newId,
        name: '',
        displayName: '',
        role: prev.length === 0 ? 'admin' : 'member', // first member is admin by default
        avatar_url: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${newId}&backgroundColor=b6e3f4`,
        color: '#3B82F6',
        emoji: '😃'
      }
    ]);
  };

  const updateMember = (id: string, field: keyof SetupMemberData, value: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleFinish = async () => {
    if (members.length === 0 || !familyName || adminPin.length !== 4) return;
    setIsSubmitting(true);
    await onComplete({ familyName, adminPin, members });
    setIsSubmitting(false);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'linear-gradient(135deg, #f0fdff 0%, #e0f8f4 40%, #f0f4ff 100%)' }}>

      <motion.div
        className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[600px] border border-white/60"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header Progress */}
        <div className="px-8 pt-8 pb-4 flex items-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: step >= i ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        {/* Dynamic Content area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">

            {/* STEP 1: Family Name */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
                  <LuHouse className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-3">
                  Welcome to Nexo!<br />What's your family name?
                </h2>
                <p className="text-slate-500 font-medium text-lg mb-8">
                  This will be shown at the top of your dashboard.
                </p>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. The Millers"
                  className="w-full text-3xl font-bold bg-transparent border-b-4 border-slate-200 focus:border-primary placeholder:text-slate-300 pb-2 outline-none transition-colors"
                  autoFocus
                />
              </motion.div>
            )}

            {/* STEP 2: PIN Setup */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
                  <LuShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-tight mb-3">
                  Set Admin PIN
                </h2>
                <p className="text-slate-500 font-medium text-lg mb-8">
                  Since the tablet is shared, you'll need a 4-digit PIN to access the family settings and manage rewards.
                </p>
                <input
                  type="password"
                  maxLength={4}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  className="text-6xl tracking-[0.5em] font-black text-center bg-slate-50 border-2 border-slate-200 rounded-2xl w-full py-4 outline-none focus:border-emerald-500 focus:bg-white transition-all mx-auto"
                  autoFocus
                />
              </motion.div>
            )}

            {/* STEP 3: Members Setup */}
            {step === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 p-8 flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-6 shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                    <LuUsers className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Who is in {familyName || 'your family'}?</h2>
                    <p className="text-slate-500 text-sm font-medium">Add members to start assigning chores.</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-24">
                  <AnimatePresence>
                    {members.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center relative group"
                      >
                        {/* Avatar Column */}
                        <div className="relative shrink-0">
                          <img src={member.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-white shadow-sm bg-white" />
                          <button
                            onClick={() => { setActiveEditingMemberId(member.id); setIsAvatarPickerOpen(true); }}
                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform focus:outline-none"
                            title="Change Avatar"
                          >
                            <LuCamera className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Inputs Column */}
                        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                          <input
                            type="text"
                            placeholder="Name (e.g. Mario)"
                            value={member.name}
                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 ring-primary/20"
                          />
                          <input
                            type="text"
                            placeholder="Display (e.g. Dad)"
                            value={member.displayName}
                            onChange={(e) => updateMember(member.id, 'displayName', e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 outline-none focus:border-primary focus:ring-2 ring-primary/20"
                          />
                          <select
                            value={member.role}
                            onChange={(e) => updateMember(member.id, 'role', e.target.value as any)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 outline-none focus:border-primary focus:ring-2 ring-primary/20 bg-white"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeMember(member.id)}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    onClick={addEmptyMember}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-all focus:outline-none"
                  >
                    <LuPlus className="w-5 h-5" />
                    <span>Add Member</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-between shrink-0 relative z-10">
          <button
            onClick={prevStep}
            className={`px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            ← Back
          </button>

          <button
            onClick={step < 3 ? nextStep : handleFinish}
            disabled={(step === 1 && !familyName) || (step === 2 && adminPin.length < 4) || (step === 3 && members.length === 0) || isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Saving...</span>
            ) : step < 3 ? (
              <>Continue <LuArrowRight className="w-5 h-5" /></>
            ) : (
              <>Finish Setup <LuCheck className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </motion.div>

      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        memberName={members.find(m => m.id === activeEditingMemberId)?.name || ''}
        onSelect={(url) => {
          if (activeEditingMemberId) {
            updateMember(activeEditingMemberId, 'avatar_url', url);
          }
        }}
      />
    </div>
  );
};
