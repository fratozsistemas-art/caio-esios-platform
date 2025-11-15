import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { User, Brain, Target, TrendingUp, Shield, Sparkles, CheckCircle } from "lucide-react";

const AGENT_PERSONAS = [
  {
    id: 'strategic_advisor',
    name: 'Strategic Advisor',
    icon: Target,
    description: 'Focus on high-level strategy, market positioning, and long-term planning',
    color: 'from-blue-500 to-cyan-500',
    expertise: ['Strategic Planning', 'Market Analysis', 'Competitive Intelligence'],
    style: 'Executive-level insights with strategic frameworks'
  },
  {
    id: 'analytical_expert',
    name: 'Analytical Expert',
    icon: Brain,
    description: 'Deep-dive analysis with data-driven insights and detailed frameworks',
    color: 'from-purple-500 to-pink-500',
    expertise: ['Data Analysis', 'Financial Modeling', 'Risk Assessment'],
    style: 'Detailed, methodical, data-backed recommendations'
  },
  {
    id: 'innovation_catalyst',
    name: 'Innovation Catalyst',
    icon: Sparkles,
    description: 'Focus on innovation, disruption, and emerging opportunities',
    color: 'from-orange-500 to-red-500',
    expertise: ['Innovation Strategy', 'Tech Trends', 'Digital Transformation'],
    style: 'Forward-thinking, creative, opportunity-focused'
  },
  {
    id: 'execution_coach',
    name: 'Execution Coach',
    icon: TrendingUp,
    description: 'Practical implementation guidance and tactical execution',
    color: 'from-green-500 to-emerald-500',
    expertise: ['Implementation Planning', 'Project Management', 'Quick Wins'],
    style: 'Action-oriented, practical, step-by-step guidance'
  },
  {
    id: 'risk_guardian',
    name: 'Risk Guardian',
    icon: Shield,
    description: 'Risk assessment, compliance, and defensive strategy',
    color: 'from-slate-500 to-slate-700',
    expertise: ['Risk Management', 'Compliance', 'Crisis Planning'],
    style: 'Cautious, thorough, risk-aware recommendations'
  }
];

export default function AgentPersonaSelector({ currentPersona, onPersonaChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const current = AGENT_PERSONAS.find(p => p.id === currentPersona) || AGENT_PERSONAS[0];
  const Icon = current.icon;

  const handleSelect = (personaId) => {
    onPersonaChange(personaId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10 gap-2"
        >
          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center`}>
            <Icon className="w-3 h-3 text-white" />
          </div>
          <span>{current.name}</span>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
            Change
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-slate-900 border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Select Agent Persona</DialogTitle>
          <p className="text-slate-400 text-sm">
            Choose how CAIO should approach your conversations
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {AGENT_PERSONAS.map((persona) => {
            const PersonaIcon = persona.icon;
            const isSelected = persona.id === currentPersona;
            
            return (
              <Card
                key={persona.id}
                className={`bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-all ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleSelect(persona.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center`}>
                      <PersonaIcon className="w-6 h-6 text-white" />
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {persona.name}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-4">
                    {persona.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-2">Expertise:</div>
                      <div className="flex flex-wrap gap-2">
                        {persona.expertise.map((exp) => (
                          <Badge
                            key={exp}
                            className="bg-white/5 text-slate-300 border-white/10 text-xs"
                          >
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Communication Style:</div>
                      <div className="text-xs text-slate-400 italic">
                        {persona.style}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}