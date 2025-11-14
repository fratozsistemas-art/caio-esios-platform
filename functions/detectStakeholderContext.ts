import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Detects stakeholder context for adaptive intelligence delivery
 * Returns: { stakeholder_type, data_access, company_type, confidence }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_history, company_name } = await req.json();

    // Detect stakeholder type from conversation
    const detectionPrompt = `Analyze this conversation to classify the stakeholder type and data access level.

CONVERSATION HISTORY:
${conversation_history.slice(0, 1000)}

CLASSIFICATION RULES:

**EXTERNAL Stakeholder** (if user mentions):
- "I'm evaluating for investment"
- "As a consultant"
- "Considering acquiring"
- "Market analysis for"
- "Due diligence on"
- "Help me evaluate [Company]"

**INTERNAL Stakeholder** (if user mentions):
- "Our company"
- "We need to"
- "Help us decide"
- "Our strategy"
- "Internal decision"
- "We're considering"

**Data Access:**
- public_only: No mention of internal data
- semi_private: Mentions "under NDA", "limited access"
- full_internal: Clear internal stakeholder

**Company Type:**
- public: Has stock ticker, SEC filings
- private: No public filings

Return ONLY this JSON:
{
  "stakeholder_type": "EXTERNAL" | "INTERNAL" | "UNKNOWN",
  "data_access": "public_only" | "semi_private" | "full_internal",
  "company_type": "public" | "private" | "unknown",
  "confidence": 0-100,
  "reasoning": "Brief explanation"
}`;

    const detection = await base44.integrations.Core.InvokeLLM({
      prompt: detectionPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          stakeholder_type: { type: "string", enum: ["EXTERNAL", "INTERNAL", "UNKNOWN"] },
          data_access: { type: "string", enum: ["public_only", "semi_private", "full_internal"] },
          company_type: { type: "string", enum: ["public", "private", "unknown"] },
          confidence: { type: "number" },
          reasoning: { type: "string" }
        }
      }
    });

    console.log('✅ Context detected:', detection);

    return Response.json({
      success: true,
      context: detection,
      recommended_module_coverage: calculateModuleCoverage(detection)
    });

  } catch (error) {
    console.error('Context detection error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});

function calculateModuleCoverage(context) {
  const { stakeholder_type, data_access, company_type } = context;
  
  // Base coverage for each module
  const coverage = {
    M1: 100, // Always activated (public data)
    M2: 90,  // Competitive intel (mostly public)
    M3: stakeholder_type === 'INTERNAL' && data_access === 'full_internal' ? 95 : 60,
    M4: stakeholder_type === 'INTERNAL' && data_access === 'full_internal' ? 95 : 
        company_type === 'public' ? 80 : 40,
    M5: stakeholder_type === 'INTERNAL' ? 95 : 70,
    M6: 85, // Opportunity matrix (market-based)
    M7: stakeholder_type === 'INTERNAL' && data_access === 'full_internal' ? 95 : 50,
    M8: stakeholder_type === 'INTERNAL' ? 90 : 60,
    M9: 95  // Funding intelligence (public sources)
  };
  
  return coverage;
}