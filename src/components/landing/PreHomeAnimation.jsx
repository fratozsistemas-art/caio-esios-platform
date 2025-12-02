import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";

export default function PreHomeAnimation({ onComplete }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [rememberChoice, setRememberChoice] = useState(false);

  useEffect(() => {
    // Complete animation after 6 seconds (GIF duration)
    const completeTimer = setTimeout(() => {
      setShowAnimation(false);
    }, 6000);

    const endTimer = setTimeout(() => {
      onComplete();
    }, 7000);

    return () => {
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
          style={{ backgroundColor: '#0A1628' }}
        >
          {/* Animated logo with glow effect */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#00C8FF] blur-[120px] rounded-full" aria-hidden="true" 
              style={{ 
                animation: 'logoGlow 4s ease-in-out infinite',
                width: '600px',
                height: '600px'
              }} 
            />
            <div className="absolute inset-0 bg-[#00C8FF] blur-[60px] rounded-full" aria-hidden="true" 
              style={{ 
                animation: 'logoGlow 4s ease-in-out infinite 0.5s',
                width: '600px',
                height: '600px'
              }} 
            />
            <img 
              src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/f9665b60c_A20short20intro20animation20for20a20video20featuring20the20metallic20CAIOC2B7AI20logo20The20camera20starts20with20a20close-up20on20the20glowing20brain20symbol2C20then20smoothly20pulls20back20to20reveal20the20full.gif" 
              alt="CAIO·AI Logo Animation" 
              className="w-[600px] h-[600px] object-contain relative z-10"
              style={{ filter: 'drop-shadow(0 0 80px rgba(0, 200, 255, 0.9)) drop-shadow(0 0 40px rgba(0, 200, 255, 0.7))' }}
            />
          </div>
          
          {/* Skip Button */}
          <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <input
                type="checkbox"
                id="rememberChoice"
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              />
              <label htmlFor="rememberChoice" className="text-sm text-white cursor-pointer">
                Lembre-se da minha escolha
              </label>
            </div>
            <Button
              onClick={handleSkip}
              variant="outline"
              className="bg-black/50 backdrop-blur-sm border-white/30 text-white hover:bg-white/10 hover:border-white/50"
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