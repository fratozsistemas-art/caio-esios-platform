import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";

export default function PreHomeAnimation({ onComplete }) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [rememberChoice, setRememberChoice] = useState(false);

  useEffect(() => {
    // Complete animation after 8 seconds (GIF duration)
    const completeTimer = setTimeout(() => {
      setShowAnimation(false);
    }, 8000);

    const endTimer = setTimeout(() => {
      onComplete();
    }, 9000);

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
          className="fixed inset-0 z-50 bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410] flex items-center justify-center overflow-hidden"
        >
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain max-w-4xl"
            src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/0af7642e8_Designsemnome.mp4"
          />
          
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