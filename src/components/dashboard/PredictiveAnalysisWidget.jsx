import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, TrendingUp, AlertTriangle, Target, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PredictiveAnalysisWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [focusArea, setFocusArea] = useState('');
  const [timeframe, setTimeframe] = useState('3-6 months');

  const handlePredict = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('predictiveAnalysis', {
        focus_area: focusArea,
        timeframe: timeframe
      });

      if (response.data?.success) {
        setPredictions(response.data.predictions);
        toast.success('Predictions generated!');
      }
    } catch (error) {
      toast.error('Prediction failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Predictive Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Predictions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Predictive Strategic Analysis
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Focus Area (optional)
                  </label>
                  <Input
                    placeholder="e.g., market expansion, digital transformation, competitive positioning"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Timeframe
                  </label>
                  <Input
                    placeholder="e.g., 3-6 months, 1 year, 2-3 years"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button
                  onClick={handlePredict}
                  disabled={isAnalyzing}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Patterns...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Predictions
                    </>
                  )}
                </Button>
              </div>

              {predictions && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {predictions.scenarios?.length > 0 && (
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Predicted Scenarios</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {predictions.scenarios.map((scenario, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-white font-medium">{scenario.scenario_name}</div>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                {scenario.probability}% likely
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{scenario.description}</p>
                            <div className="text-xs text-slate-500">Timeline: {scenario.timeline}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {predictions.forecasts?.length > 0 && (
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Trend Forecasts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {predictions.forecasts.map((forecast, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                            <div className="text-sm text-white">{forecast.trend_name}</div>
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                              {forecast.direction} ({forecast.confidence}%)
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {predictions.risk_forecast?.length > 0 && (
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          Risk Projections
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {predictions.risk_forecast.map((risk, idx) => (
                          <div key={idx} className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                            <div className="text-sm text-white font-medium mb-1">{risk.risk_description}</div>
                            <div className="text-xs text-slate-400">{risk.mitigation_strategy}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {predictions.opportunity_windows?.length > 0 && (
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-400" />
                          Opportunity Windows
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {predictions.opportunity_windows.map((opp, idx) => (
                          <div key={idx} className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                            <div className="text-sm text-white font-medium mb-1">{opp.opportunity}</div>
                            <div className="text-xs text-slate-400">Best timing: {opp.optimal_timing}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}