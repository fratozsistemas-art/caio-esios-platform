import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * PARADOX DETECTION ENGINE
 * Automatically identifies strategic paradoxes in agent responses
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversation_id, message_content } = await req.json();

    // Analyze message for paradoxes using LLM
    const paradoxAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this strategic analysis for PARADOXES (either/or tensions that could be reframed as both/and):

**CONTENT:**
${message_content}

**INSTRUCTIONS:**
Identify strategic paradoxes in format: "Tension between X and Y"

Examples of paradoxes:
- Efficiency vs Flexibility
- Growth vs Profitability  
- Innovation vs Stability
- Centralization vs Autonomy
- Short-term vs Long-term
- Cost Leadership vs Differentiation

**OUTPUT JSON:**
{
  "paradoxes_found": boolean,
  "paradoxes": [
    {
      "description": "Clear description of the paradox",
      "optionA": "First pole of tension",
      "optionB": "Second pole of tension",
      "evidence": "Quote from content showing the tension",
      "severity": "low|medium|high",
      "socr_reframe": "How might we reframe this as both/and?"
    }
  ]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          paradoxes_found: { type: "boolean" },
          paradoxes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                optionA: { type: "string" },
                optionB: { type: "string" },
                evidence: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high"] },
                socr_reframe: { type: "string" }
              },
              required: ["description", "optionA", "optionB", "evidence", "severity", "socr_reframe"]
            }
          }
        },
        required: ["paradoxes_found", "paradoxes"]
      }
    });

    // If paradoxes found, generate synthesis for each
    if (paradoxAnalysis.paradoxes_found && paradoxAnalysis.paradoxes.length > 0) {
      for (const paradox of paradoxAnalysis.paradoxes) {
        // Generate both/and synthesis
        const synthesis = await base44.integrations.Core.InvokeLLM({
          prompt: `Using SOCR (Socratic Orchestrated Contextual Reframing), synthesize this paradox:

**PARADOX:** ${paradox.description}
**Option A:** ${paradox.optionA}
**Option B:** ${paradox.optionB}

**SOCR PRINCIPLES:**
1. Reframe as "both/and" not "either/or"
2. Find higher-order goal that integrates both
3. Identify conditions where each applies
4. Create synthesis that preserves value of both

**OUTPUT:** Concise both/and synthesis (2-3 sentences)`,
          response_json_schema: {
            type: "object",
            properties: {
              synthesis: { type: "string" },
              integration_strategy: { type: "string" },
              implementation_conditions: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["synthesis"]
          }
        });

        paradox.synthesis = synthesis.synthesis;
        paradox.integration_strategy = synthesis.integration_strategy;
        paradox.implementation_conditions = synthesis.implementation_conditions;
      }
    }

    return Response.json({
      success: true,
      conversation_id,
      paradoxes_found: paradoxAnalysis.paradoxes_found,
      paradoxes: paradoxAnalysis.paradoxes || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Paradox detection error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});