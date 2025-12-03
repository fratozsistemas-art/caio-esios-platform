import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Database, Sparkles, Lightbulb } from "lucide-react";
import NeuralIntelligenceArchive from "../components/nia/NeuralIntelligenceArchive";
import NIALearningEngine from "../components/nia/NIALearningEngine";

/**
 * NIA PAGE — Neural Intelligence Archive
 * 
 * Página dedicada à camada de Memória Institucional + Motor de Aprendizado
 */

export default function NeuralIntelligenceArchivePage() {
  const [activeTab, setActiveTab] = useState("archive");

  const handlePrecedentSelect = (precedent) => {
    console.log('Precedent selected:', precedent);
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

      {/* Tabs for Archive vs Learning Engine */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="archive" className="data-[state=active]:bg-indigo-500/20">
            <Database className="w-4 h-4 mr-2" />
            Arquivo de Memórias
          </TabsTrigger>
          <TabsTrigger value="learning" className="data-[state=active]:bg-purple-500/20">
            <Lightbulb className="w-4 h-4 mr-2" />
            Motor de Aprendizado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="archive" className="mt-6">
          <NeuralIntelligenceArchive onPrecedentSelect={handlePrecedentSelect} />
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <NIALearningEngine 
            onInsightGenerated={(insights) => {
              console.log('Learning insights:', insights);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}