import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌱 Starting Knowledge Graph seed...');

    const existingNodes = await base44.asServiceRole.entities.KnowledgeGraphNode.list();
    
    if (existingNodes.length > 10) {
      return Response.json({ 
        success: true, 
        message: 'Graph already contains data',
        nodes_count: existingNodes.length
      });
    }

    const createdNodes = [];

    // SEED 1: Top Companies
    const companies = [
      { name: 'Nubank', industry: 'FinTech', revenue_range: '$500M+' },
      { name: 'Stripe', industry: 'FinTech', revenue_range: '$500M+' },
      { name: 'OpenAI', industry: 'AI/ML', revenue_range: '$100M-$500M' },
      { name: 'Shopify', industry: 'E-commerce', revenue_range: '$500M+' },
      { name: 'Stone', industry: 'FinTech', revenue_range: '$500M+' }
    ];

    for (const company of companies) {
      const node = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'company',
        label: company.name,
        properties: company
      });
      createdNodes.push(node);
    }

    // SEED 2: Frameworks
    const frameworks = [
      { name: 'ABRA', category: 'Decision Tree' },
      { name: 'NIA', category: 'Innovation' },
      { name: 'HYBRID', category: 'Strategic Synthesis' },
      { name: 'SOC', category: 'Constraint Analysis' }
    ];

    for (const framework of frameworks) {
      const node = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'framework',
        label: framework.name,
        properties: framework
      });
      createdNodes.push(node);
    }

    // SEED 3: Metrics
    const metrics = [
      { name: 'CAC', category: 'Customer Acquisition', unit: 'currency' },
      { name: 'LTV', category: 'Customer Value', unit: 'currency' },
      { name: 'Churn Rate', category: 'Retention', unit: 'percentage' },
      { name: 'MRR', category: 'Revenue', unit: 'currency' },
      { name: 'NPS', category: 'Satisfaction', unit: 'score' }
    ];

    for (const metric of metrics) {
      const node = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'metric',
        label: metric.name,
        properties: metric
      });
      createdNodes.push(node);
    }

    // SEED 4: Technologies
    const technologies = [
      { name: 'React', category: 'Frontend', maturity: 'Mature' },
      { name: 'Python', category: 'Backend', maturity: 'Mature' },
      { name: 'AWS', category: 'Infrastructure', maturity: 'Mature' },
      { name: 'GPT-4', category: 'AI/ML', maturity: 'Emerging' },
      { name: 'Kubernetes', category: 'Infrastructure', maturity: 'Mature' }
    ];

    for (const tech of technologies) {
      const node = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'technology',
        label: tech.name,
        properties: tech
      });
      createdNodes.push(node);
    }

    // Create some relationships
    const relationships = [];
    
    // Nubank USES_TECHNOLOGY AWS
    if (createdNodes[0] && createdNodes[12]) {
      const rel = await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
        from_node_id: createdNodes[0].id,
        to_node_id: createdNodes[12].id,
        relationship_type: 'USES_TECHNOLOGY',
        properties: { confidence: 90 }
      });
      relationships.push(rel);
    }

    console.log('✅ Knowledge Graph seeded successfully');

    return Response.json({
      success: true,
      message: 'Knowledge Graph seeded',
      nodes_created: createdNodes.length,
      relationships_created: relationships.length,
      summary: {
        companies: companies.length,
        frameworks: frameworks.length,
        metrics: metrics.length,
        technologies: technologies.length
      }
    });

  } catch (error) {
    console.error('Error seeding Knowledge Graph:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});