import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const floatingWords = [
  "Market Intelligence",
  "Strategic Synthesis",
  "Financial Modeling",
  "Competitive Analysis",
  "Risk Assessment",
  "M&A Evaluation",
  "Digital Transformation",
  "Innovation Strategy",
  "Capital Allocation",
  "Growth Opportunity",
  "Operational Excellence",
  "ESG Framework",
  "Technology Stack",
  "Customer Success",
  "Product Launch",
  "Business Intelligence",
  "Executive Decision",
  "Portfolio Optimization",
  "Cost Efficiency",
  "Market Entry"
];

export default function PreHomeAnimation({ onComplete }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [currentWords, setCurrentWords] = useState([]);

  useEffect(() => {
    // Schedule words to appear at different times with staggered timing
    const wordTimers = floatingWords.map((word, idx) => {
      return setTimeout(() => {
        setCurrentWords(prev => [...prev, {
          text: word,
          id: idx,
          x: Math.random() * 70 + 15, // 15-85%
          y: Math.random() * 70 + 15, // 15-85%
          size: Math.random() * 0.5 + 0.8, // 0.8-1.3x size variation
          delay: Math.random() * 2 // Random delay for variety
        }]);
      }, idx * 400);
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
          {/* Floating Word Cloud */}
          {currentWords.map((word) => (
            <motion.div
              key={word.id}
              initial={{ 
                opacity: 0, 
                scale: 0.5,
                x: 0,
                y: 0
              }}
              animate={{ 
                opacity: [0, 1, 0.8, 1, 0],
                scale: [0.5, word.size, word.size * 1.1, word.size, 0.5],
                x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30, 0],
                y: [0, Math.random() * 40 - 20, Math.random() * 60 - 30, 0]
              }}
              transition={{
                duration: 4 + word.delay,
                times: [0, 0.15, 0.5, 0.85, 1],
                ease: "easeInOut",
                delay: word.delay
              }}
              style={{
                position: 'absolute',
                left: `${word.x}%`,
                top: `${word.y}%`,
                fontSize: `${word.size}rem`,
                textShadow: '0 0 20px rgba(255, 194, 71, 0.6), 0 0 40px rgba(255, 194, 71, 0.3)',
              }}
              className="text-[#00C8FF] font-medium whitespace-nowrap pointer-events-none"
            >
              {word.text}
            </motion.div>
          ))}

          {/* Central Glow Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 0.6, 0.8, 0.6, 0],
              scale: [0.5, 1.2, 1.5, 1.2, 0.5]
            }}
            transition={{
              duration: 10,
              times: [0, 0.2, 0.5, 0.8, 1],
              ease: "easeInOut"
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#FFC247] via-[#00C8FF] to-[#FFC247] opacity-20 blur-[100px] rounded-full"
          />

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