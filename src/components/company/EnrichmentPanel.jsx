import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, Loader2, Users, Handshake, Linkedin, 
  CheckCircle, AlertCircle, TrendingUp 
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function EnrichmentPanel({ companyId, companyName }) {
  const queryClient = useQueryClient();
  const [results, setResults] = useState(null);

  const enrichMutation = useMutation({
    mutationFn: () => base44.functions.invoke('enrichCompanyData', { company_id: companyId }),
    onSuccess: (response) => {
      setResults(response.data.enrichment_results);
      toast.success(response.data.message);
      queryClient.invalidateQueries(['company', companyId]);
      queryClient.invalidateQueries(['people']);
      queryClient.invalidateQueries(['relationships']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Enrichment failed');
    }
  });

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Data Enrichment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300">
          Automatically extract executives, discover partnerships, and link LinkedIn profiles using AI
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <Users className="w-4 h-4 text-blue-400 mb-1" />
            <div className="text-xs text-slate-400">Executives</div>
            <div className="text-sm text-white font-medium">
              {results ? results.executives_found : '—'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <Handshake className="w-4 h-4 text-green-400 mb-1" />
            <div className="text-xs text-slate-400">Partnerships</div>
            <div className="text-sm text-white font-medium">
              {results ? results.partnerships_found : '—'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <Linkedin className="w-4 h-4 text-blue-500 mb-1" />
            <div className="text-xs text-slate-400">LinkedIn</div>
            <div className="text-sm text-white font-medium">
              {results ? (results.linkedin_updated ? '✓' : '—') : '—'}
            </div>
          </div>
        </div>

        <Button
          onClick={() => enrichMutation.mutate()}
          disabled={enrichMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {enrichMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enriching Data...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Run AI Enrichment
            </>
          )}
        </Button>

        {results && results.errors && results.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Some Issues</span>
            </div>
            <div className="space-y-1">
              {results.errors.slice(0, 3).map((error, idx) => (
                <div key={idx} className="text-xs text-slate-300">• {error}</div>
              ))}
            </div>
          </motion.div>
        )}

        {results && results.errors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 rounded-lg p-3 border border-green-500/30"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Enrichment completed successfully!</span>
            </div>
          </motion.div>
        )}

        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
          <p className="text-xs text-blue-300">
            💡 AI will search CVM documents, news articles, and public sources to enrich {companyName}'s data
          </p>
        </div>
      </CardContent>
    </Card>
  );
}