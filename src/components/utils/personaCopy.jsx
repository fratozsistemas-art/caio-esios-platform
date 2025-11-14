export function getPersonaCopy(analysis, persona, framework) {
  const baseInsights = analysis.key_insights || [
    'Data analysis shows positive market trends',
    'Strategic opportunities identified in key segments',
    'Competitive landscape requires immediate attention'
  ];

  const personaTemplates = {
    board: {
      executiveSummary: `This ${analysis.type} analysis reveals critical insights for board-level strategic oversight. ${framework ? `Utilizing ${framework} framework,` : ''} the analysis demonstrates potential for significant value creation while maintaining fiduciary responsibility and long-term stakeholder interests.`,
      keyInsights: baseInsights,
      strategicImplications: [
        {
          title: 'Governance Oversight',
          description: 'Board-level monitoring requirements and risk committee considerations',
          impact: 'High'
        },
        {
          title: 'Stakeholder Value',
          description: 'Long-term value creation opportunities aligned with fiduciary duties',
          impact: 'High'
        }
      ],
      recommendedActions: [
        {
          title: 'Board Review & Approval',
          description: 'Present findings to board for strategic direction and resource allocation approval',
          priority: 'high',
          owner: 'CEO',
          timeline: 'Next board meeting'
        }
      ]
    },
    ceo: {
      executiveSummary: `As CEO, this ${analysis.type} analysis provides actionable insights for organizational execution and strategic alignment. ${framework ? `The ${framework} approach` : 'Our analysis'} identifies key opportunities to drive company performance and competitive positioning.`,
      keyInsights: baseInsights,
      strategicImplications: [
        {
          title: 'Organizational Alignment',
          description: 'Cross-functional coordination requirements and resource allocation priorities',
          impact: 'High'
        },
        {
          title: 'Leadership Execution',
          description: 'Executive team mobilization and strategic initiative launch',
          impact: 'High'
        }
      ],
      recommendedActions: [
        {
          title: 'Executive Team Alignment',
          description: 'Convene leadership team to cascade strategy and assign ownership',
          priority: 'high',
          owner: 'CEO',
          timeline: 'This week'
        }
      ]
    },
    cfo: {
      executiveSummary: `From a financial perspective, this ${analysis.type} analysis highlights ${analysis.roi_estimate ? `an estimated ${analysis.roi_estimate}% ROI potential` : 'significant financial implications'}. ${framework ? `The ${framework} methodology` : 'Our approach'} ensures rigorous financial evaluation and capital efficiency.`,
      keyInsights: baseInsights,
      strategicImplications: [
        {
          title: 'Capital Allocation',
          description: 'Investment requirements, budget impact, and funding strategy',
          impact: 'High'
        },
        {
          title: 'Financial Risk Assessment',
          description: 'Cash flow implications and return on invested capital analysis',
          impact: 'Medium'
        }
      ],
      recommendedActions: [
        {
          title: 'Financial Model Development',
          description: 'Build detailed financial projections and ROI calculations',
          priority: 'high',
          owner: 'CFO',
          timeline: '2 weeks'
        }
      ]
    },
    cto: {
      executiveSummary: `This ${analysis.type} analysis reveals technical feasibility considerations and architecture requirements. ${framework ? `Using ${framework} framework,` : ''} we've identified key technology enablers and infrastructure needs for successful implementation.`,
      keyInsights: baseInsights,
      strategicImplications: [
        {
          title: 'Technical Architecture',
          description: 'Platform requirements, scalability considerations, and technology stack decisions',
          impact: 'High'
        },
        {
          title: 'Engineering Resources',
          description: 'Team capacity, skill requirements, and development timeline',
          impact: 'Medium'
        }
      ],
      recommendedActions: [
        {
          title: 'Technical Feasibility Study',
          description: 'Conduct detailed architecture review and proof of concept',
          priority: 'high',
          owner: 'CTO',
          timeline: '3 weeks'
        }
      ]
    },
    cso: {
      executiveSummary: `From a strategic standpoint, this ${analysis.type} analysis identifies competitive advantages and market positioning opportunities. ${framework ? `The ${framework} framework` : 'Our methodology'} reveals strategic imperatives for sustainable competitive advantage.`,
      keyInsights: baseInsights,
      strategicImplications: [
        {
          title: 'Competitive Positioning',
          description: 'Market differentiation strategy and competitive response planning',
          impact: 'High'
        },
        {
          title: 'Strategic Roadmap',
          description: 'Multi-year strategic plan and milestone definition',
          impact: 'High'
        }
      ],
      recommendedActions: [
        {
          title: 'Strategic Planning Session',
          description: 'Facilitate executive workshop to define strategic initiatives',
          priority: 'high',
          owner: 'CSO',
          timeline: '2 weeks'
        }
      ]
    },
    caio: {
      executiveSummary: `This ${analysis.type} analysis demonstrates AI-driven transformation potential and intelligent automation opportunities. ${framework ? `Leveraging ${framework},` : ''} we've identified areas where AI/ML can drive step-change improvements in performance and efficiency.`,
      keyInsights: baseInsights,
      strategicImplications: [
        {
          title: 'AI Integration',
          description: 'Machine learning model requirements and data infrastructure needs',
          impact: 'High'
        },
        {
          title: 'Automation Opportunities',
          description: 'Process automation potential and intelligent decision support systems',
          impact: 'Medium'
        }
      ],
      recommendedActions: [
        {
          title: 'AI Readiness Assessment',
          description: 'Evaluate data quality, ML infrastructure, and talent requirements',
          priority: 'high',
          owner: 'CAIO',
          timeline: '3 weeks'
        }
      ]
    },
    cro: {
      executiveSummary: `From a risk management perspective, this ${analysis.type} analysis identifies key risk factors and mitigation strategies. ${framework ? `Using ${framework},` : ''} we've conducted comprehensive risk assessment across operational, financial, and compliance dimensions.`,
      keyInsights: baseInsights,
      strategicImplications: [
        {
          title: 'Risk Mitigation',
          description: 'Key risk factors, control requirements, and contingency planning',
          impact: 'High'
        },
        {
          title: 'Compliance Requirements',
          description: 'Regulatory considerations and compliance framework alignment',
          impact: 'Medium'
        }
      ],
      recommendedActions: [
        {
          title: 'Risk Assessment Framework',
          description: 'Develop comprehensive risk register and mitigation plans',
          priority: 'high',
          owner: 'CRO',
          timeline: '2 weeks'
        }
      ]
    },
    esg: {
      executiveSummary: `This ${analysis.type} analysis evaluates ESG considerations and stakeholder impact. ${framework ? `Through ${framework} methodology,` : ''} we've assessed environmental, social, and governance implications to ensure sustainable value creation.`,
      keyInsights: baseInsights,
      strategicImplications: [
        {
          title: 'Stakeholder Impact',
          description: 'Environmental footprint, social considerations, and governance alignment',
          impact: 'High'
        },
        {
          title: 'Sustainability Goals',
          description: 'ESG metrics, reporting requirements, and long-term sustainability',
          impact: 'Medium'
        }
      ],
      recommendedActions: [
        {
          title: 'ESG Impact Assessment',
          description: 'Conduct comprehensive stakeholder analysis and sustainability review',
          priority: 'medium',
          owner: 'ESG Officer',
          timeline: '4 weeks'
        }
      ]
    }
  };

  return personaTemplates[persona] || personaTemplates.ceo;
}