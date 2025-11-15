import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scope = 'personal' } = await req.json().catch(() => ({}));

    // Fetch LinkedIn data
    const linkedInResponse = await base44.functions.invoke('ingestLinkedInData');
    const connections = linkedInResponse.data?.connections || [];

    // Get all team members if analyzing company network
    let teamMembers = [];
    if (scope === 'company') {
      const allUsers = await base44.asServiceRole.entities.User.list();
      teamMembers = allUsers.filter(u => u.email !== user.email);
    }

    // Get knowledge graph context
    const graphNodes = await base44.entities.KnowledgeGraphNode.list();
    const graphRelationships = await base44.entities.KnowledgeGraphRelationship.list();

    // AI Analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze professional networking data to provide strategic insights about network strength and business value.

USER PROFILE: ${user.full_name} (${user.email})
ANALYSIS SCOPE: ${scope}

LINKEDIN CONNECTIONS (${connections.length} total):
${JSON.stringify(connections.slice(0, 50), null, 2)}

KNOWLEDGE GRAPH CONTEXT:
- Companies: ${graphNodes.filter(n => n.node_type === 'company').length}
- People: ${graphNodes.filter(n => n.node_type === 'person').length}
- Industries: ${graphNodes.filter(n => n.node_type === 'industry').length}

${scope === 'company' ? `TEAM MEMBERS: ${teamMembers.length} employees` : ''}

ANALYSIS OBJECTIVES:
1. NETWORK STRENGTH: Evaluate the quality and reach of professional network
2. STRATEGIC CONNECTIONS: Identify connections with high business value (C-level, decision makers, industry leaders)
3. INDUSTRY COVERAGE: Assess representation across key industries
4. UNTAPPED OPPORTUNITIES: Find connections that could benefit business objectives
5. NETWORK GAPS: Identify missing connections or underrepresented sectors
6. JPYP SCORE (Junior Professional Yield Potential): For younger professionals, calculate the hidden value of their network that senior management might overlook
${scope === 'company' ? '7. COLLECTIVE NETWORK VALUE: Analyze combined networking power of the team' : ''}

Provide actionable insights with specific recommendations.`,
      response_json_schema: {
        type: "object",
        properties: {
          network_strength_score: {
            type: "number",
            description: "Overall network strength (0-100)"
          },
          jpyp_score: {
            type: "number",
            description: "Junior Professional Yield Potential score (0-100)"
          },
          strategic_connections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                title: { type: "string" },
                company: { type: "string" },
                strategic_value: { type: "string", enum: ["high", "medium", "low"] },
                reason: { type: "string" }
              }
            }
          },
          industry_coverage: {
            type: "array",
            items: {
              type: "object",
              properties: {
                industry: { type: "string" },
                connection_count: { type: "number" },
                coverage_strength: { type: "string", enum: ["weak", "moderate", "strong"] }
              }
            }
          },
          untapped_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunity: { type: "string" },
                connections_involved: { type: "array", items: { type: "string" } },
                potential_value: { type: "string" },
                next_action: { type: "string" }
              }
            }
          },
          network_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap_area: { type: "string" },
                impact: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          key_insights: {
            type: "array",
            items: { type: "string" }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                expected_impact: { type: "string" }
              }
            }
          },
          collective_value: {
            type: "object",
            properties: {
              total_unique_connections: { type: "number" },
              shared_connections: { type: "number" },
              strategic_coverage: { type: "string" },
              synergy_opportunities: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    });

    // Create nodes and relationships in the graph
    const createdNodes = [];
    const createdRelationships = [];

    for (const conn of connections.slice(0, 50)) {
      // Check if person already exists
      const existingPerson = graphNodes.find(n => 
        n.node_type === 'person' && 
        n.label.toLowerCase().includes(conn.firstName?.toLowerCase()) &&
        n.label.toLowerCase().includes(conn.lastName?.toLowerCase())
      );

      let personNodeId;

      if (!existingPerson) {
        const newNode = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
          node_type: 'person',
          label: `${conn.firstName} ${conn.lastName}`,
          properties: {
            headline: conn.headline,
            linkedin_url: conn.profileUrl,
            source: 'linkedin',
            connected_at: conn.connectedAt
          }
        });
        createdNodes.push(newNode);
        personNodeId = newNode.id;
      } else {
        personNodeId = existingPerson.id;
      }

      // Create relationship USER -> CONNECTED_TO -> Person
      const userNode = graphNodes.find(n => 
        n.node_type === 'person' && 
        n.properties?.email === user.email
      );

      if (userNode) {
        const newRel = await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
          from_node_id: userNode.id,
          to_node_id: personNodeId,
          relationship_type: 'CONNECTED_TO',
          properties: {
            platform: 'linkedin',
            connected_at: conn.connectedAt,
            relationship_strength: 'direct'
          }
        });
        createdRelationships.push(newRel);
      }
    }

    // Save analysis
    const analysisRecord = await base44.asServiceRole.entities.Analysis.create({
      title: `Network Strength Analysis - ${scope === 'company' ? 'Company' : 'Personal'}`,
      type: 'opportunity',
      status: 'completed',
      framework_used: 'Network Intelligence',
      results: analysis,
      confidence_score: 85,
      completed_at: new Date().toISOString(),
      created_by: user.email
    });

    return Response.json({
      success: true,
      analysis: analysis,
      graph_enrichment: {
        nodes_created: createdNodes.length,
        relationships_created: createdRelationships.length
      },
      metadata: {
        connections_analyzed: connections.length,
        scope: scope,
        analysis_id: analysisRecord.id
      }
    });

  } catch (error) {
    console.error('Networking analysis error:', error);
    return Response.json({ 
      error: 'Failed to analyze networking strength',
      details: error.message
    }, { status: 500 });
  }
});