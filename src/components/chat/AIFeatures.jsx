import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Loader2, MessageSquare, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function AIFeatures({ conversation, onSuggestionClick }) {
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleSummarize = async () => {
    if (!conversation?.id) return;
    
    setLoadingSummary(true);
    try {
      const { data } = await base44.functions.invoke('summarizeConversation', {
        conversation_id: conversation.id
      });
      
      if (data.success) {
        setSummary(data.summary);
        setShowSummary(true);
        toast.success('Summary generated!');
      } else {
        toast.error(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Summarize error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!conversation?.id) return;
    
    setLoadingSuggestions(true);
    try {
      const { data } = await base44.functions.invoke('suggestReplies', {
        conversation_id: conversation.id
      });
      
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
        toast.success('Reply suggestions generated!');
      } else {
        toast.error(data.error || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Suggestions error:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <>
      {/* AI Features Bar */}
      <div className="px-6 pb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSummarize}
          disabled={loadingSummary || !conversation?.messages?.length}
          className="border-white/20 text-white hover:bg-white/5"
        >
          {loadingSummary ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Summarize
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleGetSuggestions}
          disabled={loadingSuggestions || !conversation?.messages?.length}
          className="border-white/20 text-white hover:bg-white/5"
        >
          {loadingSuggestions ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Suggest Replies
        </Button>
      </div>

      {/* Reply Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-400">Quick replies:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => {
                  onSuggestionClick(suggestion);
                  setSuggestions([]);
                }}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && summary && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden bg-slate-900 border-white/10">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Conversation Summary
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSummary(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-slate-300 mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-slate-300 mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-300">{children}</li>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-blue-400">{children}</em>,
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}