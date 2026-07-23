import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Edit3, X, Check, PartyPopper, RefreshCw, Languages } from 'lucide-react';
import { playSound, SOUNDS } from '../utils/audio';

export type LanguageCode = 'kannada' | 'hindi' | 'english';

export interface UserPersona {
  name: string;
  title: 'King' | 'Queen';
  languages: LanguageCode[];
}

// ==================== KANNADA DIALOGUES ====================
export const KANNADA_KING_DIALOGUES = [
  "😒 Yen guru... finally nenap aytha?",
  "🤨 App open madidya... order elli?",
  "🔥 Oho! Dhurandhar entry aythu!",
  "🍗 Gym mugsi bandya? Protein ready ide.",
  "😂 Fridge reject madtha? Naan idini alva.",
  "😏 Boss... just checking ah? Order madu guru.",
  "🚨 Kitchen alert! VIP customer online.",
  "🤣 Bro... diet tomorrow, biryani today.",
  "🍕 Bhook level: Criminal.",
  "😌 Ninna wait madtha idvi guru.",
  "😎 Welcome back macha... wallet ready idya?",
  '😂 Chef: "Avnu banda? Gas on madi!"'
];

export const KANNADA_QUEEN_DIALOGUES = [
  "👑 Oops... nam Queen bandbitlu!",
  "🌸 Ayyo... finally nenap aytha?",
  "😌 Queen online... kitchen smiling.",
  "💖 App open madidya... nam luck open aythu.",
  "🥹 Chef full waiting madtha idda.",
  "😏 Queen... today cooking cancel okay?",
  "🍰 Pretty Queen deserves tasty food.",
  "😂 Diet ge bye heli banni.",
  "👀 Queen order madidre taste double agutte.",
  '🌹 Kitchen saying "Welcome back Your Highness."',
  "💕 Smile cute ide... now make your tummy happy.",
  "👑 Royal customer detected."
];

export const KANNADA_UNIVERSAL_DIALOGUES = [
  "😒 Yen guru... finally nenap aytha?",
  "🤨 App open madidya... order elli?",
  "😂 Menu bari nodtha idya? Order madu boss!",
  "🍕 Masala Dosa, Biryani, Milkshake... en beku guru?",
  "😭 Hotteyalli sangeetha shuru aytha?",
  "😌 Sakhat food kadiro namma Mintoo alli!",
  "🤤 Ondu click madu... taste guaranteed!",
  "🚨 Sakath hosa offers bandide nodu!",
  "🍟 Diet maadodu naale... eradu idli ivattu!",
  "😂 Kitchen nalli chef ninge kaytha idare.",
  "👀 Nodkond irbeda, bega order maadu!",
  "😂 Wallet swalpa kadme agbuhudu... manassu tumba khushi agutte!",
  "🔥 Warning: Mintoo food order madidre tumba addiction agbuhudu!",
  "😌 Swiggy Yaake? Mintoo ide alva!",
  "🍔 Mood sariyillava? Burger order maadu!",
  "🤣 Nodu beda guru... order maadu!",
  "😎 BTM Layout ge super fast delivery!",
  "😏 Swalpa crunchy, swalpa juicy... full taste!",
  "💸 Hotte tumba khushi, manassu tumba shanti!",
  "🍕 Ninna diet already escape agide!"
];

// ==================== HINDI DIALOGUES ====================
export const HINDI_KING_DIALOGUES = [
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
  "Legend online! Kitchen ready hai. 🔥"
];

export const HINDI_QUEEN_DIALOGUES = [
  "😒 Ab yaad aayi main? Chalo... maaf kiya, pehle order karo. 😂",
  "Oops... Our Queen is back! 👑✨",
  "Arre wah... Queen ne yaad kiya hume? 😌",
  "Itni der? Chef wait karte karte emotional ho gaya. 🥹",
  "Aap aa gayi... ab kitchen bhi smile kar raha hai. 🌸",
  "Queen online... cravings offline hone wali hain. 🍕",
  "Mood off? Hum aur food dono ready hain. 💖",
  "Pretty Queen deserves pretty food. 💕"
];

export const HINDI_UNIVERSAL_DIALOGUES = [
  "Fir aa gaye? Addiction hai na? 😂",
  "App khol hi liya hai... order bhi kar do. 😏",
  "Bhook ka Wi-Fi full signal pe hai. 📶",
  "Aaj diet ka RIP hone wala hai. 😂",
  'Pet: "Order kar." Dil: "Ek aur burger." 🍔',
  "Sirf dekhne aaye ho ya order bhi karoge? 👀",
  "Kitchen aapka wait kar raha tha. 😌",
  "Mood fix in 3...2...1... 🍕"
];

