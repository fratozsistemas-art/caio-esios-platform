import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitCompare, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ComparativeAnalysisPanel({ facts }) {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const uniqueTopics = [...new Set(facts.map(f => f.topic_id))].map(id => {
    const fact = facts.find(f => f.topic_id === id);
    return { id, label: fact?.topic_label };
  });

  const handleTopicToggle = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter(id => id !== topicId));
    } else if (selectedTopics.length < 4) {
      setSelectedTopics([...selectedTopics, topicId]);
    } else {
      toast.error('Maximum 4 topics for comparison');
    }
  };

  const handleCompare = async () => {
    if (selectedTopics.length < 2) {
      toast.error('Select at least 2 topics to compare');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('compareFactTopics', {
        topic_ids: selectedTopics
      });
      
      if (response.data.success) {
        setAnalysis(response.data.comparison_analysis);
        toast.success('Comparative analysis complete');
      }
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-400" />
            Comparative Topic Analysis
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Select 2-4 topics to compare
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {uniqueTopics.map(topic => (
              <Button
                key={topic.id}
                size="sm"
                variant={selectedTopics.includes(topic.id) ? 'default' : 'outline'}
                onClick={() => handleTopicToggle(topic.id)}
                className={selectedTopics.includes(topic.id) 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }
              >
                {topic.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleCompare}
            disabled={selectedTopics.length < 2 || isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Selected Topics
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 leading-relaxed">{analysis.executive_summary}</p>
            </CardContent>
          </Card>

          {analysis.similarities && analysis.similarities.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Similarities & Common Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.similarities.map((sim, idx) => (
                  <div key={idx} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <h5 className="text-green-400 font-semibold text-sm mb-1">{sim.pattern}</h5>
                    <p className="text-sm text-slate-300 mb-2">{sim.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {sim.topics_involved?.map((topic, i) => (
                        <Badge key={i} className="bg-green-500/20 text-green-400 text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analysis.differences && analysis.differences.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Key Differences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.differences.map((diff, idx) => (
                  <div key={idx} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <h5 className="text-orange-400 font-semibold text-sm mb-1">{diff.dimension}</h5>
                    <p className="text-sm text-slate-300 mb-1">{diff.comparison}</p>
                    <p className="text-xs text-slate-400">{diff.significance}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analysis.dependencies && analysis.dependencies.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Dependencies & Influences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.dependencies.map((dep, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded p-3">
                    <span className="text-white text-sm">{dep.from_topic}</span>
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm">{dep.to_topic}</span>
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs ml-auto">
                      {dep.dependency_type} • {dep.strength}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analysis.strategic_implications && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Strategic Implications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strategic_implications.map((impl, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{impl}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}