import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Edit3, X, Check, PartyPopper } from 'lucide-react';
import { playSound, SOUNDS } from '../utils/audio';

// 👑 DEFAULT KING DIALOGUES
export const DEFAULT_KING_DIALOGUES = [
  "😒 Ab yaad aaya mai? Chalo... khaana order kar.",
  "Oye hero! Pet yaad aaya ya hum? 😂",
  "😎 Dhurandhar aa gaya! Kitchen alert 🚨",
  "Bhai... fridge ne bhi block kar diya kya? 😂",
  "Aagaye? Ab order bhi kar do. 😌",
  'Chef bola, "Bhai kab aayega?" 🥹',
  "Wallet mana kar raha hai... pet nahi. 😂",
  "Gym khatam? Protein idhar hai. 💪",
  "Oye King! Diet kal se, order aaj se. 😏",
  "Bhook ne complaint file kar di hai. 😭",
  "Legend online! Kitchen ready hai. 🔥",
  "Bhai... app khol liya, ab order bhi kar. 😂",
  "Welcome back King... aaj kya udaana hai? 🍕",
  "Hero ki entry ho gayi... ab party shuru. 🎉",
  "Kya scene hai boss? Same order ya surprise? 😎",
  "Finally! VIP customer online. 🚀",
  "Aaj notification nahi... bhook tumhe khud le aayi. 😂",
  "Chef ne bola tha, 'Aaj woh zaroor aayega/aayegi.' 😌",
  "Tum aaye... kitchen mein festival shuru ho gaya. 🎉",
  "Order nahi kiya toh app naraz ho jayega. 😤"
];

// 👑 DEFAULT QUEEN DIALOGUES
export const DEFAULT_QUEEN_DIALOGUES = [
  "😒 Ab yaad aayi main? Chalo... maaf kiya, pehle order karo. 😂",
  "Oops... Our Queen is back! 👑✨",
  "Arre wah... Queen ne yaad kiya hume? 😌",
  "Itni der? Chef wait karte karte emotional ho gaya. 🥹",
  "Aap aa gayi... ab kitchen bhi smile kar raha hai. 🌸",
  "Queen online... cravings offline hone wali hain. 🍕",
  "Mood off? Hum aur food dono ready hain. 💖",
  "Aaj bhi itni stylish? Ab food bhi premium hona chahiye. 😌",
  "Royal entry detected! 👑",
  "Lagta hai kisi ko hamari yaad aa hi gayi. 😏",
  "Queen aayi hai... chef ne apron seedha kar liya. 😂",
  "Pretty Queen deserves pretty food. 💕",
  "Aaj cooking ki chhutti... hum hain na. 🍔",
  "Queen ji... aaj kya khilayein? 😋",
  "Welcome back, Your Majesty. Kitchen is all yours. 👑",
  "Finally! VIP customer online. 🚀",
  "Aaj notification nahi... bhook tumhe khud le aayi. 😂",
  "Chef ne bola tha, 'Aaj woh zaroor aayega/aayegi.' 😌",
  "Tum aaye... kitchen mein festival shuru ho gaya. 🎉",
  "Order nahi kiya toh app naraz ho jayega. 😤"
];

// 📱 DEFAULT ANONYMOUS DIALOGUES
export const DEFAULT_ANONYMOUS_DIALOGUES = [
  "Fir aa gaye? Addiction hai na? 😂",
  "App khol hi liya hai... order bhi kar do. 😏",
  "Bhook ka Wi-Fi full signal pe hai. 📶",
  "Aaj diet ka RIP hone wala hai. 😂",
  'Pet: "Order kar." Dil: "Ek aur burger." 🍔',
  "Sirf dekhne aaye ho ya order bhi karoge? 👀",
  "Kitchen aapka wait kar raha tha. 😌",
  "Mood fix in 3...2...1... 🍕",
  "Aaj bhi wahi order? Consistency level 💯.",
  "Swiggy ko break do... Mintoo try karo. 😎",
  "Finally! VIP customer online. 🚀",
  "Aaj notification nahi... bhook tumhe khud le aayi. 😂",
  "Chef ne bola tha, 'Aaj woh zaroor aayega/aayegi.' 😌",
  "Tum aaye... kitchen mein festival shuru ho gaya. 🎉",
  "Order nahi kiya toh app naraz ho jayega. 😤"
];

