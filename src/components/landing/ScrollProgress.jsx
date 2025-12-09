import React, { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    // Find all sections with IDs
    const sectionElements = document.querySelectorAll("section[id]");
    const sectionData = Array.from(sectionElements).map(el => ({
      id: el.id,
      name: el.getAttribute('aria-labelledby') || el.id,
      offset: el.offsetTop
    }));
    setSections(sectionData);

    // Track active section on scroll
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const current = sectionData.find((section, idx) => {
        const next = sectionData[idx + 1];
        return scrollPosition >= section.offset && (!next || scrollPosition < next.offset);
      });
      if (current) setActiveSection(current.id);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#00D4FF] origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Section milestones (desktop only) */}
      <div className="hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block group"
              aria-label={`Go to ${section.name}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                  activeSection === section.id ? 'opacity-100' : ''
                }`}>
                  {section.name}
                </span>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeSection === section.id 
                    ? 'w-8 bg-[#00D4FF] shadow-lg' 
                    : 'bg-white/30 group-hover:bg-white/60'
                }`} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}