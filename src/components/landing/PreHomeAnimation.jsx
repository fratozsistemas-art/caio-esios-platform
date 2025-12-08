import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";

export default function PreHomeAnimation({ onComplete }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const phase1 = setTimeout(() => setPhase(2), 1500);
    const phase2 = setTimeout(() => setPhase(3), 3000);
    const completeTimer = setTimeout(() => {
      setShowAnimation(false);
    }, 6000);
    const endTimer = setTimeout(() => {
      onComplete();
    }, 7000);

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(completeTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (rememberChoice) {
      localStorage.setItem('caio_skip_intro', 'true');
    }
    setShowAnimation(false);
    setTimeout(() => onComplete(), 100);
  };

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #06101F 0%, #0A1E3A 40%, #112A4D 70%, #06101F 100%)'
          }}
        >
          {/* 7 Caminhos de Hermes - Linhas douradas radiais */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: phase >= 2 ? 1 : 0, transition: 'opacity 1s' }}>
            <defs>
              <linearGradient id="goldPath" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#06101F', stopOpacity: 0 }} />
                <stop offset="30%" style={{ stopColor: '#C7A763', stopOpacity: 0.6 }} />
                <stop offset="50%" style={{ stopColor: '#E3C37B', stopOpacity: 0.9 }} />
                <stop offset="70%" style={{ stopColor: '#C7A763', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#06101F', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const angle = (i * 360) / 7;
              const rad = (angle * Math.PI) / 180;
              const x2 = 50 + Math.cos(rad) * 50;
              const y2 = 50 + Math.sin(rad) * 50;
              return (
                <motion.line
                  key={i}
                  x1="50%"
                  y1="50%"
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="url(#goldPath)"
                  strokeWidth="2"
                  className={`travessia-hermes travessia-hermes-${i + 1}`}
                  initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                />
              );
            })}
          </svg>

          {/* Pulsação dourada concêntrica */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2"
                style={{
                  borderColor: '#C7A763',
                  width: '400px',
                  height: '400px',
                  opacity: 0
                }}
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Logo central com glow dourado */}
          <motion.div 
            className="relative z-10 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Glow dourado de fundo */}
            <div 
              className="absolute inset-0 rounded-full blur-[100px]"
              style={{
                background: 'radial-gradient(circle, #C7A763 0%, #E3C37B 30%, transparent 70%)',
                width: '600px',
                height: '600px',
                animation: 'caioPulse 2.5s ease-in-out infinite'
              }}
            />
            
            {/* Logo */}
            <img 
              src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
              alt="CAIO·AI" 
              className="w-[400px] h-[400px] object-contain relative z-20"
              style={{ 
                filter: 'drop-shadow(0 0 60px rgba(199, 167, 99, 0.8)) drop-shadow(0 0 30px rgba(227, 195, 123, 0.6))'
              }}
            />
          </motion.div>

          {/* Texto de entrada - fase 3 */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-1/4 text-center"
              >
                <p className="text-2xl font-bold text-gold-gradient mb-2" 
                   style={{
                     background: 'linear-gradient(135deg, #C7A763 0%, #E3C37B 50%, #C7A763 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     backgroundClip: 'text'
                   }}>
                  Inteligência que vira tração
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Skip Button */}
          <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#C7A763]/20">
              <input
                type="checkbox"
                id="rememberChoice"
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
                className="w-4 h-4 rounded border-[#C7A763]/30 bg-white/10"
              />
              <label htmlFor="rememberChoice" className="text-sm text-[#E3C37B] cursor-pointer">
                Lembre-se da minha escolha
              </label>
            </div>
            <Button
              onClick={handleSkip}
              variant="outline"
              className="bg-black/50 backdrop-blur-sm border-[#C7A763]/30 text-[#E3C37B] hover:bg-[#C7A763]/10 hover:border-[#C7A763]/50"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Pular Intro
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}