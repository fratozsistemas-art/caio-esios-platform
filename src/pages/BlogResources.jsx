import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Clock, TrendingUp, Sparkles, ExternalLink, BookOpen, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogResources() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const articles = [
    {
      id: 1,
      title: "Strategic Intelligence Platform Architecture",
      description: "Deep dive into modular cognitive systems and knowledge graph foundations",
      category: "methodology",
      readTime: "12 min",
      date: "2025-12-01",
      views: "5.2K",
      type: "article",
      featured: true
    },
    {
      id: 2,
      title: "Financial Modeling with AI-Powered Modules",
      description: "How AI-powered financial modeling transforms M&A due diligence",
      category: "case-study",
      readTime: "8 min",
      date: "2025-11-28",
      views: "3.8K",
      type: "article"
    },
    {
      id: 3,
      title: "Knowledge Graph Best Practices",
      description: "Building and maintaining strategic connections at scale",
      category: "technical",
      readTime: "15 min",
      date: "2025-11-25",
      views: "4.5K",
      type: "article"
    },
    {
      id: 4,
      title: "Strategic Decision-Making Frameworks",
      description: "Comparative analysis of decision frameworks for executives",
      category: "research",
      readTime: "25 min",
      date: "2025-11-20",
      views: "2.1K",
      type: "pdf",
      downloadable: true
    },
    {
      id: 5,
      title: "Multi-Agent Orchestration Guide",
      description: "Complete guide to autonomous agent workflows and collaboration",
      category: "technical",
      readTime: "18 min",
      date: "2025-11-15",
      views: "6.3K",
      type: "article"
    },
    {
      id: 6,
      title: "Market Entry Strategy Framework",
      description: "Step-by-step framework for market intelligence and competitive analysis",
      category: "templates",
      readTime: "10 min",
      date: "2025-11-10",
      views: "7.8K",
      type: "pdf",
      downloadable: true,
      featured: true
    },
    {
      id: 7,
      title: "AI Governance in Enterprise Strategy",
      description: "Trust-broker mechanisms and decision traceability for board-level decisions",
      category: "methodology",
      readTime: "14 min",
      date: "2025-11-05",
      views: "4.1K",
      type: "article"
    },
    {
      id: 8,
      title: "Competitive Intelligence Automation",
      description: "Real-time competitive tracking and strategic positioning analysis",
      category: "case-study",
      readTime: "11 min",
      date: "2025-10-30",
      views: "5.6K",
      type: "article"
    }
  ];

  const books = [
    {
      id: 1,
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      description: "Essential reading for understanding cognitive biases in strategic decision-making",
      amazonUrl: "https://amazon.com",
      relevance: "Cognitive Architecture"
    },
    {
      id: 2,
      title: "The Lean Startup",
      author: "Eric Ries",
      description: "Strategic iteration and validated learning for innovation",
      amazonUrl: "https://amazon.com",
      relevance: "Strategic Execution"
    },
    {
      id: 3,
      title: "Good Strategy Bad Strategy",
      author: "Richard Rumelt",
      description: "The difference between coherent action and wishful thinking",
      amazonUrl: "https://amazon.com",
      relevance: "Strategic Synthesis"
    },
    {
      id: 4,
      title: "Zero to One",
      author: "Peter Thiel",
      description: "Creating value through innovation and strategic monopoly",
      amazonUrl: "https://amazon.com",
      relevance: "Market Intelligence"
    }
  ];

  const categories = [
    { id: "all", label: "All Content" },
    { id: "methodology", label: "Methodology" },
    { id: "case-study", label: "Case Studies" },
    { id: "technical", label: "Technical" },
    { id: "research", label: "Research" },
    { id: "templates", label: "Templates" }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Blog & Resources</h1>
              <p className="text-[#94A3B8]">Articles, whitepapers and strategic intelligence insights</p>
            </div>
          </div>
        </motion.div>

        <Card className="bg-[#1A1D29] border-[#00D4FF]/20 mb-8">
          <CardContent className="p-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-10 bg-[#0A2540] border-[#00D4FF]/30 text-white placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id 
                    ? "bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6] font-medium whitespace-nowrap" 
                    : "bg-[#1A1D29] border-[#00D4FF]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#00D4FF]/50 hover:text-white whitespace-nowrap"}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {filteredArticles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={`bg-[#1A1D29] border-[#00D4FF]/20 hover:bg-[#0A2540] transition-all duration-300 group h-full ${article.featured ? 'border-[#00D4FF]/50' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={article.featured ? "bg-[#00D4FF]/20 text-[#00D4FF]" : "bg-[#8B5CF6]/20 text-[#8B5CF6]"}>
                      {article.category}
                    </Badge>
                    {article.downloadable && (
                      <Download className="w-4 h-4 text-[#00D4FF]" />
                    )}
                  </div>
                  <CardTitle className="text-white text-xl group-hover:text-[#00D4FF] transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-[#94A3B8]">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-[#94A3B8] mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {article.views}
                      </div>
                    </div>
                    <span className="text-xs">{article.date}</span>
                  </div>
                  <Button
                    className="w-full bg-[#00D4FF] hover:bg-[#00B8E6] text-[#0A2540] font-medium"
                    onClick={() => {
                      if (article.downloadable) {
                        window.open(article.url || '#', '_blank');
                      } else {
                        navigate(createPageUrl('BlogArticle') + '?id=' + article.id);
                      }
                    }}
                  >
                    {article.downloadable ? (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download {article.type.toUpperCase()}
                      </>
                    ) : (
                      <>
                        Read Article
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#00D4FF] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Recommended Reading</h2>
              <p className="text-[#94A3B8]">Essential books for strategic intelligence professionals</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book, idx) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <Card className="bg-[#1A1D29] border-[#00D4FF]/20 hover:bg-[#0A2540] transition-all duration-300 group h-full">
                  <CardHeader>
                    <CardTitle className="text-white text-lg group-hover:text-[#00D4FF] transition-colors">
                      {book.title}
                    </CardTitle>
                    <CardDescription className="text-[#94A3B8] text-sm">
                      by {book.author}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#94A3B8] text-sm mb-3 line-clamp-3">{book.description}</p>
                    <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6] mb-4 text-xs">
                      {book.relevance}
                    </Badge>
                    <Button
                      variant="outline"
                      className="w-full border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10"
                      onClick={() => window.open(book.amazonUrl, '_blank')}
                    >
                      View on Amazon
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}