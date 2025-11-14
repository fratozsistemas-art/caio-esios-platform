import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Code, MessageSquare, Briefcase, Building } from "lucide-react";

export default function SourcesList({ sources }) {
  if (!sources || sources.length === 0) {
    return (
      <p className="text-slate-400 text-center py-8">
        Nenhuma fonte de dados disponível
      </p>
    );
  }

  const sourceIcons = {
    job_postings: Briefcase,
    vendor_partnerships: Building,
    api_documentation: Code,
    customer_reviews: MessageSquare,
    developer_communities: Code,
    regulatory_filings: FileText
  };

  const sourceLabels = {
    job_postings: "Job Postings",
    vendor_partnerships: "Parcerias",
    api_documentation: "API Docs",
    customer_reviews: "Reviews",
    developer_communities: "Dev Communities",
    regulatory_filings: "Regulatory"
  };

  return (
    <div className="space-y-3">
      {sources.map((source, idx) => {
        const Icon = sourceIcons[source.source_type] || FileText;
        const label = sourceLabels[source.source_type] || source.source_type;
        
        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">{label}</span>
              </div>
              {source.confidence_score && (
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                  {source.confidence_score}% confiança
                </Badge>
              )}
            </div>
            
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-2"
              >
                {source.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {source.extracted_data && (
              <div className="mt-3 p-3 rounded-lg bg-black/20">
                <p className="text-xs text-slate-400 mb-1">Dados Extraídos:</p>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap max-h-32 overflow-auto">
                  {JSON.stringify(source.extracted_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}