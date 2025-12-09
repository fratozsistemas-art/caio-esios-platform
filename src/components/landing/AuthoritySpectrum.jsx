import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function AuthoritySpectrum() {
  const levels = [
    {
      name: "Subordinate",
      score: 35,
      risk: "High",
      value: "Low",
      checks: 1,
      description: "Takes orders, no strategic input"
    },
    {
      name: "Professional",
      score: 55,
      risk: "Medium",
      value: "Medium",
      checks: 2,
      description: "Executes well, occasional insights"
    },
    {
      name: "C-Suite",
      score: 75,
      risk: "Low",
      value: "High",
      checks: 2,
      description: "Strategic contributor, reliable"
    },
    {
      name: "Institutional Brain",
      score: 90,
      risk: "Minimal",
      value: "Very High",
      checks: 3,
      description: "Deep institutional knowledge, trusted"
    },
    {
      name: "Unwavering Peer",
      score: 98,
      risk: "None",
      value: "Maximum",
      checks: 3,
      description: "Equal strategic partner, full trust",
      highlight: true
    }
  ];

  return (
    <section className="py-20 bg-[#0B0F1A]/30 border-y border-[#00C8FF]/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-[#FFC247]/20 text-[#FFC247] border-[#FFC247]/40 mb-6" style={{ boxShadow: '0 0 20px rgba(255, 194, 71, 0.3)' }}>
            Authority Positioning Spectrum
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#EAF6FF] mb-4">
            Where CAIO·AI Operates
          </h2>
          <p className="text-lg text-[#A7B2C4] max-w-3xl mx-auto font-light">
            Most AI tools stay at "Subordinate" or "Professional" levels. CAIO·AI is architected for the highest tier.
          </p>
        </div>

        <div className="relative">
          {/* Gradient Bar Background */}
          <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-blue-500/20 to-[#00C8FF]/40" />

          {/* Levels */}
          <div className="relative grid grid-cols-5 gap-4">
            {levels.map((level, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex"
              >
                <Card 
                  className={`${
                    level.highlight 
                      ? 'bg-gradient-to-br from-[#00C8FF]/20 to-[#FFC247]/20 border-[#FFC247]/60' 
                      : 'bg-[#0B0F1A]/50 border-[#00C8FF]/20'
                  } backdrop-blur-sm hover:scale-105 transition-all duration-200 w-full flex flex-col`}
                  style={{ 
                    boxShadow: level.highlight 
                      ? '0 0 40px rgba(255, 194, 71, 0.4)' 
                      : '0 0 20px rgba(0, 200, 255, 0.1)'
                  }}
                >
                  <CardContent className="p-6 text-center flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex justify-center gap-1 mb-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Check 
                            key={i}
                            className={`w-4 h-4 ${
                              i < level.checks 
                                ? level.highlight ? 'text-[#FFC247]' : 'text-[#00C8FF]'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${level.highlight ? 'text-[#FFC247]' : 'text-[#EAF6FF]'}`}>
                        {level.name}
                      </h3>
                      <div className={`text-3xl font-bold mb-3 ${level.highlight ? 'text-[#FFC247]' : 'text-[#00C8FF]'}`}>
                        {level.score}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#A7B2C4]">Risk:</span>
                        <span className={level.risk === 'None' || level.risk === 'Minimal' ? 'text-green-400' : 'text-yellow-400'}>
                          {level.risk}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#A7B2C4]">Value:</span>
                        <span className={level.value === 'Maximum' || level.value === 'Very High' ? 'text-[#00C8FF]' : 'text-gray-400'}>
                          {level.value}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#A7B2C4] font-light leading-relaxed flex-grow">
                      {level.description}
                    </p>

                    {level.highlight && (
                      <div className="mt-4 pt-4 border-t border-[#FFC247]/20">
                        <Badge className="bg-[#FFC247]/30 text-[#FFC247] text-[10px]">
                          CAIO·AI Target
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-[#A7B2C4] max-w-2xl mx-auto font-light">
            CAIO·AI is designed to operate at the <span className="text-[#FFC247] font-semibold">Unwavering Peer</span> level—
            a strategic partner with full institutional context, cognitive governance, and executive-grade intelligence.
          </p>
        </div>
      </div>
    </section>
  );
}