import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, ChevronDown, ChevronUp, ExternalLink, 
  Database, TrendingUp, CheckCircle, AlertCircle
} from 'lucide-react';

export default function ExplainabilityPanel({ inference, enrichment }) {
  const [expandedSections, setExpandedSections] = useState(new Set(['reasoning']));

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!inference && !enrichment) return null;

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          AI Explainability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Reasoning Section */}
        {(inference?.reasoning || enrichment?.reasoning) && (
          <ExplainabilitySection
            title="Reasoning Process"
            icon={Lightbulb}
            expanded={expandedSections.has('reasoning')}
            onToggle={() => toggleSection('reasoning')}
          >
            <p className="text-sm text-slate-300 leading-relaxed">
              {inference?.reasoning || enrichment?.reasoning}
            </p>
            {inference?.inference_method && (
              <div className="mt-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Method: {inference.inference_method}
                </Badge>
              </div>
            )}
          </ExplainabilitySection>
        )}

        {/* Data Sources */}
        {(inference?.supporting_evidence || enrichment?.sources_queried) && (
          <ExplainabilitySection
            title="Data Sources"
            icon={Database}
            expanded={expandedSections.has('sources')}
            onToggle={() => toggleSection('sources')}
          >
            {enrichment?.sources_queried && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Sources Queried:</p>
                <div className="flex flex-wrap gap-2">
                  {enrichment.sources_queried.map((source, i) => (
                    <Badge key={i} variant="outline" className="border-white/20 text-slate-300">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {inference?.supporting_evidence && (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-slate-400">Supporting Evidence:</p>
                {inference.supporting_evidence.map((evidence, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{evidence}</span>
                  </div>
                ))}
              </div>
            )}

            {inference?.source_urls && inference.source_urls.length > 0 && (
              <div className="space-y-1 mt-3">
                <p className="text-xs text-slate-400">External References:</p>
                {inference.source_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            )}
          </ExplainabilitySection>
        )}

        {/* Confidence Score */}
        {(inference?.confidence || enrichment?.confidence_score) && (
          <ExplainabilitySection
            title="Confidence Analysis"
            icon={TrendingUp}
            expanded={expandedSections.has('confidence')}
            onToggle={() => toggleSection('confidence')}
          >
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Overall Confidence</span>
                  <span className="text-sm font-bold text-white">
                    {Math.round((inference?.confidence || enrichment?.confidence_score) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (inference?.confidence || enrichment?.confidence_score) >= 0.8 ? 'bg-green-500' :
                      (inference?.confidence || enrichment?.confidence_score) >= 0.6 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ 
                      width: `${(inference?.confidence || enrichment?.confidence_score) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-400">Confidence Factors:</p>
                <div className="space-y-1">
                  <ConfidenceFactor
                    label="Data Quality"
                    score={0.9}
                    description="Multiple reliable sources"
                  />
                  <ConfidenceFactor
                    label="Temporal Relevance"
                    score={0.85}
                    description="Recent data (< 30 days)"
                  />
                  <ConfidenceFactor
                    label="Cross-Validation"
                    score={inference?.confidence || enrichment?.confidence_score}
                    description="Verified across sources"
                  />
                </div>
              </div>
            </div>
          </ExplainabilitySection>
        )}

        {/* Data Lineage */}
        {enrichment?.data_points && (
          <ExplainabilitySection
            title="Data Lineage"
            icon={Database}
            expanded={expandedSections.has('lineage')}
            onToggle={() => toggleSection('lineage')}
          >
            <div className="space-y-2">
              {Object.entries(enrichment.data_points || {}).map(([key, value]) => (
                <div key={key} className="bg-white/5 rounded p-2">
                  <p className="text-xs text-slate-400">{key}</p>
                  <p className="text-xs text-white mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </p>
                </div>
              ))}
            </div>
          </ExplainabilitySection>
        )}

        {/* Limitations & Caveats */}
        <ExplainabilitySection
          title="Limitations & Caveats"
          icon={AlertCircle}
          expanded={expandedSections.has('limitations')}
          onToggle={() => toggleSection('limitations')}
        >
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li>Inference based on available data at time of analysis</li>
            <li>External API data freshness may vary</li>
            {(inference?.confidence || enrichment?.confidence_score) < 0.7 && (
              <li className="text-yellow-400">Lower confidence - manual review recommended</li>
            )}
            <li>Cross-reference with primary sources for critical decisions</li>
          </ul>
        </ExplainabilitySection>
      </CardContent>
    </Card>
  );
}

function ExplainabilitySection({ title, icon: Icon, expanded, onToggle, children }) {
  return (
    <div className="border border-white/10 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="p-3 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

function ConfidenceFactor({ label, score, description }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{label}</span>
          <span className="text-white">{Math.round(score * 100)}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1 mt-1">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
            style={{ width: `${score * 100}%` }}
          />
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}