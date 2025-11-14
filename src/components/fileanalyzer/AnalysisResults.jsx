import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, CheckCircle, Loader2, AlertCircle, 
  TrendingUp, ExternalLink, ChevronDown, ChevronUp 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalysisResults({ analysis }) {
  const [expanded, setExpanded] = useState(false);

  const fileTypeLabels = {
    excel_financial: { label: "Financeiro", icon: "💰", color: "green" },
    pdf_contract: { label: "Contrato", icon: "📄", color: "red" },
    csv_sales: { label: "Vendas", icon: "📊", color: "blue" },
    presentation: { label: "Apresentação", icon: "📊", color: "purple" },
    report: { label: "Relatório", icon: "📑", color: "orange" },
    data_export: { label: "Dados", icon: "📋", color: "cyan" },
    other: { label: "Outro", icon: "📎", color: "slate" }
  };

  const statusConfig = {
    processing: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/20", spin: true },
    completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
    failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/20" }
  };

  const priorityColors = {
    low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    critical: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const fileType = fileTypeLabels[analysis.file_type] || fileTypeLabels.other;
  const status = statusConfig[analysis.status] || statusConfig.processing;
  const StatusIcon = status.icon;

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader 
        className="border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{fileType.icon}</span>
              <CardTitle className="text-white text-lg">
                {analysis.file_name}
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={`${status.bg} ${status.color} border border-white/10 flex items-center gap-1`}>
                <StatusIcon className={`w-3 h-3 ${status.spin ? 'animate-spin' : ''}`} />
                {analysis.status}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-slate-400">
                {fileType.label}
              </Badge>
              {analysis.confidence_score && (
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                  Confiança: {analysis.confidence_score}%
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="p-6 space-y-6">
              {/* Key Insights */}
              {analysis.key_insights && analysis.key_insights.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Principais Insights
                  </h4>
                  <ul className="space-y-2">
                    {analysis.key_insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-blue-400 mt-1">•</span>
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Actions */}
              {analysis.suggested_actions && analysis.suggested_actions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Ações Recomendadas
                  </h4>
                  <div className="space-y-3">
                    {analysis.suggested_actions.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-white">{action.title}</h5>
                          <Badge className={`${priorityColors[action.priority]} border`}>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">
                          {action.description}
                        </p>
                        {action.framework && (
                          <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs">
                            Framework: {action.framework}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Link */}
              <div className="pt-4 border-t border-white/10">
                <a
                  href={analysis.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Ver arquivo original
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}