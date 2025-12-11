import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, TrendingUp, Share2, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

const ARTICLES = {
  1: {
    title: "Strategic Intelligence Platform Architecture",
    category: "methodology",
    readTime: "12 min",
    date: "2025-12-01",
    views: "5.2K",
    author: "CAIO Research Team",
    content: `
# Strategic Intelligence Platform Architecture

## Introduction

Modern enterprises face an unprecedented challenge: making strategic decisions faster than ever while maintaining institutional-grade rigor. Traditional consulting takes weeks or months; generic AI tools lack governance. Strategic Intelligence Platforms bridge this gap.

## The Architecture Challenge

Enterprise strategic intelligence requires:

**Multi-Modal Analysis**: Market data, competitive intelligence, financial modeling, and execution tracking must work together seamlessly.

**Cognitive Modularity**: Different strategic questions require different analytical approaches. A modular architecture allows targeted analysis without unnecessary complexity.

**Governance & Traceability**: Board-level decisions require audit trails, methodology validation, and trust-broker mechanisms.

## Core Architectural Principles

### 1. Modular Cognitive System

Rather than a monolithic AI, the platform uses specialized modules:
- **Market Intelligence**: Real-time market data aggregation and trend analysis
- **Competitive Intelligence**: Multi-source competitive tracking and positioning
- **Financial Modeling**: Automated scenario modeling and forecasting
- **Strategic Synthesis**: Cross-module insight integration

### 2. Knowledge Graph Foundation

All insights are stored in a dynamic knowledge graph:
- Entities: Companies, people, technologies, markets, strategies
- Relationships: Partnerships, investments, competitive dynamics, causal links
- Temporal tracking: How relationships evolve over time

### 3. Trust-Broker Governance Layer

Every AI-generated insight passes through validation:
- Methodology compliance checks
- Data quality scoring
- Confidence calibration
- Decision traceability

## Implementation Best Practices

**Start with Clear Ontology**: Define your entity types and relationship taxonomy before ingesting data.

**Iterative Enrichment**: Begin with core data, then progressively enrich with external sources.

**Multi-Tier Data Strategy**: Tier 1 (internal), Tier 2 (commercial), Tier 3 (open-source), Tier 4 (AI-inferred).

**Feedback Loops**: Track which insights lead to action, continuously improve relevance.

## Conclusion

Strategic Intelligence Platforms represent the convergence of AI speed, consulting rigor, and enterprise governance. The architecture must balance flexibility with structure, automation with oversight, and speed with accuracy.
    `
  },
  2: {
    title: "Financial Modeling with AI-Powered Modules",
    category: "case-study",
    readTime: "8 min",
    date: "2025-11-28",
    views: "3.8K",
    author: "CAIO Research Team",
    content: `
# Financial Modeling with AI-Powered Modules

## The M&A Due Diligence Challenge

Traditional M&A due diligence involves weeks of manual financial analysis, scenario modeling, and valuation work. AI-powered financial modeling modules can accelerate this process by 90% while improving accuracy.

## Case Study: Technology Acquisition Analysis

**Context**: A mid-market PE firm evaluating a $50M SaaS acquisition needed complete financial analysis in 72 hours.

**Traditional Approach**:
- 2-3 weeks of analyst work
- Manual data extraction from financial statements
- Excel-based scenario modeling
- $40K+ in consulting fees

**AI-Powered Approach**:
- 6 hours of automated analysis
- AI extraction from PDFs and Excel files
- 50+ scenario variations generated automatically
- Real-time sensitivity analysis

## Key Capabilities

### Automated Data Extraction
AI modules can parse financial statements, extract KPIs, and normalize data across different formats and reporting standards.

### Scenario Modeling
Generate multiple valuation scenarios based on different assumptions:
- Revenue growth trajectories
- Margin expansion scenarios
- Market multiple variations
- Exit timing sensitivities

### Risk Assessment
Identify financial red flags automatically:
- Revenue concentration risks
- Working capital trends
- Burn rate anomalies
- Cash flow sustainability

## Implementation Framework

**1. Data Ingestion**: Upload financial documents (P&L, balance sheet, cash flow)

**2. Automated Extraction**: AI extracts and normalizes all financial metrics

**3. Model Generation**: Create DCF, comparable company, and precedent transaction models

**4. Scenario Analysis**: Test 20-50 scenarios automatically

**5. Risk Scoring**: Flag potential issues with severity ratings

**6. Report Generation**: Executive summary with key findings and recommendations

## Results

The PE firm completed due diligence in 3 days instead of 3 weeks, identified 2 critical cash flow risks that weren't initially disclosed, and negotiated a 12% lower purchase price based on AI-generated scenario analysis.

## Conclusion

AI-powered financial modeling doesn't replace expert judgment—it amplifies it. Analysts spend less time on data wrangling and more time on strategic interpretation.
    `
  },
  3: {
    title: "Knowledge Graph Best Practices",
    category: "technical",
    readTime: "15 min",
    date: "2025-11-25",
    views: "4.5K",
    author: "CAIO Engineering Team",
    content: `
# Knowledge Graph Best Practices

## Why Knowledge Graphs for Strategic Intelligence?

Strategic decisions require connecting disparate data: market trends, competitive moves, internal capabilities, and external opportunities. Knowledge graphs excel at representing and querying these complex relationships.

## Architecture Principles

### 1. Entity-Relationship Design

**Start Simple**: Begin with core entity types:
- Organizations (companies, investors, partners)
- People (executives, advisors, stakeholders)
- Technologies (products, platforms, tools)
- Markets (geographies, industries, segments)
- Strategies (initiatives, decisions, outcomes)

**Expand Iteratively**: Add entity types as needs emerge, not preemptively.

### 2. Relationship Taxonomy

Define clear relationship types with semantic meaning:
- \`INVESTS_IN\`: Financial relationships
- \`COMPETES_WITH\`: Competitive dynamics
- \`PARTNERS_WITH\`: Collaboration relationships
- \`SUPPLIES_TO\`: Value chain links
- \`INFLUENCES\`: Strategic influence patterns

### 3. Temporal Versioning

Track how relationships change over time:
- Add \`valid_from\` and \`valid_to\` timestamps
- Maintain historical snapshots
- Enable trend analysis over time

## Data Quality Best Practices

### Multi-Tier Validation

**Tier 1 (Highest Trust)**: Internal verified data
**Tier 2**: Commercial data providers (Bloomberg, PitchBook)
**Tier 3**: Open-source intelligence (LinkedIn, news, filings)
**Tier 4**: AI-inferred relationships (require validation)

### Confidence Scoring

Every relationship should have:
- Confidence score (0-100%)
- Source attribution
- Last verification date
- Update frequency

## Query Optimization

### Graph Traversal Patterns

**Breadth-First**: Find all companies within 2 degrees of a target
**Depth-First**: Trace investment chains and ownership structures
**Shortest Path**: Identify connection paths between entities
**Community Detection**: Find clusters and ecosystems

### Indexing Strategy

Index frequently queried properties:
- Entity names and identifiers
- Relationship types
- Temporal boundaries
- Geographic attributes

## Integration Patterns

### Auto-Enrichment Pipelines

Set up automated data ingestion:
1. Monitor external data sources
2. Extract entities and relationships
3. Validate against existing graph
4. Flag conflicts for human review
5. Auto-merge validated data

### Cross-Platform Sync

Integrate with:
- CRM systems (Salesforce, HubSpot)
- Data providers (PitchBook, Crunchbase)
- Public sources (LinkedIn, news APIs)
- Internal databases (ERP, data warehouses)

## Maintenance & Governance

### Regular Health Checks

- **Orphan Detection**: Find unconnected entities
- **Duplicate Identification**: Merge duplicate entities
- **Staleness Monitoring**: Flag outdated relationships
- **Consistency Validation**: Ensure logical coherence

### Access Control

Implement role-based access:
- Read-only for analysts
- Edit permissions for data stewards
- Admin access for graph architects
- API access for automated systems

## Conclusion

Knowledge graphs are powerful but require discipline. Start simple, validate rigorously, and expand iteratively. The value compounds over time as the graph grows and connections multiply.
    `
  },
  5: {
    title: "Multi-Agent Orchestration Guide",
    category: "technical",
    readTime: "18 min",
    date: "2025-11-15",
    views: "6.3K",
    author: "CAIO Engineering Team",
    content: `
# Multi-Agent Orchestration Guide

## The Evolution from Single AI to Agent Orchestration

Single AI models are like hiring one consultant. Multi-agent orchestration is like assembling a specialized team where each member excels in their domain and they collaborate seamlessly.

## Core Orchestration Patterns

### 1. Sequential Workflow

Agents execute in sequence, each building on previous outputs:

\`\`\`
Market Analysis Agent → Competitive Intelligence Agent → Strategy Synthesis Agent → Implementation Planner
\`\`\`

**Use Case**: Structured analysis with clear dependencies

### 2. Parallel Execution

Multiple agents work simultaneously on independent tasks:

\`\`\`
Financial Analyst Agent ⎫
Technology Scout Agent  ⎬→ Integration Agent → Final Report
Risk Assessment Agent   ⎭
\`\`\`

**Use Case**: Comprehensive analysis with time constraints

### 3. Hierarchical Orchestration

A supervisor agent coordinates specialized sub-agents:

\`\`\`
Master Strategy Agent
├─ M1: Market Context
├─ M2: Competitive Intel
├─ M3: Tech Innovation
└─ M5: Strategic Synthesis (aggregates M1-M3)
\`\`\`

**Use Case**: Complex multi-dimensional problems

### 4. Collaborative Negotiation

Agents debate and refine outputs through iteration:

\`\`\`
Bull Case Agent ⟷ Bear Case Agent → Balanced Recommendation
\`\`\`

**Use Case**: Investment decisions requiring balanced perspectives

## Implementation Architecture

### Agent Definition

Each agent needs:
- **Persona**: Role, expertise, decision-making style
- **Tools**: APIs, data sources, actions available
- **Memory**: Context from previous interactions
- **Constraints**: Guardrails and validation rules

### Communication Protocol

Agents exchange structured messages:

\`\`\`json
{
  "from_agent": "market_analyst",
  "to_agent": "strategy_synthesizer",
  "message_type": "insight",
  "content": {
    "finding": "Market growing 35% YoY",
    "confidence": 0.92,
    "sources": ["bloomberg", "statista"]
  }
}
\`\`\`

### State Management

Track orchestration state:
- Current phase
- Agent status (idle, working, completed, failed)
- Intermediate outputs
- Final recommendations

## Orchestration Best Practices

### 1. Clear Handoff Points

Define explicit criteria for when one agent passes work to the next:
- Data quality thresholds
- Confidence minimums
- Completeness checks

### 2. Error Recovery

Implement resilient workflows:
- Retry failed agent calls (with exponential backoff)
- Fallback to alternative agents
- Human-in-the-loop for critical decisions

### 3. Performance Monitoring

Track orchestration metrics:
- End-to-end execution time
- Per-agent latency
- Success rates
- Cost per workflow

### 4. Feedback Loops

Improve over time:
- Log which agent combinations produce best results
- Track user satisfaction with recommendations
- A/B test different orchestration patterns

## Advanced Patterns

### Dynamic Routing

Route work based on problem characteristics:
- Simple questions → Single agent
- Complex analysis → Full orchestration
- Urgent requests → Parallel fast-track

### Self-Healing Workflows

Agents detect and correct issues:
- Data quality problems trigger re-extraction
- Low confidence triggers additional validation
- Contradictions trigger reconciliation agents

### Adaptive Orchestration

System learns optimal patterns:
- Track which workflows succeed
- Identify bottlenecks
- Automatically adjust agent selection

## Conclusion

Multi-agent orchestration transforms AI from a tool into a cognitive workforce. The key is thoughtful architecture: clear roles, robust communication, and continuous optimization.
    `
  }
};

