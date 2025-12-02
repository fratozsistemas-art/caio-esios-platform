import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Clock, Target, Plus } from "lucide-react";

export default function RecommendationTracker({ recommendations, onToggle, cumulativeRecs, onAddRecommendation }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": case 1: return "bg-red-500/20 text-red-400";
      case "medium": case 2: return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-blue-500/20 text-blue-400";
    }
  };

  // Combine tracked recommendations with cumulative ones from Coach
  const allRecs = [
    ...recommendations,
    ...(cumulativeRecs || []).filter(cr => 
      !recommendations.some(r => r.recommendation === cr.recommendation)
    ).map((cr, idx) => ({
      id: `cumulative-${idx}`,
      recommendation: cr.recommendation,
      rationale: cr.rationale,
      priority: cr.priority,
      timeframe: cr.timeframe,
      supporting_modules: cr.supporting_modules,
      completed: false,
      fromCoach: true
    }))
  ];

  return (
    <div className="space-y-4">
      {/* Add from Coach Recommendations */}
      {cumulativeRecs?.length > 0 && (
        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Strategy Coach Recommendations
            </h4>
            <div className="space-y-2">
              {cumulativeRecs.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-white">{rec.recommendation}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPriorityColor(rec.priority)}>{rec.priority || `#${rec.priority}`}</Badge>
                      {rec.timeframe && (
                        <Badge className="bg-white/10 text-slate-300 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {rec.timeframe.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddRecommendation(rec)}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracked Recommendations */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Tracked Actions ({recommendations.filter(r => r.completed).length}/{recommendations.length} completed)
        </h4>
        
        {recommendations.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No recommendations tracked yet</p>
              <p className="text-xs text-slate-500 mt-1">Add recommendations from the Strategy Coach above</p>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec) => (
            <Card 
              key={rec.id} 
              className={`${rec.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'} cursor-pointer hover:bg-white/10 transition-all`}
              onClick={() => onToggle(rec.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {rec.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${rec.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {rec.recommendation}
                    </p>
                    {rec.rationale && (
                      <p className="text-xs text-slate-500 mt-1">{rec.rationale}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {rec.priority && (
                        <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                      )}
                      {rec.supporting_modules && (
                        <div className="flex gap-1">
                          {rec.supporting_modules.map((m, i) => (
                            <Badge key={i} className="bg-white/10 text-slate-300 text-xs">{m}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {rec.completedAt && (
                      <p className="text-xs text-green-400 mt-2">
                        Completed {new Date(rec.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}