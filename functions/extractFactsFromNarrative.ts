import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { narrative_content, narrative_title } = await req.json();

    if (!narrative_content) {
      return Response.json({ 
        error: 'narrative_content is required' 
      }, { status: 400 });
    }

    // Get all existing facts for matching
    const allFacts = await base44.entities.StrategicFact.list();
    
    // Use LLM to extract and match facts
    const extractionPrompt = `
    Analyze this narrative and identify which strategic facts from our knowledge base are referenced or implied.
    
    Narrative Title: ${narrative_title || 'Untitled'}
    
    Narrative Content:
    ${narrative_content}
    
    Available Facts (topics and summaries):
    ${allFacts.map(f => `[${f.id}] ${f.topic_label} - ${f.summary}`).join('\n')}
    
    For each fact that is clearly referenced or relied upon in the narrative:
    1. Identify the fact ID
    2. Note how it's used in the narrative
    3. Assess if the narrative's use is consistent with the fact's current status
    
    Also identify any NEW facts stated in the narrative that aren't in our database yet.
    `;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          referenced_fact_ids: {
            type: "array",
            items: { type: "string" }
          },
          fact_usage_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                fact_id: { type: "string" },
                usage_context: { type: "string" },
                is_consistent: { type: "boolean" }
              }
            }
          },
          new_facts_detected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                summary: { type: "string" },
                detail: { type: "string" }
              }
            }
          },
          main_topics: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Generate implications summary
    const referencedFacts = allFacts.filter(f => 
      (analysis.referenced_fact_ids || []).includes(f.id)
    );

    const implicationsPrompt = `
    Analyze the strategic implications of the facts used in this narrative.
    
    Narrative: ${narrative_title}
    
    Referenced Facts:
    ${referencedFacts.map(f => `- ${f.topic_label}: ${f.summary} (confidence: ${f.confidence}, status: ${f.status})`).join('\n')}
    
    Provide:
    1. Executive summary of how these facts interconnect in the narrative
    2. Key strategic implications and insights
    3. Potential risks or uncertainties based on fact confidence levels
    4. Forward-looking considerations
    `;

    const implications = await base44.integrations.Core.InvokeLLM({
      prompt: implicationsPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_implications: {
            type: "array",
            items: { type: "string" }
          },
          risks_and_uncertainties: {
            type: "array",
            items: { type: "string" }
          },
          forward_considerations: {
            type: "array",
            items: { type: "string" }
          },
          confidence_assessment: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      referenced_facts: analysis.referenced_fact_ids || [],
      usage_analysis: analysis.fact_usage_analysis || [],
      new_facts_detected: analysis.new_facts_detected || [],
      main_topics: analysis.main_topics || [],
      implications_summary: implications
    });

  } catch (error) {
    console.error('Error extracting facts from narrative:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});