// ==================== ENGLISH DIALOGUES ====================
export const ENGLISH_KING_DIALOGUES = [
  "😒 Oh... NOW you remembered me?",
  "😂 Finally! The legend is back.",
  "🔥 The King has entered. Kitchen, stay calm.",
  "🍔 Bro... your stomach snitched on you.",
  "😏 Just browsing? Nice joke. Order something.",
  "🚨 VIP customer detected!",
  "🍕 Your cravings have been waiting."
];

export const ENGLISH_QUEEN_DIALOGUES = [
  "👑 Oops... Our Queen is back!",
  "💖 Finally! We were getting worried.",
  "🌸 Welcome back, Your Majesty.",
  "😌 Pretty people deserve great food.",
  "🍰 Queen energy detected."
];

export const ENGLISH_UNIVERSAL_DIALOGUES = [
  "😒 Oh... NOW you remember us?",
  "😂 Back again? We knew it.",
  "🍕 Just one bite away from happiness.",
  "👀 Browsing won't fill your stomach.",
  "🤤 Your cravings brought you here.",
  "🚨 Hunger emergency detected."
];

// ==================== DEFAULT POOLS ====================
export const DEFAULT_KING_DIALOGUES = [...KANNADA_KING_DIALOGUES, ...HINDI_KING_DIALOGUES, ...ENGLISH_KING_DIALOGUES];
export const DEFAULT_QUEEN_DIALOGUES = [...KANNADA_QUEEN_DIALOGUES, ...HINDI_QUEEN_DIALOGUES, ...ENGLISH_QUEEN_DIALOGUES];
export const DEFAULT_ANONYMOUS_DIALOGUES = [...KANNADA_UNIVERSAL_DIALOGUES, ...HINDI_UNIVERSAL_DIALOGUES, ...ENGLISH_UNIVERSAL_DIALOGUES];

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

export function getPersonaDialoguePool(title: 'King' | 'Queen', languages: LanguageCode[]): string[] {
  const activeLangs = languages && languages.length > 0 ? languages : ['kannada'];
  const pool: string[] = [];

  if (activeLangs.includes('kannada')) {
    pool.push(...(title === 'King' ? KANNADA_KING_DIALOGUES : KANNADA_QUEEN_DIALOGUES));
    pool.push(...KANNADA_UNIVERSAL_DIALOGUES);
  }
  if (activeLangs.includes('hindi')) {
    pool.push(...(title === 'King' ? HINDI_KING_DIALOGUES : HINDI_QUEEN_DIALOGUES));
    pool.push(...HINDI_UNIVERSAL_DIALOGUES);
  }
  if (activeLangs.includes('english')) {
    pool.push(...(title === 'King' ? ENGLISH_KING_DIALOGUES : ENGLISH_QUEEN_DIALOGUES));
    pool.push(...ENGLISH_UNIVERSAL_DIALOGUES);
  }

  if (pool.length === 0) {
    return title === 'King' ? KANNADA_KING_DIALOGUES : KANNADA_QUEEN_DIALOGUES;
  }
  return Array.from(new Set(pool));
}

