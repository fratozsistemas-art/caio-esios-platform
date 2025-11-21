import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreHomeAnimation({ onComplete }) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Complete animation after video duration (adjust timing as needed)
    const completeTimer = setTimeout(() => {
      setShowAnimation(false);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 8000); // Adjust based on video duration

    return () => {
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
          transition={{ duration: 1 }}
          className="fixed inset-0 z-50 bg-[#050B1A] flex items-center justify-center overflow-hidden"
        >
          {/* Video Animation from Google Drive */}
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            onEnded={() => {
              setShowAnimation(false);
              setTimeout(() => onComplete(), 500);
            }}
          >
            <source 
              src="https://drive.google.com/uc?export=download&id=1cppCrFP5AlZndduB_ayTVAGYK0Fb3lLJ" 
              type="video/mp4" 
            />
            {/* Fallback for browsers that don't support the video */}
            <div className="flex items-center justify-center h-full">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
                alt="CAIO·AI" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}