import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Languages, Eye, BookOpen, Network, Sparkles, History, Trash2 } from "lucide-react";
import { format } from "date-fns";
import TISInterpretationModule from "../components/tis/TISInterpretationModule";

/**
 * TIS PAGE — Translational Interpretation System
 * 
 * Camada de Interpretação Sistêmica v12.3
 */

export default function TISInterpretation() {
  const [showHistory, setShowHistory] = useState(false);

  const { data: analyses = [] } = useQuery({
    queryKey: ['tis_analyses'],
    queryFn: () => base44.entities.TISAnalysis.list('-created_date', 20)
  });

  const handleAnalysisComplete = (result) => {
    console.log('TIS Analysis complete:', result);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'semiotic': return <Eye className="w-4 h-4" />;
      case 'narrative': return <BookOpen className="w-4 h-4" />;
      case 'pattern_discovery': return <Network className="w-4 h-4" />;
      default: return <Languages className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'semiotic': return "bg-blue-500/20 text-blue-400";
      case 'narrative': return "bg-purple-500/20 text-purple-400";
      case 'pattern_discovery': return "bg-cyan-500/20 text-cyan-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Languages className="w-8 h-8 text-blue-400" />
            TIS — Interpretação Sistêmica
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 ml-2">
              v12.3
            </Badge>
          </h1>
          <p className="text-slate-400 mt-1">
            Análise semiótica, modelagem narrativa e descoberta de padrões ocultos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className={`border-white/10 ${showHistory ? 'bg-white/10 text-white' : 'text-slate-400'}`}
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? 'Ocultar' : 'Ver'} Histórico ({analyses.length})
          </Button>
          <Badge className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Codex CAIO.AI
          </Badge>
        </div>
      </div>

      {/* Documentation Card */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Languages className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-1">Sobre a Camada TIS</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                A <strong className="text-blue-400">Translational Interpretation System (TIS)</strong> traduz fenômenos 
                complexos para modelos operáveis. Inclui análise semiótica (decodificação de significados culturais), 
                modelagem narrativa (storytelling estratégico) e descoberta de padrões ocultos integrada ao Knowledge Graph.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-blue-500/10 text-blue-400">
                  <Eye className="w-3 h-3 mr-1" />
                  Semiótica
                </Badge>
                <Badge className="bg-purple-500/10 text-purple-400">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Narrativa
                </Badge>
                <Badge className="bg-cyan-500/10 text-cyan-400">
                  <Network className="w-3 h-3 mr-1" />
                  Padrões
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Panel (if shown) */}
      {showHistory && analyses.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Análises Anteriores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {analyses.map((analysis) => (
              <div 
                key={analysis.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${getTypeColor(analysis.analysis_type)}`}>
                    {getTypeIcon(analysis.analysis_type)}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{analysis.title}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(analysis.created_date), 'dd/MM/yy HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(analysis.analysis_type)}>
                    {analysis.analysis_type}
                  </Badge>
                  {analysis.confidence_score && (
                    <Badge className="bg-green-500/20 text-green-400">
                      {analysis.confidence_score}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main TIS Module */}
      <TISInterpretationModule onAnalysisComplete={handleAnalysisComplete} />
    </div>
  );
}