import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Clock, Zap, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const useSafeNavigate = () => {
  try {
    return useNavigate();
  } catch (error) {
    console.warn("Navigation is unavailable; falling back to direct links.", error);
    return null;
  }
};

export default function QuickActionCard({ action, roleColor = "blue", themeColor = "blue" }) {
  const navigate = useSafeNavigate();
  const safeAction = action ?? {};
  const title = safeAction.title ?? "";
  const expectedOutputs = safeAction.expected_outputs ?? [];
  const displayColor = themeColor || roleColor;
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const colorClasses = {
    blue: { bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-400" },
    green: { bg: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", text: "text-green-400" },
    purple: { bg: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", text: "text-purple-400" },
    red: { bg: "from-red-500/20 to-orange-500/20", border: "border-red-500/30", text: "text-red-400" },
    pink: { bg: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", text: "text-pink-400" },
    orange: { bg: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/30", text: "text-orange-400" },
    cyan: { bg: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30", text: "text-cyan-400" },
    indigo: { bg: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30", text: "text-indigo-400" },
    slate: { bg: "from-slate-500/20 to-slate-600/20", border: "border-slate-500/30", text: "text-slate-400" }
  };

  const colors = colorClasses[displayColor] || colorClasses.blue;

  const handleActivate = async () => {
    if (title.includes("Strategic Intelligence Unit")) {
      const target = createPageUrl("StrategicIntelligence");
      if (navigate) {
        navigate(target);
        return;
      }
      window.location.href = target;
      return;
    }

    // Execute quick action via backend
    setIsExecuting(true);
    try {
      const response = await base44.functions.invoke('executeQuickAction', {
        action: safeAction,
        inputs: {
          context: `Execute ${safeAction.category} analysis for ${title}`
        }
      });

      if (response.data.success) {
        setResults(response.data);
        setShowResults(true);
        toast.success(`${title} executado com sucesso!`);
      } else {
        toast.error('Falha ao executar ação');
      }
    } catch (error) {
      console.error('Error executing quick action:', error);
      toast.error('Erro ao executar ação rápida');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
      <CardHeader className="border-b border-white/10">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-white text-lg leading-tight">
            {title}
          </CardTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {safeAction.category}
          </span>
          {safeAction.theme && (
            <span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
              {safeAction.theme}
            </span>
          )}
          {safeAction.role && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {safeAction.role}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {safeAction.estimated_time && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Tempo estimado: {safeAction.estimated_time}</span>
          </div>
        )}

        {expectedOutputs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Entregas:</h4>
            <ul className="space-y-1">
              {expectedOutputs.slice(0, 3).map((output, idx) => (
                <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                  <span className={`${colors.text} mt-1`}>•</span>
                  <span>{output}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleActivate}
          disabled={isExecuting}
          className={`w-full bg-gradient-to-r ${colors.bg} border ${colors.border} ${colors.text} hover:opacity-80 group-hover:translate-x-1 transition-all duration-300`}
          variant="outline"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              {title.includes("Strategic Intelligence") ? "Configurar SIU" : "Ativar Análise"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              {title} - Resultados
            </DialogTitle>
          </DialogHeader>
          
          {results && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between text-sm text-slate-400 pb-3 border-b border-slate-800">
                <span>Categoria: {results.category}</span>
                <span>Executado: {new Date(results.executed_at).toLocaleString('pt-BR')}</span>
              </div>

              {/* Strategy Results */}
              {results.category === 'Strategy' && results.results && (
                <>
                  {results.results.analise_competitiva && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h3 className="text-blue-400 font-semibold mb-2">Análise Competitiva</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{results.results.analise_competitiva}</p>
                    </div>
                  )}
                  {results.results.mapeamento_mercado && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h3 className="text-purple-400 font-semibold mb-2">Mapeamento de Mercado</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{results.results.mapeamento_mercado}</p>
                    </div>
                  )}
                  {results.results.plano_acao && Array.isArray(results.results.plano_acao) && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h3 className="text-green-400 font-semibold mb-2">Plano de Ação Estratégico</h3>
                      <ul className="space-y-2">
                        {results.results.plano_acao.map((item, idx) => (
                          <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Security Results */}
              {results.category === 'Security' && results.results && (
                <>
                  {results.results.inventario_riscos && Array.isArray(results.results.inventario_riscos) && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <h3 className="text-red-400 font-semibold mb-3">Inventário de Riscos</h3>
                      <div className="space-y-2">
                        {results.results.inventario_riscos.map((risk, idx) => (
                          <div key={idx} className="bg-slate-800/50 rounded p-3 text-sm">
                            <div className="text-slate-200">{risk.name || risk.risk}</div>
                            <div className="text-slate-400 text-xs mt-1">Severidade: {risk.severity || risk.nivel}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.results.checklist_compliance && Array.isArray(results.results.checklist_compliance) && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h3 className="text-yellow-400 font-semibold mb-3">Checklist de Compliance</h3>
                      <div className="space-y-2">
                        {results.results.checklist_compliance.map((item, idx) => (
                          <div key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span>{item.control || item.item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.results.plano_mitigacao && Array.isArray(results.results.plano_mitigacao) && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h3 className="text-green-400 font-semibold mb-2">Plano de Mitigação</h3>
                      <ul className="space-y-2">
                        {results.results.plano_mitigacao.map((item, idx) => (
                          <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Operations Results */}
              {results.category === 'Operations' && results.results && (
                <>
                  {results.results.health_scorecard && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                      <h3 className="text-cyan-400 font-semibold mb-3">Health Scorecard</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(results.results.health_scorecard).map(([key, value]) => (
                          <div key={key} className="bg-slate-800/50 rounded p-2">
                            <div className="text-slate-400 text-xs">{key}</div>
                            <div className="text-slate-200">{typeof value === 'object' ? JSON.stringify(value) : value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.results.ajustes_alertas && Array.isArray(results.results.ajustes_alertas) && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                      <h3 className="text-orange-400 font-semibold mb-3">Ajustes de Alertas</h3>
                      <div className="space-y-2">
                        {results.results.ajustes_alertas.map((alert, idx) => (
                          <div key={idx} className="bg-slate-800/50 rounded p-3 text-sm">
                            <div className="text-slate-200">{alert.metric || alert.alerta}</div>
                            <div className="text-slate-400 text-xs mt-1">{alert.threshold || alert.limite}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.results.recomendacoes_automacao && Array.isArray(results.results.recomendacoes_automacao) && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h3 className="text-purple-400 font-semibold mb-2">Recomendações de Automação</h3>
                      <ul className="space-y-2">
                        {results.results.recomendacoes_automacao.map((item, idx) => (
                          <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => setShowResults(false)}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Fechar
                </Button>
                {results.analysis_id && (
                  <Button
                    onClick={() => {
                      const target = createPageUrl("AnalysesDashboard");
                      if (navigate) {
                        navigate(target);
                      } else {
                        window.location.href = target;
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Ver Análise Completa
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}