import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * CSS (CONTEXTUAL SENSING SYSTEM) - 5-DIMENSIONAL ASSESSMENT
 * Classifies problems across Cynefin, Authority, Time, Info Availability, Reversibility
 */

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { entity_type, entity_id, entity_data, user_context } = body;
    
    if (!entity_type || (!entity_id && !entity_data)) {
      return Response.json({ 
        error: 'entity_type and (entity_id or entity_data) are required' 
      }, { status: 400 });
    }
    
    console.log(`🧠 CSS Assessment for ${entity_type}:${entity_id || 'new'}`);
    
    // Fetch entity if ID provided
    let targetEntity = entity_data;
    if (entity_id && !entity_data) {
      const entityMap = {
        'tsi_project': 'TSIProject',
        'strategy': 'Strategy',
        'workspace': 'Workspace',
        'analysis': 'Analysis',
        'company': 'Company'
      };
      
      const entityName = entityMap[entity_type];
      if (entityName) {
        const entities = await base44.entities[entityName].filter({ id: entity_id });
        targetEntity = entities[0];
      }
    }
    
    if (!targetEntity) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }
    
    console.log('📊 Running 5-dimensional assessment...');
    
    // Build assessment prompt
    const assessmentPrompt = `You are the CSS (Contextual Sensing System) of TSI/ESIOS/CAIO/Hermes v9.2.

**ENTITY TO ASSESS:**
Type: ${entity_type}
Data: ${JSON.stringify(targetEntity, null, 2)}

**USER CONTEXT:**
${user_context ? JSON.stringify(user_context, null, 2) : 'No additional context provided'}

**YOUR TASK:** Perform 5-dimensional contextual assessment:

1. **PROBLEM COMPLEXITY (Cynefin Framework)**
   - Classify as: clear, complicated, complex, chaotic, or confused
   - Provide reasoning and recommended approach

2. **STAKEHOLDER AUTHORITY**
   - Identify primary authority level: board_governance, c_suite, functional_leaders, or operators
   - Map key stakeholders with influence/interest matrix

3. **TIME HORIZON**
   - Classify as: immediate (<30d), short_term (3-6mo), medium_term (6-18mo), or long_term (18mo+)
   - Estimate timeline in days
   - Identify key milestones

4. **INFORMATION AVAILABILITY**
   - Classify as: data_rich, data_sparse, or data_conflicting
   - Identify available data sources with tier classification (1-4)
   - List critical gaps

5. **DECISION REVERSIBILITY**
   - Classify as: reversible, partially_reversible, or irreversible
   - Score reversibility (0-100, higher = more reversible)
   - Recommend commitment level: experiment, pilot, commitment, or transformation
   - Suggest exit strategy

**FRAMEWORK & MODULE RECOMMENDATIONS:**
Based on the 5-dimensional assessment, recommend:
- Which CAIO frameworks to apply (ABRA, NIA, HYBRID, EVA, CSI, LOGOS, etc)
- Which TSI modules to activate (M1-M11)
- Execution pathway and agent selection

**CRITICAL:** Be specific, evidence-based, and quantitative where possible.`;

    const assessment = await base44.integrations.Core.InvokeLLM({
      prompt: assessmentPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          problem_complexity: {
            type: "object",
            properties: {
              cynefin_classification: { 
                type: "string",
                enum: ["clear", "complicated", "complex", "chaotic", "confused"]
              },
              recommended_approach: { type: "string" },
              confidence: { type: "number" },
              reasoning: { type: "string" }
            }
          },
          stakeholder_authority: {
            type: "object",
            properties: {
              primary_level: {
                type: "string",
                enum: ["board_governance", "c_suite", "functional_leaders", "operators"]
              },
              stakeholder_map: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    stakeholder: { type: "string" },
                    authority_level: { type: "string" },
                    influence: { 
                      type: "string",
                      enum: ["high", "medium", "low"]
                    },
                    interest: { 
                      type: "string",
                      enum: ["high", "medium", "low"]
                    }
                  }
                }
              },
              confidence: { type: "number" }
            }
          },
          time_horizon: {
            type: "object",
            properties: {
              classification: {
                type: "string",
                enum: ["immediate", "short_term", "medium_term", "long_term"]
              },
              timeline_days: { type: "number" },
              milestones: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    milestone: { type: "string" },
                    target_date: { type: "string" },
                    horizon: { type: "string" }
                  }
                }
              },
              confidence: { type: "number" }
            }
          },
          information_availability: {
            type: "object",
            properties: {
              classification: {
                type: "string",
                enum: ["data_rich", "data_sparse", "data_conflicting"]
              },
              data_sources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    source: { type: "string" },
                    tier: { type: "number" },
                    confidence: { type: "number" },
                    available: { type: "boolean" }
                  }
                }
              },
              overall_confidence: { type: "number" },
              gaps_identified: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          decision_reversibility: {
            type: "object",
            properties: {
              classification: {
                type: "string",
                enum: ["reversible", "partially_reversible", "irreversible"]
              },
              reversibility_score: { type: "number" },
              commitment_level: {
                type: "string",
                enum: ["experiment", "pilot", "commitment", "transformation"]
              },
              exit_strategy: { type: "string" },
              confidence: { type: "number" }
            }
          },
          recommended_frameworks: {
            type: "array",
            items: {
              type: "string"
            }
          },
          recommended_modules: {
            type: "array",
            items: {
              type: "string"
            }
          },
          execution_pathway: {
            type: "object",
            properties: {
              approach: { type: "string" },
              agent_selection: {
                type: "array",
                items: { type: "string" }
              },
              workflow_type: { type: "string" }
            }
          },
          overall_assessment_score: { type: "number" }
        }
      }
    });
    
    const duration = Date.now() - startTime;
    
    // Store assessment
    const storedAssessment = await base44.entities.ContextualAssessment.create({
      target_entity_type: entity_type,
      target_entity_id: entity_id || 'new_entity',
      ...assessment,
      assessment_metadata: {
        assessment_duration_ms: duration,
        llm_calls: 1,
        data_sources_consulted: 1
      }
    });
    
    console.log(`✅ CSS Assessment complete in ${duration}ms`);
    console.log(`📊 Classification: ${assessment.problem_complexity.cynefin_classification}`);
    console.log(`👥 Authority: ${assessment.stakeholder_authority.primary_level}`);
    console.log(`⏰ Horizon: ${assessment.time_horizon.classification}`);
    console.log(`📁 Data: ${assessment.information_availability.classification}`);
    console.log(`↩️ Reversibility: ${assessment.decision_reversibility.classification}`);
    
    return Response.json({
      success: true,
      assessment_id: storedAssessment.id,
      assessment,
      execution_time_ms: duration,
      recommended_next_steps: {
        frameworks: assessment.recommended_frameworks,
        modules: assessment.recommended_modules,
        agents: assessment.execution_pathway.agent_selection
      }
    });
    
  } catch (error) {
    console.error('❌ CSS Assessment Error:', error);
    return Response.json({ 
      error: 'CSS assessment failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});