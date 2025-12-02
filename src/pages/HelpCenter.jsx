import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Search, BookOpen, MessageSquare, Zap, Brain, Users, 
  Shield, Network, FileText, Settings, HelpCircle, Mail,
  ExternalLink, Play, ChevronRight, Lightbulb, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Play,
    color: '#00D4FF',
    faqs: [
      {
        question: 'What is CAIO·AI?',
        answer: 'CAIO·AI is an Executive Strategic Intelligence Platform built on the TSI v9.3 methodology. It provides AI-powered strategic analysis, market intelligence, financial modeling, and real-time collaboration tools for C-suite executives and strategic teams.'
      },
      {
        question: 'How do I start using CAIO·AI?',
        answer: 'After logging in, you\'ll see the Welcome Modal guiding you through key features. Start with the Dashboard for an overview, use Chat with CAIO for strategic conversations, or explore Quick Actions for instant analyses. Access tutorials anytime from the sidebar.'
      },
      {
        question: 'What are the 11 TSI Modules?',
        answer: 'TSI v9.3 includes: M1 (Market Context), M2 (Competitive Intelligence), M3 (Tech & Innovation), M4 (Financial Model), M5 (Strategic Synthesis), M6 (Opportunity Matrix), M7 (Implementation), M8 (Reframing Loop), M9 (Funding Intelligence), plus Hermes governance modules. Each module provides specialized cognitive capabilities.'
      },
      {
        question: 'Can I use CAIO·AI on mobile devices?',
        answer: 'Yes! CAIO·AI is fully responsive and works on tablets and smartphones. For the best experience with complex visualizations like Knowledge Graph, we recommend using a desktop or tablet in landscape mode.'
      }
    ]
  },
  {
    id: 'chat-ai',
    name: 'Chat & AI Features',
    icon: MessageSquare,
    color: '#00D4FF',
    faqs: [
      {
        question: 'How does Chat with CAIO work?',
        answer: 'CAIO is your strategic AI partner with memory across conversations. Ask questions about markets, competitors, financials, or strategy. Upload documents for instant analysis. CAIO uses the TSI framework to provide structured, actionable insights.'
      },
      {
        question: 'Can I upload documents for analysis?',
        answer: 'Yes! Click the attachment icon in the chat to upload PDFs, Excel files, Word documents, or images. CAIO extracts data, identifies key insights, and can answer questions about the content. Supported formats: PDF, XLSX, CSV, DOCX, PNG, JPG.'
      },
      {
        question: 'How accurate are CAIO\'s insights?',
        answer: 'CAIO combines multiple data sources, the Knowledge Graph with 10K+ connections, and the TSI methodology for high-accuracy insights. Hermes Trust-Broker provides governance and traceability. Always validate critical decisions with your domain expertise.'
      },
      {
        question: 'Are my conversations private?',
        answer: 'Yes, your conversations are private and encrypted. Only you and team members you explicitly share with can access your conversations. Enterprise plans include additional compliance features.'
      }
    ]
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    icon: Users,
    color: '#FFB800',
    faqs: [
      {
        question: 'How do I collaborate with my team?',
        answer: 'Use the Collaboration hub to see online team members, share insights, assign tasks, and track activity. Add comments to any analysis, @mention colleagues, and use reactions. Real-time presence shows who\'s working on what.'
      },
      {
        question: 'How do tasks and assignments work?',
        answer: 'Create tasks from any entity (strategy, analysis, workspace). Assign to team members with priority and due dates. Track progress in the Collaboration page or entity-specific task panels. Receive notifications on assignments and updates.'
      },
      {
        question: 'Can I share insights externally?',
        answer: 'Yes! Use the Share Insight feature to create shareable summaries. Control visibility (private, team, or public). Generate links or export to PDF for external stakeholders. Enterprise plans support branded exports.'
      },
      {
        question: 'What\'s the Activity Feed?',
        answer: 'The Activity Feed shows real-time updates: comments added, tasks completed, insights shared, analyses updated. Filter by entity or user. Unread items are highlighted. Click any activity to jump to the source.'
      }
    ]
  },
  {
    id: 'intelligence',
    name: 'Intelligence Features',
    icon: Brain,
    color: '#A855F7',
    faqs: [
      {
        question: 'What is the Knowledge Graph?',
        answer: 'The Knowledge Graph is a semantic network connecting companies, executives, technologies, frameworks, metrics, and strategic patterns. It enables pattern discovery, relationship mapping, and AI-powered queries. Auto-enriched from CVM, APIs, and your analyses.'
      },
      {
        question: 'How does Company Intelligence Hub work?',
        answer: 'Enter a company name or CNPJ to get comprehensive intelligence: financial data, competitive position, technology stack, key personnel, news sentiment, and strategic recommendations. Data sources include CVM, financial APIs, and public records.'
      },
      {
        question: 'What are Quick Actions?',
        answer: 'Quick Actions are pre-configured strategic analyses that execute instantly. Filter by C-level role or strategic theme. Each action uses specific TSI modules and delivers structured outputs. Great for rapid decision support.'
      },
      {
        question: 'How does Behavioral Intelligence work?',
        answer: 'Behavioral Intelligence analyzes client archetypes, engagement patterns, and communication styles. It predicts needs, suggests engagement strategies, and tracks relationship evolution. Useful for sales, partnerships, and stakeholder management.'
      }
    ]
  },
  {
    id: 'governance',
    name: 'Governance & Security',
    icon: Shield,
    color: '#22C55E',
    faqs: [
      {
        question: 'What is Hermes Trust-Broker?',
        answer: 'Hermes is CAIO\'s cognitive governance system. It monitors AI decisions, detects inconsistencies, ensures traceability, and provides audit trails. Think of it as the "board oversight" for AI operations—maintaining trust and accountability.'
      },
      {
        question: 'How does auto-trigger work?',
        answer: 'Auto-trigger rules automatically invoke Hermes analysis when conditions are met (e.g., high-value decisions, anomalies detected). Configure thresholds, target entities, and remediation actions. Prevents cognitive drift and maintains quality.'
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes. CAIO uses enterprise-grade encryption (AES-256), secure API connections, and role-based access control. Data is stored in isolated environments. SOC 2 Type II compliance available for Enterprise plans.'
      },
      {
        question: 'Can I export my data?',
        answer: 'Yes, you can export analyses, reports, and data in multiple formats (PDF, Excel, JSON). Use the export buttons on individual items or request a full data export from Settings. Enterprise plans include API access.'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical & Integrations',
    icon: Settings,
    color: '#F97316',
    faqs: [
      {
        question: 'What integrations are available?',
        answer: 'CAIO integrates with: CVM (Brazilian securities), financial APIs (Yahoo Finance, Alpha Vantage), Neo4j (graph database), and more. Enterprise plans support custom integrations, SSO, and API access.'
      },
      {
        question: 'How do I use keyboard shortcuts?',
        answer: 'Press ⌘K (Mac) or Ctrl+K (Windows) for global search. Navigate results with arrow keys. Press Enter to open. More shortcuts: Esc to close dialogs, Tab to navigate forms.'
      },
      {
        question: 'What browsers are supported?',
        answer: 'CAIO works best on Chrome, Firefox, Safari, and Edge (latest versions). For optimal performance with 3D visualizations and real-time features, we recommend Chrome or Firefox with hardware acceleration enabled.'
      },
      {
        question: 'How do I report bugs or request features?',
        answer: 'Use the Support Tickets page (Governance → Support Tickets) to report issues or request features. Include screenshots and steps to reproduce. Our team typically responds within 24 hours on business days.'
      }
    ]
  }
];

const QUICK_LINKS = [
  { label: 'Dashboard', path: 'Dashboard', icon: Brain },
  { label: 'Chat with CAIO', path: 'Chat', icon: MessageSquare },
  { label: 'Quick Actions', path: 'QuickActions', icon: Zap },
  { label: 'Collaboration', path: 'Collaboration', icon: Users },
  { label: 'Knowledge Graph', path: 'KnowledgeGraph', icon: Network },
  { label: 'Support Tickets', path: 'SupportTickets', icon: HelpCircle }
];

const FEATURED_TUTORIALS = [
  { id: 'navigation', title: 'Platform Navigation', duration: '2 min' },
  { id: 'chat', title: 'Chat with CAIO', duration: '3 min' },
  { id: 'quickactions', title: 'Quick Actions', duration: '2 min' },
  { id: 'knowledgeGraph', title: 'Knowledge Graph', duration: '3 min' }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  const filteredFAQs = searchQuery.trim()
    ? FAQ_CATEGORIES.flatMap(cat => 
        cat.faqs
          .filter(faq => 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(faq => ({ ...faq, category: cat.name, categoryId: cat.id }))
      )
    : [];

  const currentCategory = FAQ_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#00D4FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Help Center</h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Find answers to common questions, explore tutorials, and learn how to get the most out of CAIO·AI.
        </p>
      </div>

      {/* Search */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 text-lg"
            />
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="mt-4">
              {filteredFAQs.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">{filteredFAQs.length} result(s) found</p>
                  {filteredFAQs.map((faq, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] mb-2">{faq.category}</Badge>
                      <h4 className="font-semibold text-white mb-2">{faq.question}</h4>
                      <p className="text-sm text-slate-300">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-slate-500 mt-1">Try different keywords or browse categories below</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links & Tutorials */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Links */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FFB800]" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={createPageUrl(link.path)}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-[#00D4FF] group-hover:text-[#00E5FF]" />
                    <span className="text-sm text-slate-300 group-hover:text-white">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Featured Tutorials */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-400" />
              Interactive Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {FEATURED_TUTORIALS.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white">{tutorial.title}</span>
                  </div>
                  <Badge variant="outline" className="text-slate-400 border-slate-600">
                    {tutorial.duration}
                  </Badge>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                View All Tutorials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#00D4FF]" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            {/* Category Tabs */}
            <TabsList className="bg-white/5 border border-white/10 p-1 flex flex-wrap gap-1 h-auto mb-6">
              {FAQ_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF] text-slate-400 px-4 py-2"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* FAQ Content */}
            {FAQ_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <Accordion type="single" collapsible className="space-y-3">
                  {category.faqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`item-${idx}`}
                      className="bg-white/5 border border-white/10 rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-white hover:text-[#00D4FF] text-left py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-gradient-to-br from-[#00D4FF]/10 to-[#FFB800]/10 border-[#00D4FF]/30">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#00D4FF]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex justify-center gap-4">
            <Link to={createPageUrl('SupportTickets')}>
              <Button className="bg-[#00D4FF] hover:bg-[#00E5FF] text-[#0A1628] font-semibold">
                <HelpCircle className="w-4 h-4 mr-2" />
                Open Support Ticket
              </Button>
            </Link>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}