import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Generate Trust-Broker Dashboard Data
 * Create complete decision transparency data
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId } = await req.json();

    // Get analysis/strategy
    const analysis = await base44.asServiceRole.entities.Analysis.get(analysisId);

    if (!analysis) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Extract reasoning trail from analysis
    const reasoningSteps = extractReasoningSteps(analysis);

    // Identify data sources used
    const dataSources = analysis.data_sources || [];

    // Extract assumptions
    const assumptions = extractAssumptions(analysis);

    // Generate alternative scenarios
    const alternatives = await generateAlternativeScenarios(base44, analysis);

    // Run bias detection
    const biasChecks = await detectBiases(base44, analysis);

    // Compile trust-broker data
    const trustData = {
      id: analysisId,
      recommendation: analysis.results?.recommendation || "No recommendation",
      confidence: analysis.confidence_score || 0,
      riskLevel: calculateRiskLevel(analysis),
      
      reasoningSteps,
      dataSources,
      assumptions,
      alternativesConsidered: alternatives,
      biasChecks,
      
      validation: {
        crv: analysis.confidence_score || 0,
        icv: calculateICV(analysis),
        ias: calculateIAS(analysis),
        iedc: calculateIEDC(analysis)
      }
    };

    return Response.json({
      success: true,
      trustData
    });

  } catch (error) {
    console.error('Error generating trust-broker data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper functions
function extractReasoningSteps(analysis) {
  // Parse reasoning from analysis results
  const steps = [];
  
  if (analysis.framework_used) {
    steps.push({
      step: 1,
      module: analysis.framework_used,
      input: "Analysis request",
      process: "Strategic framework application",
      output: analysis.results?.summary || "Analysis complete",
      confidence: analysis.confidence_score || 0,
      dataSources: analysis.data_sources || []
    });
  }

  return steps;
}

function extractAssumptions(analysis) {
  // Extract assumptions from analysis
  const assumptions = [];
  
  if (analysis.results?.assumptions) {
    assumptions.push(...analysis.results.assumptions);
  }

  return assumptions;
}

async function generateAlternativeScenarios(base44, analysis) {
  try {
    const alternatives = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this analysis, identify 2-3 alternative scenarios that were considered but rejected:

**Analysis:** ${JSON.stringify(analysis.results)}

Return array of scenarios with rejection reasons.`,
      response_json_schema: {
        type: "object",
        properties: {
          alternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario: { type: "string" },
                rejectedBecause: { type: "string" },
                confidence: { type: "number" }
              }
            }
          }
        }
      }
    });

    return alternatives.alternatives || [];
  } catch (error) {
    console.error('Error generating alternatives:', error);
    return [];
  }
}

async function detectBiases(base44, analysis) {
  try {
    const biasDetection = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this decision for cognitive biases:

**Analysis:** ${JSON.stringify(analysis.results)}

**Check for:**
- Confirmation bias
- Recency bias
- Anchoring bias
- Availability bias

Return bias check results.`,
      response_json_schema: {
        type: "object",
        properties: {
          biasChecks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                biasType: { type: "string" },
                detected: { type: "boolean" },
                severity: { type: "string" },
                explanation: { type: "string" }
              }
            }
          }
        }
      }
    });

    return biasDetection.biasChecks || [];
  } catch (error) {
    console.error('Error detecting biases:', error);
    return [];
  }
}

function calculateRiskLevel(analysis) {
  const confidence = analysis.confidence_score || 0;
  
  if (confidence >= 80) return 'low';
  if (confidence >= 60) return 'medium';
  return 'high';
}

function calculateICV(analysis) {
  // Intelligence Confidence Value
  return analysis.confidence_score || 0;
}

function calculateIAS(analysis) {
  // Implementation Alignment Score
  return Math.round((analysis.confidence_score || 0) * 0.9);
}

function calculateIEDC(analysis) {
  // Impact Evidence Depth Coefficient
  const dataSources = analysis.data_sources?.length || 0;
  return Math.min(100, dataSources * 15);
}