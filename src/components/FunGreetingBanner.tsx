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
  "😒 Ab yaad aaya na?",
  "🤨 Just stalking menu ah?",
  "😂 Order madu... don't be shy.",
  "🍕 Your stomach is typing...",
  "😭 Bro... fridge complaint kotide.",
  "😌 Food waiting... what are YOU waiting for?",
  "🤤 One click away from happiness.",
  "🚨 Bhook emergency detected.",
  "🍟 Calories won't tell anyone. 🤫",
  "😂 Today cheat day automatically activated.",
  "🫡 Chef attendance hakidare... neevu late.",
  '😭 Kitchen asking "Where were you?"',
  "👀 Looking at food won't fill your tummy.",
  "😂 Wallet crying... tummy smiling.",
  "🔥 Warning: One order can cause addiction.",
  "😌 Swiggy who? We got you.",
  "🍔 Mood off? Burger on.",
  "🤣 Nodu beda... order madu.",
  "💀 App open madidya andre, half order agbitu.",
  "😎 Welcome back, troublemaker.",
  "😏 Came to see offers or me?",
  "😂 Don't act expensive... order something.",
  "💸 Bank balance: 😭 | Cravings: 😎",
  "🍕 Your diet just unfollowed you.",
  "😌 Food won't judge you... we promise.",
  "🤣 You again? We missed your money.",
  "👀 Your stomach sent us a notification.",
  "🔥 Don't worry... calories are sleeping today.",
  "😂 One order won't make you poor... maybe."
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

