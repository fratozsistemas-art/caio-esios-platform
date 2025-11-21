import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const floatingWords = [
  "Executive Intelligence",
  "Strategic Synthesis",
  "Cognitive Governance",
  "Institutional Brain",
  "Decision Architecture",
  "Capital Intelligence",
  "Unwavering Peer"
];

export default function PreHomeAnimation({ onComplete }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [currentWords, setCurrentWords] = useState([]);

  useEffect(() => {
    // Schedule words to appear at different times
    const wordTimers = floatingWords.map((word, idx) => {
      return setTimeout(() => {
        setCurrentWords(prev => [...prev, {
          text: word,
          id: idx,
          x: Math.random() * 60 + 20, // 20-80%
          y: Math.random() * 60 + 20  // 20-80%
        }]);
      }, idx * 1200);
    });

    // Start fade out after 10 seconds
    const fadeTimer = setTimeout(() => {
      setShowAnimation(false);
    }, 10000);

    // Complete animation after fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 11500);

    return () => {
      wordTimers.forEach(timer => clearTimeout(timer));
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-50 bg-[#050B1A] flex items-center justify-center overflow-hidden"
        >
          {/* Floating Words */}
          {currentWords.map((word) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1, 1, 0.8]
              }}
              transition={{
                duration: 3,
                times: [0, 0.2, 0.8, 1],
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                left: `${word.x}%`,
                top: `${word.y}%`,
              }}
              className="text-[#00C8FF]/40 text-sm md:text-base font-light whitespace-nowrap"
            >
              {word.text}
            </motion.div>
          ))}

          {/* Central Logo with Rotation and Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: 360
            }}
            transition={{
              opacity: { duration: 1 },
              scale: { duration: 1 },
              rotate: { duration: 10, ease: "linear" }
            }}
            className="relative"
          >
            {/* Alternating Glow Effect */}
            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-[#00C8FF] via-[#16A9FF] to-[#FFC247] opacity-30 blur-3xl rounded-full"
              style={{ transform: 'scale(1.5)' }}
            />

            <motion.div
              animate={{
                opacity: [0.8, 0.3, 0.8],
                scale: [1.2, 1, 1.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
              className="absolute inset-0 bg-gradient-to-r from-[#FFC247] via-[#E0A43C] to-[#00C8FF] opacity-30 blur-3xl rounded-full"
              style={{ transform: 'scale(1.5)' }}
            />

            {/* Logo */}
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
              alt="CAIO·AI" 
              className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-[0_0_60px_rgba(0,200,255,0.8)]"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
            transition={{
              duration: 10,
              times: [0, 0.1, 0.9, 1]
            }}
            className="absolute bottom-32 text-center"
          >
            <div className="text-[#00C8FF] text-xl md:text-2xl font-light mb-2" style={{ fontFamily: '"Inter", sans-serif' }}>
              TSI v9.3
            </div>
            <div className="text-[#A7B2C4] text-sm md:text-base font-light" style={{ fontFamily: '"Inter", sans-serif' }}>
              11 Cognitive Modules
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}