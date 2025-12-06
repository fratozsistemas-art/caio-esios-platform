import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, BookOpen, ExternalLink, Pin, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from 'date-fns';

const FunctionDisplay = ({ toolCall }) => {
    const [expanded, setExpanded] = useState(false);
    const name = toolCall?.name || 'Function';
    const status = toolCall?.status || 'pending';
    const results = toolCall?.results;
    
    const parsedResults = (() => {
        if (!results) return null;
        try {
            return typeof results === 'string' ? JSON.parse(results) : results;
        } catch {
            return results;
        }
    })();
    
    const isError = results && (
        (typeof results === 'string' && /error|failed/i.test(results)) ||
        (parsedResults?.success === false)
    );
    
    // Special handling for searchKnowledge function
    const isKnowledgeSearch = name.includes('searchKnowledge');
    const knowledgeResults = isKnowledgeSearch && parsedResults?.results;
    
    const statusConfig = {
        pending: { icon: Clock, color: 'text-slate-400', text: 'Pendente' },
        running: { icon: Loader2, color: 'text-slate-400', text: 'Executando...', spin: true },
        in_progress: { icon: Loader2, color: 'text-slate-400', text: 'Executando...', spin: true },
        completed: isError ? 
            { icon: AlertCircle, color: 'text-red-400', text: 'Erro' } : 
            { icon: CheckCircle2, color: 'text-green-400', text: 'Concluído' },
        success: { icon: CheckCircle2, color: 'text-green-400', text: 'Sucesso' },
        failed: { icon: AlertCircle, color: 'text-red-400', text: 'Falhou' },
        error: { icon: AlertCircle, color: 'text-red-400', text: 'Erro' }
    }[status] || { icon: Zap, color: 'text-slate-400', text: '' };
    
    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all w-full",
                    "hover:bg-white/10",
                    expanded ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10"
                )}
            >
                <Icon className={cn("h-3 w-3 flex-shrink-0", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span className="text-slate-300 flex-1 text-left">{formattedName}</span>
                {statusConfig.text && (
                    <span className={cn("text-slate-400", isError && "text-red-400")}>
                        • {statusConfig.text}
                    </span>
                )}
                {!statusConfig.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-slate-400 transition-transform", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-white/10 space-y-2">
                    {/* Special display for knowledge search results */}
                    {isKnowledgeSearch && knowledgeResults && knowledgeResults.length > 0 ? (
                        <div>
                            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                Found {knowledgeResults.length} relevant document(s):
                            </div>
                            <div className="space-y-2">
                                {knowledgeResults.map((result, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-md p-2 border border-white/10">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="font-medium text-slate-200 text-xs flex-1">
                                                {result.title}
                                            </div>
                                            <div className="text-xs text-green-400 flex-shrink-0">
                                                {result.relevance_score}%
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 mb-1">
                                            {result.category} • {result.file_name}
                                        </div>
                                        {result.relevance_reason && (
                                            <div className="text-xs text-slate-300 mt-1">
                                                {result.relevance_reason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {toolCall.arguments_string && (
                                <div>
                                    <div className="text-xs text-slate-400 mb-1">Parâmetros:</div>
                                    <pre className="bg-white/5 rounded-md p-2 text-xs text-slate-300 whitespace-pre-wrap">
                                        {(() => {
                                            try {
                                                return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                                            } catch {
                                                return toolCall.arguments_string;
                                            }
                                        })()}
                                    </pre>
                                </div>
                            )}
                            {parsedResults && !isKnowledgeSearch && (
                                <div>
                                    <div className="text-xs text-slate-400 mb-1">Resultado:</div>
                                    <pre className="bg-white/5 rounded-md p-2 text-xs text-slate-300 whitespace-pre-wrap max-h-48 overflow-auto">
                                        {typeof parsedResults === 'object' ? 
                                            JSON.stringify(parsedResults, null, 2) : parsedResults}
                                    </pre>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Citation component for knowledge sources
const CitationBadge = ({ citation }) => {
    return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs">
            <BookOpen className="w-3 h-3" />
            <span>{citation}</span>
        </div>
    );
};

export default function MessageBubble({ message, onPin, isPinned, showReadReceipt }) {
    const isUser = message.role === 'user';
    const timestamp = message.created_date || message.timestamp || new Date();
    
    return (
        <div className={cn("flex gap-3 group", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-white" />
                </div>
            )}
            <div className={cn("max-w-[85%] relative", isUser && "flex flex-col items-end")}>
                {isPinned && (
                    <div className="absolute -top-2 -left-2 z-10">
                        <div className="bg-yellow-500 rounded-full p-1">
                            <Pin className="w-3 h-3 text-white" />
                        </div>
                    </div>
                )}
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-2.5",
                        isUser ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-white/10 border border-white/10 backdrop-blur-sm"
                    )}>
                        {isUser ? (
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                            <ReactMarkdown 
                                className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                                components={{
                                    code: ({ inline, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="relative group/code">
                                                <pre className="bg-slate-950 text-slate-100 rounded-lg p-3 overflow-x-auto my-2">
                                                    <code className={className} {...props}>{children}</code>
                                                </pre>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 bg-slate-800 hover:bg-slate-700"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                        toast.success('Código copiado');
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3 text-slate-400" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <code className="px-1 py-0.5 rounded bg-white/10 text-blue-300 text-xs">
                                                {children}
                                            </code>
                                        );
                                    },
                                    a: ({ children, href, ...props }) => {
                                        // Detect if this is a citation link
                                        const isCitation = href && href.startsWith('#citation-');
                                        if (isCitation) {
                                            return <CitationBadge citation={children} />;
                                        }
                                        return (
                                            <a {...props} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                                                {children}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        );
                                    },
                                    p: ({ children }) => <p className="my-1 leading-relaxed text-slate-200">{children}</p>,
                                    ul: ({ children }) => <ul className="my-1 ml-4 list-disc text-slate-200">{children}</ul>,
                                    ol: ({ children }) => <ol className="my-1 ml-4 list-decimal text-slate-200">{children}</ol>,
                                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                                    h1: ({ children }) => <h1 className="text-lg font-semibold my-2 text-white">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-semibold my-2 text-white">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-semibold my-2 text-white">{children}</h3>,
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-2 border-blue-500 pl-3 my-2 text-slate-300 bg-white/5 py-2 rounded-r">
                                            {children}
                                        </blockquote>
                                    ),
                                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
                
                {message.tool_calls?.length > 0 && (
                    <div className="space-y-1 mt-2 w-full">
                        {message.tool_calls.map((toolCall, idx) => (
                            <FunctionDisplay key={idx} toolCall={toolCall} />
                        ))}
                    </div>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                        {format(new Date(timestamp), 'HH:mm')}
                    </span>
                    {isUser && showReadReceipt && (
                        <Check className="w-3 h-3 text-blue-400" />
                    )}
                    {onPin && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPin(message)}
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pin className={cn("w-3 h-3", isPinned ? "text-yellow-400" : "text-slate-400")} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}