import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Download, Copy, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

export default function ConversationSummary({ conversation, messages }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('summarizeConversation', {
        conversation_id: conversation.id
      });

      if (response.data?.summary) {
        setSummary(response.data.summary);
        setShowSummary(true);
        toast.success('Summary generated!');
      }
    } catch (error) {
      console.error('Summary error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(
        typeof summary === 'string' ? summary : JSON.stringify(summary, null, 2)
      );
      setCopied(true);
      toast.success('Summary copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (summary) {
      const text = typeof summary === 'string' ? summary : JSON.stringify(summary, null, 2);
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-summary-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Summary downloaded');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateSummary}
        disabled={isGenerating || !messages || messages.length === 0}
        className="border-white/10 text-white hover:bg-white/10"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Summarize
          </>
        )}
      </Button>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-white/10">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Conversation Summary
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-white"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-slate-400 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-white">Summary Details</CardTitle>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {messages?.length || 0} messages
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {typeof summary === 'string' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              ) : summary ? (
                <div className="space-y-4">
                  {summary.overview && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">Overview</h3>
                      <p className="text-sm text-slate-300">{summary.overview}</p>
                    </div>
                  )}
                  
                  {summary.key_topics && summary.key_topics.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">Key Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {summary.key_topics.map((topic, idx) => (
                          <Badge key={idx} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {summary.main_insights && summary.main_insights.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">Main Insights</h3>
                      <ul className="space-y-2">
                        {summary.main_insights.map((insight, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {summary.action_items && summary.action_items.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">Action Items</h3>
                      <ul className="space-y-2">
                        {summary.action_items.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-green-400 mt-1">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">No summary available</p>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}