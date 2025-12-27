import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NetworkReportGenerator({ graphData, anomalies, predictions, influencers }) {
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!graphData?.nodes || graphData.nodes.length === 0) {
      toast.error('No network data available to generate report');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await base44.functions.invoke('generateNetworkAnalysisReport', {
        format,
        graph_data: graphData,
        anomalies: anomalies || [],
        predictions: predictions || null,
        influencers: influencers || []
      });

      // Create blob and download
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `network-analysis-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const reportStats = {
    nodes: graphData?.nodes?.length || 0,
    relationships: graphData?.edges?.length || 0,
    anomalies: anomalies?.length || 0,
    influencers: influencers?.length || 0,
    predictions: predictions?.predictions?.predicted_relationships?.length || 0
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Analysis Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-xs text-slate-400 mb-2">Report will include:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Nodes:</span>
              <span className="text-white font-medium">{reportStats.nodes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Relationships:</span>
              <span className="text-white font-medium">{reportStats.relationships}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Anomalies:</span>
              <span className="text-red-400 font-medium">{reportStats.anomalies}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Influencers:</span>
              <span className="text-yellow-400 font-medium">{reportStats.influencers}</span>
            </div>
            {reportStats.predictions > 0 && (
              <div className="flex justify-between col-span-2">
                <span className="text-slate-400">Predictions:</span>
                <span className="text-purple-400 font-medium">{reportStats.predictions}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Export Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF Report
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV Data
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || reportStats.nodes === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate {format.toUpperCase()} Report
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-slate-500 text-center">
          Comprehensive analysis report with all findings
        </div>
      </CardContent>
    </Card>
  );
}