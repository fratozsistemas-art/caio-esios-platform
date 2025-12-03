import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, Sparkles } from "lucide-react";
import NeuralIntelligenceArchive from "../components/nia/NeuralIntelligenceArchive";

/**
 * NIA PAGE — Neural Intelligence Archive
 * 
 * Página dedicada à camada de Memória Institucional
 */

export default function NeuralIntelligenceArchivePage() {
  const handlePrecedentSelect = (precedent) => {
    console.log('Precedent selected:', precedent);
    // Could navigate to related decision or open detail modal
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-400" />
            Neural Intelligence Archive
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 ml-2">
              NIA
            </Badge>
          </h1>
          <p className="text-slate-400 mt-1">
            Memória institucional, aprendizado contínuo e recuperação de precedentes
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30 px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Codex CAIO.AI v12.3+
        </Badge>
      </div>

      {/* Documentation Card */}
      <Card className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border-indigo-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-1">Sobre a Camada NIA</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                A <strong className="text-indigo-400">Neural Intelligence Archive (NIA)</strong> é a camada de memória institucional 
                da arquitetura cognitiva v12.3+. Ela captura decisões, resultados e lições aprendidas, 
                permitindo que o sistema aprenda com o passado e forneça precedentes históricos 
                para informar novas decisões estratégicas.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-white/10 text-slate-300">Persistência de Histórico</Badge>
                <Badge className="bg-white/10 text-slate-300">Aprendizado via Feedback</Badge>
                <Badge className="bg-white/10 text-slate-300">Busca de Precedentes</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main NIA Component */}
      <NeuralIntelligenceArchive onPrecedentSelect={handlePrecedentSelect} />
    </div>
  );
}