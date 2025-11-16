import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitMerge, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';

export default function BoardManagementBridge({ hermesAnalyses }) {
  // Group gaps by impact
  const criticalGaps = hermesAnalyses.filter(a => 
    (a.board_management_gaps || []).some(g => g.impact === 'critical')
  );
  const highGaps = hermesAnalyses.filter(a => 
    (a.board_management_gaps || []).some(g => g.impact === 'high')
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-purple-400" />
            Board-Management Bridge
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Hermes identifica e medeia gaps de informação entre Conselho e Gestão, reduzindo assimetria e melhorando governança
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical Gaps */}
          {criticalGaps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white">Gaps Críticos</h3>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  {criticalGaps.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {criticalGaps.map(analysis => 
                  analysis.board_management_gaps
                    ?.filter(g => g.impact === 'critical')
                    .map((gap, idx) => (
                      <GapCard key={`${analysis.id}-${idx}`} gap={gap} severity="critical" />
                    ))
                )}
              </div>
            </div>
          )}

          {/* High Priority Gaps */}
          {highGaps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Gaps de Alta Prioridade</h3>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {highGaps.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {highGaps.map(analysis => 
                  analysis.board_management_gaps
                    ?.filter(g => g.impact === 'high')
                    .map((gap, idx) => (
                      <GapCard key={`${analysis.id}-${idx}`} gap={gap} severity="high" />
                    ))
                )}
              </div>
            </div>
          )}

          {hermesAnalyses.length === 0 && (
            <div className="text-center py-12">
              <GitMerge className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Nenhuma análise de gaps Board-Management disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bridge Recommendations Summary */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            Estratégias de Ponte Sugeridas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <BridgeStrategy
              title="Tradução de Linguagem"
              description="Converter jargão técnico em linguagem executiva/fiduciária para o Board"
              count={criticalGaps.filter(a => a.board_management_gaps?.some(g => g.gap_type === 'language_mismatch')).length}
            />
            <BridgeStrategy
              title="Contextualização Estratégica"
              description="Adicionar contexto estratégico de longo prazo para dados operacionais"
              count={hermesAnalyses.filter(a => a.board_management_gaps?.some(g => g.gap_type === 'missing_context')).length}
            />
            <BridgeStrategy
              title="Alinhamento de Timeline"
              description="Reconciliar perspectivas de curto prazo (Management) e longo prazo (Board)"
              count={hermesAnalyses.filter(a => a.board_management_gaps?.some(g => g.gap_type === 'timeline_misalignment')).length}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GapCard({ gap, severity }) {
  const colorMap = {
    critical: 'bg-red-500/10 border-red-500/30',
    high: 'bg-orange-500/10 border-orange-500/30',
    medium: 'bg-yellow-500/10 border-yellow-500/30'
  };

  return (
    <div className={`rounded-lg p-3 border ${colorMap[severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <Badge className="bg-white/10 text-white border-white/20 text-xs">
          {gap.gap_type?.replace(/_/g, ' ')}
        </Badge>
        <Badge className={`text-xs ${
          severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
          'bg-orange-500/20 text-orange-400 border-orange-500/30'
        }`}>
          {gap.impact}
        </Badge>
      </div>
      <p className="text-sm text-white mb-2">{gap.description}</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Ponte Sugerida:</span>
        <ArrowRight className="w-3 h-3 text-cyan-400" />
        <span className="text-cyan-400">{gap.suggested_bridge}</span>
      </div>
    </div>
  );
}

function BridgeStrategy({ title, description, count }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-purple-400">{count}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>
    </div>
  );
}