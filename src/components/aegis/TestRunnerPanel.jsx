import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Clock, Database } from "lucide-react";

export default function TestRunnerPanel({ aegisResults, testResults }) {
  if (!aegisResults) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">No validation results available</p>
          <p className="text-sm text-slate-500">Click "Run Full Validation" to start</p>
        </CardContent>
      </Card>
    );
  }

  const layers = aegisResults.validation_layers || {};

  return (
    <div className="space-y-6">
      {/* Validation Layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(layers).map(([layerName, layerData]) => {
          const score = layerData.score || 0;
          const status = score >= 90 ? 'passed' : score >= 70 ? 'warning' : 'failed';
          
          return (
            <Card key={layerName} className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white capitalize flex items-center justify-between">
                  {layerName}
                  {status === 'passed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Score</span>
                      <span className={`text-sm font-bold ${
                        score >= 90 ? 'text-green-400' :
                        score >= 70 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {score}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          score >= 90 ? 'bg-green-400' :
                          score >= 70 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {layerData.checks && (
                    <div className="space-y-1">
                      {layerData.checks.slice(0, 3).map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {check.passed ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-400" />
                          )}
                          <span className="text-slate-300 flex-1 truncate">{check.check}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hard Stops */}
      {aegisResults.hard_stops_triggered?.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Critical Issues ({aegisResults.hard_stops_triggered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aegisResults.hard_stops_triggered.map((stop, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg border border-red-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-white font-semibold">{stop.gate}</span>
                    <Badge className={`${
                      stop.severity === 'hard_stop' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {stop.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{stop.message}</p>
                  {stop.resolved ? (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      Resolved by {stop.resolved_by} on {new Date(stop.resolved_at).toLocaleString()}
                    </div>
                  ) : (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                      Resolution Required
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Gates */}
      {aegisResults.quality_gates && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quality Gates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(aegisResults.quality_gates).map(([gateName, gateData]) => (
                <div key={gateName} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300 capitalize">
                      {gateName.replace(/_/g, ' ')}
                    </span>
                    {gateData.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {gateData.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                    {gateData.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{gateData.score}%</div>
                  <p className="text-xs text-slate-400">{gateData.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}