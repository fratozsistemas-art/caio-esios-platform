import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreHomeAnimation({ onComplete }) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Complete animation after 12 seconds (video duration)
    const completeTimer = setTimeout(() => {
      setShowAnimation(false);
    }, 12000);

    const endTimer = setTimeout(() => {
      onComplete();
    }, 13000);

    return () => {
      clearTimeout(completeTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-50 bg-[#050B1A] flex items-center justify-center overflow-hidden"
        >
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
            src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/f63295790_A203D20brain2C20initially201002520organic20and20blue2C20slowly20rotates2027020degrees20over201220seconds2C20starting20from20a20side20view20and20ending20facing20fo20As20it20rotates2C20it20undergoes20a20stunn-4.mp4"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}