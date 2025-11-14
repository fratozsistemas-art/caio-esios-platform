import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ModeSelector({ selectedMode, onModeChange }) {
  const modes = [
    {
      id: 'express',
      name: 'Express Mode',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      duration: '3-5 days',
      price: '$5K-$15K',
      deliverables: ['D1', 'D2', 'D5'],
      features: [
        'Fast strategic decisions',
        'Board-level briefings',
        'Essential deliverables only',
        'CRV threshold: 60%',
        'Optional stop gates'
      ],
      useCases: [
        'Quick investment screening',
        'Time-sensitive opportunities',
        'Rapid strategic validation'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Mode',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      duration: '2-4 weeks',
      price: '$25K-$100K',
      deliverables: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
      features: [
        'Mission-critical decisions',
        'All 8 deliverables',
        'Strategic + Tactical + Operational',
        'CRV threshold: 70%',
        'Mandatory stop gates'
      ],
      useCases: [
        'M&A due diligence',
        'Market entry strategy',
        'Digital transformation'
      ]
    }
  ];

  return (
    <div>
      <label className="text-sm text-slate-400 mb-3 block">Analysis Mode</label>
      <div className="grid md:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <motion.div
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => onModeChange(mode.id)}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'bg-white/10 border-white/30 ring-2 ring-blue-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${mode.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{mode.name}</h3>
                        <p className="text-slate-400 text-sm">{mode.duration}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-6 h-6 text-green-400" />
                    )}
                  </div>

                  <div className="mb-4">
                    <Badge className={`bg-gradient-to-r ${mode.color} text-white`}>
                      {mode.price}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Deliverables:</p>
                      <div className="flex flex-wrap gap-1">
                        {mode.deliverables.map((d) => (
                          <Badge key={d} variant="outline" className="text-xs border-white/20 text-slate-400">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-2">Key Features:</p>
                      <ul className="space-y-1">
                        {mode.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}