export const HINDI_QUEEN_DIALOGUES = [
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

export const HINDI_UNIVERSAL_DIALOGUES = [
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

// ==================== ENGLISH DIALOGUES ====================
export const ENGLISH_KING_DIALOGUES = [
  "😒 Oh... NOW you remembered me?",
  "😂 Finally! The legend is back.",
  "🔥 The King has entered. Kitchen, stay calm.",
  "🍔 Bro... your stomach snitched on you.",
  "😏 Just browsing? Nice joke. Order something.",
  "💀 Your diet just left the chat.",
  "🚨 VIP customer detected!",
  "🤝 Welcome back, boss. Let's feed that beast.",
  "🍕 Your cravings have been waiting.",
  "😎 We knew you'd come back.",
  "😂 Don't worry... calories are on leave today.",
  "🍗 Gym done? Time to refill.",
  "👀 Looking at food burns 0 calories.",
  "💸 Wallet says no. Stomach says YES.",
  "😌 One order won't hurt... probably."
];

export const ENGLISH_QUEEN_DIALOGUES = [
  "👑 Oops... Our Queen is back!",
  "💖 Finally! We were getting worried.",
  "🌸 Welcome back, Your Majesty.",
  "😌 Pretty people deserve great food.",
  "🍰 Queen energy detected.",
  "✨ The kitchen just got happier.",
  "😏 Looking gorgeous... now order something.",
  "💕 Your cravings have been waiting for you.",
  "👀 The chef smiled when you opened the app.",
  "🎀 Today's menu looks better because you're here.",
  "🌹 The Queen has arrived. Let the feast begin.",
  "💖 Happiness is one order away.",
  "😌 You showed up... now make your tummy smile.",
  "🍕 Warning: This app may spoil you.",
  "✨ We missed your royal visits."
];

export const ENGLISH_UNIVERSAL_DIALOGUES = [
  "😒 Oh... NOW you remember us?",
  "😂 Back again? We knew it.",
  "🍕 Just one bite away from happiness.",
  "👀 Browsing won't fill your stomach.",
  "🤤 Your cravings brought you here.",
  "💀 Your fridge officially gave up.",
  "🚨 Hunger emergency detected.",
  "🍟 Your stomach has entered the chat.",
  "😏 Don't overthink it... just order.",
  "😂 Looking is free. Ordering is better.",
  "🍔 Your diet is watching... ignore it.",
  "😌 Food is ready. What are YOU waiting for?",
  "🤝 Welcome back, troublemaker.",
  "💸 Your wallet is scared already.",
  "🔥 One order = Instant happiness.",
  "😂 We both know you're ordering.",
  "👀 Don't pretend you're \"just looking.\"",
  "😏 Opened the app... mission almost complete.",
  "🍕 Your stomach made this decision, not you.",
  "💀 Diet starts tomorrow. As always.",
  "🚨 Breaking News: Hunger wins again.",
  "😂 You came. You saw. You ordered.",
  "🤤 Self-control has left the chat.",
  "🍔 If you're reading this... order already.",
  "😌 Trust your cravings. They're usually right.",
  "💸 Money comes back. This meal won't.",
  "🔥 One tap. Infinite happiness.",
  "😂 Stop scrolling. Start eating.",
  "👀 You deserve this meal. Don't argue.",
  "🍕 Welcome back... your favorite food missed you."
];

// ==================== DEFAULT POOLS FOR BACKWARDS COMPATIBILITY ====================
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

// Function to construct pool based on title & selected languages
export function getPersonaDialoguePool(title: 'King' | 'Queen', languages: LanguageCode[]): string[] {
  const activeLangs = languages && languages.length > 0 ? languages : ['kannada', 'hindi', 'english'];
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
    return title === 'King' ? DEFAULT_KING_DIALOGUES : DEFAULT_QUEEN_DIALOGUES;
  }
  return Array.from(new Set(pool));
}

export default function FunGreetingBanner() {
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [selectedTitle, setSelectedTitle] = useState<'King' | 'Queen'>('King');
  const [selectedLangs, setSelectedLangs] = useState<LanguageCode[]>(['kannada', 'hindi', 'english']);
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
          : ['kannada', 'hindi', 'english'];
        const userPersona: UserPersona = {
          name: parsed.name || 'User',
          title: parsed.title === 'Queen' ? 'Queen' : 'King',
          languages: userLangs
        };
        setPersona(userPersona);
        pickRandomGreeting(userPersona.title, userPersona.languages);
      } else {
        pickRandomAnonGreeting(['kannada', 'hindi', 'english']);
      }
    } catch (_) {
      pickRandomAnonGreeting(['kannada', 'hindi', 'english']);
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

  const handleShuffleGreeting = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playSound(SOUNDS.CLICK);
    if (persona) {
      pickRandomGreeting(persona.title, persona.languages);
    } else {
      pickRandomAnonGreeting(selectedLangs);
    }
  };

  const handleOpenModal = () => {
    playSound(SOUNDS.CLICK);
    if (persona) {
      setInputName(persona.name);
      setSelectedTitle(persona.title);
      setSelectedLangs(persona.languages || ['kannada', 'hindi', 'english']);
    } else {
      setSelectedLangs(['kannada', 'hindi', 'english']);
    }
    setIsModalOpen(true);
  };

  const toggleLanguage = (lang: LanguageCode) => {
    playSound(SOUNDS.CLICK);
    if (selectedLangs.includes(lang)) {
      // Don't allow deselecting all languages
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

    const finalLangs = selectedLangs.length > 0 ? selectedLangs : ['kannada', 'hindi', 'english'];

    const newPersona: UserPersona = {
      name: inputName.trim(),
      title: selectedTitle,
      languages: finalLangs
    };

    setPersona(newPersona);
    localStorage.setItem('mintoo_user_persona', JSON.stringify(newPersona));
    pickRandomGreeting(selectedTitle, finalLangs);
    setIsModalOpen(false);

    // Trigger celebratory confetti animation
    setShowConfetti(true);
    playSound(SOUNDS.ORDER_SUCCESS);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const isAllThreeSelected = selectedLangs.length === 3 && 
    selectedLangs.includes('kannada') && 
    selectedLangs.includes('hindi') && 
    selectedLangs.includes('english');

  const getLanguageLabel = (langs: LanguageCode[]) => {
    if (!langs || langs.length === 3) return '🗣️ Mix (KN+HI+EN)';
    if (langs.length === 1) {
      if (langs[0] === 'kannada') return '🗣️ Kannada';
      if (langs[0] === 'hindi') return '🗣️ Hindi';
      if (langs[0] === 'english') return '🗣️ English';
    }
    return `🗣️ ${langs.map(l => l.substring(0, 2).toUpperCase()).join('+')}`;
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
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 border border-white/15 text-gray-300">
                    {getLanguageLabel(persona.languages)}
                  </span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleShuffleGreeting()}>
                  <p className="text-sm sm:text-base font-black italic tracking-tight text-white leading-snug drop-shadow-md flex-1">
                    "{greeting}"
                  </p>
                  <button 
                    type="button"
                    onClick={(e) => handleShuffleGreeting(e)}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 transition-all shrink-0 active:scale-95"
                    title="Click to shuffle quote"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    👋 Welcome to Mintoo!
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 border border-white/15 text-gray-300">
                    🗣️ KN + HI + EN
                  </span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer" onClick={handleOpenModal}>
                  <p className="text-sm sm:text-base font-black italic tracking-tight text-white leading-snug drop-shadow-md flex-1">
                    "{anonGreeting || "Fir aa gaye? Addiction hai na? 😂"}"
                  </p>
                  <button 
                    type="button"
                    onClick={(e) => handleShuffleGreeting(e)}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 transition-all shrink-0 active:scale-95"
                    title="Click to shuffle quote"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                title="Change Persona or Languages"
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
              className="relative w-full max-w-md bg-[#161616] border border-amber-500/30 rounded-t-[32px] sm:rounded-[28px] p-5 sm:p-6 text-left shadow-2xl z-10 flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-3 shrink-0">
                <div className="space-y-0.5">
                  <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                    Let's customize your experience! 🎉
                  </h3>
                  <p className="text-xs font-semibold text-gray-400">
                    Get custom greetings in your favorite language!
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

              {/* Form with scrollable body & sticky submit button */}
              <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 pt-4">
                <div className="overflow-y-auto space-y-4 pr-1 flex-1 pb-4">
                  {/* 1. Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                      1. Enter Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul / Ananya"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      required
                      className="w-full bg-[#222222] border border-white/15 focus:border-amber-400 rounded-2xl py-3 px-4 outline-none font-bold text-sm text-white placeholder:text-gray-500 transition-colors shadow-inner"
                    />
                  </div>

                  {/* 2. Role Title Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                      2. Select Your Persona
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* King Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTitle('King');
                          playSound(SOUNDS.CLICK);
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          selectedTitle === 'King'
                            ? 'bg-gradient-to-b from-amber-500/25 to-orange-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10 scale-[1.01]'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl">👑</span>
                        <span className="font-black text-xs uppercase tracking-wider">King</span>
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
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          selectedTitle === 'Queen'
                            ? 'bg-gradient-to-b from-pink-500/25 to-purple-500/20 border-pink-400 text-white shadow-lg shadow-pink-500/10 scale-[1.01]'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl">👑</span>
                        <span className="font-black text-xs uppercase tracking-wider">Queen</span>
                        {selectedTitle === 'Queen' && (
                          <span className="text-[9px] font-bold text-pink-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3. Language Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                        <Languages className="w-3 h-3 text-amber-400" />
                        3. Preferred Language(s)
                      </label>
                      <span className="text-[9px] text-gray-400 font-bold">Select preference</span>
                    </div>

                    {/* All 3 / Mix Quick Toggle */}
                    <button
                      type="button"
                      onClick={selectAllThree}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isAllThreeSelected
                          ? 'bg-gradient-to-r from-amber-500/30 via-pink-500/30 to-purple-500/30 border-amber-400 text-amber-300 shadow-md scale-[1.01]'
                          : 'bg-[#1e1e1e] border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span>🌈 All 3 (Mix of All!)</span>
                      {isAllThreeSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    {/* Individual Language Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-0.5">
                      {/* Kannada Button */}
                      <button
                        type="button"
                        onClick={() => toggleLanguage('kannada')}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selectedLangs.includes('kannada')
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-sm">🟡</span>
                        <span className="text-[10px] font-bold">Kannada</span>
                        {selectedLangs.includes('kannada') && (
                          <span className="text-[8px] text-amber-400">Selected</span>
                        )}
                      </button>

                      {/* Hindi Button */}
                      <button
                        type="button"
                        onClick={() => toggleLanguage('hindi')}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selectedLangs.includes('hindi')
                            ? 'bg-orange-500/20 border-orange-400 text-orange-300 font-black'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-sm">🟠</span>
                        <span className="text-[10px] font-bold">Hindi</span>
                        {selectedLangs.includes('hindi') && (
                          <span className="text-[8px] text-orange-400">Selected</span>
                        )}
                      </button>

                      {/* English Button */}
                      <button
                        type="button"
                        onClick={() => toggleLanguage('english')}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          selectedLangs.includes('english')
                            ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-black'
                            : 'bg-[#222222] border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-sm">🔵</span>
                        <span className="text-[10px] font-bold">English</span>
                        {selectedLangs.includes('english') && (
                          <span className="text-[8px] text-blue-400">Selected</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Always-Visible Sticky Submit Button Footer */}
                <div className="shrink-0 pt-3 border-t border-white/10 bg-[#161616]">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
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