export default function BlogArticle() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = parseInt(urlParams.get('id') || '1');
  const article = ARTICLES[articleId];

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-white text-center">Article not found</p>
          <Button onClick={() => navigate(createPageUrl('BlogResources'))} className="mx-auto mt-4">
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(createPageUrl('BlogResources'))}
          variant="ghost"
          className="text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
            <CardContent className="p-8">
              {/* Article Header */}
              <div className="mb-8">
                <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] mb-4">
                  {article.category}
                </Badge>
                <h1 className="text-4xl font-bold text-white mb-4">
                  {article.title}
                </h1>
                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {article.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {article.views}
                  </div>
                </div>
                <p className="text-slate-400 mt-4">By {article.author}</p>
              </div>

              {/* Article Content */}
              <div className="prose prose-invert max-w-none">
                {article.content.split('\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={idx} className="text-3xl font-bold text-white mt-8 mb-4">{paragraph.slice(2)}</h1>;
                  } else if (paragraph.startsWith('## ')) {
                    return <h2 key={idx} className="text-2xl font-bold text-white mt-6 mb-3">{paragraph.slice(3)}</h2>;
                  } else if (paragraph.startsWith('### ')) {
                    return <h3 key={idx} className="text-xl font-bold text-white mt-4 mb-2">{paragraph.slice(4)}</h3>;
                  } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <p key={idx} className="text-[#00D4FF] font-semibold mt-3">{paragraph.slice(2, -2)}</p>;
                  } else if (paragraph.startsWith('- ')) {
                    return <li key={idx} className="text-slate-300 ml-6 mb-1">{paragraph.slice(2)}</li>;
                  } else if (paragraph.startsWith('```')) {
                    return <pre key={idx} className="bg-[#0A2540] p-4 rounded-lg text-[#00D4FF] my-4 overflow-x-auto">{paragraph}</pre>;
                  } else if (paragraph.trim()) {
                    return <p key={idx} className="text-slate-300 leading-relaxed mb-4">{paragraph}</p>;
                  }
                  return null;
                })}
              </div>

              {/* Article Footer */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/10">
                <div className="flex gap-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}