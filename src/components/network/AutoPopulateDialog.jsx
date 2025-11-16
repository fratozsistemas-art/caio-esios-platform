import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, X, Play, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AutoPopulateDialog({ onClose, onComplete }) {
  const [seedCompany, setSeedCompany] = useState("");
  const [seedIndustry, setSeedIndustry] = useState("");
  const [depth, setDepth] = useState(2);

  const autoPopulateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('autoPopulateNetworkData', {
        seed_company_name: seedCompany || undefined,
        seed_industry: seedIndustry || undefined,
        depth,
        max_entities: 50
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Network populated: ${data.results.companies_created} companies, ${data.results.executives_created} executives, ${data.results.relationships_created} relationships`);
      onComplete();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to populate network");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!seedCompany && !seedIndustry) {
      toast.error("Please provide either a company name or industry");
      return;
    }
    autoPopulateMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-slate-900 border-purple-500/30">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Auto-Populate Network
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              AI will discover companies, executives, and relationships automatically
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white">Seed Company (optional)</Label>
                <Input
                  value={seedCompany}
                  onChange={(e) => setSeedCompany(e.target.value)}
                  placeholder="e.g., Nubank"
                  className="bg-white/5 border-white/10 text-white mt-1"
                  disabled={autoPopulateMutation.isPending}
                />
              </div>

              <div className="text-center text-slate-400 text-sm">OR</div>

              <div>
                <Label className="text-white">Industry (optional)</Label>
                <Input
                  value={seedIndustry}
                  onChange={(e) => setSeedIndustry(e.target.value)}
                  placeholder="e.g., Fintech"
                  className="bg-white/5 border-white/10 text-white mt-1"
                  disabled={autoPopulateMutation.isPending}
                />
              </div>

              <div>
                <Label className="text-white">Discovery Depth</Label>
                <Select 
                  value={String(depth)} 
                  onValueChange={(v) => setDepth(Number(v))}
                  disabled={autoPopulateMutation.isPending}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 degree (direct connections)</SelectItem>
                    <SelectItem value="2">2 degrees (recommended)</SelectItem>
                    <SelectItem value="3">3 degrees (extensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  💡 This will use AI + web intelligence to discover real entities and relationships in the Brazilian market
                </p>
              </div>

              {autoPopulateMutation.isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-300">
                    <p className="font-medium">Network populated successfully!</p>
                    <p className="text-xs mt-1">
                      {autoPopulateMutation.data?.results.companies_created} companies, {autoPopulateMutation.data?.results.executives_created} executives, {autoPopulateMutation.data?.results.relationships_created} relationships created
                    </p>
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={autoPopulateMutation.isPending || (!seedCompany && !seedIndustry)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {autoPopulateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Discovering Network...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Auto-Population
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}