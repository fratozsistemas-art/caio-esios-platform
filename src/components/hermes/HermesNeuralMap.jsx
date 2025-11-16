import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function HermesNeuralMap({ cognitiveMetrics, hermesAnalyses }) {
  const canvasRef = useRef(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const centerX = width / 4;
    const centerY = height / 4;

    // Draw neural network background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, width / 2, height / 2);

    // Define cognitive zones
    const zones = [
      { name: 'Integridade Narrativa', angle: 0, score: getZoneScore('narrative_coherence'), color: '#06b6d4' },
      { name: 'Board-Management', angle: Math.PI / 4, score: getZoneScore('information_flow'), color: '#8b5cf6' },
      { name: 'Silos', angle: Math.PI / 2, score: getZoneScore('silo_score'), color: '#f59e0b' },
      { name: 'Tensões', angle: 3 * Math.PI / 4, score: getZoneScore('trust_level'), color: '#ef4444' },
      { name: 'Qualidade Decisão', angle: Math.PI, score: getZoneScore('decision_quality'), color: '#10b981' },
      { name: 'Coerência', angle: 5 * Math.PI / 4, score: 75, color: '#3b82f6' },
      { name: 'Rastreabilidade', angle: 3 * Math.PI / 2, score: 85, color: '#ec4899' },
      { name: 'Governança', angle: 7 * Math.PI / 4, score: 70, color: '#14b8a6' }
    ];

    function getZoneScore(metricType) {
      const metric = cognitiveMetrics.find(m => m.metric_type === metricType);
      return metric ? metric.current_score : 50;
    }

    // Draw connections between zones
    zones.forEach((zone1, i) => {
      zones.forEach((zone2, j) => {
        if (i < j) {
          const radius = 120;
          const x1 = centerX + Math.cos(zone1.angle) * radius;
          const y1 = centerY + Math.sin(zone1.angle) * radius;
          const x2 = centerX + Math.cos(zone2.angle) * radius;
          const y2 = centerY + Math.sin(zone2.angle) * radius;

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, zone1.color + '20');
          gradient.addColorStop(1, zone2.color + '20');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });
    });

    // Draw zones
    zones.forEach((zone) => {
      const radius = 120;
      const x = centerX + Math.cos(zone.angle) * radius;
      const y = centerY + Math.sin(zone.angle) * radius;

      // Pulsating effect based on health score
      const pulseSize = zone.score >= 80 ? 25 : zone.score >= 60 ? 20 : 15;

      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
      gradient.addColorStop(0, zone.color + 'aa');
      gradient.addColorStop(0.5, zone.color + '44');
      gradient.addColorStop(1, zone.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw node
      ctx.fillStyle = zone.score >= 80 ? '#fbbf24' : zone.score >= 60 ? zone.color : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Zone label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, x, y - 20);
      ctx.fillText(`${Math.round(zone.score)}%`, x, y + 25);
    });

    // Draw central core
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
    coreGradient.addColorStop(0, '#fbbf24');
    coreGradient.addColorStop(1, '#f59e0b');
    
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HERMES', centerX, centerY);

  }, [cognitiveMetrics, hermesAnalyses]);

  return (
    <div className="space-y-6">
      {/* Neural Map */}
      {viewMode === 'neural_map' && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Neural Map - Saúde Cognitiva Organizacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-96 rounded-lg"
            />
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-xs text-slate-400">Zona Saudável (80-100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-xs text-slate-400">Zona Neutra (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-slate-400">Zona de Tensão (&lt;60%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrity Analysis */}
      {viewMode === 'analyses' && (
        <IntegrityAnalysisPanel
          hermesAnalyses={hermesAnalyses}
          onSelectEntity={setSelectedEntity}
        />
      )}

      {/* Board Management Bridge */}
      {viewMode === 'board_bridge' && (
        <BoardManagementBridge
          hermesAnalyses={hermesAnalyses.filter(a => a.analysis_type === 'board_management_gap')}
        />
      )}

      {/* Recent Critical Issues */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Questões Críticas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hermesAnalyses
            .filter(a => (a.inconsistencies_detected || []).some(i => i.severity === 'critical'))
            .slice(0, 5)
            .map(analysis => (
              <div key={analysis.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {analysis.analysis_type.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {new Date(analysis.created_date).toLocaleDateString()}
                  </span>
                </div>
                {analysis.inconsistencies_detected
                  ?.filter(i => i.severity === 'critical')
                  .map((issue, idx) => (
                    <div key={idx} className="mt-2">
                      <p className="text-sm text-white font-medium">{issue.type}</p>
                      <p className="text-xs text-slate-400 mt-1">{issue.description}</p>
                      {issue.recommendation && (
                        <p className="text-xs text-cyan-400 mt-2">
                          → {issue.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          {hermesAnalyses.filter(a => 
            (a.inconsistencies_detected || []).some(i => i.severity === 'critical')
          ).length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Nenhuma questão crítica identificada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}