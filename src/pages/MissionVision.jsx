import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Eye, Sparkles, Quote, Brain, Zap, Network } from "lucide-react";
import { motion } from "framer-motion";

export default function MissionVision() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410]">
      {/* Header */}
      <div className="bg-[#0A1628]/95 backdrop-blur-xl border-b border-[#00D4FF]/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Landing')}>
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/f032804a4_CAIOAIlogooficial.png" 
                alt="CAIO·AI" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-white font-bold">CAIO·AI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30 mb-4">
            Filosofia & Propósito
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Missão, Visão e Princípio Sistêmico
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Os fundamentos que guiam a arquitetura cognitiva CAIO·AI
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#00D4FF]/5 border-[#00D4FF]/30 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#00D4FF]/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-[#00D4FF]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#00D4FF] mb-4">Missão</h2>
                  <p className="text-xl md:text-2xl text-white leading-relaxed font-light">
                    Construir sistemas inteligentes, éticos e eficientes que ampliem a capacidade humana de 
                    <span className="text-[#00D4FF] font-semibold"> navegar complexidade</span> e tomar 
                    <span className="text-[#00D4FF] font-semibold"> decisões de alto impacto</span>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-400 mb-4">Visão</h2>
                  <p className="text-xl md:text-2xl text-white leading-relaxed font-light">
                    Um ecossistema onde <span className="text-purple-400 font-semibold">inteligência artificial</span>, 
                    <span className="text-purple-400 font-semibold"> arquitetura humana</span> e 
                    <span className="text-purple-400 font-semibold"> narrativa simbólica</span> convergem para criar 
                    instituições mais claras, rápidas e coerentes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Systemic Principle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-br from-[#FFB800]/10 to-[#FFB800]/5 border-[#FFB800]/30 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#FFB800]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-[#FFB800]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#FFB800] mb-6">Princípio Sistêmico</h2>
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#FFB800]/30" />
                    <blockquote className="pl-8">
                      <p className="text-2xl md:text-3xl text-white leading-relaxed font-light italic mb-4">
                        "Não é sobre tarefas; é sobre <span className="text-[#FFB800] font-semibold not-italic">forças</span>."
                      </p>
                      <p className="text-2xl md:text-3xl text-white leading-relaxed font-light italic">
                        "Não é sobre hoje; é sobre o <span className="text-[#FFB800] font-semibold not-italic">padrão</span>."
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-white mb-6 text-center">Valores Fundamentais</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Inteligência Ética",
                description: "Sistemas que amplificam capacidades humanas mantendo alinhamento com valores éticos e sociais.",
                color: "cyan"
              },
              {
                icon: Network,
                title: "Coerência Sistêmica",
                description: "Arquiteturas que mantêm consistência narrativa e decisional através de múltiplos stakeholders.",
                color: "purple"
              },
              {
                icon: Zap,
                title: "Eficiência Adaptativa",
                description: "Capacidade de evoluir e se adaptar enquanto mantém velocidade e qualidade de entrega.",
                color: "amber"
              }
            ].map((value, idx) => (
              <Card key={idx} className={`bg-${value.color}-500/10 border-${value.color}-500/30`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl bg-${value.color}-500/20 flex items-center justify-center mx-auto mb-4`}>
                    <value.icon className={`w-6 h-6 text-${value.color}-400`} />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{value.title}</h4>
                  <p className="text-slate-400 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-400 mb-4">
            Explore a arquitetura completa que materializa esses princípios
          </p>
          <Link to={createPageUrl('CAIOArchitectureDoc')}>
            <Button className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] text-[#0A1628] font-semibold">
              Ver Arquitetura v12.x
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}