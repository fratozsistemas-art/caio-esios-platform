import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, FileText, Calendar, Database, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportBuilder({ onClose, onGenerate, initialData }) {
  const [config, setConfig] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    format: initialData?.format || "pdf",
    template: initialData?.template || "executive_summary",
    data_sources: initialData?.data_sources || [],
    filters: initialData?.filters || {},
    include_charts: true,
    include_recommendations: true,
    time_period: "last_30_days"
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list()
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list()
  });

  const dataSources = [
    { id: 'strategies', label: 'Strategies', count: strategies.length },
    { id: 'analyses', label: 'Analyses', count: analyses.length },
    { id: 'knowledge_graph', label: 'Knowledge Graph', count: 'N/A' },
    { id: 'conversations', label: 'Conversations', count: 'N/A' }
  ];

  const handleGenerate = () => {
    onGenerate(config);
  };

  const toggleDataSource = (sourceId) => {
    setConfig(prev => ({
      ...prev,
      data_sources: prev.data_sources.includes(sourceId)
        ? prev.data_sources.filter(id => id !== sourceId)
        : [...prev.data_sources, sourceId]
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0B0F1A] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Create Report</h2>
              <p className="text-sm text-slate-400">Configure your strategic intelligence report</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2">Report Title</Label>
                <Input
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Q4 Strategic Review"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2">Description (Optional)</Label>
                <Textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  placeholder="Quarterly review of strategic initiatives and market positioning..."
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
              </div>
            </div>

            {/* Format & Template */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Format
                </Label>
                <Select value={config.format} onValueChange={(value) => setConfig({ ...config, format: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="csv">CSV Data Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Template
                </Label>
                <Select value={config.template} onValueChange={(value) => setConfig({ ...config, template: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive_summary">Executive Summary</SelectItem>
                    <SelectItem value="detailed_analysis">Detailed Analysis</SelectItem>
                    <SelectItem value="competitive_landscape">Competitive Landscape</SelectItem>
                    <SelectItem value="financial_review">Financial Review</SelectItem>
                    <SelectItem value="strategic_roadmap">Strategic Roadmap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Period */}
            <div>
              <Label className="text-white mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Time Period
              </Label>
              <Select value={config.time_period} onValueChange={(value) => setConfig({ ...config, time_period: value })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_quarter">Last Quarter</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Sources */}
            <div>
              <Label className="text-white mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Sources
              </Label>
              <div className="grid md:grid-cols-2 gap-3">
                {dataSources.map((source) => (
                  <Card
                    key={source.id}
                    className={`cursor-pointer transition-all ${
                      config.data_sources.includes(source.id)
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => toggleDataSource(source.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={config.data_sources.includes(source.id)}
                          onCheckedChange={() => toggleDataSource(source.id)}
                        />
                        <div>
                          <p className="text-white font-medium">{source.label}</p>
                          <p className="text-xs text-slate-400">{source.count} items</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <Label className="text-white mb-3">Report Options</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={config.include_charts}
                    onCheckedChange={(checked) => setConfig({ ...config, include_charts: checked })}
                  />
                  <div>
                    <p className="text-white text-sm">Include Charts & Visualizations</p>
                    <p className="text-xs text-slate-500">Add data visualizations to the report</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={config.include_recommendations}
                    onCheckedChange={(checked) => setConfig({ ...config, include_recommendations: checked })}
                  />
                  <div>
                    <p className="text-white text-sm">Include AI Recommendations</p>
                    <p className="text-xs text-slate-500">Add strategic recommendations from CAIO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {config.data_sources.length} data source{config.data_sources.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-400 hover:bg-white/5">
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!config.title || config.data_sources.length === 0}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                Generate Report
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}