export function getActiveKingDialogues(): string[] {
  try {
    const custom = localStorage.getItem('moms_magic_king_greetings');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_KING_DIALOGUES;
}

export function getActiveQueenDialogues(): string[] {
  try {
    const custom = localStorage.getItem('moms_magic_queen_greetings');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_QUEEN_DIALOGUES;
}

export function getActiveAnonymousDialogues(): string[] {
  try {
    const custom = localStorage.getItem('moms_magic_anon_greetings');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_ANONYMOUS_DIALOGUES;
}

interface UserPersona {
  name: string;
  title: 'King' | 'Queen';
}

export default function FunGreetingBanner() {
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [selectedTitle, setSelectedTitle] = useState<'King' | 'Queen'>('King');
  const [greeting, setGreeting] = useState('');
  const [anonGreeting, setAnonGreeting] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Load stored persona on mount & pick random greeting
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mintoo_user_persona');
      if (stored) {
        const parsed: UserPersona = JSON.parse(stored);
        setPersona(parsed);
        pickRandomGreeting(parsed.title);
      } else {
        pickRandomAnonGreeting();
      }
    } catch (_) {
      pickRandomAnonGreeting();
    }
  }, []);

  const pickRandomGreeting = (title: 'King' | 'Queen') => {
    const list = title === 'King' ? getActiveKingDialogues() : getActiveQueenDialogues();
    const random = list[Math.floor(Math.random() * list.length)];
    setGreeting(random);
  };

  const pickRandomAnonGreeting = () => {
    const list = getActiveAnonymousDialogues();
    const random = list[Math.floor(Math.random() * list.length)];
    setAnonGreeting(random);
  };

  const handleOpenModal = () => {
    playSound(SOUNDS.CLICK);
    if (persona) {
      setInputName(persona.name);
      setSelectedTitle(persona.title);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const newPersona: UserPersona = {
      name: inputName.trim(),
      title: selectedTitle
    };

    setPersona(newPersona);
    localStorage.setItem('mintoo_user_persona', JSON.stringify(newPersona));
    pickRandomGreeting(selectedTitle);
    setIsModalOpen(false);

    // Trigger celebratory confetti animation
    setShowConfetti(true);
    playSound(SOUNDS.ORDER_SUCCESS);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="relative w-full my-3">
      {/* Simple Canvas Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0.5, 
                opacity: 1, 
                rotate: 0 
              }}
              animate={{ 
                x: (Math.random() - 0.5) * 400, 
                y: (Math.random() - 0.5) * 400 - 100, 
                scale: Math.random() * 1.5 + 0.5, 
                opacity: 0, 
                rotate: Math.random() * 720 
              }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className={`absolute w-3 h-3 rounded-full ${
                ['bg-amber-400', 'bg-orange-500', 'bg-pink-500', 'bg-[#39B54A]', 'bg-yellow-300'][i % 5]
              }`}
            />
          ))}
        </div>
      )}

      {/* Main Glassmorphism Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[24px] p-4 sm:p-5 border border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-[#121212]/90 backdrop-blur-xl shadow-xl text-left"
      >
        {/* Glow shimmer */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            {persona ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                    👋 Welcome Back, <span className="text-white underline decoration-amber-400 decoration-2">{persona.name}</span>!
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-400/20 border border-amber-400/40 text-amber-300">
                    {persona.title === 'King' ? '👑 King' : '👑 Queen'}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-black italic tracking-tight text-white leading-snug drop-shadow-md">
                  {greeting}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    👋 Welcome to Mintoo!
                  </span>
                </div>
                <p className="text-sm sm:text-base font-black italic tracking-tight text-white leading-snug drop-shadow-md">
                  {anonGreeting || "Fir aa gaye? Addiction hai na? 😂"}
                </p>
              </>
            )}
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center gap-2">
            {!persona ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpenModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer border border-amber-300/40 shrink-0"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>✨ What should we call you?</span>
              </motion.button>
            ) : (
              <button
                onClick={handleOpenModal}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Change Title or Name"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Onboarding Bottom Sheet / Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-[#161616] border border-amber-500/30 rounded-t-[32px] sm:rounded-[28px] p-6 text-left shadow-2xl z-10 space-y-6 overflow-hidden"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                    Let's make your experience more fun! 🎉
                  </h3>
                  <p className="text-xs font-semibold text-gray-400">
                    Get custom royal greetings every time you open Mintoo!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-5">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                    Enter Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul / Ananya"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    required
                    className="w-full bg-[#222222] border border-white/15 focus:border-amber-400 rounded-2xl py-3.5 px-4 outline-none font-bold text-sm text-white placeholder:text-gray-500 transition-colors shadow-inner"
                  />
                </div>

                {/* Role Title Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                    Select Your Royal Persona
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* King Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTitle('King');
                        playSound(SOUNDS.CLICK);
                      }}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedTitle === 'King'
                          ? 'bg-gradient-to-b from-amber-500/25 to-orange-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10 scale-[1.02]'
                          : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-3xl">👑</span>
                      <span className="font-black text-sm uppercase tracking-wider">King</span>
                      {selectedTitle === 'King' && (
                        <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </button>

                    {/* Queen Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTitle('Queen');
                        playSound(SOUNDS.CLICK);
                      }}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedTitle === 'Queen'
                          ? 'bg-gradient-to-b from-pink-500/25 to-purple-500/20 border-pink-400 text-white shadow-lg shadow-pink-500/10 scale-[1.02]'
                          : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-3xl">👑</span>
                      <span className="font-black text-sm uppercase tracking-wider">Queen</span>
                      {selectedTitle === 'Queen' && (
                        <span className="text-[9px] font-bold text-pink-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full h-13 mt-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                >
                  <PartyPopper className="w-4 h-4 fill-black" />
                  <span>Save & Start Royal Experience</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