export default function FunGreetingBanner() {
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [selectedTitle, setSelectedTitle] = useState<'King' | 'Queen'>('King');
  const [selectedLangs, setSelectedLangs] = useState<LanguageCode[]>(['kannada']);
  const [greeting, setGreeting] = useState('');
  const [anonGreeting, setAnonGreeting] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Load stored persona on mount & pick random greeting
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mintoo_user_persona');
      if (stored) {
        const parsed = JSON.parse(stored);
        const userLangs: LanguageCode[] = Array.isArray(parsed.languages) && parsed.languages.length > 0 
          ? parsed.languages 
          : ['kannada'];
        const userPersona: UserPersona = {
          name: parsed.name || 'User',
          title: parsed.title === 'Queen' ? 'Queen' : 'King',
          languages: userLangs
        };
        setPersona(userPersona);
        setSelectedLangs(userLangs);
        pickRandomGreeting(userPersona.title, userPersona.languages);
      } else {
        setSelectedLangs(['kannada']);
        pickRandomAnonGreeting(['kannada']);
      }
    } catch (_) {
      setSelectedLangs(['kannada']);
      pickRandomAnonGreeting(['kannada']);
    }
  }, []);

  const pickRandomGreeting = (title: 'King' | 'Queen', languages: LanguageCode[]) => {
    const list = getPersonaDialoguePool(title, languages);
    const random = list[Math.floor(Math.random() * list.length)];
    setGreeting(random);
  };

  const pickRandomAnonGreeting = (languages: LanguageCode[]) => {
    const list = getPersonaDialoguePool('King', languages);
    const random = list[Math.floor(Math.random() * list.length)];
    setAnonGreeting(random);
  };

  const handleQuickSelectLanguage = (lang: LanguageCode | 'all') => {
    playSound(SOUNDS.CLICK);
    let newLangs: LanguageCode[];
    if (lang === 'all') {
      newLangs = ['kannada', 'hindi', 'english'];
    } else {
      newLangs = [lang];
    }
    
    setSelectedLangs(newLangs);

    const currentTitle = persona ? persona.title : 'King';
    const currentName = persona ? persona.name : 'Foodie';

    const updatedPersona: UserPersona = {
      name: currentName,
      title: currentTitle,
      languages: newLangs
    };

    setPersona(updatedPersona);
    localStorage.setItem('mintoo_user_persona', JSON.stringify(updatedPersona));

    pickRandomGreeting(currentTitle, newLangs);
    pickRandomAnonGreeting(newLangs);
  };

  const handleShuffleGreeting = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playSound(SOUNDS.CLICK);
    const activeLangs = selectedLangs.length > 0 ? selectedLangs : (persona?.languages || ['kannada']);
    const title = persona?.title || 'King';
    pickRandomGreeting(title, activeLangs);
    pickRandomAnonGreeting(activeLangs);
  };

  const handleOpenModal = () => {
    playSound(SOUNDS.CLICK);
    if (persona) {
      setInputName(persona.name);
      setSelectedTitle(persona.title);
      setSelectedLangs(persona.languages || ['kannada']);
    } else {
      setSelectedLangs(['kannada']);
    }
    setIsModalOpen(true);
  };

  const toggleLanguage = (lang: LanguageCode) => {
    playSound(SOUNDS.CLICK);
    if (selectedLangs.includes(lang)) {
      if (selectedLangs.length > 1) {
        setSelectedLangs(selectedLangs.filter(l => l !== lang));
      }
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  const selectAllThree = () => {
    playSound(SOUNDS.CLICK);
    setSelectedLangs(['kannada', 'hindi', 'english']);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const finalLangs = selectedLangs.length > 0 ? selectedLangs : ['kannada'];

    const newPersona: UserPersona = {
      name: inputName.trim(),
      title: selectedTitle,
      languages: finalLangs
    };

    setPersona(newPersona);
    localStorage.setItem('mintoo_user_persona', JSON.stringify(newPersona));
    pickRandomGreeting(selectedTitle, finalLangs);
    setIsModalOpen(false);

    setShowConfetti(true);
    playSound(SOUNDS.ORDER_SUCCESS);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const isAllThreeSelected = selectedLangs.length === 3 && 
    selectedLangs.includes('kannada') && 
    selectedLangs.includes('hindi') && 
    selectedLangs.includes('english');

  const currentDialogue = persona ? greeting : (anonGreeting || "Yen guru... finally nenap aytha? 💛");

  return (
    <div className="relative w-full my-3">
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0.5, opacity: 1, rotate: 0 }}
              animate={{ 
                x: (Math.random() - 0.5) * 400, 
                y: (Math.random() - 0.5) * 400 - 100, 
                scale: Math.random() * 1.5 + 0.5, 
                opacity: 0, 
                rotate: Math.random() * 720 
              }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className={`absolute w-3 h-3 rounded-full ${
                ['bg-amber-400', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-300'][i % 4]
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
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Header Row & Quick Language Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                {persona ? (
                  <>👋 Namaskara, <span className="text-white underline decoration-amber-400 decoration-2">{persona.name}</span>!</>
                ) : (
                  <>👋 Namaskara to Mintoo!</>
                )}
              </span>
              {persona && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-400/20 border border-amber-400/40 text-amber-300">
                  {persona.title === 'King' ? '👑 King' : '👑 Queen'}
                </span>
              )}
            </div>

            {/* Quick 1-Click Language Switcher Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickSelectLanguage('kannada')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  selectedLangs.length === 1 && selectedLangs[0] === 'kannada'
                    ? 'bg-amber-400 text-black shadow-md font-black scale-105 border border-amber-300'
                    : 'bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/20'
                }`}
              >
                🟡 Kannada
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectLanguage('hindi')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  selectedLangs.length === 1 && selectedLangs[0] === 'hindi'
                    ? 'bg-orange-500 text-white shadow-md font-black scale-105 border border-orange-300'
                    : 'bg-white/10 hover:bg-white/20 text-orange-300 border border-orange-400/20'
                }`}
              >
                🟠 Hindi
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectLanguage('english')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  selectedLangs.length === 1 && selectedLangs[0] === 'english'
                    ? 'bg-blue-500 text-white shadow-md font-black scale-105 border border-blue-300'
                    : 'bg-white/10 hover:bg-white/20 text-blue-300 border border-blue-400/20'
                }`}
              >
                🔵 English
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectLanguage('all')}
                className={`px-2 py-1 rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  selectedLangs.length === 3
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md font-black scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/15'
                }`}
              >
                ✨ All 3
              </button>

              <button
                onClick={handleOpenModal}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-amber-300 text-xs font-bold transition-all cursor-pointer ml-1"
                title="Edit Name & Persona"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Dialogue Text Display & Shuffle */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={(e) => handleShuffleGreeting(e)}>
            <p className="text-sm sm:text-base font-black italic tracking-tight text-white leading-snug drop-shadow-md flex-1">
              "{currentDialogue}"
            </p>
            <button 
              type="button"
              onClick={(e) => handleShuffleGreeting(e)}
              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 transition-all shrink-0 active:scale-95 flex items-center gap-1 text-[11px] font-bold"
              title="Click to shuffle quote"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Onboarding / Persona Customization Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="relative w-full max-w-md bg-[#161616] border border-amber-500/30 rounded-[28px] p-4 sm:p-5 text-left shadow-2xl z-10 flex flex-col max-h-[82vh] my-auto overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between border-b border-white/10 pb-2.5 shrink-0">
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                    Custom Greetings & Persona 🎉
                  </h3>
                  <p className="text-[11px] font-semibold text-gray-400">
                    Get custom Kannada greetings tailored for you!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 pt-3">
                <div className="overflow-y-auto space-y-3 pr-1 flex-1 pb-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                      1. Enter Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul / Ananya"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      required
                      className="w-full bg-[#222222] border border-white/15 focus:border-amber-400 rounded-xl py-2.5 px-3.5 outline-none font-bold text-xs text-white placeholder:text-gray-500 transition-colors shadow-inner"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                      2. Select Persona
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTitle('King');
                          playSound(SOUNDS.CLICK);
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selectedTitle === 'King'
                            ? 'bg-gradient-to-b from-amber-500/25 to-orange-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10 scale-[1.01]'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg">👑</span>
                        <span className="font-black text-[11px] uppercase tracking-wider">King</span>
                        {selectedTitle === 'King' && (
                          <span className="text-[8px] font-bold text-amber-400 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Selected
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTitle('Queen');
                          playSound(SOUNDS.CLICK);
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selectedTitle === 'Queen'
                            ? 'bg-gradient-to-b from-pink-500/25 to-purple-500/20 border-pink-400 text-white shadow-lg shadow-pink-500/10 scale-[1.01]'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg">👑</span>
                        <span className="font-black text-[11px] uppercase tracking-wider">Queen</span>
                        {selectedTitle === 'Queen' && (
                          <span className="text-[8px] font-bold text-pink-400 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Selected
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                        <Languages className="w-3 h-3 text-amber-400" />
                        3. Preferred Language(s)
                      </label>
                      <span className="text-[8px] text-gray-400 font-bold">Select preference</span>
                    </div>

                    <button
                      type="button"
                      onClick={selectAllThree}
                      className={`w-full py-2 px-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAllThreeSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-400 font-extrabold shadow-md scale-[1.01]'
                          : 'bg-[#1e1e1e] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span>All 3 (Mix of Kannada, Hindi & English)</span>
                      {isAllThreeSelected && <Check className="w-3 h-3 text-amber-400" />}
                    </button>

                    <div className="grid grid-cols-3 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleLanguage('kannada')}
                        className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selectedLangs.includes('kannada')
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs">🟡</span>
                        <span className="text-[10px] font-bold">Kannada</span>
                        {selectedLangs.includes('kannada') && (
                          <span className="text-[7px] text-amber-400">Selected</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleLanguage('hindi')}
                        className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selectedLangs.includes('hindi')
                            ? 'bg-orange-500/20 border-orange-400 text-orange-300 font-black'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs">🟠</span>
                        <span className="text-[10px] font-bold">Hindi</span>
                        {selectedLangs.includes('hindi') && (
                          <span className="text-[7px] text-orange-400">Selected</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleLanguage('english')}
                        className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selectedLangs.includes('english')
                            ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-black'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs">🔵</span>
                        <span className="text-[10px] font-bold">English</span>
                        {selectedLangs.includes('english') && (
                          <span className="text-[7px] text-blue-400">Selected</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-2.5 border-t border-white/10 bg-[#161616]">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                  >
                    <PartyPopper className="w-4 h-4 fill-black" />
                    <span>Save & Start Experience</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
